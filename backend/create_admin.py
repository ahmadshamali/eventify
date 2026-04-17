#!/usr/bin/env python
import os

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import Role, User


def _is_allowed_admin_email(email: str) -> bool:
    normalized = email.strip().lower()
    return normalized.endswith("@staff.birzeit.edu") or normalized.endswith("@student.birzeit.edu")

def create_admin():
    db = SessionLocal()

    admin_email = os.getenv("ADMIN_EMAIL", "admin@staff.birzeit.edu").strip().lower()
    admin_full_name = os.getenv("ADMIN_FULL_NAME", "Admin User").strip() or "Admin User"
    admin_password = os.getenv("ADMIN_PASSWORD", "").strip()

    if not _is_allowed_admin_email(admin_email):
        print("Error: ADMIN_EMAIL must end with @staff.birzeit.edu or @student.birzeit.edu")
        return False

    if len(admin_password) < 8:
        print("Error: Set ADMIN_PASSWORD env var with at least 8 characters")
        return False

    try:
        # Check if admin role exists
        admin_role = db.query(Role).filter(Role.role_name == "admin").first()
        if not admin_role:
            print("Error: 'admin' role not found in database")
            return False

        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print("Admin user already exists!")
            return False

        # Create admin
        admin_user = User(
            email=admin_email,
            full_name=admin_full_name,
            password_hash=hash_password(admin_password),
            role_id=admin_role.role_id,
            email_verified=True,
            account_status="active",
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully!")
        return True
    except Exception as exc:
        db.rollback()
        print(f"Error creating admin user: {exc}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()

# To run this script, use the command: docker-compose exec api python create_admin.py    