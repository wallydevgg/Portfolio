import argparse

from sqlalchemy.orm import Session

from core.config import settings
from core.database import SessionLocal
from core.security import get_password_hash
from domains.users.models import User


def seed_admin(db: Session) -> User:
    hashed_password = settings.ADMIN_PASSWORD_HASH
    if settings.ADMIN_PASSWORD:
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
    if not hashed_password:
        raise ValueError("ADMIN_PASSWORD or ADMIN_PASSWORD_HASH is required to seed the admin user")

    existing_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()

    if existing_user:
        existing_user.email = settings.ADMIN_EMAIL
        existing_user.display_name = existing_user.display_name or settings.ADMIN_USERNAME
        existing_user.hashed_password = hashed_password
        existing_user.is_active = True
        existing_user.is_superuser = True
        db.add(existing_user)
        db.commit()
        db.refresh(existing_user)
        return existing_user

    user = User(
        username=settings.ADMIN_USERNAME,
        email=settings.ADMIN_EMAIL,
        display_name=settings.ADMIN_USERNAME,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update the admin user")
    parser.parse_args()

    db = SessionLocal()
    try:
        user = seed_admin(db)
        print(f"Seeded admin user '{user.username}' (id={user.id})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
