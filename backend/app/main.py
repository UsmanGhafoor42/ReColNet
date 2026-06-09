from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine

# Ensure mount targets exist at import time.
# On Vercel, StaticFiles validates directory existence before lifespan runs.
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
try:
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
except PermissionError:
    # Models are optional at import-time; endpoints can still boot.
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


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
