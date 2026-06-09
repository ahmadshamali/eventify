from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.features.feedback.schemas import FeedbackCreate
from app.models.feedback import Feedback
from app.models.registration import Registration
from app.models.event import Event
from app.models.user import User
from app.shared.event_time import resolve_event_end_datetime


def _to_feedback_read(feedback: Feedback, full_name: str):
    from app.features.feedback.schemas import FeedbackRead

    return FeedbackRead(
        id=feedback.id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=feedback.created_at,
        full_name=full_name,
    )


def create_feedback(db: Session, event_id: int, registration_id: int, payload: FeedbackCreate, student: User) -> Feedback:
    registration = db.query(Registration).filter(Registration.id == registration_id, Registration.event_id == event_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    if registration.student_id != student.user_id:
        raise HTTPException(status_code=403, detail="You can only submit feedback for your own registrations.")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    existing = db.query(Feedback).filter(Feedback.registration_id == registration_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this registration.")

    feedback = Feedback(registration_id=registration_id, rating=payload.rating, comment=payload.comment)

    try:
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return _to_feedback_read(feedback, student.full_name)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Feedback already submitted.")
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal database error.")


def get_feedback_by_registration(db: Session, event_id: int, registration_id: int):
    feedback_row = (
        db.query(Feedback)
        .join(Registration, Registration.id == Feedback.registration_id)
        .join(User, User.user_id == Registration.student_id)
        .filter(Registration.id == registration_id, Registration.event_id == event_id)
        .with_entities(Feedback, User.full_name)
        .first()
    )
    if not feedback_row:
        raise HTTPException(status_code=404, detail="Feedback not found.")

    feedback, full_name = feedback_row
    return _to_feedback_read(feedback, full_name)


def list_feedbacks_for_event(db: Session, event_id: int, organizer: User):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.organizer_id != organizer.user_id:
        raise HTTPException(status_code=403, detail="You can only view feedbacks for your own events.")

    feedback_rows = (
        db.query(Feedback)
        .join(Registration, Registration.id == Feedback.registration_id)
        .join(User, User.user_id == Registration.student_id)
        .filter(Registration.event_id == event_id)
        .with_entities(Feedback, User.full_name)
        .order_by(Feedback.created_at.desc())
        .all()
    )

    return [_to_feedback_read(feedback, full_name) for feedback, full_name in feedback_rows]
