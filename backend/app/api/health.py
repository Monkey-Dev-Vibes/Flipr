from fastapi import APIRouter

from app.core.config import APP_VERSION

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "flipr-api", "version": APP_VERSION}
