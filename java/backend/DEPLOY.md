# Deployment Guide — service-platform-java

Two deployment paths are documented here: Docker (recommended) and a
manual/non-Docker production build for environments where Docker isn't
available.

---

## Option A — Docker

### Prerequisites
- Docker and Docker Compose installed on the host
- A real `.env.production` file (copy `.env.production` template, fill in
  actual values — never commit the real one)

### First-time setup

```bash
# 1. Copy the template and fill in real secrets
cp .env.production .env.production.local   # or edit .env.production directly
#    on the server, outside version control

# 2. Build and start everything
docker-compose up -d --build

# 3. Check everything is healthy
docker-compose ps
```

All three services (`postgres`, `app`, `nginx`) should show `healthy` once
fully started — `app` takes ~30-40s due to the `start_period` health-check
grace window, which gives the JVM and Flyway migrations time to finish.

### Flyway migrations in Docker

No change needed — Flyway runs automatically against the `postgres`
container on app startup, exactly as it does locally, using the
`DATABASE_URL` the compose file constructs from your Postgres env vars.

### Logs

```bash
docker-compose logs -f app        # Spring Boot logs
docker-compose logs -f postgres   # Postgres logs
docker-compose logs -f nginx      # nginx access/error logs
```

### Stopping / restarting

```bash
docker-compose down          # stops containers, keeps the postgres_data volume
docker-compose down -v       # stops containers AND deletes the database — careful
docker-compose restart app   # just restart the Java service
```

### Updating after a code change

```bash
docker-compose up -d --build app
```

Only rebuilds and restarts the `app` service — Postgres and nginx are
untouched, so no downtime for the database.

### Verifying it's reachable

```bash
curl http://localhost/api/health
```

Goes through nginx → app. If this fails but
`docker-compose logs app` shows the app started fine, the issue is in
`docker/nginx.conf` or the `app-network` wiring, not the Spring Boot app
itself.

---

## Option B — Without Docker

For a host where Docker isn't available (e.g. a constrained VM).

### 1. Build the jar

```bash
mvn clean package -DskipTests
```

Output: `target/service-platform-java-0.1.0.jar`

### 2. Install nginx (reverse proxy, same role as the Docker version)

```bash
sudo apt update && sudo apt install nginx
```

Copy `docker/nginx.conf` to `/etc/nginx/sites-available/service-platform`,
then change the upstream line from:

```nginx
server app:8080;
```

to:

```nginx
server 127.0.0.1:8080;
```

since there's no Docker network — the app runs directly on the host.

```bash
sudo ln -s /etc/nginx/sites-available/service-platform /etc/nginx/sites-enabled/
sudo nginx -t        # validates config syntax before reloading
sudo systemctl reload nginx
```

### 3. Set environment variables

Either export them in the shell that starts the app, or put them in a
systemd service file's `Environment=` lines (recommended for anything
long-running — survives reboots, restarts on crash).

```bash
export DATABASE_URL=postgres://app_user:REAL_PASSWORD@localhost:5432/service_platform
export SERVER_PORT=8080
export ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 4. Run as a systemd service (recommended over a bare `java -jar` in a
terminal, which dies when the SSH session ends)

Create `/etc/systemd/system/service-platform.service`:

```ini
[Unit]
Description=Service Platform Java Backend
After=network.target postgresql.service

[Service]
Type=simple
User=samueleffiong
EnvironmentFile=/path/to/.env.production
ExecStart=/usr/bin/java -jar /path/to/target/service-platform-java-0.1.0.jar
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable service-platform
sudo systemctl start service-platform
sudo systemctl status service-platform
```

### 5. Postgres

Install and run normally (not containerized in this path):

```bash
sudo apt install postgresql
```

Then run the Flyway migration once on first deploy — same file as the
Docker path, Flyway applies it automatically on app startup as long as
`src/main/resources/db/migration/V1__init_schema.sql` is packaged inside
the jar (it is, by default, since `src/main/resources` is on the
classpath).

### 6. Verify

```bash
curl http://localhost/api/health
sudo journalctl -u service-platform -f   # tail app logs
```

---

## Common to both paths

- `ALLOWED_ORIGINS` must list every real frontend domain that will call
  this API — comma-separated, no wildcards (required because CORS is
  configured with `allowCredentials(true)`).
- Never commit a real `.env.production` — only the placeholder template
  belongs in git.
- After any schema change, add a new `V2__...sql` file rather than
  editing `V1__init_schema.sql` — Flyway will refuse to start if an
  already-applied migration's checksum changes.
