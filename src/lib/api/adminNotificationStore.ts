/**
 * API store for admin notifications.
 */
import { apiClient } from "./client"
import type {
  AdminNotification,
  AdminNotificationListResponse,
  UnreadCountResponse,
  AdminNotificationFilters,
} from "../../types/admin-notification"

const BASE_URL = "/api/v1/admin/admin/notifications"

export const adminNotificationStore = {
  /**
   * Get paginated list of admin notifications.
   */
  async getNotifications(filters: AdminNotificationFilters = {}): Promise<AdminNotificationListResponse> {
    const params = new URLSearchParams()

    if (filters.page) params.append("page", filters.page.toString())
    if (filters.page_size) params.append("page_size", filters.page_size.toString())
    if (filters.notification_type) params.append("notification_type", filters.notification_type)
    if (filters.unread_only) params.append("unread_only", "true")

    const queryString = params.toString()
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL

    return apiClient.get<AdminNotificationListResponse>(url)
  },

  /**
   * Get unread notification counts by type.
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>(`${BASE_URL}/unread-count`)
  },

  /**
   * Get a single notification by ID.
   */
  async getNotificationById(id: string): Promise<AdminNotification> {
    return apiClient.get<AdminNotification>(`${BASE_URL}/${id}`)
  },

  /**
   * Mark a notification as read.
   */
  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`${BASE_URL}/${id}/read`, {})
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string; count: number }> {
    return apiClient.patch<{ success: boolean; message: string; count: number }>(`${BASE_URL}/mark-all-read`, {})
  },

  /**
   * Delete a notification.
   */
  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`${BASE_URL}/${id}`)
  },
}

export default adminNotificationStore
