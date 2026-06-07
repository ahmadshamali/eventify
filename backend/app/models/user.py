from sqlalchemy import Column, Boolean, Enum, CheckConstraint, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.mysql import BIGINT, TINYINT, CHAR
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(TINYINT(unsigned=True), primary_key=True, autoincrement=True)
    role_name = Column(String(255), nullable=False, unique=True)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    role_id = Column(TINYINT(unsigned=True),
    ForeignKey("roles.role_id"),
        nullable=False,
        index=True
        )
    email  = Column(String(255), index=True, unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    email_verified = Column(Boolean, nullable=False, default=False)
    verification_token = Column(String(255), nullable=True, unique=True, index=True)
    reset_password_code = Column(String(6), nullable=True)
    reset_password_expires_at = Column(DateTime, nullable=True)
    reset_password_attempts = Column(Integer, nullable=False, default=0)
    account_status = Column(
        Enum("pending", "pending_approval", "approved", "rejected", "active", "disabled", "deleted"),
        nullable=False,
        default="pending"
    )
    permanent_qr_token = Column(CHAR(36), nullable=True, unique=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )
    __table_args__ = (
        CheckConstraint(
            "(email Like '%@student.birzeit.edu' OR "
            "email LIKE '%@staff.birzeit.edu')",
            name="chk_users_email"    
        ),
    )

    role = relationship("Role", back_populates="users")

    student_profile = relationship(
    "StudentProfile",
    back_populates="user",
    uselist=False
    )

    organizer_profile = relationship(
    "OrganizerProfile",
    back_populates="user",
    foreign_keys="OrganizerProfile.organizer_id",
    uselist=False
    )

class OrganizerProfile(Base):
    __tablename__ = "organizer_profiles"

    organizer_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    
    club_name = Column(String(255), nullable=False, unique=True)
   
    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    
    approved_at = Column(DateTime, nullable=True)
   
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # main organizer user account
    user = relationship(
        "User",
        foreign_keys=[organizer_id],
        back_populates="organizer_profile"
    )

    # admin/user who approved this organizer
    approver = relationship(
        "User",
        foreign_keys=[approved_by]
    )

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    student_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    
    student_number = Column(String(20), nullable=False, unique=True)
    
    major = Column(String(255), nullable=False)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    

    user = relationship("User", back_populates="student_profile")
