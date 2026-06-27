-- This service owns and runs its own migrations independently of the
-- Rust implementation of the same API. Both happen to target the same
-- table shape because they implement the same contract for different
-- clients, in different languages — this file is a deliberate,
-- independent copy of that shape, not a reference to or dependency on
-- the Rust project's migrations/ folder. Changing this file does not
-- change the Rust service's schema, and vice versa; keep them in sync
-- by hand if the schema changes on either side.

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
