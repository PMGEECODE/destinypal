"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Mail, Smartphone, AlertCircle, Loader2, Key } from "lucide-react"
import { useAuth } from "./AuthContext"
import type { TwoFactorMethod } from "./types"
import { VERIFICATION_CODE_LENGTH, VERIFICATION_RESEND_COOLDOWN } from "./constants"

interface TwoFactorVerifyProps {
  method: TwoFactorMethod
  onVerified: () => void
  onCancel: () => void
  onUseBackupCode?: () => void
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({ method, onVerified, onCancel, onUseBackupCode }) => {
  const { verify2FA, resend2FACode } = useAuth()
  const [code, setCode] = useState<string[]>(Array(VERIFICATION_CODE_LENGTH).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!useBackupCode) {
      inputRefs.current[0]?.focus()
    }
  }, [useBackupCode])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError(null)

    if (value && index < VERIFICATION_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

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
      const success = await verify2FA(verificationCode)
      if (success) {
        onVerified()
      } else {
        setError("Invalid verification code. Please try again.")
        setCode(Array(VERIFICATION_CODE_LENGTH).fill(""))
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
      setCode(Array(VERIFICATION_CODE_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackupCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const success = await verify2FA(backupCode.replace(/\s/g, ""))
      if (success) {
        onVerified()
      } else {
        setError("Invalid backup code. Please try again.")
        setBackupCode("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError(null)

    try {
      await resend2FACode()
      setResendCooldown(VERIFICATION_RESEND_COOLDOWN)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const isEmail = method === "email"
  const iconBgColor = isEmail ? "bg-blue-100" : "bg-green-100"
  const iconColor = isEmail ? "text-blue-600" : "text-green-600"
  const buttonColor = isEmail
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20"
    : "bg-green-600 hover:bg-green-700 focus:ring-green-500/20"
  const focusRing = isEmail
    ? "focus:ring-blue-500 focus:border-blue-500"
    : "focus:ring-green-500 focus:border-green-500"

  // Backup code entry view
  if (useBackupCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Enter Backup Code</h1>
              <p className="text-slate-600">Enter one of your backup codes to sign in</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleBackupCodeVerify} className="space-y-6">
              <div>
                <label htmlFor="backupCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Backup Code
                </label>
                <input
                  id="backupCode"
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  maxLength={9}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || backupCode.length < 8}
                className="w-full py-3 px-4 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Backup Code"
                )}
              </button>
            </form>

            <button
              onClick={() => {
                setUseBackupCode(false)
                setError(null)
                setBackupCode("")
              }}
              className="w-full mt-4 py-3 px-4 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Use verification code instead
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Normal 2FA verification view
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isEmail ? (
                <Mail className={`w-8 h-8 ${iconColor}`} />
              ) : (
                <Smartphone className={`w-8 h-8 ${iconColor}`} />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Two-Factor Authentication</h1>
            <p className="text-slate-600">
              Enter the {VERIFICATION_CODE_LENGTH}-digit code sent to your {isEmail ? "email" : "phone"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Verification Code</label>
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
                  className={`w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-xl ${focusRing} focus:ring-2 transition-all disabled:opacity-50`}
                />
              ))}
            </div>
          </div>

          {isLoading && (
            <div className={`flex items-center justify-center gap-2 mb-6 ${iconColor}`}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className={`${iconColor} font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isResending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
              </button>
            </p>

            {onUseBackupCode && (
              <button
                onClick={() => setUseBackupCode(true)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Key className="w-4 h-4" />
                Use a backup code
              </button>
            )}

            <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Cancel sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorVerify
