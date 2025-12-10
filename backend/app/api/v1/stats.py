"""
Statistics API routes.
"""
from typing import Dict, Any
from fastapi import APIRouter
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.student import Student
from app.models.sponsor import Sponsor
from app.models.sponsorship import Sponsorship, SponsorshipStatus
from app.models.donation import OrganizationDonation
from app.models.institution import Institution
from app.core.deps import CurrentUser, DBSession

router = APIRouter()


@router.get("/impact")
async def get_impact_stats(
    db: DBSession,
    current_user: CurrentUser,
) -> Dict[str, Any]:
    """Get platform-wide impact statistics."""
    
    # Count total students
    students_result = await db.execute(select(func.count(Student.id)))
    total_students = students_result.scalar() or 0
    
    # Count sponsors
    sponsors_result = await db.execute(select(func.count(Sponsor.id)))
    total_sponsors = sponsors_result.scalar() or 0
    
    # Count active sponsorships
    active_sponsorships_result = await db.execute(
        select(func.count(Sponsorship.id)).where(Sponsorship.status == SponsorshipStatus.ACTIVE)
    )
    active_sponsorships = active_sponsorships_result.scalar() or 0
    
    # Calculate total funds raised (from sponsorships - sum of commitment amounts)
    funds_result = await db.execute(
        select(func.sum(Sponsorship.amount)).where(
            Sponsorship.status.in_([SponsorshipStatus.ACTIVE, SponsorshipStatus.COMPLETED])
        )
    )
    total_fund_raised = funds_result.scalar() or 0
    
    # Calculate total donations
    donations_result = await db.execute(
        select(func.sum(OrganizationDonation.amount))
    )
    total_donations = donations_result.scalar() or 0
    
    # Count unique locations (counties) served
    locations_result = await db.execute(
        select(func.count(func.distinct(Institution.county))).where(Institution.county.isnot(None))
    )
    locations_served = locations_result.scalar() or 0
    
    return {
        "total_students": total_students,
        "total_sponsors": total_sponsors,
        "total_fund_raised": float(total_fund_raised),
        "active_sponsorships": active_sponsorships,
        "total_donations": float(total_donations),
        "locations_served": locations_served,
    }


@router.get("/admin/dashboard")
async def get_admin_dashboard_stats(
    db: DBSession,
    current_user: CurrentUser,
) -> Dict[str, Any]:
    """Get admin dashboard statistics."""
    from app.models.user import User
    from app.models.payment import PaymentTransaction, TransactionStatus
    from datetime import datetime, timedelta
    
    # Users count
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar() or 0
    
    # Students
    students_result = await db.execute(select(func.count(Student.id)))
    total_students = students_result.scalar() or 0
    
    # Institutions
    institutions_result = await db.execute(select(func.count(Institution.id)))
    total_institutions = institutions_result.scalar() or 0
    
    # Sponsors
    sponsors_result = await db.execute(select(func.count(Sponsor.id)))
    total_sponsors = sponsors_result.scalar() or 0
    
    # Active sponsorships
    active_sponsorships_result = await db.execute(
        select(func.count(Sponsorship.id)).where(Sponsorship.status == SponsorshipStatus.ACTIVE)
    )
    active_sponsorships = active_sponsorships_result.scalar() or 0
    
    # Revenue
    revenue_result = await db.execute(
        select(func.sum(PaymentTransaction.amount))
        .where(PaymentTransaction.status == TransactionStatus.COMPLETED)
    )
    total_revenue = revenue_result.scalar() or 0
    
    # Donations
    donations_result = await db.execute(select(func.sum(OrganizationDonation.amount)))
    total_donations = donations_result.scalar() or 0
    
    # Payment statuses
    completed_payments_result = await db.execute(
        select(func.count(PaymentTransaction.id))
        .where(PaymentTransaction.status == TransactionStatus.COMPLETED)
    )
    completed_payments = completed_payments_result.scalar() or 0
    
    pending_payments_result = await db.execute(
        select(func.count(PaymentTransaction.id))
        .where(PaymentTransaction.status.in_([TransactionStatus.PENDING, TransactionStatus.PROCESSING]))
    )
    pending_payments = pending_payments_result.scalar() or 0
    
    failed_payments_result = await db.execute(
        select(func.count(PaymentTransaction.id))
        .where(PaymentTransaction.status == TransactionStatus.FAILED)
    )
    failed_payments = failed_payments_result.scalar() or 0
    
    # Students with/without sponsors
    sponsored_students = await db.execute(
        select(func.count(func.distinct(Sponsorship.student_id)))
        .where(Sponsorship.status == SponsorshipStatus.ACTIVE)
    )
    students_sponsored = sponsored_students.scalar() or 0
    students_unsponsored = total_students - students_sponsored
    
    # Average sponsorship amount
    avg_sponsorship_result = await db.execute(
        select(func.avg(Sponsorship.amount))
        .where(Sponsorship.status == SponsorshipStatus.ACTIVE)
    )
    avg_sponsorship_amount = avg_sponsorship_result.scalar() or 0
    
    # New students this month
    thirty_days_ago = datetime.now() - timedelta(days=30)
    new_students_result = await db.execute(
        select(func.count(Student.id)).where(Student.created_at >= thirty_days_ago)
    )
    new_students_this_month = new_students_result.scalar() or 0
    
    # New sponsors this month
    new_sponsors_result = await db.execute(
        select(func.count(Sponsor.id)).where(Sponsor.created_at >= thirty_days_ago)
    )
    new_sponsors_this_month = new_sponsors_result.scalar() or 0
    
    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_institutions": total_institutions,
        "total_sponsors": total_sponsors,
        "active_sponsorships": active_sponsorships,
        "total_revenue": float(total_revenue),
        "total_donations": float(total_donations),
        "completed_payments": completed_payments,
        "pending_payments": pending_payments,
        "failed_payments": failed_payments,
        "students_sponsored": students_sponsored,
        "students_unsponsored": students_unsponsored,
        "avg_sponsorship_amount": float(avg_sponsorship_amount),
        "new_students_this_month": new_students_this_month,
        "new_sponsors_this_month": new_sponsors_this_month,
    }


