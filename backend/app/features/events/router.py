from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import get_optional_current_user, require_organizer, require_organizer_or_admin
from app.features.events.schemas import CancelEventRequest, EventCreate, EventRead as EventSchema, EventUpdate
from app.features.events import service
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=list[EventSchema])
def read_events(
    skip: int = 0,
    limit: int = 100,
    include_completed: bool = False,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    return service.get_events(db, skip=skip, limit=limit, current_user=current_user, include_completed=include_completed)


@router.post("/", response_model=EventSchema, status_code=status.HTTP_201_CREATED)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    return service.create_event(db, event, organizer)


@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    organizer: User = Depends(require_organizer),
):
    return service.update_event(db, event_id, payload, organizer)


@router.post("/{event_id}/cancel", response_model=EventSchema)
def cancel_event(
    event_id: int,
    request: CancelEventRequest,
    db: Session = Depends(get_db),
    organizer: User = Depends(require_organizer),
):
    if not request.confirm:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Cancellation confirmation is required.")
    return service.cancel_event(db, event_id, organizer)
