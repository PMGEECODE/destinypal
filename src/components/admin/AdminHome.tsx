"use client"

import { useEffect, useState } from "react"
import {
  Users,
  GraduationCap,
  Building2,
  Heart,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Gift,
} from "lucide-react"
import { api, type AdminDashboardStats } from "../../lib/api"

interface AdminHomeProps {
  adminEmail: string
}

interface RecentActivity {
  type: "student" | "sponsor" | "payment" | "donation"
  description: string
  timestamp: string
  amount?: number
}

export function AdminHome({ adminEmail }: AdminHomeProps) {
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_users: 0,
    total_students: 0,
    total_institutions: 0,
    total_sponsors: 0,
    active_sponsorships: 0,
    total_revenue: 0,
    total_donations: 0,
    pending_payments: 0,
    completed_payments: 0,
    failed_payments: 0,
    students_sponsored: 0,
    students_unsponsored: 0,
    avg_sponsorship_amount: 0,
    new_students_this_month: 0,
    new_sponsors_this_month: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const dashboardStats = await api.getAdminDashboardStats()
      setStats(dashboardStats)

      // Generate recent activity from current timestamp
      setRecentActivity([
        { type: "student", description: "New student registered", timestamp: new Date().toISOString() },
        { type: "sponsor", description: "New sponsor joined", timestamp: new Date().toISOString() },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      icon: Users,
      label: "Total System Users",
      value: stats.total_users.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      color: "blue",
    },
    {
      icon: GraduationCap,
      label: "Total Students",
      value: stats.total_students.toLocaleString(),
      change: `+${stats.new_students_this_month}`,
      trend: "up",
      color: "green",
    },
    {
      icon: Building2,
      label: "Institutions",
      value: stats.total_institutions.toLocaleString(),
      change: "+3",
      trend: "up",
      color: "amber",
    },
    {
      icon: Heart,
      label: "Active Sponsors",
      value: stats.total_sponsors.toLocaleString(),
      change: `+${stats.new_sponsors_this_month}`,
      trend: "up",
      color: "red",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${stats.total_revenue.toLocaleString()}`,
      change: `+15.3%`,
      trend: "up",
      color: "emerald",
    },
    {
      icon: Gift,
      label: "Total Donations",
      value: `$${stats.total_donations.toLocaleString()}`,
      change: "+8.2%",
      trend: "up",
      color: "violet",
    },
    {
      icon: Activity,
      label: "Active Sponsorships",
      value: stats.active_sponsorships.toLocaleString(),
      change: "+23",
      trend: "up",
      color: "cyan",
    },
    {
      icon: TrendingUp,
      label: "Avg Sponsorship",
      value: `$${stats.avg_sponsorship_amount.toLocaleString()}`,
      change: "+5.7%",
      trend: "up",
      color: "pink",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
      green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50" },
      amber: { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50" },
      red: { bg: "bg-red-600", text: "text-red-600", light: "bg-red-50" },
      emerald: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50" },
      violet: { bg: "bg-violet-600", text: "text-violet-600", light: "bg-violet-50" },
      cyan: { bg: "bg-cyan-600", text: "text-cyan-600", light: "bg-cyan-50" },
      pink: { bg: "bg-pink-600", text: "text-pink-600", light: "bg-pink-50" },
    }
    return colors[color] || colors.blue
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome back, Administrator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const colors = getColorClasses(stat.color)
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${colors.light} p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-sm text-gray-500 font-medium mb-1">{stat.label}</h3>
              <p className={`text-3xl font-bold ${colors.text}`}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Sponsored Students</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.students_sponsored} (
                  {stats.total_students > 0 ? ((stats.students_sponsored / stats.total_students) * 100).toFixed(1) : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.total_students > 0 ? (stats.students_sponsored / stats.total_students) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Unsponsored Students</span>
                <span className="text-sm font-semibold text-red-600">
                  {stats.students_unsponsored} (
                  {stats.total_students > 0
                    ? ((stats.students_unsponsored / stats.total_students) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.total_students > 0 ? (stats.students_unsponsored / stats.total_students) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Sponsored</p>
                <p className="text-2xl font-bold text-green-600">{stats.students_sponsored}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Need Sponsor</p>
                <p className="text-2xl font-bold text-red-600">{stats.students_unsponsored}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-800">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed_payments}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Success Rate</p>
                <p className="text-lg font-bold text-green-600">
                  {((stats.completed_payments / (stats.completed_payments + stats.failed_payments || 1)) * 100).toFixed(
                    1,
                  )}
                  %
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-10 h-10 text-amber-600" />
                <div>
                  <p className="font-semibold text-gray-800">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending_payments}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-10 h-10 text-red-600" />
                <div>
                  <p className="font-semibold text-gray-800">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed_payments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Overview</h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600">${stats.total_revenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +15.3% from last month
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Sponsorships</p>
                <p className="text-xl font-bold text-blue-600">${stats.total_revenue.toLocaleString()}</p>
              </div>
              <div className="bg-violet-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Donations</p>
                <p className="text-xl font-bold text-violet-600">${stats.total_donations.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const icons = {
                  student: GraduationCap,
                  sponsor: Heart,
                  payment: DollarSign,
                  donation: Gift,
                }
                const colors = {
                  student: "bg-green-100 text-green-600",
                  sponsor: "bg-red-100 text-red-600",
                  payment: "bg-blue-100 text-blue-600",
                  donation: "bg-violet-100 text-violet-600",
                }
                const Icon = icons[activity.type]

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${colors[activity.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    {activity.amount && (
                      <p className="text-sm font-bold text-gray-800">${activity.amount.toLocaleString()}</p>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
