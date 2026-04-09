#!/usr/bin/env python
import sys
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, Role

def create_admin():
    db = SessionLocal()
    
    # Check if admin role exists
    admin_role = db.query(Role).filter(Role.role_name == "admin").first()
    if not admin_role:
        print("Error: 'admin' role not found in database")
        return False
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == "admin@staff.birzeit.edu").first()
    if existing_admin:
        print("Admin user already exists!")
        return False
    
    # Create admin
    admin_user = User(
        email="admin@staff.birzeit.edu",
        full_name="Admin User",
        password_hash=hash_password("admin_password_123"),
        role_id=admin_role.role_id,
        email_verified=True,
        account_status="active"
    )
    db.add(admin_user)
    db.commit()
    print("Admin user created successfully!")
    return True

if __name__ == "__main__":
    create_admin()

# To run this script, use the command: docker-compose exec api python create_admin.py    