"use client"

import type React from "react"

import { X, CreditCard, Building2, Smartphone, Wallet } from "lucide-react"
import { useState } from "react"
import type { StudentWithPaymentAccounts, Sponsor } from "../../types"

interface SponsorshipModalProps {
  student: StudentWithPaymentAccounts
  onClose: () => void
  onSubmit: (data: {
    sponsor: Omit<Sponsor, "id" | "user_id" | "is_active" | "created_at">
    commitmentType: "full" | "partial"
    amount: number
    paymentMethod: string
    paymentType: "full" | "partial"
  }) => Promise<void>
}

const PAYMENT_METHODS = [
  { id: "credit_card", name: "Credit Card", icon: CreditCard },
  { id: "bank_transfer", name: "Bank Transfer", icon: Building2 },
  { id: "mobile_money", name: "Mobile Money", icon: Smartphone },
  { id: "paypal", name: "PayPal", icon: Wallet },
]

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

export function SponsorshipModal({ student, onClose, onSubmit }: SponsorshipModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    commitmentType: "full" as "full" | "partial",
    customAmount: "",
    paymentMethod: "",
    paymentType: "full" as "full" | "partial",
    paymentAmount: "",
  })

  const feeBalance = safeNumber(student.fee_balance?.balance_due)
  const studentName = safeString(student.full_name, "this student")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const commitmentAmount =
        formData.commitmentType === "full" ? feeBalance : Number.parseFloat(formData.customAmount) || 0

      const paymentAmount =
        formData.paymentType === "full" ? feeBalance : Number.parseFloat(formData.paymentAmount) || 0

      await onSubmit({
        sponsor: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
        },
        commitmentType: formData.commitmentType,
        amount: commitmentAmount,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType,
      })

      onClose()
    } catch (error) {
      console.error("Error submitting sponsorship:", error)
      alert("Failed to process sponsorship. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">Sponsor {studentName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total Fees Outstanding:</span>
              <span className="text-2xl font-bold text-blue-600">${feeBalance.toLocaleString()}</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Step 1: Your Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Step 2: Sponsorship Commitment</h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="commitmentType"
                    value="full"
                    checked={formData.commitmentType === "full"}
                    onChange={(e) => setFormData({ ...formData, commitmentType: e.target.value as "full" })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Full Sponsorship</div>
                    <div className="text-sm text-gray-600">
                      Commit to covering all fees (${feeBalance.toLocaleString()})
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="commitmentType"
                    value="partial"
                    checked={formData.commitmentType === "partial"}
                    onChange={(e) => setFormData({ ...formData, commitmentType: e.target.value as "partial" })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Partial Sponsorship</div>
                    <div className="text-sm text-gray-600 mb-2">Contribute what you can</div>
                    {formData.commitmentType === "partial" && (
                      <input
                        type="number"
                        required
                        min="1"
                        max={feeBalance}
                        placeholder="Enter amount"
                        value={formData.customAmount}
                        onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={formData.commitmentType === "partial" && !formData.customAmount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Step 3: Payment Details</h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={formData.paymentType === "full"}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as "full" })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Pay Full Amount</div>
                    <div className="text-sm text-gray-600">Pay ${feeBalance.toLocaleString()} now</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentType"
                    value="partial"
                    checked={formData.paymentType === "partial"}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as "partial" })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Make Partial Payment</div>
                    <div className="text-sm text-gray-600 mb-2">Pay a portion now</div>
                    {formData.paymentType === "partial" && (
                      <input
                        type="number"
                        required
                        min="1"
                        max={feeBalance}
                        placeholder="Enter payment amount"
                        value={formData.paymentAmount}
                        onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    return (
                      <label
                        key={method.id}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.paymentMethod === method.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="sr-only"
                        />
                        <Icon className="w-8 h-8 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{method.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.paymentMethod ||
                    (formData.paymentType === "partial" && !formData.paymentAmount)
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Complete Sponsorship"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
