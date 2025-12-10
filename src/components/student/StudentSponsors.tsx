"use client"

import { useEffect, useState } from "react"
import { Heart, DollarSign, Calendar, Mail, User, Loader2, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import { studentStore, type StudentSponsorship } from "../../lib/api"

interface StudentSponsorsProps {
  studentId: string
}

interface SponsorshipStats {
  totalSponsors: number
  totalReceived: number
  activeSponsorships: number
}

export function StudentSponsors({ studentId }: StudentSponsorsProps) {
  const [sponsorships, setSponsorships] = useState<StudentSponsorship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<SponsorshipStats>({
    totalSponsors: 0,
    totalReceived: 0,
    activeSponsorships: 0,
  })

  useEffect(() => {
    fetchSponsors()
  }, [studentId])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      setError(null)

      const sponsorshipsData = await studentStore.getStudentSponsorships(studentId)
      setSponsorships(sponsorshipsData)

      const totalAmount = sponsorshipsData.reduce((sum, s) => sum + (s.amount || 0), 0)

      setStats({
        totalSponsors: sponsorshipsData.length,
        totalReceived: totalAmount,
        activeSponsorships: sponsorshipsData.filter((s) => s.status === "active").length,
      })
    } catch (err) {
      console.error("Error fetching sponsors:", err)
      setError("Failed to load sponsor data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getSponsorDisplayName = (sponsorship: StudentSponsorship) => {
    if (sponsorship.sponsor_name) return sponsorship.sponsor_name
    return "Anonymous Sponsor"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your sponsors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchSponsors}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Sponsors</h1>
          <p className="text-lg text-gray-600">People who are supporting your education</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sponsors</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalSponsors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Committed</p>
                <p className="text-3xl font-bold text-gray-800">${stats.totalReceived.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Sponsorships</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeSponsorships}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorships List */}
        {sponsorships.length > 0 ? (
          <div className="space-y-6">
            {sponsorships.map((sponsorship) => (
              <div key={sponsorship.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{getSponsorDisplayName(sponsorship)}</h3>
                        <p className="text-green-100 text-sm">
                          {sponsorship.commitment_type === "full" ? "Full Sponsorship" : "Partial Sponsorship"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        sponsorship.status === "active"
                          ? "bg-white text-green-700"
                          : sponsorship.status === "paused"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sponsorship.sponsor_email && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Mail className="w-4 h-4" />
                          <p className="text-xs text-gray-500">Email</p>
                        </div>
                        <p className="font-medium text-gray-800 truncate">{sponsorship.sponsor_email}</p>
                      </div>
                    )}

                    {sponsorship.start_date && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <p className="text-xs text-gray-500">Start Date</p>
                        </div>
                        <p className="font-medium text-gray-800">
                          {new Date(sponsorship.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {sponsorship.end_date && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <p className="text-xs text-gray-500">End Date</p>
                        </div>
                        <p className="font-medium text-gray-800">
                          {new Date(sponsorship.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Commitment Amount</span>
                      <span className="text-xl font-bold text-green-600">${sponsorship.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Sponsors Yet</h2>
            <p className="text-gray-600">
              You don't have any sponsors at the moment. Keep working hard on your studies!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
