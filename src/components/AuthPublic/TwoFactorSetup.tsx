"use client"

import type React from "react"
import { useState } from "react"
import { Shield, Mail, Smartphone, CheckCircle, AlertCircle, Loader2, Copy, ArrowLeft } from "lucide-react"
import { useAuth } from "./AuthContext"
import type { TwoFactorMethod } from "./types"

interface TwoFactorSetupProps {
  onComplete: () => void
  onSkip?: () => void
  onBack?: () => void
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onSkip, onBack }) => {
  const { setup2FA, verify2FA, backupCodes, user } = useAuth()
  const [step, setStep] = useState<"select" | "verify" | "backup">("select")
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)

  const handleMethodSelect = async (method: TwoFactorMethod) => {
    setSelectedMethod(method)
    setIsLoading(true)
    setError(null)

    try {
      await setup2FA(method)
      setStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup 2FA. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const success = await verify2FA(verificationCode)
      if (success) {
        setStep("backup")
      } else {
        setError("Invalid verification code. Please try again.")
        setVerificationCode("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    if (backupCodes) {
      navigator.clipboard.writeText(backupCodes.join("\n"))
      setCopiedBackupCodes(true)
      setTimeout(() => setCopiedBackupCodes(false), 3000)
    }
  }

  const downloadBackupCodes = () => {
    if (backupCodes) {
      const content = `Backup Codes for ${user?.email || "your account"}\n\nKeep these codes safe. Each code can only be used once.\n\n${backupCodes.join("\n")}\n\nGenerated: ${new Date().toISOString()}`
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "backup-codes.txt"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Step 1: Select 2FA method
  if (step === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Enable Two-Factor Authentication</h1>
              <p className="text-slate-600">Add an extra layer of security to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => handleMethodSelect("email")}
                disabled={isLoading}
                className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">Email Authentication</p>
                  <p className="text-sm text-slate-600">Receive codes via email</p>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect("sms")}
                disabled={isLoading}
                className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">SMS Authentication</p>
                  <p className="text-sm text-slate-600">Receive codes via text message</p>
                </div>
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 mt-6 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Setting up...</span>
              </div>
            )}

            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full mt-6 py-3 px-4 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Verify 2FA code
  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => {
                setStep("select")
                setVerificationCode("")
                setError(null)
              }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Change method
            </button>

            <div className="text-center mb-8">
              <div
                className={`w-16 h-16 ${selectedMethod === "email" ? "bg-blue-100" : "bg-green-100"} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                {selectedMethod === "email" ? (
                  <Mail className="w-8 h-8 text-blue-600" />
                ) : (
                  <Smartphone className="w-8 h-8 text-green-600" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Setup</h1>
              <p className="text-slate-600">
                We've sent a verification code to your {selectedMethod === "email" ? "email" : "phone"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 text-center text-lg tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className={`w-full py-3 px-4 ${selectedMethod === "email" ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20" : "bg-green-600 hover:bg-green-700 focus:ring-green-500/20"} text-white rounded-xl font-medium focus:ring-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable 2FA"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Show backup codes
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">2FA Enabled Successfully!</h1>
            <p className="text-slate-600">Save your backup codes in a secure location</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> These backup codes can be used to access your account if you lose access to
              your {selectedMethod === "email" ? "email" : "phone"}. Each code can only be used once.
            </p>
          </div>

          {backupCodes && (
            <div className="bg-slate-100 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="text-sm font-mono text-slate-700 bg-white px-3 py-2 rounded-lg text-center"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={copyBackupCodes}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copiedBackupCodes ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={downloadBackupCodes}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Download
            </button>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 transition-all"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorSetup
