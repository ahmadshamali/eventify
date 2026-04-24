from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
import logging

from app.models.event import Event
from app.features.events.schemas import EventCreate, EventUpdate
from app.models.registration import Registration
from app.models.user import User

logger = logging.getLogger(__name__)


def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.status != "Canceled").offset(skip).limit(limit).all()


def get_event_by_id(db: Session, event_id: int) -> Event:
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return db_event


def _count_registrations(db: Session, event_id: int) -> int:
    return db.query(Registration).filter(Registration.event_id == event_id).count()


def _recompute_event_status(db: Session, db_event: Event) -> None:
    if db_event.status == "Canceled":
        return
    registrations_count = _count_registrations(db, db_event.id)
    db_event.status = "Full" if registrations_count >= db_event.capacity else "Available"


def create_event(db: Session, event: EventCreate, organizer: User):
    db_event = Event(
        title=event.title,
        description=event.description,
        start_datetime=event.start_datetime,
        location=event.location,
        category=event.category,
        status="Available",
        capacity=event.capacity,
        organizer_id=organizer.user_id,
    )
    try:
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        logger.info("Organizer %s created event %s", organizer.user_id, db_event.id)
        return db_event
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {e}")
        raise HTTPException(status_code=400, detail="Invalid event data or duplicate entry.")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Internal database error.")


def update_event(db: Session, event_id: int, payload: EventUpdate, organizer: User) -> Event:
    db_event = get_event_by_id(db, event_id)
    if db_event.organizer_id != organizer.user_id:
        raise HTTPException(status_code=403, detail="You can only update your own events.")

    if db_event.status == "Canceled":
        raise HTTPException(status_code=400, detail="Canceled events cannot be updated.")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(db_event, field, value)

    try:
        _recompute_event_status(db, db_event)
        db.commit()
        db.refresh(db_event)
        logger.info("Organizer %s updated event %s", organizer.user_id, db_event.id)
        return db_event
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error while updating event: {e}")
        raise HTTPException(status_code=400, detail="Invalid updated event data.")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error while updating event: {e}")
        raise HTTPException(status_code=500, detail="Internal database error.")


def cancel_event(db: Session, event_id: int, organizer: User):
    db_event = get_event_by_id(db, event_id)
    if db_event.organizer_id != organizer.user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own events.")

    registered_students = (
        db.query(Registration.student_id).filter(Registration.event_id == db_event.id).all()
    )

    deleted_event_snapshot = {
        "id": db_event.id,
        "title": db_event.title,
        "description": db_event.description,
        "start_datetime": db_event.start_datetime,
        "location": db_event.location,
        "category": db_event.category,
        "status": "Canceled",
        "capacity": db_event.capacity,
        "organizer_id": db_event.organizer_id,
        "created_at": db_event.created_at,
    }

    try:
        db.query(Registration).filter(Registration.event_id == db_event.id).delete(synchronize_session=False)
        db.delete(db_event)
        db.commit()

        logger.info("Organizer %s canceled and deleted event %s", organizer.user_id, deleted_event_snapshot["id"])
        logger.info(
            "Notify organizer %s: event %s was canceled and removed.",
            organizer.user_id,
            deleted_event_snapshot["id"],
        )
        logger.info(
            "Notify registered students for event %s: %s",
            deleted_event_snapshot["id"],
            [student_id for (student_id,) in registered_students],
        )

        return deleted_event_snapshot
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error while canceling event: {e}")
        raise HTTPException(status_code=500, detail="Internal database error.")
