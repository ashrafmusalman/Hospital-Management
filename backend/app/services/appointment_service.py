from fastapi import HTTPException
from app.repositories.appointment_repository import AppointmentRepository


class AppointmentService:

    def __init__(self, appointment_repo: AppointmentRepository):
        self.appointment_repo = appointment_repo

    # ── helpers ───────────────────────────────────────────────────────────

    @staticmethod
    def _row_to_dict(row):
        """
        Convert a SQLAlchemy Row (from a labeled-column / join query) to a
        plain dict.  Works for both SQLAlchemy 1.4 and 2.x.
        """
        # Row._mapping is available in SA 1.4+; fall back to _asdict() for
        # older versions.
        try:
            return dict(row._mapping)
        except AttributeError:
            return row._asdict()

    @staticmethod
    def _orm_to_dict(obj):
        """
        Convert a plain ORM model instance to a dict using the table columns.
        Excludes SQLAlchemy internal state.
        """
        return {
            col.name: getattr(obj, col.name)
            for col in obj.__table__.columns
        }

    # ── patient-facing methods ────────────────────────────────────────────

    def book_appointment(self, patient_id: int, data):
        conflict = self.appointment_repo.get_by_doctor_and_time(
            data.doctor_id,
            data.appointment_time,
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Slot already booked")

        return self.appointment_repo.create_appointment(
            patient_id=patient_id,
            doctor_id=data.doctor_id,
            appointment_time=data.appointment_time,
        )

    def get_my_appointments(self, patient_id: int):
        return self.appointment_repo.get_by_patient(patient_id)

    def cancel_appointment_by_patient_id(self, appointment_id: int, patient_id: int):
        appointment = self.appointment_repo.get_by_id(appointment_id)

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appointment.patient_id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if appointment.status == "cancelled":
            raise HTTPException(status_code=400, detail="Already cancelled")
        if appointment.status == "completed":
            raise HTTPException(status_code=400, detail="Cannot cancel completed appointment")

        return self.appointment_repo.cancel_appointment_by_id(appointment_id)

    # ── admin methods ─────────────────────────────────────────────────────

    def get_appointments_summary(self):
        appointments = self.appointment_repo.get_all()

        booked    = sum(1 for a in appointments if a.status == "booked")
        completed = sum(1 for a in appointments if a.status == "completed")
        cancelled = sum(1 for a in appointments if a.status == "cancelled")

        first_booked_id = None
        for a in sorted(appointments, key=lambda x: x.appointment_time or "", reverse=True):
            if a.status == "booked":
                first_booked_id = a.id
                break

        return {
            "appointments":    booked,
            "completed":       completed,
            "cancelled":       cancelled,
            "booked":          booked,
            "first_booked_id": first_booked_id,
        }

    def list_appointments(self):
        """
        Returns all appointments (with patient/doctor names) as a list of
        plain dicts so FastAPI can serialize them without a response_model.
        get_all() now returns labeled Row objects, so use _row_to_dict.
        """
        rows = self.appointment_repo.get_all()   # list of labeled Row objects
        return [self._row_to_dict(r) for r in rows]

    def get_appointment_detail(self, appointment_id: int):
        """
        Returns a single appointment with joined patient/doctor data as a
        plain dict so FastAPI can serialize the labeled-column Row.
        """
        row = self.appointment_repo.get_detail_by_id(appointment_id)

        if not row:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # Row → dict so FastAPI's JSON encoder can handle it
        return self._row_to_dict(row)

    def mark_as_completed(self, appointment_id: int):
        """
        Mark a booked appointment as completed.
        Raises 404 if not found, 400 if already cancelled or completed.
        """
        appointment = self.appointment_repo.get_by_id(appointment_id)

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appointment.status == "completed":
            raise HTTPException(status_code=400, detail="Already completed")
        if appointment.status == "cancelled":
            raise HTTPException(status_code=400, detail="Cannot complete a cancelled appointment")

        updated = self.appointment_repo.mark_completed(appointment_id)
        return self._orm_to_dict(updated)