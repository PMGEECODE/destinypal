"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Heart,
  CreditCard,
  Smartphone,
  Building2,
  Globe,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  Users,
  GraduationCap,
  TrendingUp,
  Info,
} from "lucide-react"
import { PaymentService } from "../../services/paymentService"
import {
  detectCardType,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  formatCardNumber,
  validatePhoneNumber,
} from "../../utils/cardValidation"
import type {
  PaymentMethod,
  PaymentStep,
  DonationFormData,
  MobileMoneyPaymentData,
  CardPaymentData,
  BankTransferDetails,
} from "../../types/donation"
import {
  PAYMENT_METHODS,
  SUGGESTED_AMOUNTS,
  DONATION_FREQUENCIES,
  CURRENCIES,
  BANK_TRANSFER_DETAILS,
} from "../../types/donation"

// Impact stats for the donation page
const IMPACT_STATS = [
  { icon: Users, value: "2,500+", label: "Students Supported" },
  { icon: GraduationCap, value: "85%", label: "Graduation Rate" },
  { icon: Globe, value: "15+", label: "Partner Institutions" },
  { icon: TrendingUp, value: "$1.2M", label: "Total Donations" },
]

// Initial form state
const INITIAL_FORM_STATE: DonationFormData = {
  amount: "",
  currency: "USD",
  frequency: "one_time",
  payment_method: "",
  message: "",
  donor: {
    name: "",
    email: "",
    phone: "",
    is_anonymous: false,
  },
}

