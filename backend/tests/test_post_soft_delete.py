from domains.blog import models


def test_new_post_is_not_archived(db_session):
    post = models.Post(title="Hola", slug="hola", content="<p>x</p>")
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)

    assert post.deleted_at is None
