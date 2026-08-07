
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "WallyDev Portfolio API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000", "https://wallydev.dev"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if not v:
            return []
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    POSTGRES_SERVER: str = "shared-db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str = "portfolio"
    POSTGRES_PORT: str = "5432"

    ADMIN_USERNAME: str
    ADMIN_EMAIL: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None
    ADMIN_PASSWORD_HASH: Optional[str] = None

    # MinIO S3-compatible storage
    MINIO_ENDPOINT: str = "shared-minio:9000"
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "minioadmin"
    MINIO_PUBLIC_URL: str = "http://localhost:9000"
    MINIO_BUCKET: str = "portfolio"

    # SMTP (HestiaCP / Exim on the same VPS)
    SMTP_HOST: str = "mail.wallydev.dev"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # Fallback recipient for contact notifications. The effective recipient
    # can be overridden at runtime from the dashboard (notification_settings table).
    CONTACT_TO_EMAIL: str = "contact@wallydev.dev"

    # Cloudflare Turnstile (empty secret = captcha verification skipped)
    TURNSTILE_SECRET_KEY: str = ""

    # IP geolocation via ipapi.co (HTTPS, free tier). Failures are non-fatal.
    GEOLOCATION_ENABLED: bool = True

    # Contact form anti-spam
    CONTACT_RATE_LIMIT_PER_HOUR: int = 3

    # Blog comments anti-spam
    COMMENT_RATE_LIMIT_PER_HOUR: int = 5

    # Enable only when the domain is proxied through Cloudflare. Cloudflare
    # overwrites CF-Connecting-IP at its edge; without it in front, the header
    # is client-supplied and trusting it would allow rate limit bypass.
    TRUST_CF_CONNECTING_IP: bool = False

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
