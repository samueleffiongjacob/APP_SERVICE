from typing import Optional
import uuid
from leads.repositories import LeadRepository
from leads.dtos import CreateLeadDTO, UpdateLeadDTO, LeadResponseDTO
from core.exceptions import ConflictException, NotFoundException, ValidationException


class LeadService:
    """Business logic for leads — orchestrates repo, enforces rules."""

    def __init__(self, repository: Optional[LeadRepository] = None):
        self._repo = repository or LeadRepository()

    def create_lead(self, dto: CreateLeadDTO) -> LeadResponseDTO:
        errors = dto.validate()
        if errors:
            raise ValidationException(errors)
        if self._repo.exists_by_email(dto.email):
            raise ConflictException(f"A lead with email '{dto.email}' already exists.")
        lead = self._repo.create(
            name=dto.name,
            email=dto.email,
            phone=dto.phone,
            service=dto.service,
            message=dto.message,
        )
        return LeadResponseDTO.from_model(lead)

    def get_lead(self, lead_id: uuid.UUID) -> LeadResponseDTO:
        lead = self._repo.get_by_id(lead_id)
        if not lead:
            raise NotFoundException(f"Lead '{lead_id}' not found.")
        return LeadResponseDTO.from_model(lead)

    def get_all_leads(self) -> list[LeadResponseDTO]:
        return [LeadResponseDTO.from_model(l) for l in self._repo.get_all()]

    def update_lead(self, lead_id: uuid.UUID, dto: UpdateLeadDTO) -> LeadResponseDTO:
        lead = self._repo.get_by_id(lead_id)
        if not lead:
            raise NotFoundException(f"Lead '{lead_id}' not found.")
        updated = self._repo.update(
            lead,
            name=dto.name,
            phone=dto.phone,
            service=dto.service,
            message=dto.message,
            status=dto.status,
        )
        return LeadResponseDTO.from_model(updated)

    def delete_lead(self, lead_id: uuid.UUID) -> None:
        lead = self._repo.get_by_id(lead_id)
        if not lead:
            raise NotFoundException(f"Lead '{lead_id}' not found.")
        self._repo.delete(lead)
