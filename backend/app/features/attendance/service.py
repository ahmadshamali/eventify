import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User

logger = logging.getLogger(__name__)


def scan_qr_and_mark_attendance(db: Session, qr_token: str, organizer: User) -> Attendance:
	registration = (
		db.query(Registration)
		.filter(Registration.qr_token == qr_token)
		.first()
	)
	if not registration:
		raise HTTPException(status_code=404, detail="Invalid QR code.")

	event = db.query(Event).filter(Event.id == registration.event_id).first()
	if not event:
		raise HTTPException(status_code=404, detail="Event not found.")

	if event.organizer_id != organizer.user_id:
		raise HTTPException(status_code=403, detail="You are not the organizer of this event.")

	existing = (
		db.query(Attendance)
		.filter(Attendance.registration_id == registration.id)
		.first()
	)
	if existing:
		raise HTTPException(status_code=400, detail="Student is already marked as attended.")

	attendance = Attendance(
		registration_id=registration.id,
		event_id=event.id,
		student_id=registration.student_id,
		scanned_by=organizer.user_id,
	)
	db.add(attendance)
	db.commit()
	db.refresh(attendance)

	logger.info(
		"Organizer %s marked student %s as attended for event %s",
		organizer.user_id,
		registration.student_id,
		event.id,
	)
	return attendance


def get_event_attendance(db: Session, event_id: int, organizer: User) -> list[dict]:
	event = db.query(Event).filter(Event.id == event_id).first()
	if not event:
		raise HTTPException(status_code=404, detail="Event not found.")

	if event.organizer_id != organizer.user_id:
		raise HTTPException(status_code=403, detail="You are not the organizer of this event.")

	rows = (
		db.query(Attendance, User)
		.join(User, User.user_id == Attendance.student_id)
		.filter(Attendance.event_id == event_id)
		.order_by(Attendance.attended_at.asc())
		.all()
	)

	return [
		{
			"attendance_id": attendance.id,
			"student_id": user.user_id,
			"full_name": user.full_name,
			"email": user.email,
			"attended_at": attendance.attended_at,
		}
		for attendance, user in rows
	]
