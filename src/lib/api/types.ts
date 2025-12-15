// All API type definitions

// User types
export type UserRole = "admin" | "sponsor" | "institution";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  profile?: InstitutionProfile | SponsorProfile | null;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// Institution types
export interface InstitutionProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  region?: string;
  country?: string;
  institution_type?: string;
  registration_number?: string;
  website?: string;
  description?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  is_verified: boolean;
  compliance_status?: string;
  created_at: string;
  updated_at?: string;
}

export interface InstitutionCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  region?: string;
  country?: string;
  institution_type?: string;
  registration_number?: string;
  website?: string;
  description?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
}

export interface InstitutionUpdate extends Partial<InstitutionCreate> {}

export interface Institution {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  region?: string;
  country?: string;
  institution_type?: string;
  registration_number?: string;
  website?: string;
  description?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  is_verified: boolean;
  compliance_status?: string;
  created_at: string;
  updated_at?: string;
  student_count?: number;
  total_students?: number;
  total_balance_needed?: number;
}

// Sponsor types
export interface SponsorProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  compliance_status: string;
  created_at: string;
  updated_at?: string;
  // Legacy fields for backwards compatibility with any existing code
  first_name?: string;
  last_name?: string;
  company_name?: string;
  address?: string;
  city?: string;
  country?: string;
  sponsor_type?: string;
  is_anonymous?: boolean;
  is_verified?: boolean;
}

export interface SponsorCreate {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  sponsor_type?: string;
  is_anonymous?: boolean;
}

export interface SponsorUpdate extends Partial<SponsorCreate> {}

// Student types
export interface Student {
  id: string;
  institution_id: string;
  user_id?: string;
  full_name: string;
  first_name?: string; // Keep for backwards compatibility
  last_name?: string; // Keep for backwards compatibility
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  grade_level?: string;
  location?: string;
  photo_url?: string;
  background_story?: string;
  family_situation?: string;
  academic_performance?: string;
  need_level?: number;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  admission_number?: string;
  course?: string;
  year_of_study?: number;
  expected_graduation?: string;
  bio?: string;
  profile_image_url?: string;
  is_active: boolean;
  is_verified: boolean;
  compliance_status?: string;
  documents_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StudentCreate {
  full_name: string;
  date_of_birth: string;
  gender: string;
  grade_level: string;
  institution_id?: string;
  location?: string;
  photo_url?: string;
  background_story?: string;
  family_situation?: string;
  academic_performance?: string;
  need_level?: number;
  // Keep legacy fields for backwards compatibility
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  admission_number?: string;
  course?: string;
  year_of_study?: number;
  expected_graduation?: string;
  bio?: string;
  profile_image_url?: string;
}

export interface StudentUpdate {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  grade_level?: string;
  location?: string;
  photo_url?: string;
  background_story?: string;
  family_situation?: string;
  academic_performance?: string;
  need_level?: number;
  is_verified?: boolean;
  compliance_status?: string;
  compliance_reason?: string;
  // Keep legacy fields
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  admission_number?: string;
  course?: string;
  year_of_study?: number;
  expected_graduation?: string;
  bio?: string;
  profile_image_url?: string;
}

export interface StudentWithDetails extends Student {
  institution?: Institution;
  fee_balance?: number;
  total_fees?: number;
  amount_paid?: number;
  funding_goal?: number;
  amount_raised?: number;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
  financial_support_amount?: number;
  financial_support_source?: string;
  sponsorship_status?:
    | "unsponsored"
    | "partially_sponsored"
    | "fully_sponsored"
    | "no_fees_recorded";
}

export interface StudentWithFeeBalance {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  grade_level?: string;
  location?: string;
  photo_url?: string;
  background_story?: string;
  family_situation?: string;
  academic_performance?: string;
  need_level?: number;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  admission_number?: string;
  course?: string;
  year_of_study?: number;
  expected_graduation?: string;
  bio?: string;
  profile_image_url?: string;
  institution_id: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  fee_balance: number;
  total_fees: number;
  amount_paid: number;
  funding_goal: number;
  amount_raised: number;
  sponsorship_status:
    | "unsponsored"
    | "partially_sponsored"
    | "fully_sponsored"
    | "no_fees_recorded";
}

// Fee types
export interface StudentFee {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  due_date?: string;
  academic_year?: string;
  semester?: string;
  description?: string;
  is_paid: boolean;
  created_at: string;
}

export interface StudentFeeCreate {
  fee_type: string;
  amount: number;
  due_date?: string;
  academic_year?: string;
  semester?: string;
  description?: string;
}

export interface StudentFeeBalance {
  id: string;
  student_id: string;
  academic_year?: string;
  term1_fees: number;
  term1_paid: number;
  term2_fees: number;
  term2_paid: number;
  term3_fees: number;
  term3_paid: number;
  total_fees: number;
  amount_paid: number;
  balance: number;
  balance_due: number;
  last_payment_date?: string;
  last_updated?: string;
  created_at: string;
  updated_at?: string;
}

export interface StudentFeeBalanceCreate {
  academic_year: string;
  semester: string;
  total_fees: number;
  amount_paid?: number;
  balance_due?: number;
}

// Sponsorship types
export interface Sponsorship {
  id: string;
  sponsor_id: string;
  student_id: string;
  amount: number;
  currency: string;
  status: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SponsorshipCreate {
  student_id: string;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface SponsorshipWithDetails extends Sponsorship {
  student?: StudentWithDetails;
  sponsor?: SponsorProfile;
}

export interface SponsorshipDetail {
  id: string;
  sponsor_id: string;
  student_id: string;
  commitment_type: string;
  amount: number;
  status: "active" | "paused" | "completed";
  start_date: string;
  end_date: string | null;
  created_at: string;
  // Backend provides these flat fields, not nested student object
  student_name: string | null;
  student_photo_url: string | null;
  institution_name: string | null;
  // Computed/added fields for display
  total_paid: number;
  balance_due: number;
  payment_frequency: string;
  student: {
    full_name: string;
    photo_url: string | null;
    institution_name: string | null;
    grade_level: string | null;
    education_level: string | null;
    location: string | null;
    county: string | null;
  };
  institution?: {
    name: string;
  } | null;
  recent_payments?: Array<{
    id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    payment_status: string;
  }>;
}

// Donation/Payment types
export interface Donation {
  id: string;
  sponsor_id: string;
  student_id?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
}

export interface DonationCreate {
  student_id?: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

// Grouped students response for sponsors
export interface GroupedStudentsData {
  institution: Institution;
  students: StudentWithFeeBalance[];
  unsponsored_count: number;
  partially_sponsored_count: number;
  fully_sponsored_count: number;
}

export interface GroupedUnsponsoredStudents {
  [institutionId: string]: GroupedStudentsData;
}

export interface UnsponsoredStudentsResponse {
  grouped_students: GroupedUnsponsoredStudents;
  institutions: Institution[];
  stats: {
    total_students: number;
    total_institutions: number;
    total_needed: number;
  };
}

// Stats types
export interface DashboardStats {
  total_students: number;
  total_sponsors: number;
  total_institutions: number;
  total_donations: number;
  total_amount_raised: number;
  students_fully_funded: number;
  pending_verifications: number;
}

export interface InstitutionStats {
  total_students: number;
  total_fees_collected: number;
  total_fees_pending: number;
  students_with_sponsors: number;
  recent_donations: Donation[];
}

export interface SponsorStats {
  total_donated: number;
  students_sponsored: number;
  active_sponsorships: number;
  recent_donations: Donation[];
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
