from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.database import get_db
from app.models.project import Project, ProjectStatus

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count()).select_from(Project))
    completed = await db.scalar(
        select(func.count())
        .select_from(Project)
        .where(Project.status == ProjectStatus.COMPLETED)
    )
    return {
        "total_projects": total or 0,
        "completed_projects": completed or 0,
        "processing_projects": (total or 0) - (completed or 0),
    }


@router.get("/models")
async def list_models():
    from app.services import colorize_engine

    deoldify_ok = False
    try:
        import deoldify  # noqa: F401

        deoldify_ok = True
    except ImportError:
        pass
    opencv_ok = colorize_engine._ensure_opencv_models()
    return {
        "models": [
            {
                "id": "deoldify",
                "name": "DeOldify",
                "status": "ready" if deoldify_ok else "install requirements-deoldify.txt",
            },
            {
                "id": "opencv-dnn",
                "name": "OpenCV DNN",
                "status": "ready" if opencv_ok else "run scripts/download_models.py",
            },
        ]
    }
