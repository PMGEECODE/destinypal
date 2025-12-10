import type { Country, Region } from "./types"

export const PASSWORD_MIN_LENGTH = 8

export const COUNTRIES: Country[] = [
  { code: "KE", name: "Kenya", dialCode: "+254", hasCounties: true },
  { code: "US", name: "United States", dialCode: "+1", hasStates: true },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "CA", name: "Canada", dialCode: "+1", hasStates: true },
  { code: "AU", name: "Australia", dialCode: "+61", hasStates: true },
  { code: "NG", name: "Nigeria", dialCode: "+234", hasStates: true },
  { code: "GH", name: "Ghana", dialCode: "+233" },
  { code: "TZ", name: "Tanzania", dialCode: "+255" },
  { code: "UG", name: "Uganda", dialCode: "+256" },
  { code: "RW", name: "Rwanda", dialCode: "+250" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "IN", name: "India", dialCode: "+91", hasStates: true },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
]

export const KENYA_COUNTIES: Region[] = [
  { code: "NBO", name: "Nairobi", countryCode: "KE" },
  { code: "MSA", name: "Mombasa", countryCode: "KE" },
  { code: "KSM", name: "Kisumu", countryCode: "KE" },
  { code: "NKR", name: "Nakuru", countryCode: "KE" },
  { code: "ELD", name: "Uasin Gishu (Eldoret)", countryCode: "KE" },
  { code: "KRC", name: "Kiambu", countryCode: "KE" },
  { code: "MCK", name: "Machakos", countryCode: "KE" },
  { code: "KAJ", name: "Kajiado", countryCode: "KE" },
  { code: "NYR", name: "Nyeri", countryCode: "KE" },
  { code: "MRU", name: "Meru", countryCode: "KE" },
  { code: "KSI", name: "Kisii", countryCode: "KE" },
  { code: "KKG", name: "Kakamega", countryCode: "KE" },
  { code: "BGM", name: "Bungoma", countryCode: "KE" },
  { code: "KLF", name: "Kilifi", countryCode: "KE" },
  { code: "TRN", name: "Trans Nzoia", countryCode: "KE" },
  { code: "NRK", name: "Narok", countryCode: "KE" },
  { code: "MUR", name: "Murang'a", countryCode: "KE" },
  { code: "KTL", name: "Kitale", countryCode: "KE" },
  { code: "THK", name: "Tharaka-Nithi", countryCode: "KE" },
  { code: "EMB", name: "Embu", countryCode: "KE" },
  { code: "NND", name: "Nandi", countryCode: "KE" },
  { code: "BRT", name: "Baringo", countryCode: "KE" },
  { code: "LKP", name: "Laikipia", countryCode: "KE" },
  { code: "NYD", name: "Nyandarua", countryCode: "KE" },
  { code: "KRN", name: "Kirinyaga", countryCode: "KE" },
  { code: "MGB", name: "Migori", countryCode: "KE" },
  { code: "HBY", name: "Homa Bay", countryCode: "KE" },
  { code: "SYA", name: "Siaya", countryCode: "KE" },
  { code: "BSA", name: "Busia", countryCode: "KE" },
  { code: "VHG", name: "Vihiga", countryCode: "KE" },
  { code: "NYM", name: "Nyamira", countryCode: "KE" },
  { code: "KTU", name: "Kitui", countryCode: "KE" },
  { code: "MKN", name: "Makueni", countryCode: "KE" },
  { code: "TWR", name: "Taita-Taveta", countryCode: "KE" },
  { code: "KWL", name: "Kwale", countryCode: "KE" },
  { code: "TNR", name: "Tana River", countryCode: "KE" },
  { code: "LMU", name: "Lamu", countryCode: "KE" },
  { code: "GRS", name: "Garissa", countryCode: "KE" },
  { code: "WJR", name: "Wajir", countryCode: "KE" },
  { code: "MDR", name: "Mandera", countryCode: "KE" },
  { code: "MRS", name: "Marsabit", countryCode: "KE" },
  { code: "ISL", name: "Isiolo", countryCode: "KE" },
  { code: "SMB", name: "Samburu", countryCode: "KE" },
  { code: "TRK", name: "Turkana", countryCode: "KE" },
  { code: "WPK", name: "West Pokot", countryCode: "KE" },
  { code: "EGM", name: "Elgeyo-Marakwet", countryCode: "KE" },
  { code: "KRC", name: "Kericho", countryCode: "KE" },
  { code: "BOM", name: "Bomet", countryCode: "KE" },
]

