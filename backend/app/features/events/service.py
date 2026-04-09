from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
import logging

from app.models.event import EventRead
from app.features.events.schemas import EventCreate

logger = logging.getLogger(__name__)

def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Event).offset(skip).limit(limit).all()

def create_event(db: Session, event: EventCreate):
    db_event = EventRead(
        title=event.title,
        subtitle=event.subtitle,
        description=event.description,
        capacity=event.capacity
    )
    try:
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {e}")
        raise HTTPException(status_code=400, detail="Invalid event data or duplicate entry.")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Internal database error.")
