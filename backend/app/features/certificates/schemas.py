from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CertificateRead(BaseModel):
	attendance_id: int
	event_id: int
	event_title: str
	event_date: datetime
	organization_name: str
	student_id: int
	student_name: str
	student_email: str
	attended_at: datetime
	certificate_issued_at: datetime
	verification_url: str

	model_config = ConfigDict(from_attributes=True)


class CertificateGenerationRead(BaseModel):
	event_id: int
	event_title: str
	generated_count: int
	total_attended: int