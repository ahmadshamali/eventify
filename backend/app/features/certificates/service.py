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
	event = db.query(Event).filter(Event.id == event_id).first()
	if not event:
		raise HTTPException(status_code=404, detail="Event not found.")

	if event.organizer_id != organizer.user_id:
		raise HTTPException(status_code=403, detail="You can only generate certificates for your own events.")

	if not is_event_completed(event.end_datetime):
		raise HTTPException(status_code=400, detail="Certificates can only be generated for completed events.")

	organizer_user = db.query(User).filter(User.user_id == event.organizer_id).first()
	if not organizer_user:
		raise HTTPException(status_code=404, detail="Organizer not found.")

	attendance_rows = (
		db.query(Attendance, Registration, User)
		.join(Registration, Registration.id == Attendance.registration_id)
		.join(User, User.user_id == Attendance.student_id)
		.filter(Attendance.event_id == event_id)
		.all()
	)

	created_count = 0
	for attendance, registration, student in attendance_rows:
		existing = db.query(Certificate).filter(Certificate.registration_id == registration.id).first()
		if existing:
			continue

		certificate = Certificate(
			id=str(uuid4()),
			event_id=event.id,
			registration_id=registration.id,
			student_id=student.user_id,
			organizer_id=organizer_user.user_id,
			student_name=student.full_name,
			organizer_name=organizer_user.full_name,
			event_title=event.title,
		)
		db.add(certificate)
		created_count += 1

	db.commit()

	return {
		"event_id": event.id,
		"total_attended": len(attendance_rows),
		"generated_count": created_count,
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