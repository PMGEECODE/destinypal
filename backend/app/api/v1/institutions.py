"""
Institution management API routes.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.institution import Institution
from app.models.student import Student
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
    InstitutionDetailResponse,
)
from app.core.deps import CurrentUser, AdminUser, DBSession

router = APIRouter()


@router.get("/", response_model=List[InstitutionResponse])
async def list_institutions(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    is_verified: Optional[bool] = None,
    country: Optional[str] = None,
):
    """List institutions."""
    query = select(Institution)
    
    if is_verified is not None:
        query = query.where(Institution.is_verified == is_verified)
    if country:
        query = query.where(Institution.country == country)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=InstitutionResponse)
async def create_institution(
    institution_data: InstitutionCreate,
    db: DBSession,
    admin: AdminUser,
):
    """Create a new institution (admin only)."""
    # Check if name exists
    result = await db.execute(
        select(Institution).where(Institution.name == institution_data.name)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institution name already exists",
        )
    
    institution = Institution(**institution_data.model_dump())
    db.add(institution)
    await db.commit()
    await db.refresh(institution)
    return institution


@router.get("/me", response_model=InstitutionDetailResponse)
async def get_my_institution(
    db: DBSession,
    current_user: CurrentUser,
):
    """Get current user's institution profile."""
    result = await db.execute(
        select(Institution).where(Institution.user_id == current_user.id)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution profile not found",
        )
    
    # Get student count
    count_result = await db.execute(
        select(func.count(Student.id)).where(Student.institution_id == institution.id)
    )
    student_count = count_result.scalar() or 0
    
    return InstitutionDetailResponse(
        **{k: v for k, v in institution.__dict__.items() if not k.startswith("_")},
        student_count=student_count,
    )


@router.get("/{institution_id}", response_model=InstitutionDetailResponse)
async def get_institution(
    institution_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get institution details."""
    result = await db.execute(
        select(Institution).where(Institution.id == institution_id)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )
    
    # Get student count
    count_result = await db.execute(
        select(func.count(Student.id)).where(Student.institution_id == institution.id)
    )
    student_count = count_result.scalar() or 0
    
    return InstitutionDetailResponse(
        **{k: v for k, v in institution.__dict__.items() if not k.startswith("_")},
        student_count=student_count,
    )


@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: UUID,
    updates: InstitutionUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Update institution details."""
    result = await db.execute(
        select(Institution).where(Institution.id == institution_id)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )
    
    # Check authorization
    if current_user.role.value != "admin":
        if institution.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this institution",
            )
    
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(institution, key, value)
    
    await db.commit()
    await db.refresh(institution)
    return institution


@router.delete("/{institution_id}")
async def delete_institution(
    institution_id: UUID,
    db: DBSession,
    admin: AdminUser,
):
    """Delete an institution (admin only)."""
    result = await db.execute(
        select(Institution).where(Institution.id == institution_id)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )
    
    await db.delete(institution)
    await db.commit()
    
    return {"message": "Institution deleted successfully"}