export function DonatePage() {
  const [step, setStep] = useState<PaymentStep>("details")
  const [formData, setFormData] = useState<DonationFormData>(INITIAL_FORM_STATE)
  const [mobileMoneyData, setMobileMoneyData] = useState<MobileMoneyPaymentData>({ phone_number: "" })
  const [cardData, setCardData] = useState<CardPaymentData>({
    card_number: "",
    card_holder_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  })
  const [bankTransferDetails, setBankTransferDetails] = useState<BankTransferDetails | null>(null)

  const [loading, setLoading] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [cardInfo, setCardInfo] = useState({ type: "unknown", brand: "Unknown", icon: "💳" })

  const isMountedRef = useRef(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Card type detection
  useEffect(() => {
    if (cardData.card_number) {
      setCardInfo(detectCardType(cardData.card_number))
    }
  }, [cardData.card_number])

  // Poll for payment status
  useEffect(() => {
    if (step === "processing" && transactionId && formData.payment_method !== "bank_transfer") {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const transaction = await PaymentService.checkPaymentStatus(transactionId)

          if (!isMountedRef.current) return

          if (transaction.status === "completed") {
            setStep("completed")
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          } else if (transaction.status === "failed" || transaction.status === "cancelled") {
            setErrorMessage(transaction.failure_reason || "Payment failed. Please try again.")
            setStep("failed")
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          }
        } catch (error) {
          console.error("Error checking payment status:", error)
        }
      }, 3000)
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [step, transactionId, formData.payment_method])

  // Form field update helpers
  const updateFormData = useCallback((updates: Partial<DonationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateDonorInfo = useCallback((updates: Partial<DonationFormData["donor"]>) => {
    setFormData((prev) => ({
      ...prev,
      donor: { ...prev.donor, ...updates },
    }))
  }, [])

  // Validation
  const validateDetailsStep = useCallback((): boolean => {
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      setErrorMessage("Please enter a valid donation amount")
      return false
    }
    if (!formData.donor.name.trim()) {
      setErrorMessage("Please enter your name")
      return false
    }
    if (!formData.donor.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.donor.email)) {
      setErrorMessage("Please enter a valid email address")
      return false
    }
    if (!formData.payment_method) {
      setErrorMessage("Please select a payment method")
      return false
    }
    return true
  }, [formData])

  // Navigation handlers
  const handleContinueToPayment = useCallback(() => {
    setErrorMessage("")
    if (validateDetailsStep()) {
      setStep("payment")
    }
  }, [validateDetailsStep])

  const handleBackToDetails = useCallback(() => {
    setErrorMessage("")
    setStep("details")
  }, [])

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  // Payment processing
  const processPayment = useCallback(async () => {
    setLoading(true)
    setErrorMessage("")

    try {
      const referenceId = PaymentService.generateReferenceId("DON")
      const amount = Number.parseFloat(formData.amount)

      // Initiate transaction
      const transaction = await PaymentService.initiateTransaction({
        reference_id: referenceId,
        payment_type: "donation",
        amount,
        currency: formData.currency,
        payment_method: formData.payment_method as PaymentMethod,
        phone_number: mobileMoneyData.phone_number || undefined,
        metadata: {
          donor_name: formData.donor.name,
          donor_email: formData.donor.email,
          message: formData.message,
          frequency: formData.frequency,
          is_anonymous: formData.donor.is_anonymous,
        },
      })

      if (!isMountedRef.current) return

      setTransactionId(transaction.id)

      // Process based on payment method
      switch (formData.payment_method) {
        case "mpesa": {
          const formattedPhone = PaymentService.formatPhoneNumber(mobileMoneyData.phone_number)
          await PaymentService.processMpesaPayment(transaction.id, {
            phone_number: formattedPhone,
            amount,
            account_reference: referenceId,
            transaction_desc: `Donation to DestinyPal by ${formData.donor.name}`,
          })
          setStep("processing")
          break
        }

        case "airtel_money": {
          const formattedPhone = PaymentService.formatPhoneNumber(mobileMoneyData.phone_number)
          await PaymentService.processAirtelMoneyPayment(transaction.id, {
            phone_number: formattedPhone,
            amount,
            account_reference: referenceId,
            transaction_desc: `Donation to DestinyPal by ${formData.donor.name}`,
          })
          setStep("processing")
          break
        }

        case "card": {
          // In production, use a payment gateway to tokenize the card
          // For now, create a mock token
          const mockToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const result = await PaymentService.processCardPayment(transaction.id, {
            payment_token: mockToken,
            amount,
            billing_name: cardData.card_holder_name,
            billing_email: formData.donor.email,
          })

          if (result.success) {
            setStep("completed")
          } else {
            throw new Error(result.message)
          }
          break
        }

        case "paypal": {
          const result = await PaymentService.processPayPalPayment(transaction.id, {
            amount,
            currency: formData.currency,
            return_url: `${window.location.origin}/donate/success`,
            cancel_url: `${window.location.origin}/donate/cancel`,
            description: `Donation to DestinyPal`,
          })

          if (result.approval_url) {
            window.location.href = result.approval_url
          } else {
            setStep("processing")
          }
          break
        }

        case "bank_transfer": {
          const result = await PaymentService.initiateBankTransfer(transaction.id, {
            amount,
            currency: formData.currency,
            donor_name: formData.donor.name,
            donor_email: formData.donor.email,
          })

          setBankTransferDetails({
            ...BANK_TRANSFER_DETAILS,
            reference: result.transaction_ref || referenceId,
          })
          setStep("processing")
          break
        }
      }
    } catch (error) {
      if (!isMountedRef.current) return
      console.error("Payment error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.")
      setStep("failed")
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [formData, mobileMoneyData, cardData])

  // Handle form submission
  const handlePaymentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMessage("")

      // Validate payment-specific fields
      if (formData.payment_method === "mpesa" || formData.payment_method === "airtel_money") {
        if (!validatePhoneNumber(mobileMoneyData.phone_number)) {
          setErrorMessage("Please enter a valid phone number")
          return
        }
      }

      if (formData.payment_method === "card") {
        if (!validateCardNumber(cardData.card_number)) {
          setErrorMessage("Please enter a valid card number")
          return
        }
        if (!validateCVV(cardData.cvv, cardInfo.type)) {
          setErrorMessage("Please enter a valid CVV")
          return
        }
        if (!validateExpiryDate(cardData.expiry_month, cardData.expiry_year)) {
          setErrorMessage("Card has expired or invalid expiry date")
          return
        }
        if (!cardData.card_holder_name.trim()) {
          setErrorMessage("Please enter cardholder name")
          return
        }
      }

      await processPayment()
    },
    [formData.payment_method, mobileMoneyData, cardData, cardInfo.type, processPayment],
  )

  // Complete donation (save to backend)
  const handleComplete = useCallback(async () => {
    try {
      await PaymentService.createDonation({
        donor_name: formData.donor.name,
        donor_email: formData.donor.email,
        donor_phone: formData.donor.phone,
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency,
        payment_method: formData.payment_method as PaymentMethod,
        frequency: formData.frequency,
        message: formData.message || undefined,
        is_anonymous: formData.donor.is_anonymous,
        transaction_id: transactionId || undefined,
      })

      // Reset form
      setFormData(INITIAL_FORM_STATE)
      setMobileMoneyData({ phone_number: "" })
      setCardData({
        card_number: "",
        card_holder_name: "",
        expiry_month: "",
        expiry_year: "",
        cvv: "",
      })
      setBankTransferDetails(null)
      setTransactionId(null)
      setStep("details")
    } catch (error) {
      console.error("Error saving donation:", error)
      setErrorMessage("Donation completed but failed to save. Please contact support.")
    }
  }, [formData, transactionId])

  // Reset and try again
  const handleTryAgain = useCallback(() => {
    setStep("payment")
    setErrorMessage("")
  }, [])

  // Get currency symbol
  const getCurrencySymbol = useCallback((code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || "$"
  }, [])

  // Render payment method icon
  const renderPaymentMethodIcon = (methodId: string) => {
    switch (methodId) {
      case "mpesa":
        return <Smartphone className="w-6 h-6 text-emerald-600" />
      case "airtel_money":
        return <Smartphone className="w-6 h-6 text-red-600" />
      case "card":
        return <CreditCard className="w-6 h-6 text-blue-600" />
      case "paypal":
        return <Globe className="w-6 h-6 text-blue-700" />
      case "bank_transfer":
        return <Building2 className="w-6 h-6 text-slate-600" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  // Processing state for mobile money and bank transfer
  if (step === "processing") {
    if (formData.payment_method === "bank_transfer" && bankTransferDetails) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Bank Transfer Details</h2>
                <p className="text-slate-600">
                  Please transfer {getCurrencySymbol(formData.currency)}
                  {formData.amount} to the account below
                </p>
              </div>

              <div className="space-y-4 bg-slate-50 rounded-xl p-6 mb-6">
                {[
                  { label: "Bank Name", value: bankTransferDetails.bank_name, field: "bank_name" },
                  { label: "Account Name", value: bankTransferDetails.account_name, field: "account_name" },
                  { label: "Account Number", value: bankTransferDetails.account_number, field: "account_number" },
                  { label: "SWIFT Code", value: bankTransferDetails.swift_code, field: "swift_code" },
                  { label: "Reference", value: bankTransferDetails.reference, field: "reference" },
                ].map(({ label, value, field }) => (
                  <div
                    key={field}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                  >
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                      <p className="font-mono text-slate-900 font-medium">{value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(value, field)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === field ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Important Instructions</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>Use the reference number exactly as shown</li>
                      <li>Transfer may take 1-3 business days to process</li>
                      <li>You will receive a confirmation email once verified</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                I've Completed the Transfer
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-200">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Payment</h2>
          <p className="text-slate-600 mb-6">
            {formData.payment_method === "card" || formData.payment_method === "paypal"
              ? "Please wait while we process your payment..."
              : "Please check your phone and enter your PIN to complete the payment."}
          </p>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-700">
              <span className="font-medium">Amount:</span> {getCurrencySymbol(formData.currency)}
              {formData.amount}
            </p>
            {transactionId && (
              <p className="text-sm text-slate-500 mt-1">
                <span className="font-medium">Reference:</span> {transactionId.slice(0, 20)}...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (step === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">
            Your generous donation of {getCurrencySymbol(formData.currency)}
            {formData.amount} will help transform students' lives through education.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-800">
              A confirmation email has been sent to <strong>{formData.donor.email}</strong>
            </p>
          </div>
          <button
            onClick={handleComplete}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Make Another Donation
          </button>
        </div>
      </div>
    )
  }

  // Failed state
  if (step === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
          <p className="text-slate-600 mb-6">{errorMessage || "Something went wrong. Please try again."}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("details")
                setErrorMessage("")
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTryAgain}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                <Heart className="w-4 h-4 fill-current" />
                <span>Support Our Mission</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Help Transform Lives Through Education
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Your donation directly supports students in need, providing them with educational opportunities that
                change their futures.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        </section>

        {/* Impact Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPACT_STATS.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Main Donation Form */}
        <section className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Step Indicator */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${step === "details" ? "text-blue-600" : "text-slate-400"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === "details" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      1
                    </div>
                    <span className="font-medium hidden sm:inline">Donation Details</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                  <div className={`flex items-center gap-2 ${step === "payment" ? "text-blue-600" : "text-slate-400"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === "payment" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      2
                    </div>
                    <span className="font-medium hidden sm:inline">Payment</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Donation Details */}
              {step === "details" && (
                <div className="p-6 md:p-8 space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Donation Amount</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {SUGGESTED_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => updateFormData({ amount: amount.toString() })}
                          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                            formData.amount === amount.toString()
                              ? "bg-blue-600 text-white shadow-lg scale-105"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {getCurrencySymbol(formData.currency)}
                          {amount}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={formData.currency}
                        onChange={(e) => updateFormData({ currency: e.target.value })}
                        className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Custom amount"
                        value={formData.amount}
                        onChange={(e) => updateFormData({ amount: e.target.value })}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Donation Frequency</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DONATION_FREQUENCIES.map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => updateFormData({ frequency: freq.value })}
                          className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                            formData.frequency === freq.value
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700">Your Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={formData.donor.name}
                          onChange={(e) => updateDonorInfo({ name: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Email *</label>
                        <input
                          type="email"
                          value={formData.donor.email}
                          onChange={(e) => updateDonorInfo({ email: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.donor.is_anonymous}
                        onChange={(e) => updateDonorInfo({ is_anonymous: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">Make my donation anonymous</span>
                    </label>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Method</label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.filter((m) => m.available).map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.payment_method === method.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={method.id}
                            checked={formData.payment_method === method.id}
                            onChange={(e) => updateFormData({ payment_method: e.target.value as PaymentMethod })}
                            className="sr-only"
                          />
                          <div className="flex-shrink-0">{renderPaymentMethodIcon(method.id)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">{method.name}</p>
                            <p className="text-xs text-slate-500">{method.processingTime}</p>
                          </div>
                          {formData.payment_method === method.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message (Optional)</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => updateFormData({ message: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Share why you're donating..."
                    />
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    disabled={!formData.payment_method || !formData.amount}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Payment Details */}
              {step === "payment" && (
                <form onSubmit={handlePaymentSubmit} className="p-6 md:p-8 space-y-6">
                  {/* Order Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Donation Amount</span>
                      <span className="font-bold text-slate-900">
                        {getCurrencySymbol(formData.currency)}
                        {formData.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Payment Method</span>
                      <span className="text-slate-700">
                        {PAYMENT_METHODS.find((m) => m.id === formData.payment_method)?.name}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Money Form */}
                  {(formData.payment_method === "mpesa" || formData.payment_method === "airtel_money") && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <Smartphone className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">
                            {formData.payment_method === "mpesa" ? "M-Pesa" : "Airtel Money"} Payment
                          </p>
                          <p className="text-sm text-emerald-600">
                            You will receive a prompt on your phone to complete the payment
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={mobileMoneyData.phone_number}
                          onChange={(e) => setMobileMoneyData({ phone_number: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0712345678 or +254712345678"
                        />
                      </div>
                    </div>
                  )}

                  {/* Card Form */}
                  {formData.payment_method === "card" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">Secure Card Payment</p>
                          <p className="text-sm text-blue-600">Your card details are encrypted and secure</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Card Number *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardData.card_number}
                            onChange={(e) =>
                              setCardData({ ...cardData, card_number: formatCardNumber(e.target.value) })
                            }
                            className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{cardInfo.icon}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          value={cardData.card_holder_name}
                          onChange={(e) => setCardData({ ...cardData, card_holder_name: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="JOHN DOE"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Month *</label>
                          <select
                            value={cardData.expiry_month}
                            onChange={(e) => setCardData({ ...cardData, expiry_month: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                {String(i + 1).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                          <select
                            value={cardData.expiry_year}
                            onChange={(e) => setCardData({ ...cardData, expiry_year: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">YY</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() + i
                              return (
                                <option key={year} value={String(year).slice(-2)}>
                                  {year}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">CVV *</label>
                          <input
                            type="text"
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                            }
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal */}
                  {formData.payment_method === "paypal" && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <Globe className="w-6 h-6 text-blue-700" />
                      <div>
                        <p className="font-medium text-blue-800">PayPal Payment</p>
                        <p className="text-sm text-blue-600">
                          You will be redirected to PayPal to complete your payment
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer */}
                  {formData.payment_method === "bank_transfer" && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <Building2 className="w-6 h-6 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-800">Bank Transfer</p>
                        <p className="text-sm text-slate-600">
                          You will receive bank account details to complete the transfer
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToDetails}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Complete Donation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Badge */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Secure Donation</h3>
                  <p className="text-sm text-slate-500">256-bit SSL encryption</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>

            {/* Fund Allocation */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">How Funds Are Used</h3>
              <div className="space-y-3">
                {[
                  { label: "Tuition & Fees", percentage: 45 },
                  { label: "Learning Materials", percentage: 25 },
                  { label: "Student Welfare", percentage: 20 },
                  { label: "Operations", percentage: 10 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Info */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Tax Deductible</h3>
              <p className="text-sm text-blue-700">
                DestinyPal is a registered non-profit. Your donation may be tax-deductible. You will receive a receipt
                for your records.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DonatePage
