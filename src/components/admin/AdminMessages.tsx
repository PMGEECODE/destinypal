"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Mail,
  MailOpen,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  RefreshCw,
  X,
} from "lucide-react"
import { contactStore } from "../../lib/api/contactStore"
import type { ContactSubmission, ContactStatus, InquiryType } from "../../types/contact"
import { INQUIRY_TYPE_LABELS, CONTACT_STATUS_LABELS } from "../../types/contact"

interface AdminMessagesProps {
  adminEmail: string
  onUnreadCountChange?: (count: number) => void
}

const STATUS_COLORS: Record<ContactStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  sent: { bg: "bg-blue-100", text: "text-blue-700", icon: Send },
  failed: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  responded: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
}

const INQUIRY_COLORS: Record<InquiryType, string> = {
  general: "bg-slate-100 text-slate-700",
  sponsor: "bg-rose-100 text-rose-700",
  institution: "bg-indigo-100 text-indigo-700",
  student: "bg-cyan-100 text-cyan-700",
  sponsorship: "bg-rose-100 text-rose-700",
  partnership: "bg-violet-100 text-violet-700",
  support: "bg-amber-100 text-amber-700",
  media: "bg-fuchsia-100 text-fuchsia-700",
  other: "bg-gray-100 text-gray-700",
}

export function AdminMessages({ adminEmail, onUnreadCountChange }: AdminMessagesProps) {
  const [messages, setMessages] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnectionError, setIsConnectionError] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Detail modal
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null)
  const [responseNotes, setResponseNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsConnectionError(false)
    try {
      const response = await contactStore.getMessages({
        page,
        page_size: 15,
        status: statusFilter,
        inquiry_type: inquiryTypeFilter,
        search: searchQuery || undefined,
        unread_only: showUnreadOnly,
      })
      setMessages(response.items)
      setTotalPages(response.total_pages)
      setTotal(response.total)
      setUnreadCount(response.unread_count)
      onUnreadCountChange?.(response.unread_count)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load messages"
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("CORS")
      ) {
        setIsConnectionError(true)
        setError("Unable to connect to the server")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, inquiryTypeFilter, searchQuery, showUnreadOnly, onUnreadCountChange])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleViewMessage = async (message: ContactSubmission) => {
    setSelectedMessage(message)
    setResponseNotes(message.response_notes || "")

    // Mark as read if not already
    if (!message.is_read) {
      try {
        const updated = await contactStore.markAsRead(message.id)
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
        onUnreadCountChange?.(Math.max(0, unreadCount - 1))
      } catch (err) {
        console.error("Failed to mark as read:", err)
      }
    }
  }

  const handleUpdateStatus = async (status: ContactStatus) => {
    if (!selectedMessage) return
    setUpdating(true)
    try {
      const updated = await contactStore.updateMessage(selectedMessage.id, {
        status,
        response_notes: responseNotes || undefined,
      })
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      setSelectedMessage(updated)
    } catch (err) {
      console.error("Failed to update message:", err)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins}m ago`
    }
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    }
    if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-gray-600 mt-1">
            {total} total messages{unreadCount > 0 && ` • ${unreadCount} unread`}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? "bg-slate-100 border-slate-300" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Unread Only Toggle */}
          <button
            onClick={() => {
              setShowUnreadOnly(!showUnreadOnly)
              setPage(1)
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showUnreadOnly ? "bg-amber-100 border-amber-300 text-amber-700" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Mail className="w-4 h-4" />
            Unread Only
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="responded">Responded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Type:</label>
              <select
                value={inquiryTypeFilter}
                onChange={(e) => {
                  setInquiryTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="sponsor">Sponsor</option>
                <option value="institution">Institution</option>
                <option value="student">Student</option>
                <option value="support">Support</option>
                <option value="partnership">Partnership</option>
                <option value="media">Media</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle className={`w-12 h-12 mb-3 ${isConnectionError ? "text-amber-500" : "text-red-500"}`} />
            <p className={`text-lg font-medium ${isConnectionError ? "text-amber-700" : "text-red-600"}`}>{error}</p>
            {isConnectionError && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md text-sm text-amber-800">
                <p className="font-medium mb-2">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>
                    Ensure the backend server is running at{" "}
                    <code className="bg-amber-100 px-1 rounded">localhost:8000</code>
                  </li>
                  <li>
                    Check that <code className="bg-amber-100 px-1 rounded">CORS_ORIGINS</code> includes your frontend
                    URL in the backend .env file
                  </li>
                  <li>Restart the backend server after making changes</li>
                  <li>Verify you are logged in as an admin</li>
                </ul>
              </div>
            )}
            <button
              onClick={fetchMessages}
              className={`mt-4 px-4 py-2 rounded-lg ${
                isConnectionError
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Try Again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
            <p>No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => {
              const StatusIcon = STATUS_COLORS[message.status]?.icon || AlertCircle
              return (
                <button
                  key={message.id}
                  onClick={() => handleViewMessage(message)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    !message.is_read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Read indicator */}
                    <div className="pt-1">
                      {message.is_read ? (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${!message.is_read ? "text-gray-900" : "text-gray-700"}`}>
                          {message.name}
                        </span>
                        <span className="text-sm text-gray-500">&lt;{message.email}&gt;</span>
                      </div>
                      <p className={`text-sm mb-2 ${!message.is_read ? "font-medium text-gray-800" : "text-gray-600"}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.message.substring(0, 100)}
                        {message.message.length > 100 ? "..." : ""}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${INQUIRY_COLORS[message.inquiry_type]}`}>
                          {INQUIRY_TYPE_LABELS[message.inquiry_type]}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[message.status]?.bg} ${STATUS_COLORS[message.status]?.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {CONTACT_STATUS_LABELS[message.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {selectedMessage.is_read ? (
                  <MailOpen className="w-6 h-6 text-gray-400" />
                ) : (
                  <Mail className="w-6 h-6 text-blue-500" />
                )}
                <h2 className="text-lg font-semibold text-gray-800">Message Details</h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sender Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{selectedMessage.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selectedMessage.email}`} className="hover:text-slate-800 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${selectedMessage.phone}`} className="hover:text-slate-800 hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Meta Tags */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full ${INQUIRY_COLORS[selectedMessage.inquiry_type]}`}>
                  {INQUIRY_TYPE_LABELS[selectedMessage.inquiry_type]}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[selectedMessage.status]?.bg} ${STATUS_COLORS[selectedMessage.status]?.text}`}
                >
                  {(() => {
                    const StatusIcon = STATUS_COLORS[selectedMessage.status]?.icon || AlertCircle
                    return <StatusIcon className="w-3.5 h-3.5" />
                  })()}
                  {CONTACT_STATUS_LABELS[selectedMessage.status]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </span>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                <p className="text-gray-800 font-medium">{selectedMessage.subject}</p>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Response Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Admin Notes</h3>
                <textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Add internal notes about this message..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Responded At */}
              {selectedMessage.responded_at && (
                <div className="text-sm text-gray-500">
                  Responded on {new Date(selectedMessage.responded_at).toLocaleString()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mark as:</span>
                <button
                  onClick={() => handleUpdateStatus("pending")}
                  disabled={updating || selectedMessage.status === "pending"}
                  className="px-3 py-1.5 text-sm border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus("responded")}
                  disabled={updating || selectedMessage.status === "responded"}
                  className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  Responded
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedMessage.status)
                  }}
                  disabled={updating || responseNotes === (selectedMessage.response_notes || "")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
                >
                  {updating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
