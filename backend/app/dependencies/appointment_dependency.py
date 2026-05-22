from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.appointment_repository import AppointmentRepository
from app.services.appointment_service import AppointmentService


def get_appointment_service(db: Session = Depends(get_db)):

    appointment_repo = AppointmentRepository(db)

    return AppointmentService(appointment_repo)