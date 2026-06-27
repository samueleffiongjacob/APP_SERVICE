from django.urls import path
from users.controllers import (
    UserController,
    UserDetailController,
    MeController,
    LoginController,
    TokenRefreshController,
)

# Routes registered both with and without trailing slash.
# APPEND_SLASH=False means Django will NOT 301-redirect — the client hits
# exactly what it sends, and both variants resolve correctly.

urlpatterns = [
    # ── Auth ─────────────────────────────────────────────────────────────────
    # signup → same as POST /api/users (register)
    path("auth/signup",   UserController.as_view(), name="auth-signup"),
    path("auth/signup/",  UserController.as_view()),

    path("auth/login",    LoginController.as_view(), name="auth-login"),
    path("auth/login/",   LoginController.as_view()),

    path("auth/refresh",  TokenRefreshController.as_view(), name="auth-refresh"),
    path("auth/refresh/", TokenRefreshController.as_view()),

    # ── Users ─────────────────────────────────────────────────────────────────
    # IMPORTANT: /users/me/ must come BEFORE /users/<user_id>/ so "me"
    # is not swallowed as a UUID parameter.
    path("users/me",  MeController.as_view(), name="users-me"),
    path("users/me/", MeController.as_view()),

    path("users",    UserController.as_view(), name="users-list-create"),
    path("users/",   UserController.as_view()),

    path("users/<str:user_id>",  UserDetailController.as_view(), name="users-detail"),
    path("users/<str:user_id>/", UserDetailController.as_view()),
]
