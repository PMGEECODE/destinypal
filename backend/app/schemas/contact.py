"""
Contact form schemas with validation.
"""
from datetime import datetime
from typing import Optional, Literal, List
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class InquiryTypeEnum(str, Enum):
    """Inquiry type enum matching frontend types."""
    GENERAL = "general"
    SPONSOR = "sponsor"
    INSTITUTION = "institution"
    STUDENT = "student"
    SPONSORSHIP = "sponsorship"
    PARTNERSHIP = "partnership"
    SUPPORT = "support"
    MEDIA = "media"
    OTHER = "other"


class ContactStatusEnum(str, Enum):
    """Contact submission status enum."""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    RESPONDED = "responded"


class ContactMessageBase(BaseModel):
    """Base schema for contact message fields."""
    name: str = Field(..., min_length=2, max_length=100, description="Sender's full name")
    email: EmailStr = Field(..., description="Sender's email address")
    phone: Optional[str] = Field(None, max_length=20, description="Optional phone number")
    inquiry_type: InquiryTypeEnum = Field(
        default=InquiryTypeEnum.GENERAL,
        description="Type of inquiry"
    )
    subject: str = Field(..., min_length=3, max_length=200, description="Message subject")
    message: str = Field(..., min_length=10, max_length=2000, description="Message content")
    
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        # Remove spaces and dashes for validation
        cleaned = v.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if not cleaned.lstrip("+").isdigit():
            raise ValueError("Phone number must contain only digits, spaces, dashes, or parentheses")
        return v
    
    class Config:
        extra = "ignore"
        use_enum_values = True


class ContactMessage(ContactMessageBase):
    """Schema for incoming contact form submission."""
    pass


class ContactFormSubmission(ContactMessageBase):
    """Extended contact message with Turnstile token for API submission."""
    cf_turnstile_response: Optional[str] = Field(
        None,
        description="Cloudflare Turnstile verification token"
    )


class ContactSubmissionResponse(BaseModel):
    """Response schema for successful contact submission."""
    message: str = Field(..., description="Success message")
    success: bool = Field(default=True, description="Whether the submission was successful")
    submission_id: Optional[UUID] = Field(None, description="ID of the stored submission")


class ContactSubmissionError(BaseModel):
    """Response schema for failed contact submission."""
    message: str = Field(..., description="Error message")
    success: bool = Field(default=False)
    error_code: Optional[str] = Field(None, description="Machine-readable error code")


class ContactSubmissionDB(ContactMessageBase):
    """Schema for contact submission stored in database."""
    id: UUID
    status: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    turnstile_verified: bool = False
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime] = None
    response_notes: Optional[str] = None
    is_read: bool = False
    
    class Config:
        from_attributes = True


class ContactSubmissionUpdate(BaseModel):
    """Schema for updating a contact submission (admin use)."""
    status: Optional[ContactStatusEnum] = Field(None, description="New status")
    response_notes: Optional[str] = Field(None, max_length=2000, description="Admin response notes")
    is_read: Optional[bool] = Field(None, description="Mark as read/unread")


class ContactSubmissionListResponse(BaseModel):
    """Paginated list response for contact submissions."""
    items: List[ContactSubmissionDB]
    total: int
    page: int
    page_size: int
    total_pages: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    """Response for unread message count."""
    unread_count: int
