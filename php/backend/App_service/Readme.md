# Lead API — Docker Deployment

## Project Structure

```
docker/
├── nginx.conf          # Nginx virtual host config
├── supervisord.conf    # Process manager (nginx + php-fpm)
└── entrypoint.sh       # Startup script (migrate + optimize + serve)
Dockerfile              # PHP 8.2 + Nginx + Composer
docker-compose.yml      # App + PostgreSQL services
.env.production         # Production environment template
```

## Setup

### 1. Copy environment file

```bash
cp .env.production .env
```

### 2. Set required values in .env

```bash
APP_KEY=          # generate with: php artisan key:generate --show
DB_PASSWORD=      # set a strong password
APP_URL=          # your server IP or domain
```

### 3. Build and start

```bash
docker compose up -d --build
```

### 4. Verify

```bash
# Check containers are running
docker compose ps

# Check logs
docker compose logs app
docker compose logs postgres

# Test health endpoint
curl http://localhost:8000/api/health
```

## Common Commands

```bash
# Stop containers
docker compose down

# Stop and remove volumes (wipes DB)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Run artisan commands inside container
docker compose exec app php artisan migrate
docker compose exec app php artisan route:list

# View live logs
docker compose logs -f app
```

## Production Optimizations Applied

- `composer install --no-dev --optimize-autoloader`
- `php artisan config:cache`
- `php artisan route:cache`
- `php artisan view:cache`
- Nginx gzip compression
- Static file caching headers
- Security headers (X-Frame-Options, X-Content-Type-Options)
- APP_DEBUG=false
- LOG_LEVEL=error
