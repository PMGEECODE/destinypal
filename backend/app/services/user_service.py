"""
User service for authentication and user management.
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User, UserProfile, User2FASettings, UserRole, TwoFactorMethod
from app.core.security import get_password_hash, verify_password, create_token_pair, TokenPair


class UserService:
    """Service for user operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: str | UUID) -> Optional[User]:
        """Get user by ID."""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(User.email == email.lower())
        )
        return result.scalar_one_or_none()
    
    async def create_user(
        self,
        email: str,
        password: str,
        role: UserRole,
        phone: Optional[str] = None,
        **profile_data,
    ) -> User:
        """Create a new user with profile."""
        # Create user
        user = User(
            email=email.lower(),
            hashed_password=get_password_hash(password),
            phone=phone,
            role=role,
        )
        self.db.add(user)
        await self.db.flush()
        
        # Create profile if data provided
        if profile_data:
            profile = UserProfile(user_id=user.id, **profile_data)
            self.db.add(profile)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await self.get_by_email(email)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await self.db.commit()
        
        return user
    
    async def create_tokens(self, user: User) -> TokenPair:
        """Create access and refresh tokens for user."""
        return create_token_pair(
            user_id=str(user.id),
            email=user.email,
            role=user.role.value,
        )
    
    async def update_user(self, user: User, **kwargs) -> User:
        """Update user fields."""
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def update_profile(self, user_id: UUID, **kwargs) -> Optional[UserProfile]:
        """Update or create user profile."""
        result = await self.db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        
        if profile:
            for key, value in kwargs.items():
                if hasattr(profile, key) and value is not None:
                    setattr(profile, key, value)
        else:
            profile = UserProfile(user_id=user_id, **kwargs)
            self.db.add(profile)
        
        await self.db.commit()
        await self.db.refresh(profile)
        return profile
    
    async def setup_two_factor(
        self,
        user: User,
        method: TwoFactorMethod,
        backup_codes_hash: str,
        totp_secret: Optional[str] = None,
    ) -> User2FASettings:
        """Setup two-factor authentication."""
        result = await self.db.execute(
            select(User2FASettings).where(User2FASettings.user_id == user.id)
        )
        settings = result.scalar_one_or_none()
        
        if settings:
            settings.method = method
            settings.enabled = True
            settings.backup_codes_hash = backup_codes_hash
            settings.totp_secret = totp_secret
        else:
            settings = User2FASettings(
                user_id=user.id,
                method=method,
                enabled=True,
                backup_codes_hash=backup_codes_hash,
                totp_secret=totp_secret,
            )
            self.db.add(settings)
        
        user.two_factor_enabled = True
        user.two_factor_method = method
        
        await self.db.commit()
        await self.db.refresh(settings)
        return settings
    
    async def disable_two_factor(self, user: User) -> None:
        """Disable two-factor authentication."""
        result = await self.db.execute(
            select(User2FASettings).where(User2FASettings.user_id == user.id)
        )
        settings = result.scalar_one_or_none()
        
        if settings:
            settings.enabled = False
        
        user.two_factor_enabled = False
        user.two_factor_method = None
        
        await self.db.commit()
    
    async def verify_email(self, user: User) -> None:
        """Mark user email as verified."""
        user.email_verified = True
        user.is_verified = True
        await self.db.commit()
    
    async def verify_phone(self, user: User) -> None:
        """Mark user phone as verified."""
        user.phone_verified = True
        await self.db.commit()
    
    async def change_password(self, user: User, new_password: str) -> None:
        """Change user password."""
        user.hashed_password = get_password_hash(new_password)
        await self.db.commit()
