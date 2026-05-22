from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.doctor_repository import DoctorRepository
from app.services.doctor_service import DoctorService


def get_doctor_service(db: Session = Depends(get_db)):

    doctor_repo = DoctorRepository(db)

    return DoctorService(doctor_repo)