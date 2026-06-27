use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct LeadRequest {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub service: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
}
