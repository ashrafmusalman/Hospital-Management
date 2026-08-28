from fastapi import HTTPException
from app.repositories.user_repository import UserRepository
from app.utils.security import hash_password, verify_password, create_access_token


class AuthService:

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo


    def register_user(self, user_data):

        # check if email already exists
        existing_user = self.user_repo.get_user_by_email(user_data.email)

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # hash password
        hashed_password = hash_password(user_data.password)

        # create user
        return self.user_repo.create_user(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            phone=user_data.phone,
            role="patient"
        )


    def login_user(self, user_data):

        # check user exists
        user = self.user_repo.get_user_by_email(user_data.email)

        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # check password
        if not verify_password(user_data.password, user.password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # create token
        token = create_access_token({
            "user_id": user.id,
            "role": user.role
        })

        return token


    def getUserByEmail(self, email: str):
        return self.user_repo.get_user_by_email(email)


    def getUserById(self, id: int):
        return self.user_repo.getUserById(id)


    def update_profile(self, id: int, data):

        # check user exists
        user = self.user_repo.getUserById(id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return self.user_repo.update_profile(user, data)