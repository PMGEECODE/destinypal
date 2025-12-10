// Stats and dashboard API endpoints

import { apiClient, API_BASE_URL } from "./client"
import type { DashboardStats, InstitutionStats, SponsorStats, Donation } from "./types"

export interface AdminDashboardStats extends DashboardStats {
  recent_registrations: {
    institutions: number
    sponsors: number
    students: number
  }
  monthly_donations: {
    month: string
    amount: number
  }[]
}

export interface TimeRangeParams {
  start_date?: string
  end_date?: string
  period?: "day" | "week" | "month" | "year"
}

export const statsStore = {
  // Admin dashboard stats
  getAdminDashboardStats(): Promise<AdminDashboardStats> {
    return apiClient.get<AdminDashboardStats>("/stats/admin/dashboard")
  },

  // Institution stats
  getInstitutionDashboardStats(institutionId?: string): Promise<InstitutionStats> {
    const endpoint = institutionId ? `/stats/institution/${institutionId}` : "/stats/institution/me"
    return apiClient.get<InstitutionStats>(endpoint)
  },

  // Sponsor stats
  getSponsorDashboardStats(sponsorId?: string): Promise<SponsorStats> {
    const endpoint = sponsorId ? `/stats/sponsor/${sponsorId}` : "/stats/sponsor/me"
    return apiClient.get<SponsorStats>(endpoint)
  },

  // Platform overview stats (public)
  getPlatformStats(): Promise<{
    total_students_helped: number
    total_amount_raised: number
    total_institutions: number
    total_sponsors: number
  }> {
    return apiClient.get("/public/stats")
  },

  // Donation analytics
  getDonationAnalytics(params?: TimeRangeParams): Promise<{
    total_amount: number
    donation_count: number
    average_donation: number
    by_period: { period: string; amount: number; count: number }[]
    by_payment_method: { method: string; amount: number; count: number }[]
  }> {
    return apiClient.get("/stats/donations/analytics", params)
  },

  // Student funding analytics
  getStudentFundingAnalytics(): Promise<{
    fully_funded: number
    partially_funded: number
    unfunded: number
    total_needed: number
    total_raised: number
    funding_rate: number
  }> {
    return apiClient.get("/stats/students/funding")
  },

  // Recent activity
  getRecentActivity(limit?: number): Promise<{
    donations: Donation[]
    registrations: { type: string; name: string; created_at: string }[]
    sponsorships: { sponsor_name: string; student_name: string; amount: number; created_at: string }[]
  }> {
    return apiClient.get("/stats/activity/recent", { limit })
  },

  // Export reports
  exportReport(
    reportType: "donations" | "students" | "institutions" | "sponsors",
    format: "csv" | "xlsx" | "pdf",
    params?: TimeRangeParams,
  ): Promise<Blob> {
    const queryParams = new URLSearchParams({ format })
    if (params?.start_date) queryParams.append("start_date", params.start_date)
    if (params?.end_date) queryParams.append("end_date", params.end_date)

    return fetch(`${API_BASE_URL}/stats/export/${reportType}?${queryParams.toString()}`, {
      credentials: "include",
    }).then((res) => res.blob())
  },

  // Alias for backward compatibility
  getImpactStats(): Promise<{
    total_students_helped: number
    total_amount_raised: number
    total_institutions: number
    total_sponsors: number
  }> {
    return this.getPlatformStats()
  },
}
