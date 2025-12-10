"""
Contact submission model for storing contact form entries.
"""
from datetime import datetime
from typing import Optional
from enum import Enum
import uuid

from sqlalchemy import String, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDMixin


class InquiryType(str, Enum):
    """Contact form inquiry types."""
    GENERAL = "general"
    SPONSOR = "sponsor"
    INSTITUTION = "institution"
    STUDENT = "student"


class ContactStatus(str, Enum):
    """Contact submission status."""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    RESPONDED = "responded"


class ContactSubmission(Base, UUIDMixin, TimestampMixin):
    """
    Model for storing contact form submissions.
    
    Stores all contact form entries for tracking, analytics, and follow-up.
    """
    
    __tablename__ = "contact_submissions"
    
    # Contact details
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Inquiry information
    inquiry_type: Mapped[InquiryType] = mapped_column(
        SQLEnum(InquiryType),
        default=InquiryType.GENERAL,
        nullable=False,
    )
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Processing status
    status: Mapped[ContactStatus] = mapped_column(
        SQLEnum(ContactStatus),
        default=ContactStatus.PENDING,
        nullable=False,
    )
    
    # Metadata
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)  # IPv6 max length
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    turnstile_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Response tracking
    responded_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    response_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
