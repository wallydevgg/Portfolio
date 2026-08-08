from domains.blog import models

from tests.test_post_visibility import make_post


def test_new_post_is_not_archived(db_session):
    post = models.Post(title="Hola", slug="hola", content="<p>x</p>")
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)

    assert post.deleted_at is None


def test_delete_archives_instead_of_destroying(client, db_session, auth_headers):
    post = make_post(db_session, "adios", published=True, archived=False)

    response = client.delete(f"/api/v1/posts/{post.id}", headers=auth_headers)

    assert response.status_code == 204
    db_session.refresh(post)
    assert post.deleted_at is not None
    assert post.is_published is True  # archiving does not change the state


def test_archived_listing_returns_only_archived(client, db_session, auth_headers):
    make_post(db_session, "activo", published=True, archived=False)
    make_post(db_session, "guardado", published=False, archived=True)

    body = client.get("/api/v1/posts/archived", headers=auth_headers).json()

    assert [p["slug"] for p in body] == ["guardado"]


def test_archived_listing_requires_a_token(client):
    assert client.get("/api/v1/posts/archived").status_code == 401


def test_restore_clears_deleted_at(client, db_session, auth_headers):
    post = make_post(db_session, "vuelve", published=True, archived=True)

    response = client.post(f"/api/v1/posts/{post.id}/restore", headers=auth_headers)

    assert response.status_code == 200
    db_session.refresh(post)
    assert post.deleted_at is None


def test_restore_on_an_active_post_is_a_conflict(client, db_session, auth_headers):
    post = make_post(db_session, "activo", published=True, archived=False)

    response = client.post(f"/api/v1/posts/{post.id}/restore", headers=auth_headers)

    assert response.status_code == 409


def test_purge_deletes_an_archived_post(client, db_session, auth_headers):
    post = make_post(db_session, "chau", published=False, archived=True)
    post_id = post.id

    response = client.delete(f"/api/v1/posts/{post_id}/purge", headers=auth_headers)

    assert response.status_code == 204
    assert db_session.get(models.Post, post_id) is None


def test_purge_refuses_a_post_that_is_not_archived(client, db_session, auth_headers):
    post = make_post(db_session, "vivo", published=True, archived=False)

    response = client.delete(f"/api/v1/posts/{post.id}/purge", headers=auth_headers)

    assert response.status_code == 409
    assert db_session.get(models.Post, post.id) is not None


def test_archived_listing_exposes_the_archive_date(client, db_session, auth_headers):
    make_post(db_session, "guardado", published=False, archived=True)

    body = client.get("/api/v1/posts/archived", headers=auth_headers).json()

    assert body[0]["deleted_at"] is not None
