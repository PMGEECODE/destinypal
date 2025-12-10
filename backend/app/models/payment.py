"""
Payment and transaction models.
"""
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from enum import Enum
import uuid

from sqlalchemy import String, Numeric, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.sponsor import Sponsor
    from app.models.student import Student
    from app.models.sponsorship import Sponsorship


class PaymentMethod(str, Enum):
    """Supported payment methods."""
    MPESA = "mpesa"
    AIRTEL_MONEY = "airtel_money"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"


class PaymentType(str, Enum):
    """Payment types."""
    FULL = "full"
    PARTIAL = "partial"


class PaymentStatus(str, Enum):
    """Payment status."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class TransactionStatus(str, Enum):
    """Transaction status for payment transactions."""
    INITIATED = "initiated"
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class TransactionType(str, Enum):
    """Transaction types."""
    SPONSORSHIP = "sponsorship"
    DONATION = "donation"


class Payment(Base, UUIDMixin, TimestampMixin):
    """Payment record."""

    __tablename__ = "payments"

    sponsorship_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sponsorships.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

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

    transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("payment_transactions.id", ondelete="SET NULL"),
        nullable=True,
    )

    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(SQLEnum(PaymentMethod), nullable=False)
    payment_type: Mapped[PaymentType] = mapped_column(SQLEnum(PaymentType), nullable=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus),
        default=PaymentStatus.PENDING,
    )

    payment_date: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    sponsorship: Mapped[Optional["Sponsorship"]] = relationship(
        "Sponsorship",
        back_populates="payments",
    )
    sponsor: Mapped["Sponsor"] = relationship("Sponsor", back_populates="payments")
    student: Mapped["Student"] = relationship("Student")


class PaymentAccount(Base, UUIDMixin, TimestampMixin):
    """Payment account for receiving funds."""

    __tablename__ = "payment_accounts"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    account_type: Mapped[str] = mapped_column(String(50), nullable=False)
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_number: Mapped[str] = mapped_column(String(100), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    swift_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    additional_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship
    student: Mapped["Student"] = relationship("Student", back_populates="payment_accounts")


class PaymentTransaction(Base, UUIDMixin, TimestampMixin):
    """Payment transaction tracking."""

    __tablename__ = "payment_transactions"

    reference_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    payment_type: Mapped[TransactionType] = mapped_column(SQLEnum(TransactionType), nullable=False)
    related_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    payment_method: Mapped[PaymentMethod] = mapped_column(SQLEnum(PaymentMethod), nullable=False)
    provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    status: Mapped[TransactionStatus] = mapped_column(
        SQLEnum(TransactionStatus),
        default=TransactionStatus.INITIATED,
        index=True,
    )

    phone_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    card_last4: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    card_brand: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    tx_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)  # renamed from metadata

    initiated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    failed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class PaymentWebhook(Base, UUIDMixin, TimestampMixin):
    """Webhook data from payment providers."""

    __tablename__ = "payment_webhooks"

    transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("payment_transactions.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    webhook_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
