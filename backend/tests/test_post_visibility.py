from datetime import datetime, timezone

import pytest

from domains.blog import models


def make_post(db, slug, *, published, archived):
    post = models.Post(
        title=f"Post {slug}",
        slug=slug,
        content="<p>contenido</p>",
        is_published=published,
        deleted_at=datetime.now(timezone.utc) if archived else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


# Only a published, non-archived post is visible to the public.
STATES = [
    ("draft", False, False, False),
    ("published", True, False, True),
    ("archived-draft", False, True, False),
    ("archived-published", True, True, False),
]


@pytest.mark.parametrize("slug,published,archived,visible", STATES)
def test_list_only_returns_visible_posts(client, db_session, slug, published, archived, visible):
    make_post(db_session, slug, published=published, archived=archived)

    body = client.get("/api/v1/posts/").json()

    assert [p["slug"] for p in body] == ([slug] if visible else [])


@pytest.mark.parametrize("slug,published,archived,visible", STATES)
def test_slug_lookup_only_returns_visible_posts(client, db_session, slug, published, archived, visible):
    make_post(db_session, slug, published=published, archived=archived)

    response = client.get(f"/api/v1/posts/slug/{slug}")

    assert response.status_code == (200 if visible else 404)


@pytest.mark.parametrize("slug,published,archived,visible", STATES)
def test_rss_only_includes_visible_posts(client, db_session, slug, published, archived, visible):
    make_post(db_session, slug, published=published, archived=archived)

    body = client.get("/api/v1/posts/rss.xml").text

    assert (f"/blog/{slug}" in body) is visible


def test_dashboard_listing_includes_drafts_but_not_archived(client, db_session, auth_headers):
    make_post(db_session, "draft", published=False, archived=False)
    make_post(db_session, "published", published=True, archived=False)
    make_post(db_session, "archived", published=True, archived=True)

    body = client.get("/api/v1/posts/all", headers=auth_headers).json()

    assert sorted(p["slug"] for p in body) == ["draft", "published"]


def test_fetching_a_post_by_id_requires_a_token(client, db_session):
    post = make_post(db_session, "secreto", published=False, archived=False)

    response = client.get(f"/api/v1/posts/{post.id}")

    assert response.status_code == 401


def test_admin_can_fetch_a_post_in_any_state_by_id(client, db_session, auth_headers):
    draft = make_post(db_session, "borrador", published=False, archived=False)
    archived = make_post(db_session, "archivado", published=True, archived=True)

    for post in (draft, archived):
        response = client.get(f"/api/v1/posts/{post.id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["slug"] == post.slug
