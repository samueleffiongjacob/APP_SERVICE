"""
DRF custom exception handler — wraps DRF exceptions in our ApiResponse envelope.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context) -> Response:
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "success": False,
            "message": _extract_message(response.data),
            "data": None,
            "errors": response.data,
        }

    return response


def _extract_message(data) -> str:
    if isinstance(data, dict):
        for key in ("detail", "non_field_errors"):
            if key in data:
                val = data[key]
                return str(val[0]) if isinstance(val, list) else str(val)
        return "Request failed."
    if isinstance(data, list) and data:
        return str(data[0])
    return "Request failed."
