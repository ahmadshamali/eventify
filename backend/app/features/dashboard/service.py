from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.registration import Registration
from app.models.user import OrganizerProfile, Role, User
from app.models.user import StudentProfile


def get_admin_overview(db: Session) -> dict[str, int]:
	total_users = db.query(User).count()
	total_students = db.query(User).join(Role).filter(Role.role_name == "student").count()
	total_organizers = db.query(User).join(Role).filter(Role.role_name == "organizer").count()
	total_events = db.query(Event).count()
	pending_approvals = (
		db.query(User)
		.join(Role)
		.filter(Role.role_name == "organizer", User.account_status == "pending_approval")
		.count()
	)

	return {
		"total_users": total_users,
		"total_students": total_students,
		"total_organizers": total_organizers,
		"total_events": total_events,
		"pending_approvals": pending_approvals,
	}


def get_pending_organizers(db: Session) -> list[dict]:
	pending_organizers = (
		db.query(User, OrganizerProfile)
		.join(Role, User.role_id == Role.role_id)
		.join(OrganizerProfile, OrganizerProfile.organizer_id == User.user_id)
		.filter(Role.role_name == "organizer", User.account_status == "pending_approval")
		.order_by(User.created_at.asc())
		.all()
	)

	return [
		{
			"user_id": user.user_id,
			"full_name": user.full_name,
			"email": user.email,
			"club_name": organizer_profile.club_name,
			"submitted_at": user.created_at,
		}
		for user, organizer_profile in pending_organizers
	]


def approve_organizer(db: Session, organizer_user_id: int, admin_user_id: int) -> None:
	target_user = (
		db.query(User)
		.join(Role)
		.filter(User.user_id == organizer_user_id, Role.role_name == "organizer")
		.first()
	)

	if not target_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organizer not found")

	if target_user.account_status != "pending_approval":
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Only pending organizers can be approved",
		)

	organizer_profile = (
		db.query(OrganizerProfile)
		.filter(OrganizerProfile.organizer_id == organizer_user_id)
		.first()
	)
	if not organizer_profile:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organizer profile not found")

	target_user.account_status = "active"
	organizer_profile.approved_by = admin_user_id
	organizer_profile.approved_at = datetime.now(timezone.utc)
	organizer_profile.rejection_reason = None

	db.commit()


def reject_organizer(db: Session, organizer_user_id: int, rejection_reason: str | None) -> None:
	target_user = (
		db.query(User)
		.join(Role)
		.filter(User.user_id == organizer_user_id, Role.role_name == "organizer")
		.first()
	)

	if not target_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organizer not found")

	if target_user.account_status != "pending_approval":
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Only pending organizers can be rejected",
		)

	organizer_profile = (
		db.query(OrganizerProfile)
		.filter(OrganizerProfile.organizer_id == organizer_user_id)
		.first()
	)
	if not organizer_profile:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organizer profile not found")

	target_user.account_status = "rejected"
	organizer_profile.rejection_reason = rejection_reason.strip() if rejection_reason else None

	db.commit()


def get_admin_users(db: Session) -> list[dict]:
	users = (
		db.query(User, Role)
		.join(Role, User.role_id == Role.role_id)
		.order_by(User.created_at.desc())
		.all()
	)

	return [
		{
			"user_id": user.user_id,
			"full_name": user.full_name,
			"email": user.email,
			"role": role.role_name,
			"account_status": user.account_status,
			"created_at": user.created_at,
		}
		for user, role in users
	]


def get_admin_events(db: Session) -> list[dict]:
	events = db.query(Event).order_by(Event.created_at.desc()).all()

	return [
		{
			"id": event.id,
			"title": event.title,
			"subtitle": event.subtitle,
			"created_at": event.created_at,
			"capacity": event.capacity,
		}
		for event in events
	]


def delete_user_as_admin(db: Session, user_id: int) -> None:
	target_user = db.query(User).filter(User.user_id == user_id).first()
	if not target_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

	try:
		event_ids = [
			event_id
			for (event_id,) in db.query(Event.id).filter(Event.organizer_id == user_id).all()
		]

		if event_ids:
			db.query(Registration).filter(Registration.event_id.in_(event_ids)).delete(synchronize_session=False)
			db.query(Event).filter(Event.id.in_(event_ids)).delete(synchronize_session=False)

		db.query(Registration).filter(Registration.student_id == user_id).delete(synchronize_session=False)
		db.query(OrganizerProfile).filter(OrganizerProfile.approved_by == user_id).update(
			{OrganizerProfile.approved_by: None}, synchronize_session=False
		)
		db.query(OrganizerProfile).filter(OrganizerProfile.organizer_id == user_id).delete(synchronize_session=False)
		db.query(StudentProfile).filter(StudentProfile.student_id == user_id).delete(synchronize_session=False)

		db.delete(target_user)
		db.commit()
	except SQLAlchemyError as exc:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Failed to delete user.",
		) from exc


def delete_event_as_admin(db: Session, event_id: int) -> None:
	target_event = db.query(Event).filter(Event.id == event_id).first()
	if not target_event:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

	try:
		db.query(Registration).filter(Registration.event_id == event_id).delete(synchronize_session=False)
		db.delete(target_event)
		db.commit()
	except SQLAlchemyError as exc:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Failed to delete event.",
		) from exc
