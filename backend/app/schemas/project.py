from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.project import MediaType, ProjectStatus


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    media_type: MediaType


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    media_type: MediaType
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MediaFileResponse(BaseModel):
    id: int
    project_id: int
    original_file: Optional[str]
    colorized_file: Optional[str]
    file_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AIResultResponse(BaseModel):
    id: int
    project_id: int
    model_used: str
    confidence_score: Optional[float]
    processing_time: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class ExplanationResponse(BaseModel):
    id: int
    project_id: int
    heatmap_path: Optional[str]
    attention_map_path: Optional[str]
    text_explanation: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectDetailResponse(ProjectResponse):
    media_files: list[MediaFileResponse] = []
    ai_results: list[AIResultResponse] = []
    explanations: list[ExplanationResponse] = []
