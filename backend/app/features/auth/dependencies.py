from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError, decode
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
	credentials: HTTPAuthorizationCredentials = Depends(security),
	db: Session = Depends(get_db),
) -> User:
	token = credentials.credentials

	try:
		payload = decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
		subject = payload.get("sub")
		if not subject:
			raise ValueError("Missing subject")
		user_id = int(subject)
	except (PyJWTError, ValueError, TypeError):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

	user = (
		db.query(User)
		.options(joinedload(User.role), joinedload(User.organizer_profile), joinedload(User.student_profile))
		.filter(User.user_id == user_id)
		.first()
	)
	if not user:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

	return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
	role_name = current_user.role.role_name if current_user.role else None
	if role_name != "admin":
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

	return current_user
