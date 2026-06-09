import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.media_file import FileType, MediaFile
from app.models.project import Project, ProjectStatus
from app.schemas.project import (
    ProjectCreate,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.services import jobs, storage

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return [ProjectResponse.model_validate(p) for p in result.scalars().all()]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(title=payload.title, media_type=payload.media_type)
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await _load_project(db, project_id)
    if not project:
        raise HTTPException(404, detail="Project not found")
    return ProjectDetailResponse.model_validate(project)


@router.post("/{project_id}/upload", response_model=ProjectDetailResponse)
async def upload_media(
    project_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, detail="Project not found")
    if project.status == ProjectStatus.PROCESSING:
        raise HTTPException(409, detail="Project is already processing")

    url, _, _ = await storage.save_upload(project_id, file)
    project.status = ProjectStatus.PENDING
    db.add(
        MediaFile(
            project_id=project_id,
            original_file=url,
            file_type=FileType.ORIGINAL,
        )
    )
    await db.flush()
    background_tasks.add_task(jobs.run_colorization_job, project_id)
    project = await _load_project(db, project_id)
    return ProjectDetailResponse.model_validate(project)


@router.post("/{project_id}/reprocess", response_model=ProjectDetailResponse)
async def reprocess(
    project_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    project = await _load_project(db, project_id)
    if not project:
        raise HTTPException(404, detail="Project not found")
    if not any(m.file_type == FileType.ORIGINAL for m in project.media_files):
        raise HTTPException(400, detail="No original file to reprocess")
    if project.status == ProjectStatus.PROCESSING:
        raise HTTPException(409, detail="Already processing")

    project.status = ProjectStatus.PENDING
    await db.flush()
    background_tasks.add_task(jobs.run_colorization_job, project_id)
    project = await _load_project(db, project_id)
    return ProjectDetailResponse.model_validate(project)


@router.get("/{project_id}/download")
async def download_colorized(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await _load_project(db, project_id)
    if not project:
        raise HTTPException(404, detail="Project not found")

    colorized = next((m for m in project.media_files if m.file_type == FileType.COLORIZED), None)
    if not colorized or not colorized.colorized_file:
        raise HTTPException(404, detail="Colorized file not found")

    path = storage.disk_path_from_url(colorized.colorized_file)
    if not path.exists():
        raise HTTPException(404, detail="Colorized file missing on disk")

    suffix = Path(path.name).suffix or ".png"
    safe_title = re.sub(r"[^a-zA-Z0-9_-]+", "_", project.title).strip("_") or f"project_{project_id}"
    filename = f"{safe_title}-colorized{suffix}"
    return FileResponse(path, filename=filename, media_type="application/octet-stream")


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int, payload: ProjectUpdate, db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, detail="Project not found")
    if payload.title is not None:
        project.title = payload.title
    if payload.status is not None:
        project.status = payload.status
    await db.flush()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, detail="Project not found")
    storage.delete_project_files(project_id)
    await db.delete(project)


async def _load_project(db: AsyncSession, project_id: int) -> Optional[Project]:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.media_files),
            selectinload(Project.ai_results),
            selectinload(Project.explanations),
        )
    )
    return result.scalar_one_or_none()
