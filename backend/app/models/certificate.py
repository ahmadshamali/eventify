from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship

from app.db.base import Base


class Certificate(Base):
	__tablename__ = "certificates"

	id = Column(CHAR(36), primary_key=True, index=True)
	event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
	registration_id = Column(Integer, ForeignKey("registrations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
	student_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
	organizer_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
	student_name = Column(String(255), nullable=False)
	organizer_name = Column(String(255), nullable=False)
	event_title = Column(String(255), nullable=False)
	issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	event = relationship("Event")
	registration = relationship("Registration")
	student = relationship("User", foreign_keys=[student_id])
	organizer = relationship("User", foreign_keys=[organizer_id])

	__table_args__ = (
		UniqueConstraint("registration_id", name="uq_certificate_registration"),
	)
