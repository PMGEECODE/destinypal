"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, TrendingUp, Heart, AlertCircle, Award, Loader2, UserPlus } from "lucide-react"
import { api, type InstitutionDashboardStats } from "../../lib/api"

interface InstitutionHomeProps {
  institutionEmail: string
}

export function InstitutionHome({ institutionEmail }: InstitutionHomeProps) {
  const [stats, setStats] = useState<InstitutionDashboardStats>({
    total_students: 0,
    sponsored_students: 0,
    unsponsored_students: 0,
    total_fees_owed: 0,
    total_fees_paid: 0,
    total_fees_balance: 0,
    active_sponsors: 0,
    recent_registrations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [institutionEmail])

  const fetchStats = async () => {
    try {
      setLoading(true)

      const dashboardStats = await api.getInstitutionDashboardStats()
      setStats(dashboardStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      icon: Users,
      label: "Total Students",
      value: stats.total_students,
      color: "blue",
      description: "Registered students",
    },
    {
      icon: Heart,
      label: "Sponsored Students",
      value: stats.sponsored_students,
      color: "green",
      description: "Students with sponsors",
    },
    {
      icon: AlertCircle,
      label: "Unsponsored Students",
      value: stats.unsponsored_students,
      color: "red",
      description: "Need sponsorship",
    },
    {
      icon: DollarSign,
      label: "Total Fees Owed",
      value: `$${stats.total_fees_owed.toLocaleString()}`,
      color: "amber",
      description: "All student fees",
    },
    {
      icon: TrendingUp,
      label: "Fees Paid",
      value: `$${stats.total_fees_paid.toLocaleString()}`,
      color: "green",
      description: "Received payments",
    },
    {
      icon: AlertCircle,
      label: "Outstanding Balance",
      value: `$${stats.total_fees_balance.toLocaleString()}`,
      color: "red",
      description: "Remaining fees",
    },
    {
      icon: Users,
      label: "Active Sponsors",
      value: stats.active_sponsors,
      color: "cyan",
      description: "Sponsors helping students",
    },
    {
      icon: Award,
      label: "Recent Registrations",
      value: stats.recent_registrations,
      color: "orange",
      description: "Last 30 days",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
      green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50" },
      red: { bg: "bg-red-600", text: "text-red-600", light: "bg-red-50" },
      amber: { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50" },
      cyan: { bg: "bg-cyan-600", text: "text-cyan-600", light: "bg-cyan-50" },
      orange: { bg: "bg-orange-600", text: "text-orange-600", light: "bg-orange-50" },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome to your institution portal</p>
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
              </div>
              <h3 className="text-sm text-gray-500 font-medium mb-1">{stat.label}</h3>
              <p className={`text-3xl font-bold ${colors.text} mb-2`}>{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center gap-3">
              <UserPlus className="w-5 h-5" />
              Register New Student
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center gap-3">
              <Users className="w-5 h-5" />
              View All Students
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              View Payment Reports
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.total_fees_owed > 0 ? ((stats.total_fees_paid / stats.total_fees_owed) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.total_fees_owed > 0 ? Math.min((stats.total_fees_paid / stats.total_fees_owed) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Collected</p>
                <p className="text-xl font-bold text-green-600">${stats.total_fees_paid.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Outstanding</p>
                <p className="text-xl font-bold text-red-600">${stats.total_fees_balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
