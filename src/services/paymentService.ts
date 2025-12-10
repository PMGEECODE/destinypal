import type { PaymentTransaction, PaymentResponse, PaymentMethod, DonationCreatePayload } from "../types/donation"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

export interface MobileMoneyPaymentRequest {
  phone_number: string
  amount: number
  account_reference: string
  transaction_desc: string
}

export interface CardPaymentRequest {
  payment_token: string
  amount: number
  billing_name?: string
  billing_email?: string
}

export interface PayPalPaymentRequest {
  amount: number
  currency: string
  return_url: string
  cancel_url: string
  description?: string
}

export interface BankTransferRequest {
  amount: number
  currency: string
  donor_name: string
  donor_email: string
}

export class PaymentService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token")
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    }
  }

  static async initiateTransaction(data: {
    reference_id: string
    payment_type: "donation" | "sponsorship"
    amount: number
    currency: string
    payment_method: PaymentMethod
    phone_number?: string
    metadata?: Record<string, unknown>
  }): Promise<PaymentTransaction> {
    const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...data,
        payment_method: data.payment_method === "airtel_money" ? "airtel" : data.payment_method,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to initiate transaction")
    }

    return response.json()
  }

  static async processMpesaPayment(
    transactionId: string,
    paymentData: MobileMoneyPaymentRequest,
  ): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/mpesa/process`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        transaction_id: transactionId,
        phone_number: paymentData.phone_number,
        amount: paymentData.amount,
        account_reference: paymentData.account_reference,
        transaction_desc: paymentData.transaction_desc,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || "M-Pesa payment failed")
    }

    return {
      success: result.success,
      message: result.message,
      checkout_request_id: result.checkout_request_id,
      merchant_request_id: result.merchant_request_id,
    }
  }

  static async processAirtelMoneyPayment(
    transactionId: string,
    paymentData: MobileMoneyPaymentRequest,
  ): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/airtel/process`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        transaction_id: transactionId,
        phone_number: paymentData.phone_number,
        amount: paymentData.amount,
        account_reference: paymentData.account_reference,
        transaction_desc: paymentData.transaction_desc,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || "Airtel Money payment failed")
    }

    return {
      success: result.success,
      message: result.message,
      airtel_transaction_id: result.airtel_transaction_id,
    }
  }

  static async processCardPayment(transactionId: string, paymentData: CardPaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/card/process`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        transaction_id: transactionId,
        payment_token: paymentData.payment_token,
        amount: paymentData.amount,
        billing_name: paymentData.billing_name,
        billing_email: paymentData.billing_email,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || "Card payment failed")
    }

    return {
      success: result.success,
      message: result.message,
      transaction_ref: result.transaction_ref,
      authorization_code: result.authorization_code,
    }
  }

  static async processPayPalPayment(
    transactionId: string,
    paymentData: PayPalPaymentRequest,
  ): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/paypal/create`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        transaction_id: transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        return_url: paymentData.return_url,
        cancel_url: paymentData.cancel_url,
        description: paymentData.description,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || "PayPal payment failed")
    }

    return {
      success: result.success,
      message: result.message,
      paypal_order_id: result.order_id,
      approval_url: result.approval_url,
    }
  }

  static async initiateBankTransfer(
    transactionId: string,
    paymentData: BankTransferRequest,
  ): Promise<
    PaymentResponse & {
      bank_details: {
        account_name: string
        account_number: string
        bank_name: string
        swift_code: string
        reference: string
      }
    }
  > {
    const response = await fetch(`${API_BASE_URL}/payments/bank-transfer/initiate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        transaction_id: transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        donor_name: paymentData.donor_name,
        donor_email: paymentData.donor_email,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || "Bank transfer initiation failed")
    }

    return {
      success: result.success,
      message: result.message,
      transaction_ref: result.reference,
      bank_details: result.bank_details,
    }
  }

  static async checkPaymentStatus(transactionId: string): Promise<PaymentTransaction> {
    const response = await fetch(`${API_BASE_URL}/payments/status/${transactionId}`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to check payment status")
    }

    const result = await response.json()
    return result.transaction
  }

  static async createDonation(data: DonationCreatePayload): Promise<{ id: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create donation")
    }

    return response.json()
  }

  static generateReferenceId(prefix = "DON"): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000)
    return `${prefix}-${timestamp}-${random}`
  }

  static formatPhoneNumber(phone: string, countryCode = "254"): string {
    let cleanPhone = phone.replace(/[\s\-$$$$]/g, "")

    if (cleanPhone.startsWith("0")) {
      cleanPhone = countryCode + cleanPhone.substring(1)
    } else if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.substring(1)
    } else if (!cleanPhone.startsWith(countryCode)) {
      cleanPhone = countryCode + cleanPhone
    }

    return cleanPhone
  }
}
