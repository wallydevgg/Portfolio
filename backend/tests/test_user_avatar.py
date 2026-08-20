"""Foto de perfil del admin: POST y DELETE /users/me/avatar.

La validación es la misma que ya usaba el blog —tipo declarado, tamaño y firma
de bytes— y ahora vive en core/images.py para no tenerla escrita dos veces. La
tercera comprobación es la que importa: el content-type lo pone el cliente, así
que sin mirar los bytes de verdad cualquier cosa renombrada a .png acabaría en
un bucket público.
"""

import io

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.config import settings
from core.database import get_db
from core.security import create_access_token, get_password_hash
from domains.users import router as users_router_module
from domains.users.models import User
from domains.users.router import router as users_router


PNG = b"\x89PNG\r\n\x1a\n" + b"resto del archivo"
JPEG = b"\xff\xd8\xff" + b"resto del archivo"
AVATAR_URL = f"{settings.API_V1_STR}/users/me/avatar"


@pytest.fixture()
def stored(monkeypatch):
    """Sustituye MinIO. Guarda lo subido para poder comprobarlo."""
    calls = {"uploaded": [], "deleted": []}

    def fake_upload(data, key, content_type="image/jpeg"):
        calls["uploaded"].append({"data": data, "key": key, "content_type": content_type})
        return f"https://cdn.example.test/{key}"

    def fake_delete(key):
        calls["deleted"].append(key)
        return True

    monkeypatch.setattr(users_router_module, "upload_file", fake_upload)
    monkeypatch.setattr(users_router_module, "delete_file", fake_delete)
    return calls


@pytest.fixture()
def users_client(db_session):
    app = FastAPI()
    app.include_router(users_router, prefix=settings.API_V1_STR)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture()
def user(db_session):
    user = User(
        username="wallydev",
        email="admin@example.com",
        display_name="Waldir",
        hashed_password=get_password_hash("irrelevant"),
        is_active=True,
        is_superuser=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def auth(user):
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _upload(client, headers, content, filename="foto.png", content_type="image/png"):
    return client.post(
        AVATAR_URL,
        headers=headers,
        files={"file": (filename, io.BytesIO(content), content_type)},
    )


# ── Autenticación ─────────────────────────────────────────────────────────────

def test_upload_requires_a_token(users_client, stored):
    response = _upload(users_client, {}, PNG)
    assert response.status_code == 401
    assert stored["uploaded"] == []


def test_delete_requires_a_token(users_client, stored):
    assert users_client.delete(AVATAR_URL).status_code == 401


# ── Camino feliz ──────────────────────────────────────────────────────────────

def test_upload_stores_the_image_and_saves_the_url(users_client, auth, user, db_session, stored):
    response = _upload(users_client, auth, PNG)

    assert response.status_code == 200
    assert len(stored["uploaded"]) == 1

    key = stored["uploaded"][0]["key"]
    assert stored["uploaded"][0]["data"] == PNG
    assert stored["uploaded"][0]["content_type"] == "image/png"

    db_session.refresh(user)
    assert user.avatar_url == f"https://cdn.example.test/{key}"
    assert response.json()["avatar_url"] == user.avatar_url


def test_the_key_uses_the_validated_type_not_the_filename(users_client, auth, stored):
    """Un nombre de archivo con doble extensión no debe decidir la del objeto."""
    _upload(users_client, auth, PNG, filename="exploit.php.png")

    key = stored["uploaded"][0]["key"]
    assert key.endswith(".png")
    assert "php" not in key
    assert "exploit" not in key


def test_replacing_the_avatar_removes_the_previous_object(users_client, auth, stored):
    _upload(users_client, auth, PNG)
    first_key = stored["uploaded"][0]["key"]

    _upload(users_client, auth, JPEG, filename="otra.jpg", content_type="image/jpeg")

    assert stored["deleted"] == [first_key]


def test_delete_clears_the_column_and_the_object(users_client, auth, user, db_session, stored):
    _upload(users_client, auth, PNG)
    key = stored["uploaded"][0]["key"]

    response = users_client.delete(AVATAR_URL, headers=auth)

    assert response.status_code == 200
    assert stored["deleted"] == [key]
    db_session.refresh(user)
    assert user.avatar_url is None


def test_delete_with_no_avatar_is_not_an_error(users_client, auth, stored):
    assert users_client.delete(AVATAR_URL, headers=auth).status_code == 200
    assert stored["deleted"] == []


# ── Validación ────────────────────────────────────────────────────────────────

def test_rejects_a_type_outside_the_allowlist(users_client, auth, stored):
    response = _upload(
        users_client, auth, b"%PDF-1.4", filename="cv.pdf", content_type="application/pdf"
    )

    assert response.status_code == 400
    assert stored["uploaded"] == []


def test_rejects_svg_even_though_it_is_an_image(users_client, auth, stored):
    """SVG queda fuera a propósito: lleva script y se serviría desde el bucket."""
    response = _upload(
        users_client,
        auth,
        b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        filename="logo.svg",
        content_type="image/svg+xml",
    )

    assert response.status_code == 400
    assert stored["uploaded"] == []


def test_rejects_content_that_does_not_match_its_declared_type(users_client, auth, stored):
    """El caso que la lista blanca sola no cubre: un ejecutable dicho PNG."""
    response = _upload(users_client, auth, b"MZ\x90\x00 binario", filename="x.png")

    assert response.status_code == 400
    assert stored["uploaded"] == []


def test_rejects_an_image_over_the_size_cap(users_client, auth, stored):
    from core.images import MAX_IMAGE_BYTES

    oversized = PNG + b"\x00" * MAX_IMAGE_BYTES

    response = _upload(users_client, auth, oversized)

    assert response.status_code == 413
    assert stored["uploaded"] == []


def test_a_failing_storage_does_not_leave_a_dangling_url(users_client, auth, user, db_session, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("MinIO caído")

    monkeypatch.setattr(users_router_module, "upload_file", boom)

    response = _upload(users_client, auth, PNG)

    assert response.status_code == 502
    db_session.refresh(user)
    assert user.avatar_url is None


# ── El perfil lo publica ──────────────────────────────────────────────────────

def test_users_me_exposes_the_avatar(users_client, auth, stored):
    _upload(users_client, auth, PNG)

    body = users_client.get(f"{settings.API_V1_STR}/users/me", headers=auth).json()

    assert body["avatar_url"].startswith("https://cdn.example.test/")
