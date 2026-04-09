from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.events.schemas import EventCreate, Event as EventSchema
from app.features.events import service

router = APIRouter()

@router.get("/", response_model=list[EventSchema])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.get_events(db, skip=skip, limit=limit)

@router.post("/", response_model=EventSchema)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    return service.create_event(db, event)
