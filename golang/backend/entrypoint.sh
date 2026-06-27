#!/bin/sh
set -e

echo "============================================"
echo "  Service Platform API — Starting up"
echo "  Environment : ${GO_ENV:-production}"
echo "  DB Host     : ${DB_HOST}:${DB_PORT}"
echo "  DB Name     : ${DB_NAME}"
echo "  API Port    : ${PORT}"
echo "============================================"

# ── Wait for Postgres ─────────────────────────────────────────────────────────
echo "[entrypoint] Waiting for Postgres to be ready..."
MAX_RETRIES=30
RETRY=0

until nc -z "${DB_HOST}" "${DB_PORT:-5432}" 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
        echo "[entrypoint] ERROR: Postgres not reachable after ${MAX_RETRIES} attempts. Exiting."
        exit 1
    fi
    echo "[entrypoint] Postgres not ready yet — retrying in 2s (attempt ${RETRY}/${MAX_RETRIES})..."
    sleep 2
done

echo "[entrypoint] Postgres is ready."

# ── Start supervisor (manages nginx + go api) ─────────────────────────────────
echo "[entrypoint] Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
