"use client"

import { useEffect, useState } from "react"
import { Heart, Users, DollarSign, TrendingUp, Award, Globe } from "lucide-react"
import { api, type ImpactStats } from "../../lib/api"

export function ImpactDashboard() {
  const [stats, setStats] = useState<ImpactStats>({
    total_students: 0,
    total_sponsors: 0,
    total_fund_raised: 0,
    active_sponsorships: 0,
    total_donations: 0,
    locations_served: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImpactStats()
  }, [])

  const fetchImpactStats = async () => {
    try {
      setLoading(true)
      const impactData = await api.getImpactStats()
      setStats(impactData)
    } catch (error) {
      console.error("Error fetching impact stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading impact data...</p>
        </div>
      </div>
    )
  }

  const impactItems = [
    {
      icon: Users,
      label: "Students Supported",
      value: stats.total_students,
      color: "blue",
      description: "Students in our platform",
    },
    {
      icon: Heart,
      label: "Active Sponsors",
      value: stats.total_sponsors,
      color: "red",
      description: "Sponsors making a difference",
    },
    {
      icon: Award,
      label: "Active Sponsorships",
      value: stats.active_sponsorships,
      color: "amber",
      description: "Ongoing sponsorships",
    },
    {
      icon: DollarSign,
      label: "Total Raised",
      value: `$${stats.total_fund_raised.toLocaleString()}`,
      color: "green",
      description: "Funds raised for students",
    },
    {
      icon: TrendingUp,
      label: "Donations",
      value: `$${stats.total_donations.toLocaleString()}`,
      color: "purple",
      description: "Organization donations",
    },
    {
      icon: Globe,
      label: "Locations Served",
      value: stats.locations_served,
      color: "indigo",
      description: "Different regions helped",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
      red: { bg: "bg-red-600", text: "text-red-600", light: "bg-red-50" },
      amber: { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50" },
      green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50" },
      purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50" },
      indigo: { bg: "bg-indigo-600", text: "text-indigo-600", light: "bg-indigo-50" },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Our Impact</h1>
        <p className="text-muted-foreground">See the difference we're making together in students' lives</p>
      </div>

      {/* Impact stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {impactItems.map((item) => {
          const Icon = item.icon
          const colors = getColorClasses(item.color)
          return (
            <div
              key={item.label}
              className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-300 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${colors.light} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>

              <h3 className="text-sm text-muted-foreground font-medium mb-1">{item.label}</h3>
              <p className={`text-3xl font-bold ${colors.text} mb-1`}>{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          )
        })}
      </div>

      {/* What We're Accomplishing section */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <h2 className="text-xl font-bold text-foreground mb-5">What We're Accomplishing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 rounded-lg p-2.5">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Life-Changing Sponsorships</h3>
                <p className="text-muted-foreground text-sm">
                  We connect generous sponsors with deserving students, providing educational support and opening doors
                  to better futures.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-green-100 rounded-lg p-2.5">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Community Impact</h3>
                <p className="text-muted-foreground text-sm">
                  Our network spans multiple institutions and regions, creating a community dedicated to educational
                  transformation.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 rounded-lg p-2.5">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Sustainable Growth</h3>
                <p className="text-muted-foreground text-sm">
                  We're continuously growing our impact, reaching more students and building a stronger foundation for
                  educational support.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-amber-100 rounded-lg p-2.5">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Transparent Funding</h3>
                <p className="text-muted-foreground text-sm">
                  Every dollar donated goes directly to helping students with their educational fees and needs. We
                  maintain complete transparency.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 rounded-lg p-2.5">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Quality Partnerships</h3>
                <p className="text-muted-foreground text-sm">
                  We work with vetted institutions and sponsors to ensure quality education and reliable support for all
                  students.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-red-100 rounded-lg p-2.5">
                  <Globe className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Global Reach</h3>
                <p className="text-muted-foreground text-sm">
                  We're expanding our reach across different regions and countries, bringing educational opportunities
                  to underserved areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary rounded-lg shadow-sm p-6 text-primary-foreground">
        <h2 className="text-xl font-bold mb-3">Join Our Mission</h2>
        <p className="mb-5 opacity-90">
          Whether you want to sponsor a student or donate to support our platform, you can make a real difference in a
          student's life today.
        </p>
        <div className="flex gap-3">
          <button className="bg-background text-foreground hover:bg-background/90 font-semibold py-2.5 px-5 rounded-lg transition-colors">
            Sponsor a Student
          </button>
          <button className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold py-2.5 px-5 rounded-lg transition-colors">
            Make a Donation
          </button>
        </div>
      </div>
    </div>
  )
}
