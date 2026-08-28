from sqlalchemy import Column, Integer, Text, JSON
from app.database import Base


class HomepageContent(Base):
    __tablename__ = "homepage_content"

    id = Column(Integer, primary_key=True)
    stats = Column(JSON, nullable=False)
    about_intro = Column(Text, nullable=False)
    feature_cards = Column(JSON, nullable=False)
    trust_badges = Column(JSON, nullable=False)
    specialities = Column(JSON, nullable=False)
