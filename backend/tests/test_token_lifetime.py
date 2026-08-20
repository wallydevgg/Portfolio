"""La duración del token es una promesa que la interfaz hace por escrito.

La pantalla de login dice "Keep this session for 7 days" debajo de la casilla
de Remember me. Ese texto no lo decide el frontend: la sesión dura exactamente
lo que dure el JWT, y eso lo fija ACCESS_TOKEN_EXPIRE_MINUTES.

Sin esta prueba, bajar ese valor —para endurecer la seguridad, por ejemplo—
dejaría al usuario deslogueado antes de tiempo y con un cartel en pantalla
diciéndole lo contrario, sin que nada fallara al hacer el cambio.
"""

from datetime import datetime, timedelta

import jwt

from core.config import settings
from core.security import create_access_token


SEVEN_DAYS_IN_MINUTES = 60 * 24 * 7


def _decode(token: str) -> dict:
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )


def test_configured_lifetime_matches_the_seven_days_the_ui_promises():
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == SEVEN_DAYS_IN_MINUTES


def test_issued_token_expires_in_seven_days():
    before = datetime.utcnow()
    payload = _decode(create_access_token(subject=1))
    expires_at = datetime.utcfromtimestamp(payload["exp"])

    # Margen de un minuto: entre el `before` de arriba y el `utcnow()` de dentro
    # de create_access_token pasa un instante, y el exp se redondea a segundos.
    assert timedelta(days=7) - timedelta(minutes=1) <= expires_at - before
    assert expires_at - before <= timedelta(days=7) + timedelta(minutes=1)


def test_expiry_can_still_be_overridden_per_call():
    """create_access_token acepta un expires_delta propio.

    No lo usa nadie hoy, pero es la vía por la que se implementaría un token
    corto sin Remember me si algún día se quiere hacer del lado del servidor.
    """
    before = datetime.utcnow()
    payload = _decode(
        create_access_token(subject=1, expires_delta=timedelta(minutes=30))
    )
    expires_at = datetime.utcfromtimestamp(payload["exp"])

    assert expires_at - before <= timedelta(minutes=31)
