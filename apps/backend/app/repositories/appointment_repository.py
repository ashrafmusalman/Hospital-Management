from sqlalchemy.orm import Session
from app.models.appointment_model import Appointment
from app.models.user_model import User
from app.models.doctor_model import Doctor


class AppointmentRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_appointment(self, patient_id: int, doctor_id: int, appointment_time):
        appt = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_time=appointment_time,
            status="booked",
        )
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)
        return appt

    def get_by_patient(self, patient_id: int):
        return (
            self.db.query(Appointment)
            .filter(Appointment.patient_id == patient_id)
            .all()
        )

    def get_by_doctor_and_time(self, doctor_id: int, time):
        return (
            self.db.query(Appointment)
            .filter(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_time == time,
                Appointment.status == "booked",
            )
            .first()
        )

    def cancel_appointment_by_id(self, appointment_id: int):
        appointment = (
            self.db.query(Appointment)
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if not appointment:
            return None
        appointment.status = "cancelled"
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def get_by_id(self, appointment_id: int):
        return (
            self.db.query(Appointment)
            .filter(Appointment.id == appointment_id)
            .first()
        )

    def get_all(self):
        return (
            self.db.query(
                Appointment.id.label("id"),
                Appointment.patient_id.label("patient_id"),
                User.name.label("patient_name"),
                Appointment.doctor_id.label("doctor_id"),
                Doctor.name.label("doctor_name"),
                Doctor.specialization.label("doctor_specialization"),
                Appointment.appointment_time.label("appointment_time"),
                Appointment.status.label("status"),
            )
            .join(User, User.id == Appointment.patient_id)
            .join(Doctor, Doctor.id == Appointment.doctor_id)
            .order_by(Appointment.appointment_time.desc())
            .all()
        )

    def get_detail_by_id(self, appointment_id: int):
        return (
            self.db.query(
                Appointment.id.label("id"),
                Appointment.patient_id.label("patient_id"),
                User.name.label("patient_name"),
                Appointment.doctor_id.label("doctor_id"),
                Doctor.name.label("doctor_name"),
                Doctor.specialization.label("doctor_specialization"),
                Doctor.consultation_fee.label("doctor_charge"),
                Appointment.appointment_time.label("appointment_time"),
                Appointment.status.label("status"),
            )
            .join(User, User.id == Appointment.patient_id)
            .join(Doctor, Doctor.id == Appointment.doctor_id)
            .filter(Appointment.id == appointment_id)
            .first()
        )

    def mark_completed(self, appointment_id: int):
        appointment = (
            self.db.query(Appointment)
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if not appointment:
            return None
        appointment.status = "completed"
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def get_weekly_counts(self):
        from sqlalchemy import func, cast, Date
        from datetime import datetime, timedelta, timezone

        today = datetime.now(timezone.utc).date()
        seven_days_ago = today - timedelta(days=6)

        rows = (
            self.db.query(
                cast(func.date_trunc('day', Appointment.appointment_time), Date).label("day"),
                Appointment.status.label("status"),
                func.count(Appointment.id).label("count"),
            )
            .filter(
                func.date_trunc('day', Appointment.appointment_time) >= str(seven_days_ago)
            )
            .group_by("day", "status")
            .order_by("day")
            .all()
        )
        return rows