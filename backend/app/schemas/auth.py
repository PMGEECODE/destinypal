"""
Authentication schemas with security hardening.
"""
from datetime import datetime, date
from typing import Optional
from pydantic import EmailStr, Field, field_validator
from app.schemas.base import StrictSchema
import re


class LoginRequest(StrictSchema):
    """Login request schema."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginResponse(StrictSchema):
    """Login response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    requires_two_factor: bool = False
    user_id: str
    email: str
    role: str


class RegisterRequest(StrictSchema):
    """Base registration request schema."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    country: str = Field(default="Uganda", max_length=100)
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v
    
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format."""
        if v is None:
            return None
        if not v or len(v) < 7:
            return None
        # Remove spaces and dashes
        cleaned = re.sub(r"[\s\-]", "", v)
        # Must be digits with optional leading +
        if not re.match(r"^\+?\d{10,15}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned


class SponsorRegisterRequest(RegisterRequest):
    """Sponsor registration request."""
    id_number: Optional[str] = Field(default=None, max_length=50)
    county: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)


class InstitutionRegisterRequest(StrictSchema):
    """Institution registration request."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    institution_name: str = Field(min_length=2, max_length=255)
    institution_type: str = Field(default="secondary_school", pattern="^(primary_school|secondary_school|vocational|university|college)$")
    registration_number: Optional[str] = Field(default=None, max_length=100)
    accreditation_number: Optional[str] = Field(default=None, max_length=100)
    country: str = Field(default="Uganda", max_length=100)
    county: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=500)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    contact_person_name: str = Field(min_length=2, max_length=255)
    contact_person_title: Optional[str] = Field(default=None, max_length=100)
    contact_person_email: EmailStr
    contact_person_phone: Optional[str] = Field(default=None, max_length=20)
    website: Optional[str] = Field(default=None, max_length=255)
    student_capacity: Optional[int] = Field(default=None, ge=1, le=100000)
    year_established: Optional[int] = Field(default=None, ge=1800, le=2100)


class StudentRegisterRequest(StrictSchema):
    """Student registration request - creates both user and student records."""
    # User account fields
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)
    
    # Student-specific fields
    institution_id: str = Field(min_length=36, max_length=36)  # UUID format
    full_name: str = Field(min_length=2, max_length=255)
    date_of_birth: date
    gender: str = Field(pattern="^(male|female|other)$")
    grade_level: str = Field(max_length=50)
    location: Optional[str] = Field(default=None, max_length=255)
    
    # Optional profile fields
    background_story: Optional[str] = Field(default=None, max_length=2000)
    family_situation: Optional[str] = Field(default=None, max_length=2000)
    academic_performance: Optional[str] = Field(default=None, max_length=1000)
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v
    
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format."""
        if v is None:
            return None
        if not v or len(v) < 7:
            return None
        cleaned = re.sub(r"[\s\-]", "", v)
        if not re.match(r"^\+?\d{10,15}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned


class RefreshTokenRequest(StrictSchema):
    """Refresh token request."""
    refresh_token: str = Field(min_length=10, max_length=2000)


class PasswordResetRequest(StrictSchema):
    """Password reset request."""
    email: EmailStr


class PasswordResetConfirm(StrictSchema):
    """Password reset confirmation."""
    token: str = Field(min_length=32, max_length=256)
    new_password: str = Field(min_length=8, max_length=128)


class VerifyEmailRequest(StrictSchema):
    """Email verification request."""
    token: str = Field(min_length=32, max_length=256)


class VerifyCodeRequest(StrictSchema):
    """Verification code request (SMS/2FA)."""
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class TwoFactorSetupRequest(StrictSchema):
    """2FA setup request."""
    method: str = Field(pattern="^(email|sms|totp)$")


class TwoFactorSetupResponse(StrictSchema):
    """2FA setup response."""
    method: str
    backup_codes: list[str]
    totp_secret: Optional[str] = None
    totp_uri: Optional[str] = None


class TwoFactorVerifyRequest(StrictSchema):
    """2FA verification request."""
    code: str = Field(min_length=6, max_length=8, pattern=r"^[\dA-Z\-]{6,8}$")
    user_id: str = Field(min_length=36, max_length=36)  # UUID format


class TwoFactorDisableRequest(StrictSchema):
    """2FA disable request."""
    code: str = Field(min_length=6, max_length=8)
    password: str = Field(min_length=8, max_length=128)  # Require password confirmation
