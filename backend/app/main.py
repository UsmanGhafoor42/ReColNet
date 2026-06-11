from contextlib import asynccontextmanager
import asyncio
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine

logger = logging.getLogger(__name__)

# Ensure mount targets exist at import time.
# On Vercel, StaticFiles validates directory existence before lifespan runs.
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
try:
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
except PermissionError:
    # Models are optional at import-time; endpoints can still boot.
    pass


async def _ensure_models() -> None:
    from app.services.model_download import download_models, models_ready

    if models_ready():
        return
    logger.info("OpenCV models missing — downloading to %s", settings.MODELS_DIR)
    await asyncio.to_thread(download_models, settings.MODELS_DIR)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as exc:
        # Do not crash cold-start on serverless if DB init fails.
        # API routes depending on DB will still return errors, but health can respond.
        logger.exception("Database initialization failed during startup: %s", exc)
    try:
        await _ensure_models()
    except Exception as exc:
        logger.exception("Model download failed during startup: %s", exc)
    yield
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    settings.MEDIA_URL_PREFIX,
    StaticFiles(directory=str(settings.UPLOAD_DIR)),
    name="media",
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
