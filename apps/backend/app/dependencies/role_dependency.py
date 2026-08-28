from fastapi import Depends, HTTPException
from app.dependencies.auth_dependency import getCurrentUser


def admin_required(current_user = Depends(getCurrentUser)):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user