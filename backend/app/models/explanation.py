from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Explanation(Base):
    __tablename__ = "explanations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    heatmap_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    attention_map_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    text_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    project: Mapped["Project"] = relationship(
        "Project", back_populates="explanations"
    )
