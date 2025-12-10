"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../AuthPublic/AuthContext"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { AdminHome } from "./AdminHome"
import { AdminUsers } from "./AdminUsers"
import { AdminStudents } from "./AdminStudents"
import { AdminInstitutions } from "./AdminInstitutions"
import { AdminSponsors } from "./AdminSponsors"
import { AdminPayments } from "./AdminPayments"
import { AdminDonations } from "./AdminDonations"
import { AdminAnalytics } from "./AdminAnalytics"
import { AdminSettings } from "./AdminSettings"
import { AdminCompliance } from "./AdminCompliance"
import { AdminMessages } from "./AdminMessages"
import { AdminNotifications } from "./AdminNotifications"
import { contactStore } from "../../lib/api/contactStore"

type AdminView =
  | "home"
  | "users"
  | "students"
  | "institutions"
  | "sponsors"
  | "compliance"
  | "messages"
  | "notifications"
  | "payments"
  | "donations"
  | "analytics"
  | "settings"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { user } = useAuth()
  const adminEmail = user?.email || ""

  const [currentView, setCurrentView] = useState<AdminView>("home")
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await contactStore.getUnreadCount()
        setUnreadMessageCount(response.unread_count)
      } catch (err) {
        console.error("Failed to fetch unread count:", err)
      }
    }

    fetchUnreadCount()
  }, [])

  const handleNavigateToNotifications = () => {
    setCurrentView("notifications")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <AdminHeader
        adminEmail={adminEmail}
        onLogout={onLogout}
        unreadMessageCount={unreadMessageCount + unreadNotificationCount}
        onNotificationClick={handleNavigateToNotifications}
      />

      <div className="flex">
        <AdminSidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view as AdminView)}
          unreadNotificationCount={unreadNotificationCount}
        />

        <main className="flex-1 lg:ml-64 mt-16">
          {currentView === "home" && <AdminHome adminEmail={adminEmail} />}
          {currentView === "users" && <AdminUsers adminEmail={adminEmail} />}
          {currentView === "students" && <AdminStudents adminEmail={adminEmail} />}
          {currentView === "institutions" && <AdminInstitutions adminEmail={adminEmail} />}
          {currentView === "sponsors" && <AdminSponsors adminEmail={adminEmail} />}
          {currentView === "compliance" && <AdminCompliance adminEmail={adminEmail} />}
          {currentView === "messages" && (
            <AdminMessages adminEmail={adminEmail} onUnreadCountChange={setUnreadMessageCount} />
          )}
          {currentView === "notifications" && (
            <AdminNotifications adminEmail={adminEmail} onUnreadCountChange={setUnreadNotificationCount} />
          )}
          {currentView === "payments" && <AdminPayments adminEmail={adminEmail} />}
          {currentView === "donations" && <AdminDonations adminEmail={adminEmail} />}
          {currentView === "analytics" && <AdminAnalytics adminEmail={adminEmail} />}
          {currentView === "settings" && <AdminSettings adminEmail={adminEmail} />}
        </main>
      </div>
    </div>
  )
}
