// Payment and donation API endpoints

import { apiClient, API_BASE_URL } from "./client"
import type { Donation, DonationCreate, PaymentIntentResponse, PaginatedResponse, PaginationParams } from "./types"

export interface DonationFilters extends PaginationParams {
  status?: string
  student_id?: string
  sponsor_id?: string
  start_date?: string
  end_date?: string
}

export interface MpesaPaymentRequest {
  phone_number: string
  amount: number
  student_id?: string
  description?: string
}

export interface AirtelPaymentRequest {
  phone_number: string
  amount: number
  student_id?: string
  description?: string
}

export interface CardPaymentRequest {
  amount: number
  currency: string
  student_id?: string
  payment_method_id?: string
}

export const paymentStore = {
  // Donations
  getDonations(params?: DonationFilters): Promise<PaginatedResponse<Donation>> {
    return apiClient.get<PaginatedResponse<Donation>>("/donations", params)
  },

  getDonationById(donationId: string): Promise<Donation> {
    return apiClient.get<Donation>(`/donations/${donationId}`)
  },

  getMyDonations(params?: PaginationParams): Promise<PaginatedResponse<Donation>> {
    return apiClient.get<PaginatedResponse<Donation>>("/donations/me", params)
  },

  createDonation(data: DonationCreate): Promise<Donation> {
    return apiClient.post<Donation>("/donations", data)
  },

  // Payment intents (Stripe integration)
  createPaymentIntent(amount: number, currency: string, studentId?: string): Promise<PaymentIntentResponse> {
    return apiClient.post<PaymentIntentResponse>("/payments/create-intent", {
      amount,
      currency,
      student_id: studentId,
    })
  },

  confirmPayment(paymentIntentId: string): Promise<{ success: boolean; donation?: Donation }> {
    return apiClient.post<{ success: boolean; donation?: Donation }>("/payments/confirm", {
      payment_intent_id: paymentIntentId,
    })
  },

  // Get payment methods
  getPaymentMethods(): Promise<{ id: string; type: string; last4?: string; brand?: string }[]> {
    return apiClient.get("/payments/methods")
  },

  addPaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    return apiClient.post("/payments/methods", { payment_method_id: paymentMethodId })
  },

  removePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    return apiClient.delete(`/payments/methods/${paymentMethodId}`)
  },

  setDefaultPaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    return apiClient.post(`/payments/methods/${paymentMethodId}/default`)
  },

  // Refunds
  requestRefund(donationId: string, reason?: string): Promise<{ message: string }> {
    return apiClient.post(`/donations/${donationId}/refund`, { reason })
  },

  // Transaction history
  getTransactionHistory(params?: PaginationParams): Promise<
    PaginatedResponse<{
      id: string
      type: string
      amount: number
      currency: string
      status: string
      created_at: string
      description?: string
    }>
  > {
    return apiClient.get("/payments/transactions", params)
  },

  // Download receipt
  getReceipt(donationId: string): Promise<Blob> {
    return fetch(`${API_BASE_URL}/donations/${donationId}/receipt`, {
      credentials: "include",
    }).then((res) => res.blob())
  },

  // Initiate payment (alias for createPaymentIntent)
  initiatePayment(amount: number, currency: string, studentId?: string): Promise<PaymentIntentResponse> {
    return this.createPaymentIntent(amount, currency, studentId)
  },

  // M-Pesa payment
  processMpesaPayment(data: MpesaPaymentRequest): Promise<{ checkout_request_id: string; message: string }> {
    return apiClient.post("/payments/mpesa/initiate", data)
  },

  // Airtel Money payment
  processAirtelPayment(data: AirtelPaymentRequest): Promise<{ transaction_id: string; message: string }> {
    return apiClient.post("/payments/airtel/initiate", data)
  },

  // Card payment
  processCardPayment(data: CardPaymentRequest): Promise<PaymentIntentResponse> {
    return apiClient.post("/payments/card/process", data)
  },

  // Check payment status
  checkPaymentStatus(transactionId: string): Promise<{ status: string; message: string }> {
    return apiClient.get(`/payments/status/${transactionId}`)
  },

  // Get single transaction (alias)
  getTransaction(transactionId: string): Promise<{
    id: string
    type: string
    amount: number
    currency: string
    status: string
    created_at: string
    description?: string
  }> {
    return apiClient.get(`/payments/transactions/${transactionId}`)
  },
}
