"""
Auth controller — login, logout, token refresh.
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from core.response import ApiResponse
from users.dtos import LoginDTO
from users.services import AuthService


class LoginController(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = AuthService()

    def post(self, request):
        """POST /api/auth/login/"""
        body = request.data
        dto = LoginDTO(
            email=body.get("email", ""),
            password=body.get("password", ""),
        )
        result = self._service.login(dto)
        return ApiResponse.success(data=result, message="Login successful.")


class TokenRefreshController(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = AuthService()

    def post(self, request):
        """POST /api/auth/refresh/"""
        refresh = request.data.get("refresh_token", "")
        result = self._service.refresh_token(refresh)
        return ApiResponse.success(data=result)
