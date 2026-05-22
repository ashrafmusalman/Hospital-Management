from sqlalchemy.orm import Session
from app.models.user_model import User


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str):

        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, name: str, email: str, password: str, phone: str,role="patient"):

        new_user = User(
            name=name,
            email=email,
            password=password,
            phone=phone,
            role=role
        )

        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)

        return new_user
    
    
    def getUserById(self,id:int):
        return self.db.query(User).filter(User.id==id).first() ## if match found return that else return None , that is it return somehitng so no try catch needed
    
    
    def update_profile(self, user: User, data):
        update_data = data.dict(exclude_unset=True)
        for field,value in update_data.items():
             setattr(user,field,value)
             
        self.db.commit()
        self.db.refresh(user)
        return user
    
    
    