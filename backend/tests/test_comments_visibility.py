import pytest

from tests.test_post_visibility import STATES, make_post


@pytest.mark.parametrize("slug,published,archived,visible", STATES)
def test_commenting_requires_a_visible_post(client, db_session, slug, published, archived, visible):
    post = make_post(db_session, slug, published=published, archived=archived)

    response = client.post(
        f"/api/v1/posts/{post.id}/comments",
        json={"author_name": "QA", "content": "hola"},
    )

    assert response.status_code == (201 if visible else 404)


@pytest.mark.parametrize("slug,published,archived,visible", STATES)
def test_listing_comments_requires_a_visible_post(client, db_session, slug, published, archived, visible):
    post = make_post(db_session, slug, published=published, archived=archived)

    response = client.get(f"/api/v1/posts/{post.id}/comments")

    assert response.status_code == (200 if visible else 404)


@pytest.mark.parametrize("slug,published,archived,visible", STATES)
def test_liking_requires_a_visible_post(client, db_session, slug, published, archived, visible):
    post = make_post(db_session, slug, published=published, archived=archived)

    response = client.post(f"/api/v1/posts/{post.id}/like")

    assert response.status_code == (200 if visible else 404)
