from django.urls import path
from leads.controllers import LeadController, LeadDetailController

urlpatterns = [
    # ── /api/leads (internal name) ────────────────────────────────────────────
    path("leads",    LeadController.as_view(), name="leads-list-create"),
    path("leads/",   LeadController.as_view()),

    path("leads/<str:lead_id>",  LeadDetailController.as_view(), name="leads-detail"),
    path("leads/<str:lead_id>/", LeadDetailController.as_view()),

    # ── /api/requests (frontend alias) ───────────────────────────────────────
    path("requests",    LeadController.as_view(), name="requests-list-create"),
    path("requests/",   LeadController.as_view()),

    path("requests/<str:lead_id>",  LeadDetailController.as_view(), name="requests-detail"),
    path("requests/<str:lead_id>/", LeadDetailController.as_view()),
]
