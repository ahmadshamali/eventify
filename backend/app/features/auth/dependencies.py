from fastapi import Depends, Header, HTTPException, status
from jwt import PyJWTError
import jwt
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User


def get_current_user(
	db: Session = Depends(get_db), authorization: str | None = Header(default=None)
) -> User:
	if not authorization or not authorization.startswith("Bearer "):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Missing or invalid authorization header.",
		)

	token = authorization.split(" ", 1)[1].strip()
	if not token:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Missing access token.",
		)

	try:
		payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
	except PyJWTError as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid or expired token.",
		) from exc

	subject = payload.get("sub")
	if not subject:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid token payload.",
		)

	try:
		user_id = int(subject)
	except (TypeError, ValueError) as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid token payload.",
		) from exc

	db_user = (
		db.query(User)
		.options(joinedload(User.role), joinedload(User.organizer_profile), joinedload(User.student_profile))
		.filter(User.user_id == user_id)
		.first()
	)

	if not db_user:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="User not found.",
		)

	return db_user


def require_organizer(current_user: User = Depends(get_current_user)) -> User:
	if not current_user.role or current_user.role.role_name != "organizer":
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Only organizers can perform this action.",
		)
	return current_user


def require_organizer_or_admin(current_user: User = Depends(get_current_user)) -> User:
	if not current_user.role or current_user.role.role_name not in {"organizer", "admin"}:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Only organizers or admins can perform this action.",
		)
	return current_user


def require_student(current_user: User = Depends(get_current_user)) -> User:
	if not current_user.role or current_user.role.role_name != "student":
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Only students can perform this action.",
		)
	return current_user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
	if not current_user.role or current_user.role.role_name != "admin":
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Admin access required",
		)
	return current_user
