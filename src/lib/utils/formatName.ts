/**
 * Formats a full name to a truncated version.
 * Examples:
 * - "George Michael Gee" -> "George M.G"
 * - "Michael George" -> "Michael G"
 * - "John" -> "John"
 */
export function formatTruncatedName(fullName: string): string {
  if (!fullName || typeof fullName !== "string") {
    return "Unknown"
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "Unknown"
  }

  if (parts.length === 1) {
    return parts[0]
  }

  // First name stays full, rest become initials
  const firstName = parts[0]
  const initials = parts
    .slice(1)
    .map((name) => `${name.charAt(0).toUpperCase()}.`)
    .join("")

  return `${firstName} ${initials}`
}

/**
 * Gets initials from a full name for avatar display.
 * Examples:
 * - "George Michael Gee" -> "GM"
 * - "Michael George" -> "MG"
 * - "John" -> "J"
 */
export function getNameInitials(fullName: string, maxChars = 2): string {
  if (!fullName || typeof fullName !== "string") {
    return "?"
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  const initials = parts
    .slice(0, maxChars)
    .map((name) => name.charAt(0).toUpperCase())
    .join("")

  return initials
}

/**
 * Constructs the full photo URL with API base.
 * If the URL is relative (starts with /api), prepend the API base URL.
 */
export function getFullPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) {
    return null
  }

  // If it's already an absolute URL, return as-is
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl
  }

  // If it's a relative API path, prepend the API base URL
  if (photoUrl.startsWith("/api")) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    return `${apiBaseUrl}${photoUrl}`
  }

  // For other relative paths (like /uploads/...), also prepend API base
  if (photoUrl.startsWith("/")) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    return `${apiBaseUrl}${photoUrl}`
  }

  return photoUrl
}
