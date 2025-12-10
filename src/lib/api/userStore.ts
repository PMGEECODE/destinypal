// User management API endpoints

import { apiClient } from "./client"
import type { User, UserProfile, PaginatedResponse, PaginationParams } from "./types"

export interface UserUpdate {
  email?: string
  is_active?: boolean
  is_verified?: boolean
  role?: string
}

export interface ProfileUpdate {
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
}

export const userStore = {
  // Get all users (admin only)
  getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>("/users", params)
  },

  // Get user by ID
  getUserById(userId: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`/users/${userId}`)
  },

  // Update user
  updateUser(userId: string, data: UserUpdate): Promise<User> {
    return apiClient.patch<User>(`/users/${userId}`, data)
  },

  // Delete user
  deleteUser(userId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${userId}`)
  },

  // Activate user
  activateUser(userId: string): Promise<User> {
    return apiClient.post<User>(`/users/${userId}/activate`)
  },

  // Deactivate user
  deactivateUser(userId: string): Promise<User> {
    return apiClient.post<User>(`/users/${userId}/deactivate`)
  },

  // Verify user
  verifyUser(userId: string): Promise<User> {
    return apiClient.post<User>(`/users/${userId}/verify`)
  },

  // Get user activity
  getUserActivity(userId: string): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`/users/${userId}/activity`)
  },

  // Alias for backward compatibility
  getUser(userId: string): Promise<UserProfile> {
    return this.getUserById(userId)
  },

  // Get my profile (current user)
  getMyProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/auth/me")
  },

  // Update my profile
  updateProfile(data: ProfileUpdate): Promise<UserProfile> {
    return apiClient.patch<UserProfile>("/users/me", data)
  },
}
