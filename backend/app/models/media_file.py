import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FileType(str, enum.Enum):
    ORIGINAL = "original"
    COLORIZED = "colorized"
    HEATMAP = "heatmap"
    ATTENTION = "attention"


class MediaFile(Base):
    __tablename__ = "media_files"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    original_file: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    colorized_file: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    file_type: Mapped[FileType] = mapped_column(Enum(FileType), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    project: Mapped["Project"] = relationship("Project", back_populates="media_files")
