"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Camera,
  GraduationCap,
  FileCheck,
  Award as IdCard,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
  Lock,
  Shield,
} from "lucide-react";
import { VerifiedBadge } from "../VerifiedBadge";
import { studentStore } from "../../lib/api";

interface StudentDocumentsProps {
  studentId: string;
  onDocumentsUpdate?: () => void; // Added callback for document updates
}

type DocumentType =
  | "passport_photo"
  | "academic_results"
  | "authority_letter"
  | "approval_letter"
  | "identification";
type DocumentStatus = "pending" | "approved" | "rejected";

interface StudentDocument {
  id: string;
  student_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  uploaded_at?: string;
  virus_scan_status?: "clean" | "infected" | "failed";
  is_encrypted?: boolean;
}

const documentCategories = [
  {
    type: "passport_photo" as const,
    label: "Passport Photo",
    description: "Recent photo (clear face, white background)",
    icon: Camera,
    accepted: "image/jpeg,image/png",
    maxSize: 5 * 1024 * 1024,
    allowMultiple: false,
  },
  {
    type: "academic_results" as const,
    label: "Academic Results",
    description: "Result slips, transcripts (multiple allowed)",
    icon: GraduationCap,
    accepted: "application/pdf,image/jpeg,image/png",
    maxSize: 10 * 1024 * 1024,
    allowMultiple: true,
  },
  {
    type: "authority_letter" as const,
    label: "Authority Letter",
    description: "Education authority or bursary office",
    icon: Building2,
    accepted: "application/pdf,image/jpeg,image/png",
    maxSize: 10 * 1024 * 1024,
    allowMultiple: true,
  },
  {
    type: "approval_letter" as const,
    label: "School Approval",
    description: "Enrollment or sponsorship approval",
    icon: FileCheck,
    accepted: "application/pdf,image/jpeg,image/png",
    maxSize: 10 * 1024 * 1024,
    allowMultiple: true,
  },
  {
    type: "identification" as const,
    label: "Identification",
    description: "Birth certificate, ID, or Passport",
    icon: IdCard,
    accepted: "application/pdf,image/jpeg,image/png",
    maxSize: 10 * 1024 * 1024,
    allowMultiple: true,
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-amber-600 bg-amber-50",
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    color: "text-green-600 bg-green-50",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-red-600 bg-red-50",
  },
};

