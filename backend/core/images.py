"""Validación de imágenes subidas.

Estaba escrita dentro del router del blog. Vive aquí porque ahora la usan dos
sitios —las imágenes de los posts y la foto de perfil— y una lista blanca
duplicada es una lista blanca que tarde o temprano se actualiza en un solo lado.

Se comprueban tres cosas, en este orden:

1. El tipo declarado, contra la lista blanca.
2. El tamaño.
3. Los bytes iniciales del archivo.

La tercera es la que importa: el content-type lo pone el cliente, así que sin
mirar el contenido real cualquier cosa renombrada a .png acabaría servida desde
un bucket público.

SVG queda fuera a propósito aunque sea una imagen: admite <script> y se
serviría desde nuestro dominio.
"""

import uuid

from fastapi import HTTPException

# Tipo permitido -> firma con la que empieza el archivo.
ALLOWED_IMAGE_TYPES = {
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
    "image/gif": b"GIF8",
    "image/webp": b"RIFF",
}

MAX_IMAGE_BYTES = 5 * 1024 * 1024


def validate_image_type(content_type: str) -> None:
    """Primera puerta: se comprueba antes de leer el archivo."""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPEG, GIF and WebP images are allowed",
        )


def validate_image_contents(content_type: str, contents: bytes) -> None:
    """Tamaño y firma, ya con los bytes en memoria."""
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")

    if not contents.startswith(ALLOWED_IMAGE_TYPES[content_type]):
        raise HTTPException(
            status_code=400, detail="File content does not match its type"
        )


def build_image_key(prefix: str, content_type: str) -> str:
    """Nombre del objeto en el bucket.

    La extensión sale del tipo ya validado y nunca del nombre que envía el
    cliente: un `exploit.php.png` no debe decidir cómo se llama el objeto.
    """
    extension = content_type.split("/")[1]
    return f"{prefix}/{uuid.uuid4()}.{extension}"
