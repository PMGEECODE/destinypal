"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Building2, Loader2, AlertCircle, ChevronDown, X } from "lucide-react"
import type { PublicInstitution } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface InstitutionSelectProps {
  value: string
  onChange: (institutionId: string, institutionName: string) => void
  institutionType: "secondary_school" | "higher_learning"
  error?: string
  disabled?: boolean
  placeholder?: string
  required?: boolean
  label?: string
}

export function InstitutionSelect({
  value,
  onChange,
  institutionType,
  error,
  disabled = false,
  placeholder = "Search and select your institution",
  required = true,
  label,
}: InstitutionSelectProps) {
  const [institutions, setInstitutions] = useState<PublicInstitution[]>([])
  const [filteredInstitutions, setFilteredInstitutions] = useState<PublicInstitution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<PublicInstitution | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch institutions on mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoading(true)
      setFetchError(null)

      try {
        const endpoint =
          institutionType === "higher_learning"
            ? `${API_BASE_URL}/api/v1/public/institutions/higher-learning`
            : `${API_BASE_URL}/api/v1/public/institutions/by-type/${institutionType}`

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to load institutions")
        }

        const data = await response.json()
        setInstitutions(data)
        setFilteredInstitutions(data)

        // If there's a pre-selected value, find and set it
        if (value) {
          const selected = data.find((inst: PublicInstitution) => inst.id === value)
          if (selected) {
            setSelectedInstitution(selected)
            setSearchQuery(selected.name)
          }
        }
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Failed to load institutions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstitutions()
  }, [institutionType, value])

  // Filter institutions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInstitutions(institutions)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = institutions.filter(
        (inst) =>
          inst.name.toLowerCase().includes(query) ||
          inst.city?.toLowerCase().includes(query) ||
          inst.county?.toLowerCase().includes(query),
      )
      setFilteredInstitutions(filtered)
    }
  }, [searchQuery, institutions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // Reset search query to selected institution name if nothing was selected
        if (selectedInstitution) {
          setSearchQuery(selectedInstitution.name)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [selectedInstitution])

  const handleSelect = useCallback(
    (institution: PublicInstitution) => {
      setSelectedInstitution(institution)
      setSearchQuery(institution.name)
      onChange(institution.id, institution.name)
      setIsOpen(false)
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    setSelectedInstitution(null)
    setSearchQuery("")
    onChange("", "")
    inputRef.current?.focus()
  }, [onChange])

  const handleInputFocus = () => {
    setIsOpen(true)
    if (selectedInstitution) {
      setSearchQuery("") // Clear to show all options
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
    if (selectedInstitution) {
      setSelectedInstitution(null)
      onChange("", "")
    }
  }

  const displayLabel = label || (institutionType === "higher_learning" ? "University/College" : "Secondary School")

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {displayLabel} {required && <span className="text-red-500">*</span>}
      </label>

      {fetchError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={isLoading ? "Loading institutions..." : placeholder}
          disabled={disabled || isLoading}
          className={`w-full pl-10 pr-20 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            error ? "border-red-500 bg-red-50" : "border-slate-300"
          } ${disabled || isLoading ? "bg-slate-100 cursor-not-allowed" : ""}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
          {selectedInstitution && !disabled && (
            <button type="button" onClick={handleClear} className="p-1 hover:bg-slate-100 rounded transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Dropdown */}
      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredInstitutions.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium">No institutions found</p>
              <p className="text-xs mt-1">
                {searchQuery ? "Try a different search term" : "No registered institutions available"}
              </p>
              <p className="text-xs mt-2 text-amber-600">Your institution must be registered before you can apply.</p>
            </div>
          ) : (
            filteredInstitutions.map((institution) => (
              <button
                key={institution.id}
                type="button"
                onClick={() => handleSelect(institution)}
                className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-start gap-3 border-b border-slate-100 last:border-0 ${
                  selectedInstitution?.id === institution.id ? "bg-green-50" : ""
                }`}
              >
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{institution.name}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {[institution.city, institution.county, institution.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Helper text */}
      {!error && institutions.length > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          {institutions.length} registered institution{institutions.length !== 1 ? "s" : ""} available
        </p>
      )}
    </div>
  )
}
