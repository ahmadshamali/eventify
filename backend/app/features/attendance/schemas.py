from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AttendanceRead(BaseModel):
	id: int
	registration_id: int
	event_id: int
	student_id: int
	scanned_by: int
	attended_at: datetime

	model_config = ConfigDict(from_attributes=True)


class ScanQRRequest(BaseModel):
	qr_token: str


class AttendanceStudentRead(BaseModel):
	attendance_id: int
	student_id: int
	full_name: str
	email: str
	attended_at: datetime
