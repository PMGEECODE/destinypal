"""
Sponsor model.
"""
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import uuid

from sqlalchemy import String, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.institution import ComplianceStatus

if TYPE_CHECKING:
    from app.models.sponsorship import Sponsorship
    from app.models.payment import Payment
    from app.models.donation import OrganizationDonation


class Sponsor(Base, UUIDMixin, TimestampMixin):
    """Sponsor model."""
    
    __tablename__ = "sponsors"
    
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Compliance
    compliance_status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus),
        default=ComplianceStatus.ACTIVE,
    )
    compliance_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    compliance_updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    compliance_updated_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationships
    sponsorships: Mapped[List["Sponsorship"]] = relationship(
        "Sponsorship",
        back_populates="sponsor",
        cascade="all, delete-orphan",
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="sponsor",
        cascade="all, delete-orphan",
    )
    donations: Mapped[List["OrganizationDonation"]] = relationship(
        "OrganizationDonation",
        back_populates="sponsor",
    )
