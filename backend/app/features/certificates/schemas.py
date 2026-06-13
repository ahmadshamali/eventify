from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CertificateRead(BaseModel):
	id: str
	event_id: int
	registration_id: int
	student_id: int
	organizer_id: int
	student_name: str
	organizer_name: str
	event_title: str
	issued_at: datetime

	model_config = ConfigDict(from_attributes=True)


class CertificateDetailRead(CertificateRead):
	event_location: str
	event_category: str
	event_start_datetime: datetime
	event_end_datetime: datetime
	student_email: str
	organizer_email: str
	student_role: str | None = None
	organizer_role: str | None = None


class GenerateCertificatesResponse(BaseModel):
	event_id: int
	total_attended: int
	generated_count: int