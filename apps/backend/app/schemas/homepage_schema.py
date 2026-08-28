from pydantic import BaseModel
from typing import List


class StatItem(BaseModel):
    icon: str
    num: str
    label: str
    sub: str


class FeatureCard(BaseModel):
    icon: str
    title: str
    desc: str


class SpecialityCard(BaseModel):
    icon: str
    name: str
    desc: str


class HomepageContentSchema(BaseModel):
    stats: List[StatItem]
    about_intro: str
    feature_cards: List[FeatureCard]
    trust_badges: List[str]
    specialities: List[SpecialityCard]

    class Config:
        from_attributes = True
