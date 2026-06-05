from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.storage import ensure_bucket

from domains.portfolio.router import router as portfolio_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    allowed_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

from domains.users.router import router as users_router
from domains.blog.router import router as blog_router
from domains.settings.router import router as settings_router

@app.on_event("startup")
def on_startup():
    ensure_bucket()

app.include_router(portfolio_router, prefix=f"{settings.API_V1_STR}/portfolio", tags=["portfolio"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}", tags=["users"])
app.include_router(blog_router, prefix=f"{settings.API_V1_STR}", tags=["blogs"])
app.include_router(settings_router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])

@app.get("/")
def root():
    return {"message": "Welcome to WallyDev Portfolio API", "version": "1.0.0"}
