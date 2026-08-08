def test_empty_database_returns_no_posts(client):
    response = client.get("/api/v1/posts/")
    assert response.status_code == 200
    assert response.json() == []


def test_auth_headers_are_accepted(client, auth_headers):
    response = client.get("/api/v1/posts/all", headers=auth_headers)
    assert response.status_code == 200


def test_all_posts_requires_a_token(client):
    response = client.get("/api/v1/posts/all")
    assert response.status_code == 401
