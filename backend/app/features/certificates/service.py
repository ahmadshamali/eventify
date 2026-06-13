from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.features.certificates.schemas import CertificateDetailRead, CertificateRead
from app.models.attendance import Attendance
from app.models.certificate import Certificate
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.shared.event_time import is_event_completed


def _to_certificate_read(certificate: Certificate) -> CertificateRead:
	return CertificateRead.model_validate(certificate)


def generate_event_certificates(db: Session, event_id: int, organizer: User) -> dict:
    # 1. Validation logic
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    if event.organizer_id != organizer.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to generate certificates for this event.")

    if not is_event_completed(event.end_datetime):
        raise HTTPException(status_code=400, detail="Certificates can only be generated after the event has ended.")

    # 2. Get attendees without certificates
    # We use a subquery to find registration IDs that ALREADY have certificates
    certs_subquery = db.query(Certificate.registration_id).filter(Certificate.event_id == event_id)
    
    attendees_to_process = (
        db.query(Attendance, Registration, User)
        .join(Registration, Attendance.registration_id == Registration.id)
        .join(User, Registration.student_id == User.user_id)
        .filter(Attendance.event_id == event_id)
        .filter(~Registration.id.in_(certs_subquery))
        .all()
    )

    if not attendees_to_process:
        return {
            "event_id": event_id,
            "total_attended": db.query(Attendance).filter(Attendance.event_id == event_id).count(),
            "generated_count": 0,
            "message": "All attendees already have certificates or no attendees found."
        }

    # 3. Batch Create
    new_certificates = []
    organizer_display_name = organizer.full_name or organizer.email.split('@')[0].capitalize()

    for attendance, registration, student in attendees_to_process:
        new_certificates.append(Certificate(
            id=str(uuid4()),
            event_id=event.id,
            registration_id=registration.id,
            student_id=student.user_id,
            organizer_id=organizer.user_id,
            student_name=student.full_name or "Participant",
            organizer_name=organizer_display_name,
            event_title=event.title
        ))

    db.add_all(new_certificates)
    db.commit()

    return {
        "event_id": event_id,
        "generated_count": len(new_certificates),
    }


def get_my_certificates(db: Session, student: User) -> list[CertificateRead]:
	certificates = (
		db.query(Certificate)
		.filter(Certificate.student_id == student.user_id)
		.order_by(Certificate.issued_at.desc(), Certificate.id.desc())
		.all()
	)
	return [_to_certificate_read(certificate) for certificate in certificates]


def get_certificate_by_id(db: Session, certificate_id: str, current_user: User) -> CertificateDetailRead:
	certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
	if not certificate:
		raise HTTPException(status_code=404, detail="Certificate not found.")

	user_role = current_user.role.role_name if current_user.role else None
	if user_role == "admin":
		return _to_certificate_detail_read(certificate)

	if user_role == "student" and certificate.student_id == current_user.user_id:
		return _to_certificate_detail_read(certificate)

	if user_role == "organizer" and certificate.organizer_id == current_user.user_id:
		return _to_certificate_detail_read(certificate)

	raise HTTPException(status_code=403, detail="You do not have access to this certificate.")


def _to_certificate_detail_read(certificate: Certificate) -> CertificateDetailRead:
	event = certificate.event
	student = certificate.student
	organizer = certificate.organizer

	return CertificateDetailRead(
		id=certificate.id,
		event_id=certificate.event_id,
		registration_id=certificate.registration_id,
		student_id=certificate.student_id,
		organizer_id=certificate.organizer_id,
		student_name=certificate.student_name,
		organizer_name=certificate.organizer_name,
		event_title=certificate.event_title,
		issued_at=certificate.issued_at,
		event_location=event.location,
		event_category=event.category,
		event_start_datetime=event.start_datetime,
		event_end_datetime=event.end_datetime,
		student_email=student.email,
		organizer_email=organizer.email,
		student_role=student.role.role_name if student.role else None,
		organizer_role=organizer.role.role_name if organizer.role else None,
	)