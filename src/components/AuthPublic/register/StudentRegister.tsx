"use client"
import { ArrowLeft, School, GraduationCap } from "lucide-react"
import type { StudentType } from "../types"

interface StudentRegisterProps {
  onSelectType: (type: StudentType) => void
  onBack?: () => void
  onLogin?: () => void
}

export function StudentRegister({ onSelectType, onBack, onLogin }: StudentRegisterProps) {
  const studentTypes = [
    {
      id: "high_school" as StudentType,
      title: "High School Student",
      subtitle: "Form 1 - Form 4",
      description: "For secondary school students in Form 1 through Form 4",
      icon: School,
      color: "green",
      requirements: [
        "Currently enrolled in secondary school",
        "Parent/Guardian information required",
        "School admission number",
      ],
    },
    {
      id: "university" as StudentType,
      title: "University Student",
      subtitle: "Higher Education",
      description: "For students in universities, colleges, and vocational institutions",
      icon: GraduationCap,
      color: "emerald",
      requirements: ["Valid student ID", "Course and faculty details", "Emergency contact information"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4">
            <GraduationCap className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Registration</h1>
          <p className="text-slate-600 mt-1">Select your education level to continue</p>
        </div>

        {/* Student Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentTypes.map((type) => {
            const Icon = type.icon
            const isHighSchool = type.id === "high_school"

            return (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left group border-2 border-transparent ${
                  isHighSchool ? "hover:border-green-300" : "hover:border-emerald-300"
                }`}
              >
                <div
                  className={`w-14 h-14 ${
                    isHighSchool ? "bg-green-100 group-hover:bg-green-200" : "bg-emerald-100 group-hover:bg-emerald-200"
                  } rounded-xl flex items-center justify-center mb-4 transition-colors`}
                >
                  <Icon className={`w-7 h-7 ${isHighSchool ? "text-green-600" : "text-emerald-600"}`} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{type.title}</h2>
                <p className={`text-sm font-medium ${isHighSchool ? "text-green-600" : "text-emerald-600"} mb-2`}>
                  {type.subtitle}
                </p>
                <p className="text-slate-600 text-sm mb-4">{type.description}</p>
                <div className={`${isHighSchool ? "bg-green-50" : "bg-emerald-50"} rounded-lg p-3`}>
                  <p className="text-xs font-medium text-slate-700 mb-2">Requirements:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {type.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 ${isHighSchool ? "bg-green-400" : "bg-emerald-400"} rounded-full`}
                        />
                        {req}
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
          <button onClick={onLogin} className="text-green-600 hover:text-green-700 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
