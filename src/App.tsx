"use client";

import { useState, useEffect } from "react";
import {
  AuthProvider,
  AuthRouter,
  type UserType,
} from "./components/AuthPublic";
import { SponsorDashboardLayout } from "./components/sponsor/SponsorDashboardLayout";
import { StudentsInNeedDashboard } from "./components/sponsor/StudentsInNeedDashboard";
import { MySponsorshipsDashboard } from "./components/sponsor/MySponsorshipsDashboard";
import { DonationPage } from "./components/sponsor/DonationPage";
import { ImpactDashboard } from "./components/sponsor/ImpactDashboard";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { InstitutionDashboard } from "./components/institution/InstitutionDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { useRouteState, getViewForUrl } from "./hooks/useRouteState";

type View = "browse-students" | "my-sponsorships" | "donations" | "impact";
type DashboardType = "sponsor" | "student" | "institution" | "admin";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardType, setDashboardType] = useState<DashboardType | null>(
    null
  );
  const [currentView, setCurrentView] = useRouteState<View>("browse-students");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    const view = getViewForUrl(pathname);

    if (view && view.startsWith("student-")) {
      setDashboardType("student");
    } else if (view && view.startsWith("institution-")) {
      setDashboardType("institution");
    } else if (view && view.startsWith("admin-")) {
      setDashboardType("admin");
    }
  }, []);

  const handleAuthenticated = (userType: UserType) => {
    setIsAuthenticated(true);

    if (userType === "sponsor") {
      setDashboardType("sponsor");
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        if (!pathname.startsWith("/dashboard/sponsor")) {
          window.history.pushState({}, "", "/dashboard/sponsor/students");
        }
      }
    } else if (userType === "student") {
      setDashboardType("student");
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard/student");
      }
    } else if (userType === "institution") {
      setDashboardType("institution");
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard/institution");
      }
    } else if (userType === "admin") {
      setDashboardType("admin");
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard/admin");
      }
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setDashboardType(null);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
    }
  };

  if (!isAuthenticated) {
    return <AuthRouter onAuthenticated={handleAuthenticated} />;
  }

  if (dashboardType === "student") {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  if (dashboardType === "institution") {
    return <InstitutionDashboard onLogout={handleLogout} />;
  }

  if (dashboardType === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <SponsorDashboardLayout
      currentView={currentView}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentView === "browse-students" && <StudentsInNeedDashboard />}
      {currentView === "my-sponsorships" && <MySponsorshipsDashboard />}
      {currentView === "donations" && <DonationPage />}
      {currentView === "impact" && <ImpactDashboard />}
    </SponsorDashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
