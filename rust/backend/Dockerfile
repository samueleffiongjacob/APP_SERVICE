# syntax=docker/dockerfile:1

# ---------- Stage 1: builder ----------
# Full Rust toolchain — discarded after the build, never ships in the
# final image. Pinned to bookworm so the glibc version matches the
# runtime stage exactly (avoids "GLIBC_x.xx not found" at startup).
#
# IMPORTANT: this COPY assumes Cargo.lock exists and is committed in
# the build context. If you've never run `cargo build` locally yet,
# run it once (or `cargo generate-lockfile`) before the first
# `docker build` / `docker compose up --build` — without a lockfile
# this COPY fails immediately with "Cargo.lock: no such file".
FROM rust:1-bookworm AS builder
WORKDIR /app

# Copy only the manifests first. As long as Cargo.toml/Cargo.lock don't
# change, Docker reuses this layer's cached `cargo build` of all
# dependencies on every subsequent build — this is what makes rebuilds
# after a small code change take seconds instead of minutes.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src \
    && echo "fn main() {}" > src/main.rs \
    && cargo build --release \
    && rm -rf src

# Now copy the real source and migrations, and build for real. Only
# this layer re-runs when application code changes.
#
# Note: this project's repository layer uses runtime sqlx::query_as
# (never the query!/query_as! compile-time macros), so no live database
# connection or SQLX_OFFLINE cache is needed during this build — see
# src/repository/*.rs if that ever changes.
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release

# ---------- Stage 2: runtime ----------
# debian:bookworm-slim, not scratch/distroless: sqlx needs CA certs to
# validate the Postgres TLS connection at runtime, and bookworm-slim
# gives us that plus glibc with minimal extra weight (~80MB vs ~5MB for
# scratch, but far fewer footguns around certs/DNS resolution).
FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user — never run a network-facing process as root in a
# container; there's no reason this binary needs root privileges.
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=builder /app/target/release/service-platform /app/service-platform

# Note: migrations/ is intentionally NOT copied into this stage.
# sqlx::migrate!("./migrations") in src/main.rs embeds the SQL files
# into the binary at COMPILE time (it reads them once during the build
# stage above and bakes the contents in) — the running binary never
# touches the filesystem for migrations again, so they don't need to
# exist in this image.

USER appuser

EXPOSE 8083

# No shell wrapper, no entrypoint.sh — there is exactly one process in
# this container, so exec form direct invocation is all that's needed.
CMD ["/app/service-platform"]
