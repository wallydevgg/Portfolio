"""GET /users/me — quién es el usuario del token.

El dashboard lo necesita para poner un nombre en la cabecera en vez del id
numérico que venía sacando del claim `sub`.

Lo que más importa aquí no es que devuelva el usuario, sino que devuelva solo
lo que debe: el modelo User tiene `hashed_password`, y un response_model mal
puesto lo publicaría a cualquiera con un token válido.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.config import settings
from core.database import get_db
from core.security import create_access_token, get_password_hash
from domains.users.models import User
from domains.users.router import router as users_router


@pytest.fixture()
def users_client(db_session):
    # El cliente de conftest solo monta el router del blog.
    app = FastAPI()
    app.include_router(users_router, prefix=settings.API_V1_STR)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


def _make_user(db_session, **overrides):
    fields = dict(
        username="wallydev",
        email="admin@example.com",
        display_name="Waldir",
        hashed_password=get_password_hash("irrelevant"),
        is_active=True,
        is_superuser=True,
    )
    fields.update(overrides)
    user = User(**fields)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_requires_a_token(users_client):
    assert users_client.get(f"{settings.API_V1_STR}/users/me").status_code == 401


def test_rejects_a_token_that_does_not_match_any_user(users_client):
    headers = {"Authorization": f"Bearer {create_access_token(9999)}"}

    response = users_client.get(f"{settings.API_V1_STR}/users/me", headers=headers)

    assert response.status_code == 401


def test_returns_the_user_behind_the_token(users_client, db_session):
    user = _make_user(db_session)
    headers = {"Authorization": f"Bearer {create_access_token(user.id)}"}

    response = users_client.get(f"{settings.API_V1_STR}/users/me", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == user.id
    assert body["username"] == "wallydev"
    assert body["display_name"] == "Waldir"
    assert body["email"] == "admin@example.com"


def test_never_exposes_the_password_hash(users_client, db_session):
    user = _make_user(db_session)
    headers = {"Authorization": f"Bearer {create_access_token(user.id)}"}

    body = users_client.get(f"{settings.API_V1_STR}/users/me", headers=headers).json()

    assert "hashed_password" not in body
    assert "password" not in body


def test_display_name_may_be_absent(users_client, db_session):
    """La columna es nullable y el frontend cae a `username` cuando no está."""
    user = _make_user(db_session, display_name=None)
    headers = {"Authorization": f"Bearer {create_access_token(user.id)}"}

    body = users_client.get(f"{settings.API_V1_STR}/users/me", headers=headers).json()

    assert body["display_name"] is None
    assert body["username"] == "wallydev"


def test_an_inactive_user_cannot_read_their_own_profile(users_client, db_session):
    user = _make_user(db_session, is_active=False)
    headers = {"Authorization": f"Bearer {create_access_token(user.id)}"}

    response = users_client.get(f"{settings.API_V1_STR}/users/me", headers=headers)

    assert response.status_code == 401
