from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=5)
    phone: str = Field(pattern=r"^[6-9][0-9]{9}$")  # Indian phone validation


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, pattern=r"^[6-9][0-9]{9}$")
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None, max_length=255)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    age: Optional[int]
    gender: Optional[str]
    address: Optional[str]
    role: str

    class Config:
        from_attributes = True