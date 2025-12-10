// Student management API endpoints

import { apiClient } from "./client"
import type {
  Student,
  StudentCreate,
  StudentUpdate,
  StudentWithDetails,
  StudentFee,
  StudentFeeCreate,
  StudentFeeBalance,
  StudentFeeBalanceCreate,
  PaginatedResponse,
  PaginationParams,
} from "./types"

export interface StudentFilters extends PaginationParams {
  institution_id?: string
  is_active?: boolean
  is_verified?: boolean
  has_balance?: boolean
}

export interface StudentSponsorship {
  id: string
  sponsor_id: string
  sponsor_name: string | null
  sponsor_email: string | null
  commitment_type: string
  amount: number
  status: string
  start_date: string
  end_date: string | null
  created_at: string
}

export const studentStore = {
  // Get all students (with optional filters)
  getStudents(params?: StudentFilters): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>("/students", params)
  },

  // Get student by ID
  getStudentById(studentId: string): Promise<StudentWithDetails> {
    return apiClient.get<StudentWithDetails>(`/students/${studentId}`)
  },

  getStudentByUserId(userId: string): Promise<StudentWithDetails> {
    return apiClient.get<StudentWithDetails>(`/students/by-user/${userId}`)
  },

  // Create student (institution only)
  createStudent(data: StudentCreate): Promise<Student> {
    return apiClient.post<Student>("/students", data)
  },

  // Update student
  updateStudent(studentId: string, data: StudentUpdate): Promise<Student> {
    return apiClient.patch<Student>(`/students/${studentId}`, data)
  },

  // Delete student
  deleteStudent(studentId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/students/${studentId}`)
  },

  // Verify student (admin only)
  verifyStudent(studentId: string): Promise<Student> {
    return apiClient.post<Student>(`/students/${studentId}/verify`)
  },

  // Get students by institution
  getStudentsByInstitution(institutionId: string, params?: PaginationParams): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>(`/institutions/${institutionId}/students`, params)
  },

  // Upload student profile image
  uploadProfileImage(studentId: string, file: File): Promise<{ url: string; photo_url: string }> {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient
      .upload<{ url: string; photo_url: string }>(`/students/${studentId}/profile-image`, formData)
      .then((response) => {
        // Backend returns photo_url, normalize to also include url for compatibility
        return {
          url: response.photo_url || response.url,
          photo_url: response.photo_url || response.url,
        }
      })
  },

  // Student fees
  getStudentFees(studentId: string): Promise<StudentFee[]> {
    return apiClient.get<StudentFee[]>(`/students/${studentId}/fees`)
  },

  createStudentFee(studentId: string, data: StudentFeeCreate): Promise<StudentFee> {
    return apiClient.post<StudentFee>(`/students/${studentId}/fees`, data)
  },

  updateStudentFee(studentId: string, feeId: string, data: Partial<StudentFeeCreate>): Promise<StudentFee> {
    return apiClient.patch<StudentFee>(`/students/${studentId}/fees/${feeId}`, data)
  },

  deleteStudentFee(studentId: string, feeId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/students/${studentId}/fees/${feeId}`)
  },

  // Student fee balances
  getStudentFeeBalances(studentId: string): Promise<StudentFeeBalance[]> {
    return apiClient.get<StudentFeeBalance[]>(`/students/${studentId}/fee-balances`)
  },

  createStudentFeeBalance(studentId: string, data: StudentFeeBalanceCreate): Promise<StudentFeeBalance> {
    return apiClient.post<StudentFeeBalance>(`/students/${studentId}/fee-balances`, data)
  },

  updateStudentFeeBalance(
    studentId: string,
    balanceId: string,
    data: Partial<StudentFeeBalanceCreate>,
  ): Promise<StudentFeeBalance> {
    return apiClient.patch<StudentFeeBalance>(`/students/${studentId}/fee-balances/${balanceId}`, data)
  },

  deleteStudentFeeBalance(studentId: string, balanceId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/students/${studentId}/fee-balances/${balanceId}`)
  },

  // Bulk operations
  bulkCreateStudents(students: StudentCreate[]): Promise<Student[]> {
    return apiClient.post<Student[]>("/students/bulk", { students })
  },

  bulkUploadStudents(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.upload<{ imported: number; errors: string[] }>("/students/bulk-upload", formData)
  },

  // Aliases for backward compatibility
  getStudent(studentId: string): Promise<StudentWithDetails> {
    return this.getStudentById(studentId)
  },

  getStudentFeeBalance(studentId: string): Promise<StudentFeeBalance[]> {
    return this.getStudentFeeBalances(studentId)
  },

  // Get student payment accounts
  getStudentPaymentAccounts(studentId: string): Promise<{ id: string; type: string; account_number: string }[]> {
    return apiClient.get(`/students/${studentId}/payment-accounts`)
  },

  // Get unsponsored students (requires authentication)
  getUnsponsoredStudents(params?: PaginationParams): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>("/sponsors/institutions-with-students", params)
  },

  getStudentSponsorships(studentId: string): Promise<StudentSponsorship[]> {
    return apiClient.get<StudentSponsorship[]>(`/students/${studentId}/sponsorships`)
  },

  getStudentDocuments(studentId: string): Promise<any[]> {
    return apiClient.get(`/students/${studentId}/documents`)
  },

  uploadStudentDocumentFile(
    studentId: string,
    formData: FormData,
  ): Promise<{ id: string; file_url: string; is_encrypted: boolean }> {
    return apiClient.upload(`/students/${studentId}/documents/upload`, formData)
  },

  downloadStudentDocument(
    studentId: string,
    documentId: string,
  ): Promise<{ download_url: string; expires_at: string }> {
    return apiClient.get(`/students/${studentId}/documents/${documentId}/download`)
  },

  uploadStudentDocument(
    studentId: string,
    data: { document_type: string; file_url: string; file_name: string; file_size?: number; mime_type?: string },
  ): Promise<any> {
    const params = new URLSearchParams({
      document_type: data.document_type,
      file_url: data.file_url,
      file_name: data.file_name,
    })
    if (data.file_size) params.append("file_size", data.file_size.toString())
    if (data.mime_type) params.append("mime_type", data.mime_type)
    return apiClient.post(`/students/${studentId}/documents?${params.toString()}`, {})
  },

  deleteStudentDocument(studentId: string, documentId: string): Promise<{ message: string }> {
    return apiClient.delete(`/students/${studentId}/documents/${documentId}`)
  },
}
