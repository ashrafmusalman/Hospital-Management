from sqlalchemy.orm import Session
from app.models.doctor_model import Doctor


class DoctorRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_doctor( self,
    name: str,
    specialization: str,
    experience: int,
    hospital_id: int,
    consultation_fee: int,
    image: str = None,
    description: str = None):

        doctor = Doctor(
            name=name,
            specialization=specialization,
            experience=experience,
            hospital_id=hospital_id,
            consultation_fee=consultation_fee,
            image=image,
            description=description
            
        )

        self.db.add(doctor)
        self.db.commit()
        self.db.refresh(doctor)

        return doctor


    def get_all_doctors(self, skip: int = 0, limit: int = 100):
        return self.db.query(Doctor).offset(skip).limit(limit).all()


    def get_doctor_by_id(self, doctor_id: int):
        return self.db.query(Doctor).filter(Doctor.id == doctor_id).first()


    def update_doctor(self, doctor: Doctor, data):

        update_data = data.dict(exclude_unset=True)

        for field, value in update_data.items():
            setattr(doctor, field, value)

        self.db.commit()
        self.db.refresh(doctor)

        return doctor


    def delete_doctor(self, doctor: Doctor):

        self.db.delete(doctor)
        self.db.commit()

        return True
    
    
    
    
    
    def get_doctor_by_name_and_hospital(self, name: str, hospital_id: int):
        return (
            self.db.query(Doctor)
            .filter(Doctor.name == name, Doctor.hospital_id == hospital_id)
            .first()
    )