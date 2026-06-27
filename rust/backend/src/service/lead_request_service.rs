use crate::{
    dto::CreateLeadRequest, error::AppError, model::LeadRequest,
    repository::LeadRequestRepository,
};
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

#[derive(Clone)]
pub struct LeadRequestService {
    repo: Arc<dyn LeadRequestRepository>,
}

impl LeadRequestService {
    pub fn new(repo: Arc<dyn LeadRequestRepository>) -> Self {
        Self { repo }
    }

    pub async fn create(&self, payload: CreateLeadRequest) -> Result<LeadRequest, AppError> {
        payload.validate()?;

        let request = LeadRequest {
            id: Uuid::new_v4(),
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            service: payload.service,
            message: payload.message,
            created_at: Utc::now(),
        };

        self.repo.insert(&request).await?;
        Ok(request)
    }

    pub async fn list(&self) -> Result<Vec<LeadRequest>, AppError> {
        Ok(self.repo.find_all().await?)
    }

    pub async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        match self.repo.delete(id).await? {
            Some(_) => Ok(()),
            None => Err(AppError::LeadRequestNotFound),
        }
    }
}
