"use client"

import React, { useState } from "react"
import { useAuth } from "../AuthContext"
import { PasswordStrengthMeter } from "../shared/PasswordStrengthMeter"
import { PhoneInput } from "../shared/PhoneInput"
import { CountrySelect } from "../shared/CountrySelect"
import { InstitutionSelect } from "../shared/InstitutionSelect"
import { validateUniversityStudentForm } from "../utils/validation"
import { UNIVERSITY_YEARS, GENDERS } from "../constants"
import type { UniversityStudentRegistrationData, ValidationError } from "../types"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  Hash,
  CreditCard,
} from "lucide-react"

interface UniversityStudentRegisterProps {
  onBack?: () => void
  onSuccess?: () => void
  onLogin?: () => void
}

type Step = 1 | 2 | 3

export function UniversityStudentRegister({ onBack, onSuccess, onLogin }: UniversityStudentRegisterProps) {
  const { register, isLoading, error, clearError } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  const [formData, setFormData] = useState<Partial<UniversityStudentRegistrationData>>({
    email: "",
    password: "",
    full_name: "",
    date_of_birth: "",
    gender: undefined,
    institution_id: "",
    university_name: "",
    student_id: "",
    course_name: "",
    faculty_school: "",
    year_of_study: undefined,
    expected_graduation_year: undefined,
    country: "KE",
    county: "",
    state: "",
    national_id: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleChange = (field: keyof UniversityStudentRegistrationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => prev.filter((e) => e.field !== field))
    clearError()
  }

  const handleInstitutionChange = (institutionId: string, institutionName: string) => {
    setFormData((prev) => ({
      ...prev,
      institution_id: institutionId,
      university_name: institutionName,
    }))
    setErrors((prev) => prev.filter((e) => e.field !== "institution_id" && e.field !== "university_name"))
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
      if (!formData.phone?.trim()) {
        stepErrors.push({ field: "phone", message: "Phone number is required" })
      }
    }

    if (step === 2) {
      if (!formData.institution_id?.trim()) {
        stepErrors.push({ field: "institution_id", message: "Please select your university/college from the list" })
      }
      if (!formData.student_id?.trim()) {
        stepErrors.push({ field: "student_id", message: "Student ID is required" })
      }
      if (!formData.course_name?.trim()) {
        stepErrors.push({ field: "course_name", message: "Course name is required" })
      }
      if (!formData.year_of_study) {
        stepErrors.push({ field: "year_of_study", message: "Year of study is required" })
      }
      if (!formData.emergency_contact_name?.trim()) {
        stepErrors.push({ field: "emergency_contact_name", message: "Emergency contact name is required" })
      }
      if (!formData.emergency_contact_phone?.trim()) {
        stepErrors.push({ field: "emergency_contact_phone", message: "Emergency contact phone is required" })
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

    const validationErrors = validateUniversityStudentForm(formData)

    if (!formData.institution_id?.trim()) {
      validationErrors.push({ field: "institution_id", message: "Please select your university/college from the list" })
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
      await register(formData as UniversityStudentRegistrationData, "student")
      onSuccess?.()
    } catch (err) {
      // Error handled by context
    }
  }

  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i)

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Academic Details" },
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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-xl mb-4">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">University Registration</h1>
          <p className="text-slate-600 mt-1">Higher Education Student</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.number ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
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
                <div className={`w-12 h-0.5 ${currentStep > step.number ? "bg-emerald-600" : "bg-slate-200"}`} />
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
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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

                {/* National ID (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    National ID <span className="text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => handleChange("national_id", e.target.value)}
                      placeholder="Your national ID number"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={formData.phone || ""}
                    onChange={(value) => handleChange("phone", value)}
                    defaultCountryCode={formData.country || "KE"}
                    error={getFieldError("phone")}
                    required
                  />
                </div>

                {/* Country & Region */}
                <CountrySelect
                  countryValue={formData.country || "KE"}
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
              </div>
            )}

            {/* Step 2: Academic Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Academic Details</h2>

                <InstitutionSelect
                  value={formData.institution_id || ""}
                  onChange={handleInstitutionChange}
                  institutionType="higher_learning"
                  error={getFieldError("institution_id")}
                  label="University/College"
                  placeholder="Search and select your university or college"
                  required
                />

                {/* Info notice about institution requirement */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Your university/college must be registered in our system before you can
                    apply. If your institution is not listed, please ask your institution's administration to register
                    first.
                  </p>
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student ID / Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.student_id}
                      onChange={(e) => handleChange("student_id", e.target.value)}
                      placeholder="Your student ID"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        getFieldError("student_id") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("student_id") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("student_id")}</p>
                  )}
                </div>

                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Course / Program Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.course_name}
                      onChange={(e) => handleChange("course_name", e.target.value)}
                      placeholder="e.g., Bachelor of Science in Computer Science"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        getFieldError("course_name") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("course_name") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("course_name")}</p>
                  )}
                </div>

                {/* Faculty/School */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Faculty / School <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.faculty_school}
                    onChange={(e) => handleChange("faculty_school", e.target.value)}
                    placeholder="e.g., School of Engineering"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Year of Study */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.year_of_study || ""}
                      onChange={(e) => handleChange("year_of_study", e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        getFieldError("year_of_study") ? "border-red-500" : "border-slate-300"
                      }`}
                    >
                      <option value="">Select year</option>
                      {UNIVERSITY_YEARS.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                    {getFieldError("year_of_study") && (
                      <p className="mt-1 text-sm text-red-500">{getFieldError("year_of_study")}</p>
                    )}
                  </div>

                  {/* Expected Graduation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected Graduation</label>
                    <select
                      value={formData.expected_graduation_year || ""}
                      onChange={(e) =>
                        handleChange("expected_graduation_year", Number.parseInt(e.target.value) || undefined)
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      {graduationYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="my-6" />

                <h3 className="text-md font-semibold text-slate-800 mb-4">Emergency Contact</h3>

                {/* Emergency Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Emergency Contact Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                      placeholder="Contact person name"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        getFieldError("emergency_contact_name") ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {getFieldError("emergency_contact_name") && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError("emergency_contact_name")}</p>
                  )}
                </div>

                {/* Emergency Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Emergency Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={formData.emergency_contact_phone || ""}
                    onChange={(value) => handleChange("emergency_contact_phone", value)}
                    defaultCountryCode={formData.country || "KE"}
                    error={getFieldError("emergency_contact_phone")}
                    required
                  />
                </div>

                {/* Emergency Contact Relationship */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relationship <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => handleChange("emergency_contact_relationship", e.target.value)}
                    placeholder="e.g., Parent, Sibling, Spouse"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@university.edu"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                      className="w-4 h-4 mt-0.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-emerald-600 hover:underline">
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
