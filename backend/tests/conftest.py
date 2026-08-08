import os

# Settings is instantiated at import time and requires these. Set them before
# anything under core/ gets imported.
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("ADMIN_USERNAME", "tester")

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.config import settings
from core.database import Base, get_db
from core.security import create_access_token, get_password_hash
from domains.blog import models as blog_models  # noqa: F401 - registers tables
from domains.blog.router import router as blog_router
from domains.users.models import User


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    # A bare app with only the blog router: main.py runs ensure_bucket() on
    # startup, which would need MinIO. Nothing here needs it.
    app = FastAPI()
    app.include_router(blog_router, prefix=settings.API_V1_STR)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture()
def auth_headers(db_session):
    user = User(
        username="tester",
        email="tester@example.com",
        hashed_password=get_password_hash("irrelevant"),
        is_active=True,
        is_superuser=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}
