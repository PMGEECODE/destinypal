"""
Contact form API endpoints with Cloudflare Turnstile protection.
"""
from fastapi import APIRouter, HTTPException, Request, Depends, Query
import httpx
import os
import logging
import math
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.contact_service import ContactService
from app.schemas.contact import (
    ContactFormSubmission,
    ContactSubmissionResponse,
    ContactSubmissionError,
    ContactSubmissionDB,
    ContactSubmissionUpdate,
    ContactSubmissionListResponse,
    UnreadCountResponse,
    ContactStatusEnum,
)
from app.models.contact import ContactStatus
from app.database.session import get_db
from app.core.deps import AdminUser

router = APIRouter()
logger = logging.getLogger(__name__)

# Cloudflare Turnstile configuration
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")
TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: str, user_ip: Optional[str] = None) -> bool:
    """
    Verify Cloudflare Turnstile token.
    
    Args:
        token: Turnstile response token from client
        user_ip: Optional client IP for additional verification
    
    Returns:
        True if verification passed, False otherwise
    """
    if not TURNSTILE_SECRET_KEY:
        logger.warning("TURNSTILE_SECRET_KEY not configured, skipping verification")
        return True
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                TURNSTILE_VERIFY_URL,
                data={
                    "secret": TURNSTILE_SECRET_KEY,
                    "response": token,
                    **({"remoteip": user_ip} if user_ip else {}),
                },
                timeout=10.0,
            )
            result = response.json()
            
            if not result.get("success", False):
                logger.warning(f"Turnstile verification failed: {result.get('error-codes', [])}")
            
            return result.get("success", False)
    except Exception as e:
        logger.error(f"Turnstile verification error: {e}")
        return False


def get_contact_service(db: AsyncSession = Depends(get_db)) -> ContactService:
    """Dependency injection for ContactService with database session."""
    return ContactService(db=db)


@router.post(
    "/contact",
    response_model=ContactSubmissionResponse,
    responses={
        400: {"model": ContactSubmissionError, "description": "Validation or verification failed"},
        500: {"model": ContactSubmissionError, "description": "Server error"},
    },
)
async def submit_contact_form(
    payload: ContactFormSubmission,
    request: Request,
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactSubmissionResponse:
    """
    Handle contact form submission with Cloudflare Turnstile protection.
    
    The Next.js API route already verifies Turnstile, so this endpoint
    can optionally re-verify for defense in depth.
    """
    # Get client metadata
    user_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    turnstile_verified = False
    
    # Re-verify Turnstile if token provided (defense in depth)
    if payload.cf_turnstile_response and TURNSTILE_SECRET_KEY:
        turnstile_verified = await verify_turnstile(payload.cf_turnstile_response, user_ip)
        
        if not turnstile_verified:
            raise HTTPException(
                status_code=400,
                detail="Verification failed. Please try again."
            )
    
    # Store submission in database
    submission = None
    try:
        submission = await contact_service.create_submission(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            inquiry_type=payload.inquiry_type.value if hasattr(payload.inquiry_type, 'value') else payload.inquiry_type,
            subject=payload.subject,
            message=payload.message,
            ip_address=user_ip,
            user_agent=user_agent,
            turnstile_verified=turnstile_verified,
        )
    except Exception as e:
        logger.warning(f"Failed to store contact submission: {e}")
        # Continue even if storage fails - email is more important

    # Send email notification
    try:
        await contact_service.send_contact_message(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            inquiry_type=payload.inquiry_type.value if hasattr(payload.inquiry_type, 'value') else payload.inquiry_type,
            subject=payload.subject,
            message=payload.message,
            submission_id=submission.id if submission else None,
        )
    except Exception as e:
        logger.error(f"Email sending failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send message. Please try again later."
        )

    return ContactSubmissionResponse(
        message="Thank you! Your message has been sent successfully.",
        success=True,
        submission_id=submission.id if submission else None,
    )


@router.get(
    "/admin/messages",
    response_model=ContactSubmissionListResponse,
    tags=["Admin Messages"],
)
async def get_admin_messages(
    admin: AdminUser,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    inquiry_type: Optional[str] = Query(None, description="Filter by inquiry type"),
    search: Optional[str] = Query(None, description="Search in name, email, subject, message"),
    unread_only: bool = Query(False, description="Show only unread messages"),
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactSubmissionListResponse:
    """
    Get paginated list of contact form submissions (admin only).
    """
    submissions, total, unread_count = await contact_service.get_submissions(
        page=page,
        page_size=page_size,
        status_filter=status,
        inquiry_type_filter=inquiry_type,
        search=search,
        unread_only=unread_only,
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return ContactSubmissionListResponse(
        items=[ContactSubmissionDB.model_validate(s) for s in submissions],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        unread_count=unread_count,
    )


@router.get(
    "/admin/messages/unread-count",
    response_model=UnreadCountResponse,
    tags=["Admin Messages"],
)
async def get_unread_count(
    admin: AdminUser,
    contact_service: ContactService = Depends(get_contact_service),
) -> UnreadCountResponse:
    """
    Get count of unread messages (admin only).
    """
    count = await contact_service.get_unread_count()
    return UnreadCountResponse(unread_count=count)


@router.get(
    "/admin/messages/{submission_id}",
    response_model=ContactSubmissionDB,
    tags=["Admin Messages"],
)
async def get_admin_message(
    submission_id: UUID,
    admin: AdminUser,
    mark_read: bool = Query(True, description="Mark message as read when viewed"),
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactSubmissionDB:
    """
    Get a single contact submission by ID (admin only).
    Optionally marks the message as read.
    """
    submission = await contact_service.get_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Mark as read if requested and not already read
    if mark_read and not submission.is_read:
        submission = await contact_service.mark_as_read(submission_id)
    
    return ContactSubmissionDB.model_validate(submission)


@router.patch(
    "/admin/messages/{submission_id}",
    response_model=ContactSubmissionDB,
    tags=["Admin Messages"],
)
async def update_admin_message(
    submission_id: UUID,
    payload: ContactSubmissionUpdate,
    admin: AdminUser,
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactSubmissionDB:
    """
    Update a contact submission status or response (admin only).
    """
    submission = await contact_service.get_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Convert schema enum to model enum if status provided
    status_enum = None
    if payload.status:
        status_enum = ContactStatus(payload.status.value)
    
    updated = await contact_service.update_submission(
        submission_id=submission_id,
        status=status_enum,
        response_notes=payload.response_notes,
        is_read=payload.is_read,
    )
    
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update message")
    
    return ContactSubmissionDB.model_validate(updated)


@router.post(
    "/admin/messages/{submission_id}/mark-read",
    response_model=ContactSubmissionDB,
    tags=["Admin Messages"],
)
async def mark_message_read(
    submission_id: UUID,
    admin: AdminUser,
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactSubmissionDB:
    """
    Mark a message as read (admin only).
    """
    submission = await contact_service.mark_as_read(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return ContactSubmissionDB.model_validate(submission)
