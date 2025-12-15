"use client";

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
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  unreadNotificationCount?: number;
  unreadMessageCount?: number;
}

const NAV_ITEMS = [
  {
    id: "home",
    label: "Dashboard",
    icon: Home,
    description: "Overview & metrics",
  },
  { id: "users", label: "All Users", icon: Users, description: "System users" },
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
    badgeType: "notifications" as const,
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    description: "Contact submissions",
    hasBadge: true,
    badgeType: "messages" as const,
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
];

export function AdminSidebar({
  currentView,
  onNavigate,
  unreadNotificationCount = 0,
  unreadMessageCount = 0,
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  const getBadgeCount = (badgeType?: "notifications" | "messages") => {
    if (badgeType === "notifications") return unreadNotificationCount;
    if (badgeType === "messages") return unreadMessageCount;
    return 0;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="fixed bottom-6 right-6 z-50 lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
          shadow-lg transition-transform duration-300 ease-out z-40
          lg:translate-x-0 lg:shadow-md
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          group  /* For hover detection */
        `}
      >
        {/* Scrollable Container with Padding for Absolute Scrollbar */}
        <div className="h-full px-4 py-6 overflow-y-auto scrollbar-container">
          <nav className="space-y-1.5 pr-2">
            {" "}
            {/* pr-2 reserves space on right for scrollbar */}
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const badgeCount = item.hasBadge
                ? getBadgeCount(item.badgeType)
                : 0;
              const showBadge = badgeCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl transition-all duration-200 text-left
                    flex items-start gap-3 group/item
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon
                      className={`
                        w-5 h-5 mt-0.5 flex-shrink-0
                        ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-500 group-hover/item:text-gray-700"
                        }
                      `}
                    />
                    {showBadge && (
                      <span className="absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                        font-medium text-sm truncate
                        ${isActive ? "text-blue-700" : "text-gray-900"}
                      `}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`
                        text-xs mt-0.5 truncate
                        ${isActive ? "text-blue-600" : "text-gray-500"}
                      `}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Custom Absolute Scrollbar Overlay */}
        <style jsx>{`
          .scrollbar-container {
            scrollbar-width: none; /* Firefox: hide default */
            -ms-overflow-style: none; /* IE/Edge: hide default */
          }
          .scrollbar-container::-webkit-scrollbar {
            display: none; /* Chrome/Safari: hide default */
          }

          /* Custom absolute scrollbar */
          .scrollbar-container {
            position: relative;
          }

          .scrollbar-container::after {
            content: "";
            position: absolute;
            top: 0;
            right: 4px;
            width: 5px;
            height: 100%;
            background: transparent;
            border-radius: 9999px;
            opacity: 0;
            transition: opacity 0.3s ease-out, background-color 0.3s ease-out;
            pointer-events: none;
            z-index: 10;
          }

          /* Show & color thumb on hover or when mobile open */
          .group:hover .scrollbar-container::after,
          .scrollbar-container:hover::after {
            opacity: 1;
            background-color: rgba(156, 163, 175, 0.6); /* gray-400 */
          }

          /* Darker on actual hover */
          .group:hover .scrollbar-container:hover::after {
            background-color: rgba(107, 114, 128, 0.8); /* gray-500 */
          }

          /* Always visible when mobile sidebar is open */
          @media (max-width: 1023px) {
            .translate-x-0 .scrollbar-container::after {
              opacity: 1;
              background-color: rgba(156, 163, 175, 0.6);
            }
          }
        `}</style>
      </aside>

      {/* Mobile Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`
          fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden
          ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        aria-hidden="true"
      />
    </>
  );
}
