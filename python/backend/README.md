# Service Platform — Django (Python)

Senior-level Django REST API following the same layered architecture
used across the C#, Go, Laravel, Axum, and Java Spring Boot stacks.

## Architecture

```
service_platform/
├── core/
│   ├── exceptions.py          # Domain exceptions (AppException hierarchy)
│   ├── exceptions_handler.py  # DRF custom exception handler
│   └── response.py            # Generic ApiResponse<T> envelope
│
└── users/                     # Feature module
    ├── models.py              # ORM model (AbstractBaseUser)
    ├── admin.py               # Django admin registration
    ├── urls.py                # URL routing for this module
    │
    ├── controllers/           # HTTP layer — thin, no business logic
    │   ├── user_controller.py
    │   └── auth_controller.py
    │
    ├── services/              # Business logic layer
    │   ├── user_service.py
    │   └── auth_service.py
    │
    ├── repositories/          # Data access layer — all ORM queries here
    │   └── user_repository.py
    │
    ├── dtos/                  # Data Transfer Objects (dataclasses)
    │   └── user_dtos.py
    │
    └── middleware/            # Cross-cutting concerns
        ├── exception_middleware.py
        └── request_logging_middleware.py
```

## Endpoints

| Method | URL                  | Auth     | Description            |
|--------|----------------------|----------|------------------------|
| POST   | /api/auth/login/     | Public   | Login → JWT tokens     |
| POST   | /api/auth/refresh/   | Public   | Refresh access token   |
| POST   | /api/users/          | Public   | Register user          |
| GET    | /api/users/          | Bearer   | List all users         |
| GET    | /api/users/me/       | Bearer   | Current user profile   |
| GET    | /api/users/<id>/     | Bearer   | Get user by ID         |
| PATCH  | /api/users/<id>/     | Bearer   | Update user            |
| DELETE | /api/users/<id>/     | Bearer   | Delete user            |

## Response Envelope

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": { ... },
  "errors": null
}
```

## Quick Start

```bash
pip install -r requirements.txt
pip show package name
pip freeze > requirements.txt
python manage.py makemigrations users
python manage.py makemigrations leads
python manage.py migrate
python manage.py createsuperuser
STATIC_ROOT=./staticfiles python manage.py collectstatic --noinput
python manage.py runserver
```
