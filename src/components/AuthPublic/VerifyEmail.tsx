"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Mail, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { VERIFICATION_CODE_LENGTH, VERIFICATION_RESEND_COOLDOWN } from "./constants"

interface VerifyEmailProps {
  email: string
  onVerified: () => void
  onBack: () => void
  onResendCode?: () => Promise<void>
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onVerified, onBack, onResendCode }) => {
  const [code, setCode] = useState<string[]>(Array(VERIFICATION_CODE_LENGTH).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Cooldown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take last character
    setCode(newCode)
    setError(null)

    // Auto-focus next input
    if (value && index < VERIFICATION_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (newCode.every((digit) => digit !== "") && newCode.join("").length === VERIFICATION_CODE_LENGTH) {
      handleVerify(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH)
    if (pastedData) {
      const newCode = [...code]
      pastedData.split("").forEach((char, index) => {
        if (index < VERIFICATION_CODE_LENGTH) {
          newCode[index] = char
        }
      })
      setCode(newCode)

      // Focus appropriate input
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[VERIFICATION_CODE_LENGTH - 1]?.focus()
        handleVerify(newCode.join(""))
      }
    }
  }

  const handleVerify = async (verificationCode: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "email",
      })

      if (verifyError) {
        throw verifyError
      }

      onVerified()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code. Please try again.")
      setCode(Array(VERIFICATION_CODE_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError(null)

    try {
      if (onResendCode) {
        await onResendCode()
      } else {
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
        })
        if (resendError) throw resendError
      }
      setResendCooldown(VERIFICATION_RESEND_COOLDOWN)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
            <p className="text-slate-600">We've sent a {VERIFICATION_CODE_LENGTH}-digit code to</p>
            <p className="font-medium text-slate-900">{email}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Enter verification code</label>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                />
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 mb-6 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Code
                  </>
                )}
              </button>
            </p>
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
