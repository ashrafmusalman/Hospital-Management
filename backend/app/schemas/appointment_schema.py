from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from enum import Enum


class AppointmentStatus(str, Enum):
    booked = "booked"
    cancelled = "cancelled"
    completed = "completed"


class AppointmentCreate(BaseModel):
    doctor_id: int = Field(gt=0)
    appointment_time: datetime

    @field_validator("appointment_time")
    @classmethod
    def validate_appointment_time(cls, value):

        # Convert naive datetime to UTC aware datetime
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)

        current_time = datetime.now(timezone.utc)

        if value <= current_time:
            raise ValueError(
                "Appointment time must be in the future"
            )

        return value


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_time: datetime
    status: AppointmentStatus

    class Config:
        from_attributes = True


class AppointmentDetailResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str

    doctor_id: int
    doctor_name: str
    doctor_specialization: str

    appointment_time: datetime
    status: AppointmentStatus

    class Config:
        from_attributes = True
