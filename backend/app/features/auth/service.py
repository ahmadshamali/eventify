
import logging
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from app.core.security import hash_password, verify_password
from app.models.user import User, StudentProfile, OrganizerProfile, Role
from app.features.auth.schemas import UserRegister

logger = logging.getLogger(__name__)


def register_user(db, user_data: UserRegister):
    """
    Register a new user (student or organizer) with associated profile.
    """

    student_number = user_data.email.split("@", 1)[0]
    if user_data.role == "student" and not student_number:
        raise ValueError("Unable to derive student number from email")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise ValueError("Email is already registered")

    # Get role_id from role_name
    role = db.query(Role).filter(Role.role_name == user_data.role).first()
    if not role:
        raise ValueError(f"Role '{user_data.role}' not found")

    if user_data.role == "student" and user_data.student_profile:
        existing_student_profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.student_number == student_number)
            .first()
        )
        if existing_student_profile:
            raise ValueError("Student number is already registered")
    
    # Create user
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hash_password(user_data.password),
        role_id=role.role_id,
        email_verified=False,
        account_status="pending"
    )
    db.add(db_user)
    db.flush()  # Flush to get the user_id

    # Create associated profile based on role
    if user_data.role == "student" and user_data.student_profile:
        student_profile = StudentProfile(
            student_id=db_user.user_id,
            student_number=student_number,
            major=user_data.student_profile.major
        )
        db.add(student_profile)

    elif user_data.role == "organizer" and user_data.organizer_profile:
        organizer_profile = OrganizerProfile(
            organizer_id=db_user.user_id,
            club_name=user_data.organizer_profile.club_name,
            approved_by=None,  # Will be set when admin approves
            approved_at=None,
            rejection_reason=None
        )
        db.add(organizer_profile)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        error_message = str(getattr(exc, "orig", exc)).lower()
        if "student_number" in error_message:
            raise ValueError("Student number is already registered")
        if "email" in error_message:
            raise ValueError("Email is already registered")
        raise ValueError("Invalid registration data or duplicate entry")

    db.refresh(db_user)

    db_user = db.query(User).options(
        joinedload(User.role),
        joinedload(User.student_profile),
        joinedload(User.organizer_profile)
    ).filter(User.user_id == db_user.user_id).first()
    
    return db_user
