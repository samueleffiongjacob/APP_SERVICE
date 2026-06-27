import uuid
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from core.response import ApiResponse
from leads.dtos import CreateLeadDTO, UpdateLeadDTO
from leads.services import LeadService


class LeadController(APIView):
    """
    POST   /api/leads   — submit a lead (public, no auth required)
    GET    /api/leads   — list all leads (auth required)
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = LeadService()

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_authenticators(self):
        if self.request.method == "POST":
            return []
        return super().get_authenticators()

    def post(self, request):
        """POST /api/leads — anyone can submit a lead enquiry."""
        body = request.data
        dto = CreateLeadDTO(
            name=body.get("name", ""),
            email=body.get("email", ""),
            phone=body.get("phone", ""),
            service=body.get("service", ""),
            message=body.get("message", ""),
        )
        result = self._service.create_lead(dto)
        return ApiResponse.created(
            data=result.to_dict(),
            message="Lead submitted successfully.",
        )

    def get(self, request):
        """GET /api/leads — retrieve all leads (auth required)."""
        leads = self._service.get_all_leads()
        return ApiResponse.success(
            data=[l.to_dict() for l in leads],
            message="Leads retrieved successfully.",
        )


class LeadDetailController(APIView):
    """
    GET    /api/leads/<id>   — get lead by id  (auth required)
    PATCH  /api/leads/<id>   — update lead     (auth required)
    DELETE /api/leads/<id>   — delete lead     (auth required)
    """
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._service = LeadService()

    def get(self, request, lead_id: str):
        result = self._service.get_lead(uuid.UUID(lead_id))
        return ApiResponse.success(data=result.to_dict())

    def patch(self, request, lead_id: str):
        body = request.data
        dto = UpdateLeadDTO(
            name=body.get("name"),
            phone=body.get("phone"),
            service=body.get("service"),
            message=body.get("message"),
            status=body.get("status"),
        )
        result = self._service.update_lead(uuid.UUID(lead_id), dto)
        return ApiResponse.success(data=result.to_dict(), message="Lead updated successfully.")

    def delete(self, request, lead_id: str):
        self._service.delete_lead(uuid.UUID(lead_id))
        return ApiResponse.no_content()
