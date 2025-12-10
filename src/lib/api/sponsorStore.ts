// Sponsor management API endpoints
// All endpoints require authentication with credentials

import { apiClient } from "./client"
import type {
  SponsorProfile,
  SponsorCreate,
  SponsorUpdate,
  Sponsorship,
  SponsorshipCreate,
  SponsorshipWithDetails,
  StudentWithFeeBalance,
  Institution,
  UnsponsoredStudentsResponse,
  GroupedStudentsData,
  PaginatedResponse,
  PaginationParams,
  SponsorshipDetail,
} from "./types"

export interface SponsorFilters extends PaginationParams {
  is_verified?: boolean
  sponsor_type?: string
  country?: string
}

const safeNumber = (value: unknown, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

const safeString = (value: unknown, defaultValue = ""): string => {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "string") return value
  if (typeof value === "object") return defaultValue
  return String(value)
}

export const sponsorStore = {
  // Get all sponsors (admin only)
  getSponsors(params?: SponsorFilters): Promise<PaginatedResponse<SponsorProfile>> {
    return apiClient.get<PaginatedResponse<SponsorProfile>>("/sponsors", params)
  },

  // Get sponsor by ID
  getSponsorById(sponsorId: string): Promise<SponsorProfile> {
    return apiClient.get<SponsorProfile>(`/sponsors/${sponsorId}`)
  },

  // Get current sponsor profile
  getCurrentSponsor(): Promise<SponsorProfile> {
    return apiClient.get<SponsorProfile>("/sponsors/me")
  },

  // Create sponsor profile
  createSponsor(data: SponsorCreate): Promise<SponsorProfile> {
    return apiClient.post<SponsorProfile>("/sponsors", data)
  },

  // Update sponsor
  updateSponsor(sponsorId: string, data: SponsorUpdate): Promise<SponsorProfile> {
    return apiClient.patch<SponsorProfile>(`/sponsors/${sponsorId}`, data)
  },

  // Update current sponsor
  updateCurrentSponsor(data: SponsorUpdate): Promise<SponsorProfile> {
    return apiClient.patch<SponsorProfile>("/sponsors/me", data)
  },

  // Delete sponsor
  deleteSponsor(sponsorId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/sponsors/${sponsorId}`)
  },

  // Verify sponsor (admin only)
  verifySponsor(sponsorId: string): Promise<SponsorProfile> {
    return apiClient.post<SponsorProfile>(`/sponsors/${sponsorId}/verify`)
  },

  getInstitutionsWithStudents(): Promise<UnsponsoredStudentsResponse> {
    return apiClient
      .get<{
        grouped_students: { [key: string]: GroupedStudentsData }
        institutions: Institution[]
        stats: {
          total_students: number
          total_institutions: number
          total_needed: number
        }
      }>("/sponsors/institutions-with-students")
      .then((response) => {
        // Transform the response to match expected format
        const institutions = response.institutions || []
        const grouped = response.grouped_students || {}

        return {
          grouped_students: grouped,
          institutions,
          stats: response.stats || {
            total_students: 0,
            total_institutions: 0,
            total_needed: 0,
          },
        }
      })
  },

  getStudentForSponsorship(studentId: string): Promise<StudentWithFeeBalance> {
    return apiClient.get<StudentWithFeeBalance>(`/sponsors/students/${studentId}`)
  },

  getStudentFeeBalance(studentId: string): Promise<{
    total_fees: number
    amount_paid: number
    balance: number
    balance_due: number
    updated_at: string | null
  }> {
    return apiClient.get(`/sponsors/students/${studentId}/fee-balance`)
  },

  // Sponsorship management
  getSponsorships(params?: PaginationParams): Promise<PaginatedResponse<Sponsorship>> {
    return apiClient.get<PaginatedResponse<Sponsorship>>("/sponsorships", params)
  },

  getSponsorshipById(sponsorshipId: string): Promise<SponsorshipWithDetails> {
    return apiClient.get<SponsorshipWithDetails>(`/sponsorships/${sponsorshipId}`)
  },

  async getMySponsorships(): Promise<SponsorshipDetail[]> {
    const response = await apiClient.get<any[]>("/sponsors/me/sponsorships")

    // Transform backend response to match frontend expected format
    return (response || []).map((item: any) => {
      const amount = safeNumber(item.amount)

      return {
        id: safeString(item.id),
        sponsor_id: safeString(item.sponsor_id),
        student_id: safeString(item.student_id),
        commitment_type: safeString(item.commitment_type, "full"),
        amount: amount,
        status: safeString(item.status, "active") as "active" | "paused" | "completed",
        start_date: safeString(item.start_date, new Date().toISOString()),
        end_date: item.end_date || null,
        created_at: safeString(item.created_at, new Date().toISOString()),
        student_name: item.student_name || null,
        student_photo_url: item.student_photo_url || null,
        institution_name: item.institution_name || null,
        // Computed fields - default to amount as total_paid for now
        total_paid: amount,
        balance_due: 0,
        payment_frequency: "one_time",
        // Create a student object from flat fields for component compatibility
        student: {
          full_name: safeString(item.student_name, "Unknown Student"),
          photo_url: item.student_photo_url || null,
          institution_name: item.institution_name || null,
          grade_level: null,
          education_level: null,
          location: null,
          county: null,
        },
        institution: item.institution_name ? { name: item.institution_name } : null,
        recent_payments: [],
      }
    })
  },

  createSponsorship(data: SponsorshipCreate): Promise<Sponsorship> {
    return apiClient.post<Sponsorship>("/sponsors/sponsorships", data)
  },

  updateSponsorship(sponsorshipId: string, data: Partial<SponsorshipCreate>): Promise<Sponsorship> {
    return apiClient.patch<Sponsorship>(`/sponsorships/${sponsorshipId}`, data)
  },

  cancelSponsorship(sponsorshipId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/sponsorships/${sponsorshipId}/cancel`)
  },

  // Get sponsor stats
  getSponsorStats(): Promise<{
    total_donated: number
    students_sponsored: number
    active_sponsorships: number
  }> {
    return apiClient.get("/sponsors/me/stats")
  },

  // Get sponsored students
  getSponsoredStudents(params?: PaginationParams): Promise<PaginatedResponse<StudentWithFeeBalance>> {
    return apiClient.get<PaginatedResponse<StudentWithFeeBalance>>("/sponsors/me/students", params)
  },

  // Aliases for backward compatibility
  getSponsor(sponsorId: string): Promise<SponsorProfile> {
    return this.getSponsorById(sponsorId)
  },

  getStudentsInNeed(): Promise<UnsponsoredStudentsResponse> {
    return this.getInstitutionsWithStudents()
  },
}
