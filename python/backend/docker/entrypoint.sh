#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# entrypoint.sh — runs before gunicorn starts
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "──────────────────────────────────────"
echo "  Service Platform — Django Entrypoint"
echo "──────────────────────────────────────"

# 1. Wait for PostgreSQL to be ready
echo "[1/4] Waiting for PostgreSQL..."
until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    print('  → PostgreSQL is ready')
except Exception as e:
    print(f'  → Not ready: {e}')
    sys.exit(1)
"; do
  echo "  → Retrying in 2s..."
  sleep 2
done

# 2. Apply migrations
echo "[2/4] Running migrations..."
python manage.py migrate --noinput

# 3. Collect static files
echo "[3/4] Collecting static files..."
python manage.py collectstatic --noinput --clear

# 4. Start supervisor (manages gunicorn workers)
echo "[4/4] Starting Gunicorn via Supervisor..."
exec supervisord -c /etc/supervisor/conf.d/app.conf
