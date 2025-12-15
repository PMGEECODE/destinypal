// Donation and Payment Types for DestinyPal

export type PaymentMethod =
  | "mpesa"
  | "airtel_money"
  | "card"
  | "bank_transfer"
  | "paypal";
export type DonationFrequency =
  | "one_time"
  | "monthly"
  | "quarterly"
  | "annually";
export type PaymentStep =
  | "details"
  | "payment"
  | "processing"
  | "completed"
  | "failed";
export type TransactionStatus =
  | "initiated"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export interface DonorInfo {
  name: string;
  email: string;
  phone?: string;
  is_anonymous: boolean;
}

export interface DonationFormData {
  amount: string;
  currency: string;
  frequency: DonationFrequency;
  payment_method: PaymentMethod | "";
  message: string;
  donor: DonorInfo;
}

export interface MobileMoneyPaymentData {
  phone_number: string;
}

export interface CardPaymentData {
  card_number: string;
  card_holder_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

export interface BankTransferDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  reference: string;
}

export interface PayPalPaymentData {
  email: string;
}

export interface PaymentTransaction {
  id: string;
  reference_id: string;
  payment_type: "donation" | "sponsorship";
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  phone_number?: string;
  card_last4?: string;
  card_brand?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
  failed_at?: string;
  failure_reason?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
  checkout_request_id?: string;
  merchant_request_id?: string;
  airtel_transaction_id?: string;
  transaction_ref?: string;
  authorization_code?: string;
  paypal_order_id?: string;
  approval_url?: string;
  card_last4?: string;
  card_brand?: string;
}

export interface DonationCreatePayload {
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  frequency: DonationFrequency;
  message?: string;
  is_anonymous: boolean;
  transaction_id?: string;
}

// Payment method display info
export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  processingTime: string;
  fees?: string;
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    description: "Pay with Safaricom M-Pesa",
    icon: "mpesa",
    available: true,
    processingTime: "Instant",
    fees: "No fees",
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    description: "Pay with Airtel Money",
    icon: "airtel",
    available: true,
    processingTime: "Instant",
    fees: "No fees",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: "card",
    available: true,
    processingTime: "Instant",
    fees: "2.9% + $0.30",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with PayPal account",
    icon: "paypal",
    available: true,
    processingTime: "Instant",
    fees: "2.9% + $0.30",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer",
    icon: "bank",
    available: true,
    processingTime: "1-3 business days",
    fees: "No fees",
  },
];

export const SUGGESTED_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export const DONATION_FREQUENCIES: {
  value: DonationFrequency;
  label: string;
}[] = [
  { value: "one_time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
];

// Bank transfer details for DestinyPal
export const BANK_TRANSFER_DETAILS: BankTransferDetails = {
  bank_name: "Equity Bank Kenya",
  account_name: "DestinyPal Foundation",
  account_number: "0123456789012",
  swift_code: "EABOROBIXXX",
  reference: "", // Will be generated per transaction
};
