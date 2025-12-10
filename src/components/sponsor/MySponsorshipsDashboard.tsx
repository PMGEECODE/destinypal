"use client"

import { useEffect, useState } from "react"
import { Heart, DollarSign, Users, TrendingUp, Calendar, User, MapPin, AlertCircle } from "lucide-react"
import { api } from "../../lib/api"
import type { SponsorshipDetail } from "../../lib/api/types"
import { formatTruncatedName, getNameInitials, getFullPhotoUrl } from "../../lib/utils/formatName"

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

export function MySponsorshipsDashboard() {
  const [sponsorships, setSponsorships] = useState<SponsorshipDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalSponsored: 0,
    totalContributed: 0,
    activeStudents: 0,
  })

  useEffect(() => {
    fetchSponsorships()
  }, [])

  const fetchSponsorships = async () => {
    try {
      setLoading(true)
      setError(null)

      const sponsorshipsData = await api.getMySponsorships()

      setSponsorships(sponsorshipsData)

      const totalPaid = sponsorshipsData.reduce((sum, s) => sum + safeNumber(s.total_paid), 0)

      setStats({
        totalSponsored: sponsorshipsData.length,
        totalContributed: totalPaid,
        activeStudents: sponsorshipsData.filter((s) => s.status === "active").length,
      })
    } catch (err: any) {
      console.error("Error fetching sponsorships:", err)
      const errorMessage =
        typeof err === "object" && err !== null
          ? err.detail || err.message || "Failed to load sponsorships. Please try again."
          : String(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your sponsorships...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSponsorships}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (sponsorships.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center max-w-md">
          <Heart className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Sponsorships Yet</h2>
          <p className="text-gray-600">You haven't sponsored any students yet. Start making a difference today!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">My Sponsorships</h1>
        <p className="text-gray-600">Track your impact and sponsored students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3.5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Sponsored</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalSponsored}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3.5">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2.5 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Contributed</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalContributed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3.5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Sponsorships</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeStudents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Your Sponsored Students</h2>

        {sponsorships.map((sponsorship) => {
          const totalPaid = safeNumber(sponsorship.total_paid)
          const balance = safeNumber(sponsorship.balance_due)
          const progress = totalPaid + balance > 0 ? (totalPaid / (totalPaid + balance)) * 100 : 100

          const fullName = safeString(sponsorship.student?.full_name || sponsorship.student_name, "Unknown Student")
          const displayName = formatTruncatedName(fullName)
          const nameInitials = getNameInitials(fullName)
          const studentPhoto = getFullPhotoUrl(sponsorship.student?.photo_url || sponsorship.student_photo_url)
          const institutionName = safeString(
            sponsorship.student?.institution_name || sponsorship.institution?.name || sponsorship.institution_name,
            "Unknown Institution",
          )
          const gradeLevel = safeString(sponsorship.student?.grade_level || sponsorship.student?.education_level, "N/A")
          const location = sponsorship.student?.location || sponsorship.student?.county || null
          const paymentFrequency = safeString(sponsorship.payment_frequency, "one_time")
          const startDate = sponsorship.start_date || sponsorship.created_at
          const status = safeString(sponsorship.status, "active")

          return (
            <div key={sponsorship.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3.5">
                <div className="flex gap-3.5">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                      {studentPhoto ? (
                        <img
                          src={studentPhoto || "/placeholder.svg"}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      {/* Fallback with initials */}
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center ${studentPhoto ? "hidden" : ""}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-1">
                          <span className="text-white text-lg font-bold">{nameInitials}</span>
                        </div>
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-0.5" title={fullName}>
                          {displayName}
                        </h3>
                        <p className="text-gray-600 text-sm">{institutionName}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          status === "active"
                            ? "bg-green-100 text-green-700"
                            : status === "paused"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Grade Level</p>
                        <p className="font-medium text-gray-900 text-sm">{gradeLevel}</p>
                      </div>
                      {location && (
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Location</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <p className="font-medium text-gray-900 text-sm truncate">{location}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Frequency</p>
                        <p className="font-medium text-gray-900 text-sm capitalize">
                          {paymentFrequency.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <p className="font-medium text-gray-900 text-sm">
                            {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-900">Payment Progress</span>
                        <span className="text-sm font-semibold text-blue-600">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Paid: </span>
                          <span className="font-semibold text-green-600">${totalPaid.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Remaining: </span>
                          <span className="font-semibold text-red-600">${balance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {sponsorship.recent_payments && sponsorship.recent_payments.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Payments</h4>
                        <div className="space-y-1.5">
                          {sponsorship.recent_payments.slice(0, 3).map((payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between text-sm bg-white border border-gray-200 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  ${safeNumber(payment.amount).toLocaleString()}
                                </span>
                                <span className="text-gray-600">
                                  via {safeString(payment.payment_method, "unknown").replace("_", " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                    payment.payment_status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : payment.payment_status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {safeString(payment.payment_status, "pending")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
