# Multi-Stack Service Scaffold

This workspace is organized as a clean monorepo-style scaffold for seven backend stacks sharing one frontend contract.

## Layout

- `shared/frontend/` - Next.js + TypeScript frontend used by every stack
- `java/backend/` - Spring Boot backend
- `csharp/backend/` - ASP.NET Core backend
- `golang/backend/` - Go backend
- `rustc/backend/` - Rust backend
- `php/backend/` - Laravel backend
- `python/backend/` - Django backend
- `nodejs/backend/` - Express + TypeScript backend

## API Contract

Every backend exposes the same endpoints:

- `GET /health`
- `POST /api/requests`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/users`
- `DELETE /api/users/:id`

## Frontend

The frontend is intentionally centralized so the UX stays identical across stacks. Set `NEXT_PUBLIC_API_BASE_URL` to point at the backend you want to test.
