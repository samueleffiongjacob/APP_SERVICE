import uuid
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.response import ApiResponse
from users.dtos import RegisterDTO, UpdateUserDTO
from users.services import UserService


class UserController(APIView):
    authentication_classes = [JWTAuthentication]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = UserService()

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_authenticators(self):
        if self.request.method == "POST":
            return []
        return super().get_authenticators()

    def get(self, request):
        """GET /api/users — list all users (auth required)."""
        users = self._service.get_all_users()
        return ApiResponse.success(
            data=[u.to_dict() for u in users],
            message="Users retrieved successfully.",
        )

    def post(self, request):
        """POST /api/users — register (public). Accepts: name, email, phone, password."""
        body = request.data
        dto = RegisterDTO(
            name=body.get("name", ""),
            email=body.get("email", ""),
            password=body.get("password", ""),
            phone=body.get("phone", ""),
        )
        result = self._service.register(dto)
        return ApiResponse.created(
            data=result.to_dict(),
            message="User registered successfully.",
        )


class UserDetailController(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = UserService()

    def get(self, request, user_id: str):
        """GET /api/users/<id>"""
        result = self._service.get_user(uuid.UUID(user_id))
        return ApiResponse.success(data=result.to_dict())

    def patch(self, request, user_id: str):
        """PATCH /api/users/<id>"""
        body = request.data
        dto = UpdateUserDTO(
            name=body.get("name"),
            phone=body.get("phone"),
        )
        result = self._service.update_user(uuid.UUID(user_id), dto)
        return ApiResponse.success(data=result.to_dict(), message="User updated successfully.")

    def delete(self, request, user_id: str):
        """DELETE /api/users/<id>"""
        self._service.delete_user(uuid.UUID(user_id))
        return ApiResponse.no_content()


class MeController(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = UserService()

    def get(self, request):
        """GET /api/users/me"""
        result = self._service.get_user(request.user.id)
        return ApiResponse.success(data=result.to_dict())
