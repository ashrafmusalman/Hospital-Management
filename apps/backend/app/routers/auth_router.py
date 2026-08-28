from fastapi import APIRouter, Depends

from app.schemas.user_schema import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserProfileUpdate
)

from app.dependencies.auth_dependency import get_auth_service, getCurrentUser
from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")

def register(
    user: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):

    new_user = auth_service.register_user(user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id
    }


@router.post("/login")
def login(
    user: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):

    token = auth_service.login_user(user)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/currentUser", response_model=UserResponse)
def get_current_user_profile(
    current_user = Depends(getCurrentUser)
):
    return current_user


@router.put("/updateProfile", response_model=UserResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user = Depends(getCurrentUser),
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.update_profile(current_user.id, data)


  
    
    
    