use crate::{
    dto::{LoginRequest, SignupRequest},
    error::AppError,
    model::User,
    repository::UserRepository,
};
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

const BCRYPT_COST: u32 = 12;

#[derive(Clone)]
pub struct AuthService {
    user_repo: Arc<dyn UserRepository>,
}

impl AuthService {
    pub fn new(user_repo: Arc<dyn UserRepository>) -> Self {
        Self { user_repo }
    }

    pub async fn signup(&self, payload: SignupRequest) -> Result<User, AppError> {
        payload.validate()?;

        if self.user_repo.find_by_email(&payload.email).await?.is_some() {
            return Err(AppError::EmailTaken);
        }

        let password_hash = bcrypt::hash(&payload.password, BCRYPT_COST)?;

        let user = User {
            id: Uuid::new_v4(),
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            password_hash,
            created_at: Utc::now(),
        };

        // Insert can still race with another signup for the same email
        // between the check above and this call; the DB's UNIQUE
        // constraint is the real guard, and AppError::from(sqlx::Error)
        // maps that violation back to EmailTaken (409) automatically.
        self.user_repo.insert(&user).await?;

        Ok(user)
    }

    pub async fn login(&self, payload: LoginRequest) -> Result<User, AppError> {
        payload.validate()?;

        let user = self
            .user_repo
            .find_by_email(&payload.email)
            .await?
            .ok_or(AppError::InvalidCredentials)?;

        let valid = bcrypt::verify(&payload.password, &user.password_hash)?;
        if !valid {
            return Err(AppError::InvalidCredentials);
        }

        Ok(user)
    }
}
