use crate::{
    dto::{LoginRequest, LoginResponse, SignupRequest, UserResponse},
    error::AppError,
    state::AppState,
};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use uuid::Uuid;

pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<SignupRequest>,
) -> Result<impl IntoResponse, AppError> {
    let user = state.auth_service.signup(payload).await?;
    Ok((StatusCode::CREATED, Json(UserResponse::from(user))))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let user = state.auth_service.login(payload).await?;

    // NOTE: this issues a random UUID as a "token" with no signing, expiry,
    // or session storage — same as the original code. It is not a real
    // bearer token. See the note in middleware/auth.rs for what's needed
    // before this is safe to use as an auth mechanism.
    let response = LoginResponse {
        token: Uuid::new_v4().to_string(),
        user: UserResponse::from(user),
    };

    Ok(Json(response))
}
