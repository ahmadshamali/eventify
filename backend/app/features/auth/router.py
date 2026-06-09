import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import get_db
from app.features.auth.schemas import (
    AuthLoginResponse,
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    UserLogin,
    UserRegister,
    UserRead,
    VerifyEmailRequest,
)
from app.features.auth.service import (
    login_user,
    register_user,
    request_password_reset,
    reset_password as reset_user_password,
    verify_email,
)
from app.shared.email import send_password_reset_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user (student or organizer).
    
    Request body should include:
    - For students: role="student", student_profile with major
    - For organizers: role="organizer", organizer_profile with club_name
    """
    import logging
    try:
        db_user = register_user(db, user_data)
        # Send verification email
        try:
            send_verification_email(db_user.email, db_user.verification_token)
        except Exception as e:
            # Log the error but don't fail the registration
            logging.getLogger(__name__).error(f"Failed to send verification email: {str(e)}")
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid registration data or duplicate entry.",
        )
    except SQLAlchemyError as e:
        db.rollback()
        logging.getLogger(__name__).error(f"SQLAlchemy error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )
    except Exception as e:
        db.rollback()
        logging.getLogger(__name__).error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/verify-email", response_model=UserRead, status_code=status.HTTP_200_OK)
def verify_email_endpoint(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """
    Verify user email using a 6-digit verification code.
    """
    try:
        db_user = verify_email(db, request.code)
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification request.",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database error.",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_message = "If an account exists for that email, a 6-digit reset code has been sent."

    try:
        reset_details = request_password_reset(db, request)
        if reset_details:
            db_user, reset_code = reset_details
            try:
                send_password_reset_email(db_user.email, reset_code)
            except Exception as exc:
                logger.error("Failed to send password reset email: %s", str(exc))
        return {"message": generic_message}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database error.",
        )
    except Exception:
        db.rollback()
        logger.exception("Unexpected error while requesting password reset")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to request password reset.",
        )


@router.post("/reset-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        reset_user_password(db, request)
        return {"message": "Password changed successfully. You can now sign in."}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database error.",
        )
    except Exception:
        db.rollback()
        logger.exception("Unexpected error while resetting password")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset password.",
        )


@router.post("/login", response_model=AuthLoginResponse, status_code=status.HTTP_200_OK)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password.
    """
    try:
        db_user = login_user(db, credentials)
        user_role = db_user.role.role_name if db_user.role else "student"
        access_token = create_access_token(subject=str(db_user.user_id), role=user_role)
        return {
            "user": db_user,
            "access_token": access_token,
            "token_type": "bearer",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database error.",
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )
