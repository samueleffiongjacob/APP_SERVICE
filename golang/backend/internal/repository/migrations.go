package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Migrate creates all required tables if they do not already exist.
// Call this once at startup before the server begins accepting requests.
func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS app_users (
			id          TEXT        PRIMARY KEY,
			name        TEXT        NOT NULL,
			email       TEXT        NOT NULL UNIQUE,
			phone       TEXT        NOT NULL DEFAULT '',
			password    TEXT        NOT NULL,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS lead_requests (
			id          TEXT        PRIMARY KEY,
			name        TEXT        NOT NULL,
			email       TEXT        NOT NULL,
			phone       TEXT        NOT NULL DEFAULT '',
			service     TEXT        NOT NULL,
			message     TEXT        NOT NULL DEFAULT '',
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	}

	for _, sql := range statements {
		if _, err := pool.Exec(ctx, sql); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}
	return nil
}
