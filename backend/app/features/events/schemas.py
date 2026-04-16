from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    subtitle: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=200)
    capacity: Optional[int] = Field(default=0, ge=0)

class EventCreate(EventBase):
    pass

class EventRead(EventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True