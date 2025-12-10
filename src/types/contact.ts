/**
 * Contact form types - aligned with backend schemas
 */
import type { LucideIcon } from "lucide-react"

export const INQUIRY_TYPE_VALUES = [
  "general",
  "sponsor",
  "institution",
  "student",
  "sponsorship",
  "partnership",
  "support",
  "media",
  "other",
] as const
export type InquiryType = (typeof INQUIRY_TYPE_VALUES)[number]

export const CONTACT_STATUS_VALUES = ["pending", "sent", "failed", "responded"] as const
export type ContactStatus = (typeof CONTACT_STATUS_VALUES)[number]

export interface ContactFormData {
  name: string
  email: string
  phone: string
  inquiryType: InquiryType
  subject: string
  message: string
}

export interface ContactInfoItem {
  icon: LucideIcon
  title: string
  value: string
  description: string
}

export interface InquiryTypeOption {
  value: InquiryType
  label: string
  icon: LucideIcon
}

export interface ContactSubmissionPayload {
  name: string
  email: string
  phone: string | null
  inquiry_type: InquiryType
  subject: string
  message: string
  cf_turnstile_response: string
}

// Frontend payload (camelCase for form)
export interface ContactFormPayload extends ContactFormData {
  "cf-turnstile-response": string
}

export interface ContactAPIResponse {
  message: string
  success: boolean
  submission_id?: string | null
}

export interface ContactAPIError {
  message: string
  success: false
  error_code?: string
}

export function isValidInquiryType(value: string): value is InquiryType {
  return INQUIRY_TYPE_VALUES.includes(value as InquiryType)
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  inquiry_type: InquiryType
  subject: string
  message: string
  status: ContactStatus
  ip_address: string | null
  user_agent: string | null
  turnstile_verified: boolean
  created_at: string
  updated_at: string
  responded_at: string | null
  response_notes: string | null
  is_read: boolean
}

export interface ContactSubmissionListResponse {
  items: ContactSubmission[]
  total: number
  page: number
  page_size: number
  total_pages: number
  unread_count: number
}

export interface ContactSubmissionUpdate {
  status?: ContactStatus
  response_notes?: string
  is_read?: boolean
}

export interface UnreadCountResponse {
  unread_count: number
}

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  general: "General Inquiry",
  sponsor: "Sponsor Inquiry",
  institution: "Institution Inquiry",
  student: "Student Inquiry",
  sponsorship: "Sponsorship",
  partnership: "Partnership",
  support: "Support",
  media: "Media Inquiry",
  other: "Other",
}

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
  responded: "Responded",
}
