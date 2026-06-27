# syntax=docker/dockerfile:1

# ---------- Stage 1: builder ----------
# Needs the full devDependencies set (typescript, @types/*) to run tsc.
# Pinned to node:24 — the current Active LTS line as of mid-2026
# (support through April 2028); node:20 reached EOL in April 2026 and
# shouldn't be used for a new image.
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# Copy manifests first so `npm ci` is cached and skipped on rebuilds
# that only change application code, not dependencies.
COPY package.json package-lock.json ./
RUN npm ci

# Now the real source + tsconfig, then compile.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Node.js isn't designed to run as PID 1 — it won't forward SIGTERM to
# child processes or reap zombies correctly. dumb-init fixes that, so
# `docker stop` / `docker compose down` shut the process down promptly
# instead of waiting out the full grace-period timeout.
RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install ONLY production dependencies — no typescript, ts-node-dev,
# or @types/* packages end up in this image. `npm ci --omit=dev` reads
# package-lock.json directly so the resolved versions exactly match
# what was used to build.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Only the compiled output, not the TypeScript source.
COPY --from=builder /app/dist ./dist

# node:*-slim images already ship a non-root "node" user — reuse it
# instead of creating a new one.
USER node

EXPOSE 8084

CMD ["dumb-init", "node", "dist/main.js"]
