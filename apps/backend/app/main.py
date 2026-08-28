import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.database import engine, Base

from app.models.doctor_model import Doctor
from app.models.hospital_model import Hospital
from app.models.homepage_content_model import HomepageContent

from app.routers import patient_router
from app.routers.admin import doctor_router
from app.routers.admin import appointment_router
from app.routers import auth_router
from app.routers import homepage_router

from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

app = FastAPI(title="Hospital API")

# ── CORS ───────────────────────────────────────────────────────
# Local dev origins kept for development.
# In Kubernetes, traffic comes from ingress — not directly from
# browser to API, so the K8s service URLs are added here too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://hospital.local",
        "http://admin.hospital.local",
        "http://api.hospital.local",
        "http://44.205.19.225.nip.io",
        "http://admin.44.205.19.225.nip.io",
        "http://api.44.205.19.225.nip.io",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files ───────────────────────────────────────────────
# NOTE: In Kubernetes with readOnlyRootFilesystem: true,
# this directory must exist inside the container image or
# be mounted as an emptyDir volume — it cannot be created at runtime.
os.makedirs("uploads/doctors", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Database ───────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Routers ────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(patient_router.router)
app.include_router(doctor_router.router)
app.include_router(appointment_router.router)
app.include_router(homepage_router.router)

# ── Prometheus Metrics ─────────────────────────────────────────
# Exposes /metrics endpoint automatically.
# Already picked up by your monitoring/servicemonitor.yaml
Instrumentator().instrument(app).expose(app)


# ── Health Check ───────────────────────────────────────────────
# Used by Kubernetes startupProbe, readinessProbe, livenessProbe.
# MUST return HTTP 200 for pod to receive traffic.
# Uses synchronous SQLAlchemy (matches your existing engine setup).
@app.get("/health", tags=["health"])
def health_check():
    try:
        # Ping DB — verifies connection pool is alive
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected"
        }

    except Exception as e:
        # HTTP 503 → readiness probe fails
        # pod removed from load balancer until DB recovers
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "database": "disconnected",
                "detail": str(e)
            }
        )