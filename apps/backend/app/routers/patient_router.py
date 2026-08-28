from fastapi import APIRouter, Depends

from app.dependencies.auth_dependency import getCurrentUser
from app.dependencies.doctor_dependency import get_doctor_service
from app.dependencies.appointment_dependency import get_appointment_service

from app.services.doctor_service import DoctorService
from app.services.appointment_service import AppointmentService

from app.schemas.doctor_schema import DoctorResponse
from app.schemas.appointment_schema import AppointmentCreate, AppointmentResponse


router = APIRouter(prefix="/patient", tags=["Patient"])


@router.get("/doctors", response_model=list[DoctorResponse])
def list_doctors(
    doctor_service: DoctorService = Depends(get_doctor_service)
):

    return doctor_service.list_doctors()


@router.post("/appointments/book", response_model=AppointmentResponse)
def book_appointment(
    data: AppointmentCreate,
    current_user = Depends(getCurrentUser),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):

    return appointment_service.book_appointment(current_user.id, data)


@router.get("/appointments", response_model=list[AppointmentResponse])
def my_appointments(
    current_user = Depends(getCurrentUser),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):

    return appointment_service.get_my_appointments(current_user.id)



@router.put("/appointments/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    current_user = Depends(getCurrentUser),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    return appointment_service.cancel_appointment_by_patient_id(
        appointment_id,
        current_user.id
    )