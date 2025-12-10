"""
Institution schemas.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID


class InstitutionBase(BaseModel):
    """Base institution schema."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    region: Optional[str] = None
    country: str = "Uganda"
    institution_type: str = "secondary_school"
    registration_number: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_email: Optional[EmailStr] = None
    contact_person_phone: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    """Institution creation schema."""
    user_id: Optional[UUID] = None


class InstitutionUpdate(BaseModel):
    """Institution update schema."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    region: Optional[str] = None
    institution_type: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_email: Optional[EmailStr] = None
    contact_person_phone: Optional[str] = None
    is_verified: Optional[bool] = None
    compliance_status: Optional[str] = None
    compliance_reason: Optional[str] = None


class InstitutionResponse(InstitutionBase):
    """Institution response schema."""
    id: UUID
    user_id: Optional[UUID] = None
    is_verified: bool
    compliance_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class InstitutionDetailResponse(InstitutionResponse):
    """Detailed institution response."""
    student_count: int = 0
