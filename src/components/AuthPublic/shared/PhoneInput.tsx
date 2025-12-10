"use client"

import type React from "react"
import { useState } from "react"
import { COUNTRIES } from "../constants"
import { ChevronDown } from "lucide-react"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  defaultCountryCode?: string
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function PhoneInput({
  value,
  onChange,
  defaultCountryCode = "KE",
  error,
  placeholder = "Phone number",
  required = false,
  disabled = false,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0],
  )
  const [showDropdown, setShowDropdown] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/[^\d]/g, "")
    if (phone.length > 0) {
      onChange(`${selectedCountry.dialCode}${phone}`)
    } else {
      onChange("") // Empty string when no digits entered
    }
  }

  const handleCountrySelect = (country: typeof selectedCountry) => {
    setSelectedCountry(country)
    setShowDropdown(false)
    const phoneWithoutCode = value.replace(/^\+\d+/, "")
    if (phoneWithoutCode.length > 0) {
      onChange(`${country.dialCode}${phoneWithoutCode}`)
    } else {
      onChange("") // Keep empty if no digits
    }
  }

  const displayValue = value ? value.replace(selectedCountry.dialCode, "").replace(/^\+\d+/, "") : ""

  return (
    <div className="relative">
      <div
        className={`flex border rounded-lg overflow-hidden ${
          error ? "border-red-500" : "border-slate-300"
        } ${disabled ? "bg-slate-100" : "bg-white"}`}
      >
        <button
          type="button"
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
          disabled={disabled}
          className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-r border-slate-300 hover:bg-slate-100 transition-colors disabled:cursor-not-allowed"
        >
          <span className="text-sm font-medium text-slate-700">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
        <input
          type="tel"
          value={displayValue}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="flex-1 px-3 py-2 focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
        />
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute z-20 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 ${
                  selectedCountry.code === country.code ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-sm font-medium text-slate-600">{country.dialCode}</span>
                <span className="text-sm text-slate-800">{country.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