@router.get("/institution/dashboard")
async def get_institution_dashboard_stats(
    db: DBSession,
    current_user: CurrentUser,
) -> Dict[str, Any]:
    """Get institution dashboard statistics."""
    from app.models.student import StudentFeeBalance
    from datetime import datetime, timedelta
    
    # Get institution
    institution_result = await db.execute(
        select(Institution).where(Institution.user_id == current_user.id)
    )
    institution = institution_result.scalar_one_or_none()
    
    if not institution:
        return {
            "total_students": 0,
            "sponsored_students": 0,
            "unsponsored_students": 0,
            "total_fees_owed": 0.0,
            "total_fees_paid": 0.0,
            "total_fees_balance": 0.0,
            "active_sponsors": 0,
            "recent_registrations": 0,
        }
    
    # Count students
    students_result = await db.execute(
        select(func.count(Student.id)).where(Student.institution_id == institution.id)
    )
    total_students = students_result.scalar() or 0
    
    # Get student IDs
    student_ids_result = await db.execute(
        select(Student.id).where(Student.institution_id == institution.id)
    )
    student_ids = [row[0] for row in student_ids_result.all()]
    
    # Count sponsored students
    if student_ids:
        sponsored_result = await db.execute(
            select(func.count(func.distinct(Sponsorship.student_id)))
            .where(Sponsorship.student_id.in_(student_ids))
            .where(Sponsorship.status == SponsorshipStatus.ACTIVE)
        )
        sponsored_students = sponsored_result.scalar() or 0
        
        # Count active sponsors
        sponsors_result = await db.execute(
            select(func.count(func.distinct(Sponsorship.sponsor_id)))
            .where(Sponsorship.student_id.in_(student_ids))
            .where(Sponsorship.status == SponsorshipStatus.ACTIVE)
        )
        active_sponsors = sponsors_result.scalar() or 0
        
        # Fee balances
        fees_result = await db.execute(
            select(
                func.sum(StudentFeeBalance.total_fees),
                func.sum(StudentFeeBalance.amount_paid),
                func.sum(StudentFeeBalance.balance_due)
            )
            .where(StudentFeeBalance.student_id.in_(student_ids))
        )
        fees_data = fees_result.one()
        total_fees_owed = fees_data[0] or 0
        total_fees_paid = fees_data[1] or 0
        total_fees_balance = fees_data[2] or 0
    else:
        sponsored_students = 0
        active_sponsors = 0
        total_fees_owed = 0
        total_fees_paid = 0
        total_fees_balance = 0
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_result = await db.execute(
        select(func.count(Student.id))
        .where(Student.institution_id == institution.id)
        .where(Student.created_at >= thirty_days_ago)
    )
    recent_registrations = recent_result.scalar() or 0
    
    return {
        "total_students": total_students,
        "sponsored_students": sponsored_students,
        "unsponsored_students": total_students - sponsored_students,
        "total_fees_owed": float(total_fees_owed),
        "total_fees_paid": float(total_fees_paid),
        "total_fees_balance": float(total_fees_balance),
        "active_sponsors": active_sponsors,
        "recent_registrations": recent_registrations,
    }
