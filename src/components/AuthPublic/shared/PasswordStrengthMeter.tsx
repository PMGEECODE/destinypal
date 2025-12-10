import { validatePassword } from "../utils/validation"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements = validatePassword(password)
  const passedCount = Object.values(requirements).filter(Boolean).length

  const getStrengthColor = () => {
    if (passedCount <= 1) return "bg-red-500"
    if (passedCount <= 2) return "bg-orange-500"
    if (passedCount <= 3) return "bg-amber-500"
    if (passedCount <= 4) return "bg-lime-500"
    return "bg-green-500"
  }

  const getStrengthLabel = () => {
    if (passedCount <= 1) return "Very Weak"
    if (passedCount <= 2) return "Weak"
    if (passedCount <= 3) return "Fair"
    if (passedCount <= 4) return "Good"
    return "Strong"
  }

  const requirementsList = [
    { key: "minLength", label: "At least 8 characters", met: requirements.minLength },
    { key: "hasUppercase", label: "One uppercase letter", met: requirements.hasUppercase },
    { key: "hasLowercase", label: "One lowercase letter", met: requirements.hasLowercase },
    { key: "hasNumber", label: "One number", met: requirements.hasNumber },
    { key: "hasSpecialChar", label: "One special character (!@#$%^&*)", met: requirements.hasSpecialChar },
  ]

  if (!password) return null

  return (
    <div className="mt-2 space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Password Strength</span>
          <span
            className={`font-medium ${
              passedCount <= 2 ? "text-red-600" : passedCount <= 3 ? "text-amber-600" : "text-green-600"
            }`}
          >
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(passedCount / 5) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {requirementsList.map((req) => (
          <li
            key={req.key}
            className={`flex items-center gap-2 text-sm ${req.met ? "text-green-600" : "text-slate-500"}`}
          >
            {req.met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
