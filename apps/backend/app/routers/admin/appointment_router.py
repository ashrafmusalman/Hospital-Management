from typing import Any

from fastapi import APIRouter, Depends

from app.dependencies.appointment_dependency import get_appointment_service
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/admin/appointments", tags=["admin_appointments"])


@router.get("/summary")
def appointment_summary(
    appointment_service: AppointmentService = Depends(get_appointment_service),
) -> Any:
    return appointment_service.get_appointments_summary()


@router.get("/weekly")
def appointment_weekly(
    appointment_service: AppointmentService = Depends(get_appointment_service),
) -> Any:
    """Returns last 7 days appointment counts grouped by status."""
    return appointment_service.get_weekly_summary()


@router.get("/list")
def appointment_list(
    appointment_service: AppointmentService = Depends(get_appointment_service),
) -> Any:
    return appointment_service.list_appointments()


@router.get("/{appointment_id}")
def appointment_detail(
    appointment_id: int,
    appointment_service: AppointmentService = Depends(get_appointment_service),
) -> Any:
    return appointment_service.get_appointment_detail(appointment_id)


@router.put("/{appointment_id}/complete")
def mark_completed(
    appointment_id: int,
    appointment_service: AppointmentService = Depends(get_appointment_service),
) -> Any:
    """Mark a booked appointment as completed."""
    return appointment_service.mark_as_completed(appointment_id)