export const US_STATES: Region[] = [
  { code: "AL", name: "Alabama", countryCode: "US" },
  { code: "AK", name: "Alaska", countryCode: "US" },
  { code: "AZ", name: "Arizona", countryCode: "US" },
  { code: "AR", name: "Arkansas", countryCode: "US" },
  { code: "CA", name: "California", countryCode: "US" },
  { code: "CO", name: "Colorado", countryCode: "US" },
  { code: "CT", name: "Connecticut", countryCode: "US" },
  { code: "DE", name: "Delaware", countryCode: "US" },
  { code: "FL", name: "Florida", countryCode: "US" },
  { code: "GA", name: "Georgia", countryCode: "US" },
  { code: "HI", name: "Hawaii", countryCode: "US" },
  { code: "ID", name: "Idaho", countryCode: "US" },
  { code: "IL", name: "Illinois", countryCode: "US" },
  { code: "IN", name: "Indiana", countryCode: "US" },
  { code: "IA", name: "Iowa", countryCode: "US" },
  { code: "KS", name: "Kansas", countryCode: "US" },
  { code: "KY", name: "Kentucky", countryCode: "US" },
  { code: "LA", name: "Louisiana", countryCode: "US" },
  { code: "ME", name: "Maine", countryCode: "US" },
  { code: "MD", name: "Maryland", countryCode: "US" },
  { code: "MA", name: "Massachusetts", countryCode: "US" },
  { code: "MI", name: "Michigan", countryCode: "US" },
  { code: "MN", name: "Minnesota", countryCode: "US" },
  { code: "MS", name: "Mississippi", countryCode: "US" },
  { code: "MO", name: "Missouri", countryCode: "US" },
  { code: "MT", name: "Montana", countryCode: "US" },
  { code: "NE", name: "Nebraska", countryCode: "US" },
  { code: "NV", name: "Nevada", countryCode: "US" },
  { code: "NH", name: "New Hampshire", countryCode: "US" },
  { code: "NJ", name: "New Jersey", countryCode: "US" },
  { code: "NM", name: "New Mexico", countryCode: "US" },
  { code: "NY", name: "New York", countryCode: "US" },
  { code: "NC", name: "North Carolina", countryCode: "US" },
  { code: "ND", name: "North Dakota", countryCode: "US" },
  { code: "OH", name: "Ohio", countryCode: "US" },
  { code: "OK", name: "Oklahoma", countryCode: "US" },
  { code: "OR", name: "Oregon", countryCode: "US" },
  { code: "PA", name: "Pennsylvania", countryCode: "US" },
  { code: "RI", name: "Rhode Island", countryCode: "US" },
  { code: "SC", name: "South Carolina", countryCode: "US" },
  { code: "SD", name: "South Dakota", countryCode: "US" },
  { code: "TN", name: "Tennessee", countryCode: "US" },
  { code: "TX", name: "Texas", countryCode: "US" },
  { code: "UT", name: "Utah", countryCode: "US" },
  { code: "VT", name: "Vermont", countryCode: "US" },
  { code: "VA", name: "Virginia", countryCode: "US" },
  { code: "WA", name: "Washington", countryCode: "US" },
  { code: "WV", name: "West Virginia", countryCode: "US" },
  { code: "WI", name: "Wisconsin", countryCode: "US" },
  { code: "WY", name: "Wyoming", countryCode: "US" },
]

export const FORM_LEVELS = [
  { value: "form_1", label: "Form 1" },
  { value: "form_2", label: "Form 2" },
  { value: "form_3", label: "Form 3" },
  { value: "form_4", label: "Form 4" },
]

export const UNIVERSITY_YEARS = [
  { value: "year_1", label: "Year 1" },
  { value: "year_2", label: "Year 2" },
  { value: "year_3", label: "Year 3" },
  { value: "year_4", label: "Year 4" },
  { value: "year_5", label: "Year 5" },
  { value: "year_6", label: "Year 6" },
]

export const INSTITUTION_TYPES = [
  { value: "primary_school", label: "Primary School" },
  { value: "secondary_school", label: "Secondary School" },
  { value: "university", label: "University" },
  { value: "college", label: "College" },
  { value: "vocational", label: "Vocational Training" },
]

export const GUARDIAN_RELATIONSHIPS = [
  { value: "parent", label: "Parent" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
]

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
]

// Password validation rules
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 32,
  requireNumbers: true,
  requireUppercase: true,
  requireSpecial: true,
}

// Verification codes
export const VERIFICATION_CODE_LENGTH = 6
export const VERIFICATION_RESEND_COOLDOWN = 60 // in seconds
