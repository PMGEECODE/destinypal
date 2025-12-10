"""
User and authentication models.
"""
from datetime import datetime
from typing import Optional, List
from enum import Enum
import uuid

from sqlalchemy import String, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database.base import Base, TimestampMixin, UUIDMixin


class UserRole(str, Enum):
    """User roles in the system."""
    ADMIN = "admin"
    SPONSOR = "sponsor"
    INSTITUTION = "institution"
    STUDENT = "student"


class TwoFactorMethod(str, Enum):
    """Two-factor authentication methods."""
    EMAIL = "email"
    SMS = "sms"
    TOTP = "totp"


class User(Base, UUIDMixin, TimestampMixin):
    """User authentication model."""
    
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        default=UserRole.SPONSOR,
        nullable=False,
    )
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 2FA
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    two_factor_method: Mapped[Optional[TwoFactorMethod]] = mapped_column(
        SQLEnum(TwoFactorMethod),
        nullable=True,
    )
    
    # Metadata
    user_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    last_login: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    two_factor_settings: Mapped[Optional["User2FASettings"]] = relationship(
        "User2FASettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class UserProfile(Base, UUIDMixin, TimestampMixin):
    """Extended user profile information."""
    
    __tablename__ = "user_profiles"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    id_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    county: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="profile")


class User2FASettings(Base, UUIDMixin, TimestampMixin):
    """Two-factor authentication settings."""
    
    __tablename__ = "user_2fa_settings"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    
    method: Mapped[TwoFactorMethod] = mapped_column(SQLEnum(TwoFactorMethod), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Backup codes (stored as hashed values)
    backup_codes_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # TOTP secret (encrypted)
    totp_secret: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="two_factor_settings")
