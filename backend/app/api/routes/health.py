from fastapi import APIRouter

from app.core.config import settings
from app.services.model_download import models_ready

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "recolnet-api",
        "engine": settings.COLORIZE_ENGINE,
        "models_ready": models_ready(),
    }
