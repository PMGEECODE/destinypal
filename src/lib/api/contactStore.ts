/**
 * Contact submissions API store for admin dashboard
 */
import { apiClient } from "./client"
import type {
  ContactSubmission,
  ContactSubmissionListResponse,
  ContactSubmissionUpdate,
  UnreadCountResponse,
} from "@/types/contact"

export interface GetMessagesParams {
  page?: number
  page_size?: number
  status?: string
  inquiry_type?: string
  search?: string
  unread_only?: boolean
}

export const contactStore = {
  /**
   * Get paginated list of contact submissions (admin only)
   */
  async getMessages(params: GetMessagesParams = {}): Promise<ContactSubmissionListResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
    }

    if (params.status && params.status !== "all") {
      queryParams.status = params.status
    }
    if (params.inquiry_type && params.inquiry_type !== "all") {
      queryParams.inquiry_type = params.inquiry_type
    }
    if (params.search) {
      queryParams.search = params.search
    }
    if (params.unread_only) {
      queryParams.unread_only = true
    }

    return apiClient.get<ContactSubmissionListResponse>("/admin/messages", queryParams)
  },

  /**
   * Get single message by ID (admin only)
   */
  async getMessage(id: string, markRead = true): Promise<ContactSubmission> {
    return apiClient.get<ContactSubmission>(`/admin/messages/${id}`, { mark_read: markRead })
  },

  /**
   * Update message status/response (admin only)
   */
  async updateMessage(id: string, data: ContactSubmissionUpdate): Promise<ContactSubmission> {
    return apiClient.patch<ContactSubmission>(`/admin/messages/${id}`, data)
  },

  /**
   * Mark message as read (admin only)
   */
  async markAsRead(id: string): Promise<ContactSubmission> {
    return apiClient.post<ContactSubmission>(`/admin/messages/${id}/mark-read`)
  },

  /**
   * Get unread message count (admin only)
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>("/admin/messages/unread-count")
  },
}
