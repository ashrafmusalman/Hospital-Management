# app/schemas/doctor_schema.py
from pydantic import BaseModel
from typing import Optional

class DoctorCreate(BaseModel):
    name: str
    image: Optional[str] = None
    specialization: str
    description: Optional[str] = None

    experience: Optional[int] = None
    hospital_id: Optional[int] = None
    consultation_fee: Optional[int] = None
    

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    experience: Optional[int]
    hospital_id: Optional[int]
    consultation_fee: Optional[int]
    image: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True