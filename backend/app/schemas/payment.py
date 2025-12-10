"""
Payment schemas with security hardening.
"""
from datetime import datetime
from typing import Optional
from pydantic import Field, field_validator
from uuid import UUID
from app.schemas.base import StrictSchema
import re


class PaymentTransactionCreate(StrictSchema):
    """Payment transaction creation schema."""
    payment_type: str = Field(pattern="^(sponsorship|donation)$")
    related_id: Optional[UUID] = None
    amount: float = Field(gt=0, le=1000000)  # Max amount limit
    currency: str = Field(default="USD", pattern="^(USD|KES|UGX|TZS)$")
    payment_method: str = Field(pattern="^(mpesa|airtel_money|card|bank_transfer|paypal)$")
    phone_number: Optional[str] = Field(default=None, max_length=20)
    metadata: Optional[dict] = Field(default=None, max_length=10)  # Limit metadata keys
    
    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = re.sub(r"[\s\-]", "", v)
        if not re.match(r"^\+?\d{10,15}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned


class PaymentTransactionResponse(StrictSchema):
    """Payment transaction response schema."""
    id: UUID
    reference_id: str
    payment_type: str
    related_id: Optional[UUID] = None
    amount: float
    currency: str
    payment_method: str
    provider: Optional[str] = None
    status: str
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None
    initiated_at: datetime
    completed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True, "extra": "forbid"}


class MpesaPaymentRequest(StrictSchema):
    """M-Pesa payment request."""
    transaction_id: UUID
    phone_number: str = Field(min_length=10, max_length=15, pattern=r"^\+?\d{10,15}$")
    amount: float = Field(gt=0, le=150000)  # M-Pesa limit
    account_reference: str = Field(min_length=1, max_length=100)
    transaction_desc: str = Field(min_length=1, max_length=255)


class MpesaPaymentResponse(StrictSchema):
    """M-Pesa payment response."""
    success: bool
    message: str
    checkout_request_id: Optional[str] = None
    merchant_request_id: Optional[str] = None


class AirtelPaymentRequest(StrictSchema):
    """Airtel Money payment request."""
    transaction_id: UUID
    phone_number: str = Field(min_length=10, max_length=15, pattern=r"^\+?\d{10,15}$")
    amount: float = Field(gt=0, le=500000)  # Airtel limit
    account_reference: str = Field(min_length=1, max_length=100)
    transaction_desc: str = Field(min_length=1, max_length=255)


class AirtelPaymentResponse(StrictSchema):
    """Airtel Money payment response."""
    success: bool
    message: str
    airtel_transaction_id: Optional[str] = None


class CardPaymentRequest(StrictSchema):
    """
    Card payment request - uses tokenized card data.
    NEVER accept raw card numbers. Use a payment gateway token.
    """
    transaction_id: UUID
    payment_token: str = Field(min_length=10, max_length=500)  # Token from payment gateway
    amount: float = Field(gt=0, le=1000000)
    # Optional billing info (no card details)
    billing_name: Optional[str] = Field(default=None, max_length=255)
    billing_email: Optional[str] = Field(default=None, max_length=255)
    billing_country: Optional[str] = Field(default=None, max_length=100)


class CardPaymentResponse(StrictSchema):
    """Card payment response."""
    success: bool
    message: str
    transaction_ref: Optional[str] = None
    authorization_code: Optional[str] = None
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None


class PaymentStatusResponse(StrictSchema):
    """Payment status check response."""
    status: str
    message: str
    transaction: Optional[PaymentTransactionResponse] = None


class PaymentAccountResponse(StrictSchema):
    """Payment account response schema."""
    id: UUID
    student_id: UUID
    account_type: str
    account_name: str
    account_number: str
    bank_name: str
    swift_code: Optional[str] = None
    additional_info: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True, "extra": "forbid"}
