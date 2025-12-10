"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type {
  AuthContextValue,
  AuthState,
  AuthUser,
  UserProfile,
  UserRole,
  TwoFactorMethod,
  VerificationMethod,
  SponsorRegistrationData,
  InstitutionRegistrationData,
  HighSchoolStudentRegistrationData,
  UniversityStudentRegistrationData,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  pendingVerification: null,
  error: null,
}

interface ExtendedAuthContextValue extends AuthContextValue {
  twoFactorRequired: boolean
  twoFactorMethod: TwoFactorMethod | null
}

const AuthContext = createContext<ExtendedAuthContextValue | undefined>(undefined)

// Generate cryptographically secure random string
function generateSecureRandom(length = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Generate backup codes for 2FA
function generateBackupCodes(count = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = generateSecureRandom(4).toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`)
  }
  return codes
}

function extractErrorMessage(data: unknown): string {
  if (typeof data === "string") {
    return data
  }
  if (data && typeof data === "object") {
    // Handle FastAPI validation errors
    if ("detail" in data) {
      const detail = (data as { detail: unknown }).detail
      if (typeof detail === "string") {
        return detail
      }
      // Handle array of validation errors
      if (Array.isArray(detail)) {
        return detail
          .map((err: { msg?: string; message?: string; loc?: string[] }) => {
            const field = err.loc ? err.loc.slice(-1)[0] : "field"
            return `${field}: ${err.msg || err.message || "Invalid value"}`
          })
          .join(", ")
      }
      // Handle object detail
      if (typeof detail === "object") {
        return JSON.stringify(detail)
      }
    }
    // Handle message field
    if ("message" in data && typeof (data as { message: unknown }).message === "string") {
      return (data as { message: string }).message
    }
    // Handle error field
    if ("error" in data && typeof (data as { error: unknown }).error === "string") {
      return (data as { error: string }).error
    }
  }
  return "An unexpected error occurred"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod | null>(null)
  const [tempUserId, setTempUserId] = useState<string | null>(null)

  const fetchUserWithProfile = useCallback(async (): Promise<{
    user: AuthUser
    profile: UserProfile | null
  } | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        email_verified: data.email_verified,
        phone_verified: data.phone_verified,
        two_factor_enabled: data.two_factor_enabled,
        two_factor_method: data.two_factor_method,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        user_metadata: {},
      }

      // Extract profile from the response (backend returns UserWithProfile)
      const profile: UserProfile | null = data.profile || null

      return { user: authUser, profile }
    } catch (error) {
      console.error("Error fetching user with profile:", error)
      return null
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await fetchUserWithProfile()

        if (!result) {
          setState({
            ...initialState,
            isLoading: false,
          })
          return
        }

        setState({
          user: result.user,
          profile: result.profile,
          isLoading: false,
          isAuthenticated: true,
          pendingVerification: null,
          error: null,
        })
      } catch (error: unknown) {
        // Not authenticated or token expired
        setState({
          ...initialState,
          isLoading: false,
        })
      }
    }

    initAuth()
  }, [fetchUserWithProfile])

  const login = async (email: string, password: string): Promise<{ requiresTwoFactor: boolean }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(extractErrorMessage(data))
      }

      // Check if 2FA is required
      if (data.requires_two_factor) {
        setTwoFactorRequired(true)
        setTwoFactorMethod(data.two_factor_method || "email")
        setTempUserId(data.user_id)

        setState((prev) => ({
          ...prev,
          isLoading: false,
          pendingVerification: {
            type: "2fa",
            destination: data.two_factor_method === "email" ? email : data.phone || "",
          },
        }))

        return { requiresTwoFactor: true }
      }

      const result = await fetchUserWithProfile()

      if (!result) {
        throw new Error("Failed to fetch user profile after login")
      }

      setState({
        user: result.user,
        profile: result.profile,
        isLoading: false,
        isAuthenticated: true,
        pendingVerification: null,
        error: null,
      })

      return { requiresTwoFactor: false }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const register = async (
    data:
      | SponsorRegistrationData
      | InstitutionRegistrationData
      | HighSchoolStudentRegistrationData
      | UniversityStudentRegistrationData,
    role: UserRole,
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      let endpoint = ""
      let requestBody: Record<string, unknown> = {}

      // Determine endpoint and build request body based on role and data type
      if (role === "institution" && "institution_name" in data) {
        endpoint = "/auth/register/institution"
        const instData = data as InstitutionRegistrationData
        requestBody = {
          email: instData.email,
          password: instData.password,
          institution_name: instData.institution_name,
          institution_type: instData.institution_type,
          country: instData.country || "KE",
          county: instData.county || null,
          state: instData.state || null,
          address: instData.address || "Not provided",
          city: instData.city || "Unknown",
          postal_code: instData.postal_code || null,
          contact_person_name: instData.contact_person_name,
          contact_person_title: instData.contact_person_title || null,
          contact_person_email: instData.contact_person_email,
          contact_person_phone: instData.contact_person_phone || "Not provided",
          website: instData.website || null,
        }
      } else if (role === "sponsor" && "full_name" in data && !("form_level" in data) && !("university_name" in data)) {
        endpoint = "/auth/register/sponsor"
        const sponsorData = data as SponsorRegistrationData
        requestBody = {
          email: sponsorData.email,
          password: sponsorData.password,
          full_name: sponsorData.full_name,
          id_number: sponsorData.id_number || null,
          phone: sponsorData.phone && sponsorData.phone.length > 4 ? sponsorData.phone : null,
          country: sponsorData.country,
          county: sponsorData.county || null,
          state: sponsorData.state || null,
        }
      } else if (role === "student" && "form_level" in data) {
        // High school student registration
        endpoint = "/auth/register/student"
        const hsData = data as HighSchoolStudentRegistrationData
        requestBody = {
          email: hsData.email,
          password: hsData.password,
          full_name: hsData.full_name,
          date_of_birth: hsData.date_of_birth,
          gender: hsData.gender,
          institution_id: hsData.institution_id, // Required - selected institution UUID
          grade_level: hsData.form_level, // Map form_level to grade_level
          location: hsData.school_county || hsData.county || null, // Map to location
          phone: hsData.phone && hsData.phone.length > 4 ? hsData.phone : null,
          // Optional profile fields
          background_story: null,
          family_situation: `Guardian: ${hsData.parent_guardian_name} (${hsData.parent_guardian_relationship}), Phone: ${hsData.parent_guardian_phone}${hsData.parent_guardian_email ? `, Email: ${hsData.parent_guardian_email}` : ""}`,
          academic_performance: hsData.admission_number ? `Admission Number: ${hsData.admission_number}` : null,
        }
      } else if (role === "student" && ("university_name" in data || "student_id" in data)) {
        // University student registration
        endpoint = "/auth/register/student"
        const uniData = data as UniversityStudentRegistrationData
        requestBody = {
          email: uniData.email,
          password: uniData.password,
          full_name: uniData.full_name,
          date_of_birth: uniData.date_of_birth,
          gender: uniData.gender,
          institution_id: uniData.institution_id, // Required - selected institution UUID
          grade_level: uniData.year_of_study, // Map year_of_study to grade_level
          location: uniData.county || uniData.state || null, // Map to location
          phone: uniData.phone,
          // Optional profile fields
          background_story: `Course: ${uniData.course_name}, Faculty: ${uniData.faculty_school || "N/A"}, Expected Graduation: ${uniData.expected_graduation_year || "N/A"}`,
          family_situation: `Emergency Contact: ${uniData.emergency_contact_name} (${uniData.emergency_contact_relationship}), Phone: ${uniData.emergency_contact_phone}`,
          academic_performance: `Student ID: ${uniData.student_id}${uniData.national_id ? `, National ID: ${uniData.national_id}` : ""}`,
        }
      } else {
        throw new Error(`Invalid registration data for role: ${role}`)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(extractErrorMessage(result))
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        pendingVerification: {
          type: "email",
          destination: data.email,
        },
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw new Error(errorMessage)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      setState({
        ...initialState,
        isLoading: false,
      })
      setTwoFactorRequired(false)
      setTwoFactorMethod(null)
      setTempUserId(null)
    } catch (error: unknown) {
      // Reset state even on error
      setState({
        ...initialState,
        isLoading: false,
      })
    }
  }

  // Verify email with token
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(extractErrorMessage(data))
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        pendingVerification: null,
        user: prev.user ? { ...prev.user, email_verified: true } : null,
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Verify SMS code
  const verifySMS = async (code: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const phone = state.pendingVerification?.destination
      if (!phone) {
        throw new Error("No phone number pending verification")
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(extractErrorMessage(data))
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        pendingVerification: null,
        user: prev.user ? { ...prev.user, phone_verified: true } : null,
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const verifyTwoFactor = async (code: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      if (!tempUserId) {
        throw new Error("No 2FA verification pending")
      }

      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, user_id: tempUserId }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(extractErrorMessage(data))
      }

      const result = await fetchUserWithProfile()

      if (!result) {
        throw new Error("Failed to fetch user profile after 2FA verification")
      }

      setTwoFactorRequired(false)
      setTwoFactorMethod(null)
      setTempUserId(null)

      setState({
        user: result.user,
        profile: result.profile,
        isLoading: false,
        isAuthenticated: true,
        pendingVerification: null,
        error: null,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Send password reset email
  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(`${API_BASE_URL}/auth/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(extractErrorMessage(data))
      }

      setState((prev) => ({ ...prev, isLoading: false }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(extractErrorMessage(data))
      }

      setState((prev) => ({ ...prev, isLoading: false }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Send verification code via email or SMS
  const sendVerificationCode = async (method: VerificationMethod, destination: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, destination }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(extractErrorMessage(data))
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
      throw error
    }
  }

  const setupTwoFactor = async (method: TwoFactorMethod): Promise<{ backupCodes: string[] }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(extractErrorMessage(data))
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        user: prev.user
          ? {
              ...prev.user,
              two_factor_enabled: true,
              two_factor_method: method,
            }
          : null,
      }))

      return { backupCodes: data.backup_codes || generateBackupCodes() }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const disableTwoFactor = async (code: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(extractErrorMessage(data))
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        user: prev.user
          ? {
              ...prev.user,
              two_factor_enabled: false,
              two_factor_method: undefined,
            }
          : null,
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Login with OAuth - Not supported with FastAPI backend currently
  const loginWithOAuth = async (provider: "google" | "github"): Promise<void> => {
    throw new Error(`OAuth login with ${provider} is not yet implemented in the FastAPI backend`)
  }

  // Resend verification email/SMS
  const resendVerification = async (): Promise<void> => {
    try {
      const pending = state.pendingVerification
      if (!pending) {
        throw new Error("No pending verification")
      }

      await sendVerificationCode(pending.type === "sms" ? "sms" : "email", pending.destination)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : extractErrorMessage(error)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const value: ExtendedAuthContextValue = {
    ...state,
    twoFactorRequired,
    twoFactorMethod,
    login,
    register,
    logout,
    verifyEmail,
    verifySMS,
    verifyTwoFactor,
    sendPasswordReset,
    resetPassword,
    sendVerificationCode,
    setupTwoFactor,
    disableTwoFactor,
    loginWithOAuth,
    resendVerification,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): ExtendedAuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
