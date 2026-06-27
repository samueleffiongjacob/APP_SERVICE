# Deploying service-platform-express

This service is fully self-contained: it owns its own Postgres
database and runs its own migrations (`migrations/` at the repo root)
on every startup. It does not require the Rust implementation of this
API to exist, run, or be deployed anywhere — they implement the same
contract independently, for different clients, and happen to share
a schema shape by design rather than by dependency.

Two ways to run this in production. Pick one.

---

## Option A Docker

```bash
# 1. start this one
cd ../service-platform-express
cp .env.production .env
nano .env   # POSTGRES_USER/PASSWORD/DB must match ../service-platform/.env EXACTLY
docker compose up -d --build
```

Migrations run automatically on container startup (`runMigrations()`
in `src/main.ts`, via `node-pg-migrate`'s programmatic API) — there is
no separate migration step to run manually. If migrations fail (bad
credentials, Postgres unreachable), the process exits non-zero and
never starts accepting traffic; Docker's restart policy will retry it.

### Confirm it's running

```bash
docker compose ps
curl http://localhost:8084/health
docker compose logs -f app
```

### Updating after a code change

```bash
docker compose up -d --build app
```

### Stopping

```bash
docker compose down        # keeps the pgdata volume
docker compose down -v     # also deletes it — wipes the database
```

---

## Option B — Bare metal / VM (no Docker)

Single Node process under `systemd`, nginx in front for TLS.
Deliberately no PM2 / cluster mode — if you want to use multiple CPU
cores later, the simplest path is running several systemd service
instances on different ports behind nginx's `upstream` load balancing,
rather than introducing a process manager inside one instance.

### 1. Build

```bash
npm ci
npm run build        # compiles src/ -> dist/
npm ci --omit=dev    # reinstall node_modules without devDependencies
```

### 2. Install it

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin serviceplatform
sudo mkdir -p /opt/service-platform-express
sudo cp -r dist node_modules package.json /opt/service-platform-express/
sudo cp .env.example /opt/service-platform-express/.env
sudo nano /opt/service-platform-express/.env   # real DATABASE_URL
sudo chown -R serviceplatform:serviceplatform /opt/service-platform-express
```

`migrations/` must be copied alongside `dist/` node reads its `.sql` files from disk at startup.

### 3. Set up Postgres

If Postgres isn't already running on this host, install it normally
and create a database/user matching `DATABASE_URL`. No separate
migration command is needed - the app runs its own migrations on
first startup, same as the Docker path above.

### 4. Install the systemd service

```bash
sudo cp docker/service-platform-express.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now service-platform-express
sudo systemctl status service-platform-express
```

(`docker/service-platform-express.service` and `docker/nginx.conf`
live under `docker/` for convenience in this repo despite being part
of the non-Docker path.

Logs: `journalctl -u service-platform-express -f`

### 5. nginx + TLS

```bash
sudo cp docker/nginx.conf /etc/nginx/sites-available/service-platform-express
sudo ln -s /etc/nginx/sites-available/service-platform-express /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-available/service-platform-express   # replace express-api.example.com
sudo apt install certbot python3-certbot-nginx   # if not already installed
sudo certbot --nginx -d express-api.example.com
sudo nginx -t
sudo systemctl reload nginx
```

### Updating after a code change

```bash
npm run build
npm ci --omit=dev
sudo systemctl stop service-platform-express
sudo cp -r dist node_modules /opt/service-platform-express/
sudo systemctl start service-platform-express
```

---

## TEST

- **Health check**: `GET /health` returns `{"status":"ok"}` with no
  database dependency — safe as a liveness probe either way (it
  responds even if the database is temporarily unreachable, since
  migrations already ran successfully before the server started
  listening).
- **Logs**: structured JSON either way — `docker compose logs -f app`
  or `journalctl -u service-platform-express -f`. Migration output is
  prefixed `[migrate]` so it's easy to grep for separately from
  request logs.
- **Secrets**: never commit a real `.env`. `.env.example` and
  `.env.production` are templates only.
