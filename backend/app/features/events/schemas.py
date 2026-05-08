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
    end_datetime: datetime = Field(..., alias="endDateTime")
    duration_minutes: int | None = Field(None, alias="durationMinutes", gt=0)
    image_url: str | None = Field(None, alias="imageUrl", max_length=500)
    event_link: str | None = Field(None, alias="eventLink", max_length=500)
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
    end_datetime: datetime | None = Field(None, alias="endDateTime")
    duration_minutes: int | None = Field(None, alias="durationMinutes", gt=0)
    image_url: str | None = Field(None, alias="imageUrl", max_length=500)
    event_link: str | None = Field(None, alias="eventLink", max_length=500)
    location: str | None = Field(None, min_length=1, max_length=255)
    category: AllowedCategory | None = None
    capacity: int | None = Field(None, gt=0)

    model_config = ConfigDict(populate_by_name=True)


class CancelEventRequest(BaseModel):
    confirm: bool = Field(...)


class ImageUploadRead(BaseModel):
    image_url: str = Field(alias="imageUrl")

    model_config = ConfigDict(populate_by_name=True)


class EventRead(BaseModel):
    id: int
    title: str
    description: str | None
    start_datetime: datetime = Field(alias="startDateTime")
    end_datetime: datetime = Field(alias="endDateTime")
    image_url: str | None = Field(default=None, alias="imageUrl")
    event_link: str | None = Field(default=None, alias="eventLink")
    location: str
    category: AllowedCategory
    status: EventStatus
    capacity: int
    registered_count: int = 0
    organizer_id: int | None = Field(alias="organizerId")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)