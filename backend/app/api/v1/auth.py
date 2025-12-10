"""
Authentication API routes.
"""
from datetime import datetime, timezone
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.user import UserRole, TwoFactorMethod
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    SponsorRegisterRequest,
    InstitutionRegisterRequest,
    StudentRegisterRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    VerifyCodeRequest,
    TwoFactorSetupRequest,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    TwoFactorDisableRequest,
)
from app.services.user_service import UserService
from app.services.admin_notification_service import AdminNotificationService
from app.core.security import (
    verify_token,
    create_token_pair,
    generate_verification_code,
    generate_backup_codes,
    hash_backup_code,
)
from app.core.deps import CurrentUser, DBSession
from app.core.config import settings

router = APIRouter()


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set secure authentication cookies."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        domain=settings.COOKIE_DOMAIN,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        domain=settings.COOKIE_DOMAIN,
    )


def clear_auth_cookies(response: Response):
    """Clear authentication cookies."""
    response.delete_cookie("access_token", domain=settings.COOKIE_DOMAIN)
    response.delete_cookie("refresh_token", domain=settings.COOKIE_DOMAIN)


class SecureLoginResponse:
    """Secure login response without tokens in body."""
    def __init__(
        self,
        success: bool,
        requires_two_factor: bool = False,
        user_id: Optional[str] = None,
        email: Optional[str] = None,
        role: Optional[str] = None,
        message: str = "Login successful"
    ):
        self.success = success
        self.requires_two_factor = requires_two_factor
        self.user_id = user_id
        self.email = email
        self.role = role
        self.message = message


