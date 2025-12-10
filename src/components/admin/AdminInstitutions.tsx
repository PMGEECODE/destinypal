import type React from "react"

import { useEffect, useState, useCallback } from "react"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Search,
  Loader2,
  BadgeCheck,
  CheckCircle,
  XCircle,
  Plus,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { api, type Institution } from "../../lib/api"
import { VerifiedBadge } from "../VerifiedBadge"

interface AdminInstitutionsProps {
  adminEmail: string
}

interface InstitutionWithCount extends Institution {
  student_count: number
}

interface NewInstitutionForm {
  name: string
  email: string
  phone: string
  address: string
  region: string
  country: string
  institution_type: string
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
  website: string
  registration_number: string
  description: string
}

const initialFormState: NewInstitutionForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  region: "",
  country: "Uganda",
  institution_type: "secondary_school",
  contact_person_name: "",
  contact_person_email: "",
  contact_person_phone: "",
  website: "",
  registration_number: "",
  description: "",
}

export function AdminInstitutions({ adminEmail }: AdminInstitutionsProps) {
  const [institutions, setInstitutions] = useState<InstitutionWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [verifyingAll, setVerifyingAll] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<NewInstitutionForm>(initialFormState)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)

  const fetchInstitutions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.getInstitutions({ limit: 100 })

      const institutionsData: InstitutionWithCount[] = (response.items || response || []).map(
        (inst: Institution & { student_count?: number }) => ({
          ...inst,
          student_count: inst.student_count || 0,
        }),
      )

      setInstitutions(institutionsData)
    } catch (err: any) {
      console.error("[AdminInstitutions] Error fetching institutions:", err)
      setError(err.message || "Failed to fetch institutions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInstitutions()
  }, [fetchInstitutions])

  const handleVerifyAll = async () => {
    try {
      setVerifyingAll(true)
      const unverifiedInstitutions = institutions.filter((inst) => !inst.is_verified)

      await Promise.all(unverifiedInstitutions.map((inst) => api.updateInstitution(inst.id, { is_verified: true })))

      setInstitutions((prev) => prev.map((inst) => ({ ...inst, is_verified: true })))
    } catch (err: any) {
      console.error("[AdminInstitutions] Error verifying all:", err)
      setError(err.message || "Failed to verify institutions")
    } finally {
      setVerifyingAll(false)
    }
  }

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      setVerifyingId(id)

      await api.updateInstitution(id, { is_verified: !currentStatus })

      setInstitutions((prev) => prev.map((inst) => (inst.id === id ? { ...inst, is_verified: !currentStatus } : inst)))
    } catch (err: any) {
      console.error("[AdminInstitutions] Error toggling verification:", err)
      setError(err.message || "Failed to update verification")
    } finally {
      setVerifyingId(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setCreateError(null)
  }

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    if (!formData.name.trim()) {
      setCreateError("Institution name is required")
      setCreating(false)
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setCreateError("Valid email address is required")
      setCreating(false)
      return
    }

    try {
      const newInstitution = await api.createInstitution({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        region: formData.region.trim() || undefined,
        country: formData.country.trim() || "Uganda",
        institution_type: formData.institution_type,
        contact_person_name: formData.contact_person_name.trim() || undefined,
        contact_person_email: formData.contact_person_email.trim() || undefined,
        contact_person_phone: formData.contact_person_phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        registration_number: formData.registration_number.trim() || undefined,
        description: formData.description.trim() || undefined,
      })

      setInstitutions((prev) => [{ ...newInstitution, student_count: 0 }, ...prev])
      setCreateSuccess(true)

      setTimeout(() => {
        setShowCreateModal(false)
        setFormData(initialFormState)
        setCreateSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error("[AdminInstitutions] Error creating:", err)
      if (err.message?.includes("already exists")) {
        setCreateError("An institution with this name or email already exists")
      } else {
        setCreateError(err.message || "Failed to create institution")
      }
    } finally {
      setCreating(false)
    }
  }

  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.region?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const verifiedCount = institutions.filter((inst) => inst.is_verified).length

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
              fetchInstitutions()
            }}
            className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-xs flex-shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Retry</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Institutions</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage schools and universities</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={fetchInstitutions}
            disabled={loading}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={verifyingAll || verifiedCount === institutions.length}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            {verifyingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Verify All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mb-1" />
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{institutions.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Verified</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{verifiedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-1" />
            <p className="text-xs text-gray-600">Students</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {institutions.reduce((sum, i) => sum + (i.student_count || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredInstitutions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">
            {searchTerm ? "No institutions found" : "No institutions yet"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            {searchTerm ? "Try adjusting your search" : "Create one to get started"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Institution
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredInstitutions.map((institution) => (
            <div key={institution.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="bg-amber-100 p-1.5 rounded-lg flex-shrink-0">
                    <Building2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{institution.name}</h3>
                      {institution.is_verified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-xs text-gray-600">{institution.student_count || 0} students</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerification(institution.id, institution.is_verified)}
                  disabled={verifyingId === institution.id}
                  className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 whitespace-nowrap ${
                    institution.is_verified
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {verifyingId === institution.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : institution.is_verified ? (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Unverify</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Verify</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                {institution.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs truncate">{institution.email}</span>
                  </div>
                )}
                {institution.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs truncate">{institution.phone}</span>
                  </div>
                )}
                {(institution.address || institution.region) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs truncate">
                      {[institution.address, institution.region, institution.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                <span className="text-gray-500 truncate">
                  {new Date(institution.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    institution.compliance_status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {institution.compliance_status || "active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto my-6 sm:my-8 sm:rounded-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Create Institution</h2>
                <p className="text-xs text-gray-600">Register a new institution</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData(initialFormState)
                  setCreateError(null)
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {createSuccess ? (
              <div className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Created Successfully!</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Institution registered in the system.</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-sm mx-auto text-xs">
                  <p className="text-green-800 mb-1">
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p className="text-green-800">
                    <strong>Email:</strong> {formData.email}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateInstitution} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1.5 border-b">Basic Info</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="School name"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Type</label>
                        <select
                          name="institution_type"
                          value={formData.institution_type}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="primary_school">Primary</option>
                          <option value="secondary_school">Secondary</option>
                          <option value="high_school">High School</option>
                          <option value="university">University</option>
                          <option value="vocational">Vocational</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Reg. Number</label>
                        <input
                          type="text"
                          name="registration_number"
                          value={formData.registration_number}
                          onChange={handleInputChange}
                          placeholder="Reg. #"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1.5 border-b">Contact</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="institution@example.com"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+256 700 000 000"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://..."
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1.5 border-b">Location</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Region</label>
                        <input
                          type="text"
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          placeholder="Region"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1.5 border-b">Contact Person</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Name</label>
                      <input
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        placeholder="Full name"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Email</label>
                        <input
                          type="email"
                          name="contact_person_email"
                          value={formData.contact_person_email}
                          onChange={handleInputChange}
                          placeholder="contact@..."
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone</label>
                        <input
                          type="tel"
                          name="contact_person_phone"
                          value={formData.contact_person_phone}
                          onChange={handleInputChange}
                          placeholder="+256 700..."
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Brief description..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData(initialFormState)
                      setCreateError(null)
                    }}
                    className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium text-xs rounded-lg transition-colors"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
