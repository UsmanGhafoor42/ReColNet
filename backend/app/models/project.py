import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class ProjectStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    media_type: Mapped[MediaType] = mapped_column(Enum(MediaType), nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus), default=ProjectStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    media_files: Mapped[list["MediaFile"]] = relationship(
        "MediaFile", back_populates="project", cascade="all, delete-orphan"
    )
    ai_results: Mapped[list["AIResult"]] = relationship(
        "AIResult", back_populates="project", cascade="all, delete-orphan"
    )
    explanations: Mapped[list["Explanation"]] = relationship(
        "Explanation", back_populates="project", cascade="all, delete-orphan"
    )