@router.post("/login")
async def login(
    request: LoginRequest,
    response: Response,
    db: DBSession,
):
    """
    Authenticate user and set secure HTTP-only cookies.
    Tokens are NOT returned in the response body for security.
    """
    user_service = UserService(db)
    user = await user_service.authenticate(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    
    # Check if 2FA is required
    if user.two_factor_enabled:
        return {
            "success": False,
            "requires_two_factor": True,
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "message": "Two-factor authentication required"
        }
    
    # Create tokens
    tokens = await user_service.create_tokens(user)
    
    set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    
    return {
        "success": True,
        "requires_two_factor": False,
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "message": "Login successful"
    }


@router.post("/register/sponsor")
async def register_sponsor(
    request: SponsorRegisterRequest,
    response: Response,
    db: DBSession,
):
    """Register a new sponsor account. Tokens set in HttpOnly cookies."""
    user_service = UserService(db)
    
    # Check if email exists
    existing = await user_service.get_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    try:
        # Create user
        user = await user_service.create_user(
            email=request.email,
            password=request.password,
            role=UserRole.SPONSOR,
            phone=request.phone,
            full_name=request.full_name,
            id_number=request.id_number,
            country=request.country,
            county=request.county,
            state=request.state,
        )
        
        from app.models.sponsor import Sponsor
        
        sponsor = Sponsor(
            user_id=user.id,
            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            is_active=True,
        )
        db.add(sponsor)
        await db.commit()
        await db.refresh(sponsor)
        
        notification_service = AdminNotificationService(db)
        await notification_service.create_registration_notification(
            user_id=user.id,
            email=user.email,
            role="sponsor",
            full_name=request.full_name,
            entity_id=sponsor.id,  # Include sponsor entity_id in notification
            extra_info={
                "phone": request.phone,
                "country": request.country,
                "county": request.county,
            }
        )
        
        # Create tokens
        tokens = await user_service.create_tokens(user)
        
        set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
        
        return {
            "success": True,
            "user_id": str(user.id),
            "sponsor_id": str(sponsor.id),  # Return sponsor_id in response
            "email": user.email,
            "role": user.role.value,
            "message": "Registration successful"
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sponsor: {str(e)}",
        )


@router.post("/register/institution")
async def register_institution(
    request: InstitutionRegisterRequest,
    response: Response,
    db: DBSession,
):
    """Register a new institution account. Tokens set in HttpOnly cookies."""
    user_service = UserService(db)
    
    # Check if email exists
    existing = await user_service.get_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    try:
        # Create user
        user = await user_service.create_user(
            email=request.email,
            password=request.password,
            role=UserRole.INSTITUTION,
            full_name=request.contact_person_name,
            country=request.country,
            county=request.county,
            state=request.state,
        )
        
        # Create institution record
        from app.models.institution import Institution, InstitutionType
        
        institution = Institution(
            user_id=user.id,
            name=request.institution_name,
            email=request.email,
            institution_type=InstitutionType(request.institution_type),
            registration_number=request.registration_number,
            country=request.country or "KE",
            county=request.county,
            state=request.state,
            city=request.city or "Unknown",
            address=request.address or "Not provided",
            postal_code=request.postal_code,
            contact_person_name=request.contact_person_name,
            contact_person_title=request.contact_person_title,
            contact_person_email=request.contact_person_email,
            contact_person_phone=request.contact_person_phone or "Not provided",
            website=request.website,
        )
        db.add(institution)
        await db.commit()
        await db.refresh(institution)
        
        notification_service = AdminNotificationService(db)
        await notification_service.create_registration_notification(
            user_id=user.id,
            email=user.email,
            role="institution",
            full_name=request.institution_name,
            entity_id=institution.id,
            extra_info={
                "institution_name": request.institution_name,
                "institution_type": request.institution_type,
                "registration_number": request.registration_number,
                "contact_person": request.contact_person_name,
                "country": request.country,
                "county": request.county,
            }
        )
        
        # Create tokens
        tokens = await user_service.create_tokens(user)
        
        set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
        
        return {
            "success": True,
            "user_id": str(user.id),
            "institution_id": str(institution.id),
            "email": user.email,
            "role": user.role.value,
            "message": "Registration successful"
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create institution: {str(e)}",
        )


@router.post("/register/student")
async def register_student(
    request: StudentRegisterRequest,
    response: Response,
    db: DBSession,
):
    """
    Register a new student account. 
    Creates both User and Student records, similar to institution registration.
    Tokens set in HttpOnly cookies.
    
    Students can only register if their institution exists and is active.
    """
    user_service = UserService(db)
    
    # Check if email exists
    existing = await user_service.get_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Validate institution exists and is active
    from app.models.institution import Institution, ComplianceStatus
    
    try:
        institution_uuid = UUID(request.institution_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid institution ID format",
        )
    
    result = await db.execute(
        select(Institution)
        .where(Institution.id == institution_uuid)
        .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institution not found or not active. Students can only register with verified institutions.",
        )
    
    # Create user with STUDENT role
    user = await user_service.create_user(
        email=request.email,
        password=request.password,
        role=UserRole.STUDENT,
        phone=request.phone,
        full_name=request.full_name,
    )
    
    # Create student record linked to user and institution
    from app.models.student import Student, StudentFeeBalance
    
    student = Student(
        user_id=user.id,
        institution_id=institution_uuid,
        full_name=request.full_name,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        grade_level=request.grade_level,
        location=request.location,
        background_story=request.background_story,
        family_situation=request.family_situation,
        academic_performance=request.academic_performance,
        need_level=5,  # Default need level
        is_verified=False,  # Requires verification
    )
    db.add(student)
    await db.flush()  # Get the student ID
    
    # Create initial fee balance record for the student
    fee_balance = StudentFeeBalance(
        student_id=student.id,
        total_fees=0,
        amount_paid=0,
        balance_due=0,
    )
    db.add(fee_balance)
    
    await db.commit()
    
    notification_service = AdminNotificationService(db)
    await notification_service.create_registration_notification(
        user_id=user.id,
        email=user.email,
        role="student",
        full_name=request.full_name,
        entity_id=student.id,
        extra_info={
            "institution_id": str(institution.id),
            "institution_name": institution.name,
            "grade_level": request.grade_level,
            "gender": request.gender,
            "location": request.location,
        }
    )
    
    # Create tokens
    tokens = await user_service.create_tokens(user)
    
    set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    
    return {
        "success": True,
        "user_id": str(user.id),
        "student_id": str(student.id),
        "email": user.email,
        "role": user.role.value,
        "institution_id": str(institution.id),
        "institution_name": institution.name,
        "message": "Student registration successful"
    }


@router.post("/logout")
async def logout(response: Response):
    """Logout and clear session cookies."""
    clear_auth_cookies(response)
    return {"success": True, "message": "Logged out successfully"}


@router.post("/refresh")
async def refresh_token(
    response: Response,
    db: DBSession,
    refresh_token: Annotated[Optional[str], Cookie(alias="refresh_token")] = None,
):
    """Refresh access token using refresh token from HttpOnly cookie."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )
    
    token_data = verify_token(refresh_token, "refresh")
    
    if not token_data:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    user_service = UserService(db)
    user = await user_service.get_by_id(token_data.user_id)
    
    if not user or not user.is_active:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new tokens
    tokens = await user_service.create_tokens(user)
    
    # Set new cookies
    set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    
    return {"success": True, "message": "Tokens refreshed"}


@router.get("/me")
async def get_current_user(current_user: CurrentUser):
    """Get current authenticated user."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role.value,
        "is_verified": current_user.is_verified,
        "email_verified": current_user.email_verified,
        "phone_verified": current_user.phone_verified,
        "two_factor_enabled": current_user.two_factor_enabled,
        "created_at": current_user.created_at.isoformat(),
    }


