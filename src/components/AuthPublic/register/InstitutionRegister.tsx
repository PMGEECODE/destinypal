"use client"

import React, { useState } from "react"
import { useAuth } from "../AuthContext"
import { PasswordStrengthMeter } from "../shared/PasswordStrengthMeter"
import { PhoneInput } from "../shared/PhoneInput"
import { CountrySelect } from "../shared/CountrySelect"
import { validateInstitutionForm } from "../utils/validation"
import { INSTITUTION_TYPES } from "../constants"
import type { InstitutionRegistrationData, ValidationError } from "../types"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  MapPin,
  User,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface InstitutionRegisterProps {
  onBack?: () => void
  onSuccess?: () => void
  onLogin?: () => void
}

type Step = 1 | 2 | 3

export function InstitutionRegister({ onBack, onSuccess, onLogin }: InstitutionRegisterProps) {
  const { register, isLoading, error, clearError } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  const [formData, setFormData] = useState<Partial<InstitutionRegistrationData>>({
    email: "",
    password: "",
    institution_name: "",
    institution_type: undefined,
    country: "KE",
    county: "",
    state: "",
    address: "",
    city: "",
    postal_code: "",
    contact_person_name: "",
    contact_person_title: "",
    contact_person_email: "",
    contact_person_phone: "",
    website: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleChange = (field: keyof InstitutionRegistrationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => prev.filter((e) => e.field !== field))
    clearError()
  }

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message
  }

  const validateStep = (step: Step): boolean => {
    const stepErrors: ValidationError[] = []

    if (step === 1) {
      if (!formData.institution_name?.trim()) {
        stepErrors.push({ field: "institution_name", message: "Institution name is required" })
      }
      if (!formData.institution_type) {
        stepErrors.push({ field: "institution_type", message: "Institution type is required" })
      }
    }

    if (step === 2) {
      if (!formData.country) {
        stepErrors.push({ field: "country", message: "Country is required" })
      }
      if (!formData.address?.trim()) {
        stepErrors.push({ field: "address", message: "Address is required" })
      }
      if (!formData.city?.trim()) {
        stepErrors.push({ field: "city", message: "City is required" })
      }
      if (!formData.contact_person_name?.trim()) {
        stepErrors.push({ field: "contact_person_name", message: "Contact person name is required" })
      }
      if (!formData.contact_person_email?.trim()) {
        stepErrors.push({ field: "contact_person_email", message: "Contact email is required" })
      }
      if (!formData.contact_person_phone?.trim()) {
        stepErrors.push({ field: "contact_person_phone", message: "Contact phone is required" })
      }
    }

    setErrors(stepErrors)
    return stepErrors.length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as Step)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    clearError()

    const validationErrors = validateInstitutionForm(formData)

    if (formData.password !== confirmPassword) {
      validationErrors.push({ field: "confirmPassword", message: "Passwords do not match" })
    }

    if (!agreeToTerms) {
      validationErrors.push({ field: "terms", message: "You must agree to the terms" })
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await register(formData as InstitutionRegistrationData, "institution")
      onSuccess?.()
    } catch (err) {
      // Error handled by context
    }
  }

  const steps = [
    { number: 1, title: "Institution Details" },
    { number: 2, title: "Location & Contact" },
    { number: 3, title: "Account Setup" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-xl mb-4">
            <Building2 className="w-7 h-7 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Register Institution</h1>
          <p className="text-slate-600 mt-1">Connect your institution with sponsors</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.number ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                </div>
                <span
                  className={`text-sm hidden sm:block ${
                    currentStep >= step.number ? "text-slate-800 font-medium" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${currentStep > step.number ? "bg-orange-600" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Institution Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Institution Details</h2>

                {/* Institution Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.institution_name}
                      onChange={(e) => handleChange("institution_name", e.target.value)}
                      placeholder="Enter institution name"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("institution_name") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("institution_name") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("institution_name")}</p>
                  )}
                </div>

                {/* Institution Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Institution Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.institution_type || ""}
                    onChange={(e) => handleChange("institution_type", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      getFieldError("institution_type") ? "border-red-500" : "border-slate-300"
                    }`}
                  >
                    <option value="">Select institution type</option>
                    {INSTITUTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError("institution_type") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("institution_type")}</p>
                  )}
                </div>

                {/* Website (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website <span className="text-slate-400"></span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Location & Contact</h2>

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
                  required
                />

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Enter city"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      getFieldError("city") ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {getFieldError("city") && <p className="mt-1 text-sm text-red-500">{getFieldError("city")}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Full street address"
                      rows={2}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("address") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("address") && <p className="mt-1 text-sm text-red-500">{getFieldError("address")}</p>}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Postal Code <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                    placeholder="Postal/ZIP code"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <hr className="my-6" />

                <h3 className="text-md font-semibold text-slate-800 mb-4">Contact Person</h3>

                {/* Contact Person Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.contact_person_name}
                      onChange={(e) => handleChange("contact_person_name", e.target.value)}
                      placeholder="Full name"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("contact_person_name") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("contact_person_name") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("contact_person_name")}</p>
                  )}
                </div>

                {/* Contact Person Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title/Position <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person_title}
                    onChange={(e) => handleChange("contact_person_title", e.target.value)}
                    placeholder="e.g., Principal, Administrator"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.contact_person_email}
                      onChange={(e) => handleChange("contact_person_email", e.target.value)}
                      placeholder="contact@institution.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("contact_person_email") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("contact_person_email") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("contact_person_email")}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={formData.contact_person_phone || ""}
                    onChange={(value) => handleChange("contact_person_phone", value)}
                    defaultCountryCode={formData.country || "KE"}
                    error={getFieldError("contact_person_phone")}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Account Setup */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Account Setup</h2>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Account Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="admin@institution.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("email") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("email") && <p className="mt-1 text-sm text-red-500">{getFieldError("email")}</p>}
                </div>

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
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("password") ? "border-red-500" : "border-slate-300"
                      }`}
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
                  {getFieldError("password") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("password")}</p>
                  )}
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
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        getFieldError("confirmPassword") ? "border-red-500" : "border-slate-300"
                      }`}
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
                      className="w-4 h-4 mt-0.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the{" "}
                      <a href="#" className="text-orange-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-orange-600 hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {getFieldError("terms") && <p className="mt-1 text-sm text-red-500">{getFieldError("terms")}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Institution Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
