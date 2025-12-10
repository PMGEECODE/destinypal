"""
Sponsorship model.
"""
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
import uuid

from sqlalchemy import String, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.sponsor import Sponsor
    from app.models.student import Student
    from app.models.payment import Payment


class CommitmentType(str, Enum):
    """Sponsorship commitment types."""
    FULL = "full"
    PARTIAL = "partial"


class SponsorshipStatus(str, Enum):
    """Sponsorship status."""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class Sponsorship(Base, UUIDMixin, TimestampMixin):
    """Sponsorship relationship between sponsor and student."""
    
    __tablename__ = "sponsorships"
    
    sponsor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sponsors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    commitment_type: Mapped[CommitmentType] = mapped_column(
        SQLEnum(CommitmentType),
        nullable=False,
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[SponsorshipStatus] = mapped_column(
        SQLEnum(SponsorshipStatus),
        default=SponsorshipStatus.ACTIVE,
        index=True,
    )
    
    start_date: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    end_date: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    # Relationships
    sponsor: Mapped["Sponsor"] = relationship("Sponsor", back_populates="sponsorships")
    student: Mapped["Student"] = relationship("Student", back_populates="sponsorships")
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="sponsorship",
    )
