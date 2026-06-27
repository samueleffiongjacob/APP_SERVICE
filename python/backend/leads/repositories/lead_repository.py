from typing import Optional
import uuid
from django.core.exceptions import ObjectDoesNotExist
from leads.models import Lead


class LeadRepository:
    """Repository layer — all ORM access for Lead lives here."""

    def get_by_id(self, lead_id: uuid.UUID) -> Optional[Lead]:
        try:
            return Lead.objects.get(id=lead_id)
        except ObjectDoesNotExist:
            return None

    def get_all(self) -> list[Lead]:
        return list(Lead.objects.all())

    def create(
        self,
        name: str,
        email: str,
        phone: str = "",
        service: str = "",
        message: str = "",
    ) -> Lead:
        return Lead.objects.create(
            name=name,
            email=email,
            phone=phone,
            service=service,
            message=message,
        )

    def update(self, lead: Lead, **fields) -> Lead:
        allowed = {k: v for k, v in fields.items() if v is not None}
        for attr, value in allowed.items():
            setattr(lead, attr, value)
        lead.save(update_fields=list(allowed.keys()) + ["updated_at"])
        return lead

    def delete(self, lead: Lead) -> None:
        lead.delete()

    def exists_by_email(self, email: str) -> bool:
        return Lead.objects.filter(email=email).exists()
