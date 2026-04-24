from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

AllowedCategory = Literal[
    "Technology",
    "Business & Entrepreneurship",
    "Education & Workshops",
    "Sports & Fitness",
    "Arts & Culture",
]
EventStatus = Literal["Available", "Full", "Canceled"]


class EventBaseWrite(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    start_datetime: datetime = Field(..., alias="startDateTime")
    location: str = Field(..., min_length=1, max_length=255)
    category: AllowedCategory
    capacity: int = Field(..., gt=0)

    model_config = ConfigDict(populate_by_name=True)


class EventCreate(EventBaseWrite):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, min_length=1, max_length=1000)
    start_datetime: datetime | None = Field(None, alias="startDateTime")
    location: str | None = Field(None, min_length=1, max_length=255)
    category: AllowedCategory | None = None
    capacity: int | None = Field(None, gt=0)

    model_config = ConfigDict(populate_by_name=True)


class CancelEventRequest(BaseModel):
    confirm: bool = Field(...)


class EventRead(BaseModel):
    id: int
    title: str
    description: str | None
    start_datetime: datetime = Field(alias="startDateTime")
    location: str
    category: AllowedCategory
    status: EventStatus
    capacity: int
    organizer_id: int | None = Field(alias="organizerId")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)