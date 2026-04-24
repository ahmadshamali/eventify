from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.sql import func

from app.db.base import Base


class Registration(Base):
	__tablename__ = "registrations"

	id = Column(Integer, primary_key=True, index=True)
	event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
	student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	__table_args__ = (
		UniqueConstraint("event_id", "student_id", name="uq_registration_event_student"),
	)
