"""
app/core/deps.py

Dependency injection utilities for FastAPI.

Features:
- Supports JWT in Authorization: Bearer OR access_token cookie
- Optional/required/current user flows
- Role-based access control (admin, sponsor, etc.)
- Clean Annotated type aliases
- Proper error messages and WWW-Authenticate headers
"""

from typing import Annotated, Optional

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.core.security import verify_token
from app.models.user import User
from app.services.user_service import UserService


# --------------------------------------------------------------------------- #
# Security Schemes
# --------------------------------------------------------------------------- #
bearer_scheme = HTTPBearer(auto_error=False)  # Don't raise 401 automatically


# --------------------------------------------------------------------------- #
# Token Extraction (Header or Cookie)
# --------------------------------------------------------------------------- #
async def get_token(
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)
    ],
    access_token: Annotated[Optional[str], Cookie(alias="access_token")] = None,
) -> Optional[str]:
    """
    Extract JWT from:
      1. Authorization: Bearer <token>
      2. Cookie: access_token=<token>
    Returns None if no token found.
    """
    return credentials.credentials if credentials else access_token


# --------------------------------------------------------------------------- #
# User Retrieval
# --------------------------------------------------------------------------- #
async def get_current_user_optional(
    db: Annotated[AsyncSession, Depends(get_db)],
    token: Annotated[Optional[str], Depends(get_token)],
) -> Optional[User]:
    """Return authenticated user if token is valid, otherwise None."""
    if not token:
        return None

    token_data = verify_token(token, token_type="access")
    if not token_data or not token_data.user_id:
        return None

    user = await UserService(db).get_by_id(token_data.user_id)
    return user


async def get_current_user(
    user: Annotated[Optional[User], Depends(get_current_user_optional)],
) -> User:
    """Require authentication. Raises 401 if no valid token."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_active_user(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure user is active (not disabled/banned)."""
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return user


# --------------------------------------------------------------------------- #
# Role-Based Access Control
# --------------------------------------------------------------------------- #
def require_role(*required_roles: str):
    """
    Factory to create role-checking dependencies.

    Usage:
        @app.get("/admin", dependencies=[Depends(require_role("admin"))])
        or
        current_admin: User = Depends(require_role("admin"))
    """
    async def role_checker(
        user: Annotated[User, Depends(get_current_active_user)],
    ) -> User:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role(s): {', '.join(required_roles)}",
            )
        return user

    return role_checker


# Common role dependencies
get_current_admin_user = require_role("admin")
get_current_sponsor_user = require_role("sponsor", "admin")
get_current_institution_user = require_role("institution", "admin")
get_current_student_user = require_role("student")  # students usually can't escalate


# --------------------------------------------------------------------------- #
# Annotated Type Aliases (Use these in your routes!)
# --------------------------------------------------------------------------- #

DBSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[Optional[User], Depends(get_current_user_optional)]  # Fixed!
CurrentUser = Annotated[User, Depends(get_current_active_user)]
AdminUser = Annotated[User, Depends(get_current_admin_user)]
SponsorUser = Annotated[User, Depends(get_current_sponsor_user)]
InstitutionUser = Annotated[User, Depends(get_current_institution_user)]
StudentUser = Annotated[User, Depends(get_current_student_user)]

# Legacy names (optional – you can keep using these if you want)
require_admin = get_current_admin_user
require_sponsor = get_current_sponsor_user