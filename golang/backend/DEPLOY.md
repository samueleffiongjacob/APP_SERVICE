# Deployment Guide — Service Platform (Go)

## Prerequisites
- Docker >= 24
- Docker Compose >= 2.20
- A Linux server (Ubuntu 22.04 LTS recommended)

---

## Project Structure

```
App_service/
├── Dockerfile              # Multi-stage build: Go binary + Nginx + Supervisor
├── docker-compose.yml      # Orchestrates API + PostgreSQL
├── .dockerignore           # Excludes secrets and noise from build context
├── .env.production         # Environment variables (fill before deploying)
├── DEPLOY.md               # This file
└── docker/
    ├── nginx.conf          # Reverse proxy, rate limiting, security headers
    ├── supervisord.conf    # Keeps nginx + Go API alive inside the container
    └── entrypoint.sh       # Waits for Postgres, then starts supervisor
```

---

## First-Time Setup

### 1. Fill in credentials
Edit `.env.production` — change `CHANGE_ME_STRONG_PASSWORD` to a real password:
```env
DB_PASSWORD=your_actual_strong_password
```

### 2. Build and start
```bash
docker compose --env-file .env.production up --build -d
```

### 3. Verify everything is running
```bash
docker compose ps
docker compose logs api
docker compose logs postgres
```

### 4. Test the API
```bash
curl http://localhost/health
# → {"status":"ok"}
```

---

## Day-to-Day Commands

| Task | Command |
|---|---|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Restart API only | `docker compose restart api` |
| Rebuild after code change | `docker compose up --build -d` |
| View live logs | `docker compose logs -f api` |
| Open Postgres shell | `docker exec -it service_platform_db psql -U postgres -d service_platform` |
| Wipe database volume | `docker compose down -v` |

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/users` | List all users |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/requests` | List all lead requests |
| POST | `/api/requests` | Create lead request |
| DELETE | `/api/requests/{id}` | Delete lead request |

---

## Architecture Inside the Container

```
Internet
    │
    ▼
 Nginx :80          ← rate limiting, security headers, access logs
    │
    ▼
 Go API :8082       ← business logic, DB queries
    │
    ▼
 PostgreSQL         ← separate container, named volume for persistence
```

Supervisor keeps both Nginx and the Go API alive — if either crashes, it restarts automatically.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8082` | Internal Go API port |
| `DB_HOST` | `postgres` | Postgres hostname (compose service name) |
| `DB_PORT` | `5432` | Postgres port |
| `DB_USER` | `postgres` | Postgres user |
| `DB_PASSWORD` | — | Postgres password **(required)** |
| `DB_NAME` | `service_platform` | Database name |
| `GO_ENV` | `production` | Environment label |
