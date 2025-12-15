"use client";

import type React from "react";

import {
  User,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  FileText,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import Logo from "../logo/Logo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface StudentSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  studentEmail?: string;
  onLogout?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    description: "View and edit your profile",
  },
  {
    id: "balance",
    label: "Fee Balance",
    icon: Wallet,
    description: "View your school fees and payments",
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    description: "Upload verification documents",
  },
  {
    id: "sponsors",
    label: "My Sponsors",
    icon: Heart,
    description: "See who supports your education",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Manage account preferences",
  },
  {
    id: "help",
    label: "Help & Support",
    icon: HelpCircle,
    description: "Get assistance when needed",
  },
];

export function StudentSidebar({
  currentView,
  onNavigate,
  studentEmail,
  onLogout,
}: StudentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (viewId: string) => {
    onNavigate(viewId);
    setIsOpen(false);
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="fixed bottom-6 right-6 z-50 lg:hidden bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-72 bg-gray-100 border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header with Logo */}
          <div className="border-b border-gray-300 px-6 py-8 bg-white">
            <div className="flex items-center gap-3">
              <Logo className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Student Portal
                </h1>
                <p className="text-sm text-gray-600">Destinypal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`
                    relative flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-md border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                  )}

                  <Icon
                    className={`w-6 h-6 flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <div className="flex-1">
                    <p
                      className={`font-semibold text-base ${
                        isActive ? "text-blue-900" : "text-gray-800"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        isActive ? "text-blue-700" : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer – User info & logout */}
          {studentEmail && (
            <div className="border-t border-gray-300 bg-white p-5">
              <div className="mb-4 rounded-xl bg-gray-50 p-4 shadow-sm border border-gray-200">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Logged in as
                </p>
                <p className="mt-1 truncate text-sm font-bold text-gray-900">
                  {studentEmail}
                </p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
