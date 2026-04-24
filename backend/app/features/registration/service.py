import logging

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User

logger = logging.getLogger(__name__)


def register_student_for_event(db: Session, event_id: int, student: User) -> Registration:
	db_event = db.query(Event).filter(Event.id == event_id).first()
	if not db_event:
		raise HTTPException(status_code=404, detail="Event not found.")

	if db_event.status == "Canceled":
		raise HTTPException(status_code=400, detail="Registrations are closed for canceled events.")

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
