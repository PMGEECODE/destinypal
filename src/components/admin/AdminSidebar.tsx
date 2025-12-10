"use client"

import {
  Home,
  Users,
  GraduationCap,
  Building2,
  Heart,
  DollarSign,
  Gift,
  BarChart3,
  Settings,
  Menu,
  X,
  Shield,
  MessageSquare,
  Bell,
} from "lucide-react"
import { useState, useEffect } from "react"

interface AdminSidebarProps {
  currentView: string
  onNavigate: (view: string) => void
  unreadNotificationCount?: number
}

const NAV_ITEMS = [
  {
    id: "home",
    label: "Dashboard",
    icon: Home,
    description: "Overview & metrics",
  },
  {
    id: "users",
    label: "All Users",
    icon: Users,
    description: "System users",
  },
  {
    id: "students",
    label: "Students",
    icon: GraduationCap,
    description: "Student management",
  },
  {
    id: "institutions",
    label: "Institutions",
    icon: Building2,
    description: "Schools & universities",
  },
  {
    id: "sponsors",
    label: "Sponsors",
    icon: Heart,
    description: "Sponsor management",
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    description: "Blacklist & whitelist",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Registration alerts",
    hasBadge: true,
    badgeType: "notifications",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    description: "Contact submissions",
    hasBadge: true,
    badgeType: "messages",
  },
  {
    id: "payments",
    label: "Payments",
    icon: DollarSign,
    description: "Transaction tracking",
  },
  {
    id: "donations",
    label: "Donations",
    icon: Gift,
    description: "Organization donations",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Advanced reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System configuration",
  },
]

export function AdminSidebar({ currentView, onNavigate, unreadNotificationCount = 0 }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [localNotificationCount, setLocalNotificationCount] = useState(unreadNotificationCount)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (unreadNotificationCount === 0) {
          setLocalNotificationCount(0)
        }
      } catch (err) {
        console.error("Failed to fetch counts:", err)
      }
    }

    fetchCounts()
    const interval = setInterval(fetchCounts, 60000)
    return () => clearInterval(interval)
  }, [unreadNotificationCount])

  useEffect(() => {
    setLocalNotificationCount(unreadNotificationCount)
  }, [unreadNotificationCount])

  const handleNavClick = (id: string) => {
    onNavigate(id)
    setIsOpen(false)
  }

  const getBadgeCount = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.badgeType === "messages") return unreadMessageCount
    if (item.badgeType === "notifications") return localNotificationCount
    return 0
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 z-40 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="h-full px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const badgeCount = item.hasBadge ? getBadgeCount(item) : 0
            const showBadge = badgeCount > 0
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />
    </>
  )
}

function App() {
  return (
    <div>
      <AdminSidebar currentView="home" onNavigate={() => {}} />
    </div>
  )
}

export default App
