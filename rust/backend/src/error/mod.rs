use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("validation failed: {0}")]
    Validation(String),

    #[error("invalid credentials")]
    InvalidCredentials,

    #[error("email already registered")]
    EmailTaken,

    #[error("user not found")]
    UserNotFound,

    #[error("request not found")]
    LeadRequestNotFound,

    #[error("internal error: {0}")]
    Internal(String),
}

impl From<validator::ValidationErrors> for AppError {
    fn from(e: validator::ValidationErrors) -> Self {
        AppError::Validation(e.to_string())
    }
}

impl From<bcrypt::BcryptError> for AppError {
    fn from(e: bcrypt::BcryptError) -> Self {
        AppError::Internal(format!("password hashing failed: {e}"))
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        // A unique-constraint violation (Postgres code 23505) on the
        // email column means someone else won a signup race between our
        // find_by_email check and the insert. Map it to the same 409 a
        // normal duplicate-email signup would get, instead of leaking it
        // as a generic 500.
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.code().as_deref() == Some("23505") {
                return AppError::EmailTaken;
            }
        }
        AppError::Internal(format!("database error: {e}"))
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::InvalidCredentials => {
                (StatusCode::UNAUTHORIZED, self.to_string())
            }
            AppError::EmailTaken => (StatusCode::CONFLICT, self.to_string()),
            AppError::UserNotFound => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::LeadRequestNotFound => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::Internal(_) => {
                tracing::error!(error = %self, "internal error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "internal server error".to_string(),
                )
            }
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}
