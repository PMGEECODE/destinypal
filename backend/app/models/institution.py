"""
Institution model – with performance indexes.
"""
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
import uuid

from sqlalchemy import (
    String,
    Boolean,
    Text,
    ForeignKey,
    Index,
    Enum as SQLEnum,  # ✅ FIXED: required for Postgres enums
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.student import Student


# ---------------------------------------------
# ENUM DEFINITIONS
# ---------------------------------------------
class ComplianceStatus(str, Enum):
    """Compliance status for institutions."""
    ACTIVE = "active"
    BLACKLISTED = "blacklisted"
    WHITELISTED = "whitelisted"
    SUSPENDED = "suspended"


class InstitutionType(str, Enum):
    """Supported types of educational institutions."""
    SECONDARY_SCHOOL = "secondary_school"
    UNIVERSITY = "university"
    COLLEGE = "college"
    VOCATIONAL = "vocational"


# ---------------------------------------------
# INSTITUTION MODEL
# ---------------------------------------------
class Institution(Base, UUIDMixin, TimestampMixin):

    __tablename__ = "institutions"

    # --- Foreign Key ---
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # --- Core fields ---
    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)

    institution_type: Mapped[InstitutionType] = mapped_column(
        SQLEnum(InstitutionType, name="institutiontype"),  # 🔥 safer for Postgres
        nullable=False,
        index=True,
        default=InstitutionType.SECONDARY_SCHOOL,
    )

    registration_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # --- Location ---
    country: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
        default="KE",
        index=True,
    )
    county: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    city: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)

    # --- Contact Person ---
    contact_person_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person_title: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    contact_person_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    contact_person_phone: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # --- Optional ---
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # --- Compliance ---
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    compliance_status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus, name="compliancestatus"),
        default=ComplianceStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    compliance_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    compliance_updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    compliance_updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # --- Account management ---
    temporary_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_changed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # --- Relationships ---
    students: Mapped[List["Student"]] = relationship(
        "Student",
        back_populates="institution",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # --- Indexes ---
    __table_args__ = (
        Index("ix_institutions_country_city", "country", "city"),
        Index("ix_institutions_type_verified_active", "institution_type", "is_verified", "compliance_status"),
        Index("ix_institutions_contact_email", "contact_person_email"),
        Index("ix_institutions_country_county", "country", "county"),
    )

    def __repr__(self) -> str:
        return f"<Institution {self.name} ({self.institution_type.value})>"
