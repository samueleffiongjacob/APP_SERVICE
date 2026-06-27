# Looking at your controllers, here are all your endpoints

## Health

- `GET /health`

**Auth** (`/api/auth`)

- `POST /api/auth/signup`
- `POST /api/auth/login`

**Leads** (`/api/requests`)

- `POST /api/requests`

**Users** (`/api/users`)

- `GET /api/users`
- `DELETE /api/users/{id}`

## Lead API (C#) — Docker Deployment

## Project Structure

```
App_service/
├── Dockerfile          # Multi-stage build (SDK → Runtime)
├── docker-compose.yml  # App + PostgreSQL
├── .dockerignore       # Excludes bin/, obj/, .git from image
├── .env.production     # Environment variable template
└── DEPLOY.md           # This file
```

## Why No nginx/supervisord?

.NET's built-in Kestrel web server handles HTTP directly.
No need for a reverse proxy or process manager inside the container.
For production behind a load balancer or domain, add nginx as a
separate container in docker-compose.yml.

## Setup

### 1. Rename your DLL in Dockerfile if needed

Check your .csproj filename and update the last line of Dockerfile:

```dockerfile
ENTRYPOINT ["dotnet", "YourProjectName.dll"]
```

### 2. Copy environment file

```bash
cp .env.production .env
```

### 3. Set DB_PASSWORD in .env

```bash
DB_PASSWORD=your_strong_password_here
```

### 4. Build and start

```bash
docker compose up -d --build
```

### 5. Verify

```bash
# Check containers
docker compose ps

# Test health endpoint
curl http://localhost:5000/health

# View logs
docker compose logs app
```

## Common Commands

```bash
# Stop containers
docker compose down

# Stop and wipe DB volume
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Run one-off commands inside container
docker compose exec app dotnet --info

# Live logs
docker compose logs -f app
```

## Production Optimizations Applied

- Multi-stage Docker build (SDK not shipped in final image)
- `dotnet publish -c Release` (AOT-ready, trimmed output)
- Non-root user inside container (security)
- PostgreSQL health check before app starts
- `ASPNETCORE_ENVIRONMENT=Production` (disables dev error pages)
- `bin/` and `obj/` excluded via .dockerignore (faster builds)
- Built-in health check on `/health` endpoint

## Connection String

The connection string is injected via environment variable:

```
ConnectionStrings__Default=Host=postgres;Port=5432;Database=leadapi;...
```

This overrides `appsettings.json` automatically in ASP.NET Core —
no code changes needed.
