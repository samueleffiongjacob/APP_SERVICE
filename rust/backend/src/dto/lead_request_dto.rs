use crate::model::LeadRequest;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateLeadRequest {
    #[validate(length(min = 1, max = 120, message = "name must not be empty"))]
    pub name: String,

    #[validate(email(message = "must be a valid email address"))]
    pub email: String,

    #[validate(length(min = 1, max = 30, message = "phone must not be empty"))]
    pub phone: String,

    #[validate(length(min = 1, max = 120, message = "service must not be empty"))]
    pub service: String,

    #[validate(length(max = 2000, message = "message is too long"))]
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct LeadRequestResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub service: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
}

impl From<LeadRequest> for LeadRequestResponse {
    fn from(r: LeadRequest) -> Self {
        Self {
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            service: r.service,
            message: r.message,
            created_at: r.created_at,
        }
    }
}
