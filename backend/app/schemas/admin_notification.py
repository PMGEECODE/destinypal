"""
Pydantic schemas for admin notifications.
"""
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.admin_notification import NotificationType


class AdminNotificationBase(BaseModel):
    """Base schema for admin notifications."""
    notification_type: NotificationType
    title: str = Field(..., max_length=255)
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    metadata_json: Optional[str] = None


class AdminNotificationCreate(AdminNotificationBase):
    """Schema for creating a new admin notification."""
    related_user_id: Optional[UUID] = None


class AdminNotificationResponse(BaseModel):
    """Schema for admin notification response."""
    id: UUID
    notification_type: NotificationType
    title: str
    message: str
    related_user_id: Optional[UUID] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    metadata_json: Optional[str] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    
    # Parsed metadata for convenience
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class AdminNotificationListResponse(BaseModel):
    """Schema for paginated notification list response."""
    notifications: List[AdminNotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int
    total_pages: int


class AdminNotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    is_read: Optional[bool] = None


class UnreadCountResponse(BaseModel):
    """Schema for unread notification count response."""
    unread_count: int
    # Breakdown by type
    new_registrations: int = 0
    new_messages: int = 0
    new_donations: int = 0
    system_alerts: int = 0
