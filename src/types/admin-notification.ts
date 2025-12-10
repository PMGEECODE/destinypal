/**
 * Types for admin notifications system.
 */

export enum NotificationType {
  NEW_REGISTRATION = "new_registration",
  NEW_SPONSOR = "new_sponsor",
  NEW_INSTITUTION = "new_institution",
  NEW_STUDENT = "new_student",
  NEW_CONTACT_MESSAGE = "new_contact_message",
  NEW_DONATION = "new_donation",
  SYSTEM_ALERT = "system_alert",
}

export interface AdminNotification {
  id: string
  notification_type: NotificationType
  title: string
  message: string
  related_user_id?: string
  related_entity_type?: string
  related_entity_id?: string
  metadata_json?: string
  metadata?: Record<string, unknown>
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface AdminNotificationListResponse {
  notifications: AdminNotification[]
  total: number
  unread_count: number
  page: number
  page_size: number
  total_pages: number
}

export interface UnreadCountResponse {
  unread_count: number
  new_registrations: number
  new_messages: number
  new_donations: number
  system_alerts: number
}

export interface AdminNotificationFilters {
  page?: number
  page_size?: number
  notification_type?: NotificationType
  unread_only?: boolean
}

// Display labels for notification types
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.NEW_REGISTRATION]: "New Registration",
  [NotificationType.NEW_SPONSOR]: "New Sponsor",
  [NotificationType.NEW_INSTITUTION]: "New Institution",
  [NotificationType.NEW_STUDENT]: "New Student",
  [NotificationType.NEW_CONTACT_MESSAGE]: "New Message",
  [NotificationType.NEW_DONATION]: "New Donation",
  [NotificationType.SYSTEM_ALERT]: "System Alert",
}

// Icon colors for notification types
export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  [NotificationType.NEW_REGISTRATION]: "bg-blue-100 text-blue-600",
  [NotificationType.NEW_SPONSOR]: "bg-green-100 text-green-600",
  [NotificationType.NEW_INSTITUTION]: "bg-purple-100 text-purple-600",
  [NotificationType.NEW_STUDENT]: "bg-orange-100 text-orange-600",
  [NotificationType.NEW_CONTACT_MESSAGE]: "bg-yellow-100 text-yellow-600",
  [NotificationType.NEW_DONATION]: "bg-emerald-100 text-emerald-600",
  [NotificationType.SYSTEM_ALERT]: "bg-red-100 text-red-600",
}
