"""
Service layer for admin notification operations.
"""
import json
import logging
from datetime import datetime
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_notification import AdminNotification, NotificationType
from app.schemas.admin_notification import AdminNotificationCreate

logger = logging.getLogger(__name__)


class AdminNotificationService:
    """Service for managing admin notifications."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_notification(
        self,
        notification_type: NotificationType,
        title: str,
        message: str,
        related_user_id: Optional[UUID] = None,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[UUID] = None,
        metadata: Optional[dict] = None,
    ) -> AdminNotification:
        """Create a new admin notification."""
        notification = AdminNotification(
            notification_type=notification_type,
            title=title,
            message=message,
            related_user_id=related_user_id,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            metadata_json=json.dumps(metadata) if metadata else None,
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        logger.info(f"Created admin notification: {notification_type.value} - {title}")
        return notification
    
    async def create_registration_notification(
        self,
        user_id: UUID,
        email: str,
        role: str,
        full_name: Optional[str] = None,
        entity_id: Optional[UUID] = None,
        extra_info: Optional[dict] = None,
    ) -> AdminNotification:
        """Create a notification for a new user registration."""
        # Determine notification type based on role
        type_map = {
            "sponsor": NotificationType.NEW_SPONSOR,
            "institution": NotificationType.NEW_INSTITUTION,
            "student": NotificationType.NEW_STUDENT,
        }
        notification_type = type_map.get(role.lower(), NotificationType.NEW_REGISTRATION)
        
        # Format title and message
        role_display = role.replace("_", " ").title()
        name_display = full_name or email
        
        title = f"New {role_display} Registration"
        message = f"{name_display} has registered as a {role_display.lower()}."
        
        # Build metadata
        metadata = {
            "email": email,
            "role": role,
            "full_name": full_name,
        }
        if extra_info:
            metadata.update(extra_info)
        
        return await self.create_notification(
            notification_type=notification_type,
            title=title,
            message=message,
            related_user_id=user_id,
            related_entity_type=role.lower(),
            related_entity_id=entity_id,
            metadata=metadata,
        )
    
    async def get_notifications(
        self,
        page: int = 1,
        page_size: int = 20,
        notification_type: Optional[NotificationType] = None,
        unread_only: bool = False,
    ) -> Tuple[List[AdminNotification], int]:
        """Get paginated list of admin notifications."""
        # Build query
        query = select(AdminNotification)
        count_query = select(func.count(AdminNotification.id))
        
        # Apply filters
        if notification_type:
            query = query.where(AdminNotification.notification_type == notification_type)
            count_query = count_query.where(AdminNotification.notification_type == notification_type)
        
        if unread_only:
            query = query.where(AdminNotification.is_read == False)
            count_query = count_query.where(AdminNotification.is_read == False)
        
        # Get total count
        result = await self.db.execute(count_query)
        total = result.scalar() or 0
        
        # Apply pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(AdminNotification.created_at.desc())
        query = query.offset(offset).limit(page_size)
        
        # Execute query
        result = await self.db.execute(query)
        notifications = result.scalars().all()
        
        return list(notifications), total
    
    async def get_notification_by_id(self, notification_id: UUID) -> Optional[AdminNotification]:
        """Get a single notification by ID."""
        result = await self.db.execute(
            select(AdminNotification).where(AdminNotification.id == notification_id)
        )
        return result.scalar_one_or_none()
    
    async def mark_as_read(
        self,
        notification_id: UUID,
        admin_id: UUID,
    ) -> Optional[AdminNotification]:
        """Mark a notification as read."""
        notification = await self.get_notification_by_id(notification_id)
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            notification.read_by_admin_id = admin_id
            await self.db.commit()
            await self.db.refresh(notification)
        return notification
    
    async def mark_all_as_read(self, admin_id: UUID) -> int:
        """Mark all unread notifications as read."""
        result = await self.db.execute(
            select(AdminNotification).where(AdminNotification.is_read == False)
        )
        notifications = result.scalars().all()
        
        count = 0
        for notification in notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            notification.read_by_admin_id = admin_id
            count += 1
        
        if count > 0:
            await self.db.commit()
        
        return count
    
    async def get_unread_count(self) -> dict:
        """Get unread notification counts by type."""
        # Total unread
        total_result = await self.db.execute(
            select(func.count(AdminNotification.id))
            .where(AdminNotification.is_read == False)
        )
        total_unread = total_result.scalar() or 0
        
        # Count by registration types
        registration_types = [
            NotificationType.NEW_REGISTRATION,
            NotificationType.NEW_SPONSOR,
            NotificationType.NEW_INSTITUTION,
            NotificationType.NEW_STUDENT,
        ]
        reg_result = await self.db.execute(
            select(func.count(AdminNotification.id))
            .where(
                and_(
                    AdminNotification.is_read == False,
                    AdminNotification.notification_type.in_(registration_types)
                )
            )
        )
        new_registrations = reg_result.scalar() or 0
        
        # Count messages
        msg_result = await self.db.execute(
            select(func.count(AdminNotification.id))
            .where(
                and_(
                    AdminNotification.is_read == False,
                    AdminNotification.notification_type == NotificationType.NEW_CONTACT_MESSAGE
                )
            )
        )
        new_messages = msg_result.scalar() or 0
        
        # Count donations
        don_result = await self.db.execute(
            select(func.count(AdminNotification.id))
            .where(
                and_(
                    AdminNotification.is_read == False,
                    AdminNotification.notification_type == NotificationType.NEW_DONATION
                )
            )
        )
        new_donations = don_result.scalar() or 0
        
        # Count system alerts
        alert_result = await self.db.execute(
            select(func.count(AdminNotification.id))
            .where(
                and_(
                    AdminNotification.is_read == False,
                    AdminNotification.notification_type == NotificationType.SYSTEM_ALERT
                )
            )
        )
        system_alerts = alert_result.scalar() or 0
        
        return {
            "unread_count": total_unread,
            "new_registrations": new_registrations,
            "new_messages": new_messages,
            "new_donations": new_donations,
            "system_alerts": system_alerts,
        }
    
    async def delete_notification(self, notification_id: UUID) -> bool:
        """Delete a notification."""
        notification = await self.get_notification_by_id(notification_id)
        if notification:
            await self.db.delete(notification)
            await self.db.commit()
            return True
        return False
