use crate::model::User;
use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

/// Abstraction over storage so the service layer doesn't care which
/// database backs it. Only one implementation now (Postgres), but the
/// trait stays - it's what let us swap the old in-memory version out
/// without touching `service/` at all.
#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, sqlx::Error>;
    async fn find_all(&self) -> Result<Vec<User>, sqlx::Error>;
    async fn insert(&self, user: &User) -> Result<(), sqlx::Error>;
    async fn delete(&self, id: Uuid) -> Result<Option<User>, sqlx::Error>;
}

#[derive(Clone)]
pub struct PgUserRepository {
    pool: PgPool,
}

impl PgUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for PgUserRepository {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT id, name, email, phone, password_hash, created_at
             FROM users WHERE email = $1",
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
    }

    async fn find_all(&self) -> Result<Vec<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT id, name, email, phone, password_hash, created_at
             FROM users ORDER BY created_at DESC",
        )
        .fetch_all(&self.pool)
        .await
    }

    async fn insert(&self, user: &User) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO users (id, name, email, phone, password_hash, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)",
        )
        .bind(user.id)
        .bind(&user.name)
        .bind(&user.email)
        .bind(&user.phone)
        .bind(&user.password_hash)
        .bind(user.created_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn delete(&self, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "DELETE FROM users WHERE id = $1
             RETURNING id, name, email, phone, password_hash, created_at",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }
}
