import uuid
from django.db import models


class LeadStatus(models.TextChoices):
    NEW        = "new",        "New"
    CONTACTED  = "contacted",  "Contacted"
    QUALIFIED  = "qualified",  "Qualified"
    CONVERTED  = "converted",  "Converted"
    CLOSED     = "closed",     "Closed"


class Lead(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name       = models.CharField(max_length=150)
    email      = models.EmailField(unique=True)
    phone      = models.CharField(max_length=30, blank=True, default="")
    service    = models.CharField(max_length=150, blank=True, default="")
    message    = models.TextField(blank=True, default="")
    status     = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leads"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"
