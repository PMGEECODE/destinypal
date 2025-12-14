"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { PasswordStrengthMeter } from "../shared/PasswordStrengthMeter";
import { PhoneInput } from "../shared/PhoneInput";
import { CountrySelect } from "../shared/CountrySelect";
import { validateSponsorForm } from "../utils/validation";
import type { SponsorRegistrationData, ValidationError } from "../types";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
  Heart,
  Menu,
  X,
} from "lucide-react";

interface SponsorRegisterProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export function SponsorRegister({ onSuccess, onLogin }: SponsorRegisterProps) {
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<Partial<SponsorRegistrationData>>({
    email: "",
    password: "",
    full_name: "",
    id_number: "",
    country: "KE",
    county: "",
    state: "",
    phone: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleChange = (
    field: keyof SponsorRegistrationData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
    clearError();
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    clearError();

    const validationErrors = validateSponsorForm(formData);

    if (formData.password !== confirmPassword) {
      validationErrors.push({
        field: "confirmPassword",
        message: "Passwords do not match",
      });
    }

    if (!agreeToTerms) {
      validationErrors.push({
        field: "terms",
        message: "You must agree to the terms and conditions",
      });
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const submitData = {
        ...formData,
        phone:
          formData.phone && formData.phone.length > 4
            ? formData.phone
            : undefined,
      } as SponsorRegistrationData;

      await register(submitData, "sponsor");
      onSuccess?.();
    } catch (err: any) {
      // Error is handled by AuthContext
    }
  };

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
            <p className="text-yellow-400 text-xs md:text-sm mb-2">
              Create Your Account
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
              Become a Sponsor
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
              Join DestinyPal and start making a real difference in students'
              lives through education.
            </p>
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
              {/* Full Name & Email Row */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleChange("full_name", e.target.value)
                      }
                      placeholder="John Doe"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                        getFieldError("full_name")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {getFieldError("full_name") && (
                    <p className="mt-1 text-sm text-red-500">
                      {getFieldError("full_name")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@example.com"
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
              </div>

              {/* ID & Phone Row */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ID / Passport Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.id_number}
                      onChange={(e) =>
                        handleChange("id_number", e.target.value)
                      }
                      placeholder="12345678"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-shadow text-sm ${
                        getFieldError("id_number")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {getFieldError("id_number") && (
                    <p className="mt-1 text-sm text-red-500">
                      {getFieldError("id_number")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number{" "}
                    <span className="text-slate-400">(Optional)</span>
                  </label>
                  <PhoneInput
                    value={formData.phone || ""}
                    onChange={(value) => handleChange("phone", value)}
                    defaultCountryCode={formData.country || "KE"}
                    error={getFieldError("phone")}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Country & Region */}
              <CountrySelect
                countryValue={formData.country || ""}
                regionValue={
                  formData.country === "KE" ? formData.county : formData.state
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
                regionError={getFieldError("county") || getFieldError("state")}
                required
                disabled={isLoading}
              />

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
                      onChange={(e) => handleChange("password", e.target.value)}
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
                  <PasswordStrengthMeter password={formData.password || ""} />
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
                          prev.filter((err) => err.field !== "confirmPassword")
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
                  {confirmPassword && formData.password === confirmPassword && (
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-yellow-400 font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Sponsor Account"
                )}
              </button>
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
