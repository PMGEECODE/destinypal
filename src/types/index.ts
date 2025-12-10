export interface Institution {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  created_at: string
  is_verified?: boolean
  compliance_status?: ComplianceStatus
  compliance_reason?: string
  compliance_updated_at?: string
  compliance_updated_by?: string
}

export interface Student {
  id: string
  institution_id: string
  full_name: string
  date_of_birth: string
  gender: string
  grade_level: string
  location: string | null
  photo_url: string | null
  background_story: string | null
  family_situation: string | null
  academic_performance: string | null
  need_level: number
  created_at: string
  updated_at: string
  is_verified?: boolean
  compliance_status?: ComplianceStatus
  compliance_reason?: string
  compliance_updated_at?: string
  compliance_updated_by?: string
  documents_verified?: boolean
  documents_verified_at?: string
  documents_verified_by?: string
}

export interface PaymentAccount {
  id: string
  student_id: string
  account_type: string
  account_name: string
  account_number: string
  bank_name: string
  swift_code: string | null
  additional_info: string | null
  created_at: string
}

export interface StudentWithInstitution extends Student {
  institution: Institution
}

export interface Sponsor {
  id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  created_at: string
  compliance_status?: ComplianceStatus
  compliance_reason?: string
  compliance_updated_at?: string
  compliance_updated_by?: string
}

export interface Sponsorship {
  id: string
  sponsor_id: string
  student_id: string
  commitment_type: "full" | "partial"
  amount: number
  status: "active" | "paused" | "completed"
  start_date: string
  end_date: string | null
  created_at: string
}

export interface Payment {
  id: string
  sponsorship_id: string | null
  sponsor_id: string
  student_id: string
  amount: number
  payment_method: string
  payment_type: "full" | "partial"
  payment_status: "pending" | "completed" | "failed"
  transaction_id: string | null
  payment_date: string
  created_at: string
}

export interface PaymentTransaction {
  id: string
  reference_id: string
  payment_type: "sponsorship" | "donation"
  related_id: string | null
  amount: number
  currency: string
  payment_method: "mpesa" | "airtel_money" | "card" | "bank_transfer" | "paypal"
  provider: string | null
  status: "initiated" | "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded"
  phone_number: string | null
  card_last4: string | null
  card_brand: string | null
  metadata: any
  initiated_at: string
  completed_at: string | null
  failed_at: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

export interface PaymentWebhook {
  id: string
  transaction_id: string
  provider: string
  webhook_data: any
  processed: boolean
  created_at: string
}

export interface StudentFeeBalance {
  id: string
  student_id: string
  total_fees: number
  amount_paid: number
  balance_due: number
  last_updated: string
}

export interface OrganizationDonation {
  id: string
  sponsor_id: string | null
  donor_name: string
  donor_email: string
  amount: number
  payment_method: string
  message: string | null
  transaction_id: string | null
  created_at: string
}

export interface StudentWithPaymentAccounts extends Student {
  payment_accounts: PaymentAccount[]
  institution: Institution
  fee_balance?: StudentFeeBalance
}

export interface StudentWithDetails extends StudentWithInstitution {
  fee_balance?: StudentFeeBalance
  is_sponsored: boolean
  sponsorship_status?: "unsponsored" | "partially_sponsored" | "fully_sponsored" | "no_fees_recorded"
  amount_raised?: number
  funding_goal?: number
  sponsorship_count?: number
}

export type ComplianceStatus = "active" | "blacklisted" | "whitelisted" | "suspended"

export type DocumentType =
  | "passport_photo"
  | "academic_results"
  | "authority_letter"
  | "approval_letter"
  | "identification"

export type DocumentStatus = "pending" | "approved" | "rejected"

export interface StudentDocument {
  id: string
  student_id: string
  document_type: DocumentType
  file_url: string
  file_name: string
  file_size?: number
  mime_type?: string
  status: DocumentStatus
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  uploaded_at: string
  created_at: string
  updated_at: string
}
