# """
# Public API routes - No authentication required.
# Used for sponsors to browse institutions and students in need.
# """
# from typing import List, Optional
# from uuid import UUID

# from fastapi import APIRouter, Query, HTTPException, status
# from sqlalchemy import select, func
# from sqlalchemy.orm import selectinload

# from app.models.institution import Institution, ComplianceStatus, InstitutionType
# from app.models.student import Student, StudentFeeBalance
# from app.models.sponsorship import Sponsorship, SponsorshipStatus
# from app.schemas.institution import InstitutionResponse
# from app.schemas.student import StudentResponse, StudentFeeBalanceResponse
# from app.core.deps import DBSession

# router = APIRouter()


# @router.get("/institutions/by-type/{institution_type}", response_model=List[InstitutionResponse])
# async def list_institutions_by_type(
#     institution_type: str,
#     db: DBSession,
#     skip: int = 0,
#     limit: int = 500,
#     search: Optional[str] = Query(None, min_length=1, max_length=100),
# ):
#     """
#     List institutions filtered by type - public endpoint for student registration.
    
#     institution_type options:
#     - "secondary_school" - For high school students (Form 1-4)
#     - "university" - For university students
#     - "college" - For college students  
#     - "vocational" - For vocational training students
#     - "primary_school" - For primary school students
    
#     Only returns institutions with ACTIVE compliance status.
#     Students can only register if their institution exists in the system.
#     """
#     # Validate institution type
#     valid_types = ["primary_school", "secondary_school", "vocational", "university", "college"]
#     if institution_type not in valid_types:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Invalid institution type. Must be one of: {', '.join(valid_types)}"
#         )
    
#     # Map string to enum
#     type_mapping = {
#         "primary_school": InstitutionType.PRIMARY_SCHOOL,
#         "secondary_school": InstitutionType.SECONDARY_SCHOOL,
#         "vocational": InstitutionType.VOCATIONAL,
#         "university": InstitutionType.UNIVERSITY,
#         "college": InstitutionType.COLLEGE,
#     }
    
#     query = (
#         select(Institution)
#         .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
#         .where(Institution.institution_type == type_mapping[institution_type])
#     )
    
#     # Optional search by name
#     if search:
#         query = query.where(Institution.name.ilike(f"%{search}%"))
    
#     query = query.order_by(Institution.name).offset(skip).limit(limit)
#     result = await db.execute(query)
#     return result.scalars().all()


# @router.get("/institutions/higher-learning", response_model=List[InstitutionResponse])
# async def list_higher_learning_institutions(
#     db: DBSession,
#     skip: int = 0,
#     limit: int = 500,
#     search: Optional[str] = Query(None, min_length=1, max_length=100),
# ):
#     """
#     List all higher learning institutions (universities and colleges).
#     For university/college student registration forms.
#     Only returns institutions with ACTIVE compliance status.
#     """
#     query = (
#         select(Institution)
#         .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
#         .where(
#             Institution.institution_type.in_([
#                 InstitutionType.UNIVERSITY,
#                 InstitutionType.COLLEGE
#             ])
#         )
#     )
    
#     if search:
#         query = query.where(Institution.name.ilike(f"%{search}%"))
    
#     query = query.order_by(Institution.name).offset(skip).limit(limit)
#     result = await db.execute(query)
#     return result.scalars().all()


# @router.get("/institutions/{institution_id}/validate")
# async def validate_institution_for_registration(
#     institution_id: UUID,
#     db: DBSession,
#     expected_type: Optional[str] = Query(None),
# ):
#     """
#     Validate that an institution exists and is active for student registration.
#     Returns basic institution info if valid, 404 if not found or inactive.
    
#     Optionally validates institution type matches expected_type.
#     """
#     result = await db.execute(
#         select(Institution)
#         .where(Institution.id == institution_id)
#         .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
#     )
#     institution = result.scalar_one_or_none()
    
#     if not institution:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Institution not found or not active. Students can only register with verified institutions."
#         )
    
#     # Validate type if specified
#     if expected_type:
#         type_mapping = {
#             "secondary_school": InstitutionType.SECONDARY_SCHOOL,
#             "university": InstitutionType.UNIVERSITY,
#             "college": InstitutionType.COLLEGE,
#             "vocational": InstitutionType.VOCATIONAL,
#             "primary_school": InstitutionType.PRIMARY_SCHOOL,
#         }
        
