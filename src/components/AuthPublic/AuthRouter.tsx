"use client";

import React from "react";
import { useAuth } from "./AuthContext";
import { Login } from "./Login";
import { ForgotPassword } from "./ForgotPassword";
import { ResetPassword } from "./ResetPassword";
import { RegisterSelector } from "./register/RegisterSelector";
import { SponsorRegister } from "./register/SponsorRegister";
import { InstitutionRegister } from "./register/InstitutionRegister";
import { StudentRegister } from "./register/StudentRegister";
import { HighSchoolStudentRegister } from "./register/HighSchoolStudentRegister";
import { UniversityStudentRegister } from "./register/UniversityStudentRegister";
import { VerifyEmail } from "./VerifyEmail";
import { VerifySMS } from "./VerifySMS";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { TwoFactorVerify } from "./TwoFactorVerify";
import { OAuthCallback } from "./OAuthCallback";
import {
  AboutUs,
  Contact,
  TermsOfService,
  PrivacyPolicy,
  LandingPage,
  DonatePage,
} from "../pages";
import type { UserRole, StudentType } from "./types";
import { Loader2 } from "lucide-react";
import { useRouteState } from "../../hooks/useRouteState";

type AuthView =
  | "landing"
  | "login"
  | "forgot-password"
  | "reset-password"
  | "register-select"
  | "register-sponsor"
  | "register-institution"
  | "register-student"
  | "register-student-highschool"
  | "register-student-university"
  | "verify-email"
  | "verify-sms"
  | "2fa-setup"
  | "2fa-verify"
  | "oauth-callback"
  | "about"
  | "contact"
  | "terms"
  | "privacy"
  | "donate"; // Added donate view type

interface AuthRouterProps {
  onAuthenticated: (userType: UserRole) => void;
  initialView?: AuthView;
}

