# Deployment Guide — Service Platform (Django)

Two paths: **Docker** (recommended) and **Bare Metal** (Ubuntu / VPS without Docker).

---

## Path A — Docker (Recommended)

### Prerequisites

- Docker ≥ 24 and Docker Compose ≥ 2.20 installed on the server
- A domain name pointing to your server's IP

### 1 — Clone & configure

```bash
git clone https://github.com/your-org/service-platform.git
cd service-platform

# Fill in real values
cp .env.production .env.production.local
nano .env.production.local
```

Key values to set in `.env.production`:

| Variable          | Description                              |
|-------------------|------------------------------------------|
| `SECRET_KEY`      | 50+ char random string                   |
| `DB_NAME`         | PostgreSQL database name                 |
| `DB_USER`         | PostgreSQL username                      |
| `DB_PASSWORD`     | Strong password                          |
| `ALLOWED_HOSTS`   | `yourdomain.com,www.yourdomain.com`      |
| `DEBUG`           | `False`                                  |

### 2 - Update nginx.conf

Edit `docker/nginx.conf` and replace every occurrence of `yourdomain.com`
with your actual domain.

### 3 - Build and start

```bash
docker compose --env-file .env.production up --build -d
```

### 4 - Check status

```bash
docker compose ps
docker compose logs app --tail=50
curl http://yourdomain.com/api/health/
```

### 5 - Create superuser

```bash
docker compose exec app python manage.py createsuperuser
```

### 6 - SSL with Let's Encrypt (Certbot)

```bash
# On the host (not inside Docker):
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certs land at /etc/letsencrypt/live/yourdomain.com/
# Uncomment the letsencrypt volume mount in docker-compose.yml, then:
docker compose restart nginx
```

### Common commands

```bash
# View logs
docker compose logs -f app

# Run migrations manually
docker compose exec app python manage.py migrate

# Shell
docker compose exec app python manage.py shell

# Stop everything
docker compose down

# Full reset (WARNING: destroys DB data)
docker compose down -v
```

---

## Path B - Bare Metal (Ubuntu 22.04 / 24.04, no Docker)

### 1 - System packages

```bash
sudo apt update && sudo apt install -y \
    python3.12 python3.12-venv python3-pip \
    postgresql postgresql-contrib \
    nginx supervisor \
    certbot python3-certbot-nginx
```

### 2 - PostgreSQL

```bash
sudo -u postgres psql << SQL
CREATE DATABASE service_platform_db;
CREATE USER sp_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE service_platform_db TO sp_user;
ALTER DATABASE service_platform_db OWNER TO sp_user;
SQL
```

### 3 - App user & virtual environment

```bash
sudo adduser --system --group appuser
sudo mkdir -p /var/www/service_platform
sudo chown appuser:appuser /var/www/service_platform

sudo -u appuser bash -c "
  cd /var/www/service_platform
  git clone https://github.com/your-org/service-platform.git .
  python3.12 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
"
```

### 4 - Environment file

```bash
sudo cp .env.production /var/www/service_platform/.env
sudo chown appuser:appuser /var/www/service_platform/.env
sudo chmod 600 /var/www/service_platform/.env
```

### 5 - Django setup

```bash
sudo -u appuser bash -c "
  cd /var/www/service_platform
  source .venv/bin/activate
  python manage.py migrate
  python manage.py collectstatic --noinput
  python manage.py createsuperuser
"
```

### 6 - Gunicorn via Supervisor

Create `/etc/supervisor/conf.d/service_platform.conf`:

```ini
[program:service_platform]
command=/var/www/service_platform/.venv/bin/gunicorn \
    service_platform.wsgi:application \
    --bind unix:/run/service_platform.sock \
    --workers 3 \
    --worker-class gthread \
    --threads 2 \
    --timeout 120
directory=/var/www/service_platform
user=appuser
autostart=true
autorestart=true
environment=
    DJANGO_SETTINGS_MODULE="service_platform.settings",
    SECRET_KEY="YOUR_SECRET_KEY",
    DB_NAME="service_platform_db",
    DB_USER="sp_user",
    DB_PASSWORD="STRONG_PASSWORD_HERE",
    DB_HOST="localhost",
    DEBUG="False",
    ALLOWED_HOSTS="yourdomain.com"
stdout_logfile=/var/log/service_platform/app.log
stderr_logfile=/var/log/service_platform/app_error.log

sudo mkdir -p /var/log/service_platform
sudo chown appuser:appuser /var/log/service_platform
sudo supervisorctl reread && sudo supervisorctl update && sudo supervisorctl start service_platform
```

### 7 - Nginx (bare metal)

Copy `docker/nginx.conf` to `/etc/nginx/sites-available/service_platform`:

- Replace `proxy_pass http://django_app` with `proxy_pass http://unix:/run/service_platform.sock`
- Replace `server app:8000` upstream with `server unix:/run/service_platform.sock`

```bash
sudo ln -s /etc/nginx/sites-available/service_platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 8 - SSL (bare metal)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl reload nginx
```

### Updates / redeploy

```bash
cd /var/www/service_platform
sudo -u appuser git pull
sudo -u appuser bash -c "source .venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput"
sudo supervisorctl restart service_platform
```

---

## Environment Variables Reference

| Variable                            | Default          | Required in prod |
|-------------------------------------|------------------|-----------------|
| `SECRET_KEY`                        | insecure default | ✅ Yes          |
| `DEBUG`                             | `True`           | Set to `False`  |
| `ALLOWED_HOSTS`                     | `*`              | ✅ Yes          |
| `DB_NAME`                           | sqlite fallback  | ✅ Yes          |
| `DB_USER`                           | —                | ✅ Yes          |
| `DB_PASSWORD`                       | —                | ✅ Yes          |
| `DB_HOST`                           | `localhost`      | `db` in Docker  |
| `DB_PORT`                           | `5432`           | Optional        |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `30`             | Optional        |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | `7`              | Optional        |
| `SECURE_SSL_REDIRECT`               | `True`           | Optional        |

---

## Gunicorn Worker Formula

```
workers = (2 × CPU cores) + 1
```

A 2-core VPS → 5 workers. Set via `GUNICORN_WORKERS` env var (supervisord.conf reads it).
