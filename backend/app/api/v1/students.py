"""
Student management API routes.
"""
from typing import List, Optional
from uuid import UUID
import os
from datetime import datetime

from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import io

from app.models.student import Student, StudentDocument, StudentFeeBalance, DocumentType, DocumentStatus
from app.models.institution import Institution
from app.models.sponsorship import Sponsorship
from app.models.sponsor import Sponsor
from app.models.payment import PaymentAccount, Payment
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentDetailResponse,
    StudentDocumentResponse,
    StudentFeeBalanceResponse,
    StudentSponsorshipResponse,
)
from app.schemas.payment import PaymentAccountResponse
from app.core.deps import CurrentUser, AdminUser, DBSession
from app.services.file_service import file_storage_service

router = APIRouter()


@router.get("/by-user/{user_id}", response_model=StudentDetailResponse)
async def get_student_by_user_id(
    user_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get student by user ID."""
    result = await db.execute(
        select(Student)
        .options(
            selectinload(Student.fee_balance),
            selectinload(Student.documents),
            selectinload(Student.institution),
        )
        .where(Student.user_id == user_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found for this user",
        )
    
    # Authorization check - only allow the user themselves or admins
    if current_user.role.value not in ["admin"] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this student",
        )
    
    return StudentDetailResponse(
        id=student.id,
        user_id=student.user_id,
        institution_id=student.institution_id,
        full_name=student.full_name,
        date_of_birth=student.date_of_birth,
        gender=student.gender,
        grade_level=student.grade_level,
        location=student.location,
        photo_url=student.photo_url,
        background_story=student.background_story,
        family_situation=student.family_situation,
        academic_performance=student.academic_performance,
        need_level=student.need_level,
        is_verified=student.is_verified,
        compliance_status=student.compliance_status.value,
        documents_verified=student.documents_verified,
        created_at=student.created_at,
        updated_at=student.updated_at,
        fee_balance=student.fee_balance,
        documents=[StudentDocumentResponse.model_validate(doc) for doc in student.documents],
        institution_name=student.institution.name if student.institution else None,
    )


@router.get("/", response_model=List[StudentResponse])
async def list_students(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    institution_id: Optional[UUID] = None,
    need_level_min: Optional[int] = Query(None, ge=1, le=10),
    need_level_max: Optional[int] = Query(None, ge=1, le=10),
    is_verified: Optional[bool] = None,
):
    """List students with optional filters."""
    query = select(Student).options(selectinload(Student.fee_balance))
    
    # Apply filters
    if institution_id:
        query = query.where(Student.institution_id == institution_id)
    if need_level_min:
        query = query.where(Student.need_level >= need_level_min)
    if need_level_max:
        query = query.where(Student.need_level <= need_level_max)
    if is_verified is not None:
        query = query.where(Student.is_verified == is_verified)
    
    # For institution users, only show their students
    if current_user.role.value == "institution":
        institution = await db.execute(
            select(Institution).where(Institution.user_id == current_user.id)
        )
        inst = institution.scalar_one_or_none()
        if inst:
            query = query.where(Student.institution_id == inst.id)
    
    query = query.order_by(Student.need_level.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=StudentResponse)
async def create_student(
    student_data: StudentCreate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Create a new student."""
    # Verify institution exists
    result = await db.execute(
        select(Institution).where(Institution.id == student_data.institution_id)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )
    
    # Check authorization for institution users
    if current_user.role.value == "institution":
        if institution.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to add students to this institution",
            )
    
    student = Student(**student_data.model_dump())
    db.add(student)
    
    # Create fee balance record
    fee_balance = StudentFeeBalance(student_id=student.id)
    db.add(fee_balance)
    
    await db.commit()
    await db.refresh(student)
    return student


