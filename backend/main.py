from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

from domains.portfolio.router import router as portfolio_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(portfolio_router, prefix=f"{settings.API_V1_STR}/portfolio", tags=["portfolio"])

@app.get("/")
def root():
    return {"message": "Welcome to WallyDev Portfolio API", "version": "1.0.0"}
