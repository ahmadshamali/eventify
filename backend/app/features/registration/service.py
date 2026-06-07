import logging
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.models.waitlist import WaitlistEntry
from app.shared.event_time import is_event_completed, normalize_datetime, resolve_event_end_datetime

logger = logging.getLogger(__name__)


def _get_event_for_update(db: Session, event_id: int) -> Event | None:
	return db.query(Event).filter(Event.id == event_id).with_for_update().first()


def promote_waitlisted_students(db: Session, db_event: Event) -> int:
	registered_count = db.query(Registration).filter(Registration.event_id == db_event.id).count()
	if registered_count >= db_event.capacity:
		db_event.status = "Full"
		return 0

	waitlist_entries = (
		db.query(WaitlistEntry)
		.filter(WaitlistEntry.event_id == db_event.id)
		.order_by(WaitlistEntry.created_at.asc(), WaitlistEntry.id.asc())
		.all()
	)
	promoted_count = 0

	for entry in waitlist_entries:
		existing_registration = (
			db.query(Registration)
			.filter(Registration.event_id == db_event.id, Registration.student_id == entry.student_id)
			.first()
		)
		if existing_registration:
			db.delete(entry)
			continue
		if registered_count >= db_event.capacity:
			break

		db.add(Registration(event_id=db_event.id, student_id=entry.student_id))
		db.delete(entry)
		registered_count += 1
		promoted_count += 1

	db.flush()
	db_event.status = "Full" if registered_count >= db_event.capacity else "Available"
	return promoted_count


def register_student_for_event(db: Session, event_id: int, student: User) -> Registration:
	db_event = _get_event_for_update(db, event_id)
	if not db_event:
		raise HTTPException(status_code=404, detail="Event not found.")

	if db_event.status == "Canceled":
		raise HTTPException(status_code=400, detail="Registrations are closed for canceled events.")

	if is_event_completed(resolve_event_end_datetime(db_event.start_datetime, db_event.end_datetime)):
		raise HTTPException(status_code=400, detail="Registrations are closed for completed events.")
	existing_registration = (
		db.query(Registration)
		.filter(Registration.event_id == event_id, Registration.student_id == student.user_id)
		.first()
	)
	if existing_registration:
		raise HTTPException(
			status_code=400,
			detail="You are already registered for this event.",
		)
	existing_waitlist_entry = (
		db.query(WaitlistEntry)
		.filter(WaitlistEntry.event_id == event_id, WaitlistEntry.student_id == student.user_id)
		.first()
	)
	if existing_waitlist_entry:
		raise HTTPException(status_code=400, detail="You are already on the waitlist for this event.")

	current_registrations = db.query(Registration).filter(Registration.event_id == event_id).count()
	if current_registrations >= db_event.capacity:
		db_event.status = "Full"
		db.commit()
		raise HTTPException(status_code=400, detail="Event is full.")

	registration = Registration(event_id=event_id, student_id=student.user_id)

	try:
		db.add(registration)
		db.flush()

		updated_registrations = db.query(Registration).filter(Registration.event_id == event_id).count()
		db_event.status = "Full" if updated_registrations >= db_event.capacity else "Available"

		db.commit()
		db.refresh(registration)

		logger.info(
			"Notify student %s: registration successful for event %s",
			student.user_id,
			event_id,
		)

		return registration
	except IntegrityError:
		db.rollback()
		raise HTTPException(
			status_code=400,
			detail="You are already registered for this event.",
		)
	except SQLAlchemyError as e:
		db.rollback()
		logger.error("Database error while creating registration: %s", str(e))
		raise HTTPException(status_code=500, detail="Internal database error.")


def get_registration_status(db: Session, event_id: int, student: User) -> dict[str, int | bool]:
	db_event = db.query(Event).filter(Event.id == event_id).first()
	if not db_event:
		raise HTTPException(status_code=404, detail="Event not found.")

	registered_count = db.query(Registration).filter(Registration.event_id == event_id).count()
	is_registered = (
		db.query(Registration)
		.filter(Registration.event_id == event_id, Registration.student_id == student.user_id)
		.first()
		is not None
	)
	waitlist_count = db.query(WaitlistEntry).filter(WaitlistEntry.event_id == event_id).count()
	is_in_waitlist = (
		db.query(WaitlistEntry)
		.filter(WaitlistEntry.event_id == event_id, WaitlistEntry.student_id == student.user_id)
		.first()
		is not None
	)

	return {
		"event_id": event_id,
		"is_registered": is_registered,
		"registered_count": registered_count,
		"capacity": db_event.capacity,
		"available_seats": max(db_event.capacity - registered_count, 0),
		"waitlist_count": waitlist_count,
		"is_in_waitlist": is_in_waitlist,
	}


