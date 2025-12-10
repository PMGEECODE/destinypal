"use client"

import { Heart, Users, Gift, BarChart3, X } from "lucide-react"

interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
  isOpen: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  {
    id: "browse-students",
    label: "Browse Students",
    icon: Users,
    description: "Find students in need of sponsorship",
  },
  {
    id: "my-sponsorships",
    label: "My Sponsorships",
    icon: Heart,
    description: "View your sponsored students",
  },
  {
    id: "donations",
    label: "Donate to DestinyPal",
    icon: Gift,
    description: "Support our mission",
  },
  {
    id: "impact",
    label: "Our Impact",
    icon: BarChart3,
    description: "View platform statistics",
  },
]

export function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
  const handleNavClick = (id: string) => {
    onNavigate(id)
    onClose()
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-gray-200 shadow-sm transition-transform duration-300 z-40 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">DestinyPal</h1>
                <p className="text-xs text-gray-500">Changing Lives</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-2.5 py-2 rounded-lg transition-all duration-200 text-left group ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${isActive ? "text-white" : "text-gray-900"}`}>
                        {item.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