export function StudentDocuments({
  studentId,
  onDocumentsUpdate,
}: StudentDocumentsProps) {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [uploadQueue, setUploadQueue] = useState<
    Record<
      DocumentType,
      {
        file: File;
        previewUrl: string;
        progress: number;
        uploading: boolean;
        error?: string;
        controller: AbortController;
      }[]
    >
  >({} as any);

  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>(
    {} as any
  );

  useEffect(() => {
    fetchDocuments();
  }, [studentId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await studentStore.getStudentDocuments(studentId);
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentsByType = (type: DocumentType) =>
    documents.filter((d) => d.document_type === type);

  const getApprovedCount = () => {
    const required = documentCategories.filter((c) => !c.allowMultiple);
    const approvedSingle = required.filter((c) =>
      getDocumentsByType(c.type).some((d) => d.status === "approved")
    ).length;
    const multiApproved = documentCategories
      .filter((c) => c.allowMultiple)
      .some((c) =>
        getDocumentsByType(c.type).some((d) => d.status === "approved")
      )
      ? 1
      : 0;
    return approvedSingle + (multiApproved ? 1 : 0);
  };

  const totalRequired = documentCategories.length;
  const isFullyVerified = getApprovedCount() >= totalRequired;

  const handleFileSelect = async (
    type: DocumentType,
    files: FileList | null
  ) => {
    if (!files || !disclaimerAccepted) return;
    const config = documentCategories.find((c) => c.type === type)!;

    for (const file of Array.from(files)) {
      if (file.size > config.maxSize) {
        alert(
          `File "${file.name}" is too large. Maximum size is ${
            config.maxSize / 1024 / 1024
          }MB`
        );
        continue;
      }
      if (
        !config.accepted
          .split(",")
          .some(
            (t) => file.type === t || file.type.startsWith(t.replace("/*", "/"))
          )
      ) {
        alert(
          `Invalid file type for "${file.name}". Accepted: ${config.accepted}`
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const controller = new AbortController();

      // Add to upload queue
      setUploadQueue((prev) => ({
        ...prev,
        [type]: [
          ...(prev[type] || []),
          {
            file,
            previewUrl,
            progress: 0,
            uploading: true,
            controller,
          },
        ],
      }));

      // Upload file
      await uploadFile(type, file, previewUrl, controller);
    }
  };

  const uploadFile = async (
    type: DocumentType,
    file: File,
    previewUrl: string,
    controller: AbortController
  ) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", type);

      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setUploadQueue((prev) => ({
            ...prev,
            [type]:
              prev[type]?.map((item) =>
                item.previewUrl === previewUrl ? { ...item, progress } : item
              ) || [],
          }));
        }
      }, 200);

      // Upload to backend - the backend will handle encryption and storage
      const response = await studentStore.uploadStudentDocumentFile(
        studentId,
        formData
      );

      clearInterval(progressInterval);

      // Set progress to 100%
      setUploadQueue((prev) => ({
        ...prev,
        [type]:
          prev[type]?.map((item) =>
            item.previewUrl === previewUrl ? { ...item, progress: 100 } : item
          ) || [],
      }));

      // Refresh documents list
      await fetchDocuments();

      // Remove from queue after short delay
      setTimeout(() => {
        removeFromQueue(type, previewUrl);
      }, 1000);

      // Notify parent of update
      if (onDocumentsUpdate) {
        onDocumentsUpdate();
      }
    } catch (err: any) {
      const errorMsg =
        err.name === "AbortError"
          ? "Upload cancelled"
          : err.message?.includes("virus")
          ? "VIRUS DETECTED - File rejected"
          : err.message || "Upload failed";

      setUploadQueue((prev) => ({
        ...prev,
        [type]:
          prev[type]?.map((item) =>
            item.previewUrl === previewUrl
              ? { ...item, uploading: false, error: errorMsg }
              : item
          ) || [],
      }));
    }
  };

  const removeFromQueue = (type: DocumentType, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setUploadQueue((prev) => ({
      ...prev,
      [type]:
        prev[type]?.filter((item) => item.previewUrl !== previewUrl) || [],
    }));
  };

  const deleteDocument = async (docId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    )
      return;

    try {
      setDeletingDoc(docId);
      await studentStore.deleteStudentDocument(studentId, docId);
      await fetchDocuments();

      // Notify parent of update
      if (onDocumentsUpdate) {
        onDocumentsUpdate();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete document");
    } finally {
      setDeletingDoc(null);
    }
  };

  const downloadDocument = async (doc: StudentDocument) => {
    try {
      // Request decrypted file from backend
      const response = await studentStore.downloadStudentDocument(
        studentId,
        doc.id
      );

      // Create download link
      const link = document.createElement("a");
      link.href = response.download_url || doc.file_url;
      link.download = doc.file_name;
      link.click();
    } catch (err: any) {
      // Fallback to direct URL
      window.open(doc.file_url, "_blank");
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={fetchDocuments} />;

  return (
    <div className="min-h-screen bg-gray-100 lg:ml-64">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header + Progress */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
                Document Verification
                {isFullyVerified && <VerifiedBadge size="sm" />}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload your documents for verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDocuments}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <span className="text-sm sm:text-lg font-bold text-green-600">
                {getApprovedCount()}/{totalRequired}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
            <div
              className="bg-green-600 h-2 sm:h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${(getApprovedCount() / totalRequired) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">
              Your Documents Are Secure
            </h3>
            <p className="text-xs text-blue-700 mt-1">
              All uploaded documents are encrypted and stored securely. Only
              authorized personnel can access your files during the verification
              process.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-red-50 border-2 sm:border-3 border-red-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-red-800 mb-2">
                Legal Declaration
              </h3>
              <p className="text-xs sm:text-sm text-red-700 mb-2">
                All documents must be genuine. Forgery will result in permanent
                ban and potential legal action.
              </p>
              <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold text-red-800">
                  I confirm all documents are 100% authentic
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-2 sm:space-y-3">
          {documentCategories.map((cat) => {
            const Icon = cat.icon;
            const docs = getDocumentsByType(cat.type);
            const hasApproved = docs.some((d) => d.status === "approved");
            const queue = uploadQueue[cat.type] || [];

            return (
              <div
                key={cat.type}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-3 sm:p-4">
                  {/* Category Header */}
                  <div className="flex gap-2 sm:gap-3 mb-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        hasApproved ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          hasApproved ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800">
                          {cat.label}
                        </h3>
                        {hasApproved && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {docs.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {docs.map((doc) => {
                        const {
                          icon: StatusIcon,
                          label,
                          color,
                        } = statusConfig[doc.status];
                        return (
                          <div
                            key={doc.id}
                            className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-gray-600 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                                      {doc.file_name}
                                    </p>
                                    {doc.is_encrypted && (
                                      <Lock
                                        className="w-3 h-3 text-green-600"
                                        title="Encrypted"
                                      />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {(
                                      (doc.file_size || 0) /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full font-semibold text-xs flex items-center gap-1 shrink-0 ${color}`}
                              >
                                <StatusIcon className="w-3 h-3" /> {label}
                              </span>
                            </div>
                            {doc.rejection_reason && (
                              <div className="bg-red-50 p-2 rounded-lg mb-2 text-red-700 text-xs font-medium">
                                Rejection reason: {doc.rejection_reason}
                              </div>
                            )}
                            {doc.virus_scan_status === "infected" && (
                              <div className="bg-red-50 p-2 rounded-lg mb-2 text-red-800 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                                VIRUS DETECTED - File quarantined
                              </div>
                            )}
                            <div className="flex gap-1.5 flex-wrap">
                              <button
                                onClick={() =>
                                  window.open(doc.file_url, "_blank")
                                }
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-95 transition-all flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <button
                                onClick={() => downloadDocument(doc)}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                              {doc.status !== "approved" && (
                                <button
                                  onClick={() => deleteDocument(doc.id)}
                                  disabled={deletingDoc === doc.id}
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                                >
                                  {deletingDoc === doc.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upload Queue */}
                  {queue.map((item) => (
                    <div
                      key={item.previewUrl}
                      className="bg-green-50 border border-green-300 rounded-lg p-2.5 sm:p-3 mb-2"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {item.file.type.startsWith("image/") ? (
                            <img
                              src={item.previewUrl || "/placeholder.svg"}
                              alt="preview"
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(item.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        {item.error ? (
                          <span className="text-xs sm:text-sm text-red-600 font-bold shrink-0">
                            {item.error}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-green-700 font-semibold shrink-0">
                            {item.progress}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            item.error ? "bg-red-500" : "bg-green-600"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      {!item.error && item.uploading && (
                        <button
                          onClick={() => {
                            item.controller.abort();
                            removeFromQueue(cat.type, item.previewUrl);
                          }}
                          className="text-xs text-red-600 font-semibold hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                      {item.error && (
                        <button
                          onClick={() =>
                            removeFromQueue(cat.type, item.previewUrl)
                          }
                          className="text-xs text-gray-600 font-semibold hover:text-gray-800"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Upload Button */}
                  {((!cat.allowMultiple && docs.length === 0) ||
                    cat.allowMultiple) && (
                    <div>
                      <input
                        type="file"
                        accept={cat.accepted}
                        multiple={cat.allowMultiple}
                        ref={(el) => (fileInputRefs.current[cat.type] = el)}
                        onChange={(e) =>
                          handleFileSelect(cat.type, e.target.files)
                        }
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[cat.type]?.click()}
                        disabled={!disclaimerAccepted}
                        className="w-full border-2 sm:border-3 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg sm:rounded-xl py-6 sm:py-8 text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                      >
                        <Plus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-xs sm:text-sm font-bold text-gray-700">
                          {cat.allowMultiple ? "Add Files" : "Add File"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click or drag and drop
                        </p>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
      <p className="text-gray-600 text-sm font-medium">Loading documents...</p>
    </div>
  </div>
);

const ErrorScreen = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center lg:ml-64 p-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-sm w-full text-center">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Error Loading Documents
      </h2>
      <p className="text-sm text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default StudentDocuments;
