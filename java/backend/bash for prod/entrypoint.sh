#!/bin/sh
set -e

echo "Starting service-platform-java..."
echo "Active profile: ${SPRING_PROFILES_ACTIVE:-default}"
echo "Listening on port: ${SERVER_PORT:-8080}"

# Fail fast and loud if a required secret is missing, rather than letting
# the JVM boot partway and throw a confusing Postgres connection error.
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Refusing to start." >&2
  exit 1
fi

exec java $JAVA_OPTS -jar app.jar
