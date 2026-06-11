import asyncio
import logging
import time
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.ai_result import AIResult
from app.models.explanation import Explanation
from app.models.media_file import FileType, MediaFile
from app.models.project import Project, ProjectStatus
from app.services import colorize_engine, storage

logger = logging.getLogger(__name__)


async def _set_status(project_id: int, status: ProjectStatus) -> None:
    async with AsyncSessionLocal() as db:
        project = await db.get(Project, project_id)
        if project:
            project.status = status
            await db.commit()


async def run_colorization_job(project_id: int) -> None:
    await _set_status(project_id, ProjectStatus.PROCESSING)
    t0 = time.perf_counter()

    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Project)
                .where(Project.id == project_id)
                .options(selectinload(Project.media_files))
            )
            project = result.scalar_one_or_none()
            if not project:
                return
            original = next(
                (m for m in project.media_files if m.file_type == FileType.ORIGINAL),
                None,
            )
            if not original or not original.original_file:
                raise ValueError("No original file")

            # Drop previous colorized outputs (reprocess)
            for mf in list(project.media_files):
                if mf.file_type == FileType.COLORIZED:
                    if mf.colorized_file:
                        old = storage.disk_path_from_url(mf.colorized_file)
                        if old.exists():
                            old.unlink(missing_ok=True)
                    await db.delete(mf)

            src = storage.disk_path_from_url(original.original_file)
            is_video = str(project.media_type) == "video" or getattr(
                project.media_type, "value", ""
            ) == "video"

            if is_video:
                url, out_path = storage.colorized_path(project_id, ".mp4")
                meta = await asyncio.to_thread(colorize_engine.colorize_video, src, out_path)
            else:
                url, out_path = storage.colorized_path(project_id, ".png")
                meta = await asyncio.to_thread(colorize_engine.colorize_image, src, out_path)

            elapsed = time.perf_counter() - t0

            project.status = ProjectStatus.COMPLETED
            db.add(
                MediaFile(
                    project_id=project_id,
                    colorized_file=url,
                    file_type=FileType.COLORIZED,
                )
            )
            db.add(
                AIResult(
                    project_id=project_id,
                    model_used=meta["engine"],
                    confidence_score=meta["confidence"],
                    processing_time=round(elapsed, 2),
                )
            )
            db.add(
                Explanation(
                    project_id=project_id,
                    text_explanation=_explanation(meta["engine"], is_video, meta),
                )
            )
            await db.commit()
            logger.info("Project %s colorized with %s", project_id, meta["engine"])

    except Exception as e:
        logger.exception("Colorization failed for project %s", project_id)
        async with AsyncSessionLocal() as db:
            project = await db.get(Project, project_id)
            if project:
                project.status = ProjectStatus.FAILED
                db.add(
                    Explanation(
                        project_id=project_id,
                        text_explanation=f"Processing failed: {e}",
                    )
                )
                await db.commit()


def _explanation(engine: str, is_video: bool, meta: dict) -> str:
    if is_video:
        frames = meta.get("frames", 0)
        base = {
            "deoldify": "DeOldify colorized each frame with artistic scene-aware hues.",
            "opencv-dnn-enhanced": (
                f"Enhanced OpenCV pipeline colorized {frames} frames with CLAHE contrast, "
                "LAB restoration, saturation boost, bilateral smoothing, and temporal stabilization."
            ),
            "opencv-dnn": f"OpenCV DNN colorized {frames} frames with LAB channel restoration.",
            "fallback": "Basic per-frame enhancement applied; install models for full colorization.",
        }.get(engine, "Video colorization complete.")
        return base

    return {
        "deoldify": "DeOldify applied artistic colorization with scene-aware hues.",
        "opencv-dnn-enhanced": (
            "Enhanced OpenCV pipeline with CLAHE contrast, LAB restoration, "
            "saturation boost, and detail-preserving bilateral smoothing."
        ),
        "opencv-dnn": "OpenCV DNN restored LAB color channels from luminance.",
        "fallback": "Basic enhancement applied; install models for full colorization.",
    }.get(engine, "Colorization complete.")
