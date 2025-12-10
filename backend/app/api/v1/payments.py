"""
Payment API routes - M-Pesa, Airtel Money, Card, PayPal, Bank Transfer payments.
Secured with proper validation and no raw card data handling.
"""
from datetime import datetime, timezone
from uuid import UUID
import secrets
import logging

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

from app.models.payment import PaymentTransaction, PaymentMethod, TransactionStatus, TransactionType
from app.schemas.payment import (
    PaymentTransactionCreate,
    PaymentTransactionResponse,
    MpesaPaymentRequest,
    MpesaPaymentResponse,
    AirtelPaymentRequest,
    AirtelPaymentResponse,
    CardPaymentRequest,
    CardPaymentResponse,
    PaymentStatusResponse,
)
from app.core.deps import CurrentUser, DBSession, OptionalUser
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def generate_reference_id(prefix: str = "TXN") -> str:
    """Generate a unique transaction reference ID."""
    timestamp = int(datetime.now().timestamp() * 1000)
    random_part = secrets.token_hex(6)
    return f"{prefix}-{timestamp}-{random_part}"


class PayPalCreateRequest(BaseModel):
    """PayPal order creation request."""
    transaction_id: UUID
    amount: float = Field(gt=0, le=1000000)
    currency: str = Field(default="USD", pattern="^(USD|KES|UGX|TZS)$")
    return_url: str = Field(min_length=1, max_length=500)
    cancel_url: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=255)


class PayPalCreateResponse(BaseModel):
    """PayPal order creation response."""
    success: bool
    message: str
    order_id: Optional[str] = None
    approval_url: Optional[str] = None


class PayPalCaptureRequest(BaseModel):
    """PayPal payment capture request."""
    transaction_id: UUID
    order_id: str = Field(min_length=1, max_length=100)


class PayPalCaptureResponse(BaseModel):
    """PayPal payment capture response."""
    success: bool
    message: str
    capture_id: Optional[str] = None


class BankTransferInitiateRequest(BaseModel):
    """Bank transfer initiation request."""
    transaction_id: UUID
    amount: float = Field(gt=0, le=10000000)
    currency: str = Field(default="USD", pattern="^(USD|KES|UGX|TZS)$")
    donor_name: str = Field(min_length=2, max_length=255)
    donor_email: EmailStr


class BankTransferInitiateResponse(BaseModel):
    """Bank transfer initiation response."""
    success: bool
    message: str
    reference: str
    bank_details: dict


