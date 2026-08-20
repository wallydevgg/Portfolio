"""Turnstile en el formulario de contacto: qué pasa cuando no está configurado.

El 2026-08-19 llegaron cuatro mensajes basura desde nodos de salida de Tor con
nombre, asunto y cuerpo aleatorios. La causa no fue que Turnstile fallara, sino
que no estaba actuando: sin `TURNSTILE_SECRET_KEY`, `verify_turnstile` devolvía
None y el router solo rechazaba con `== 0.0`, así que None pasaba.

Un despliegue con el .env mal puesto dejaba el formulario abierto de par en par
sin que nada avisara. Estas pruebas fijan el comportamiento contrario: sin
secreto configurado, el endpoint rechaza.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.config import settings
from core.database import get_db
from domains.contact import service
from domains.contact.router import router as contact_router


CONTACT_URL = f"{settings.API_V1_STR}/contact"

VALID_PAYLOAD = {
    "name": "Lucía Ferrán",
    "email": "lucia@example.com",
    "subject": "Consulta por un proyecto",
    "message": "Hola, me gustaría hablar de un rediseño.",
    "turnstile_token": "token-de-prueba",
}


@pytest.fixture()
def client(db_session, monkeypatch):
    # La geolocalización sale a Internet y el rate limit guarda estado entre
    # pruebas; ninguna de las dos es lo que se está comprobando aquí.
    monkeypatch.setattr(service, "get_geolocation", lambda ip: (None, None))
    monkeypatch.setattr(service, "check_rate_limit", lambda ip: True)
    monkeypatch.setattr(service, "send_notification_email", lambda *a, **k: None, raising=False)

    app = FastAPI()
    app.include_router(contact_router, prefix=CONTACT_URL)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_settings(monkeypatch):
    """Cada prueba parte de una configuración conocida."""
    monkeypatch.setattr(settings, "TURNSTILE_SECRET_KEY", "", raising=False)
    monkeypatch.setattr(settings, "TURNSTILE_REQUIRED", True, raising=False)


def _submit(client, **overrides):
    payload = {**VALID_PAYLOAD, **overrides}
    return client.post(CONTACT_URL, json=payload)


# ── Sin secreto configurado ───────────────────────────────────────────────────

def test_rejects_when_required_but_not_configured(client, db_session):
    """El caso que dejó pasar el spam: exigido pero sin clave."""
    from domains.contact import models

    response = _submit(client)

    assert response.status_code == 503
    assert db_session.query(models.ContactSubmission).count() == 0


def test_the_escape_hatch_has_to_be_explicit(client, monkeypatch, db_session):
    """Con TURNSTILE_REQUIRED=false se acepta, que es lo que necesita el local."""
    from domains.contact import models

    monkeypatch.setattr(settings, "TURNSTILE_REQUIRED", False, raising=False)

    response = _submit(client)

    assert response.status_code == 201
    assert db_session.query(models.ContactSubmission).count() == 1


# ── Con secreto configurado ───────────────────────────────────────────────────

def test_a_failed_challenge_is_rejected(client, monkeypatch, db_session):
    from domains.contact import models

    monkeypatch.setattr(settings, "TURNSTILE_SECRET_KEY", "0x-secreto", raising=False)
    monkeypatch.setattr(service, "verify_turnstile", lambda token, ip: 0.0)

    response = _submit(client)

    assert response.status_code == 400
    assert db_session.query(models.ContactSubmission).count() == 0


def test_a_passed_challenge_is_accepted(client, monkeypatch, db_session):
    from domains.contact import models

    monkeypatch.setattr(settings, "TURNSTILE_SECRET_KEY", "0x-secreto", raising=False)
    monkeypatch.setattr(service, "verify_turnstile", lambda token, ip: 1.0)

    response = _submit(client)

    assert response.status_code == 201
    assert db_session.query(models.ContactSubmission).count() == 1


def test_a_missing_token_is_rejected_when_configured(client, monkeypatch, db_session):
    """Un POST directo a la API, sin pasar por la página, no trae token.

    Es como llegaron los mensajes basura: los bots no abren el formulario.
    """
    from domains.contact import models

    monkeypatch.setattr(settings, "TURNSTILE_SECRET_KEY", "0x-secreto", raising=False)

    response = _submit(client, turnstile_token=None)

    assert response.status_code == 400
    assert db_session.query(models.ContactSubmission).count() == 0


# ── El honeypot sigue funcionando ─────────────────────────────────────────────

def test_the_honeypot_still_swallows_bots_silently(client, monkeypatch, db_session):
    """Responde igual que un envío bueno para no delatar la detección.

    El status es 201, el mismo del camino legítimo: desde fuera no hay forma de
    distinguir que el mensaje se descartó, que es justo lo que se busca.
    """
    from domains.contact import models

    monkeypatch.setattr(settings, "TURNSTILE_SECRET_KEY", "0x-secreto", raising=False)
    monkeypatch.setattr(service, "verify_turnstile", lambda token, ip: 1.0)

    response = client.post(CONTACT_URL, json={**VALID_PAYLOAD, "website": "http://spam.example"})

    assert response.status_code == 201
    assert db_session.query(models.ContactSubmission).count() == 0
