// Institution management API endpoints

import { apiClient } from "./client"
import type {
  Institution,
  InstitutionProfile,
  InstitutionCreate,
  InstitutionUpdate,
  Student,
  PaginatedResponse,
  PaginationParams,
} from "./types"

export interface InstitutionFilters extends PaginationParams {
  is_verified?: boolean
  compliance_status?: string
  institution_type?: string
  country?: string
}

export const institutionStore = {
  // Get all institutions
  getInstitutions(params?: InstitutionFilters): Promise<PaginatedResponse<Institution>> {
    return apiClient.get<PaginatedResponse<Institution>>("/institutions", params)
  },

  // Get institution by ID
  getInstitutionById(institutionId: string): Promise<Institution> {
    return apiClient.get<Institution>(`/institutions/${institutionId}`)
  },

  // Get current institution profile (for logged-in institution user)
  getCurrentInstitution(): Promise<InstitutionProfile> {
    return apiClient.get<InstitutionProfile>("/institutions/me")
  },

  // Create institution profile
  createInstitution(data: InstitutionCreate): Promise<Institution> {
    return apiClient.post<Institution>("/institutions", data)
  },

  // Update institution
  updateInstitution(institutionId: string, data: InstitutionUpdate): Promise<Institution> {
    return apiClient.patch<Institution>(`/institutions/${institutionId}`, data)
  },

  // Update current institution
  updateCurrentInstitution(data: InstitutionUpdate): Promise<Institution> {
    return apiClient.patch<Institution>("/institutions/me", data)
  },

  // Delete institution
  deleteInstitution(institutionId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/institutions/${institutionId}`)
  },

  // Verify institution (admin only)
  verifyInstitution(institutionId: string): Promise<Institution> {
    return apiClient.post<Institution>(`/institutions/${institutionId}/verify`)
  },

  // Update compliance status (admin only)
  updateComplianceStatus(institutionId: string, status: string): Promise<Institution> {
    return apiClient.patch<Institution>(`/institutions/${institutionId}/compliance`, { compliance_status: status })
  },

  // Get institution students
  getInstitutionStudents(institutionId: string, params?: PaginationParams): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>(`/institutions/${institutionId}/students`, params)
  },

  // Get institution stats
  getInstitutionStats(institutionId: string): Promise<{
    total_students: number
    total_fees_collected: number
    total_fees_pending: number
    students_with_sponsors: number
  }> {
    return apiClient.get(`/institutions/${institutionId}/stats`)
  },

  // Upload institution logo
  uploadLogo(institutionId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.upload<{ url: string }>(`/institutions/${institutionId}/logo`, formData)
  },

  // Upload institution documents
  uploadDocument(institutionId: string, file: File, documentType: string): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("document_type", documentType)
    return apiClient.upload<{ url: string }>(`/institutions/${institutionId}/documents`, formData)
  },

  // Get institution documents
  getInstitutionDocuments(
    institutionId: string,
  ): Promise<{ id: string; type: string; url: string; created_at: string }[]> {
    return apiClient.get(`/institutions/${institutionId}/documents`)
  },

  // Aliases for backward compatibility
  getInstitution(institutionId: string): Promise<Institution> {
    return this.getInstitutionById(institutionId)
  },

  getMyInstitution(): Promise<InstitutionProfile> {
    return this.getCurrentInstitution()
  },
}
