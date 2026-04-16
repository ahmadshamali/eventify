from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


RoleName = Literal["student", "organizer"]
AccountStatus = Literal["pending", "approved", "rejected", "active", "disabled", "deleted"]


class StudentProfileBase(BaseModel):
    major: str = Field(..., min_length=1, max_length=255)


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileRead(StudentProfileBase):
    student_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class OrganizerProfileBase(BaseModel):
    club_name: str = Field(..., min_length=1, max_length=255)


class OrganizerProfileCreate(OrganizerProfileBase):
    pass


class OrganizerProfileRead(OrganizerProfileBase):
    organizer_id: int
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, value):
        email = str(value).lower()
        if not (email.endswith("@student.birzeit.edu") or email.endswith("@staff.birzeit.edu")):
            raise ValueError("email must end with @student.birzeit.edu or @staff.birzeit.edu")
        return email


class UserRegister(UserBase):
    password: str = Field(..., min_length=8, max_length=255)
    role: RoleName
    student_profile: Optional[StudentProfileCreate] = None
    organizer_profile: Optional[OrganizerProfileCreate] = None

    @model_validator(mode="after")
    def validate_role_profiles(self):
        if self.role == "student":
            if self.student_profile is None:
                raise ValueError("student_profile is required when role is 'student'")
            if self.organizer_profile is not None:
                raise ValueError("organizer_profile must not be provided when role is 'student'")

        if self.role == "organizer":
            if self.organizer_profile is None:
                raise ValueError("organizer_profile is required when role is 'organizer'")
            if self.student_profile is not None:
                raise ValueError("student_profile must not be provided when role is 'organizer'")

        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=255)


class AuthLoginResponse(BaseModel):
    user: "UserRead"


class RoleRead(BaseModel):
    role_id: int
    role_name: str

    class Config:
        from_attributes = True


class UserRead(UserBase):
    user_id: int
    email_verified: bool
    account_status: AccountStatus
    permanent_qr_token: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    role: Optional[RoleRead] = None
    student_profile: Optional[StudentProfileRead] = None
    organizer_profile: Optional[OrganizerProfileRead] = None

    class Config:
        from_attributes = True


AuthLoginResponse.model_rebuild()