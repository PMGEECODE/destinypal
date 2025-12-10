"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Users,
  GraduationCap,
  Building2,
  Heart,
  Search,
  Filter,
  Loader2,
  Mail,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { api, type User, type Student, type Institution, type SponsorProfile } from "../../lib/api"

interface AdminUsersProps {
  adminEmail: string
}

interface UserRecord {
  id: string
  type: "user" | "student" | "institution" | "sponsor"
  name: string
  email: string
  created_at: string
  role?: string
  details?: any
}

export function AdminUsers({ adminEmail }: AdminUsersProps) {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "user" | "student" | "institution" | "sponsor">("all")
  const [stats, setStats] = useState({
    total: 0,
    users: 0,
    students: 0,
    institutions: 0,
    sponsors: 0,
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] AdminUsers: Starting to fetch data from API")

      const usersResponse = await api.getUsers({ limit: 100 }).catch((err) => {
        console.log("[v0] AdminUsers: Failed to fetch users:", err)
        return { items: [], total: 0 }
      })
      console.log("[v0] AdminUsers: Users response:", usersResponse)

      const studentsResponse = await api.getStudents({ limit: 100 }).catch((err) => {
        console.log("[v0] AdminUsers: Failed to fetch students:", err)
        return { items: [], total: 0 }
      })
      console.log("[v0] AdminUsers: Students response:", studentsResponse)

      const institutionsResponse = await api.getInstitutions({ limit: 100 }).catch((err) => {
        console.log("[v0] AdminUsers: Failed to fetch institutions:", err)
        return { items: [], total: 0 }
      })
      console.log("[v0] AdminUsers: Institutions response:", institutionsResponse)

      const sponsorsResponse = await api.getSponsors({ limit: 100 }).catch((err) => {
        console.log("[v0] AdminUsers: Failed to fetch sponsors:", err)
        return { items: [], total: 0 }
      })
      console.log("[v0] AdminUsers: Sponsors response:", sponsorsResponse)

      // Handle different response structures (items array or direct array)
      const usersData = usersResponse?.items || usersResponse || []
      const studentsData = studentsResponse?.items || studentsResponse || []
      const institutionsData = institutionsResponse?.items || institutionsResponse || []
      const sponsorsData = sponsorsResponse?.items || sponsorsResponse || []

      const allUsers: UserRecord[] = [
        // Map users from the users endpoint
        ...usersData.map((u: User) => ({
          id: u.id,
          type: "user" as const,
          name: u.email?.split("@")[0] || "User",
          email: u.email || "",
          created_at: u.created_at,
          role: u.role,
          details: u,
        })),
        // Map students
        ...studentsData.map((s: Student) => ({
          id: s.id,
          type: "student" as const,
          name: s.full_name || "Unknown Student",
          email: s.email || `${(s.full_name || "student").toLowerCase().replace(/\s+/g, ".")}@student.local`,
          created_at: s.created_at,
          details: s,
        })),
        // Map institutions
        ...institutionsData.map((i: Institution) => ({
          id: i.id,
          type: "institution" as const,
          name: i.name || "Unknown Institution",
          email: i.email || "",
          created_at: i.created_at,
          details: i,
        })),
        // Map sponsors
        ...sponsorsData.map((s: SponsorProfile) => ({
          id: s.id,
          type: "sponsor" as const,
          name: s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.company_name || "Anonymous Sponsor",
          email: "",
          created_at: s.created_at,
          details: s,
        })),
      ]

      console.log("[v0] AdminUsers: Combined all users:", allUsers.length)

      // Sort by created_at descending
      allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setUsers(allUsers)
      setStats({
        total: allUsers.length,
        users: usersData.length,
        students: studentsData.length,
        institutions: institutionsData.length,
        sponsors: sponsorsData.length,
      })
    } catch (error: any) {
      console.error("[v0] AdminUsers: Error fetching users:", error)
      setError(error.message || "Failed to fetch users. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || user.type === filterType
    return matchesSearch && matchesFilter
  })

  const getUserIcon = (type: string) => {
    switch (type) {
      case "student":
        return GraduationCap
      case "institution":
        return Building2
      case "sponsor":
        return Heart
      default:
        return Users
    }
  }

  const getUserColor = (type: string) => {
    switch (type) {
      case "student":
        return "bg-green-100 text-green-600"
      case "institution":
        return "bg-amber-100 text-amber-600"
      case "sponsor":
        return "bg-red-100 text-red-600"
      case "user":
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
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
              fetchUsers()
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">System Users</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage all users in the platform</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm rounded-lg transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-1" />
            <p className="text-xs text-gray-600">Students</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.students}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mb-1" />
            <p className="text-xs text-gray-600">Institutions</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.institutions}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-col items-center text-center">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mb-1" />
            <p className="text-xs text-gray-600">Sponsors</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.sponsors}</p>
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="user">System Users</option>
              <option value="student">Students</option>
              <option value="institution">Institutions</option>
              <option value="sponsor">Sponsors</option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">No users found</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search" : "No users in the system yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const Icon = getUserIcon(user.type)
                  return (
                    <tr key={`${user.type}-${user.id}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getUserColor(user.type)}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="text-xs font-semibold capitalize">{user.type}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-800 text-sm">{user.name}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs truncate max-w-[150px]">{user.email || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
