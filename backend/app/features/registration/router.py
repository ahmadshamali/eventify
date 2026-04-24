from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import get_current_user
from app.features.registration.schemas import RegistrationRead, RegistrationStatusRead, StudentRegistrationEventRead
from app.features.registration.service import (
	get_registration_status,
	get_student_registrations,
	register_student_for_event,
	unregister_student_from_event,
)
from app.models.user import User

router = APIRouter()


@router.get("/my-registrations", response_model=list[StudentRegistrationEventRead])
def get_my_registrations(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	return get_student_registrations(db, current_user)


@router.post("/{event_id}/register", response_model=RegistrationRead, status_code=status.HTTP_201_CREATED)
def register_for_event(
	event_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	return register_student_for_event(db, event_id, current_user)


@router.get("/{event_id}/registration-status", response_model=RegistrationStatusRead)
def get_event_registration_status(
	event_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	return get_registration_status(db, event_id, current_user)


@router.delete("/{event_id}/register", status_code=status.HTTP_204_NO_CONTENT)
def unregister_from_event(
	event_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	unregister_student_from_event(db, event_id, current_user)
