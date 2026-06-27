# Deploying service-platform

Two ways to run this in production. Pick one — they don't need each
other.

---

## Option A — Docker (recommended)

Containerizes the Rust API (`Dockerfile`) and wires it to PostgreSQL
via `docker-compose.yml`. No nginx is included in this path on
purpose: nginx and the app run as **two separate containers** by
design, not bundled into one via supervisord, because that's the more
idiomatic way to run Docker (one process per container) and it's what
you end up needing anyway the moment you want to scale the app and the
proxy independently.

If you want TLS termination in front of this, run a standard `nginx`
(or Caddy / Traefik) container alongside it and point it at the `app`
service over the shared Docker network — `docker/nginx.conf` in this
repo is written for the **non-Docker** path (Option B) and assumes
nginx is on the host, not in a container, so don't reuse it verbatim
here without adjusting `proxy_pass` to the Docker network address.

### Steps

> **First time only:** if this project has never been built locally,
> generate `Cargo.lock` before building the image — the Dockerfile
> copies it explicitly and the build will fail without it:
> ```bash
> cargo generate-lockfile
> ```
> (running `cargo build` also creates it as a side effect, if you'd
> rather do that instead). Commit `Cargo.lock` to version control once
> it exists — for a binary like this, it should be checked in, not
> gitignored.

```bash
cd service-platform

# 1. Configure secrets
cp .env.production .env
nano .env   # set a real POSTGRES_PASSWORD at minimum

# 2. Build and start both containers
docker compose up -d --build

# 3. Confirm it's healthy
docker compose ps
curl http://localhost:8083/health

# 4. Watch logs
docker compose logs -f app
```

Migrations run automatically on container startup (`sqlx::migrate!` in
`src/main.rs`) — there is no separate migration step to run.

### Updating after a code change

```bash
docker compose up -d --build app
```

Only rebuilds the `app` image; `db` and its volume (`pgdata`) are
untouched, so your data persists across redeploys.

### Stopping

```bash
docker compose down        # stops containers, keeps the pgdata volume
docker compose down -v     # also deletes the volume — wipes the DB
```

---

## Option B — Bare metal / VM (no Docker)

Compiles the binary directly on (or for) the target host, runs it
under `systemd`, and puts nginx in front for TLS termination.

### 1. Build the release binary

On the target machine, or cross-compiled and copied over:

```bash
cargo build --release
# binary is at target/release/service-platform
```

The `[profile.release]` block in `Cargo.toml` already applies LTO,
single-codegen-unit, and stripped symbols — no extra flags needed.

### 2. Install it

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin serviceplatform
sudo mkdir -p /opt/service-platform
sudo cp target/release/service-platform /opt/service-platform/
sudo cp .env.example /opt/service-platform/.env
sudo nano /opt/service-platform/.env   # set real DATABASE_URL
sudo chown -R serviceplatform:serviceplatform /opt/service-platform
```

`DATABASE_URL` here should point at wherever Postgres actually is —
`localhost` if it's on the same machine, or a real host/IP otherwise.
This is unrelated to `.env.production`, which is only for the Docker
Compose path above.

### 3. Set up Postgres and run migrations

If Postgres isn't already running on this host, install it normally
(`apt install postgresql`, etc) and create the database/user matching
`DATABASE_URL`. Migrations are embedded in the binary and run
automatically on its first startup — no separate `sqlx migrate run`
step needed, same as the Docker path.

### 4. Install the systemd service

```bash
sudo cp docker/service-platform.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now service-platform
sudo systemctl status service-platform
```

(`docker/service-platform.service` lives under `docker/` alongside
`nginx.conf` for convenience in this repo, despite being part of the
non-Docker path — same with `nginx.conf` itself.)

Logs: `journalctl -u service-platform -f`

### 5. Install nginx in front of it

```bash
sudo cp docker/nginx.conf /etc/nginx/sites-available/service-platform
sudo ln -s /etc/nginx/sites-available/service-platform /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-available/service-platform   # replace api.example.com
```

Get a real TLS certificate (Let's Encrypt via certbot is the common
free option):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
```

This rewrites the `ssl_certificate`/`ssl_certificate_key` paths in the
config automatically and sets up auto-renewal.

```bash
sudo nginx -t          # validate config syntax before reloading
sudo systemctl reload nginx
```

### Updating after a code change

```bash
cargo build --release
sudo systemctl stop service-platform
sudo cp target/release/service-platform /opt/service-platform/
sudo systemctl start service-platform
```

---

## Common to both paths

- **Health check**: `GET /health` returns `{"status":"ok"}` with no
  database dependency — safe to use as a liveness probe either way.
- **Logs**: structured `tracing` output either way — `docker compose
  logs -f app` or `journalctl -u service-platform -f`.
- **Secrets**: never commit a real `.env` — both `.env.example` and
  `.env.production` are templates only. `.gitignore` already excludes
  `.env` itself.