export const AuthRouter: React.FC<AuthRouterProps> = ({
  onAuthenticated,
  initialView = "landing",
}) => {
  const { user, isLoading, twoFactorRequired, twoFactorMethod } = useAuth();
  const [currentView, setCurrentView] = useRouteState<AuthView>(initialView);
  const [pendingEmail, setPendingEmail] = React.useState<string>("");
  const [pendingPhone] = React.useState<string>("");
  const [registeredUserType, setRegisteredUserType] =
    React.useState<UserRole | null>(null);

  // Handle special URL cases (password recovery, OAuth callback)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.substring(1));

    if (hashParams.get("type") === "recovery") {
      setCurrentView("reset-password");
    }

    if (
      url.pathname.includes("/auth/callback") ||
      hashParams.get("access_token")
    ) {
      setCurrentView("oauth-callback");
    }
  }, [setCurrentView]);

  // Handle 2FA requirement
  React.useEffect(() => {
    if (twoFactorRequired && twoFactorMethod) {
      setCurrentView("2fa-verify");
    }
  }, [twoFactorRequired, twoFactorMethod, setCurrentView]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (user && !twoFactorRequired) {
    const userType =
      (user.user_metadata?.user_type as UserRole) || user.role || "sponsor";
    onAuthenticated(userType);
    return null;
  }

  const handleRegistrationComplete = (userType: UserRole, email?: string) => {
    setRegisteredUserType(userType);
    if (email) {
      setPendingEmail(email);
      setCurrentView("verify-email");
    } else {
      setCurrentView("2fa-setup");
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return (
          <LandingPage
            onNavigateToLogin={() => setCurrentView("login")}
            onNavigateToRegister={() => setCurrentView("register-select")}
            onNavigateToAbout={() => setCurrentView("about")}
            onNavigateToContact={() => setCurrentView("contact")}
            onNavigateToDonate={() => setCurrentView("donate")} // Added donate navigation handler
          />
        );

      case "login":
        return (
          <Login
            onForgotPassword={() => setCurrentView("forgot-password")}
            onRegister={() => setCurrentView("register-select")}
            onSuccess={() => {
              if (twoFactorRequired) {
                setCurrentView("2fa-verify");
              }
            }}
            onNavigateToTerms={() => setCurrentView("terms")}
            onNavigateToPrivacy={() => setCurrentView("privacy")}
            onNavigateToAbout={() => setCurrentView("about")}
            onNavigateToContact={() => setCurrentView("contact")}
            onNavigateToLanding={() => setCurrentView("landing")}
          />
        );

      case "forgot-password":
        return <ForgotPassword onBack={() => setCurrentView("login")} />;

      case "reset-password":
        return (
          <ResetPassword
            onSuccess={() => setCurrentView("login")}
            onBack={() => setCurrentView("login")}
          />
        );

      case "register-select":
        return (
          <RegisterSelector
            onSelectRole={(role: UserRole) => {
              switch (role) {
                case "sponsor":
                  setCurrentView("register-sponsor");
                  break;
                case "institution":
                  setCurrentView("register-institution");
                  break;
                case "student":
                  setCurrentView("register-student");
                  break;
              }
            }}
            onBack={() => setCurrentView("login")}
          />
        );

      case "register-sponsor":
        return (
          <SponsorRegister
            onBack={() => setCurrentView("register-select")}
            onSuccess={() =>
              handleRegistrationComplete("sponsor", pendingEmail)
            }
            onLogin={() => setCurrentView("login")}
          />
        );

      case "register-institution":
        return (
          <InstitutionRegister
            onBack={() => setCurrentView("register-select")}
            onSuccess={() =>
              handleRegistrationComplete("institution", pendingEmail)
            }
            onLogin={() => setCurrentView("login")}
          />
        );

      case "register-student":
        return (
          <StudentRegister
            onSelectType={(type: StudentType) => {
              if (type === "high_school") {
                setCurrentView("register-student-highschool");
              } else {
                setCurrentView("register-student-university");
              }
            }}
            onBack={() => setCurrentView("register-select")}
            onLogin={() => setCurrentView("login")}
          />
        );

      case "register-student-highschool":
        return (
          <HighSchoolStudentRegister
            onBack={() => setCurrentView("register-student")}
            onSuccess={() =>
              handleRegistrationComplete("student", pendingEmail)
            }
            onLogin={() => setCurrentView("login")}
          />
        );

      case "register-student-university":
        return (
          <UniversityStudentRegister
            onBack={() => setCurrentView("register-student")}
            onSuccess={() =>
              handleRegistrationComplete("student", pendingEmail)
            }
            onLogin={() => setCurrentView("login")}
          />
        );

      case "verify-email":
        return (
          <VerifyEmail
            email={pendingEmail}
            onVerified={() => setCurrentView("2fa-setup")}
            onBack={() => setCurrentView("login")}
          />
        );

      case "verify-sms":
        return (
          <VerifySMS
            phone={pendingPhone}
            onVerified={() => setCurrentView("2fa-setup")}
            onBack={() => setCurrentView("login")}
          />
        );

      case "2fa-setup":
        return (
          <TwoFactorSetup
            onComplete={() => {
              if (registeredUserType) {
                onAuthenticated(registeredUserType);
              }
            }}
            onSkip={() => {
              if (registeredUserType) {
                onAuthenticated(registeredUserType);
              }
            }}
            onBack={() => setCurrentView("login")}
          />
        );

      case "2fa-verify":
        return (
          <TwoFactorVerify
            method={twoFactorMethod || "email"}
            onVerified={() => {
              const userType =
                (user?.user_metadata?.user_type as UserRole) ||
                user?.role ||
                "sponsor";
              onAuthenticated(userType);
            }}
            onCancel={() => setCurrentView("login")}
            onUseBackupCode={() => {}}
          />
        );

      case "oauth-callback":
        return (
          <OAuthCallback
            onSuccess={() => {
              const userType =
                (user?.user_metadata?.user_type as UserRole) ||
                user?.role ||
                "sponsor";
              onAuthenticated(userType);
            }}
            onError={() => setCurrentView("login")}
          />
        );

      case "about":
        return <AboutUs onBack={() => setCurrentView("landing")} />;

      case "contact":
        return <Contact onBack={() => setCurrentView("landing")} />;

      case "terms":
        return <TermsOfService onBack={() => setCurrentView("login")} />;

      case "privacy":
        return <PrivacyPolicy onBack={() => setCurrentView("login")} />;

      case "donate":
        return (
          <div>
            <DonatePage />
            <button
              onClick={() => setCurrentView("landing")}
              className="fixed top-4 left-4 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg shadow-md transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        );

      default:
        return (
          <LandingPage
            onNavigateToLogin={() => setCurrentView("login")}
            onNavigateToRegister={() => setCurrentView("register-select")}
            onNavigateToAbout={() => setCurrentView("about")}
            onNavigateToContact={() => setCurrentView("contact")}
            onNavigateToDonate={() => setCurrentView("donate")} // Added donate navigation handler
          />
        );
    }
  };

  return renderView();
};

export default AuthRouter;
