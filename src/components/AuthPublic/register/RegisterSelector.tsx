"use client"
import { Users, Building2, GraduationCap, ArrowLeft } from "lucide-react"
import type { UserRole } from "../types"

interface RegisterSelectorProps {
  onSelectRole: (role: UserRole) => void
  onBack?: () => void
}

export function RegisterSelector({ onSelectRole, onBack }: RegisterSelectorProps) {
  const roles = [
    {
      id: "sponsor" as UserRole,
      title: "Sponsor",
      description: "Support students in need through sponsorships and donations",
      icon: Users,
      color: "blue",
      features: ["Browse students", "Make sponsorships", "Track impact", "Donate to causes"],
    },
    {
      id: "institution" as UserRole,
      title: "Institution",
      description: "Register your school or university to connect students with sponsors",
      icon: Building2,
      color: "orange",
      features: ["Register students", "Manage profiles", "Track payments", "View reports"],
    },
    {
      id: "student" as UserRole,
      title: "Student",
      description: "Create your profile to receive sponsorship support for your education",
      icon: GraduationCap,
      color: "green",
      features: ["Create profile", "Connect with sponsors", "Track support", "Share progress"],
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        bgHover: "group-hover:bg-blue-200",
        text: "text-blue-600",
        accent: "bg-blue-50",
        border: "hover:border-blue-300",
      },
      orange: {
        bg: "bg-orange-100",
        bgHover: "group-hover:bg-orange-200",
        text: "text-orange-600",
        accent: "bg-orange-50",
        border: "hover:border-orange-300",
      },
      green: {
        bg: "bg-green-100",
        bgHover: "group-hover:bg-green-200",
        text: "text-green-600",
        accent: "bg-green-50",
        border: "hover:border-green-300",
      },
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to login
            </button>
          )}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">D</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Create your account</h1>
          <p className="text-slate-600 text-lg">Choose how you want to join DestinyPal</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            const colors = getColorClasses(role.color)

            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left group border-2 border-transparent ${colors.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.bg} ${colors.bgHover} rounded-xl flex items-center justify-center mb-4 transition-colors`}
                >
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">{role.title}</h2>
                <p className="text-slate-600 text-sm mb-4 min-h-[40px]">{role.description}</p>
                <div className={`${colors.accent} rounded-lg p-3`}>
                  <p className="text-xs font-medium text-slate-700 mb-2">What you can do:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 ${colors.bg} rounded-full`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            )
          })}
        </div>

        {/* Already have account */}
        <p className="text-center mt-8 text-slate-600">
          Already have an account?{" "}
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
