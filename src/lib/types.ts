/**
 * Shared TypeScript types for DestinyPal
 * These types mirror the FastAPI Pydantic schemas
 */

// Re-export all types from the API client
export type {
  User,
  UserProfile,
  Student,
  Sponsor,
  Institution,
  Donation,
  Sponsorship,
  PaymentTransaction,
  MpesaPaymentResponse,
  AirtelPaymentResponse,
  CardPaymentResponse,
  PaymentStatusResponse,
  PaginatedResponse,
  CreateStudentData,
  CreateSponsorData,
  CreateInstitutionData,
  CreateDonationData,
  CreateSponsorshipData,
} from "./api"

// Additional shared types

export type UserRole = "admin" | "sponsor" | "student" | "institution" | "public"

export type VerificationStatus = "pending" | "in_review" | "approved" | "rejected"

export type StudentStatus = "active" | "inactive" | "graduated" | "suspended" | "pending"

export type EducationLevel = "primary" | "secondary" | "tertiary" | "vocational"

export type PaymentMethod = "mpesa" | "airtel" | "card" | "bank_transfer" | "paypal"

export type TransactionStatus =
  | "initiated"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"

export type DonationFrequency = "one_time" | "monthly" | "quarterly" | "annually"

export type InstitutionType = "primary_school" | "secondary_school" | "university" | "college" | "vocational" | "other"

// Declare User and PaymentTransaction types
type User = {
  id: string
  name: string
  role: UserRole
}

type PaymentTransaction = {
  id: string
  amount: number
  method: PaymentMethod
  status: TransactionStatus
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface PaymentState {
  transaction: PaymentTransaction | null
  isProcessing: boolean
  error: string | null
}
