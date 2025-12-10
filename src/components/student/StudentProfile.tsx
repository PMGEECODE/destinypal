"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  User,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Heart,
  School,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  AlertCircle,
  Edit3,
  Save,
  X,
  Camera,
} from "lucide-react"
import { studentStore } from "../../lib/api"
import type { StudentWithDetails, StudentFeeBalance } from "../../lib/api/types"

interface StudentProfileProps {
  studentId: string
  onProfileUpdate?: () => void // Added callback for profile updates
}

export function StudentProfile({ studentId, onProfileUpdate }: StudentProfileProps) {
  const [student, setStudent] = useState<StudentWithDetails | null>(null)
  const [feeBalances, setFeeBalances] = useState<StudentFeeBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<StudentWithDetails>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    fetchStudentProfile()
  }, [studentId])

  const fetchStudentProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const studentData = await studentStore.getStudentById(studentId)
      setStudent(studentData)
      setEditData(studentData)

      try {
        const balances = await studentStore.getStudentFeeBalances(studentId)
        setFeeBalances(balances)
      } catch {
        setFeeBalances([])
      }
    } catch (err) {
      console.error("Error fetching student profile:", err)
      setError("Failed to load your profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!student) return

    try {
      setSaving(true)
      await studentStore.updateStudent(studentId, {
        full_name: editData.full_name,
        date_of_birth: editData.date_of_birth,
        gender: editData.gender,
        grade_level: editData.grade_level,
        location: editData.location,
        background_story: editData.background_story,
        family_situation: editData.family_situation,
        academic_performance: editData.academic_performance,
      })

      await fetchStudentProfile()
      setIsEditing(false)

      // Notify parent of update
      if (onProfileUpdate) {
        onProfileUpdate()
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    try {
      setUploadingPhoto(true)
      const result = await studentStore.uploadProfileImage(studentId, file)

      // Update local state
      setStudent((prev) => (prev ? { ...prev, photo_url: result.url } : null))
      setEditData((prev) => ({ ...prev, photo_url: result.url }))

      // Notify parent of update
      if (onProfileUpdate) {
        onProfileUpdate()
      }
    } catch (err) {
      console.error("Error uploading photo:", err)
      alert("Failed to upload photo. Please try again.")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const totalFees = feeBalances.reduce((sum, fb) => sum + (fb.total_fees || 0), 0)
  const totalPaid = feeBalances.reduce((sum, fb) => sum + (fb.amount_paid || 0), 0)
  const balanceDue = feeBalances.reduce((sum, fb) => sum + (fb.balance_due ?? fb.balance ?? 0), 0)
  const paymentProgress = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0

  const getPhotoUrl = (student: StudentWithDetails | null): string | null => {
    if (!student) return null
    const url = student.photo_url || student.profile_image_url
    if (!url) return null
    // If it's already a full URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    // If it's a relative API path, prepend the API base URL
    if (url.startsWith("/api/")) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      return `${apiBaseUrl}${url}`
    }
    return url
  }

  const photoUrl = getPhotoUrl(student)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64 p-4">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStudentProfile}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64 p-4">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">
            We couldn't find your student profile. Please contact your institution administrator.
          </p>
        </div>
      </div>
    )
  }

  const fullName = student.full_name || `${student.first_name || ""} ${student.last_name || ""}`.trim()
  const gradeLevel =
    student.grade_level || (student.year_of_study ? `Year ${student.year_of_study}` : student.course) || "N/A"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-lg text-gray-600">View and update your student information</p>
          </div>
          <button
            onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {isEditing && (
          <div className="mb-4">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditData(student)
              }}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel editing
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    {photoUrl ? (
                      <img
                        src={photoUrl || "/placeholder.svg"}
                        alt={fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          console.error("[v0] Failed to load profile image:", photoUrl)
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${photoUrl ? "hidden" : ""}`}>
                      <User className="w-24 h-24 text-white opacity-50" />
                    </div>
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded-full cursor-pointer shadow-lg transition-colors">
                      {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.full_name || ""}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="text-2xl font-bold text-gray-800 mb-1 text-center border-b-2 border-green-500 focus:outline-none"
                    placeholder="Full Name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">{fullName}</h2>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.grade_level || ""}
                    onChange={(e) => setEditData({ ...editData, grade_level: e.target.value })}
                    className="text-gray-600 mb-4 text-center border-b border-gray-300 focus:outline-none focus:border-green-500"
                    placeholder="Grade Level"
                  />
                ) : (
                  <p className="text-gray-600 mb-4 text-center">{gradeLevel}</p>
                )}

                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.date_of_birth || ""}
                          onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                          className="font-medium border-b border-gray-300 focus:outline-none focus:border-green-500 w-full"
                        />
                      ) : (
                        <p className="font-medium">
                          {student.date_of_birth
                            ? `${new Date(student.date_of_birth).toLocaleDateString()} (${calculateAge(student.date_of_birth)} years)`
                            : "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Gender</p>
                      {isEditing ? (
                        <select
                          value={editData.gender || ""}
                          onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                          className="font-medium border-b border-gray-300 focus:outline-none focus:border-green-500 w-full bg-transparent"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="font-medium">{student.gender || "Not provided"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Location</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.location || ""}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="font-medium border-b border-gray-300 focus:outline-none focus:border-green-500 w-full"
                          placeholder="City, Country"
                        />
                      ) : (
                        <p className="font-medium">
                          {student.location ||
                            [student.city, student.county, student.country].filter(Boolean).join(", ") ||
                            "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  {student.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium truncate">{student.email}</p>
                      </div>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{student.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fee Balance Card */}
            {feeBalances.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-800">Fee Balance</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Total Fees</p>
                    <p className="text-2xl font-bold text-gray-800">${totalFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Balance Due</p>
                    <p className="text-2xl font-bold text-red-600">${balanceDue.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                    <span className="text-sm font-semibold text-green-600">{paymentProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Academic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course/Program</p>
                  <p className="font-semibold text-gray-800">{student.course || "Not provided"}</p>
                </div>
                {student.admission_number && (
                  <div>
                    <p className="text-sm text-gray-600">Admission Number</p>
                    <p className="font-semibold text-gray-800">{student.admission_number}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Academic Performance</p>
                  {isEditing ? (
                    <textarea
                      value={editData.academic_performance || ""}
                      onChange={(e) => setEditData({ ...editData, academic_performance: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                      placeholder="Describe your academic performance..."
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{student.academic_performance || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio / Background Story */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">About Me</h3>
              </div>
              {isEditing ? (
                <textarea
                  value={editData.background_story || ""}
                  onChange={(e) => setEditData({ ...editData, background_story: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Share your background story..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {student.background_story || student.bio || "No background story provided yet."}
                </p>
              )}
            </div>

            {/* Family Situation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Family Situation</h3>
              </div>
              {isEditing ? (
                <textarea
                  value={editData.family_situation || ""}
                  onChange={(e) => setEditData({ ...editData, family_situation: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Describe your family situation..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {student.family_situation || "No family situation provided yet."}
                </p>
              )}
            </div>

            {/* Institution Info */}
            {student.institution && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <School className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-800">Institution</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">School Name</p>
                    <p className="font-semibold text-gray-800">{student.institution.name}</p>
                  </div>
                  {student.institution.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">{student.institution.email}</p>
                    </div>
                  )}
                  {student.institution.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">{student.institution.phone}</p>
                    </div>
                  )}
                  {student.institution.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">{student.institution.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
