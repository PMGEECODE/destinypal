"""
Sponsor schemas.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from uuid import UUID


class SponsorBase(BaseModel):
    """Base sponsor schema."""
    full_name: str
    email: EmailStr
    phone: Optional[str] = None


class SponsorCreate(SponsorBase):
    """Sponsor creation schema."""
    user_id: Optional[UUID] = None


class SponsorUpdate(BaseModel):
    """Sponsor update schema."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    compliance_status: Optional[str] = None
    compliance_reason: Optional[str] = None


class SponsorResponse(SponsorBase):
    """Sponsor response schema."""
    id: UUID
    user_id: Optional[UUID] = None
    is_active: bool
    compliance_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SponsorshipBase(BaseModel):
    """Base sponsorship schema."""
    student_id: UUID
    commitment_type: str
    amount: float


class SponsorshipCreate(SponsorshipBase):
    """Sponsorship creation schema."""
    pass


class SponsorshipUpdate(BaseModel):
    """Sponsorship update schema."""
    amount: Optional[float] = None
    status: Optional[str] = None


class SponsorshipResponse(SponsorshipBase):
    """Sponsorship response schema."""
    id: UUID
    sponsor_id: UUID
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class SponsorshipDetailResponse(SponsorshipResponse):
    """Detailed sponsorship response."""
    student_name: Optional[str] = None
    student_photo_url: Optional[str] = None
    institution_name: Optional[str] = None
