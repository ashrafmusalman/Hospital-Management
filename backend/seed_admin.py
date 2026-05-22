"""One-time script to create an admin user in the users table.

Run from project root:
  python -m backend.seed_admin

It will:
- create (or update) a user with role='admin'
- hash the password using backend/app/utils/security.py

Requirements:
- Backend must be able to connect to your Postgres (DB_* env + .env.local)
"""

# NOTE: This script is executed as a module (python -m backend.seed_admin),
# so imports like `app.*` will work correctly.


from __future__ import annotations

import os
from dotenv import load_dotenv

from app.database import engine, Base
from app.models.user_model import User
from app.utils.security import hash_password

from sqlalchemy.orm import Session


def main():
    # Load .env.local (same as backend/app/config.py)
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env.local")
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path=dotenv_path)

    # Import config after loading env
    from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY
    from app.config import DATABASE_URL

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@hospital.com")
    admin_name = os.environ.get("ADMIN_NAME", "Admin")
    admin_phone = os.environ.get("ADMIN_PHONE", "6000000000")
    admin_password_plain = os.environ.get("ADMIN_PASSWORD", "admin123")

    with Session(engine) as db:
        user = db.query(User).filter(User.email == admin_email).first()

        if not user:
            user = User(
                name=admin_name,
                email=admin_email,
                password=hash_password(admin_password_plain),
                phone=admin_phone,
                role="admin",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created admin: {user.email} (id={user.id})")
        else:
            # Update to ensure role is admin and password matches.
            user.name = admin_name
            user.phone = admin_phone
            user.password = hash_password(admin_password_plain)
            user.role = "admin"
            db.commit()
            db.refresh(user)
            print(f"Updated admin: {user.email} (id={user.id})")


if __name__ == "__main__":
    main()