@router.get("/{student_id}", response_model=StudentDetailResponse)
async def get_student(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get student details."""
    result = await db.execute(
        select(Student)
        .options(
            selectinload(Student.fee_balance),
            selectinload(Student.documents),
            selectinload(Student.institution),
        )
        .where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    response = StudentDetailResponse(
        id=student.id,
        user_id=student.user_id,
        institution_id=student.institution_id,
        full_name=student.full_name,
        date_of_birth=student.date_of_birth,
        gender=student.gender,
        grade_level=student.grade_level,
        location=student.location,
        photo_url=student.photo_url,
        background_story=student.background_story,
        family_situation=student.family_situation,
        academic_performance=student.academic_performance,
        need_level=student.need_level,
        is_verified=student.is_verified,
        compliance_status=student.compliance_status.value,
        documents_verified=student.documents_verified,
        created_at=student.created_at,
        updated_at=student.updated_at,
        fee_balance=student.fee_balance,
        documents=[StudentDocumentResponse.model_validate(doc) for doc in student.documents],
        institution_name=student.institution.name if student.institution else None,
    )
    return response


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: UUID,
    updates: StudentUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Update student details."""
    result = await db.execute(
        select(Student)
        .options(
            selectinload(Student.institution),
            selectinload(Student.fee_balance)
        )
        .where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Check authorization - allow student to update their own profile
    if current_user.role.value == "student":
        if student.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this student",
            )
    elif current_user.role.value == "institution":
        if student.institution.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this student",
            )
    
    # Apply updates
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    
    await db.commit()
    await db.refresh(student)
    return student


