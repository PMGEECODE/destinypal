// types/auth.ts (or types/index.ts)

// ==============================
// Roles & General Types
// ==============================

export type UserRole = "sponsor" | "student" | "institution" | "admin"
export type UserType = UserRole

export type StudentType = "high_school" | "university"
export type HighSchoolLevel = "form_1" | "form_2" | "form_3" | "form_4"
export type UniversityYear = "year_1" | "year_2" | "year_3" | "year_4" | "year_5" | "year_6"

export type VerificationMethod = "email" | "sms"
export type TwoFactorMethod = "email" | "sms"

// ==============================
// Institution Types
// ==============================

export type InstitutionType =
  | "secondary_school"
  | "university"
  | "college"
  | "vocational"

// Human-readable labels (useful for dropdowns)
export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  secondary_school: "Secondary School",
  university: "University",
  college: "College",
  vocational: "Vocational / Technical Institution",
}

// ==============================
// Public / Shared Interfaces
// ==============================

export interface PublicInstitution {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  county?: string
  country: string
  institution_type: InstitutionType
  is_verified: boolean
  compliance_status?: string
}

export interface AuthUser {
  id: string
  email: string
  phone?: string
  role: UserRole
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
  two_factor_method?: TwoFactorMethod
  created_at: string
  updated_at: string
  user_metadata?: Record<string, any>
}

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  id_number?: string // National ID or Passport
  country: string
  county?: string // For Kenya
  state?: string // For other countries
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// ==============================
// Registration Data Interfaces
// ==============================

// Sponsor Registration
export interface SponsorRegistrationData {
  email: string
  password: string
  full_name: string
  id_number: string // ID or Passport number
  country: string
  county?: string
  state?: string
  phone?: string
}

// Institution Registration – matches your current form exactly
export interface InstitutionRegistrationData {
  email: string
  password: string

  institution_name: string
  institution_type: InstitutionType

  // Optional – not collected in current form
  registration_number?: string

  // Location
  country: string
  county?: string // Kenya
  state?: string // Other countries
  address: string
  city: string
  postal_code?: string

  // Contact Person
  contact_person_name: string
  contact_person_title?: string // Optional in form
  contact_person_email: string
  contact_person_phone: string

  // Optional extras
  website?: string
  student_capacity?: number
  year_established?: number
}

// High School Student Registration
export interface HighSchoolStudentRegistrationData {
  email: string
  password: string
  full_name: string
  date_of_birth: string
  gender: "male" | "female" | "other"
  form_level: HighSchoolLevel
  institution_id: string // Must select from existing institutions
  school_name?: string // Derived from institution
  school_county: string
  country: string
  county?: string
  admission_number?: string
  parent_guardian_name: string
  parent_guardian_phone: string
  parent_guardian_email?: string
  parent_guardian_relationship: "parent" | "guardian" | "other"
  phone?: string
}

// University Student Registration
export interface UniversityStudentRegistrationData {
  email: string
  password: string
  full_name: string
  date_of_birth: string
  gender: "male" | "female" | "other"
  institution_id: string // Must select from existing institutions
  university_name?: string // Derived from institution
  student_id: string
  course_name: string
  faculty_school: string
  year_of_study: UniversityYear
  expected_graduation_year: number
  country: string
  county?: string
  state?: string
  national_id?: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
}

// ==============================
// Auth State & Context
// ==============================

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  pendingVerification: {
    type: "email" | "sms" | "2fa"
    destination: string
  } | null
  error: string | null
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean }>
  register: (
    data:
      | SponsorRegistrationData
      | InstitutionRegistrationData
      | HighSchoolStudentRegistrationData
      | UniversityStudentRegistrationData,
    role: UserRole,
  ) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  verifySMS: (code: string) => Promise<void>
  verifyTwoFactor: (code: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  sendVerificationCode: (method: VerificationMethod, destination: string) => Promise<void>
  setupTwoFactor: (method: TwoFactorMethod) => Promise<{ backupCodes: string[] }>
  disableTwoFactor: (code: string) => Promise<void>
  loginWithOAuth: (provider: "google" | "github") => Promise<void>
  resendVerification: () => Promise<void>
  clearError: () => void
}

// ==============================
// Form & Misc Types
// ==============================

export interface ValidationError {
  field: string
  message: string
}

export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export interface Country {
  code: string
  name: string
  dialCode: string
  hasCounties?: boolean // Kenya
  hasStates?: boolean // e.g., US
}

export interface Region {
  code: string
  name: string
  countryCode: string
}