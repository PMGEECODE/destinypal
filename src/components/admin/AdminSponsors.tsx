"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Heart,
  Phone,
  Search,
  Loader2,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Mail,
  Calendar,
  Shield,
  UserCircle,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { api, type SponsorProfile } from "../../lib/api"

interface AdminSponsorsProps {
  adminEmail: string
}

interface SponsorWithStats extends SponsorProfile {
  total_sponsorships?: number
  total_donated?: number
}

export function AdminSponsors({ adminEmail }: AdminSponsorsProps) {
  const [sponsors, setSponsors] = useState<SponsorWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorWithStats | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchSponsors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.getSponsors({ limit: 100 })

      // Handle different response structures
      const sponsorsData = response?.items || response || []

      setSponsors(sponsorsData)
    } catch (err: any) {
      console.error("Error fetching sponsors:", err)
      setError(err.message || "Failed to fetch sponsors")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSponsors()
  }, [fetchSponsors])

  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      sponsor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.phone?.includes(searchTerm),
  )

  const getComplianceColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700"
      case "suspended":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleViewDetails = (sponsor: SponsorWithStats) => {
    setSelectedSponsor(sponsor)
    setShowDetailsModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center justify-between text-xs sm:text-sm gap-2">
          <div className="flex items-center gap-2 flex-1">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
          <button
            onClick={() => {
              setError(null)
              fetchSponsors()
            }}
            className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-xs flex-shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Retry</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sponsor Management</h1>
          <p className="text-xs sm:text-sm text-gray-600">View and manage all platform sponsors</p>
        </div>
        <button
          onClick={fetchSponsors}
          disabled={loading}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm rounded-lg transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mb-1" />
            <p className="text-xs text-gray-600">Total Sponsors</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{sponsors.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-1" />
            <p className="text-xs text-gray-600">Active</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{sponsors.filter((s) => s.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 mb-1" />
            <p className="text-xs text-gray-600">Inactive</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{sponsors.filter((s) => !s.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Compliant</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {sponsors.filter((s) => s.compliance_status?.toLowerCase() === "active").length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sponsors List */}
      {filteredSponsors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">
            {searchTerm ? "No sponsors found" : "No sponsors yet"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search" : "Sponsors will appear here when they register"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sponsor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <UserCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sponsor.full_name}</p>
                          <p className="text-xs text-gray-500">ID: {sponsor.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{sponsor.email}</span>
                        </div>
                        {sponsor.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{sponsor.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          sponsor.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {sponsor.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sponsor.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full capitalize ${getComplianceColor(
                          sponsor.compliance_status,
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        {sponsor.compliance_status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(sponsor.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetails(sponsor)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredSponsors.map((sponsor) => (
              <div key={sponsor.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1.5 rounded-full">
                      <UserCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sponsor.full_name}</p>
                      <p className="text-xs text-gray-500">{sponsor.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleViewDetails(sponsor)} className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      sponsor.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {sponsor.is_active ? "Active" : "Inactive"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getComplianceColor(
                      sponsor.compliance_status,
                    )}`}
                  >
                    {sponsor.compliance_status || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  {sponsor.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      <span>{sponsor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(sponsor.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsor Details Modal */}
      {showDetailsModal && selectedSponsor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Sponsor Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <UserCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedSponsor.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        selectedSponsor.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedSponsor.is_active ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getComplianceColor(
                        selectedSponsor.compliance_status,
                      )}`}
                    >
                      {selectedSponsor.compliance_status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-800 break-all">{selectedSponsor.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-800">{selectedSponsor.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-800 font-mono text-xs">{selectedSponsor.user_id || "Not linked"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Sponsor ID</p>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-800 font-mono text-xs">{selectedSponsor.id}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Registration Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-800">{formatDate(selectedSponsor.created_at)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Compliance Status</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-800 capitalize">{selectedSponsor.compliance_status || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit Sponsor
                </button>
                {selectedSponsor.is_active ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Ban className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
