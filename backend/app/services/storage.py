import shutil
import uuid
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import settings

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif", ".avif"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".avi"}


def project_dir(project_id: int) -> Path:
    d = settings.UPLOAD_DIR / "projects" / str(project_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def media_url(project_id: int, filename: str) -> str:
    return f"{settings.MEDIA_URL_PREFIX}/projects/{project_id}/{filename}"


def disk_path_from_url(url: str) -> Path:
    rel = url.replace(settings.MEDIA_URL_PREFIX, "").lstrip("/")
    return settings.UPLOAD_DIR / rel


async def save_upload(project_id: int, file: UploadFile) -> tuple[str, Path, bool]:
    """Returns (media_url, absolute_path, is_video)."""
    content_type = file.content_type or ""
    ext = Path(file.filename or "").suffix.lower()
    if not ext:
        ext = ".jpg" if content_type in settings.ALLOWED_IMAGE_TYPES else ".mp4"

    is_video = content_type in settings.ALLOWED_VIDEO_TYPES or ext in VIDEO_EXT
    is_image = content_type in settings.ALLOWED_IMAGE_TYPES or ext in IMAGE_EXT
    if not is_image and not is_video:
        raise HTTPException(400, detail="Unsupported file type")

    data = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB")

    # Normalize AVIF uploads to PNG to avoid downstream decoder/runtime issues.
    if is_image and (ext == ".avif" or content_type == "image/avif"):
        try:
            from PIL import Image
            import pillow_avif  # noqa: F401

            img = Image.open(BytesIO(data)).convert("RGB")
            out = BytesIO()
            img.save(out, format="PNG")
            data = out.getvalue()
            ext = ".png"
        except Exception as exc:
            raise HTTPException(
                400,
                detail=(
                    "AVIF file could not be decoded. "
                    "Please upload PNG/JPG/WebP, or re-export this AVIF."
                ),
            ) from exc

    folder = project_dir(project_id)
    name = f"original{ext}"
    dest = folder / name
    dest.write_bytes(data)
    return media_url(project_id, name), dest, is_video


def colorized_path(project_id: int, ext: str = ".png") -> tuple[str, Path]:
    allowed = {".jpg", ".jpeg", ".png", ".mp4", ".webm", ".mov"}
    ext = ext.lower() if ext.lower() in allowed else ".png"
    name = f"colorized{ext}"
    path = project_dir(project_id) / name
    return media_url(project_id, name), path


def delete_project_files(project_id: int) -> None:
    folder = settings.UPLOAD_DIR / "projects" / str(project_id)
    if folder.exists():
        shutil.rmtree(folder, ignore_errors=True)
