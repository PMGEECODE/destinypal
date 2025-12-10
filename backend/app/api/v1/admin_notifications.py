"""
Admin notifications API routes.
"""
from typing import Optional
from uuid import UUID
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.core.deps import get_current_admin_user
from app.models.user import User
from app.models.admin_notification import NotificationType
from app.services.admin_notification_service import AdminNotificationService
from app.schemas.admin_notification import (
    AdminNotificationResponse,
    AdminNotificationListResponse,
    UnreadCountResponse,
)

router = APIRouter()


def parse_notification_metadata(notification) -> dict:
    """Parse notification metadata JSON."""
    if notification.metadata_json:
        try:
            return json.loads(notification.metadata_json)
        except json.JSONDecodeError:
            return {}
    return {}


@router.get("/admin/notifications", response_model=AdminNotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    notification_type: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Get paginated list of admin notifications."""
    service = AdminNotificationService(db)
    
    # Parse notification type if provided
    type_filter = None
    if notification_type:
        try:
            type_filter = NotificationType(notification_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid notification type: {notification_type}"
            )
    
    notifications, total = await service.get_notifications(
        page=page,
        page_size=page_size,
        notification_type=type_filter,
        unread_only=unread_only,
    )
    
    # Get unread count
    unread_data = await service.get_unread_count()
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    # Build response with parsed metadata
    notification_responses = []
    for n in notifications:
        response = AdminNotificationResponse(
            id=n.id,
            notification_type=n.notification_type,
            title=n.title,
            message=n.message,
            related_user_id=n.related_user_id,
            related_entity_type=n.related_entity_type,
            related_entity_id=n.related_entity_id,
            metadata_json=n.metadata_json,
            is_read=n.is_read,
            read_at=n.read_at,
            created_at=n.created_at,
            metadata=parse_notification_metadata(n),
        )
        notification_responses.append(response)
    
    return AdminNotificationListResponse(
        notifications=notification_responses,
        total=total,
        unread_count=unread_data["unread_count"],
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/admin/notifications/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Get unread notification counts."""
    service = AdminNotificationService(db)
    counts = await service.get_unread_count()
    return UnreadCountResponse(**counts)


@router.get("/admin/notifications/{notification_id}", response_model=AdminNotificationResponse)
async def get_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Get a single notification by ID."""
    service = AdminNotificationService(db)
    notification = await service.get_notification_by_id(notification_id)
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return AdminNotificationResponse(
        id=notification.id,
        notification_type=notification.notification_type,
        title=notification.title,
        message=notification.message,
        related_user_id=notification.related_user_id,
        related_entity_type=notification.related_entity_type,
        related_entity_id=notification.related_entity_id,
        metadata_json=notification.metadata_json,
        is_read=notification.is_read,
        read_at=notification.read_at,
        created_at=notification.created_at,
        metadata=parse_notification_metadata(notification),
    )


@router.patch("/admin/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Mark a notification as read."""
    service = AdminNotificationService(db)
    notification = await service.mark_as_read(notification_id, current_admin.id)
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True, "message": "Notification marked as read"}


@router.patch("/admin/notifications/mark-all-read")
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Mark all notifications as read."""
    service = AdminNotificationService(db)
    count = await service.mark_all_as_read(current_admin.id)
    
    return {"success": True, "message": f"Marked {count} notifications as read", "count": count}


@router.delete("/admin/notifications/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Delete a notification."""
    service = AdminNotificationService(db)
    deleted = await service.delete_notification(notification_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True, "message": "Notification deleted"}
