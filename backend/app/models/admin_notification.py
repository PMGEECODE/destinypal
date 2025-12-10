"""
Admin Notification model for tracking system events like new registrations.
"""
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class NotificationType(str, PyEnum):
    """Types of admin notifications."""
    NEW_REGISTRATION = "new_registration"
    NEW_SPONSOR = "new_sponsor"
    NEW_INSTITUTION = "new_institution"
    NEW_STUDENT = "new_student"
    NEW_CONTACT_MESSAGE = "new_contact_message"
    NEW_DONATION = "new_donation"
    SYSTEM_ALERT = "system_alert"


class AdminNotification(Base):
    """Admin notification model for tracking system events."""
    
    __tablename__ = "admin_notifications"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Notification type
    notification_type = Column(
        Enum(NotificationType, name="notification_type_enum"),
        nullable=False,
        index=True
    )
    
    # Title and message
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Related entity (optional)
    related_user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    related_entity_type = Column(String(50), nullable=True)  # e.g., "sponsor", "institution", "student"
    related_entity_id = Column(PGUUID(as_uuid=True), nullable=True)
    
    # Additional metadata
    metadata_json = Column(Text, nullable=True)  # JSON string for extra data like role, email, etc.
    
    # Read status
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    read_by_admin_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    related_user = relationship("User", foreign_keys=[related_user_id], backref="notifications")
    read_by_admin = relationship("User", foreign_keys=[read_by_admin_id])
    
    def __repr__(self):
        return f"<AdminNotification {self.notification_type.value}: {self.title}>"
