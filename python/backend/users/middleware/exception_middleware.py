"""
Global exception handler middleware.
Catches domain exceptions and returns consistent JSON envelopes.
"""
import json
import logging
from django.http import JsonResponse
from core.exceptions import AppException, ValidationException

logger = logging.getLogger(__name__)


class GlobalExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception: Exception):
        if isinstance(exception, ValidationException):
            return JsonResponse(
                {
                    "success": False,
                    "message": exception.message,
                    "data": None,
                    "errors": exception.errors,
                },
                status=400,
            )

        if isinstance(exception, AppException):
            logger.warning("Domain exception: %s", exception.message)
            return JsonResponse(
                {
                    "success": False,
                    "message": exception.message,
                    "data": None,
                    "errors": None,
                },
                status=exception.status_code,
            )

        # Unexpected exceptions
        logger.exception("Unhandled exception on %s %s", request.method, request.path)
        return JsonResponse(
            {
                "success": False,
                "message": "Internal server error.",
                "data": None,
                "errors": None,
            },
            status=500,
        )
