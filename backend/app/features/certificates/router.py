from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import require_organizer, require_student
from app.features.certificates.schemas import CertificateGenerationRead, CertificateRead
from app.features.certificates.service import generate_event_certificates, get_certificate, list_my_certificates
from app.models.user import User

router = APIRouter()


@router.post("/events/{event_id}/generate", response_model=CertificateGenerationRead, status_code=status.HTTP_201_CREATED)
def generate_certificates(
	event_id: int,
	request: Request,
	db: Session = Depends(get_db),
	organizer: User = Depends(require_organizer),
):
	return generate_event_certificates(db, event_id, organizer, str(request.base_url))


@router.get("/my-certificates", response_model=list[CertificateRead])
def my_certificates(
	request: Request,
	db: Session = Depends(get_db),
	student: User = Depends(require_student),
):
	return list_my_certificates(db, student, str(request.base_url))


@router.get("/{attendance_id}", response_model=CertificateRead)
def read_certificate(
	attendance_id: int,
	request: Request,
	db: Session = Depends(get_db),
):
	return get_certificate(db, attendance_id, str(request.base_url))