"""
Student and related models.
"""
from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
import uuid

from sqlalchemy import String, Boolean, Text, Integer, Date, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.institution import ComplianceStatus

if TYPE_CHECKING:
    from app.models.institution import Institution
    from app.models.sponsorship import Sponsorship
    from app.models.payment import PaymentAccount
    from app.models.donation import OrganizationDonation


class DocumentType(str, Enum):
    """Types of student documents."""
    PASSPORT_PHOTO = "passport_photo"
    ACADEMIC_RESULTS = "academic_results"
    AUTHORITY_LETTER = "authority_letter"
    APPROVAL_LETTER = "approval_letter"
    IDENTIFICATION = "identification"


class DocumentStatus(str, Enum):
    """Document review status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Student(Base, UUIDMixin, TimestampMixin):
    """Student model."""
    
    __tablename__ = "students"
    
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    grade_level: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Profile details
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    background_story: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    family_situation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    academic_performance: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    need_level: Mapped[int] = mapped_column(Integer, default=5)  # 1-10 scale
    
    # Verification and compliance
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    compliance_status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus),
        default=ComplianceStatus.ACTIVE,
    )
    compliance_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    compliance_updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    compliance_updated_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Document verification
    documents_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    documents_verified_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    documents_verified_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationships
    institution: Mapped["Institution"] = relationship("Institution", back_populates="students")
    documents: Mapped[List["StudentDocument"]] = relationship(
        "StudentDocument",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    fee_balance: Mapped[Optional["StudentFeeBalance"]] = relationship(
        "StudentFeeBalance",
        back_populates="student",
        uselist=False,
        cascade="all, delete-orphan",
    )
    payment_accounts: Mapped[List["PaymentAccount"]] = relationship(
        "PaymentAccount",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    sponsorships: Mapped[List["Sponsorship"]] = relationship(
        "Sponsorship",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    donations: Mapped[List["OrganizationDonation"]] = relationship(
        "OrganizationDonation",
        back_populates="student",
    )


class StudentDocument(Base, UUIDMixin, TimestampMixin):
    """Student document model."""
    
    __tablename__ = "student_documents"
    
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    document_type: Mapped[DocumentType] = mapped_column(SQLEnum(DocumentType), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    status: Mapped[DocumentStatus] = mapped_column(
        SQLEnum(DocumentStatus),
        default=DocumentStatus.PENDING,
    )
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    # Relationship
    student: Mapped["Student"] = relationship("Student", back_populates="documents")


class StudentFeeBalance(Base, UUIDMixin):
    """Student fee balance tracking."""
    
    __tablename__ = "student_fee_balances"
    
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    
    total_fees: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    amount_paid: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    balance_due: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    last_updated: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    # Relationship
    student: Mapped["Student"] = relationship("Student", back_populates="fee_balance")
