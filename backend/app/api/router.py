from fastapi import APIRouter

from app.api.routes import admin, health, projects

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(projects.router)
api_router.include_router(admin.router)
