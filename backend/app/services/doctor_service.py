from fastapi import HTTPException
from app.repositories.doctor_repository import DoctorRepository


class DoctorService:

    def __init__(self, doctor_repo: DoctorRepository):
        self.doctor_repo = doctor_repo

    def create_doctor(self, data):

        existing = self.doctor_repo.get_doctor_by_name_and_hospital(
            data.name, data.hospital_id
        )

        if existing:
            raise HTTPException(status_code=400, detail="Doctor already exists in this hospital")

        return self.doctor_repo.create_doctor(
            name=data.name,
            specialization=data.specialization,
            experience=data.experience, 
            hospital_id=data.hospital_id,
            consultation_fee=data.consultation_fee,
            image=data.image,
            description=data.description
        )


    def list_doctors(self, skip=0, limit=100):
        return self.doctor_repo.get_all_doctors(skip, limit)


    def get_doctor(self, doctor_id: int):

        doctor = self.doctor_repo.get_doctor_by_id(doctor_id)

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        return doctor


    def update_doctor(self, doctor_id: int, data):

        doctor = self.doctor_repo.get_doctor_by_id(doctor_id)

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        return self.doctor_repo.update_doctor(doctor, data)


    def delete_doctor(self, doctor_id: int):

        doctor = self.doctor_repo.get_doctor_by_id(doctor_id)

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        return self.doctor_repo.delete_doctor(doctor)