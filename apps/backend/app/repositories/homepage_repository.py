from sqlalchemy.orm import Session
from app.models.homepage_content_model import HomepageContent

DEFAULT_CONTENT = {
    "stats": [
        {"icon": "🧑‍⚕️", "num": "25000+", "label": "Patients Treated", "sub": "Since 2005"},
        {"icon": "👨‍⚕️", "num": "200+", "label": "Specialists", "sub": "Across all depts"},
        {"icon": "🏆", "num": "18+", "label": "Years of Excellence", "sub": "NABH accredited"},
        {"icon": "🏥", "num": "12+", "label": "Operation Theatres", "sub": "State-of-the-art"},
    ],
    "about_intro": "Gujarat's first NABH-accredited private hospital with over 18 years of excellence in patient care.",
    "feature_cards": [
        {"icon": "🏆", "title": "NABH Accredited", "desc": "Nationally accredited for quality and patient safety standards across all our facilities."},
        {"icon": "🤝", "title": "Transparent & Ethical", "desc": "Honest communication, transparent billing, and a patient-first approach in everything we do."},
        {"icon": "⚙️", "title": "Modern Infrastructure", "desc": "State-of-the-art facilities, cutting-edge technology and precision diagnostic equipment."},
    ],
    "trust_badges": ["ISO 9001:2015", "JCI Standards", "NABH Certified", "WHO Guidelines"],
    "specialities": [
        {"icon": "❤️", "name": "Cardiac Sciences", "desc": "Heart attack care, angioplasty & bypass surgery."},
        {"icon": "🍽️", "name": "Gastro Sciences", "desc": "Digestive disorders, endoscopy & liver care."},
        {"icon": "🧠", "name": "Neuro Sciences", "desc": "Stroke, epilepsy, brain & spine treatment."},
        {"icon": "🎗️", "name": "Onco Sciences", "desc": "Medical, surgical & radiation oncology."},
        {"icon": "🦴", "name": "Orthopaedics & Trauma", "desc": "Joint replacement, fractures & sports injuries."},
        {"icon": "🫘", "name": "Renal Sciences", "desc": "Kidney disease, dialysis & transplantation."},
        {"icon": "🤖", "name": "Robotic Surgery", "desc": "Minimally invasive precision robotic procedures."},
        {"icon": "🫀", "name": "Solid Organ Transplantation", "desc": "Kidney, liver & heart transplant expertise."},
    ],
}


class HomepageRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_content(self):
        row = self.db.query(HomepageContent).filter(HomepageContent.id == 1).first()

        if not row:
            row = HomepageContent(id=1, **DEFAULT_CONTENT)
            self.db.add(row)
            self.db.commit()
            self.db.refresh(row)

        return row

    def update_content(self, data: dict):
        row = self.get_content()

        for field, value in data.items():
            setattr(row, field, value)

        self.db.commit()
        self.db.refresh(row)

        return row
