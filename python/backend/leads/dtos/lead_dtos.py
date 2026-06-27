from dataclasses import dataclass
from typing import Optional
import uuid


@dataclass
class CreateLeadDTO:
    """Inbound payload from frontend — matches the Postman body exactly."""
    name: str
    email: str
    phone: str    = ""
    service: str  = ""
    message: str  = ""

    def validate(self) -> list[str]:
        errors = []
        if not self.name or len(self.name.strip()) < 2:
            errors.append("Name must be at least 2 characters.")
        if not self.email or "@" not in self.email:
            errors.append("Valid email is required.")
        return errors


@dataclass
class UpdateLeadDTO:
    """Partial update — all fields optional."""
    name:    Optional[str] = None
    phone:   Optional[str] = None
    service: Optional[str] = None
    message: Optional[str] = None
    status:  Optional[str] = None


@dataclass
class LeadResponseDTO:
    """Outbound shape — consistent with C#/Go/Java stacks."""
    id:         uuid.UUID
    name:       str
    email:      str
    phone:      str
    service:    str
    message:    str
    status:     str
    created_at: str

    @classmethod
    def from_model(cls, lead) -> "LeadResponseDTO":
        return cls(
            id=lead.id,
            name=lead.name,
            email=lead.email,
            phone=lead.phone or "",
            service=lead.service or "",
            message=lead.message or "",
            status=lead.status,
            created_at=lead.created_at.isoformat(),
        )

    def to_dict(self) -> dict:
        return {
            "id":         str(self.id),
            "name":       self.name,
            "email":      self.email,
            "phone":      self.phone,
            "service":    self.service,
            "message":    self.message,
            "status":     self.status,
            "created_at": self.created_at,
        }
