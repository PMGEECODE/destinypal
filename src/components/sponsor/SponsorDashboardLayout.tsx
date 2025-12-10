"use client"

import { useState, type ReactNode } from "react"
import { AuthProvider } from "../AuthPublic"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

interface SponsorDashboardLayoutProps {
  children: ReactNode
  currentView: string
  onNavigate: (view: string) => void
}

export function SponsorDashboardLayout({ children, currentView, onNavigate }: SponsorDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:ml-64 min-h-screen flex flex-col">
          <Header onMenuToggle={() => setSidebarOpen(true)} />

          <main className="flex-1 p-3">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
