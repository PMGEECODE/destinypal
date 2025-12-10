"use client"

import { useState, useEffect } from "react"
import { COUNTRIES, KENYA_COUNTIES, US_STATES } from "../constants"
import { ChevronDown } from "lucide-react"

interface CountrySelectProps {
  countryValue: string
  regionValue?: string
  onCountryChange: (value: string) => void
  onRegionChange?: (value: string) => void
  showRegion?: boolean
  countryError?: string
  regionError?: string
  required?: boolean
  disabled?: boolean
}

export function CountrySelect({
  countryValue,
  regionValue = "",
  onCountryChange,
  onRegionChange,
  showRegion = true,
  countryError,
  regionError,
  required = false,
  disabled = false,
}: CountrySelectProps) {
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)

  const selectedCountry = COUNTRIES.find((c) => c.code === countryValue)

  // Get regions based on country
  const getRegions = () => {
    if (countryValue === "KE") return KENYA_COUNTIES
    if (countryValue === "US") return US_STATES
    return []
  }

  const regions = getRegions()
  const selectedRegion = regions.find((r) => r.code === regionValue)
  const hasRegions = selectedCountry?.hasCounties || selectedCountry?.hasStates
  const regionLabel = selectedCountry?.hasCounties ? "County" : "State"

  // Reset region when country changes
  useEffect(() => {
    if (onRegionChange && regionValue) {
      const newRegions = getRegions()
      if (!newRegions.find((r) => r.code === regionValue)) {
        onRegionChange("")
      }
    }
  }, [countryValue])

  return (
    <div className="space-y-4">
      {/* Country Select */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Country {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => !disabled && setShowCountryDropdown(!showCountryDropdown)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 text-left border rounded-lg flex items-center justify-between ${
            countryError ? "border-red-500" : "border-slate-300"
          } ${disabled ? "bg-slate-100 cursor-not-allowed" : "bg-white hover:border-slate-400"}`}
        >
          <span className={selectedCountry ? "text-slate-800" : "text-slate-400"}>
            {selectedCountry?.name || "Select country"}
          </span>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>

        {showCountryDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowCountryDropdown(false)} />
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onCountryChange(country.code)
                    setShowCountryDropdown(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 ${
                    countryValue === country.code ? "bg-blue-50 text-blue-700" : "text-slate-800"
                  }`}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </>
        )}

        {countryError && <p className="mt-1 text-sm text-red-500">{countryError}</p>}
      </div>

      {/* Region Select (County/State) */}
      {showRegion && hasRegions && regions.length > 0 && (
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {regionLabel} {required && <span className="text-red-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => !disabled && setShowRegionDropdown(!showRegionDropdown)}
            disabled={disabled}
            className={`w-full px-4 py-2.5 text-left border rounded-lg flex items-center justify-between ${
              regionError ? "border-red-500" : "border-slate-300"
            } ${disabled ? "bg-slate-100 cursor-not-allowed" : "bg-white hover:border-slate-400"}`}
          >
            <span className={selectedRegion ? "text-slate-800" : "text-slate-400"}>
              {selectedRegion?.name || `Select ${regionLabel.toLowerCase()}`}
            </span>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </button>

          {showRegionDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowRegionDropdown(false)} />
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {regions.map((region) => (
                  <button
                    key={region.code}
                    type="button"
                    onClick={() => {
                      onRegionChange?.(region.code)
                      setShowRegionDropdown(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 ${
                      regionValue === region.code ? "bg-blue-50 text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {regionError && <p className="mt-1 text-sm text-red-500">{regionError}</p>}
        </div>
      )}
    </div>
  )
}
