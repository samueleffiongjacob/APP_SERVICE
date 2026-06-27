use crate::{error::AppError, model::User, repository::UserRepository};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone)]
pub struct UserService {
    user_repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(user_repo: Arc<dyn UserRepository>) -> Self {
        Self { user_repo }
    }

    pub async fn list(&self) -> Result<Vec<User>, AppError> {
        Ok(self.user_repo.find_all().await?)
    }

    pub async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        match self.user_repo.delete(id).await? {
            Some(_) => Ok(()),
            None => Err(AppError::UserNotFound),
        }
    }
}
