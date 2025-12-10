"use client"

import {
  X,
  User,
  Calendar,
  GraduationCap,
  MapPin,
  Heart,
  TrendingUp,
  CreditCard,
  Building,
  Phone,
  Info,
  AlertCircle,
} from "lucide-react"
import type { StudentWithPaymentAccounts } from "../../types"
import { VerifiedBadge } from "../VerifiedBadge"
import { formatTruncatedName, getNameInitials, getFullPhotoUrl } from "../../lib/utils/formatName"

interface StudentDetailModalProps {
  student: StudentWithPaymentAccounts
  onClose: () => void
  onSponsor: () => void
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

export function StudentDetailModal({ student, onClose, onSponsor }: StudentDetailModalProps) {
  const calculateAge = (dob: string) => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const fullName = safeString(student.full_name, "Unknown Student")
  const displayName = formatTruncatedName(fullName)
  const nameInitials = getNameInitials(fullName)
  const institutionName = safeString(student.institution?.name, "Unknown Institution")
  const institutionEmail = safeString(student.institution?.email, "N/A")
  const gradeLevel = safeString(student.grade_level, "N/A")
  const gender = safeString(student.gender, "N/A")
  const location = student.location || null
  const dateOfBirth = student.date_of_birth || ""
  const age = calculateAge(dateOfBirth)
  const photoUrl = getFullPhotoUrl(student.photo_url)

  const totalFees = safeNumber(student.fee_balance?.total_fees)
  const amountPaid = safeNumber(student.fee_balance?.amount_paid)
  const balanceDue = safeNumber(student.fee_balance?.balance_due)
  const hasFeeBalance = student.fee_balance && totalFees > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                {photoUrl ? (
                  <img
                    src={photoUrl || "/placeholder.svg"}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                {/* Fallback with initials */}
                <div className={`w-full h-full flex flex-col items-center justify-center ${photoUrl ? "hidden" : ""}`}>
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-2">
                    <span className="text-white text-3xl font-bold">{nameInitials}</span>
                  </div>
                  <User className="w-12 h-12 text-white opacity-50" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-3xl font-bold text-gray-800" title={fullName}>
                    {displayName}
                  </h3>
                  {student.is_verified && <VerifiedBadge size="lg" />}
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Building className="w-5 h-5" />
                  <span>{institutionName}</span>
                  {student.institution?.is_verified && <VerifiedBadge size="md" />}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Grade Level</p>
                    <p className="font-medium">{gradeLevel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-medium">{age > 0 ? `${age} years old` : "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium">{gender}</p>
                  </div>
                </div>

                {location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium">{location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasFeeBalance && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-5 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h4 className="font-semibold text-gray-800 text-lg">Fee Balance</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Fees</p>
                  <p className="text-xl font-bold text-gray-800">${totalFees.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
                  <p className="text-xl font-bold text-green-600">${amountPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Balance Due</p>
                  <p className="text-xl font-bold text-red-600">${balanceDue.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalFees > 0 ? Math.min((amountPaid / totalFees) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Background Story</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {student.background_story || "No background story provided."}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-gray-800">Family Situation</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {student.family_situation || "No family information provided."}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-800">Academic Performance</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {student.academic_performance || "No academic information provided."}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h4 className="text-xl font-semibold text-gray-800">Payment Account Information</h4>
            </div>

            {student.payment_accounts && student.payment_accounts.length > 0 ? (
              <div className="space-y-4">
                {student.payment_accounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {safeString(account.account_type, "Account")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Account Name</p>
                        <p className="font-medium text-gray-800">{safeString(account.account_name, "N/A")}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Account Number</p>
                        <p className="font-medium text-gray-800 font-mono">
                          {safeString(account.account_number, "N/A")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Bank/Provider</p>
                        <p className="font-medium text-gray-800">{safeString(account.bank_name, "N/A")}</p>
                      </div>

                      {account.swift_code && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">SWIFT/BIC Code</p>
                          <p className="font-medium text-gray-800 font-mono">{account.swift_code}</p>
                        </div>
                      )}
                    </div>

                    {account.additional_info && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Additional Information</p>
                            <p className="text-sm text-gray-700">{account.additional_info}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No payment account information available</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-800">Institution Contact</h4>
                {student.institution?.is_verified && <VerifiedBadge size="sm" />}
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span> {institutionName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {institutionEmail}
                </p>
                {student.institution?.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{student.institution.phone}</span>
                  </p>
                )}
                {student.institution?.address && (
                  <p>
                    <span className="font-medium">Address:</span> {student.institution.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={onSponsor}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Sponsor This Student
          </button>
        </div>
      </div>
    </div>
  )
}