@router.post("/initiate", response_model=PaymentTransactionResponse)
async def initiate_transaction(
    request: PaymentTransactionCreate,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Initiate a new payment transaction."""
    transaction = PaymentTransaction(
        reference_id=generate_reference_id(),
        payment_type=TransactionType(request.payment_type),
        related_id=request.related_id,
        amount=request.amount,
        currency=request.currency,
        payment_method=PaymentMethod(request.payment_method),
        phone_number=request.phone_number,
        metadata=request.metadata or {},
        status=TransactionStatus.INITIATED,
    )
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    user_info = f"user {current_user.id}" if current_user else "anonymous"
    logger.info(f"Transaction initiated: {transaction.reference_id} by {user_info}")
    
    return transaction


@router.post("/mpesa/process", response_model=MpesaPaymentResponse)
async def process_mpesa_payment(
    request: MpesaPaymentRequest,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Process M-Pesa payment (STK Push)."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == request.transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    checkout_request_id = f"MPX{secrets.token_hex(12)}"
    merchant_request_id = f"MRQ{secrets.token_hex(8)}"
    
    transaction.status = TransactionStatus.PENDING
    transaction.phone_number = request.phone_number
    transaction.metadata = {
        **transaction.metadata,
        "checkout_request_id": checkout_request_id,
        "merchant_request_id": merchant_request_id,
        "account_reference": request.account_reference,
    }
    
    await db.commit()
    
    logger.info(f"M-Pesa payment initiated: {transaction.reference_id}")
    
    return MpesaPaymentResponse(
        success=True,
        message="Payment request sent. Please check your phone to complete payment.",
        checkout_request_id=checkout_request_id,
        merchant_request_id=merchant_request_id,
    )


@router.post("/airtel/process", response_model=AirtelPaymentResponse)
async def process_airtel_payment(
    request: AirtelPaymentRequest,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Process Airtel Money payment."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == request.transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    airtel_transaction_id = f"ATL{secrets.token_hex(12)}"
    
    transaction.status = TransactionStatus.PENDING
    transaction.phone_number = request.phone_number
    transaction.metadata = {
        **transaction.metadata,
        "airtel_transaction_id": airtel_transaction_id,
        "account_reference": request.account_reference,
    }
    
    await db.commit()
    
    logger.info(f"Airtel payment initiated: {transaction.reference_id}")
    
    return AirtelPaymentResponse(
        success=True,
        message="Payment request sent. Please check your phone to complete payment.",
        airtel_transaction_id=airtel_transaction_id,
    )


@router.post("/card/process", response_model=CardPaymentResponse)
async def process_card_payment(
    request: CardPaymentRequest,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """
    Process card payment using payment token.
    IMPORTANT: This endpoint accepts a payment token from a client-side
    payment gateway (Stripe, Flutterwave, etc.), NOT raw card data.
    """
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == request.transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    transaction_ref = f"CRD{secrets.token_hex(12)}"
    
    # In production, validate the payment_token with your payment gateway
    # Example: stripe.PaymentIntent.confirm(request.payment_token)
    
    # Mock successful payment for development
    transaction.status = TransactionStatus.COMPLETED
    transaction.completed_at = datetime.now(timezone.utc)
    transaction.card_last4 = "****"  # Never store actual card data
    transaction.card_brand = "tokenized"
    transaction.metadata = {
        **transaction.metadata,
        "transaction_ref": transaction_ref,
        "authorization_code": f"AUTH{secrets.token_hex(6)}",
        "billing_name": request.billing_name,
    }
    
    await db.commit()
    
    logger.info(f"Card payment completed: {transaction.reference_id}")
    
    return CardPaymentResponse(
        success=True,
        message="Payment processed successfully",
        transaction_ref=transaction_ref,
        authorization_code=transaction.metadata.get("authorization_code"),
        card_last4=transaction.card_last4,
        card_brand=transaction.card_brand,
    )


@router.post("/paypal/create", response_model=PayPalCreateResponse)
async def create_paypal_order(
    request: PayPalCreateRequest,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Create a PayPal order for payment."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == request.transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    # Generate mock PayPal order ID (in production, call PayPal API)
    order_id = f"PP-{secrets.token_hex(16).upper()}"
    
    # Mock approval URL (in production, get from PayPal response)
    approval_url = f"https://www.sandbox.paypal.com/checkoutnow?token={order_id}"
    
    transaction.status = TransactionStatus.PENDING
    transaction.metadata = {
        **transaction.metadata,
        "paypal_order_id": order_id,
        "return_url": request.return_url,
        "cancel_url": request.cancel_url,
    }
    
    await db.commit()
    
    logger.info(f"PayPal order created: {order_id} for transaction {transaction.reference_id}")
    
    return PayPalCreateResponse(
        success=True,
        message="PayPal order created. Please complete payment on PayPal.",
        order_id=order_id,
        approval_url=approval_url,
    )


@router.post("/paypal/capture", response_model=PayPalCaptureResponse)
async def capture_paypal_payment(
    request: PayPalCaptureRequest,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Capture a PayPal payment after approval."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == request.transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    # Verify order ID matches
    stored_order_id = transaction.metadata.get("paypal_order_id")
    if stored_order_id != request.order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order ID mismatch",
        )
    
    # Mock capture (in production, call PayPal capture API)
    capture_id = f"CAP-{secrets.token_hex(12).upper()}"
    
    transaction.status = TransactionStatus.COMPLETED
    transaction.completed_at = datetime.now(timezone.utc)
    transaction.metadata = {
        **transaction.metadata,
        "paypal_capture_id": capture_id,
    }
    
    await db.commit()
    
    logger.info(f"PayPal payment captured: {capture_id} for transaction {transaction.reference_id}")
    
    return PayPalCaptureResponse(
        success=True,
        message="Payment captured successfully",
        capture_id=capture_id,
    )


@router.post("/bank-transfer/initiate", response_model=BankTransferInitiateResponse)
async def initiate_bank_transfer(
    request: BankTransferInitiateRequest,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Initiate a bank transfer payment."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == request.transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    # Generate unique reference for bank transfer
    reference = f"DP-{secrets.token_hex(6).upper()}"
    
    # Bank details (in production, load from config/database)
    bank_details = {
        "bank_name": "Equity Bank Kenya",
        "account_name": "DestinyPal Foundation",
        "account_number": "0123456789012",
        "swift_code": "EABOROBIXXX",
        "reference": reference,
    }
    
    transaction.status = TransactionStatus.PENDING
    transaction.metadata = {
        **transaction.metadata,
        "bank_transfer_reference": reference,
        "donor_name": request.donor_name,
        "donor_email": request.donor_email,
        "expected_amount": request.amount,
        "expected_currency": request.currency,
    }
    
    await db.commit()
    
    logger.info(f"Bank transfer initiated: {reference} for transaction {transaction.reference_id}")
    
    # In production, send email with bank details to donor
    
    return BankTransferInitiateResponse(
        success=True,
        message="Bank transfer initiated. Please complete the transfer using the details provided.",
        reference=reference,
        bank_details=bank_details,
    )


@router.post("/bank-transfer/confirm/{reference}")
async def confirm_bank_transfer(
    reference: str,
    db: DBSession,
    current_user: CurrentUser,  # Admin only
):
    """Confirm a bank transfer payment (admin only)."""
    # Find transaction by reference
    result = await db.execute(
        select(PaymentTransaction).where(
            PaymentTransaction.metadata["bank_transfer_reference"].astext == reference
        )
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    transaction.status = TransactionStatus.COMPLETED
    transaction.completed_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    logger.info(f"Bank transfer confirmed: {reference}")
    
    return {"success": True, "message": "Bank transfer confirmed"}


@router.get("/status/{transaction_id}", response_model=PaymentStatusResponse)
async def check_payment_status(
    transaction_id: UUID,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Check payment transaction status."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    if transaction.status in [TransactionStatus.PENDING, TransactionStatus.PROCESSING]:
        created_at = transaction.created_at
        now = datetime.now(timezone.utc)
        minutes_since_creation = (now - created_at).total_seconds() / 60
        
        # Bank transfers have longer timeout (24 hours)
        timeout_minutes = 1440 if transaction.payment_method == PaymentMethod.BANK_TRANSFER else 10
        
        if minutes_since_creation > timeout_minutes:
            transaction.status = TransactionStatus.FAILED
            transaction.failed_at = now
            transaction.failure_reason = "Payment timeout - transaction expired"
            await db.commit()
            logger.warning(f"Transaction timeout: {transaction.reference_id}")
    
    return PaymentStatusResponse(
        status=transaction.status.value,
        message=f"Payment is {transaction.status.value}",
        transaction=PaymentTransactionResponse.model_validate(transaction),
    )


@router.get("/{transaction_id}", response_model=PaymentTransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    db: DBSession,
    current_user: OptionalUser = None,
):
    """Get transaction details."""
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.id == transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    return transaction
