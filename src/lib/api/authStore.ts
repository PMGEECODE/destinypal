// Authentication API endpoints

import { apiClient } from "./client"
import type {
  UserProfile,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
} from "./types"

export const authStore = {
  // Login user
  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials)
  },

  // Register user
  register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", data)
  },

  // Logout user
  logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/logout")
  },

  // Get current user
  getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/auth/me")
  },

  // Verify email
  verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/verify-email", { token })
  },

  // Resend verification email
  resendVerification(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/resend-verification", { email })
  },

  // Request password reset
  requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/password-reset/request", data)
  },

  // Confirm password reset
  confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/password-reset/confirm", data)
  },

  // Change password (when logged in)
  changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  // Refresh token
  refreshToken(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/refresh")
  },

  // Aliases for backward compatibility
  signUp(data: RegisterData): Promise<AuthResponse> {
    return this.register(data)
  },

  signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.login(credentials)
  },

  signOut(): Promise<{ message: string }> {
    return this.logout()
  },

  sendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.resendVerification(email)
  },

  resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
    return this.confirmPasswordReset(data)
  },

  // 2FA methods (stubs - implement when backend supports)
  setup2FA(): Promise<{ qr_code: string; secret: string }> {
    return apiClient.post<{ qr_code: string; secret: string }>("/auth/2fa/setup")
  },

  verify2FA(code: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/2fa/verify", { code })
  },

  disable2FA(code: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/2fa/disable", { code })
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  },
}
