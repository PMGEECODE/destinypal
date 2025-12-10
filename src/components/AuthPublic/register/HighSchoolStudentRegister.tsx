"use client"

import React, { useState } from "react"
import { useAuth } from "../AuthContext"
import { PasswordStrengthMeter } from "../shared/PasswordStrengthMeter"
import { PhoneInput } from "../shared/PhoneInput"
import { CountrySelect } from "../shared/CountrySelect"
import { InstitutionSelect } from "../shared/InstitutionSelect"
import { validateHighSchoolStudentForm } from "../utils/validation"
import { FORM_LEVELS, GENDERS, GUARDIAN_RELATIONSHIPS } from "../constants"
import type { HighSchoolStudentRegistrationData, ValidationError } from "../types"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Calendar,
  School,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  Hash,
} from "lucide-react"

interface HighSchoolStudentRegisterProps {
  onBack?: () => void
  onSuccess?: () => void
  onLogin?: () => void
}

type Step = 1 | 2 | 3

export function HighSchoolStudentRegister({ onBack, onSuccess, onLogin }: HighSchoolStudentRegisterProps) {
  const { register, isLoading, error, clearError } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  const [formData, setFormData] = useState<Partial<HighSchoolStudentRegistrationData>>({
    email: "",
    password: "",
    full_name: "",
    date_of_birth: "",
    gender: undefined,
    form_level: undefined,
    institution_id: "",
    school_name: "",
    school_county: "",
    country: "KE",
    county: "",
    admission_number: "",
    parent_guardian_name: "",
    parent_guardian_phone: "",
    parent_guardian_email: "",
    parent_guardian_relationship: undefined,
    phone: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleChange = (field: keyof HighSchoolStudentRegistrationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => prev.filter((e) => e.field !== field))
    clearError()
  }

  const handleInstitutionChange = (institutionId: string, institutionName: string) => {
    setFormData((prev) => ({
      ...prev,
      institution_id: institutionId,
      school_name: institutionName,
    }))
    setErrors((prev) => prev.filter((e) => e.field !== "institution_id" && e.field !== "school_name"))
    clearError()
  }

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message
  }

  const validateStep = (step: Step): boolean => {
    const stepErrors: ValidationError[] = []

    if (step === 1) {
      if (!formData.full_name?.trim()) {
        stepErrors.push({ field: "full_name", message: "Full name is required" })
      }
      if (!formData.date_of_birth) {
        stepErrors.push({ field: "date_of_birth", message: "Date of birth is required" })
      }
      if (!formData.gender) {
        stepErrors.push({ field: "gender", message: "Gender is required" })
      }
      if (!formData.form_level) {
        stepErrors.push({ field: "form_level", message: "Form level is required" })
      }
      if (!formData.institution_id?.trim()) {
        stepErrors.push({ field: "institution_id", message: "Please select your school from the list" })
      }
    }

    if (step === 2) {
      if (!formData.parent_guardian_name?.trim()) {
        stepErrors.push({ field: "parent_guardian_name", message: "Parent/Guardian name is required" })
      }
      if (!formData.parent_guardian_phone?.trim()) {
        stepErrors.push({ field: "parent_guardian_phone", message: "Parent/Guardian phone is required" })
      }
      if (!formData.parent_guardian_relationship) {
        stepErrors.push({ field: "parent_guardian_relationship", message: "Relationship is required" })
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

    const validationErrors = validateHighSchoolStudentForm(formData)

    if (!formData.institution_id?.trim()) {
      validationErrors.push({ field: "institution_id", message: "Please select your school from the list" })
    }

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
      await register(formData as HighSchoolStudentRegistrationData, "student")
      onSuccess?.()
    } catch (err) {
      // Error handled by context
    }
  }

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Parent/Guardian" },
    { number: 3, title: "Account Setup" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-xl mx-auto">
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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4">
            <School className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">High School Registration</h1>
          <p className="text-slate-600 mt-1">Form 1 - Form 4 Student</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.number ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
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
                <div className={`w-12 h-0.5 ${currentStep > step.number ? "bg-green-600" : "bg-slate-200"}`} />
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
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h2>

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
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getFieldError("full_name") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("full_name") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("full_name")}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange("date_of_birth", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getFieldError("date_of_birth") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("date_of_birth") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("date_of_birth")}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      getFieldError("gender") ? "border-red-500" : "border-slate-300"
                    }`}
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError("gender") && <p className="mt-1 text-sm text-red-500">{getFieldError("gender")}</p>}
                </div>

                {/* Form Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Form Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.form_level || ""}
                    onChange={(e) => handleChange("form_level", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      getFieldError("form_level") ? "border-red-500" : "border-slate-300"
                    }`}
                  >
                    <option value="">Select your form</option>
                    {FORM_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError("form_level") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("form_level")}</p>
                  )}
                </div>

                <InstitutionSelect
                  value={formData.institution_id || ""}
                  onChange={handleInstitutionChange}
                  institutionType="secondary_school"
                  error={getFieldError("institution_id")}
                  label="Secondary School"
                  placeholder="Search and select your school"
                  required
                />

                {/* Info notice about institution requirement */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Your school must be registered in our system before you can apply. If your
                    school is not listed, please ask your school administrator to register first.
                  </p>
                </div>

                {/* School County */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    School County <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.school_county}
                    onChange={(e) => handleChange("school_county", e.target.value)}
                    placeholder="County where school is located"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Admission Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admission Number <span className="text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.admission_number}
                      onChange={(e) => handleChange("admission_number", e.target.value)}
                      placeholder="Your school admission number"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Country & Region */}
                <CountrySelect
                  countryValue={formData.country || "KE"}
                  regionValue={formData.county}
                  onCountryChange={(value) => handleChange("country", value)}
                  onRegionChange={(value) => handleChange("county", value)}
                  countryError={getFieldError("country")}
                  required
                />
              </div>
            )}

            {/* Step 2: Parent/Guardian Information */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Parent/Guardian Information</h2>
                <p className="text-sm text-slate-600 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  As a minor, we require your parent or guardian's information for verification and communication
                  purposes.
                </p>

                {/* Parent/Guardian Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent/Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.parent_guardian_name}
                      onChange={(e) => handleChange("parent_guardian_name", e.target.value)}
                      placeholder="Enter parent/guardian name"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getFieldError("parent_guardian_name") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("parent_guardian_name") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("parent_guardian_name")}</p>
                  )}
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.parent_guardian_relationship || ""}
                    onChange={(e) => handleChange("parent_guardian_relationship", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      getFieldError("parent_guardian_relationship") ? "border-red-500" : "border-slate-300"
                    }`}
                  >
                    <option value="">Select relationship</option>
                    {GUARDIAN_RELATIONSHIPS.map((rel) => (
                      <option key={rel.value} value={rel.value}>
                        {rel.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError("parent_guardian_relationship") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("parent_guardian_relationship")}</p>
                  )}
                </div>

                {/* Parent/Guardian Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent/Guardian Phone <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={formData.parent_guardian_phone || ""}
                    onChange={(value) => handleChange("parent_guardian_phone", value)}
                    defaultCountryCode={formData.country || "KE"}
                    error={getFieldError("parent_guardian_phone")}
                  />
                </div>

                {/* Parent/Guardian Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent/Guardian Email <span className="text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.parent_guardian_email}
                      onChange={(e) => handleChange("parent_guardian_email", e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Student Phone (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your Phone Number <span className="text-slate-400">(Optional)</span>
                  </label>
                  <PhoneInput
                    value={formData.phone || ""}
                    onChange={(value) => handleChange("phone", value)}
                    defaultCountryCode={formData.country || "KE"}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Account Setup - Keep existing code */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Account Setup</h2>

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
                      placeholder="your@email.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getFieldError("password") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getFieldError("confirmPassword") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {getFieldError("confirmPassword") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("confirmPassword")}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 border-slate-300 rounded text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600">
                    I agree to the{" "}
                    <a href="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </a>
                    . I confirm that my parent/guardian has consented to my registration.
                  </label>
                </div>
                {getFieldError("terms") && <p className="text-sm text-red-500">{getFieldError("terms")}</p>}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-green-600 font-medium hover:underline">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
