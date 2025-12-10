// "use client"

// import { useState } from "react"
// import { AuthProvider, AuthRouter, type UserType } from "./components/AuthPublic"
// import { SponsorDashboardLayout } from "./components/sponsor/SponsorDashboardLayout"
// import { StudentsInNeedDashboard } from "./components/sponsor/StudentsInNeedDashboard"
// import { MySponsorshipsDashboard } from "./components/sponsor/MySponsorshipsDashboard"
// import { DonationModal } from "./components/sponsor/DonationModal"
// import { ImpactDashboard } from "./components/sponsor/ImpactDashboard"
// import { StudentDashboard } from "./components/student/StudentDashboard"
// import { InstitutionDashboard } from "./components/institution/InstitutionDashboard"
// import { AdminDashboard } from "./components/admin/AdminDashboard"
// import { api } from "./lib/api"

// type View = "browse-students" | "my-sponsorships" | "donations" | "impact"
// type DashboardType = "sponsor" | "student" | "institution" | "admin"

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [dashboardType, setDashboardType] = useState<DashboardType | null>(null)
//   const [currentView, setCurrentView] = useState<View>("browse-students")
//   const [showDonationModal, setShowDonationModal] = useState(false)

//   const handleAuthenticated = (userType: UserType) => {
//     setIsAuthenticated(true)
//     if (userType === "sponsor") {
//       setDashboardType("sponsor")
//     } else if (userType === "student") {
//       setDashboardType("student")
//     } else if (userType === "institution") {
//       setDashboardType("institution")
//     } else if (userType === "admin") {
//       setDashboardType("admin")
//     }
//   }

//   const handleNavigate = (view: string) => {
//     if (view === "donations") {
//       setShowDonationModal(true)
//     } else {
//       setCurrentView(view as View)
//     }
//   }

//   const handleDonationSubmit = async (data: {
//     donor_name: string
//     donor_email: string
//     amount: number
//     payment_method: string
//     message: string | null
//     transaction_id?: string
//   }) => {
//     try {
//       await api.createDonation({
//         donor_name: data.donor_name,
//         donor_email: data.donor_email,
//         amount: data.amount,
//         message: data.message || undefined,
//       })
//       setShowDonationModal(false)
//     } catch (error) {
//       console.error("Error creating donation:", error)
//       throw error
//     }
//   }

//   if (!isAuthenticated) {
//     return (
//       <AuthProvider>
//         <AuthRouter onAuthenticated={handleAuthenticated} />
//       </AuthProvider>
//     )
//   }

//   if (dashboardType === "student") {
//     return <StudentDashboard />
//   }

//   if (dashboardType === "institution") {
//     return <InstitutionDashboard />
//   }

//   if (dashboardType === "admin") {
//     return <AdminDashboard />
//   }

//   return (
//     <SponsorDashboardLayout currentView={currentView} onNavigate={handleNavigate}>
//       {currentView === "browse-students" && <StudentsInNeedDashboard />}
//       {currentView === "my-sponsorships" && <MySponsorshipsDashboard />}
//       {currentView === "impact" && <ImpactDashboard />}

//       {showDonationModal && (
//         <DonationModal onClose={() => setShowDonationModal(false)} onSubmit={handleDonationSubmit} />
//       )}
//     </SponsorDashboardLayout>
//   )
// }

// export default App

// "use client"

// import { useState } from "react"
// import { AuthProvider, AuthRouter, type UserType } from "./components/AuthPublic"
// import { SponsorDashboardLayout } from "./components/sponsor/SponsorDashboardLayout"
// import { StudentsInNeedDashboard } from "./components/sponsor/StudentsInNeedDashboard"
// import { MySponsorshipsDashboard } from "./components/sponsor/MySponsorshipsDashboard"
// import { DonationPage } from "./components/sponsor/DonationPage"
// import { ImpactDashboard } from "./components/sponsor/ImpactDashboard"
// import { StudentDashboard } from "./components/student/StudentDashboard"
// import { InstitutionDashboard } from "./components/institution/InstitutionDashboard"
// import { AdminDashboard } from "./components/admin/AdminDashboard"

// type View = "browse-students" | "my-sponsorships" | "donations" | "impact"
// type DashboardType = "sponsor" | "student" | "institution" | "admin"

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [dashboardType, setDashboardType] = useState<DashboardType | null>(null)
//   const [currentView, setCurrentView] = useState<View>("browse-students")

