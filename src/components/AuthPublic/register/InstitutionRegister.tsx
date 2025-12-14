"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { PasswordStrengthMeter } from "../shared/PasswordStrengthMeter";
import { PhoneInput } from "../shared/PhoneInput";
import { CountrySelect } from "../shared/CountrySelect";
import { validateInstitutionForm } from "../utils/validation";
import { INSTITUTION_TYPES } from "../constants";
import type { InstitutionRegistrationData, ValidationError } from "../types";
import {
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
  Heart,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface InstitutionRegisterProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

type Step = 1 | 2 | 3;

export function InstitutionRegister({
  onSuccess,
  onLogin,
}: InstitutionRegisterProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState<
    Partial<InstitutionRegistrationData>
  >({
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
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (
    field: keyof InstitutionRegistrationData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
    clearError();
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  const validateStep = (step: Step): boolean => {
    const stepErrors: ValidationError[] = [];

    if (step === 1) {
      if (!formData.institution_name?.trim()) {
        stepErrors.push({
          field: "institution_name",
          message: "Institution name is required",
        });
      }
      if (!formData.institution_type) {
        stepErrors.push({
          field: "institution_type",
          message: "Institution type is required",
        });
      }
    }

    if (step === 2) {
      if (!formData.country) {
        stepErrors.push({ field: "country", message: "Country is required" });
      }
      if (!formData.address?.trim()) {
        stepErrors.push({ field: "address", message: "Address is required" });
      }
      if (!formData.city?.trim()) {
        stepErrors.push({ field: "city", message: "City is required" });
      }
      if (!formData.contact_person_name?.trim()) {
        stepErrors.push({
          field: "contact_person_name",
          message: "Contact person name is required",
        });
      }
      if (!formData.contact_person_email?.trim()) {
        stepErrors.push({
          field: "contact_person_email",
          message: "Contact email is required",
        });
      }
      if (!formData.contact_person_phone?.trim()) {
        stepErrors.push({
          field: "contact_person_phone",
          message: "Contact phone is required",
        });
      }
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as Step);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    clearError();

    const validationErrors = validateInstitutionForm(formData);

    if (formData.password !== confirmPassword) {
      validationErrors.push({
        field: "confirmPassword",
        message: "Passwords do not match",
      });
    }

    if (!agreeToTerms) {
      validationErrors.push({
        field: "terms",
        message: "You must agree to the terms",
      });
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register(formData as InstitutionRegistrationData, "institution");
      onSuccess?.();
    } catch (err) {
      // Error handled by context
    }
  };

  const steps = [
    { number: 1, title: "Institution Details" },
    { number: 2, title: "Location & Contact" },
    { number: 3, title: "Account Setup" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                DestinyPal
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors"
              >
                About
              </a>
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
              >
                Log In
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <a
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors py-2"
                >
                  Home
                </a>
                <a
                  href="/about"
                  className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors py-2"
                >
                  About
                </a>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 text-sm font-medium rounded-lg transition-colors mt-2"
                >
                  Log In
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-400/10 rounded-xl mb-4">
              <Building2 className="w-7 h-7 text-yellow-400" />
            </div>
            <p className="text-yellow-400 text-xs md:text-sm mb-2">
              Create Your Institution Account
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
              Register Institution
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
              Connect your institution with sponsors and create opportunities
              for students.
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep >= step.number
                          ? "bg-yellow-400 text-slate-900"
                          : "bg-slate-700 text-gray-400"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-sm hidden sm:block ${
                        currentStep >= step.number
                          ? "text-white font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 ${
                        currentStep > step.number
                          ? "bg-yellow-400"
                          : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Institution Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">
                      Institution Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tell us about your institution
                    </p>
                  </div>

                  {/* Institution Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Institution Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.institution_name}
                        onChange={(e) =>
                          handleChange("institution_name", e.target.value)
                        }
                        placeholder="Enter institution name"
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                          getFieldError("institution_name")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {getFieldError("institution_name") && (
                      <p className="mt-1 text-sm text-red-500">
                        {getFieldError("institution_name")}
                      </p>
                    )}
                  </div>

                  {/* Institution Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Institution Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.institution_type || ""}
                      onChange={(e) =>
                        handleChange("institution_type", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                        getFieldError("institution_type")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select institution type</option>
                      {INSTITUTION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {getFieldError("institution_type") && (
                      <p className="mt-1 text-sm text-red-500">
                        {getFieldError("institution_type")}
                      </p>
                    )}
                  </div>

                  {/* Website (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Website <span className="text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                          handleChange("website", e.target.value)
                        }
                        placeholder="https://www.example.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Contact */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">
                      Location & Contact
                    </h2>
                    <p className="text-sm text-gray-600">
                      Where is your institution located?
                    </p>
                  </div>

                  {/* Country & Region */}
                  <CountrySelect
                    countryValue={formData.country || ""}
                    regionValue={
                      formData.country === "KE"
                        ? formData.county
                        : formData.state
                    }
                    onCountryChange={(value) => handleChange("country", value)}
                    onRegionChange={(value) => {
                      if (formData.country === "KE") {
                        handleChange("county", value);
                      } else {
                        handleChange("state", value);
                      }
                    }}
                    countryError={getFieldError("country")}
                    required
                    disabled={isLoading}
                  />

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Enter city"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                        getFieldError("city")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                    />
                    {getFieldError("city") && (
                      <p className="mt-1 text-sm text-red-500">
                        {getFieldError("city")}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        placeholder="Full street address"
                        rows={2}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                          getFieldError("address")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {getFieldError("address") && (
                      <p className="mt-1 text-sm text-red-500">
                        {getFieldError("address")}
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Postal Code{" "}
                      <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) =>
                        handleChange("postal_code", e.target.value)
                      }
                      placeholder="Postal/ZIP code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-semibold text-slate-800 mb-4">
                      Contact Person
                    </h3>

                    {/* Contact Person Name & Title */}
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Person Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.contact_person_name}
                            onChange={(e) =>
                              handleChange(
                                "contact_person_name",
                                e.target.value
                              )
                            }
                            placeholder="Full name"
                            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                              getFieldError("contact_person_name")
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            disabled={isLoading}
                          />
                        </div>
                        {getFieldError("contact_person_name") && (
                          <p className="mt-1 text-sm text-red-500">
                            {getFieldError("contact_person_name")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Title/Position{" "}
                          <span className="text-slate-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.contact_person_title}
                          onChange={(e) =>
                            handleChange("contact_person_title", e.target.value)
                          }
                          placeholder="e.g., Principal"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Contact Email & Phone */}
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.contact_person_email}
                            onChange={(e) =>
                              handleChange(
                                "contact_person_email",
                                e.target.value
                              )
                            }
                            placeholder="contact@institution.com"
                            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                              getFieldError("contact_person_email")
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            disabled={isLoading}
                          />
                        </div>
                        {getFieldError("contact_person_email") && (
                          <p className="mt-1 text-sm text-red-500">
                            {getFieldError("contact_person_email")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                          value={formData.contact_person_phone || ""}
                          onChange={(value) =>
                            handleChange("contact_person_phone", value)
                          }
                          defaultCountryCode={formData.country || "KE"}
                          error={getFieldError("contact_person_phone")}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Account Setup */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">
                      Account Setup
                    </h2>
                    <p className="text-sm text-gray-600">
                      Create your login credentials
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="admin@institution.com"
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                          getFieldError("email")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {getFieldError("email") && (
                      <p className="mt-1 text-sm text-red-500">
                        {getFieldError("email")}
                      </p>
                    )}
                  </div>

                  {/* Password & Confirm Password Row */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          placeholder="••••••••"
                          className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                            getFieldError("password")
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {getFieldError("password") && (
                        <p className="mt-1 text-sm text-red-500">
                          {getFieldError("password")}
                        </p>
                      )}
                      <PasswordStrengthMeter
                        password={formData.password || ""}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrors((prev) =>
                              prev.filter(
                                (err) => err.field !== "confirmPassword"
                              )
                            );
                          }}
                          placeholder="••••••••"
                          className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                            getFieldError("confirmPassword")
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {getFieldError("confirmPassword") && (
                        <p className="mt-1 text-sm text-red-500">
                          {getFieldError("confirmPassword")}
                        </p>
                      )}
                      {confirmPassword &&
                        formData.password === confirmPassword && (
                          <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Passwords match
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => {
                          setAgreeToTerms(e.target.checked);
                          setErrors((prev) =>
                            prev.filter((err) => err.field !== "terms")
                          );
                        }}
                        className="w-4 h-4 mt-1 text-slate-700 border-gray-300 rounded focus:ring-slate-700"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-slate-700 hover:text-slate-800 font-medium"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-slate-700 hover:text-slate-800 font-medium"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {getFieldError("terms") && (
                      <p className="mt-2 text-sm text-red-500">
                        {getFieldError("terms")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 border border-gray-300 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-yellow-400 font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-yellow-400 font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={onLogin}
                className="text-slate-700 hover:text-slate-800 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
