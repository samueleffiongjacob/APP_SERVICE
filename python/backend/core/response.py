"""
Generic ApiResponse<T> envelope — mirrors the pattern used
across the C#, Go, Laravel, and Axum stacks.
"""
from typing import Any, Optional
from rest_framework.response import Response


class ApiResponse:
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status: int = 200,
    ) -> Response:
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
                "errors": None,
            },
            status=status,
        )

    @staticmethod
    def created(data: Any = None, message: str = "Created") -> Response:
        return ApiResponse.success(data=data, message=message, status=201)

    @staticmethod
    def error(
        message: str = "An error occurred",
        errors: Optional[Any] = None,
        status: int = 400,
    ) -> Response:
        return Response(
            {
                "success": False,
                "message": message,
                "data": None,
                "errors": errors,
            },
            status=status,
        )

    @staticmethod
    def no_content() -> Response:
        return Response(status=204)
