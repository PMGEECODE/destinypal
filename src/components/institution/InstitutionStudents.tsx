"use client"

import { useEffect, useState } from "react"
import { User, MapPin, Heart, AlertCircle, Loader2, Search, Filter } from "lucide-react"
import { api, type Student, type StudentFeeBalance } from "../../lib/api"

interface InstitutionStudentsProps {
  institutionEmail: string
}

interface StudentWithBalance extends Student {
  is_sponsored: boolean
  sponsor_count: number
}

export function InstitutionStudents({ institutionEmail }: InstitutionStudentsProps) {
  const [students, setStudents] = useState<StudentWithBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "sponsored" | "unsponsored">("all")

  useEffect(() => {
    fetchStudents()
  }, [institutionEmail])

  const fetchStudents = async () => {
    try {
      setLoading(true)

      const studentsData = await api.getStudents({ limit: 100 })

      // Process students with details
      const studentsWithDetails: StudentWithBalance[] = await Promise.all(
        (studentsData || []).map(async (student) => {
          let feeBalance: StudentFeeBalance | undefined
          try {
            feeBalance = await api.getStudentFeeBalance(student.id)
          } catch {
            // Fee balance may not exist
          }

          // For now, mark as not sponsored if no amount raised
          const isSponsored = (student.amount_raised || 0) > 0

          return {
            ...student,
            fee_balance: feeBalance,
            is_sponsored: isSponsored,
            sponsor_count: isSponsored ? 1 : 0,
          }
        }),
      )

      setStudents(studentsWithDetails)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
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

  const filteredStudents = students.filter((student) => {
    const fullName = student.full_name || `${student.first_name} ${student.last_name}`
    const gradeLevel = student.grade_level || student.grade_class || ""
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "sponsored" && student.is_sponsored) ||
      (filterStatus === "unsponsored" && !student.is_sponsored)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Students</h1>
        <p className="text-lg text-gray-600">Manage and view all registered students</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="sponsored">Sponsored</option>
              <option value="unsponsored">Unsponsored</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Sponsored ({students.filter((s) => s.is_sponsored).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Unsponsored ({students.filter((s) => !s.is_sponsored).length})</span>
          </div>
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const fullName = student.full_name || `${student.first_name} ${student.last_name}`
            const gradeLevel = student.grade_level || student.grade_class || "N/A"
            const photoUrl = student.photo_url || student.profile_image_url

            return (
              <div
                key={student.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 shadow-md border-2 border-white">
                        {photoUrl ? (
                          <img
                            src={photoUrl || "/placeholder.svg"}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{fullName}</h3>

                      <div className="space-y-1.5 text-sm">
                        {student.date_of_birth && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <span className="font-medium">{calculateAge(student.date_of_birth)} yrs</span>
                            <span className="text-gray-400">•</span>
                            <span>{student.gender}</span>
                          </div>
                        )}

                        <div className="text-gray-600">
                          <span className="font-medium">Grade:</span> {gradeLevel}
                        </div>

                        {(student.location || student.county) && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate text-xs">{student.location || student.county}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    {student.is_sponsored ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                        <Heart className="w-3 h-3" />
                        Sponsored ({student.sponsor_count})
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                        <AlertCircle className="w-3 h-3" />
                        Needs Sponsor
                      </div>
                    )}
                  </div>

                  {student.fee_balance && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-600">Fee Balance</span>
                        <span className="text-sm font-bold text-red-600">
                          ${student.fee_balance.balance_due.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((student.fee_balance.amount_paid / student.fee_balance.total_fees) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>${student.fee_balance.amount_paid.toLocaleString()} paid</span>
                        <span>${student.fee_balance.total_fees.toLocaleString()} total</span>
                      </div>
                    </div>
                  )}

                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start by registering your first student"}
          </p>
        </div>
      )}
    </div>
  )
}
