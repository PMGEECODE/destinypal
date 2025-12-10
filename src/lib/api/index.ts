// Main API module - Re-exports all stores and types for backward compatibility

// Re-export client utilities
export { apiClient, ApiError, API_BASE_URL } from "./client"

// Re-export all types
export * from "./types"

// Re-export all stores
export { authStore } from "./authStore"
export { userStore } from "./userStore"
export { studentStore } from "./studentStore"
export { institutionStore } from "./institutionStore"
export { sponsorStore } from "./sponsorStore"
export { paymentStore } from "./paymentStore"
export { statsStore } from "./statsStore"

// Re-export store filter types
export type { StudentFilters, StudentSponsorship } from "./studentStore"
export type { InstitutionFilters } from "./institutionStore"
export type { SponsorFilters } from "./sponsorStore"
export type { DonationFilters } from "./paymentStore"
export type { AdminDashboardStats, TimeRangeParams } from "./statsStore"

// Convenience namespace for grouped access
export const api = {
  auth: () => import("./authStore").then((m) => m.authStore),
  users: () => import("./userStore").then((m) => m.userStore),
  students: () => import("./studentStore").then((m) => m.studentStore),
  institutions: () => import("./institutionStore").then((m) => m.institutionStore),
  sponsors: () => import("./sponsorStore").then((m) => m.sponsorStore),
  payments: () => import("./paymentStore").then((m) => m.paymentStore),
  stats: () => import("./statsStore").then((m) => m.statsStore),
}
