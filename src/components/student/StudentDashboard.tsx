"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { StudentSidebar } from "./StudentSidebar";
import { StudentHeader } from "./StudentHeader";
import { StudentProfile } from "./StudentProfile";
import { StudentSponsors } from "./StudentSponsors";
import { StudentSettings } from "./StudentSettings";
import { StudentHelp } from "./StudentHelp";
import { StudentDocuments } from "./StudentDocuments";
import { ProfileCompletionModal } from "./ProfileCompletionModal";
import { authStore, studentStore, type UserProfile } from "../../lib/api";
import { StudentFeeBalance as StudentFeeBalanceView } from "./StudentFeeBalance";

type StudentView =
  | "profile"
  | "documents"
  | "sponsors"
  | "settings"
  | "help"
  | "balance";

interface StudentDashboardProps {
  onLogout?: () => void;
}

interface ProfileCompletenessData {
  student: any;
  documents: any[];
  isComplete: boolean;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [currentView, setCurrentView] = useState<StudentView>("profile");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] =
    useState<ProfileCompletenessData | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [checkingCompleteness, setCheckingCompleteness] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await authStore.getCurrentUser();
      setUser(currentUser);

      try {
        const studentData = await studentStore.getStudentByUserId(
          currentUser.id
        );
        setStudentId(studentData.id);

        await checkProfileCompleteness(studentData.id, studentData);
      } catch (studentErr) {
        console.error("Error fetching student profile:", studentErr);
        setStudentId(null);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to load user profile. Please try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  const checkProfileCompleteness = async (
    studId: string,
    studentData?: any
  ) => {
    try {
      setCheckingCompleteness(true);

      // Get student data if not provided
      const student =
        studentData || (await studentStore.getStudentById(studId));

      // Get documents
      let documents: any[] = [];
      try {
        documents = await studentStore.getStudentDocuments(studId);
      } catch {
        documents = [];
      }

      // Check required profile fields
      const requiredFields = [
        "full_name",
        "date_of_birth",
        "gender",
        "grade_level",
        "location",
        "photo_url",
        "background_story",
        "family_situation",
        "academic_performance",
      ];

      const missingFields = requiredFields.filter((field) => {
        const value = student[field];
        return !value || (typeof value === "string" && value.trim() === "");
      });

      // Check required documents
      const requiredDocTypes = [
        "passport_photo",
        "academic_results",
        "authority_letter",
        "approval_letter",
        "identification",
      ];

      const missingDocs = requiredDocTypes.filter((docType) => {
        const doc = documents.find((d: any) => d.document_type === docType);
        return !doc || doc.status === "rejected";
      });

      const isComplete = missingFields.length === 0 && missingDocs.length === 0;

      setProfileData({
        student,
        documents,
        isComplete,
      });

      // Show modal if profile is incomplete
      if (!isComplete) {
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error("Error checking profile completeness:", err);
    } finally {
      setCheckingCompleteness(false);
    }
  };

  const refreshCompleteness = useCallback(async () => {
    if (studentId) {
      await checkProfileCompleteness(studentId);
    }
  }, [studentId]);

  const handleLogout = async () => {
    try {
      await authStore.logout();
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const handleNavigateToProfile = () => {
    setCurrentView("profile");
    setShowCompletionModal(false);
  };

  const handleNavigateToDocuments = () => {
    setCurrentView("documents");
    setShowCompletionModal(false);
  };

  const handleCompletionModalClose = () => {
    // Only close if profile is complete
    if (profileData?.isComplete) {
      setShowCompletionModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Please log in to access your student dashboard."}
          </p>
          <button
            onClick={onLogout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Student Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Your student profile has not been created yet. Please contact your
            institution administrator to set up your profile.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex">
      {showCompletionModal && profileData && !profileData.isComplete && (
        <ProfileCompletionModal
          studentId={studentId}
          studentData={profileData.student}
          documents={profileData.documents}
          onComplete={handleCompletionModalClose}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToDocuments={handleNavigateToDocuments}
        />
      )}

      <StudentSidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as StudentView)}
        studentEmail={user.email}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        <StudentHeader
          studentEmail={user.email}
          studentName={profileData?.student?.full_name}
          onLogout={handleLogout}
          onNavigate={(view) => setCurrentView(view as StudentView)}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {currentView === "profile" && (
              <StudentProfile
                studentId={studentId}
                onProfileUpdate={refreshCompleteness}
              />
            )}
            {currentView === "balance" && (
              <StudentFeeBalanceView studentId={studentId} />
            )}
            {currentView === "documents" && (
              <StudentDocuments
                studentId={studentId}
                onDocumentsUpdate={refreshCompleteness}
              />
            )}
            {currentView === "sponsors" && (
              <StudentSponsors studentId={studentId} />
            )}
            {currentView === "settings" && (
              <StudentSettings userId={user.id} userEmail={user.email} />
            )}
            {currentView === "help" && <StudentHelp userEmail={user.email} />}
          </div>
        </main>
      </div>
    </div>
  );
}
