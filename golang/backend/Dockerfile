# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

# Cache dependencies separately from source
COPY golang/backend/go.mod golang/backend/go.sum ./
RUN go mod download

# Copy full source and compile a static binary
COPY golang/backend/ .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /app/server ./main.go

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM alpine:3.19

# Install nginx + supervisor (supervisor keeps both nginx and the Go app alive)
RUN apk add --no-cache nginx supervisor tzdata ca-certificates

# Create runtime user — never run as root in production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy Go binary
COPY --from=builder /app/server /app/server

# Copy docker config files
COPY docker/nginx.conf      /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh   /entrypoint.sh

# Nginx needs to write logs; make dirs accessible
RUN mkdir -p /var/log/nginx /var/log/supervisor /run/nginx \
    && chown -R appuser:appgroup /var/log/nginx /var/log/supervisor /app \
    && chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]

# ======== 2 nd Dockerfile (for the Go server) ========
# ── Stage 1: Build ────────────────────────────────────────────────────────────
# FROM golang:1.22-alpine AS builder

# # Install git (needed by go mod for some dependencies)
# RUN apk add --no-cache git

# WORKDIR /app

# # Download dependencies first (cached layer — only re-runs if go.mod/go.sum change)
# COPY go.mod go.sum ./
# RUN go mod download

# # Copy source and build a fully static binary
# COPY . .
# RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
#     go build -ldflags="-w -s" -o server ./main.go

# # ── Stage 2: Run ──────────────────────────────────────────────────────────────
# FROM scratch

# # Copy only the binary — no OS, no shell, no bloat
# COPY --from=builder /app/server /server

# # Expose the API port
# EXPOSE 8082

# ENTRYPOINT ["/server"]