#         if expected_type in type_mapping:
#             # For higher learning, accept both university and college
#             if expected_type == "higher_learning":
#                 valid_types = [InstitutionType.UNIVERSITY, InstitutionType.COLLEGE]
#                 if institution.institution_type not in valid_types:
#                     raise HTTPException(
#                         status_code=status.HTTP_400_BAD_REQUEST,
#                         detail="Selected institution is not a university or college"
#                     )
#             elif institution.institution_type != type_mapping[expected_type]:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=f"Selected institution is not a {expected_type.replace('_', ' ')}"
#                 )
    
#     return {
#         "id": str(institution.id),
#         "name": institution.name,
#         "institution_type": institution.institution_type.value if institution.institution_type else None,
#         "is_valid": True,
#     }


# @router.get("/institutions", response_model=List[InstitutionResponse])
# async def list_public_institutions(
#     db: DBSession,
#     skip: int = 0,
#     limit: int = 100,
# ):
#     """
#     List all institutions - public endpoint for sponsors to browse.
#     No authentication required.
#     Shows all institutions with ACTIVE compliance status
#     """
#     query = (
#         select(Institution)
#         .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
#         .offset(skip)
#         .limit(limit)
#     )
#     result = await db.execute(query)
#     return result.scalars().all()


# @router.get("/institutions/{institution_id}", response_model=InstitutionResponse)
# async def get_public_institution(
#     institution_id: UUID,
#     db: DBSession,
# ):
#     """Get a single institution's public info."""
#     result = await db.execute(
#         select(Institution)
#         .where(Institution.id == institution_id)
#         .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
#     )
#     institution = result.scalar_one_or_none()
#     if not institution:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Institution not found"
#         )
#     return institution


# @router.get("/students", response_model=List[StudentResponse])
# async def list_public_students(
#     db: DBSession,
#     skip: int = 0,
#     limit: int = 100,
#     institution_id: Optional[UUID] = None,
#     need_level_min: Optional[int] = Query(None, ge=1, le=10),
# ):
#     """
#     List verified students needing sponsorship - public endpoint.
#     Returns students that are verified and need sponsors.
#     """
#     query = (
#         select(Student)
#         .options(selectinload(Student.fee_balance))
#         .where(Student.is_verified == True)
#     )
    
#     if institution_id:
#         query = query.where(Student.institution_id == institution_id)
#     if need_level_min:
#         query = query.where(Student.need_level >= need_level_min)
    
#     query = query.order_by(Student.need_level.desc()).offset(skip).limit(limit)
#     result = await db.execute(query)
#     return result.scalars().all()


# @router.get("/students/{student_id}")
# async def get_public_student(
#     student_id: UUID,
#     db: DBSession,
# ):
#     """Get a single student's public info for sponsorship."""
#     result = await db.execute(
#         select(Student)
#         .options(
#             selectinload(Student.fee_balance),
#             selectinload(Student.institution),
#         )
#         .where(Student.id == student_id)
#         .where(Student.is_verified == True)
#     )
#     student = result.scalar_one_or_none()
#     if not student:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Student not found"
#         )
    
#     # Build response with institution name
#     fee_balance = student.fee_balance
#     return {
#         "id": str(student.id),
#         "first_name": student.first_name,
#         "last_name": student.last_name,
#         "email": student.email,
#         "institution_id": str(student.institution_id),
#         "institution_name": student.institution.name if student.institution else None,
#         "grade_level": student.grade_level,
#         "need_level": student.need_level,
#         "bio": student.bio,
#         "is_verified": student.is_verified,
#         "created_at": student.created_at.isoformat() if student.created_at else None,
#         "fee_balance": {
#             "tuition_fee": float(fee_balance.tuition_fee) if fee_balance else 0,
#             "paid_amount": float(fee_balance.paid_amount) if fee_balance else 0,
#             "balance": float(fee_balance.tuition_fee - fee_balance.paid_amount) if fee_balance else 0,
#         } if fee_balance else None,
#     }


# @router.get("/students/{student_id}/fee-balance")
# async def get_public_student_fee_balance(
#     student_id: UUID,
#     db: DBSession,
# ):
#     """Get student fee balance - public for sponsorship decisions."""
#     result = await db.execute(
#         select(StudentFeeBalance).where(StudentFeeBalance.student_id == student_id)
#     )
#     fee_balance = result.scalar_one_or_none()
    
#     if not fee_balance:
#         # Return empty balance if not found
#         return {
#             "tuition_fee": 0,
#             "paid_amount": 0,
#             "balance": 0,
#         }
    
