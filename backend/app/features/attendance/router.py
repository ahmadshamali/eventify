from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import require_organizer
from app.features.attendance.schemas import AttendanceRead, AttendanceStudentRead, ScanQRRequest
from app.features.attendance.service import get_event_attendance, scan_qr_and_mark_attendance
from app.models.user import User

router = APIRouter()


@router.post("/scan", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def scan_qr_code(
	payload: ScanQRRequest,
	db: Session = Depends(get_db),
	organizer: User = Depends(require_organizer),
):
	return scan_qr_and_mark_attendance(db, payload.qr_token, organizer)


@router.get("/event/{event_id}", response_model=list[AttendanceStudentRead])
def get_attendance_list(
	event_id: int,
	db: Session = Depends(get_db),
	organizer: User = Depends(require_organizer),
):
	return get_event_attendance(db, event_id, organizer)
