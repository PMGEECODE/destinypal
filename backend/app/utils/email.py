"""
Email utilities for sending verification and notification emails.
"""
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: Optional[str] = None,
    text_content: Optional[str] = None,
    body: Optional[str] = None,
    is_html: bool = False,
    reply_to: Optional[str] = None,
) -> bool:
    """
    Send an email.
    In production, integrate with an email service (SendGrid, SES, etc.)
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content (preferred parameter name)
        text_content: Plain text content
        body: Alternative to html_content/text_content (for backward compatibility)
        is_html: Whether body contains HTML (used with body param)
        reply_to: Reply-to email address
    """
    # Handle both parameter styles
    if body is not None:
        if is_html:
            html_content = body
        else:
            text_content = body
    
    if not settings.SMTP_HOST:
        logger.warning(f"Email not configured. Would send to {to_email}: {subject}")
        if reply_to:
            logger.info(f"Reply-to: {reply_to}")
        # Return True to indicate success even without SMTP configured (for development)
        return True
    
    # TODO: Implement actual email sending with SMTP
    logger.info(f"Sending email to {to_email}: {subject}")
    if reply_to:
        logger.info(f"Reply-to: {reply_to}")
    return True


async def send_verification_email(email: str, verification_code: str) -> bool:
    """Send email verification code."""
    subject = "Verify your email - DestinyPal"
    html_content = f"""
    <h1>Email Verification</h1>
    <p>Your verification code is: <strong>{verification_code}</strong></p>
    <p>This code expires in 10 minutes.</p>
    """
    return await send_email(email, subject, html_content)


async def send_password_reset_email(email: str, reset_token: str) -> bool:
    """Send password reset email."""
    reset_url = f"{settings.CORS_ORIGINS[0]}/reset-password?token={reset_token}"
    subject = "Reset your password - DestinyPal"
    html_content = f"""
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="{reset_url}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
    """
    return await send_email(email, subject, html_content)


async def send_2fa_code_email(email: str, code: str) -> bool:
    """Send 2FA verification code."""
    subject = "Your login verification code - DestinyPal"
    html_content = f"""
    <h1>Two-Factor Authentication</h1>
    <p>Your verification code is: <strong>{code}</strong></p>
    <p>This code expires in 5 minutes.</p>
    """
    return await send_email(email, subject, html_content)
