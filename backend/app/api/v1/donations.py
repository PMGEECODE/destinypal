"""
Donation API routes - Updated with full CRUD and filtering.
"""
from typing import List, Optional
from uuid import UUID
import logging

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, and_

from app.models.donation import OrganizationDonation, DonationStatus
from app.models.sponsor import Sponsor
from app.schemas.donation import (
    DonationCreate,
    DonationResponse,
    DonationUpdate,
    DonationListResponse,
)
from app.core.deps import CurrentUser, AdminUser, DBSession, OptionalUser

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=DonationListResponse)
async def list_donations(
    db: DBSession,
    admin: AdminUser,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    student_id: Optional[UUID] = None,
    sponsor_id: Optional[UUID] = None,
):
    """List all donations with filtering (admin only)."""
    # Build query
    query = select(OrganizationDonation)
    
    # Apply filters
    filters = []
    if status:
        filters.append(OrganizationDonation.status == status)
    if payment_method:
        filters.append(OrganizationDonation.payment_method == payment_method)
    if student_id:
        filters.append(OrganizationDonation.student_id == student_id)
    if sponsor_id:
        filters.append(OrganizationDonation.sponsor_id == sponsor_id)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(OrganizationDonation.created_at.desc())
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    return DonationListResponse(
        items=[DonationResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.post("/", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
async def create_donation(
    donation_data: DonationCreate,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Create a new donation."""
    sponsor_id = None
    
    # Link to sponsor if user is authenticated
    if current_user:
        result = await db.execute(
            select(Sponsor).where(Sponsor.user_id == current_user.id)
        )
        sponsor = result.scalar_one_or_none()
        if sponsor:
            sponsor_id = sponsor.id
    
    # Determine initial status based on transaction
    initial_status = DonationStatus.PENDING
    if donation_data.transaction_id:
        # If transaction is provided, mark as completed (payment was processed)
        initial_status = DonationStatus.COMPLETED
    
    donation = OrganizationDonation(
        sponsor_id=sponsor_id,
        donor_name=donation_data.donor_name,
        donor_email=donation_data.donor_email,
        donor_phone=donation_data.donor_phone,
        amount=donation_data.amount,
        currency=donation_data.currency,
        payment_method=donation_data.payment_method,
        frequency=donation_data.frequency,
        message=donation_data.message,
        is_anonymous=donation_data.is_anonymous,
        transaction_id=donation_data.transaction_id,
        student_id=donation_data.student_id,
        status=initial_status,
    )
    
    db.add(donation)
    await db.commit()
    await db.refresh(donation)
    
    logger.info(f"Donation created: {donation.id} - ${donation.amount} {donation.currency}")
    
    return donation


@router.get("/me", response_model=DonationListResponse)
async def get_my_donations(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    """Get donations made by current user."""
    # Find sponsor for current user
    sponsor_result = await db.execute(
        select(Sponsor).where(Sponsor.user_id == current_user.id)
    )
    sponsor = sponsor_result.scalar_one_or_none()
    
    if not sponsor:
        return DonationListResponse(items=[], total=0, page=page, size=size, pages=0)
    
    # Get donations
    query = select(OrganizationDonation).where(
        OrganizationDonation.sponsor_id == sponsor.id
    )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(OrganizationDonation.created_at.desc())
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    return DonationListResponse(
        items=[DonationResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.get("/{donation_id}", response_model=DonationResponse)
async def get_donation(
    donation_id: UUID,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Get donation details."""
    result = await db.execute(
        select(OrganizationDonation).where(OrganizationDonation.id == donation_id)
    )
    donation = result.scalar_one_or_none()
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )
    
    # Check access - admin can see all, sponsors can see their own
    if current_user:
        sponsor_result = await db.execute(
            select(Sponsor).where(Sponsor.user_id == current_user.id)
        )
        sponsor = sponsor_result.scalar_one_or_none()
        
        # Allow if admin or owner
        if current_user.role != "admin" and (not sponsor or donation.sponsor_id != sponsor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    return donation


@router.patch("/{donation_id}", response_model=DonationResponse)
async def update_donation(
    donation_id: UUID,
    update_data: DonationUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Update donation (admin or owner only)."""
    result = await db.execute(
        select(OrganizationDonation).where(OrganizationDonation.id == donation_id)
    )
    donation = result.scalar_one_or_none()
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )
    
    # Check access
    if current_user.role != "admin":
        sponsor_result = await db.execute(
            select(Sponsor).where(Sponsor.user_id == current_user.id)
        )
        sponsor = sponsor_result.scalar_one_or_none()
        
        if not sponsor or donation.sponsor_id != sponsor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(donation, field, value)
    
    await db.commit()
    await db.refresh(donation)
    
    return donation
