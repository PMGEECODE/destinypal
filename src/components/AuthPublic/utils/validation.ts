import { PASSWORD_MIN_LENGTH } from "../constants"
import type { PasswordRequirements, ValidationError } from "../types"

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Basic phone validation - allows various formats
  const phoneRegex = /^\+?[\d\s-]{10,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function validatePassword(password: string): PasswordRequirements {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

export function isPasswordValid(password: string): boolean {
  const requirements = validatePassword(password)
  return Object.values(requirements).every(Boolean)
}

export function validateIdNumber(idNumber: string): boolean {
  // Basic validation - at least 6 characters, alphanumeric
  return /^[A-Za-z0-9]{6,20}$/.test(idNumber)
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false

  // Check if the date is not in the future and not too old
  const now = new Date()
  const minDate = new Date("1900-01-01")
  return date <= now && date >= minDate
}

export function validateAge(dateOfBirth: string, minAge: number, maxAge: number): boolean {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age >= minAge && age <= maxAge
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function validateRequired(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0
}

export function validateUrl(url: string): boolean {
  if (!url) return true // URLs are often optional
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateYear(year: number | string): boolean {
  const yearNum = typeof year === "string" ? Number.parseInt(year, 10) : year
  const currentYear = new Date().getFullYear()
  return yearNum >= 1800 && yearNum <= currentYear + 10
}

// Form-specific validation
export function validateSponsorForm(data: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!validateRequired(data.email)) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  }

  if (!validateRequired(data.password)) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (!isPasswordValid(data.password)) {
    errors.push({ field: "password", message: "Password does not meet requirements" })
  }

  if (!validateRequired(data.full_name)) {
    errors.push({ field: "full_name", message: "Full name is required" })
  }

  if (!validateRequired(data.id_number)) {
    errors.push({ field: "id_number", message: "ID or Passport number is required" })
  } else if (!validateIdNumber(data.id_number)) {
    errors.push({ field: "id_number", message: "Invalid ID/Passport number format" })
  }

  if (!validateRequired(data.country)) {
    errors.push({ field: "country", message: "Country is required" })
  }

  return errors
}

export function validateInstitutionForm(data: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!validateRequired(data.email)) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  }

  if (!validateRequired(data.password)) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (!isPasswordValid(data.password)) {
    errors.push({ field: "password", message: "Password does not meet requirements" })
  }

  if (!validateRequired(data.institution_name)) {
    errors.push({ field: "institution_name", message: "Institution name is required" })
  }

  if (!validateRequired(data.institution_type)) {
    errors.push({ field: "institution_type", message: "Institution type is required" })
  }

  if (!validateRequired(data.country)) {
    errors.push({ field: "country", message: "Country is required" })
  }

  if (!validateRequired(data.address)) {
    errors.push({ field: "address", message: "Address is required" })
  }

  if (!validateRequired(data.city)) {
    errors.push({ field: "city", message: "City is required" })
  }

  if (!validateRequired(data.contact_person_name)) {
    errors.push({ field: "contact_person_name", message: "Contact person name is required" })
  }

  if (!validateRequired(data.contact_person_email)) {
    errors.push({ field: "contact_person_email", message: "Contact person email is required" })
  } else if (!validateEmail(data.contact_person_email)) {
    errors.push({ field: "contact_person_email", message: "Invalid email format" })
  }

  if (!validateRequired(data.contact_person_phone)) {
    errors.push({ field: "contact_person_phone", message: "Contact person phone is required" })
  } else if (!validatePhone(data.contact_person_phone)) {
    errors.push({ field: "contact_person_phone", message: "Invalid phone format" })
  }

  if (data.website && !validateUrl(data.website)) {
    errors.push({ field: "website", message: "Invalid website URL" })
  }

  if (data.year_established && !validateYear(data.year_established)) {
    errors.push({ field: "year_established", message: "Invalid year" })
  }

  return errors
}

export function validateHighSchoolStudentForm(data: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!validateRequired(data.email)) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  }

  if (!validateRequired(data.password)) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (!isPasswordValid(data.password)) {
    errors.push({ field: "password", message: "Password does not meet requirements" })
  }

  if (!validateRequired(data.full_name)) {
    errors.push({ field: "full_name", message: "Full name is required" })
  }

  if (!validateRequired(data.date_of_birth)) {
    errors.push({ field: "date_of_birth", message: "Date of birth is required" })
  } else if (!validateDate(data.date_of_birth)) {
    errors.push({ field: "date_of_birth", message: "Invalid date" })
  } else if (!validateAge(data.date_of_birth, 10, 25)) {
    errors.push({ field: "date_of_birth", message: "Age must be between 10 and 25 years" })
  }

  if (!validateRequired(data.gender)) {
    errors.push({ field: "gender", message: "Gender is required" })
  }

  if (!validateRequired(data.school_name)) {
    errors.push({ field: "school_name", message: "School name is required" })
  }

  if (!validateRequired(data.parent_guardian_name)) {
    errors.push({ field: "parent_guardian_name", message: "Parent/Guardian name is required" })
  }

  if (!validateRequired(data.parent_guardian_phone)) {
    errors.push({ field: "parent_guardian_phone", message: "Parent/Guardian phone is required" })
  } else if (!validatePhone(data.parent_guardian_phone)) {
    errors.push({ field: "parent_guardian_phone", message: "Invalid phone format" })
  }

  return errors
}

export function validateUniversityStudentForm(data: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!validateRequired(data.email)) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  }

  if (!validateRequired(data.password)) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (!isPasswordValid(data.password)) {
    errors.push({ field: "password", message: "Password does not meet requirements" })
  }

  if (!validateRequired(data.full_name)) {
    errors.push({ field: "full_name", message: "Full name is required" })
  }

  if (!validateRequired(data.date_of_birth)) {
    errors.push({ field: "date_of_birth", message: "Date of birth is required" })
  } else if (!validateDate(data.date_of_birth)) {
    errors.push({ field: "date_of_birth", message: "Invalid date" })
  } else if (!validateAge(data.date_of_birth, 16, 50)) {
    errors.push({ field: "date_of_birth", message: "Age must be between 16 and 50 years" })
  }

  if (!validateRequired(data.gender)) {
    errors.push({ field: "gender", message: "Gender is required" })
  }

  if (!validateRequired(data.university_name)) {
    errors.push({ field: "university_name", message: "University name is required" })
  }

  if (!validateRequired(data.student_id)) {
    errors.push({ field: "student_id", message: "Student ID is required" })
  }

  if (!validateRequired(data.course_name)) {
    errors.push({ field: "course_name", message: "Course name is required" })
  }

  if (!validateRequired(data.year_of_study)) {
    errors.push({ field: "year_of_study", message: "Year of study is required" })
  }

  if (!validateRequired(data.phone)) {
    errors.push({ field: "phone", message: "Phone number is required" })
  } else if (!validatePhone(data.phone)) {
    errors.push({ field: "phone", message: "Invalid phone format" })
  }

  if (!validateRequired(data.emergency_contact_name)) {
    errors.push({ field: "emergency_contact_name", message: "Emergency contact name is required" })
  }

  if (!validateRequired(data.emergency_contact_phone)) {
    errors.push({ field: "emergency_contact_phone", message: "Emergency contact phone is required" })
  } else if (!validatePhone(data.emergency_contact_phone)) {
    errors.push({ field: "emergency_contact_phone", message: "Invalid phone format" })
  }

  return errors
}
