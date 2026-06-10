from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RegistrationRead(BaseModel):
	id: int
	event_id: int
	student_id: int
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)


class RegistrationStatusRead(BaseModel):
	event_id: int
	is_registered: bool
	registered_count: int
	capacity: int
	available_seats: int
	waitlist_count: int
	is_in_waitlist: bool


class WaitlistEntryRead(BaseModel):
	id: int
	event_id: int
	student_id: int
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)


class StudentRegistrationEventRead(BaseModel):
	registration_id: int
	registered_at: datetime
	qr_token: str | None
	event_id: int
	title: str
	description: str | None
	start_datetime: datetime
	end_datetime: datetime
	location: str
	category: str
	status: str
	capacity: int
