from typing import Optional

from pydantic import BaseModel


class UserOut(BaseModel):
    """El usuario tal y como sale por la API.

    Los campos van enumerados uno a uno y no con un `from_attributes` sobre el
    modelo entero: la tabla `users` guarda `hashed_password`, y una lista
    implícita lo publicaría a cualquiera con un token válido.
    """

    id: int
    username: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_superuser: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str
