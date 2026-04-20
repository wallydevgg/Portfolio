from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from .schemas import Token, LoginRequest
from core.security import create_access_token, verify_password
from core.config import settings

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    if form_data.username != settings.ADMIN_USERNAME or not verify_password(form_data.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )

    return {
        "access_token": create_access_token(subject=settings.ADMIN_USERNAME),
        "token_type": "bearer"
    }
