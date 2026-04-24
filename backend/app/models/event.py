from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from app.db.base import Base          # ← updated import


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True, nullable=False)
    subtitle = Column(String(255), index=True, nullable=True, server_default="")
    description = Column(Text, nullable=True)
    start_datetime = Column(DateTime, nullable=False, server_default=func.now())
    location = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    status = Column(
        Enum("Available", "Full", "Canceled", name="event_status_enum"),
        nullable=False,
        default="Available",
        server_default="Available",
    )
    capacity = Column(Integer, nullable=False, default=1, server_default="1")
    organizer_id = Column(Integer, ForeignKey("users.user_id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())