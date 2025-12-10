"""
User schemas with security hardening.
"""
from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field
from uuid import UUID
from app.schemas.base import StrictSchema


class UserBase(StrictSchema):
    """Base user schema."""
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)
    role: str = Field(pattern="^(admin|sponsor|student|institution)$")


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(StrictSchema):
    """User update schema."""
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = None


class UserResponse(StrictSchema):
    """User response schema - excludes sensitive fields like password_hash."""
    id: UUID
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    email_verified: bool
    phone_verified: bool
    two_factor_enabled: bool
    created_at: datetime
    
    model_config = {"from_attributes": True, "extra": "forbid"}


class UserProfileBase(StrictSchema):
    """Base user profile schema."""
    full_name: Optional[str] = Field(default=None, max_length=255)
    id_number: Optional[str] = Field(default=None, max_length=50)
    country: Optional[str] = Field(default=None, max_length=100)
    county: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=500)
    avatar_url: Optional[str] = Field(default=None, max_length=1000)


class UserProfileCreate(UserProfileBase):
    """User profile creation schema."""
    pass


class UserProfileUpdate(UserProfileBase):
    """User profile update schema."""
    pass


class UserProfileResponse(StrictSchema):
    """User profile response schema."""
    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    country: Optional[str] = None
    county: Optional[str] = None
    state: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True, "extra": "forbid"}


class UserWithProfile(UserResponse):
    """User with profile response."""
    profile: Optional[UserProfileResponse] = None
