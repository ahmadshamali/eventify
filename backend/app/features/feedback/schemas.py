from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class FeedbackRead(BaseModel):
    id: int
    rating: int
    comment: str | None
    created_at: datetime
    full_name: str

    class Config:
        orm_mode = True
