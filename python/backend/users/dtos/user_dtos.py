from dataclasses import dataclass
from typing import Optional
import uuid


@dataclass
class RegisterDTO:
    """Input for user registration. Mirrors the frontend payload."""
    name: str
    email: str
    password: str
    phone: str = ""

    def validate(self) -> list[str]:
        errors = []
        if not self.name or len(self.name.strip()) < 2:
            errors.append("Name must be at least 2 characters.")
        if not self.email or "@" not in self.email:
            errors.append("Valid email is required.")
        if not self.password or len(self.password) < 6:
            errors.append("Password must be at least 6 characters.")
        return errors


@dataclass
class LoginDTO:
    """Input for authentication."""
    email: str
    password: str


@dataclass
class UpdateUserDTO:
    """Input for partial user update."""
    name: Optional[str]  = None
    phone: Optional[str] = None


@dataclass
class UserResponseDTO:
    """Outbound user shape — matches C#/Go/Java response exactly."""
    id: uuid.UUID
    name: str
    email: str
    phone: str
    is_active: bool
    created_at: str

    @classmethod
    def from_model(cls, user) -> "UserResponseDTO":
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone or "",
            is_active=user.is_active,
            created_at=user.created_at.isoformat(),
        )

    def to_dict(self) -> dict:
        return {
            "id":         str(self.id),
            "name":       self.name,
            "email":      self.email,
            "phone":      self.phone,
            "is_active":  self.is_active,
            "created_at": self.created_at,
        }
