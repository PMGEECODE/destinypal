"""
Donation schemas - Updated with all required fields.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from enum import Enum


class DonationFrequency(str, Enum):
    """Donation frequency options."""
    ONE_TIME = "one_time"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"


class DonationCreate(BaseModel):
    """Donation creation schema with all fields."""
    donor_name: str = Field(min_length=2, max_length=255)
    donor_email: EmailStr
    donor_phone: Optional[str] = Field(default=None, max_length=20)
    amount: float = Field(gt=0, le=1000000)
    currency: str = Field(default="USD", pattern="^(USD|KES|UGX|TZS)$")
    payment_method: str = Field(pattern="^(mpesa|airtel_money|card|bank_transfer|paypal)$")
    frequency: DonationFrequency = Field(default=DonationFrequency.ONE_TIME)
    message: Optional[str] = Field(default=None, max_length=1000)
    is_anonymous: bool = Field(default=False)
    transaction_id: Optional[UUID] = None
    student_id: Optional[UUID] = None  # If donating to specific student


class DonationUpdate(BaseModel):
    """Donation update schema."""
    message: Optional[str] = Field(default=None, max_length=1000)
    is_anonymous: Optional[bool] = None


class DonationResponse(BaseModel):
    """Donation response schema."""
    id: UUID
    sponsor_id: Optional[UUID] = None
    student_id: Optional[UUID] = None
    transaction_id: Optional[UUID] = None
    donor_name: str
    donor_email: str
    donor_phone: Optional[str] = None
    amount: float
    currency: str
    payment_method: str
    frequency: str
    message: Optional[str] = None
    is_anonymous: bool
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DonationListResponse(BaseModel):
    """Paginated donation list response."""
    items: list[DonationResponse]
    total: int
    page: int
    size: int
    pages: int
