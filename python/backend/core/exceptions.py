"""
Domain exceptions — thin wrappers that carry HTTP semantics
without importing Django/DRF into the business layer.
"""


class AppException(Exception):
    """Base for all domain exceptions."""
    status_code: int = 500

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class ValidationException(AppException):
    status_code = 400

    def __init__(self, errors: list[str]):
        super().__init__("Validation failed.")
        self.errors = errors


class NotFoundException(AppException):
    status_code = 404


class ConflictException(AppException):
    status_code = 409


class UnauthorizedException(AppException):
    status_code = 401


class ForbiddenException(AppException):
    status_code = 403
