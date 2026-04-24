from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class AdminOverviewRead(BaseModel):
	total_users: int
	total_students: int
	total_organizers: int
	total_events: int
	pending_approvals: int


class PendingOrganizerRead(BaseModel):
	user_id: int
	full_name: str
	email: str
	club_name: str
	submitted_at: datetime


class PendingOrganizerRejectRequest(BaseModel):
	rejection_reason: Optional[str] = Field(default=None, max_length=500)


class AdminUserRead(BaseModel):
	user_id: int
	full_name: str
	email: str
	role: str
	account_status: Literal["pending", "pending_approval", "approved", "rejected", "active", "disabled", "deleted"]
	created_at: datetime


class AdminEventRead(BaseModel):
	id: int
	title: str
	subtitle: str
	created_at: datetime
	capacity: Optional[int] = None
