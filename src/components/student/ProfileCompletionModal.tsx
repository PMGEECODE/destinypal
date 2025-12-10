"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  AlertCircle,
  User,
  FileText,
  CheckCircle,
  ChevronRight,
  Upload,
  Camera,
  GraduationCap,
  Building2,
  FileCheck,
  CreditCard,
  Loader2,
  MapPin,
  Calendar,
  Heart,
} from "lucide-react"

interface ProfileCompletionModalProps {
  studentId: string
  studentData: StudentProfileData | null
  documents: StudentDocument[]
  onComplete: () => void
  onNavigateToProfile: () => void
  onNavigateToDocuments: () => void
}

interface StudentProfileData {
  id: string
  full_name: string
  date_of_birth?: string
  gender?: string
  grade_level?: string
  location?: string
  photo_url?: string
  background_story?: string
  family_situation?: string
  academic_performance?: string
  institution_id?: string
  institution_name?: string
  phone?: string
  email?: string
}

interface StudentDocument {
  id: string
  document_type: string
  status: string
  file_name: string
}

type DocumentType = "passport_photo" | "academic_results" | "authority_letter" | "approval_letter" | "identification"

const requiredProfileFields = [
  { key: "full_name", label: "Full Name", icon: User },
  { key: "date_of_birth", label: "Date of Birth", icon: Calendar },
  { key: "gender", label: "Gender", icon: User },
  { key: "grade_level", label: "Grade Level / Year of Study", icon: GraduationCap },
  { key: "location", label: "Location", icon: MapPin },
  { key: "photo_url", label: "Profile Photo", icon: Camera },
  { key: "background_story", label: "Background Story", icon: Heart },
  { key: "family_situation", label: "Family Situation", icon: User },
  { key: "academic_performance", label: "Academic Performance", icon: GraduationCap },
]

const requiredDocuments: { type: DocumentType; label: string; icon: React.ElementType }[] = [
  { type: "passport_photo", label: "Passport Photo", icon: Camera },
  { type: "academic_results", label: "Academic Results", icon: GraduationCap },
  { type: "authority_letter", label: "Authority Letter", icon: Building2 },
  { type: "approval_letter", label: "School Approval Letter", icon: FileCheck },
  { type: "identification", label: "Identification Document", icon: CreditCard },
]

export function ProfileCompletionModal({
  studentId,
  studentData,
  documents,
  onComplete,
  onNavigateToProfile,
  onNavigateToDocuments,
}: ProfileCompletionModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "documents">("profile")

  // Check which profile fields are missing
  const getMissingProfileFields = () => {
    if (!studentData) return requiredProfileFields
    return requiredProfileFields.filter((field) => {
      const value = studentData[field.key as keyof StudentProfileData]
      return !value || (typeof value === "string" && value.trim() === "")
    })
  }

  // Check which documents are missing or not approved
  const getMissingDocuments = () => {
    return requiredDocuments.filter((reqDoc) => {
      const doc = documents.find((d) => d.document_type === reqDoc.type)
      return !doc || doc.status === "rejected"
    })
  }

  // Check which documents are pending
  const getPendingDocuments = () => {
    return requiredDocuments.filter((reqDoc) => {
      const doc = documents.find((d) => d.document_type === reqDoc.type)
      return doc && doc.status === "pending"
    })
  }

  // Check which documents are approved
  const getApprovedDocuments = () => {
    return requiredDocuments.filter((reqDoc) => {
      const doc = documents.find((d) => d.document_type === reqDoc.type)
      return doc && doc.status === "approved"
    })
  }

  const missingFields = getMissingProfileFields()
  const missingDocs = getMissingDocuments()
  const pendingDocs = getPendingDocuments()
  const approvedDocs = getApprovedDocuments()

  const profileComplete = missingFields.length === 0
  const documentsComplete = missingDocs.length === 0

  const totalProfileFields = requiredProfileFields.length
  const completedProfileFields = totalProfileFields - missingFields.length
  const profileProgress = (completedProfileFields / totalProfileFields) * 100

  const totalDocuments = requiredDocuments.length
  const completedDocuments = approvedDocs.length
  const documentsProgress = (completedDocuments / totalDocuments) * 100

  const overallProgress = ((completedProfileFields + completedDocuments) / (totalProfileFields + totalDocuments)) * 100

  // If everything is complete, call onComplete
  useEffect(() => {
    if (profileComplete && documentsComplete) {
      onComplete()
    }
  }, [profileComplete, documentsComplete, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Complete Your Profile</h2>
              <p className="text-white/90 text-sm">
                Your profile is incomplete. Please provide all required information and documents to access sponsorship
                opportunities.
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Completion</span>
              <span className="font-bold">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "profile"
                ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            Profile Info
            {!profileComplete && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{missingFields.length}</span>
            )}
            {profileComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "documents"
                ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
            {!documentsComplete && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{missingDocs.length}</span>
            )}
            {documentsComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* Profile Progress */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Profile Completion</span>
                  <span className="font-bold text-amber-600">
                    {completedProfileFields}/{totalProfileFields}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>
              </div>

              {/* Missing Fields */}
              {missingFields.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Missing Information ({missingFields.length})
                  </h3>
                  {missingFields.map((field) => {
                    const Icon = field.icon
                    return (
                      <div
                        key={field.key}
                        className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Icon className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-red-800">{field.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Completed Fields */}
              {completedProfileFields > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed ({completedProfileFields})
                  </h3>
                  {requiredProfileFields
                    .filter((field) => {
                      const value = studentData?.[field.key as keyof StudentProfileData]
                      return value && (typeof value !== "string" || value.trim() !== "")
                    })
                    .map((field) => {
                      const Icon = field.icon
                      return (
                        <div
                          key={field.key}
                          className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Icon className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-green-800">{field.label}</span>
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              {/* Documents Progress */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Documents Verified</span>
                  <span className="font-bold text-amber-600">
                    {approvedDocs.length}/{totalDocuments}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${documentsProgress}%` }}
                  />
                </div>
              </div>

              {/* Missing Documents */}
              {missingDocs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Missing Documents ({missingDocs.length})
                  </h3>
                  {missingDocs.map((doc) => {
                    const Icon = doc.icon
                    return (
                      <div
                        key={doc.type}
                        className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Icon className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-red-800">{doc.label}</span>
                        <Upload className="w-4 h-4 text-red-400 ml-auto" />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pending Documents */}
              {pendingDocs.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pending Review ({pendingDocs.length})
                  </h3>
                  {pendingDocs.map((doc) => {
                    const Icon = doc.icon
                    return (
                      <div
                        key={doc.type}
                        className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Icon className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-amber-800">{doc.label}</span>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full ml-auto">
                          Pending
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Approved Documents */}
              {approvedDocs.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Verified ({approvedDocs.length})
                  </h3>
                  {approvedDocs.map((doc) => {
                    const Icon = doc.icon
                    return (
                      <div
                        key={doc.type}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Icon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-800">{doc.label}</span>
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex gap-3">
            {activeTab === "profile" ? (
              <button
                onClick={onNavigateToProfile}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Update Profile Information
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onNavigateToDocuments}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Upload Documents
                <Upload className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            You cannot access sponsorship features until your profile is complete and documents are verified.
          </p>
        </div>
      </div>
    </div>
  )
}
