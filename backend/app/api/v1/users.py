"""
User management API routes.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from pydantic import BaseModel

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserWithProfile, UserProfileUpdate
from app.services.user_service import UserService
from app.core.deps import CurrentUser, AdminUser, DBSession

router = APIRouter()


class UserSettings(BaseModel):
    """User settings schema."""
    notifications_email: bool = True
    notifications_sms: bool = False
    notifications_push: bool = True
    language: str = "en"
    timezone: str = "UTC"
    theme: str = "light"
    
    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    """User settings update schema."""
    notifications_email: Optional[bool] = None
    notifications_sms: Optional[bool] = None
    notifications_push: Optional[bool] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None


@router.get("/", response_model=List[UserResponse])
async def list_users(
    admin: AdminUser,
    db: DBSession,
    skip: int = 0,
    limit: int = 100,
):
    """List all users (admin only)."""
    result = await db.execute(
        select(User).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/me", response_model=UserWithProfile)
async def get_my_profile(current_user: CurrentUser):
    """Get current user profile."""
    return current_user


@router.patch("/me", response_model=UserWithProfile)
async def update_my_profile(
    updates: UserProfileUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    """Update current user profile."""
    user_service = UserService(db)
    await user_service.update_profile(current_user.id, **updates.model_dump(exclude_unset=True))
    await db.refresh(current_user)
    return current_user


@router.get("/me/settings", response_model=UserSettings)
async def get_my_settings(
    current_user: CurrentUser,
    db: DBSession,
):
    """Get current user settings."""
    # Get settings from user_metadata or return defaults
    settings = current_user.user_metadata.get("settings", {})
    return UserSettings(
        notifications_email=settings.get("notifications_email", True),
        notifications_sms=settings.get("notifications_sms", False),
        notifications_push=settings.get("notifications_push", True),
        language=settings.get("language", "en"),
        timezone=settings.get("timezone", "UTC"),
        theme=settings.get("theme", "light"),
    )


@router.patch("/me/settings", response_model=UserSettings)
async def update_my_settings(
    updates: UserSettingsUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    """Update current user settings."""
    # Get current metadata
    metadata = current_user.user_metadata or {}
    settings = metadata.get("settings", {})
    
    # Apply updates
    for key, value in updates.model_dump(exclude_unset=True).items():
        settings[key] = value
    
    metadata["settings"] = settings
    current_user.user_metadata = metadata
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserSettings(**settings)


@router.get("/{user_id}/settings", response_model=UserSettings)
async def get_user_settings(
    user_id: UUID,
    current_user: CurrentUser,
    db: DBSession,
):
    """Get user settings by user ID."""
    # Only allow users to get their own settings or admins
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's settings",
        )
    
    user_service = UserService(db)
    user = await user_service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    settings = user.user_metadata.get("settings", {}) if user.user_metadata else {}
    return UserSettings(
        notifications_email=settings.get("notifications_email", True),
        notifications_sms=settings.get("notifications_sms", False),
        notifications_push=settings.get("notifications_push", True),
        language=settings.get("language", "en"),
        timezone=settings.get("timezone", "UTC"),
        theme=settings.get("theme", "light"),
    )


@router.patch("/{user_id}/settings", response_model=UserSettings)
async def update_user_settings(
    user_id: UUID,
    updates: UserSettingsUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    """Update user settings by user ID."""
    # Only allow users to update their own settings or admins
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user's settings",
        )
    
    user_service = UserService(db)
    user = await user_service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Get current metadata
    metadata = user.user_metadata or {}
    settings = metadata.get("settings", {})
    
    # Apply updates
    for key, value in updates.model_dump(exclude_unset=True).items():
        settings[key] = value
    
    metadata["settings"] = settings
    user.user_metadata = metadata
    
    await db.commit()
    await db.refresh(user)
    
    return UserSettings(**settings)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    admin: AdminUser,
    db: DBSession,
):
    """Get user by ID (admin only)."""
    user_service = UserService(db)
    user = await user_service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    updates: UserUpdate,
    admin: AdminUser,
    db: DBSession,
):
    """Update user by ID (admin only)."""
    user_service = UserService(db)
    user = await user_service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user = await user_service.update_user(user, **updates.model_dump(exclude_unset=True))
    return user
