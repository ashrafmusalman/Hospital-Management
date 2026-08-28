from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.homepage_repository import HomepageRepository
from app.services.homepage_service import HomepageService


def get_homepage_service(db: Session = Depends(get_db)):

    homepage_repo = HomepageRepository(db)

    return HomepageService(homepage_repo)
