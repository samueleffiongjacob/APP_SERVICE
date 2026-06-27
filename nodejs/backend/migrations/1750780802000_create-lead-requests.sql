-- See 1750780801000_create-users.sql for why this is an independent
-- copy of the Rust project's schema, not a shared/linked file.

CREATE TABLE IF NOT EXISTS lead_requests (
    id         UUID PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT NOT NULL,
    service    TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_requests_created_at ON lead_requests (created_at DESC);
