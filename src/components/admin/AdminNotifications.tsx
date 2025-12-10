"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bell,
  User,
  Building2,
  GraduationCap,
  Heart,
  MessageSquare,
  AlertTriangle,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Filter,
  X,
} from "lucide-react"
import { adminNotificationStore } from "../../lib/api/adminNotificationStore"
import {
  NotificationType,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  type AdminNotification,
  type UnreadCountResponse,
} from "../../types/admin-notification"

interface AdminNotificationsProps {
  adminEmail: string
  onUnreadCountChange?: (count: number) => void
}

// Helper to get icon for notification type
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.NEW_SPONSOR:
      return <Heart className="w-5 h-5" />
    case NotificationType.NEW_INSTITUTION:
      return <Building2 className="w-5 h-5" />
    case NotificationType.NEW_STUDENT:
      return <GraduationCap className="w-5 h-5" />
    case NotificationType.NEW_CONTACT_MESSAGE:
      return <MessageSquare className="w-5 h-5" />
    case NotificationType.NEW_DONATION:
      return <Heart className="w-5 h-5" />
    case NotificationType.SYSTEM_ALERT:
      return <AlertTriangle className="w-5 h-5" />
    default:
      return <User className="w-5 h-5" />
  }
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function AdminNotifications({ adminEmail, onUnreadCountChange }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<NotificationType | "all">("all")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminNotificationStore.getNotifications({
        page,
        page_size: 20,
        notification_type: filterType !== "all" ? filterType : undefined,
        unread_only: unreadOnly,
      })
      setNotifications(response.notifications)
      setTotalPages(response.total_pages)

      // Also fetch unread counts
      const counts = await adminNotificationStore.getUnreadCount()
      setUnreadCounts(counts)
      onUnreadCountChange?.(counts.unread_count)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to load notifications. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }, [page, filterType, unreadOnly, onUnreadCountChange])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminNotificationStore.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
      )
      if (unreadCounts) {
        const newCount = Math.max(0, unreadCounts.unread_count - 1)
        setUnreadCounts({ ...unreadCounts, unread_count: newCount })
        onUnreadCountChange?.(newCount)
      }
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationStore.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })))
      if (unreadCounts) {
        setUnreadCounts({
          ...unreadCounts,
          unread_count: 0,
          new_registrations: 0,
          new_messages: 0,
          new_donations: 0,
          system_alerts: 0,
        })
        onUnreadCountChange?.(0)
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminNotificationStore.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setSelectedNotification(null)
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  // Render counts summary
  const renderCountsSummary = () => {
    if (!unreadCounts) return null

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{unreadCounts.new_registrations}</p>
              <p className="text-xs text-blue-600">New Registrations</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{unreadCounts.new_messages}</p>
              <p className="text-xs text-yellow-600">New Messages</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{unreadCounts.new_donations}</p>
              <p className="text-xs text-emerald-600">New Donations</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{unreadCounts.system_alerts}</p>
              <p className="text-xs text-red-600">System Alerts</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render notification detail modal
  const renderDetailModal = () => {
    if (!selectedNotification) return null

    const metadata = selectedNotification.metadata || {}

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${NOTIFICATION_TYPE_COLORS[selectedNotification.notification_type]}`}>
                  {getNotificationIcon(selectedNotification.notification_type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedNotification.title}</h3>
                  <p className="text-sm text-gray-500">
                    {NOTIFICATION_TYPE_LABELS[selectedNotification.notification_type]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
              <p className="text-gray-800">{selectedNotification.message}</p>
            </div>

            {Object.keys(metadata).length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Details</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-gray-800 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatRelativeTime(selectedNotification.created_at)}</span>
              <span className={selectedNotification.is_read ? "text-green-600" : "text-orange-600"}>
                {selectedNotification.is_read ? "Read" : "Unread"}
              </span>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex gap-3">
            {!selectedNotification.is_read && (
              <button
                onClick={() => {
                  handleMarkAsRead(selectedNotification.id)
                  setSelectedNotification({ ...selectedNotification, is_read: true })
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark as Read
              </button>
            )}
            <button
              onClick={() => handleDelete(selectedNotification.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Bell className="w-7 h-7 text-slate-700" />
            Notifications
            {unreadCounts && unreadCounts.unread_count > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
                {unreadCounts.unread_count} unread
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Monitor new registrations and system events</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {unreadCounts && unreadCounts.unread_count > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Counts Summary */}
      {renderCountsSummary()}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as NotificationType | "all")
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked)
                setPage(1)
              }}
              className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
            />
            <span className="text-sm text-gray-700">Unread only</span>
          </label>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !notifications.length && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {unreadOnly ? "No unread notifications at this time." : "You're all caught up!"}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  setSelectedNotification(notification)
                  if (!notification.is_read) {
                    handleMarkAsRead(notification.id)
                  }
                }}
                className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${NOTIFICATION_TYPE_COLORS[notification.notification_type]}`}>
                  {getNotificationIcon(notification.notification_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-medium ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                    </div>
                    {!notification.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></span>}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {NOTIFICATION_TYPE_LABELS[notification.notification_type]}
                    </span>
                    <span>{formatRelativeTime(notification.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  )
}
