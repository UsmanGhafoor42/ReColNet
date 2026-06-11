import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parents[2]
_DB = _ROOT / "recolnet.db"
_ON_VERCEL = os.getenv("VERCEL") == "1"
_UPLOAD_DEFAULT = Path("/tmp/uploads") if _ON_VERCEL else _ROOT / "uploads"
# Bundled at deploy time via scripts/download_models.py (see vercel.json installCommand)
_MODELS_DEFAULT = _ROOT / "models"
_DB_DEFAULT = "sqlite+aiosqlite:////tmp/recolnet.db" if _ON_VERCEL else f"sqlite+aiosqlite:///{_DB}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ReColNet API"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    DATABASE_URL: str = _DB_DEFAULT
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    UPLOAD_DIR: Path = _UPLOAD_DEFAULT
    MODELS_DIR: Path = _MODELS_DEFAULT
    MEDIA_URL_PREFIX: str = "/media"
    MAX_UPLOAD_SIZE_MB: int = 50

    # deoldify | opencv | auto (try DeOldify, else OpenCV)
    COLORIZE_ENGINE: str = "auto"
    DEOLDIFY_ARTISTIC: bool = True
    DEOLDIFY_RENDER_FACTOR: int = 35

    ALLOWED_IMAGE_TYPES: set[str] = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "image/avif",
    }
    ALLOWED_VIDEO_TYPES: set[str] = {
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "video/x-msvideo",
    }


settings = Settings()
