
import logging
from app.core.security import hash_password, verify_password
from app.models.user import User, StudentProfile, OrganizerProfile, Role
from app.features.auth.schemas import UserRegister

logger = logging.getLogger(__name__)


def register_user(db, user_data: UserRegister):
    """
    Register a new user (student or organizer) with associated profile.
    """
    # Get role_id from role_name
    role = db.query(Role).filter(Role.role_name == user_data.role).first()
    if not role:
        raise ValueError(f"Role '{user_data.role}' not found")
    
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
            student_number=user_data.student_profile.student_number,
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

    db.commit()
    db.refresh(db_user)

    db_user = db.query(User).options(
        joinedload(User.role),
        joinedload(User.student_profile),
        joinedload(User.organizer_profile)
    ).filter(User.user_id == db_user.user_id).first()
    
    return db_user