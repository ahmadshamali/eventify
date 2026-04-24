from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RegistrationRead(BaseModel):
	id: int
	event_id: int
	student_id: int
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)
