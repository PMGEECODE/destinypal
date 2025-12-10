/**
 * FastAPI Backend API Client
 * Uses secure HttpOnly cookies for authentication - NO localStorage
 * All sponsor-related endpoints require authentication with credentials
 *
 * This file maintains backward compatibility while using the new modular store structure.
 * For new code, prefer importing directly from the stores:
 * - import { authStore } from "@/lib/api/authStore"
 * - import { sponsorStore } from "@/lib/api/sponsorStore"
 * etc.
 */

// Re-export all types from the centralized types file
export * from "./api/types"

// Re-export the API client and error class
export { apiClient, ApiError, API_BASE_URL } from "./api/client"

// Re-export all stores for direct usage
export { authStore } from "./api/authStore"
export { userStore } from "./api/userStore"
export { studentStore } from "./api/studentStore"
export { institutionStore } from "./api/institutionStore"
export { sponsorStore } from "./api/sponsorStore"
export { paymentStore } from "./api/paymentStore"
export { statsStore } from "./api/statsStore"

// Re-export store filter types
export type { StudentFilters } from "./api/studentStore"
export type { InstitutionFilters } from "./api/institutionStore"
export type { SponsorFilters } from "./api/sponsorStore"
export type { DonationFilters } from "./api/paymentStore"
export type { AdminDashboardStats as AdminStats, TimeRangeParams } from "./api/statsStore"

// Import stores for the legacy ApiClient wrapper
import { authStore } from "./api/authStore"
import { userStore } from "./api/userStore"
import { studentStore } from "./api/studentStore"
import { institutionStore } from "./api/institutionStore"
import { sponsorStore } from "./api/sponsorStore"
import { paymentStore } from "./api/paymentStore"
import { statsStore } from "./api/statsStore"

export type { SponsorshipDetail } from "./api/types"

// ============ LEGACY API CLIENT CLASS (thin wrapper for backward compatibility) ============

class ApiClient {
  // Auth - delegate to authStore
  signUp = authStore.signUp.bind(authStore)
  signIn = authStore.signIn.bind(authStore)
  signOut = authStore.signOut.bind(authStore)
  getCurrentUser = authStore.getCurrentUser.bind(authStore)
  sendVerificationEmail = authStore.sendVerificationEmail.bind(authStore)
  verifyEmail = authStore.verifyEmail.bind(authStore)
  requestPasswordReset = authStore.requestPasswordReset.bind(authStore)
  resetPassword = authStore.resetPassword.bind(authStore)
  changePassword = authStore.changePassword.bind(authStore)
  setup2FA = authStore.setup2FA.bind(authStore)
  verify2FA = authStore.verify2FA.bind(authStore)
  disable2FA = authStore.disable2FA.bind(authStore)
  isAuthenticated = authStore.isAuthenticated.bind(authStore)

  // User - delegate to userStore
  getMyProfile = userStore.getMyProfile.bind(userStore)
  updateProfile = userStore.updateProfile.bind(userStore)
  getUser = userStore.getUser.bind(userStore)
  getUsers = userStore.getUsers.bind(userStore)

  // Student - delegate to studentStore
  getStudents = studentStore.getStudents.bind(studentStore)
  getStudent = studentStore.getStudent.bind(studentStore)
  createStudent = studentStore.createStudent.bind(studentStore)
  updateStudent = studentStore.updateStudent.bind(studentStore)
  deleteStudent = studentStore.deleteStudent.bind(studentStore)
  getStudentFeeBalance = sponsorStore.getStudentFeeBalance.bind(sponsorStore)
  getStudentPaymentAccounts = studentStore.getStudentPaymentAccounts.bind(studentStore)
  getUnsponsoredStudents = studentStore.getUnsponsoredStudents.bind(studentStore)

  // Institution - delegate to institutionStore
  getInstitutions = institutionStore.getInstitutions.bind(institutionStore)
  getInstitution = institutionStore.getInstitution.bind(institutionStore)
  getMyInstitution = institutionStore.getMyInstitution.bind(institutionStore)
  createInstitution = institutionStore.createInstitution.bind(institutionStore)
  updateInstitution = institutionStore.updateInstitution.bind(institutionStore)

  // Sponsor - delegate to sponsorStore (all require authentication)
  getSponsors = sponsorStore.getSponsors.bind(sponsorStore)
  getSponsor = sponsorStore.getSponsor.bind(sponsorStore)
  createSponsor = sponsorStore.createSponsor.bind(sponsorStore)
  updateSponsor = sponsorStore.updateSponsor.bind(sponsorStore)
  getMySponsorships = sponsorStore.getMySponsorships.bind(sponsorStore)
  getStudentsInNeed = sponsorStore.getStudentsInNeed.bind(sponsorStore)
  createSponsorship = sponsorStore.createSponsorship.bind(sponsorStore)
  getSponsorships = sponsorStore.getSponsorships.bind(sponsorStore)
  updateSponsorship = sponsorStore.updateSponsorship.bind(sponsorStore)

  // Payment - delegate to paymentStore
  getDonations = paymentStore.getDonations.bind(paymentStore)
  createDonation = paymentStore.createDonation.bind(paymentStore)
  initiatePayment = paymentStore.initiatePayment.bind(paymentStore)
  processMpesaPayment = paymentStore.processMpesaPayment.bind(paymentStore)
  processAirtelPayment = paymentStore.processAirtelPayment.bind(paymentStore)
  processCardPayment = paymentStore.processCardPayment.bind(paymentStore)
  checkPaymentStatus = paymentStore.checkPaymentStatus.bind(paymentStore)
  getTransaction = paymentStore.getTransaction.bind(paymentStore)

  // Stats - delegate to statsStore
  getImpactStats = statsStore.getImpactStats.bind(statsStore)
  getAdminDashboardStats = statsStore.getAdminDashboardStats.bind(statsStore)
  getInstitutionDashboardStats = statsStore.getInstitutionDashboardStats.bind(statsStore)
}

// Export singleton instance for backward compatibility
export const api = new ApiClient()