//   const handleAuthenticated = (userType: UserType) => {
//     setIsAuthenticated(true)
//     if (userType === "sponsor") {
//       setDashboardType("sponsor")
//     } else if (userType === "student") {
//       setDashboardType("student")
//     } else if (userType === "institution") {
//       setDashboardType("institution")
//     } else if (userType === "admin") {
//       setDashboardType("admin")
//     }
//   }

//   const handleNavigate = (view: string) => {
//     setCurrentView(view as View)
//   }

//   if (!isAuthenticated) {
//     return (
//       <AuthProvider>
//         <AuthRouter onAuthenticated={handleAuthenticated} />
//       </AuthProvider>
//     )
//   }

//   if (dashboardType === "student") {
//     return <StudentDashboard />
//   }

//   if (dashboardType === "institution") {
//     return <InstitutionDashboard />
//   }

//   if (dashboardType === "admin") {
//     return <AdminDashboard />
//   }

//   return (
//     <SponsorDashboardLayout currentView={currentView} onNavigate={handleNavigate}>
//       {currentView === "browse-students" && <StudentsInNeedDashboard />}
//       {currentView === "my-sponsorships" && <MySponsorshipsDashboard />}
//       {currentView === "donations" && <DonationPage />}
//       {currentView === "impact" && <ImpactDashboard />}
//     </SponsorDashboardLayout>
//   )
// }

// export default App


"use client"

import { useState, useEffect } from "react"
import { AuthProvider, AuthRouter, type UserType } from "./components/AuthPublic"
import { SponsorDashboardLayout } from "./components/sponsor/SponsorDashboardLayout"
import { StudentsInNeedDashboard } from "./components/sponsor/StudentsInNeedDashboard"
import { MySponsorshipsDashboard } from "./components/sponsor/MySponsorshipsDashboard"
import { DonationPage } from "./components/sponsor/DonationPage"
import { ImpactDashboard } from "./components/sponsor/ImpactDashboard"
import { StudentDashboard } from "./components/student/StudentDashboard"
import { InstitutionDashboard } from "./components/institution/InstitutionDashboard"
import { AdminDashboard } from "./components/admin/AdminDashboard"
import { useRouteState, getViewForUrl } from "./hooks/useRouteState"

type View = "browse-students" | "my-sponsorships" | "donations" | "impact"
type DashboardType = "sponsor" | "student" | "institution" | "admin"

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dashboardType, setDashboardType] = useState<DashboardType | null>(null)
  const [currentView, setCurrentView] = useRouteState<View>("browse-students")

  useEffect(() => {
    if (typeof window === "undefined") return

    const pathname = window.location.pathname
    const view = getViewForUrl(pathname)

    if (view && view.startsWith("student-")) {
      setDashboardType("student")
    } else if (view && view.startsWith("institution-")) {
      setDashboardType("institution")
    } else if (view && view.startsWith("admin-")) {
      setDashboardType("admin")
    }
  }, [])

  const handleAuthenticated = (userType: UserType) => {
    setIsAuthenticated(true)

    if (userType === "sponsor") {
      setDashboardType("sponsor")
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname
        if (!pathname.startsWith("/dashboard/sponsor")) {
          window.history.pushState({}, "", "/dashboard/sponsor/students")
        }
      }
    } else if (userType === "student") {
      setDashboardType("student")
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard/student")
      }
    } else if (userType === "institution") {
      setDashboardType("institution")
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard/institution")
      }
    } else if (userType === "admin") {
      setDashboardType("admin")
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard/admin")
      }
    }
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view as View)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setDashboardType(null)
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/")
    }
  }

  if (!isAuthenticated) {
    return <AuthRouter onAuthenticated={handleAuthenticated} />
  }

  if (dashboardType === "student") {
    return <StudentDashboard onLogout={handleLogout} />
  }

  if (dashboardType === "institution") {
    return <InstitutionDashboard onLogout={handleLogout} />
  }

  if (dashboardType === "admin") {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <SponsorDashboardLayout currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout}>
      {currentView === "browse-students" && <StudentsInNeedDashboard />}
      {currentView === "my-sponsorships" && <MySponsorshipsDashboard />}
      {currentView === "donations" && <DonationPage />}
      {currentView === "impact" && <ImpactDashboard />}
    </SponsorDashboardLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
