from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parents[2]
_DB = _ROOT / "recolnet.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ReColNet API"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    DATABASE_URL: str = f"sqlite+aiosqlite:///{_DB}"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    UPLOAD_DIR: Path = _ROOT / "uploads"
    MODELS_DIR: Path = _ROOT / "models"
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
