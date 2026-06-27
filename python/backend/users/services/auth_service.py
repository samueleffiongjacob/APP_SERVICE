from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from users.repositories import UserRepository
from users.dtos import LoginDTO, UserResponseDTO
from core.exceptions import UnauthorizedException


class AuthService:
    """Handles authentication and token generation."""

    def __init__(self, repository: UserRepository = None):
        self._repo = repository or UserRepository()

    def login(self, dto: LoginDTO) -> dict:
        user = self._repo.get_by_email(dto.email)
        if not user:
            raise UnauthorizedException("Invalid credentials.")

        authenticated = authenticate(username=dto.email, password=dto.password)
        if not authenticated:
            raise UnauthorizedException("Invalid credentials.")

        refresh = RefreshToken.for_user(authenticated)
        return {
            "token": str(refresh.access_token),        # frontend expects "token"
            "access_token": str(refresh.access_token), # keep for Postman/other clients
            "refresh_token": str(refresh),
            "token_type": "Bearer",
            "user": UserResponseDTO.from_model(authenticated).to_dict(),
        }

    def refresh_token(self, raw_refresh: str) -> dict:
        try:
            refresh = RefreshToken(raw_refresh)
            return {
                "access_token": str(refresh.access_token),
                "token_type": "Bearer",
            }
        except Exception:
            raise UnauthorizedException("Invalid or expired refresh token.")
