from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.features.certificates.schemas import CertificateGenerationRead
from app.models.attendance import Attendance
from app.models.event import Event
from app.models.user import User


def _verification_url(base_url: str, attendance_id: int) -> str:
	return f"{base_url.rstrip('/')}/certificate/{attendance_id}"


def generate_event_certificates(db: Session, event_id: int, organizer: User, base_url: str) -> CertificateGenerationRead:
	event = db.query(Event).filter(Event.id == event_id).first()
	if not event:
		raise HTTPException(status_code=404, detail="Event not found.")

	if event.organizer_id != organizer.user_id:
		raise HTTPException(status_code=403, detail="You are not the organizer of this event.")

	if event.status == "Canceled":
		raise HTTPException(status_code=400, detail="Certificates cannot be generated for canceled events.")

	attended_count = db.query(Attendance).filter(Attendance.event_id == event.id).count()
	if attended_count == 0:
		raise HTTPException(status_code=400, detail="No attended students were found for this event.")

	updated_count = (
		db.query(Attendance)
		.filter(Attendance.event_id == event.id, Attendance.certificate_issued_at.is_(None))
		.update({Attendance.certificate_issued_at: func.now()}, synchronize_session=False)
	)
	db.commit()

	return CertificateGenerationRead(
		event_id=event.id,
		event_title=event.title,
		generated_count=updated_count,
		total_attended=attended_count,
	)


def list_my_certificates(db: Session, student: User, base_url: str) -> list[dict]:
	rows = (
		db.query(Attendance, Event)
		.join(Event, Event.id == Attendance.event_id)
		.filter(Attendance.student_id == student.user_id, Attendance.certificate_issued_at.is_not(None))
		.order_by(Attendance.certificate_issued_at.desc())
		.all()
	)

	return [
		{
			"attendance_id": attendance.id,
			"event_id": event.id,
			"event_title": event.title,
			"student_id": attendance.student_id,
			"student_name": student.full_name,
			"student_email": student.email,
			"attended_at": attendance.attended_at,
			"certificate_issued_at": attendance.certificate_issued_at,
			"verification_url": _verification_url(base_url, attendance.id),
		}
		for attendance, event in rows
	]


def get_certificate(db: Session, attendance_id: int, base_url: str) -> dict:
	row = (
		db.query(Attendance, Event, User)
		.join(Event, Event.id == Attendance.event_id)
		.join(User, User.user_id == Attendance.student_id)
		.filter(Attendance.id == attendance_id)
		.first()
	)

	if not row:
		raise HTTPException(status_code=404, detail="Certificate not found.")

	attendance, event, student = row
	if attendance.certificate_issued_at is None:
		raise HTTPException(status_code=404, detail="Certificate not found.")

	return {
		"attendance_id": attendance.id,
		"event_id": event.id,
		"event_title": event.title,
		"student_id": student.user_id,
		"student_name": student.full_name,
		"student_email": student.email,
		"attended_at": attendance.attended_at,
		"certificate_issued_at": attendance.certificate_issued_at,
		"verification_url": _verification_url(base_url, attendance.id),
	}