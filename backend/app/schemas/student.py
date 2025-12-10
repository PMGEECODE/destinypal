"""
Student schemas.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID


class StudentBase(BaseModel):
    """Base student schema."""
    full_name: str = Field(min_length=2, max_length=255)
    date_of_birth: date
    gender: str
    grade_level: str
    location: Optional[str] = None
    photo_url: Optional[str] = None
    background_story: Optional[str] = None
    family_situation: Optional[str] = None
    academic_performance: Optional[str] = None
    need_level: int = Field(default=5, ge=1, le=10)


class StudentCreate(StudentBase):
    """Student creation schema."""
    institution_id: UUID
    user_id: Optional[UUID] = None


class StudentUpdate(BaseModel):
    """Student update schema."""
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    grade_level: Optional[str] = None
    location: Optional[str] = None
    photo_url: Optional[str] = None
    background_story: Optional[str] = None
    family_situation: Optional[str] = None
    academic_performance: Optional[str] = None
    need_level: Optional[int] = Field(default=None, ge=1, le=10)
    is_verified: Optional[bool] = None
    compliance_status: Optional[str] = None
    compliance_reason: Optional[str] = None


class StudentFeeBalanceResponse(BaseModel):
    """Student fee balance response."""
    id: UUID
    student_id: UUID
    total_fees: float
    amount_paid: float
    balance_due: float
    last_updated: datetime
    
    class Config:
        from_attributes = True


class StudentDocumentResponse(BaseModel):
    """Student document response."""
    id: UUID
    student_id: UUID
    document_type: str
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    uploaded_at: datetime
    is_encrypted: Optional[bool] = False  # Added is_encrypted field
    
    class Config:
        from_attributes = True


class StudentDocumentCreate(BaseModel):
    """Student document creation schema."""
    document_type: str
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


class StudentResponse(StudentBase):
    """Student response schema."""
    id: UUID
    user_id: Optional[UUID] = None
    institution_id: UUID
    is_verified: bool
    compliance_status: str
    documents_verified: bool
    created_at: datetime
    updated_at: datetime
    fee_balance: Optional[StudentFeeBalanceResponse] = None
    
    class Config:
        from_attributes = True


class StudentDetailResponse(StudentResponse):
    """Detailed student response with documents."""
    documents: List[StudentDocumentResponse] = []
    institution_name: Optional[str] = None


class StudentSponsorshipResponse(BaseModel):
    """Sponsorship response from student's perspective."""
    id: UUID
    sponsor_id: UUID
    sponsor_name: Optional[str] = None
    sponsor_email: Optional[str] = None
    commitment_type: str
    amount: float
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
