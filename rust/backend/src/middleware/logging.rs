use axum::{extract::Request, middleware::Next, response::Response};
use std::time::Instant;

pub async fn log_requests(req: Request, next: Next) -> Response {
    let method = req.method().clone();
    let uri = req.uri().clone();
    let start = Instant::now();

    let response = next.run(req).await;

    tracing::info!(
        method = %method,
        path = %uri.path(),
        status = response.status().as_u16(),
        elapsed_ms = start.elapsed().as_millis(),
        "request handled"
    );

    response
}
