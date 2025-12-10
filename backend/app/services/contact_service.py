"""
Contact service for handling form submissions and email notifications.
"""
from html import escape
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime
import logging
import math

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_

from app.utils.email import send_email
from app.models.contact import ContactSubmission, InquiryType, ContactStatus
from app.schemas.contact import InquiryTypeEnum

logger = logging.getLogger(__name__)

# Map frontend inquiry types to readable labels
INQUIRY_LABELS: dict[str, str] = {
    "general": "General Inquiry",
    "sponsor": "Sponsorship",
    "institution": "Partnership",
    "student": "Student Support",
}


class ContactService:
    """Service for handling contact form submissions."""
    
    def __init__(self, db: Optional[AsyncSession] = None):
        """
        Initialize contact service.
        
        Args:
            db: Optional database session for storing submissions
        """
        self.db = db
    
    async def create_submission(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        phone: Optional[str] = None,
        inquiry_type: str = "general",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        turnstile_verified: bool = False,
    ) -> Optional[ContactSubmission]:
        """
        Store a contact submission in the database.
        
        Args:
            name: Sender's full name
            email: Sender's email address
            subject: Message subject
            message: Message content
            phone: Optional phone number
            inquiry_type: Type of inquiry
            ip_address: Client IP address
            user_agent: Client user agent
            turnstile_verified: Whether Turnstile verification passed
        
        Returns:
            ContactSubmission if database session available, None otherwise
        """
        if not self.db:
            logger.warning("No database session available, skipping submission storage")
            return None
        
        # Convert string inquiry type to enum
        try:
            inquiry_enum = InquiryType(inquiry_type.lower())
        except ValueError:
            inquiry_enum = InquiryType.GENERAL
        
        submission = ContactSubmission(
            name=name,
            email=email,
            phone=phone,
            inquiry_type=inquiry_enum,
            subject=subject,
            message=message,
            status=ContactStatus.PENDING,
            ip_address=ip_address,
            user_agent=user_agent,
            turnstile_verified=turnstile_verified,
            is_read=False,
        )
        
        self.db.add(submission)
        await self.db.commit()
        await self.db.refresh(submission)
        
        logger.info(f"Contact submission stored with ID: {submission.id}")
        return submission
    
    async def update_submission_status(
        self,
        submission_id: UUID,
        status: ContactStatus,
    ) -> Optional[ContactSubmission]:
        """Update the status of a contact submission."""
        if not self.db:
            return None
        
        submission = await self.db.get(ContactSubmission, submission_id)
        if submission:
            submission.status = status
            await self.db.commit()
            await self.db.refresh(submission)
        
        return submission
    
    async def get_submissions(
        self,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        inquiry_type_filter: Optional[str] = None,
        search: Optional[str] = None,
        unread_only: bool = False,
    ) -> Tuple[List[ContactSubmission], int, int]:
        """
        Get paginated list of contact submissions.
        
        Returns:
            Tuple of (submissions, total_count, unread_count)
        """
        if not self.db:
            return [], 0, 0
        
        # Build base query
        query = select(ContactSubmission)
        count_query = select(func.count(ContactSubmission.id))
        
        # Apply filters
        filters = []
        if status_filter and status_filter != "all":
            try:
                status_enum = ContactStatus(status_filter.lower())
                filters.append(ContactSubmission.status == status_enum)
            except ValueError:
                pass
        
        if inquiry_type_filter and inquiry_type_filter != "all":
            try:
                inquiry_enum = InquiryType(inquiry_type_filter.lower())
                filters.append(ContactSubmission.inquiry_type == inquiry_enum)
            except ValueError:
                pass
        
        if search:
            search_filter = or_(
                ContactSubmission.name.ilike(f"%{search}%"),
                ContactSubmission.email.ilike(f"%{search}%"),
                ContactSubmission.subject.ilike(f"%{search}%"),
                ContactSubmission.message.ilike(f"%{search}%"),
            )
            filters.append(search_filter)
        
        if unread_only:
            filters.append(ContactSubmission.is_read == False)
        
        if filters:
            for f in filters:
                query = query.where(f)
                count_query = count_query.where(f)
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Get unread count (without status filter)
        unread_query = select(func.count(ContactSubmission.id)).where(
            ContactSubmission.is_read == False
        )
        unread_result = await self.db.execute(unread_query)
        unread_count = unread_result.scalar() or 0
        
        # Apply pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(desc(ContactSubmission.created_at)).offset(offset).limit(page_size)
        
        result = await self.db.execute(query)
        submissions = list(result.scalars().all())
        
        return submissions, total, unread_count
    
    async def get_submission_by_id(self, submission_id: UUID) -> Optional[ContactSubmission]:
        """Get a single submission by ID."""
        if not self.db:
            return None
        return await self.db.get(ContactSubmission, submission_id)
    
    async def update_submission(
        self,
        submission_id: UUID,
        status: Optional[ContactStatus] = None,
        response_notes: Optional[str] = None,
        is_read: Optional[bool] = None,
    ) -> Optional[ContactSubmission]:
        """Update a contact submission with admin response."""
        if not self.db:
            return None
        
        submission = await self.db.get(ContactSubmission, submission_id)
        if not submission:
            return None
        
        if status is not None:
            submission.status = status
            if status == ContactStatus.RESPONDED:
                submission.responded_at = datetime.utcnow()
        
        if response_notes is not None:
            submission.response_notes = response_notes
        
        if is_read is not None:
            submission.is_read = is_read
        
        await self.db.commit()
        await self.db.refresh(submission)
        
        return submission
    
    async def mark_as_read(self, submission_id: UUID) -> Optional[ContactSubmission]:
        """Mark a submission as read."""
        return await self.update_submission(submission_id, is_read=True)
    
    async def get_unread_count(self) -> int:
        """Get count of unread submissions."""
        if not self.db:
            return 0
        
        query = select(func.count(ContactSubmission.id)).where(
            ContactSubmission.is_read == False
        )
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def send_contact_message(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        phone: Optional[str] = None,
        inquiry_type: str = "general",
        submission_id: Optional[UUID] = None,
    ) -> dict:
        """
        Send contact form message via email.
        
        Args:
            name: Sender's full name
            email: Sender's email address
            subject: Message subject
            message: Message content
            phone: Optional phone number
            inquiry_type: Type of inquiry (general, sponsor, institution, student)
            submission_id: Optional ID of stored submission to update status
        
        Returns:
            dict with status information
        """
        # Escape HTML to prevent XSS
        safe_name = escape(name)
        safe_email = escape(email)
        safe_subject = escape(subject)
        safe_message = escape(message)
        safe_phone = escape(phone) if phone else "Not provided"
        safe_inquiry_type = escape(inquiry_type) if inquiry_type else "general"
        
        readable_inquiry = INQUIRY_LABELS.get(safe_inquiry_type.lower(), safe_inquiry_type.title())

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #334155, #1e293b); color: #facc15; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }}
                .field {{ margin-bottom: 16px; }}
                .label {{ font-weight: bold; color: #475569; font-size: 12px; text-transform: uppercase; }}
                .value {{ margin-top: 4px; color: #1e293b; }}
                .message-box {{ background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; }}
                .footer {{ margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">New Contact Form Submission</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">From</div>
                        <div class="value">{safe_name} ({safe_email})</div>
                    </div>
                    <div class="field">
                        <div class="label">Phone</div>
                        <div class="value">{safe_phone}</div>
                    </div>
                    <div class="field">
                        <div class="label">Inquiry Type</div>
                        <div class="value">{readable_inquiry}</div>
                    </div>
                    <div class="field">
                        <div class="label">Subject</div>
                        <div class="value">{safe_subject}</div>
                    </div>
                    <div class="field">
                        <div class="label">Message</div>
                        <div class="message-box">{safe_message}</div>
                    </div>
                    <div class="footer">
                        Sent via DestinyPal.org contact form
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            await send_email(
                to_email="support@destinypal.org",
                subject=f"[DestinyPal Contact] {safe_subject}",
                body=html_body,
                is_html=True,
                reply_to=email,
            )
            logger.info(f"Contact email sent successfully from {email}")
            
            # Update submission status if ID provided
            if submission_id and self.db:
                await self.update_submission_status(submission_id, ContactStatus.SENT)
            
            return {"status": "sent", "submission_id": str(submission_id) if submission_id else None}
        except Exception as e:
            logger.error(f"Failed to send contact email: {e}")
            
            # Mark submission as failed if ID provided
            if submission_id and self.db:
                await self.update_submission_status(submission_id, ContactStatus.FAILED)
            
            raise