#     return {
#         "tuition_fee": float(fee_balance.tuition_fee),
#         "paid_amount": float(fee_balance.paid_amount),
#         "balance": float(fee_balance.tuition_fee - fee_balance.paid_amount),
#     }


# @router.get("/students-in-need")
# async def get_students_in_need(
#     db: DBSession,
#     skip: int = 0,
#     limit: int = 100,
# ):
#     """
#     Get all students in need grouped by institution.
#     This is the main endpoint for the sponsor dashboard.
#     Updated to fetch ALL active institutions (compliance_status = ACTIVE)
#     """
#     inst_result = await db.execute(
#         select(Institution).where(Institution.compliance_status == ComplianceStatus.ACTIVE)
#     )
#     institutions = inst_result.scalars().all()
    
#     students_result = await db.execute(
#         select(Student)
#         .options(selectinload(Student.fee_balance))
#         .order_by(Student.need_level.desc())
#     )
#     students = students_result.scalars().all()
    
#     # Group students by institution
#     grouped_students = {}
#     total_needed = 0
    
#     for inst in institutions:
#         inst_students = [s for s in students if str(s.institution_id) == str(inst.id)]
        
#         student_list = []
#         for s in inst_students:
#             fee_balance = s.fee_balance
#             balance = float(fee_balance.tuition_fee - fee_balance.paid_amount) if fee_balance else 0
            
#             # Only include students who still need funding
#             if balance > 0:
#                 total_needed += balance
                
#                 student_list.append({
#                     "id": str(s.id),
#                     "first_name": s.first_name,
#                     "last_name": s.last_name,
#                     "email": s.email,
#                     "institution_id": str(s.institution_id),
#                     "grade_level": s.grade_level,
#                     "need_level": s.need_level or 5,
#                     "bio": s.bio,
#                     "is_verified": s.is_verified,
#                     "profile_picture_url": getattr(s, 'profile_picture_url', None),
#                     "funding_goal": float(fee_balance.tuition_fee) if fee_balance else 0,
#                     "amount_raised": float(fee_balance.paid_amount) if fee_balance else 0,
#                     "fee_balance": {
#                         "tuition_fee": float(fee_balance.tuition_fee) if fee_balance else 0,
#                         "paid_amount": float(fee_balance.paid_amount) if fee_balance else 0,
#                         "balance": balance,
#                     } if fee_balance else None,
#                 })
        
#         grouped_students[str(inst.id)] = {
#             "institution": {
#                 "id": str(inst.id),
#                 "name": inst.name,
#                 "email": inst.email,
#                 "phone": inst.phone,
#                 "address": inst.address,
#                 "city": getattr(inst, 'city', None),
#                 "county": getattr(inst, 'county', None),
#                 "country": inst.country,
#                 "institution_type": inst.institution_type.value if inst.institution_type else None,
#                 "is_verified": inst.is_verified,
#                 "compliance_status": inst.compliance_status.value if inst.compliance_status else None,
#                 "logo_url": getattr(inst, 'logo_url', None),
#                 "description": getattr(inst, 'description', None),
#             },
#             "students": sorted(student_list, key=lambda x: x.get("need_level", 0), reverse=True),
#         }
    
#     # Build response
#     institutions_response = [
#         {
#             "id": str(inst.id),
#             "name": inst.name,
#             "email": inst.email,
#             "phone": inst.phone,
#             "address": inst.address,
#             "city": getattr(inst, 'city', None),
#             "county": getattr(inst, 'county', None),
#             "country": inst.country,
#             "institution_type": inst.institution_type.value if inst.institution_type else None,
#             "is_verified": inst.is_verified,
#             "compliance_status": inst.compliance_status.value if inst.compliance_status else None,
#             "logo_url": getattr(inst, 'logo_url', None),
#             "description": getattr(inst, 'description', None),
#             "student_count": len(grouped_students.get(str(inst.id), {}).get("students", [])),
#         }
#         for inst in institutions
#     ]
    
