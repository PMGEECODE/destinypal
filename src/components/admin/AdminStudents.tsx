"use client";

import { useEffect, useState, useCallback } from "react";
import {
  GraduationCap,
  Search,
  Filter,
  MapPin,
  Heart,
  AlertTriangle,
  Loader2,
  BadgeCheck,
  RefreshCw,
  Eye,
} from "lucide-react";
import { VerifiedBadge } from "../VerifiedBadge";
import { api, type Student } from "../../lib/api";
import {
  getFullPhotoUrl,
  getNameInitials,
  formatTruncatedName,
} from "../../lib/utils/formatName";

interface AdminStudentsProps {
  adminEmail: string;
}

interface StudentWithDetails extends Student {
  institution_name?: string;
  is_sponsored: boolean;
}

export function AdminStudents({ adminEmail }: AdminStudentsProps) {
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithDetails | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getStudents({ limit: 100 });
      const studentsData = response?.items || response || [];

      const processed: StudentWithDetails[] = studentsData.map(
        (s: Student) => ({
          ...s,
          institution_name:
            (s as any).institution?.name || "Unknown Institution",
          is_sponsored: (s as any).sponsorship_status === "sponsored",
        })
      );

      setStudents(processed);
    } catch (err: any) {
      setError(err.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleVerifyAll = async () => {
    setVerifyingAll(true);
    const unverified = students.filter((s) => !s.is_verified);
    for (const s of unverified) {
      try {
        await api.updateStudent(s.id, { is_verified: true });
      } catch (e) {
        console.error(`Failed to verify ${s.id}`, e);
      }
    }
    setStudents((prev) => prev.map((s) => ({ ...s, is_verified: true })));
    setVerifyingAll(false);
  };

  const toggleVerification = async (id: string, current: boolean) => {
    setVerifyingId(id);
    try {
      await api.updateStudent(id, { is_verified: !current });
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_verified: !current } : s))
      );
    } catch (e) {
      console.error("Toggle failed", e);
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade_level?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && s.is_verified) ||
      (filterStatus === "unverified" && !s.is_verified);
    return matchesSearch && matchesFilter;
  });

  const calculateAge = (dob?: string) => {
    if (!dob) return "N/A";
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age > 0 ? age : "N/A";
  };

  const verifiedCount = students.filter((s) => s.is_verified).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-600">
            Manage all registered students
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading && "animate-spin"}`} />
            Refresh
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={verifyingAll || verifiedCount === students.length}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            {verifyingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BadgeCheck className="w-4 h-4" />
            )}
            Verify All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: students.length,
            icon: GraduationCap,
            color: "blue",
          },
          {
            label: "Verified",
            value: verifiedCount,
            icon: BadgeCheck,
            color: "blue",
          },
          {
            label: "Sponsored",
            value: students.filter((s) => s.is_sponsored).length,
            icon: Heart,
            color: "green",
          },
          {
            label: "Need Sponsor",
            value: students.filter((s) => !s.is_sponsored).length,
            icon: AlertTriangle,
            color: "red",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-4 text-center"
          >
            <stat.icon
              className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-600`}
            />
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchStudents}
            className="text-sm text-red-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            {searchTerm ? "No students found" : "No students yet"}
          </h3>
          <p className="text-gray-500 mt-1">
            {searchTerm
              ? "Try a different search term"
              : "Students will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              verifyingId={verifyingId}
              onToggleVerify={toggleVerification}
              onReadMore={() => setSelectedStudent(student)}
              calculateAge={calculateAge}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedStudent && (
        <StudentDetailOverlay
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

// Extracted Card Component
function StudentCard({
  student,
  verifyingId,
  onToggleVerify,
  onReadMore,
  calculateAge,
}: {
  student: StudentWithDetails;
  verifyingId: string | null;
  onToggleVerify: (id: string, current: boolean) => void;
  onReadMore: () => void;
  calculateAge: (dob?: string) => string | number;
}) {
  const photoUrl = getFullPhotoUrl(student.photo_url);
  const initials = getNameInitials(student.full_name || "");

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.full_name}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : null}
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                photoUrl ? "hidden" : ""
              }`}
            >
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {formatTruncatedName(student.full_name || "Unknown")}
              </h3>
              {student.is_verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {student.institution_name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <GraduationCap className="w-4 h-4" />
              <span>
                {student.grade_level || "N/A"} •{" "}
                {calculateAge(student.date_of_birth)} yrs
              </span>
            </div>
            {student.location && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{student.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={onReadMore}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Read More
          </button>

          <button
            onClick={() => onToggleVerify(student.id, student.is_verified)}
            disabled={verifyingId === student.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              student.is_verified
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {verifyingId === student.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : student.is_verified ? (
              "Unverify"
            ) : (
              "Verify"
            )}
          </button>
        </div>

        <div className="mt-3 flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {new Date(student.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span
            className={`px-2 py-1 rounded-full ${
              student.is_sponsored
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {student.is_sponsored ? "Sponsored" : "Needs Sponsor"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Simple Detail Overlay (lightweight version of your modal)
function StudentDetailOverlay({
  student,
  onClose,
}: {
  student: StudentWithDetails;
  onClose: () => void;
}) {
  const photoUrl = getFullPhotoUrl(student.photo_url);
  const initials = getNameInitials(student.full_name || "");
  const age = student.date_of_birth
    ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
    : "N/A";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Student Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {student.full_name}
                {student.is_verified && <VerifiedBadge size="md" />}
              </h3>
              <p className="text-gray-600 mt-1">{student.institution_name}</p>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-500">Grade:</span>{" "}
                  {student.grade_level || "N/A"}
                </div>
                <div>
                  <span className="text-gray-500">Age:</span> {age} years
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>{" "}
                  {student.gender || "N/A"}
                </div>
                {student.location && (
                  <div>
                    <span className="text-gray-500">Location:</span>{" "}
                    {student.location}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {student.background_story && (
                  <div>
                    <p className="font-medium text-gray-800">Background</p>
                    <p className="text-gray-700 mt-1">
                      {student.background_story}
                    </p>
                  </div>
                )}
                {student.family_situation && (
                  <div>
                    <p className="font-medium text-gray-800">
                      Family Situation
                    </p>
                    <p className="text-gray-700 mt-1">
                      {student.family_situation}
                    </p>
                  </div>
                )}
                {student.academic_performance && (
                  <div>
                    <p className="font-medium text-gray-800">
                      Academic Performance
                    </p>
                    <p className="text-gray-700 mt-1">
                      {student.academic_performance}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
