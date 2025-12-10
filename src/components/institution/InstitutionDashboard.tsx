"use client"

import { useState } from "react"
import { InstitutionSidebar } from "./InstitutionSidebar"
import { InstitutionHeader } from "./InstitutionHeader"
import { InstitutionHome } from "./InstitutionHome"
import { InstitutionStudents } from "./InstitutionStudents"
import { InstitutionRegisterStudent } from "./InstitutionRegisterStudent"
import { InstitutionProfile } from "./InstitutionProfile"
import { InstitutionSettings } from "./InstitutionSettings"
import { InstitutionHelp } from "./InstitutionHelp"
import { useAuth } from "../AuthPublic/AuthContext"

type InstitutionView = "home" | "students" | "register" | "profile" | "settings" | "help"

interface InstitutionDashboardProps {
  onLogout: () => void
}

export function InstitutionDashboard({ onLogout }: InstitutionDashboardProps) {
  const [currentView, setCurrentView] = useState<InstitutionView>("home")
  const { user } = useAuth()
  const institutionEmail = user?.email || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <InstitutionHeader institutionEmail={institutionEmail} onLogout={onLogout} />

      <div className="flex">
        <InstitutionSidebar currentView={currentView} onNavigate={(view) => setCurrentView(view as InstitutionView)} />

        <main className="flex-1 lg:ml-64 mt-16">
          {currentView === "home" && <InstitutionHome institutionEmail={institutionEmail} />}
          {currentView === "students" && <InstitutionStudents institutionEmail={institutionEmail} />}
          {currentView === "register" && (
            <InstitutionRegisterStudent
              institutionEmail={institutionEmail}
              onSuccess={() => setCurrentView("students")}
            />
          )}
          {currentView === "profile" && <InstitutionProfile institutionEmail={institutionEmail} />}
          {currentView === "settings" && <InstitutionSettings institutionEmail={institutionEmail} />}
          {currentView === "help" && <InstitutionHelp institutionEmail={institutionEmail} />}
        </main>
      </div>
    </div>
  )
}
