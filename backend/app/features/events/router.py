from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging

from app.db.session import get_db
from app.models.event import Event
from app.features.events.schemas import EventCreate, Event as EventSchema

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=list[EventSchema])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = db.query(Event).offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=EventSchema)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(
        title=event.title,
        subtitle=event.subtitle,
        description=event.description,
        capacity=event.capacity
    )
    try:
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {e}")
        raise HTTPException(status_code=400, detail="Invalid event data or duplicate entry.")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Internal database error.")

    return db_event