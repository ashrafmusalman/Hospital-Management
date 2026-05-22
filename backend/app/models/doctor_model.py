from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Text
from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    __table_args__ = (
        UniqueConstraint("name", "hospital_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    experience = Column(Integer)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    consultation_fee = Column(Integer)

    image = Column(String, nullable=True)
    description = Column(Text, nullable=True)