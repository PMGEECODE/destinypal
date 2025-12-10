"""
Sponsor management API routes.
All endpoints require authentication with credentials.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.sponsor import Sponsor
from app.models.sponsorship import Sponsorship, SponsorshipStatus
from app.models.student import Student, StudentFeeBalance
from app.models.institution import Institution, ComplianceStatus
from app.schemas.sponsor import (
    SponsorCreate,
    SponsorUpdate,
    SponsorResponse,
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse,
    SponsorshipDetailResponse,
)
from app.core.deps import CurrentUser, AdminUser, DBSession

router = APIRouter()


@router.get("/institutions-with-students")
async def get_institutions_with_students(
    db: DBSession,
    current_user: CurrentUser,  # Requires authentication
) -> Dict[str, Any]:
    """
    Get all active institutions with their students.
    Requires authentication - sponsors must be logged in.
    
    Returns ALL students with their sponsorship status:
    - unsponsored: no sponsorships or balance_due == total_fees
    - partially_sponsored: has sponsorships but balance_due > 0
    - fully_sponsored: balance_due == 0 or amount_paid >= total_fees
    """
    # Fetch all active institutions
    inst_query = select(Institution).where(
        Institution.compliance_status == ComplianceStatus.ACTIVE
    )
    inst_result = await db.execute(inst_query)
    institutions = inst_result.scalars().all()
    
    # Fetch students with fee balances and sponsorships for each institution
    grouped_students: Dict[str, Dict[str, Any]] = {}
    institutions_list: List[Dict[str, Any]] = []
    total_students = 0
    total_needed = Decimal("0")
    
    for institution in institutions:
        inst_data = {
            "id": str(institution.id),
            "name": institution.name,
            "email": institution.email,
            "phone": institution.phone,
            "address": institution.address,
            "county": institution.county,
            "state": institution.state,
            "city": institution.city,
            "country": institution.country,
            "institution_type": institution.institution_type.value if institution.institution_type else None,
            "registration_number": institution.registration_number,
            "website": institution.website,
            "description": institution.description,
            "contact_person_name": institution.contact_person_name,
            "contact_person_email": institution.contact_person_email,
            "contact_person_phone": institution.contact_person_phone,
            "is_verified": institution.is_verified,
            "compliance_status": institution.compliance_status.value if institution.compliance_status else "active",
            "student_count": 0,
            "total_balance_needed": 0.0,
            "unsponsored_count": 0,
            "partially_sponsored_count": 0,
            "fully_sponsored_count": 0,
        }
        
        students_query = (
            select(Student)
            .options(
                selectinload(Student.fee_balance),
                selectinload(Student.sponsorships),
            )
            .where(
                Student.institution_id == institution.id,
                Student.compliance_status == ComplianceStatus.ACTIVE,
            )
        )
        students_result = await db.execute(students_query)
        students = students_result.scalars().all()
        
        all_students = []
        institution_balance_needed = Decimal("0")
        unsponsored_count = 0
        partially_sponsored_count = 0
        fully_sponsored_count = 0
        
        for student in students:
            total_fees = Decimal("0")
            amount_paid = Decimal("0")
            balance_due = Decimal("0")
            
            if student.fee_balance:
                total_fees = Decimal(str(student.fee_balance.total_fees or 0))
                amount_paid = Decimal(str(student.fee_balance.amount_paid or 0))
                balance_due = Decimal(str(student.fee_balance.balance_due or 0))
            
            amount_raised = Decimal("0")
            active_sponsorships = [
                s for s in student.sponsorships 
                if s.status in [SponsorshipStatus.ACTIVE, SponsorshipStatus.COMPLETED]
            ]
            for sponsorship in active_sponsorships:
                amount_raised += Decimal(str(sponsorship.amount or 0))
            
            has_sponsorships = len(active_sponsorships) > 0
            
            if total_fees > 0:
                if balance_due <= 0 or amount_paid >= total_fees:
                    sponsorship_status = "fully_sponsored"
                    fully_sponsored_count += 1
                elif has_sponsorships or amount_paid > 0:
                    sponsorship_status = "partially_sponsored"
                    partially_sponsored_count += 1
                    institution_balance_needed += balance_due
                else:
                    sponsorship_status = "unsponsored"
                    unsponsored_count += 1
                    institution_balance_needed += balance_due
            else:
                # No fee balance record - treat as unsponsored with no fees
                sponsorship_status = "no_fees_recorded"
                unsponsored_count += 1
            
            student_data = {
                "id": str(student.id),
                "full_name": student.full_name,
                "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
                "gender": student.gender,
                "grade_level": student.grade_level,
                "location": student.location,
                "photo_url": student.photo_url,
                "background_story": student.background_story,
                "family_situation": student.family_situation,
                "academic_performance": student.academic_performance,
                "need_level": student.need_level,
                "is_verified": student.is_verified,
                "institution_id": str(student.institution_id),
                "sponsorship_status": sponsorship_status,
                "amount_raised": float(amount_raised),
                "funding_goal": float(total_fees),
                "fee_balance": {
                    "total_fees": float(total_fees),
                    "amount_paid": float(amount_paid),
                    "balance_due": float(balance_due),
                },
                "sponsorship_count": len(active_sponsorships),
            }
            all_students.append(student_data)
            
            if balance_due > 0:
                total_needed += balance_due
        
        inst_data["student_count"] = len(all_students)
        inst_data["total_balance_needed"] = float(institution_balance_needed)
        inst_data["unsponsored_count"] = unsponsored_count
        inst_data["partially_sponsored_count"] = partially_sponsored_count
        inst_data["fully_sponsored_count"] = fully_sponsored_count
        total_students += len(all_students)
        
        grouped_students[str(institution.id)] = {
            "institution": inst_data,
            "students": all_students,
        }
        
        institutions_list.append(inst_data)
    
    return {
        "grouped_students": grouped_students,
        "institutions": institutions_list,
        "stats": {
            "total_students": total_students,
            "total_institutions": len(institutions_list),
            "total_needed": float(total_needed),
        },
    }


@router.get("/students/{student_id}")
async def get_student_for_sponsorship(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,  # Requires authentication
) -> Dict[str, Any]:
    """
    Get a single student's details for sponsorship.
    Requires authentication - sponsors must be logged in.
    """
    result = await db.execute(
        select(Student)
        .options(
            selectinload(Student.fee_balance),
            selectinload(Student.institution),
            selectinload(Student.sponsorships),
        )
        .where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    fee_balance = student.fee_balance
    total_fees = Decimal(str(fee_balance.total_fees or 0)) if fee_balance else Decimal("0")
    amount_paid = Decimal(str(fee_balance.amount_paid or 0)) if fee_balance else Decimal("0")
    balance_due = Decimal(str(fee_balance.balance_due or 0)) if fee_balance else Decimal("0")
    
    # Calculate sponsorship status
    active_sponsorships = [
        s for s in student.sponsorships 
        if s.status in [SponsorshipStatus.ACTIVE, SponsorshipStatus.COMPLETED]
    ]
    amount_raised = sum(Decimal(str(s.amount or 0)) for s in active_sponsorships)
    
    if total_fees > 0:
        if balance_due <= 0 or amount_paid >= total_fees:
            sponsorship_status = "fully_sponsored"
        elif len(active_sponsorships) > 0 or amount_paid > 0:
            sponsorship_status = "partially_sponsored"
        else:
            sponsorship_status = "unsponsored"
    else:
        sponsorship_status = "no_fees_recorded"
    
    return {
        "id": str(student.id),
        "full_name": student.full_name,
        "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
        "gender": student.gender,
        "grade_level": student.grade_level,
        "location": student.location,
        "photo_url": student.photo_url,
        "background_story": student.background_story,
        "family_situation": student.family_situation,
        "academic_performance": student.academic_performance,
        "need_level": student.need_level,
        "is_verified": student.is_verified,
        "institution_id": str(student.institution_id),
        "institution_name": student.institution.name if student.institution else None,
        "sponsorship_status": sponsorship_status,
        "amount_raised": float(amount_raised),
        "funding_goal": float(total_fees),
        "fee_balance": {
            "total_fees": float(total_fees),
            "amount_paid": float(amount_paid),
            "balance_due": float(balance_due),
        },
        "sponsorship_count": len(active_sponsorships),
    }


@router.get("/students/{student_id}/fee-balance")
async def get_student_fee_balance_for_sponsorship(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,  # Requires authentication
) -> Dict[str, Any]:
    """
    Get student fee balance for sponsorship decisions.
    Requires authentication - sponsors must be logged in.
    """
    result = await db.execute(
        select(StudentFeeBalance).where(StudentFeeBalance.student_id == student_id)
    )
    fee_balance = result.scalar_one_or_none()
    
    if not fee_balance:
        return {
            "total_fees": 0,
            "amount_paid": 0,
            "balance": 0,
            "balance_due": 0,
            "updated_at": None,
        }
    
    return {
        "total_fees": float(fee_balance.total_fees or 0),
        "amount_paid": float(fee_balance.amount_paid or 0),
        "balance": float((fee_balance.total_fees or 0) - (fee_balance.amount_paid or 0)),
        "balance_due": float(fee_balance.balance_due or 0),
        "updated_at": fee_balance.updated_at.isoformat() if hasattr(fee_balance, 'updated_at') and fee_balance.updated_at else None,
    }


@router.get("/", response_model=List[SponsorResponse])
async def list_sponsors(
    db: DBSession,
    admin: AdminUser,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
):
    """List all sponsors (admin only)."""
    query = select(Sponsor)
    
    if is_active is not None:
        query = query.where(Sponsor.is_active == is_active)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/me", response_model=SponsorResponse)
async def get_my_sponsor_profile(
    db: DBSession,
    current_user: CurrentUser,
):
    """Get current user's sponsor profile."""
    result = await db.execute(
        select(Sponsor).where(Sponsor.user_id == current_user.id)
    )
    sponsor = result.scalar_one_or_none()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor profile not found",
        )
    
    return sponsor


