from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .schemas import Token, UserOut
from core.security import create_access_token, get_current_user, verify_password
from core.database import get_db
from core.images import build_image_key, validate_image_contents, validate_image_type
from core.storage import delete_file, upload_file
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


@router.get("/users/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)) -> Any:
    """Quién es el dueño del token.

    El dashboard lo usa para poner un nombre en la cabecera. Antes sacaba la
    inicial del claim `sub`, que es el id numérico, así que el avatar mostraba
    un dígito.
    """
    return current_user


def _object_key(url: str) -> str:
    """Clave del objeto a partir de su URL pública.

    upload_file devuelve `{MINIO_PUBLIC_URL}/{bucket}/{key}`, así que la clave
    es lo que va detrás del nombre del bucket. Se busca el prefijo en vez de
    partir por barras porque tanto la URL pública como la clave llevan las
    suyas.
    """
    marker = "/avatars/"
    index = url.find(marker)
    return url[index + 1:] if index != -1 else ""


@router.post("/users/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Sube la foto de perfil del admin.

    Misma validación que las imágenes del blog, ahora compartida en
    core/images.py: tipo declarado, tamaño y firma de bytes.
    """
    validate_image_type(file.content_type)

    contents = await file.read()
    validate_image_contents(file.content_type, contents)

    key = build_image_key("avatars", file.content_type)

    try:
        url = upload_file(contents, key, content_type=file.content_type)
    except Exception:
        # Sin tocar la columna: una URL apuntando a un objeto que no llegó a
        # existir deja el avatar roto y sin forma de arreglarlo desde la interfaz.
        raise HTTPException(status_code=502, detail="Could not store the image")

    previous = current_user.avatar_url
    current_user.avatar_url = url
    db.commit()
    db.refresh(current_user)

    # El objeto viejo se borra después de guardar el nuevo: si se hiciera antes
    # y el commit fallara, quedaría un avatar apuntando a un archivo borrado.
    if previous:
        delete_file(_object_key(previous))

    return current_user


@router.delete("/users/me/avatar", response_model=UserOut)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Quita la foto de perfil. Sin foto previa no es un error, es un no-op."""
    previous = current_user.avatar_url
    if not previous:
        return current_user

    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)

    delete_file(_object_key(previous))
    return current_user
