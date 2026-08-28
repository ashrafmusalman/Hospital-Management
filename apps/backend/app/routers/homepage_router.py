from fastapi import APIRouter, Depends

from app.dependencies.role_dependency import admin_required
from app.dependencies.homepage_dependency import get_homepage_service

from app.services.homepage_service import HomepageService
from app.schemas.homepage_schema import HomepageContentSchema


router = APIRouter(tags=["Homepage Content"])


@router.get("/settings/homepage", response_model=HomepageContentSchema)
def get_homepage_content(
    homepage_service: HomepageService = Depends(get_homepage_service)
):
    return homepage_service.get_content()


@router.put("/admin/settings/homepage", response_model=HomepageContentSchema)
def update_homepage_content(
    data: HomepageContentSchema,
    admin=Depends(admin_required),
    homepage_service: HomepageService = Depends(get_homepage_service)
):
    return homepage_service.update_content(data)