@router.get("/me/sponsorships", response_model=List[SponsorshipDetailResponse])
async def get_my_sponsorships(
    db: DBSession,
    current_user: CurrentUser,
):
    """Get current user's sponsorships."""
    result = await db.execute(
        select(Sponsor).where(Sponsor.user_id == current_user.id)
    )
    sponsor = result.scalar_one_or_none()
    
    if not sponsor:
        return []
    
    result = await db.execute(
        select(Sponsorship)
        .options(selectinload(Sponsorship.student).selectinload(Student.institution))
        .where(Sponsorship.sponsor_id == sponsor.id)
    )
    sponsorships = result.scalars().all()
    
    return [
        SponsorshipDetailResponse(
            **{k: v for k, v in s.__dict__.items() if not k.startswith("_")},
            student_name=s.student.full_name if s.student else None,
            student_photo_url=s.student.photo_url if s.student else None,
            institution_name=s.student.institution.name if s.student and s.student.institution else None,
        )
        for s in sponsorships
    ]


@router.post("/sponsorships", response_model=SponsorshipResponse)
async def create_sponsorship(
    sponsorship_data: SponsorshipCreate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Create a new sponsorship."""
    # Get or create sponsor record
    result = await db.execute(
        select(Sponsor).where(Sponsor.user_id == current_user.id)
    )
    sponsor = result.scalar_one_or_none()
    
    if not sponsor:
        # Create sponsor record
        sponsor = Sponsor(
            user_id=current_user.id,
            full_name=current_user.profile.full_name if current_user.profile else current_user.email,
            email=current_user.email,
            phone=current_user.phone,
        )
        db.add(sponsor)
        await db.flush()
    
    # Verify student exists
    result = await db.execute(
        select(Student).where(Student.id == sponsorship_data.student_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    sponsorship = Sponsorship(
        sponsor_id=sponsor.id,
        **sponsorship_data.model_dump(),
    )
    db.add(sponsorship)
    await db.commit()
    await db.refresh(sponsorship)
    
    return sponsorship


@router.get("/{sponsor_id}", response_model=SponsorResponse)
async def get_sponsor(
    sponsor_id: UUID,
    db: DBSession,
    admin: AdminUser,
):
    """Get sponsor by ID (admin only)."""
    result = await db.execute(
        select(Sponsor).where(Sponsor.id == sponsor_id)
    )
    sponsor = result.scalar_one_or_none()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found",
        )
    
    return sponsor


@router.patch("/{sponsor_id}", response_model=SponsorResponse)
async def update_sponsor(
    sponsor_id: UUID,
    updates: SponsorUpdate,
    db: DBSession,
    admin: AdminUser,
):
    """Update sponsor (admin only)."""
    result = await db.execute(
        select(Sponsor).where(Sponsor.id == sponsor_id)
    )
    sponsor = result.scalar_one_or_none()
    
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found",
        )
    
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(sponsor, key, value)
    
    await db.commit()
    await db.refresh(sponsor)
    return sponsor


@router.get("/{sponsor_id}/sponsorships", response_model=List[SponsorshipResponse])
async def get_sponsor_sponsorships(
    sponsor_id: UUID,
    db: DBSession,
    admin: AdminUser,
):
    """Get sponsor's sponsorships (admin only)."""
    result = await db.execute(
        select(Sponsorship).where(Sponsorship.sponsor_id == sponsor_id)
    )
    return result.scalars().all()
