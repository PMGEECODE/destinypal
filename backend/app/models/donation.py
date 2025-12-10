"""
Donation model - Updated with all required fields.
"""
from typing import Optional, TYPE_CHECKING
import uuid
from enum import Enum as PyEnum

from sqlalchemy import String, Numeric, Text, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.sponsor import Sponsor
    from app.models.student import Student
    from app.models.payment import PaymentTransaction


class DonationFrequency(str, PyEnum):
    """Donation frequency options."""
    ONE_TIME = "one_time"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"


class DonationStatus(str, PyEnum):
    """Donation status options."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class OrganizationDonation(Base, UUIDMixin, TimestampMixin):
    """General donation to the organization."""
    
    __tablename__ = "organization_donations"
    
    # Foreign keys
    sponsor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sponsors.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    student_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("payment_transactions.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    # Donor info
    donor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    donor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    donor_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Payment info
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    frequency: Mapped[DonationFrequency] = mapped_column(
        SQLEnum(DonationFrequency),
        default=DonationFrequency.ONE_TIME,
        nullable=False,
    )
    status: Mapped[DonationStatus] = mapped_column(
        SQLEnum(DonationStatus),
        default=DonationStatus.PENDING,
        nullable=False,
    )
    
    # Optional message
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    sponsor: Mapped[Optional["Sponsor"]] = relationship("Sponsor", back_populates="donations")
    student: Mapped[Optional["Student"]] = relationship("Student", back_populates="donations")
    transaction: Mapped[Optional["PaymentTransaction"]] = relationship("PaymentTransaction")