#     return {
#         "grouped_students": grouped_students,
#         "institutions": institutions_response,
#         "stats": {
#             "total_students": sum(len(g["students"]) for g in grouped_students.values()),
#             "total_institutions": len(institutions),
#             "total_needed": total_needed,
#         },
#     }
"""
Public API routes - Limited to registration-related endpoints only.
Student/sponsor data is now protected and requires authentication.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Query, HTTPException, status
from sqlalchemy import select

from app.models.institution import Institution, ComplianceStatus, InstitutionType
from app.schemas.institution import InstitutionResponse
from app.core.deps import DBSession

router = APIRouter()


# Student-related endpoints are moved to protected routes

@router.get("/institutions/by-type/{institution_type}", response_model=List[InstitutionResponse])
async def list_institutions_by_type(
    institution_type: str,
    db: DBSession,
    skip: int = 0,
    limit: int = 500,
    search: Optional[str] = Query(None, min_length=1, max_length=100),
):
    """
    List institutions filtered by type - public endpoint for student registration.
    
    institution_type options:
    - "secondary_school" - For high school students (Form 1-4)
    - "university" - For university students
    - "college" - For college students  
    - "vocational" - For vocational training students
    - "primary_school" - For primary school students
    
    Only returns institutions with ACTIVE compliance status.
    Students can only register if their institution exists in the system.
    """
    # Validate institution type
    valid_types = ["primary_school", "secondary_school", "vocational", "university", "college"]
    if institution_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid institution type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Map string to enum
    type_mapping = {
        "primary_school": InstitutionType.PRIMARY_SCHOOL,
        "secondary_school": InstitutionType.SECONDARY_SCHOOL,
        "vocational": InstitutionType.VOCATIONAL,
        "university": InstitutionType.UNIVERSITY,
        "college": InstitutionType.COLLEGE,
    }
    
    query = (
        select(Institution)
        .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
        .where(Institution.institution_type == type_mapping[institution_type])
    )
    
    # Optional search by name
    if search:
        query = query.where(Institution.name.ilike(f"%{search}%"))
    
    query = query.order_by(Institution.name).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/institutions/higher-learning", response_model=List[InstitutionResponse])
async def list_higher_learning_institutions(
    db: DBSession,
    skip: int = 0,
    limit: int = 500,
    search: Optional[str] = Query(None, min_length=1, max_length=100),
):
    """
    List all higher learning institutions (universities and colleges).
    For university/college student registration forms.
    Only returns institutions with ACTIVE compliance status.
    """
    query = (
        select(Institution)
        .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
        .where(
            Institution.institution_type.in_([
                InstitutionType.UNIVERSITY,
                InstitutionType.COLLEGE
            ])
        )
    )
    
    if search:
        query = query.where(Institution.name.ilike(f"%{search}%"))
    
    query = query.order_by(Institution.name).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/institutions/{institution_id}/validate")
async def validate_institution_for_registration(
    institution_id: UUID,
    db: DBSession,
    expected_type: Optional[str] = Query(None),
):
    """
    Validate that an institution exists and is active for student registration.
    Returns basic institution info if valid, 404 if not found or inactive.
    
    Optionally validates institution type matches expected_type.
    """
    result = await db.execute(
        select(Institution)
        .where(Institution.id == institution_id)
        .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
    )
    institution = result.scalar_one_or_none()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found or not active. Students can only register with verified institutions."
        )
    
    # Validate type if specified
    if expected_type:
        type_mapping = {
            "secondary_school": InstitutionType.SECONDARY_SCHOOL,
            "university": InstitutionType.UNIVERSITY,
            "college": InstitutionType.COLLEGE,
            "vocational": InstitutionType.VOCATIONAL,
            "primary_school": InstitutionType.PRIMARY_SCHOOL,
        }
        
        if expected_type in type_mapping:
            # For higher learning, accept both university and college
            if expected_type == "higher_learning":
                valid_types = [InstitutionType.UNIVERSITY, InstitutionType.COLLEGE]
                if institution.institution_type not in valid_types:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Selected institution is not a university or college"
                    )
            elif institution.institution_type != type_mapping[expected_type]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Selected institution is not a {expected_type.replace('_', ' ')}"
                )
    
    return {
        "id": str(institution.id),
        "name": institution.name,
        "institution_type": institution.institution_type.value if institution.institution_type else None,
        "is_valid": True,
    }


@router.get("/institutions", response_model=List[InstitutionResponse])
async def list_public_institutions(
    db: DBSession,
    skip: int = 0,
    limit: int = 100,
):
    """
    List all institutions - public endpoint for registration dropdowns.
    Shows all institutions with ACTIVE compliance status.
    """
    query = (
        select(Institution)
        .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/institutions/{institution_id}", response_model=InstitutionResponse)
async def get_public_institution(
    institution_id: UUID,
    db: DBSession,
):
    """Get a single institution's public info for registration."""
    result = await db.execute(
        select(Institution)
        .where(Institution.id == institution_id)
        .where(Institution.compliance_status == ComplianceStatus.ACTIVE)
    )
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    return institution
