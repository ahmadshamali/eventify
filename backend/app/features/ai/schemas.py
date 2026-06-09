from pydantic import BaseModel, Field


class GenerateEventDescriptionRequest(BaseModel):
	title: str = Field(..., min_length=3, max_length=120)
	category: str = Field(..., min_length=2, max_length=100)
	additional_details: str | None = Field(default=None, min_length=0, max_length=1500)


class GenerateEventDescriptionResponse(BaseModel):
	description: str
