from datetime import datetime
import re
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, AliasChoices, field_validator, model_validator


RoleName = Literal["student", "organizer"]
AccountStatus = Literal["pending", "pending_approval", "approved", "rejected", "active", "disabled", "deleted"]


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

    @field_validator("email")
    @classmethod
    def validate_registration_email(cls, value):
        email = str(value).lower()
        if not re.fullmatch(r"(?:\d{4}|\d{7})@(student|staff)\.birzeit\.edu", email):
            raise ValueError("email must start with exactly 4 or 7 numbers and use a Birzeit university domain")
        return email

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value):
        if not re.search(r"[A-Z]", value):
            raise ValueError("password must contain an uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("password must contain a lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("password must contain a number")
        return value

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


class VerifyEmailRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, validation_alias=AliasChoices("code", "token"))


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, value):
        email = str(value).lower()
        if not (email.endswith("@student.birzeit.edu") or email.endswith("@staff.birzeit.edu")):
            raise ValueError("email must end with @student.birzeit.edu or @staff.birzeit.edu")
        return email


class VerifyResetCodeRequest(ForgotPasswordRequest):
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class ResetPasswordRequest(VerifyResetCodeRequest):
    new_password: str = Field(..., min_length=8, max_length=255)


class MessageResponse(BaseModel):
    message: str


class AuthLoginResponse(BaseModel):
    user: "UserRead"
    access_token: str
    token_type: str = "bearer"


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