@router.post("/password-reset")
async def request_password_reset(
    request: PasswordResetRequest,
    db: DBSession,
):
    """Request a password reset email."""
    user_service = UserService(db)
    user = await user_service.get_by_email(request.email)
    
    # Always return success to prevent email enumeration
    if user:
        # In production, generate reset token and send email
        pass
    
    return {"success": True, "message": "If the email exists, a reset link will be sent"}


@router.post("/password-reset/confirm")
async def confirm_password_reset(
    request: PasswordResetConfirm,
    db: DBSession,
):
    """Confirm password reset with token."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password reset confirmation not yet implemented",
    )


@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_two_factor(
    request: TwoFactorSetupRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Setup two-factor authentication."""
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is already enabled",
        )
    
    method = TwoFactorMethod(request.method)
    backup_codes = generate_backup_codes()
    backup_codes_hash = ",".join([hash_backup_code(code) for code in backup_codes])
    
    user_service = UserService(db)
    await user_service.setup_two_factor(
        user=current_user,
        method=method,
        backup_codes_hash=backup_codes_hash,
    )
    
    return TwoFactorSetupResponse(
        method=method.value,
        backup_codes=backup_codes,
    )


@router.post("/2fa/verify")
async def verify_two_factor(
    request: TwoFactorVerifyRequest,
    response: Response,
    db: DBSession,
):
    """Verify two-factor authentication code and set auth cookies."""
    if len(request.code) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )
    
    if not request.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required for 2FA verification",
        )
    
    user_service = UserService(db)
    user = await user_service.get_by_id(request.user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification session",
        )
    
    # TODO: Verify the actual 2FA code against stored secret
    # For now accepting valid format codes for testing
    
    tokens = await user_service.create_tokens(user)
    
    set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    
    return {
        "success": True,
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "message": "2FA verification successful"
    }


@router.post("/2fa/disable")
async def disable_two_factor(
    request: TwoFactorDisableRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Disable two-factor authentication."""
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is not enabled",
        )
    
    user_service = UserService(db)
    await user_service.disable_two_factor(current_user)
    
    return {"success": True, "message": "Two-factor authentication disabled"}
