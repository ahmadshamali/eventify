from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import require_student
from app.features.registration.schemas import RegistrationRead
from app.features.registration.service import register_student_for_event
from app.models.user import User

router = APIRouter()


@router.post("/{event_id}/register", response_model=RegistrationRead, status_code=status.HTTP_201_CREATED)
def register_for_event(
	event_id: int,
	db: Session = Depends(get_db),
	student: User = Depends(require_student),
):
	return register_student_for_event(db, event_id, student)
