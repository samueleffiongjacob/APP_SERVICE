mod controller;
mod dto;
mod error;
mod middleware;
mod model;
mod repository;
mod service;
mod state;

use axum::{
    http::Method,
    middleware::from_fn,
    routing::{delete, get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use sqlx::postgres::PgPoolOptions;
use state::AppState;
use std::{env, net::SocketAddr, time::Duration};

#[tokio::main]
async fn main() {
    // Load .env into the process environment. In production you'd set
    // DATABASE_URL via the platform's actual env mechanism instead and
    // this becomes a no-op (dotenvy ignores a missing .env file).
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt::init();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set (check your .env file)");

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await
        .expect("failed to connect to Postgres - is it running and is DATABASE_URL correct?");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("failed to run database migrations");

    let state = AppState::new(pool);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(controller::health_controller::health))
        .route(
            "/api/requests",
            post(controller::lead_request_controller::create_request)
                .get(controller::lead_request_controller::list_requests),
        )
        .route(
            "/api/requests/:id",
            delete(controller::lead_request_controller::delete_request),
        )
        .route("/api/auth/signup", post(controller::auth_controller::signup))
        .route("/api/auth/login", post(controller::auth_controller::login))
        .route("/api/users", get(controller::user_controller::list_users))
        .route(
            "/api/users/:id",
            delete(controller::user_controller::delete_user),
        )
        .layer(from_fn(middleware::log_requests))
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = "0.0.0.0:8083".parse().expect("valid bind address");
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind listener");

    tracing::info!("listening on {addr}");
    axum::serve(listener, app).await.expect("server error");
}
