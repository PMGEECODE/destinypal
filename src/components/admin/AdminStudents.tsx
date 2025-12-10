"use client"

import { useEffect, useState, useCallback } from "react"
import {
  GraduationCap,
  Search,
  Filter,
  MapPin,
  Heart,
  AlertCircle,
  Loader2,
  BadgeCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { VerifiedBadge } from "../VerifiedBadge"
import { api, type Student } from "../../lib/api"

interface AdminStudentsProps {
  adminEmail: string
}

interface StudentWithDetails extends Student {
  institution_name?: string
  is_sponsored: boolean
}

export function AdminStudents({ adminEmail }: AdminStudentsProps) {
  const [students, setStudents] = useState<StudentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "unverified">("all")
  const [verifyingAll, setVerifyingAll] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] AdminStudents: Starting to fetch students from API")

      const response = await api.getStudents({ limit: 100 })
      console.log("[v0] AdminStudents: Response:", response)

      // Handle different response structures
      const studentsData = response?.items || response || []
      console.log("[v0] AdminStudents: Students data:", studentsData)

      // Process students with additional details
      const studentsWithDetails: StudentWithDetails[] = studentsData.map((student: Student) => ({
        ...student,
        institution_name: (student as any).institution?.name || "Unknown Institution",
        is_sponsored: (student as any).sponsorship_status === "sponsored" || false,
      }))

      console.log("[v0] AdminStudents: Processed students:", studentsWithDetails.length)
      setStudents(studentsWithDetails)
    } catch (err: any) {
      console.error("[v0] AdminStudents: Error fetching students:", err)
      setError(err.message || "Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleVerifyAll = async () => {
    try {
      setVerifyingAll(true)
      const unverifiedStudents = students.filter((s) => !s.is_verified)

      for (const student of unverifiedStudents) {
        try {
          await api.updateStudent(student.id, { is_verified: true })
        } catch (e) {
          console.error(`Failed to verify student ${student.id}:`, e)
        }
      }

      // Update local state
      setStudents((prev) => prev.map((student) => ({ ...student, is_verified: true })))
    } catch (error) {
      console.error("Error verifying all students:", error)
    } finally {
      setVerifyingAll(false)
    }
  }

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      setVerifyingId(id)

      await api.updateStudent(id, { is_verified: !currentStatus })

      // Update local state
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? { ...student, is_verified: !currentStatus } : student)),
      )
    } catch (error) {
      console.error("Error toggling verification:", error)
    } finally {
      setVerifyingId(null)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade_level?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && student.is_verified) ||
      (filterStatus === "unverified" && !student.is_verified)
    return matchesSearch && matchesFilter
  })

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A"
    const age = new Date().getFullYear() - new Date(dob).getFullYear()
    return age
  }

  const verifiedCount = students.filter((s) => s.is_verified).length

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
              fetchStudents()
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage all students</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={verifyingAll || verifiedCount === students.length}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            {verifyingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Verify All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{students.length}</p>
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
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-1" />
            <p className="text-xs text-gray-600">Sponsored</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {students.filter((s) => s.is_sponsored).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mb-1" />
            <p className="text-xs text-gray-600">Need Sponsor</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {students.filter((s) => !s.is_sponsored).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">
            {searchTerm ? "No students found" : "No students yet"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search" : "Students will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="bg-blue-100 p-1.5 rounded-lg flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{student.full_name}</h3>
                      {student.is_verified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-xs text-gray-600">{student.institution_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerification(student.id, student.is_verified)}
                  disabled={verifyingId === student.id}
                  className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 whitespace-nowrap ${
                    student.is_verified
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {verifyingId === student.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : student.is_verified ? (
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
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs">
                    {student.grade_level || "N/A"} • {calculateAge(student.date_of_birth || "")} yrs •{" "}
                    {student.gender || "N/A"}
                  </span>
                </div>
                {student.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs truncate">{student.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                <span className="text-gray-500 truncate">
                  {new Date(student.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    student.is_sponsored ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {student.is_sponsored ? "Sponsored" : "Needs Sponsor"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
