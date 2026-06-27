from django.contrib import admin
from leads.models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display  = ("name", "email", "phone", "service", "status", "created_at")
    list_filter   = ("status", "service")
    search_fields = ("name", "email", "phone")
    ordering      = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")
