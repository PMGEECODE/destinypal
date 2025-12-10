"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../AuthContext"
import { PasswordStrengthMeter } from "../shared/PasswordStrengthMeter"
import { PhoneInput } from "../shared/PhoneInput"
import { CountrySelect } from "../shared/CountrySelect"
import { validateSponsorForm } from "../utils/validation"
import type { SponsorRegistrationData, ValidationError } from "../types"
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, CreditCard, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface SponsorRegisterProps {
  onBack?: () => void
  onSuccess?: () => void
  onLogin?: () => void
}

export function SponsorRegister({ onBack, onSuccess, onLogin }: SponsorRegisterProps) {
  const { register, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<Partial<SponsorRegistrationData>>({
    email: "",
    password: "",
    full_name: "",
    id_number: "",
    country: "KE",
    county: "",
    state: "",
    phone: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleChange = (field: keyof SponsorRegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error on change
    setErrors((prev) => prev.filter((e) => e.field !== field))
    clearError()
  }

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    clearError()

    // Validate form
    const validationErrors = validateSponsorForm(formData)

    // Check password match
    if (formData.password !== confirmPassword) {
      validationErrors.push({ field: "confirmPassword", message: "Passwords do not match" })
    }

    // Check terms agreement
    if (!agreeToTerms) {
      validationErrors.push({ field: "terms", message: "You must agree to the terms and conditions" })
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const submitData = {
        ...formData,
        phone: formData.phone && formData.phone.length > 4 ? formData.phone : undefined,
      } as SponsorRegistrationData

      await register(submitData, "sponsor")
      onSuccess?.()
    } catch (err: any) {
      // Error is handled by AuthContext
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-4">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Sponsor Account</h1>
          <p className="text-slate-600 mt-1">Join DestinyPal and start making a difference</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    getFieldError("full_name") ? "border-red-500" : "border-slate-300"
                  }`}
                  disabled={isLoading}
                />
              </div>
              {getFieldError("full_name") && <p className="mt-1 text-sm text-red-500">{getFieldError("full_name")}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    getFieldError("email") ? "border-red-500" : "border-slate-300"
                  }`}
                  disabled={isLoading}
                />
              </div>
              {getFieldError("email") && <p className="mt-1 text-sm text-red-500">{getFieldError("email")}</p>}
            </div>

            {/* ID/Passport Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ID / Passport Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={(e) => handleChange("id_number", e.target.value)}
                  placeholder="Enter your ID or passport number"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    getFieldError("id_number") ? "border-red-500" : "border-slate-300"
                  }`}
                  disabled={isLoading}
                />
              </div>
              {getFieldError("id_number") && <p className="mt-1 text-sm text-red-500">{getFieldError("id_number")}</p>}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number <span className="text-slate-400">(Optional)</span>
              </label>
              <PhoneInput
                value={formData.phone || ""}
                onChange={(value) => handleChange("phone", value)}
                defaultCountryCode={formData.country || "KE"}
                error={getFieldError("phone")}
                disabled={isLoading}
              />
            </div>

            {/* Country & Region */}
            <CountrySelect
              countryValue={formData.country || ""}
              regionValue={formData.country === "KE" ? formData.county : formData.state}
              onCountryChange={(value) => handleChange("country", value)}
              onRegionChange={(value) => {
                if (formData.country === "KE") {
                  handleChange("county", value)
                } else {
                  handleChange("state", value)
                }
              }}
              countryError={getFieldError("country")}
              regionError={getFieldError("county") || getFieldError("state")}
              required
              disabled={isLoading}
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    getFieldError("password") ? "border-red-500" : "border-slate-300"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {getFieldError("password") && <p className="mt-1 text-sm text-red-500">{getFieldError("password")}</p>}
              <PasswordStrengthMeter password={formData.password || ""} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((prev) => prev.filter((e) => e.field !== "confirmPassword"))
                  }}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    getFieldError("confirmPassword") ? "border-red-500" : "border-slate-300"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {getFieldError("confirmPassword") && (
                <p className="mt-1 text-sm text-red-500">{getFieldError("confirmPassword")}</p>
              )}
              {confirmPassword && formData.password === confirmPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked)
                    setErrors((prev) => prev.filter((e) => e.field !== "terms"))
                  }}
                  className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {getFieldError("terms") && <p className="mt-1 text-sm text-red-500">{getFieldError("terms")}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
