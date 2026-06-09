from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.sql import func

from app.db.base import Base


class Attendance(Base):
	__tablename__ = "attendance"

	id = Column(Integer, primary_key=True, index=True)
	registration_id = Column(Integer, ForeignKey("registrations.id", ondelete="CASCADE"), nullable=False, index=True)
	event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
	student_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
	scanned_by = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
	attended_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	__table_args__ = (
		UniqueConstraint("registration_id", name="uq_attendance_registration"),
	)
