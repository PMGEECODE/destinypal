"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Bell, User, ChevronDown, LogOut, Settings, Shield, Check, X } from "lucide-react"
import { adminNotificationStore } from "../../lib/api/adminNotificationStore"
import {
  NOTIFICATION_TYPE_COLORS,
  type AdminNotification,
  type UnreadCountResponse,
} from "../../types/admin-notification"
import { useAuth } from "../AuthPublic/AuthContext"

interface AdminHeaderProps {
  adminEmail: string
  onLogout: () => void
  unreadMessageCount?: number
  onNotificationClick?: () => void
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return date.toLocaleDateString()
}

export function AdminHeader({ adminEmail, onLogout, unreadMessageCount = 0, onNotificationClick }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountResponse | null>(null)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()

  // Calculate total unread (notifications + messages)
  const totalUnread = (unreadCounts?.unread_count || 0) + unreadMessageCount

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch unread counts on mount
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const counts = await adminNotificationStore.getUnreadCount()
        setUnreadCounts(counts)
      } catch (err) {
        console.error("Failed to fetch unread counts:", err)
      }
    }
    fetchUnreadCounts()
  }, [])

  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const response = await adminNotificationStore.getNotifications({
        page: 1,
        page_size: 5,
        unread_only: false,
      })
      setNotifications(response.notifications)
      setUnreadCounts({
        unread_count: response.unread_count,
        new_registrations: 0,
        new_messages: 0,
        new_donations: 0,
        system_alerts: 0,
      })
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await adminNotificationStore.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      if (unreadCounts && unreadCounts.unread_count > 0) {
        setUnreadCounts({ ...unreadCounts, unread_count: unreadCounts.unread_count - 1 })
      }
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleViewAll = () => {
    setShowNotifications(false)
    onNotificationClick?.()
  }

  const handleLogout = async () => {
    try {
      await logout() // Clear cookies via API
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      onLogout() // Clear local app state
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-600">DestinyPal Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={totalUnread > 0 ? `${totalUnread} unread notifications` : "No unread notifications"}
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {totalUnread > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.is_read ? "bg-blue-50/50" : ""
                          }`}
                          onClick={handleViewAll}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                NOTIFICATION_TYPE_COLORS[notification.notification_type]
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${!notification.is_read ? "font-medium text-gray-900" : "text-gray-700"}`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1">{notification.message}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                  {formatRelativeTime(notification.created_at)}
                                </span>
                                {!notification.is_read && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleViewAll}
                    className="w-full text-center text-sm text-slate-700 hover:text-slate-900 font-medium py-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="bg-slate-100 p-2 rounded-full">
                <User className="w-5 h-5 text-slate-800" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">Administrator</p>
                <p className="text-xs text-gray-600 truncate max-w-[150px]">{adminEmail}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Signed in as</p>
                  <p className="text-xs text-gray-600 truncate">{adminEmail}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
