"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface OAuthCallbackProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function OAuthCallback({ onSuccess, onError }: OAuthCallbackProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)

        // Check for errors
        const error = hashParams.get("error") || queryParams.get("error")
        const errorDescription = hashParams.get("error_description") || queryParams.get("error_description")

        if (error) {
          throw new Error(errorDescription || error)
        }

        // Validate state parameter for CSRF protection
        const returnedState = queryParams.get("state")
        const storedState = sessionStorage.getItem("oauth_state")

        if (returnedState && storedState && returnedState !== storedState) {
          throw new Error("Invalid state parameter. Please try again.")
        }

        // Clear stored state
        sessionStorage.removeItem("oauth_state")

        // Get session from Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          // Try to exchange code for session
          const code = queryParams.get("code")
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (exchangeError) {
              throw exchangeError
            }
          } else {
            throw new Error("No session or code found")
          }
        }

        // Check if user profile exists, create if not
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

          if (!profile) {
            // Create basic profile for OAuth user
            await supabase.from("user_profiles").insert([
              {
                user_id: user.id,
                role: "sponsor", // Default role for OAuth users
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
                country: "", // Will need to be filled later
              },
            ])
          }
        }

        setStatus("success")

        // Redirect after short delay
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      } catch (err: any) {
        console.error("OAuth callback error:", err)
        setStatus("error")
        setErrorMessage(err.message || "Authentication failed")
        onError?.(err.message)
      }
    }

    handleCallback()
  }, [onSuccess, onError])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Completing sign in...</h2>
            <p className="text-slate-600">Please wait while we authenticate your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sign in successful!</h2>
            <p className="text-slate-600">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sign in failed</h2>
            <p className="text-slate-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Return to login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
