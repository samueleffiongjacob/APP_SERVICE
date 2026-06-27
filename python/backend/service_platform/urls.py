from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
import django


def health_check(request):
    from django.db import connection
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    status = 200 if db_ok else 503
    return JsonResponse(
        {"status": "ok" if db_ok else "degraded", "django": django.__version__, "db": db_ok},
        status=status,
    )


urlpatterns = [
    path("admin/",       admin.site.urls),
    path("api/health/",  health_check, name="health-check"),
    path("api/health",  health_check, name="health-check"),
    path("api/",         include("users.urls")),
    path("api/",         include("leads.urls")),
]
