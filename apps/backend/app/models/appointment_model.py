# app/models/appointment_model.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    appointment_time = Column(DateTime, nullable=False)
    status = Column(String, default="booked")  # booked, cancelled, completed
    
    ### this table show that a user can see many doctors and a doctor can have many patients so it is many to many 
    # relation