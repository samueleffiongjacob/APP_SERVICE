use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Domain entity. Note this deliberately does NOT derive `Serialize` —
/// the password hash must never accidentally leak into a JSON response.
/// Controllers map this into a `UserResponse` DTO before returning it.
///
/// `FromRow` lets sqlx map a Postgres row straight into this struct
/// (field names must match column names — see migrations/).
#[derive(Clone, Debug, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}