@router.delete("/{student_id}")
async def delete_student(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Delete a student."""
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.institution))
        .where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Check authorization
    if current_user.role.value not in ["admin"]:
        if current_user.role.value == "institution":
            if student.institution.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to delete this student",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )
    
    await db.delete(student)
    await db.commit()
    
    return {"message": "Student deleted successfully"}


@router.get("/{student_id}/documents", response_model=List[StudentDocumentResponse])
async def get_student_documents(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get student documents."""
    result = await db.execute(
        select(StudentDocument).where(StudentDocument.student_id == student_id)
    )
    return result.scalars().all()


@router.post("/{student_id}/documents/upload", response_model=StudentDocumentResponse)
async def upload_student_document_file(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
    document_type: str = Form(...),
):
    """Upload a student document file with encryption."""
    # Verify student exists
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Authorization check
    if current_user.role.value == "student" and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents for this student",
        )
    
    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024
    file_data = await file.read()
    if len(file_data) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {max_size / 1024 / 1024}MB",
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )
    
    # TODO: Add virus scanning here in production
    # virus_scan_result = await scan_file_for_viruses(file_data)
    # if virus_scan_result.infected:
    #     raise HTTPException(status_code=400, detail="Virus detected in file")
    
    try:
        # Upload file with encryption
        file_path, file_url, is_encrypted = await file_storage_service.upload_file(
            student_id=str(student_id),
            file_data=file_data,
            original_filename=file.filename or "document",
            document_type=document_type,
            mime_type=file.content_type or "application/octet-stream",
            encrypt=True,  # Always encrypt
        )
        
        # Create document record
        document = StudentDocument(
            student_id=student_id,
            document_type=DocumentType(document_type),
            file_url=file_url,
            file_name=file.filename or "document",
            file_size=len(file_data),
            mime_type=file.content_type,
            status=DocumentStatus.PENDING,
        )
        db.add(document)
        await db.commit()
        await db.refresh(document)
        
        return StudentDocumentResponse(
            id=document.id,
            student_id=document.student_id,
            document_type=document.document_type.value,
            file_url=document.file_url,
            file_name=document.file_name,
            file_size=document.file_size,
            mime_type=document.mime_type,
            status=document.status.value,
            uploaded_at=document.uploaded_at,
            is_encrypted=is_encrypted,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


@router.get("/{student_id}/documents/{document_id}/download")
async def download_student_document(
    student_id: UUID,
    document_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Download a student document with decryption."""
    # Get document
    result = await db.execute(
        select(StudentDocument)
        .where(StudentDocument.id == document_id)
        .where(StudentDocument.student_id == student_id)
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get student for authorization
    student_result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = student_result.scalar_one_or_none()
    
    # Authorization check - allow student, their institution, or admin
    if current_user.role.value == "student" and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this document",
        )
    
    try:
        # Extract filename from URL
        filename = document.file_url.split("/")[-1]
        
        # Download and decrypt file
        file_data, was_encrypted = await file_storage_service.download_file(
            student_id=str(student_id),
            filename=filename,
        )
        
        # Return file as streaming response
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type=document.mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{document.file_name}"',
            },
        )
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}",
        )


@router.delete("/{student_id}/documents/{document_id}")
async def delete_student_document(
    student_id: UUID,
    document_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Delete a student document."""
    result = await db.execute(
        select(StudentDocument)
        .where(StudentDocument.id == document_id)
        .where(StudentDocument.student_id == student_id)
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get student for authorization
    student_result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = student_result.scalar_one_or_none()
    
    if current_user.role.value == "student" and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document",
        )
    
    await db.delete(document)
    await db.commit()
    
    return {"message": "Document deleted successfully"}


@router.get("/{student_id}/fee-balance", response_model=StudentFeeBalanceResponse)
async def get_student_fee_balance(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get student fee balance."""
    result = await db.execute(
        select(StudentFeeBalance).where(StudentFeeBalance.student_id == student_id)
    )
    fee_balance = result.scalar_one_or_none()
    
    if not fee_balance:
        # Create default fee balance if not exists
        student_result = await db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )
        fee_balance = StudentFeeBalance(student_id=student_id)
        db.add(fee_balance)
        await db.commit()
        await db.refresh(fee_balance)
    
    return fee_balance


@router.get("/{student_id}/fee-balances", response_model=List[StudentFeeBalanceResponse])
async def get_student_fee_balances(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get student fee balances."""
    result = await db.execute(
        select(StudentFeeBalance).where(StudentFeeBalance.student_id == student_id)
    )
    balances = result.scalars().all()
    
    if not balances:
        # Return empty list or create default
        student_result = await db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )
        # Create default fee balance
        fee_balance = StudentFeeBalance(student_id=student_id)
        db.add(fee_balance)
        await db.commit()
        await db.refresh(fee_balance)
        return [fee_balance]
    
    return balances


@router.get("/{student_id}/sponsorships", response_model=List[StudentSponsorshipResponse])
async def get_student_sponsorships(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get all sponsorships for a student."""
    # Verify student exists and authorization
    student_result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = student_result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Authorization check
    if current_user.role.value == "student" and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view sponsorships for this student",
        )
    
    # Get sponsorships with sponsor details
    result = await db.execute(
        select(Sponsorship)
        .options(selectinload(Sponsorship.sponsor))
        .where(Sponsorship.student_id == student_id)
    )
    sponsorships = result.scalars().all()
    
    return [
        StudentSponsorshipResponse(
            id=s.id,
            sponsor_id=s.sponsor_id,
            sponsor_name=s.sponsor.full_name if s.sponsor else None,
            sponsor_email=s.sponsor.email if s.sponsor else None,
            commitment_type=s.commitment_type.value,
            amount=float(s.amount),
            status=s.status.value,
            start_date=s.start_date,
            end_date=s.end_date,
            created_at=s.created_at,
        )
        for s in sponsorships
    ]


@router.post("/{student_id}/profile-image")
async def upload_profile_image(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
):
    """
    Upload or update a student's profile photo.
    Only the student themselves can update their own photo.
    """
    # Verify student exists
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Authorization: only the student can update their own photo
    if current_user.role.value != "admin" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile photo")

    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Validate size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Profile photo too large (max 5MB)")

    try:
        # Use your existing file_storage_service (supports encryption, S3, etc.)
        _, public_url, _ = await file_storage_service.upload_file(
            student_id=str(student_id),
            file_data=contents,
            original_filename=file.filename or "profile.jpg",
            document_type="profile_photo",
            mime_type=file.content_type,
            encrypt=False,  # Profile photos are public, no need to encrypt
        )

        # Update student's photo_url
        student.photo_url = public_url
        await db.commit()
        await db.refresh(student)

        return {
            "message": "Profile photo updated successfully",
            "photo_url": public_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload profile photo: {str(e)}"
        )

@router.delete("/{student_id}/profile-image")
async def remove_profile_image(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Remove a student's profile photo."""
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role.value != "admin" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not student.photo_url:
        raise HTTPException(status_code=400, detail="No profile photo to remove")

    # Optional: delete from storage
    try:
        filename = student.photo_url.split("/")[-1]
        await file_storage_service.delete_file(str(student_id), filename)
    except:
        pass  # Best effort

    student.photo_url = None
    await db.commit()

    return {"message": "Profile photo removed"}

@router.get("/{student_id}/payment-accounts", response_model=List[PaymentAccountResponse])
async def get_student_payment_accounts(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get student's payment accounts."""
    result = await db.execute(
        select(PaymentAccount).where(PaymentAccount.student_id == student_id)
    )
    return result.scalars().all()

@router.get("/{student_id}/payments", response_model=List[dict])
async def get_student_payments(
    student_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """Get student's payment history."""
    from app.models.payment import Payment
    from app.models.sponsorship import Sponsorship
    from app.models.sponsor import Sponsor
    
    # Verify student exists
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get payments related to this student through sponsorships
    query = (
        select(Payment, Sponsorship, Sponsor)
        .join(Sponsorship, Payment.sponsorship_id == Sponsorship.id, isouter=True)
        .join(Sponsor, Sponsorship.sponsor_id == Sponsor.id, isouter=True)
        .where(Sponsorship.student_id == student_id)
        .order_by(Payment.payment_date.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    payment_rows = result.all()
    
    payments_list = []
    for payment, sponsorship, sponsor in payment_rows:
        payments_list.append({
            "id": str(payment.id),
            "amount": float(payment.amount),
            "payment_method": payment.payment_method,
            "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
            "status": payment.status,
            "reference_id": payment.reference_id,
            "sponsor_name": sponsor.organization_name if sponsor else None,
            "sponsorship_id": str(sponsorship.id) if sponsorship else None,
            "created_at": payment.created_at.isoformat(),
        })
    
    return payments_list

@router.patch("/{student_id}/fee-balance/{balance_id}", response_model=StudentFeeBalanceResponse)
async def update_student_fee_balance(
    student_id: UUID,
    balance_id: UUID,
    updates: dict,
    db: DBSession,
    current_user: CurrentUser,
):
    """Update student fee balance with term-based fees."""
    result = await db.execute(
        select(StudentFeeBalance).where(
            StudentFeeBalance.id == balance_id,
            StudentFeeBalance.student_id == student_id
        )
    )
    fee_balance = result.scalar_one_or_none()
    
    if not fee_balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee balance not found",
        )
    
    # Check authorization - student or their institution can update
    student_result = await db.execute(
        select(Student)
        .options(selectinload(Student.institution))
        .where(Student.id == student_id)
    )
    student = student_result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Authorization check
    if current_user.role.value == "student":
        if student.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this fee balance",
            )
    elif current_user.role.value == "institution":
        if student.institution.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this fee balance",
            )
    
    # Apply updates
    for key, value in updates.items():
        if hasattr(fee_balance, key):
            setattr(fee_balance, key, value)
    
    # Recalculate balance_due from total_fees and amount_paid
    if 'total_fees' in updates or 'amount_paid' in updates:
        fee_balance.balance_due = fee_balance.total_fees - fee_balance.amount_paid
    
    fee_balance.last_updated = datetime.utcnow()
    
    await db.commit()
    await db.refresh(fee_balance)
    return fee_balance


@router.patch("/{student_id}/fee-balances/{balance_id}", response_model=StudentFeeBalanceResponse)
async def update_student_fee_balance_plural(
    student_id: UUID,
    balance_id: UUID,
    updates: dict,
    db: DBSession,
    current_user: CurrentUser,
):
    """Update student fee balance (plural route alias for compatibility)."""
    return await update_student_fee_balance(student_id, balance_id, updates, db, current_user)
