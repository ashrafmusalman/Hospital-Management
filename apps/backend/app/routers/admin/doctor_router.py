from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)

import os
import re
import shutil

from app.dependencies.role_dependency import admin_required
from app.dependencies.doctor_dependency import get_doctor_service

from app.services.doctor_service import DoctorService
from app.schemas.doctor_schema import DoctorCreate, DoctorResponse


router = APIRouter(
    prefix="/admin/doctors",
    tags=["Admin - Doctors"]
)


@router.post("/create", response_model=DoctorResponse)
def create_doctor(

    name: str = Form(...),
    specialization: str = Form(...),
    description: str = Form(None),

    experience: int = Form(None),
    hospital_id: int = Form(None),
    consultation_fee: int = Form(None),

    image: UploadFile = File(None),

    admin=Depends(admin_required),
    doctor_service: DoctorService = Depends(get_doctor_service)
):

    image_path = None

    if image:

        os.makedirs("uploads/doctors", exist_ok=True)

        # Sanitize filename — replace spaces and special chars with underscore
        safe_filename = re.sub(r"[^\w\-.]", "_", image.filename)
        image_path = f"uploads/doctors/{safe_filename}"

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    data = DoctorCreate(
        name=name,
        specialization=specialization,
        description=description,
        experience=experience,
        hospital_id=hospital_id,
        consultation_fee=consultation_fee,
        image=image_path
    )

    return doctor_service.create_doctor(data)


@router.get("/list_doctors", response_model=list[DoctorResponse])
def list_doctors(
    doctor_service: DoctorService = Depends(get_doctor_service)
):
    return doctor_service.list_doctors()


@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    admin=Depends(admin_required),
    doctor_service: DoctorService = Depends(get_doctor_service)
):
    return doctor_service.get_doctor(doctor_id)


@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    data: DoctorCreate,
    admin=Depends(admin_required),
    doctor_service: DoctorService = Depends(get_doctor_service)
):
    return doctor_service.update_doctor(doctor_id, data)


@router.delete("/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    admin=Depends(admin_required),
    doctor_service: DoctorService = Depends(get_doctor_service)
):
    doctor_service.delete_doctor(doctor_id)
    return {"detail": "deleted"}