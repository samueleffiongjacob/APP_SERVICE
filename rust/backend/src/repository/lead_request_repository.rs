use crate::model::LeadRequest;
use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

#[async_trait]
pub trait LeadRequestRepository: Send + Sync {
    async fn insert(&self, request: &LeadRequest) -> Result<(), sqlx::Error>;
    async fn find_all(&self) -> Result<Vec<LeadRequest>, sqlx::Error>;
    async fn delete(&self, id: Uuid) -> Result<Option<LeadRequest>, sqlx::Error>;
}

#[derive(Clone)]
pub struct PgLeadRequestRepository {
    pool: PgPool,
}

impl PgLeadRequestRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl LeadRequestRepository for PgLeadRequestRepository {
    async fn insert(&self, request: &LeadRequest) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO lead_requests (id, name, email, phone, service, message, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)",
        )
        .bind(request.id)
        .bind(&request.name)
        .bind(&request.email)
        .bind(&request.phone)
        .bind(&request.service)
        .bind(&request.message)
        .bind(request.created_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn find_all(&self) -> Result<Vec<LeadRequest>, sqlx::Error> {
        sqlx::query_as::<_, LeadRequest>(
            "SELECT id, name, email, phone, service, message, created_at
             FROM lead_requests ORDER BY created_at DESC",
        )
        .fetch_all(&self.pool)
        .await
    }

    async fn delete(&self, id: Uuid) -> Result<Option<LeadRequest>, sqlx::Error> {
        sqlx::query_as::<_, LeadRequest>(
            "DELETE FROM lead_requests WHERE id = $1
             RETURNING id, name, email, phone, service, message, created_at",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }
}
