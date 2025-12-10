// Base API client with request handling

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "")

// Request options type
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

function extractErrorMessage(errorData: unknown, fallback: string): string {
  if (!errorData) return fallback

  // Handle FastAPI validation error format: { detail: [{ msg: "...", loc: [...] }] }
  if (typeof errorData === "object" && errorData !== null) {
    const data = errorData as Record<string, unknown>

    // If detail is an array (FastAPI validation errors)
    if (Array.isArray(data.detail)) {
      const messages = data.detail
        .map((err: unknown) => {
          if (typeof err === "object" && err !== null) {
            const e = err as Record<string, unknown>
            return typeof e.msg === "string" ? e.msg : null
          }
          if (typeof err === "string") return err
          return null
        })
        .filter(Boolean)
      if (messages.length > 0) return messages.join(", ")
    }

    // If detail is a string
    if (typeof data.detail === "string") return data.detail

    // If message is a string
    if (typeof data.message === "string") return data.message

    // If error is a string
    if (typeof data.error === "string") return data.error
  }

  // If errorData itself is a string
  if (typeof errorData === "string") return errorData

  return fallback
}

// API Error class
export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  return url.toString()
}

// Base fetch function with credentials and error handling
async function fetchWithCredentials<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options
  const url = buildUrl(endpoint, params)

  const response = await fetch(url, {
    ...fetchOptions,
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { detail: response.statusText }
    }
    const errorMessage = extractErrorMessage(errorData, "An error occurred")
    throw new ApiError(errorMessage, response.status, errorData)
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T
  }

  return response.json()
}

// HTTP method helpers
export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return fetchWithCredentials<T>(endpoint, { method: "GET", params })
  },

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchWithCredentials<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchWithCredentials<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchWithCredentials<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return fetchWithCredentials<T>(endpoint, { method: "DELETE" })
  },

  // For file uploads
  upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return fetch(buildUrl(endpoint), {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }))
        throw new ApiError(errorData.detail || "Upload failed", response.status, errorData)
      }
      return response.json()
    })
  },
}

export { API_BASE_URL }
