
import logging
import secrets
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from app.core.security import hash_password, verify_password
from app.models.user import User, StudentProfile, OrganizerProfile, Role
from app.features.auth.schemas import UserRegister, UserLogin

logger = logging.getLogger(__name__)


def generate_verification_code(db) -> str:
    for _ in range(20):
        code = f"{secrets.randbelow(1_000_000):06d}"
        existing_code = db.query(User.user_id).filter(User.verification_token == code).first()
        if not existing_code:
            return code

    raise ValueError("Unable to generate verification code")


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
    
    for attempt in range(5):
        verification_code = generate_verification_code(db)

        # Create user
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=hash_password(user_data.password),
            role_id=role.role_id,
            email_verified=False,
            account_status="pending",
            verification_token=verification_code,
        )
        db.add(db_user)
        db.flush()  # Flush to get the user_id

        # Create associated profile based on role
        if user_data.role == "student" and user_data.student_profile:
            student_profile = StudentProfile(
                student_id=db_user.user_id,
                student_number=student_number,
                major=user_data.student_profile.major,
            )
            db.add(student_profile)

        elif user_data.role == "organizer" and user_data.organizer_profile:
            organizer_profile = OrganizerProfile(
                organizer_id=db_user.user_id,
                club_name=user_data.organizer_profile.club_name,
                approved_by=None,  # Will be set when admin approves
                approved_at=None,
                rejection_reason=None,
            )
            db.add(organizer_profile)

        try:
            db.commit()
            break
        except IntegrityError as exc:
            db.rollback()
            error_message = str(getattr(exc, "orig", exc)).lower()
            if "verification_token" in error_message and attempt < 4:
                continue
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


def verify_email(db, code: str):
    """
    Verify user email using a 6-digit verification code.
    For students: set email_verified=True and account_status='active'
    For organizers: set email_verified=True and account_status='pending_approval'
    """
    db_user = db.query(User).filter(User.verification_token == code).first()
    
    if not db_user:
        raise ValueError("Invalid or expired verification code")
    
    if db_user.email_verified:
        raise ValueError("Email is already verified")
    
    db_user.email_verified = True
    db_user.verification_token = None  # Invalidate token after use
    
    # Set account status based on role
    role = db.query(Role).filter(Role.role_id == db_user.role_id).first()
    if role and role.role_name == "student":
        db_user.account_status = "active"
    elif role and role.role_name == "organizer":
        db_user.account_status = "pending_approval"
    
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Database error during email verification")
    
    db.refresh(db_user)
    
    db_user = db.query(User).options(
        joinedload(User.role),
        joinedload(User.student_profile),
        joinedload(User.organizer_profile)
    ).filter(User.user_id == db_user.user_id).first()
    
    return db_user


def login_user(db, credentials: UserLogin):
    """
    Authenticate user by email and password.
    - Email must be verified
    - Account status must be 'active'
    """
    normalized_email = str(credentials.email).strip().lower()

    db_user = (
        db.query(User)
        .options(
            joinedload(User.role),
            joinedload(User.student_profile),
            joinedload(User.organizer_profile),
        )
        .filter(User.email == normalized_email)
        .first()
    )

    if not db_user:
        raise ValueError("Invalid email or password")

    if not verify_password(credentials.password, db_user.password_hash):
        raise ValueError("Invalid email or password")
    
    if not db_user.email_verified:
        raise ValueError("Email is not verified. Please check your email for verification link.")
    
    if db_user.account_status != "active":
        if db_user.account_status == "pending_approval":
            raise ValueError("Account is pending admin approval. Please wait for approval.")
        raise ValueError(f"Account is {db_user.account_status}. Contact support for more information.")

    return db_user
