"use client"

import { useState, useEffect, useCallback } from "react"

// Route mapping for URL encoding/obfuscation
const ROUTE_MAP: Record<string, string> = {
  // Public routes
  landing: "",
  login: "login",
  "forgot-password": "forgot-password",
  "reset-password": "reset-password",
  "register-select": "register",
  "register-sponsor": "register/sponsor",
  "register-institution": "register/institution",
  "register-student": "register/student",
  "register-student-highschool": "register/student/highschool",
  "register-student-university": "register/student/university",
  "verify-email": "verify-email",
  "verify-sms": "verify-sms",
  "2fa-setup": "2fa-setup",
  "2fa-verify": "2fa-verify",
  "oauth-callback": "auth/callback",
  about: "about",
  contact: "contact",
  terms: "terms",
  privacy: "privacy",
  // Sponsor dashboard routes
  "browse-students": "dashboard/sponsor/students",
  "my-sponsorships": "dashboard/sponsor/sponsorships",
  donations: "dashboard/sponsor/donations",
  impact: "dashboard/sponsor/impact",
  "sponsor-settings": "dashboard/sponsor/settings",
  "sponsor-profile": "dashboard/sponsor/profile",
  // Student dashboard routes
  "student-dashboard": "dashboard/student",
  "student-profile": "dashboard/student/profile",
  "student-documents": "dashboard/student/documents",
  "student-sponsors": "dashboard/student/sponsors",
  "student-settings": "dashboard/student/settings",
  "student-help": "dashboard/student/help",
  // Institution dashboard routes
  "institution-dashboard": "dashboard/institution",
  "institution-students": "dashboard/institution/students",
  "institution-reports": "dashboard/institution/reports",
  "institution-settings": "dashboard/institution/settings",
  // Admin dashboard routes
  "admin-dashboard": "dashboard/admin",
  "admin-users": "dashboard/admin/users",
  "admin-institutions": "dashboard/admin/institutions",
  "admin-sponsors": "dashboard/admin/sponsors",
  "admin-students": "dashboard/admin/students",
  "admin-settings": "dashboard/admin/settings",
}

// Reverse mapping for URL to view
const URL_TO_VIEW_MAP: Record<string, string> = Object.entries(ROUTE_MAP).reduce(
  (acc, [view, url]) => {
    acc[url] = view
    return acc
  },
  {} as Record<string, string>,
)

/**
 * Hook to sync route state with browser URL
 * @param defaultView - The default view to show if no URL match
 * @returns [currentView, setView] - Current view and setter that updates URL
 */
export function useRouteState<T extends string>(defaultView: T): [T, (view: T) => void] {
  const [currentView, setCurrentView] = useState<T>(defaultView)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const pathname = window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
    const matchedView = URL_TO_VIEW_MAP[pathname]

    if (matchedView) {
      setCurrentView(matchedView as T)
    } else if (pathname === "") {
      setCurrentView(defaultView)
    }

    setIsInitialized(true)
  }, [defaultView])

  // Listen for browser back/forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = () => {
      const pathname = window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
      const matchedView = URL_TO_VIEW_MAP[pathname]

      if (matchedView) {
        setCurrentView(matchedView as T)
      } else if (pathname === "") {
        setCurrentView(defaultView)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [defaultView])

  // Update URL when view changes (only after initialization)
  const setView = useCallback((view: T) => {
    setCurrentView(view)

    if (typeof window === "undefined") return

    const urlPath = ROUTE_MAP[view as string]
    const newUrl = urlPath ? `/${urlPath}` : "/"

    // Only push state if URL is different
    if (window.location.pathname !== newUrl) {
      window.history.pushState({ view }, "", newUrl)
    }
  }, [])

  // Set initial URL on mount if it doesn't match default
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return

    const pathname = window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
    const currentUrlView = URL_TO_VIEW_MAP[pathname]

    // If URL doesn't match any view and we're on root, set the default URL
    if (!currentUrlView && pathname === "" && currentView !== defaultView) {
      const urlPath = ROUTE_MAP[currentView as string]
      if (urlPath) {
        window.history.replaceState({ view: currentView }, "", `/${urlPath}`)
      }
    }
  }, [isInitialized, currentView, defaultView])

  return [currentView, setView]
}

/**
 * Get the URL path for a given view
 */
export function getUrlForView(view: string): string {
  const urlPath = ROUTE_MAP[view]
  return urlPath ? `/${urlPath}` : "/"
}

/**
 * Get the view for a given URL path
 */
export function getViewForUrl(pathname: string): string | undefined {
  const normalizedPath = pathname.replace(/^\//, "").replace(/\/$/, "")
  return URL_TO_VIEW_MAP[normalizedPath]
}
