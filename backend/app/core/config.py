import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parents[2]
_DB = _ROOT / "recolnet.db"
_ON_VERCEL = os.getenv("VERCEL") == "1"
_ON_RAILWAY = bool(os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RAILWAY"))


def _data_root() -> Path:
    if os.getenv("DATA_DIR"):
        return Path(os.getenv("DATA_DIR"))
    if _ON_RAILWAY:
        return Path("/data")
    return _ROOT


if _ON_VERCEL:
    _UPLOAD_DEFAULT = Path("/tmp/uploads")
    _MODELS_DEFAULT = Path("/tmp/models")
    _DB_DEFAULT = "sqlite+aiosqlite:////tmp/recolnet.db"
elif _ON_RAILWAY or os.getenv("DATA_DIR"):
    _data = _data_root()
    _UPLOAD_DEFAULT = _data / "uploads"
    _MODELS_DEFAULT = _data / "models"
    _DB_DEFAULT = f"sqlite+aiosqlite:///{_data / 'recolnet.db'}"
else:
    _UPLOAD_DEFAULT = _ROOT / "uploads"
    _MODELS_DEFAULT = _ROOT / "models"
    _DB_DEFAULT = f"sqlite+aiosqlite:///{_DB}"


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
