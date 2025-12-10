"use client"

import { User, MapPin, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { StudentWithDetails } from "../../types"
import { VerifiedBadge } from "../VerifiedBadge"
import { formatTruncatedName, getNameInitials, getFullPhotoUrl } from "../../lib/utils/formatName"

interface StudentCardProps {
  student: StudentWithDetails
  onClick: () => void
  disabled?: boolean
}

const safeNumber = (value: unknown, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

const safeString = (value: unknown, defaultValue = ""): string => {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "string") return value
  if (typeof value === "object") return defaultValue
  return String(value)
}

export function StudentCard({ student, onClick, disabled = false }: StudentCardProps) {
  const getNeedLevelColor = (level: number) => {
    if (level >= 8) return "bg-red-100 text-red-700 border-red-300"
    if (level >= 5) return "bg-orange-100 text-orange-700 border-orange-300"
    return "bg-yellow-100 text-yellow-700 border-yellow-300"
  }

  const getNeedLevelText = (level: number) => {
    if (level >= 8) return "Critical Need"
    if (level >= 5) return "High Need"
    return "Moderate Need"
  }

  const getSponsorshipStatusBadge = () => {
    const status = student.sponsorship_status

    if (status === "fully_sponsored") {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Fully Sponsored
        </div>
      )
    }

    if (status === "partially_sponsored") {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          Partially Sponsored
        </div>
      )
    }

    if (status === "no_fees_recorded") {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          Fees Pending
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
        <AlertCircle className="w-3.5 h-3.5" />
        Needs Sponsor
      </div>
    )
  }

  const getFundingProgress = () => {
    const goal = safeNumber(student.funding_goal)
    const raised = safeNumber(student.amount_raised)

    if (goal <= 0) return 0
    return Math.min(100, Math.round((raised / goal) * 100))
  }

  const fullName = safeString(student.full_name, "Unknown Student")
  const displayName = formatTruncatedName(fullName)
  const nameInitials = getNameInitials(fullName)
  const institutionName = safeString(student.institution?.name, "Unknown Institution")
  const gradeLevel = safeString(student.grade_level, "N/A")
  const gender = safeString(student.gender, "N/A")
  const location = student.location || null
  const needLevel = safeNumber(student.need_level, 5)
  const fundingGoal = safeNumber(student.funding_goal)
  const amountRaised = safeNumber(student.amount_raised)
  const photoUrl = getFullPhotoUrl(student.photo_url)

  const getBalanceDue = (): number => {
    if (!student.fee_balance) return 0
    if (typeof student.fee_balance === "number") return student.fee_balance
    if (typeof student.fee_balance === "object" && student.fee_balance !== null) {
      return safeNumber((student.fee_balance as any).balance_due)
    }
    return 0
  }
  const balanceDue = getBalanceDue()

  const isFullySponsored = student.sponsorship_status === "fully_sponsored"
  const progress = getFundingProgress()

  return (
    <div
      onClick={!disabled && !isFullySponsored ? onClick : undefined}
      className={`bg-white rounded-lg shadow-md transition-all duration-300 overflow-hidden border border-gray-200 group ${
        disabled || isFullySponsored ? "cursor-default opacity-80" : "hover:shadow-xl cursor-pointer"
      }`}
    >
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-28 h-36 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 shadow-md border-2 border-white relative">
              {photoUrl ? (
                <img
                  src={photoUrl || "/placeholder.svg"}
                  alt={displayName}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    !disabled && !isFullySponsored ? "group-hover:scale-105" : ""
                  }`}
                  onError={(e) => {
                    // Fallback to placeholder on error
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              {/* Fallback avatar with initials */}
              <div className={`w-full h-full flex flex-col items-center justify-center ${photoUrl ? "hidden" : ""}`}>
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xl font-bold">{nameInitials}</span>
                </div>
                <User className="w-6 h-6 text-gray-400" />
              </div>
              {isFullySponsored && (
                <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600 bg-white rounded-full" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3
                className={`text-lg font-bold text-gray-800 truncate transition-colors ${
                  !disabled && !isFullySponsored ? "group-hover:text-blue-600" : ""
                }`}
                title={fullName}
              >
                {displayName}
              </h3>
              {student.is_verified && <VerifiedBadge size="sm" />}
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1.5">
              <span className="truncate">{institutionName}</span>
              {student.institution?.is_verified && <VerifiedBadge size="sm" />}
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <span className="font-medium">
                  {student.date_of_birth
                    ? `${new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()} yrs`
                    : ""}
                </span>
                {student.date_of_birth && gender !== "N/A" && <span className="text-gray-400">•</span>}
                <span>{gender}</span>
              </div>

              <div className="text-gray-600">
                <span className="font-medium">Grade:</span> {gradeLevel}
              </div>

              {location && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {getSponsorshipStatusBadge()}
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getNeedLevelColor(needLevel)}`}
          >
            {getNeedLevelText(needLevel)}
          </div>
        </div>

        {fundingGoal > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>${amountRaised.toLocaleString()} raised</span>
              <span>${fundingGoal.toLocaleString()} goal</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFullySponsored ? "bg-green-500" : progress > 50 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{progress}% funded</p>
          </div>
        )}

        {balanceDue > 0 && !isFullySponsored && (
          <div className="flex items-center gap-1 text-red-600 font-semibold text-sm mb-3">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>${balanceDue.toLocaleString()} still needed</span>
          </div>
        )}

        {student.background_story && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{student.background_story}</p>
        )}

        {isFullySponsored ? (
          <div className="w-full bg-green-100 text-green-700 font-medium py-2.5 px-4 rounded-lg text-center">
            <CheckCircle className="w-4 h-4 inline-block mr-2" />
            Fully Sponsored
          </div>
        ) : (
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 group-hover:shadow-md"
            disabled={disabled}
          >
            {student.sponsorship_status === "partially_sponsored" ? "Continue Sponsoring" : "Sponsor This Student"}
          </button>
        )}
      </div>
    </div>
  )
}
