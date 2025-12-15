"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, Wallet, TrendingUp, Calendar, CreditCard, CheckCircle } from "lucide-react"
import { studentStore } from "../../lib/api"
import type { StudentFeeBalance as FeeBalance } from "../../lib/api/types"

interface StudentFeeBalanceProps {
  studentId: string
}

interface Payment {
  id: string
  amount: number
  payment_method: string
  payment_date: string
  status: string
  reference_id?: string
  sponsor_name?: string
  created_at: string
}

export function StudentFeeBalance({ studentId }: StudentFeeBalanceProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feeBalances, setFeeBalances] = useState<FeeBalance[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([])

  useEffect(() => {
    fetchBalanceData()
  }, [studentId])

  const fetchBalanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching fee balances for student:", studentId)

      // Fetch fee balances
      const balances = await studentStore.getStudentFeeBalances(studentId)
      console.log("[v0] Fee balances received:", balances)
      setFeeBalances(balances || [])

      // Fetch payments if available
      try {
        if (studentStore.getStudentPayments) {
          const paymentData = await studentStore.getStudentPayments(studentId)
          console.log("[v0] Payments received:", paymentData)
          setPayments(paymentData || [])
        }
      } catch (err) {
        console.log("[v0] Payments endpoint not available:", err)
        setPayments([])
      }

      // Fetch payment accounts
      try {
        const accounts = await studentStore.getStudentPaymentAccounts(studentId)
        console.log("[v0] Payment accounts received:", accounts)
        setPaymentAccounts(accounts || [])
      } catch (err) {
        console.log("[v0] Payment accounts error:", err)
        setPaymentAccounts([])
      }
    } catch (err) {
      console.error("[v0] Error fetching balance data:", err)
      setError("Failed to load fee balance information")
    } finally {
      setLoading(false)
    }
  }

  const totalFees = feeBalances.reduce((sum, fb) => sum + (fb.total_fees || 0), 0)
  const totalPaid = feeBalances.reduce((sum, fb) => sum + (fb.amount_paid || 0), 0)
  const balanceDue = feeBalances.reduce((sum, fb) => sum + (fb.balance_due ?? fb.balance ?? 0), 0)
  const paymentProgress = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading fee balance information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Balance</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (feeBalances.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Fee Balances Found</h2>
          <p className="text-gray-600 mb-6">
            Your institution hasn't added any fee information yet. Contact your school administrator for more details.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Fee Balance</h1>
        </div>
        <p className="text-gray-600">View your school fee details and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        {/* Total Fees */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Total Fees</p>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900 mb-1">KES {totalFees.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Academic Year Fees</p>
        </div>

        {/* Amount Paid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Amount Paid</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900 mb-1">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{paymentProgress.toFixed(1)}% Complete</p>
        </div>

        {/* Balance Due */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Balance Due</p>
            <TrendingUp className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-rose-900 mb-1">KES {balanceDue.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Remaining Amount</p>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Payment Progress</span>
          <span className="text-lg font-bold text-emerald-700">{paymentProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Fee Balance Details */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fee Breakdown</h2>
        <div className="space-y-4">
          {feeBalances.map((balance, index) => (
            <div
              key={balance.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Academic Period</p>
                  <p className="font-semibold text-gray-900">
                    {balance.academic_year || "Current Year"} - Term {balance.term || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Fees</p>
                  <p className="font-semibold text-blue-900">KES {(balance.total_fees || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Balance Due</p>
                  <p className="font-semibold text-rose-900">
                    KES {(balance.balance_due ?? balance.balance ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Payments</h2>
          <div className="space-y-3">
            {payments.slice(0, 10).map((payment) => (
              <div
                key={payment.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">KES {payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.payment_date || payment.created_at).toLocaleDateString()} •{" "}
                        {payment.payment_method}
                      </p>
                      {payment.sponsor_name && (
                        <p className="text-xs text-emerald-600 font-medium">From: {payment.sponsor_name}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Accounts */}
      {paymentAccounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Account Details</h2>
          <div className="space-y-4">
            {paymentAccounts.map((account, idx) => (
              <div key={account.id || idx} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Type</p>
                    <p className="font-semibold text-gray-900">{account.account_type || "School Fees"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Number</p>
                    <p className="font-semibold text-gray-900">{account.account_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                    <p className="font-semibold text-gray-900">{account.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Name</p>
                    <p className="font-semibold text-gray-900">{account.account_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
