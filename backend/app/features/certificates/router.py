from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import get_current_user, require_organizer, require_student
from app.features.certificates.schemas import CertificateDetailRead, CertificateRead, GenerateCertificatesResponse
from app.features.certificates.service import generate_event_certificates, get_certificate_by_id, get_my_certificates
from app.models.user import User

router = APIRouter()


@router.post("/events/{event_id}/generate", response_model=GenerateCertificatesResponse, status_code=status.HTTP_201_CREATED)
def generate_certificates(
	event_id: int,
	db: Session = Depends(get_db),
	organizer: User = Depends(require_organizer),
):
	return generate_event_certificates(db, event_id, organizer)


@router.get("/me", response_model=list[CertificateRead])
def read_my_certificates(
	db: Session = Depends(get_db),
	student: User = Depends(require_student),
):
	return get_my_certificates(db, student)


@router.get("/{certificate_id}", response_model=CertificateDetailRead)
def read_certificate(
	certificate_id: str,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	return get_certificate_by_id(db, certificate_id, current_user)