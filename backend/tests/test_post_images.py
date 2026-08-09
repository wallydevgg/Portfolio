import io

import pytest

from tests.test_post_visibility import make_post


def _png_bytes() -> bytes:
    """Smallest valid PNG. Enough for the endpoint to accept it as an image."""
    return bytes.fromhex(
        "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
        "1f15c4890000000a49444154789c6300010000050001"
        "0d0a2db40000000049454e44ae426082"
    )


def test_cover_image_defaults_to_none(db_session):
    post = make_post(db_session, "sin-portada", published=True, archived=False)

    assert post.cover_image is None


def test_cover_image_round_trips_through_the_api(client, db_session, auth_headers):
    post = make_post(db_session, "con-portada", published=True, archived=False)

    response = client.put(
        f"/api/v1/posts/{post.id}",
        headers=auth_headers,
        json={"cover_image": "http://minio/portfolio/blog/x.png"},
    )

    assert response.status_code == 200
    assert response.json()["cover_image"] == "http://minio/portfolio/blog/x.png"


def test_upload_requires_a_token(client):
    response = client.post(
        "/api/v1/posts/upload-image",
        files={"file": ("x.png", io.BytesIO(_png_bytes()), "image/png")},
    )

    assert response.status_code == 401


def test_upload_rejects_a_non_image(client, auth_headers):
    response = client.post(
        "/api/v1/posts/upload-image",
        headers=auth_headers,
        files={"file": ("payload.svg", io.BytesIO(b"<svg onload=alert(1)>"), "image/svg+xml")},
    )

    # SVG is an image content type but carries scripts, so it is not allowed.
    assert response.status_code == 400


def test_upload_rejects_a_file_over_the_size_limit(client, auth_headers):
    oversized = b"\x89PNG\r\n\x1a\n" + b"0" * (6 * 1024 * 1024)

    response = client.post(
        "/api/v1/posts/upload-image",
        headers=auth_headers,
        files={"file": ("big.png", io.BytesIO(oversized), "image/png")},
    )

    assert response.status_code == 413
