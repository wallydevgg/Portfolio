from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from .schemas import Token, LoginRequest
from core.security import create_access_token, verify_password

router = APIRouter()

# Hardcoded Admin Credentials for single-user Portfolio
ADMIN_USERNAME = "waliux"
ADMIN_PASSWORD_HASH = "REDACTED" 
# corresponds to password: "REDACTED" (you should change this in env!)

@router.post("/login/access-token", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    if form_data.username != ADMIN_USERNAME or not verify_password(form_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    
    return {
        "access_token": create_access_token(subject=ADMIN_USERNAME),
        "token_type": "bearer"
    }