def unregister_student_from_event(db: Session, event_id: int, student: User) -> None:
	db_event = _get_event_for_update(db, event_id)
	if not db_event:
		raise HTTPException(status_code=404, detail="Event not found.")

	registration = (
		db.query(Registration)
		.filter(Registration.event_id == event_id, Registration.student_id == student.user_id)
		.first()
	)
	if not registration:
		raise HTTPException(status_code=404, detail="You are not registered for this event.")

	try:
		db.delete(registration)
		db.flush()

		promoted_count = promote_waitlisted_students(db, db_event)

		db.commit()
		logger.info(
			"Notify student %s: registration removed for event %s",
			student.user_id,
			event_id,
		)
		if promoted_count:
			logger.info("Promoted %s waitlisted student(s) for event %s", promoted_count, event_id)
	except SQLAlchemyError as e:
		db.rollback()
		logger.error("Database error while removing registration: %s", str(e))
		raise HTTPException(status_code=500, detail="Internal database error.")


def join_event_waitlist(db: Session, event_id: int, student: User) -> WaitlistEntry:
	db_event = _get_event_for_update(db, event_id)
	if not db_event:
		raise HTTPException(status_code=404, detail="Event not found.")
	if db_event.status == "Canceled":
		raise HTTPException(status_code=400, detail="Waitlist is closed for canceled events.")
	if is_event_completed(resolve_event_end_datetime(db_event.start_datetime, db_event.end_datetime)):
		raise HTTPException(status_code=400, detail="Waitlist is closed for completed events.")

	if db.query(Registration).filter(Registration.event_id == event_id, Registration.student_id == student.user_id).first():
		raise HTTPException(status_code=400, detail="You are already registered for this event.")
	if db.query(WaitlistEntry).filter(WaitlistEntry.event_id == event_id, WaitlistEntry.student_id == student.user_id).first():
		raise HTTPException(status_code=400, detail="You are already on the waitlist for this event.")

	registered_count = db.query(Registration).filter(Registration.event_id == event_id).count()
	if registered_count < db_event.capacity:
		raise HTTPException(status_code=400, detail="Event has available seats. Register directly.")

	entry = WaitlistEntry(event_id=event_id, student_id=student.user_id)
	try:
		db.add(entry)
		db_event.status = "Full"
		db.commit()
		db.refresh(entry)
		return entry
	except IntegrityError:
		db.rollback()
		raise HTTPException(status_code=400, detail="You are already on the waitlist for this event.")
	except SQLAlchemyError as e:
		db.rollback()
		logger.error("Database error while joining waitlist: %s", str(e))
		raise HTTPException(status_code=500, detail="Internal database error.")


def leave_event_waitlist(db: Session, event_id: int, student: User) -> None:
	if not _get_event_for_update(db, event_id):
		raise HTTPException(status_code=404, detail="Event not found.")

	entry = (
		db.query(WaitlistEntry)
		.filter(WaitlistEntry.event_id == event_id, WaitlistEntry.student_id == student.user_id)
		.first()
	)
	if not entry:
		raise HTTPException(status_code=404, detail="You are not on the waitlist for this event.")

	try:
		db.delete(entry)
		db.commit()
	except SQLAlchemyError as e:
		db.rollback()
		logger.error("Database error while leaving waitlist: %s", str(e))
		raise HTTPException(status_code=500, detail="Internal database error.")


def get_student_registrations(db: Session, student: User) -> list[dict]:
	registrations = (
		db.query(Registration, Event)
		.join(Event, Event.id == Registration.event_id)
		.filter(Registration.student_id == student.user_id)
		.order_by(Registration.created_at.desc())
		.all()
	)

	return [
		{
			"registration_id": registration.id,
			"registered_at": registration.created_at,
			"event_id": event.id,
			"title": event.title,
			"description": event.description,
			"start_datetime": event.start_datetime,
			"end_datetime": event.end_datetime,
			"location": event.location,
			"category": event.category,
			"status": event.status,
			"capacity": event.capacity,
		}
		for registration, event in registrations
	]
