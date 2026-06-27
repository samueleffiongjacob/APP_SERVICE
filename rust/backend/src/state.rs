use crate::{
    repository::{PgLeadRequestRepository, PgUserRepository},
    service::{AuthService, LeadRequestService, UserService},
};
use sqlx::PgPool;
use std::sync::Arc;

/// Composition root: wires repositories into services and is cheaply
/// `Clone`able (just `Arc`/`PgPool` bumps, both internally Arc-backed)
/// so axum can hand a copy to every handler.
#[derive(Clone)]
pub struct AppState {
    pub auth_service: AuthService,
    pub user_service: UserService,
    pub lead_request_service: LeadRequestService,
}

impl AppState {
    pub fn new(pool: PgPool) -> Self {
        let user_repo = Arc::new(PgUserRepository::new(pool.clone()));
        let lead_repo = Arc::new(PgLeadRequestRepository::new(pool));

        Self {
            auth_service: AuthService::new(user_repo.clone()),
            user_service: UserService::new(user_repo),
            lead_request_service: LeadRequestService::new(lead_repo),
        }
    }
}
