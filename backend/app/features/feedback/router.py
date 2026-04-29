from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import get_current_user
from app.features.feedback import service as feedback_service
from app.features.feedback.schemas import FeedbackCreate, FeedbackRead
from app.models.user import User

router = APIRouter()


@router.post("/{event_id}/registrations/{registration_id}/feedback", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
def submit_feedback(event_id: int, registration_id: int, payload: FeedbackCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return feedback_service.create_feedback(db, event_id, registration_id, payload, current_user)


@router.get("/{event_id}/registrations/{registration_id}/feedback", response_model=FeedbackRead)
def get_feedback(event_id: int, registration_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return feedback_service.get_feedback_by_registration(db, event_id, registration_id)


@router.get("/{event_id}/feedbacks", response_model=list[FeedbackRead])
def list_feedbacks(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return feedback_service.list_feedbacks_for_event(db, event_id, current_user)
