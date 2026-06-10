from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.auth.dependencies import get_current_admin
from app.features.dashboard import service
from app.features.dashboard.schemas import (
	AdminEventRead,
	AdminOverviewRead,
	AdminUserRead,
	PendingOrganizerRead,
	PendingOrganizerRejectRequest,
)
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin-dashboard"])


@router.get("/overview", response_model=AdminOverviewRead)
def read_admin_overview(
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	return service.get_admin_overview(db)


@router.get("/pending-organizers", response_model=list[PendingOrganizerRead])
def read_pending_organizers(
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	return service.get_pending_organizers(db)


@router.post("/pending-organizers/{organizer_user_id}/approve", status_code=status.HTTP_204_NO_CONTENT)
def approve_pending_organizer(
	organizer_user_id: int,
	db: Session = Depends(get_db),
	current_admin: User = Depends(get_current_admin),
):
	service.approve_organizer(db, organizer_user_id=organizer_user_id, admin_user_id=current_admin.user_id)
	return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/pending-organizers/{organizer_user_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
def reject_pending_organizer(
	organizer_user_id: int,
	payload: PendingOrganizerRejectRequest,
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	service.reject_organizer(db, organizer_user_id=organizer_user_id, rejection_reason=payload.rejection_reason)
	return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/users", response_model=list[AdminUserRead])
def read_admin_users(
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	return service.get_admin_users(db)


@router.get("/events", response_model=list[AdminEventRead])
def read_admin_events(
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	return service.get_admin_events(db)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_user(
	user_id: int,
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	service.delete_user_as_admin(db, user_id)
	return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_event(
	event_id: int,
	db: Session = Depends(get_db),
	_: User = Depends(get_current_admin),
):
	service.delete_event_as_admin(db, event_id)
	return Response(status_code=status.HTTP_204_NO_CONTENT)
