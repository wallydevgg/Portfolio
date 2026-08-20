"""CV por idioma: /portfolio/cv.

Antes había un solo archivo en una clave fija. Ahora hay uno por idioma y el
sitio público sirve el que corresponde al idioma que eligió el visitante.

Lo que más cuidado pide es el archivo que ya está subido: en producción existe
un CV en la clave antigua y no puede desaparecer porque cambiemos el esquema.
Mientras no haya archivo del idioma pedido, se sigue sirviendo aquel.
"""

import io

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.config import settings
from core.security import create_access_token, get_password_hash
from domains.portfolio import router as portfolio_router_module
from domains.portfolio.router import router as portfolio_router
from domains.users.models import User
from core.database import get_db


PDF = b"%PDF-1.7\n" + b"contenido"
CV_URL = f"{settings.API_V1_STR}/portfolio/cv"


def public_url(key: str) -> str:
    """Cómo compone la URL el endpoint público, desde settings."""
    return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{key}"


@pytest.fixture()
def bucket(monkeypatch):
    """MinIO en memoria: clave -> bytes."""
    files = {}

    def fake_upload(data, key, content_type="application/pdf"):
        files[key] = data
        return f"https://cdn.example.test/{key}"

    def fake_exists(key):
        return key in files

    def fake_delete(key):
        files.pop(key, None)
        return True

    monkeypatch.setattr(portfolio_router_module, "upload_file", fake_upload)
    monkeypatch.setattr(portfolio_router_module, "file_exists", fake_exists)
    monkeypatch.setattr(portfolio_router_module, "delete_file", fake_delete)
    return files


@pytest.fixture()
def client(db_session):
    app = FastAPI()
    app.include_router(portfolio_router, prefix=f"{settings.API_V1_STR}/portfolio")

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture()
def auth(db_session):
    user = User(
        username="wallydev",
        hashed_password=get_password_hash("irrelevant"),
        is_active=True,
        is_superuser=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _upload(client, headers, lang, content=PDF, filename="cv.pdf", content_type="application/pdf"):
    return client.post(
        f"{CV_URL}/{lang}",
        headers=headers,
        files={"file": (filename, io.BytesIO(content), content_type)},
    )


# ── Autenticación ─────────────────────────────────────────────────────────────

def test_upload_requires_a_token(client, bucket):
    assert _upload(client, {}, "es").status_code == 401
    assert bucket == {}


def test_delete_requires_a_token(client, bucket):
    assert client.delete(f"{CV_URL}/es").status_code == 401


def test_listing_is_public(client, bucket):
    assert client.get(CV_URL).status_code == 200


# ── Un archivo por idioma ─────────────────────────────────────────────────────

def test_each_language_gets_its_own_object(client, auth, bucket):
    _upload(client, auth, "es")
    _upload(client, auth, "en")

    assert sorted(bucket) == ["cv/cv-en.pdf", "cv/cv-es.pdf"]


def test_listing_reports_both_languages(client, auth, bucket):
    _upload(client, auth, "es")

    body = client.get(CV_URL).json()

    assert body["es"] == public_url("cv/cv-es.pdf")
    assert body["en"] is None


def test_uploading_one_language_leaves_the_other_alone(client, auth, bucket):
    _upload(client, auth, "es")
    _upload(client, auth, "en", content=PDF + b" ingles")

    assert bucket["cv/cv-es.pdf"] == PDF
    assert bucket["cv/cv-en.pdf"] == PDF + b" ingles"


def test_delete_removes_only_the_requested_language(client, auth, bucket):
    _upload(client, auth, "es")
    _upload(client, auth, "en")

    response = client.delete(f"{CV_URL}/es", headers=auth)

    assert response.status_code == 204
    assert list(bucket) == ["cv/cv-en.pdf"]


def test_an_unsupported_language_is_rejected(client, auth, bucket):
    assert _upload(client, auth, "fr").status_code == 422
    assert bucket == {}


# ── El archivo que ya estaba subido ───────────────────────────────────────────

def test_the_legacy_file_still_serves_both_languages(client, bucket):
    """En producción hay un CV en la clave antigua. No puede desaparecer."""
    bucket["cv/Waldir_Apaza_CV.pdf"] = PDF

    body = client.get(CV_URL).json()

    legacy = public_url("cv/Waldir_Apaza_CV.pdf")
    assert body["es"] == legacy
    assert body["en"] == legacy


def test_a_language_file_takes_over_from_the_legacy_one(client, auth, bucket):
    bucket["cv/Waldir_Apaza_CV.pdf"] = PDF

    _upload(client, auth, "en", content=PDF + b" ingles")

    body = client.get(CV_URL).json()
    assert body["en"] == public_url("cv/cv-en.pdf")
    # El español sigue cayendo al antiguo mientras no se suba el suyo.
    assert body["es"] == public_url("cv/Waldir_Apaza_CV.pdf")


# ── Validación ────────────────────────────────────────────────────────────────

def test_rejects_something_that_is_not_a_pdf(client, auth, bucket):
    """El tipo declarado no basta: hay que mirar los bytes."""
    response = _upload(client, auth, "es", content=b"\x89PNG\r\n\x1a\n falso")

    assert response.status_code == 400
    assert bucket == {}


def test_rejects_a_wrong_content_type(client, auth, bucket):
    response = _upload(
        client, auth, "es", filename="x.png", content_type="image/png"
    )

    assert response.status_code == 400
    assert bucket == {}


def test_rejects_a_pdf_over_the_size_cap(client, auth, bucket):
    from domains.portfolio.router import MAX_CV_BYTES

    response = _upload(client, auth, "es", content=PDF + b"\x00" * MAX_CV_BYTES)

    assert response.status_code == 413
    assert bucket == {}
