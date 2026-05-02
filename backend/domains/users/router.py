from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .schemas import Token
from core.security import create_access_token, verify_password
from core.database import get_db
from domains.users.models import User

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    user = db.query(User).filter(
        or_(User.username == form_data.username, User.email == form_data.username)
    ).first()

    if (
        user is None
        or not user.is_active
        or not user.is_superuser
        or not user.hashed_password
        or not verify_password(form_data.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )

    return {
        "access_token": create_access_token(subject=user.id),
        "token_type": "bearer"
    }
