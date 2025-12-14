import type React from "react";
import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Heart,
  School,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  AlertCircle,
  Edit3,
  Save,
  X,
  Camera,
  CreditCard,
  Users,
} from "lucide-react";
import { studentStore } from "../../lib/api";
import type {
  StudentWithDetails,
  StudentFeeBalance,
} from "../../lib/api/types";

const Skeleton = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

export function StudentProfile({
  studentId,
  onProfileUpdate,
}: {
  studentId: string;
  onProfileUpdate?: () => void;
}) {
  const [student, setStudent] = useState<StudentWithDetails | null>(null);
  const [feeBalances, setFeeBalances] = useState<StudentFeeBalance[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_type: "school_fees",
    account_name: "",
    account_number: "",
    bank_name: "",
    swift_code: "",
    additional_info: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentWithDetails>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [hasFinancialSupport, setHasFinancialSupport] = useState<
    boolean | null
  >(null);
  const [supportSource, setSupportSource] = useState("");
  const [supportAmount, setSupportAmount] = useState("");

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[v0] Fetching student profile for:", studentId);
      const studentData = await studentStore.getStudentById(studentId);
      console.log("[v0] Student data received:", studentData);

      setStudent(studentData);
      setEditData(studentData);

      setHasFinancialSupport(null);
      setSupportSource("");
      setSupportAmount("");

      try {
        const balances = await studentStore.getStudentFeeBalances(studentId);
        console.log("[v0] Fee balances:", balances);
        setFeeBalances(balances || []);
      } catch {
        setFeeBalances([]);
      }

      try {
        const payments = await studentStore.getStudentPayments?.(studentId);
        setRecentPayments(payments || []);
      } catch {
        setRecentPayments([]);
      }

      try {
        const accounts = await studentStore.getStudentPaymentAccounts(
          studentId
        );
        console.log("[v0] Payment accounts:", accounts);
        setPaymentAccounts(accounts || []);
      } catch (err) {
        console.error("[v0] Error fetching payment accounts:", err);
        setPaymentAccounts([]);
      }
    } catch (err) {
      console.error("[v0] Error fetching student profile:", err);
      setError("Failed to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!student) return;

    try {
      setSaving(true);
      console.log("[v0] Saving profile with data:", editData);

      await studentStore.updateStudent(studentId, {
        full_name: editData.full_name,
        date_of_birth: editData.date_of_birth,
        gender: editData.gender,
        grade_level: editData.grade_level,
        location: editData.location,
        background_story: editData.background_story,
        family_situation: editData.family_situation,
        academic_performance: editData.academic_performance,
      });

      await fetchStudentProfile();
      setIsEditing(false);
      onProfileUpdate?.();
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("[v0] Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const result = await studentStore.uploadProfileImage(studentId, file);

      setStudent((prev) =>
        prev ? { ...prev, photo_url: result.url || result.photo_url } : null
      );
      setEditData((prev) => ({
        ...prev,
        photo_url: result.url || result.photo_url,
      }));
      onProfileUpdate?.();
      alert("Profile photo updated successfully!");
    } catch (err) {
      console.error("[v0] Error uploading photo:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const totalFees = feeBalances.reduce(
    (sum, fb) => sum + (fb.total_fees || 0),
    0
  );
  const totalPaid = feeBalances.reduce(
    (sum, fb) => sum + (fb.amount_paid || 0),
    0
  );
  const balanceDue = feeBalances.reduce(
    (sum, fb) => sum + (fb.balance_due ?? fb.balance ?? 0),
    0
  );
  const paymentProgress = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

  const getPhotoUrl = (student: StudentWithDetails | null): string | null => {
    if (!student) return null;
    const url = student.photo_url || student.profile_image_url;
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/api/")) {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      return `${apiBaseUrl}${url}`;
    }
    return url;
  };

  const photoUrl = getPhotoUrl(student);
  const fullName =
    student?.full_name ||
    `${student?.first_name || ""} ${student?.last_name || ""}`.trim() ||
    "Student";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColor = `hsl(${(fullName.charCodeAt(0) * 10) % 360}, 70%, 50%)`;
  const gradeLevel =
    student?.grade_level ||
    (student?.year_of_study
      ? `Year ${student.year_of_study}`
      : student?.course) ||
    "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <Skeleton className="h-8 sm:h-12 w-48 sm:w-64 mb-2" />
            <Skeleton className="h-4 sm:h-6 w-64 sm:w-96" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <Skeleton className="w-32 h-32 sm:w-48 sm:h-48 rounded-full mb-4" />
                <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-6" />
                <div className="w-full space-y-3 sm:space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Skeleton className="h-40 sm:h-48 rounded-2xl" />
              <Skeleton className="h-32 sm:h-36 rounded-2xl" />
              <Skeleton className="h-36 sm:h-44 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-12 text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStudentProfile}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-12 text-center max-w-md w-full">
          <User className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            We couldn't find your student profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                View and update your student information
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(student);
                    setHasFinancialSupport(!!student.financial_support_source);
                    setSupportSource(student.financial_support_source || "");
                    setSupportAmount(
                      student.financial_support_amount
                        ? String(student.financial_support_amount)
                        : ""
                    );
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Cancel</span>
                </button>
              )}
              <button
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
                disabled={saving}
                className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
                  isEditing
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden shadow-xl ring-4 ring-emerald-100 relative">
                    {photoUrl ? (
                      <img
                        src={photoUrl || "/placeholder.svg"}
                        alt={fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center text-white text-3xl sm:text-4xl lg:text-5xl font-bold ${
                        photoUrl ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                  </div>

                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 sm:p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full cursor-pointer shadow-lg transition-all hover:scale-110">
                      {uploadingPhoto ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.full_name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                    className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 text-center border-b-2 border-emerald-500 focus:outline-none w-full px-2 py-1"
                    placeholder="Full Name"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 text-center">
                    {fullName}
                  </h2>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.grade_level || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, grade_level: e.target.value })
                    }
                    className="text-sm sm:text-base text-gray-600 mb-4 text-center border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full px-2 py-1"
                    placeholder="Grade Level"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-emerald-600 font-medium mb-4 text-center">
                    {gradeLevel}
                  </p>
                )}

                <div className="w-full space-y-3 sm:space-y-4 mt-4 max-h-[calc(100vh-28rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100 pr-1">
                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-3">
                    <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">
                        Date of Birth
                      </p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.date_of_birth || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              date_of_birth: e.target.value,
                            })
                          }
                          className="text-sm font-medium border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full bg-transparent"
                        />
                      ) : (
                        <p className="text-sm font-medium break-words">
                          {student.date_of_birth
                            ? `${new Date(
                                student.date_of_birth
                              ).toLocaleDateString()} (${calculateAge(
                                student.date_of_birth
                              )} years)`
                            : "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-3">
                    <User className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      {isEditing ? (
                        <select
                          value={editData.gender || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, gender: e.target.value })
                          }
                          className="text-sm font-medium border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full bg-transparent"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium">
                          {student.gender || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-3">
                    <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.location || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              location: e.target.value,
                            })
                          }
                          className="text-sm font-medium border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full bg-transparent"
                          placeholder="City, Country"
                        />
                      ) : (
                        <p className="text-sm font-medium break-words">
                          {student.location ||
                            [student.city, student.county, student.country]
                              .filter(Boolean)
                              .join(", ") ||
                            "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  {(student.emergency_contact_name ||
                    student.guardian_name ||
                    student.guardian_phone) && (
                    <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-3 border-t-2 border-emerald-100">
                      <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">
                          Emergency Contact
                        </p>
                        <p className="text-sm font-medium break-words">
                          {student.emergency_contact_name ||
                            student.guardian_name ||
                            "Not provided"}
                        </p>
                        {(student.guardian_phone ||
                          student.emergency_contact_phone) && (
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1 break-all">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            {student.guardian_phone ||
                              student.emergency_contact_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-3">
                      <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-3">
                      <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-medium break-all">
                          {student.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-2">
            <div className="space-y-4 sm:space-y-6">
              {feeBalances.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      Fee Balance
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <p className="text-xs text-blue-700 mb-1 font-medium">
                        Total Fees
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900">
                        KES {totalFees.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                      <p className="text-xs text-emerald-700 mb-1 font-medium">
                        Amount Paid
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                        KES {totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
                      <p className="text-xs text-rose-700 mb-1 font-medium">
                        Balance Due
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-rose-900">
                        KES {balanceDue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Payment Progress
                      </span>
                      <span className="text-sm sm:text-base font-bold text-emerald-600">
                        {paymentProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {recentPayments.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      Recent Payments
                    </h3>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full">
                        <thead className="border-b-2 border-gray-200 sticky top-0 bg-white">
                          <tr>
                            <th className="pb-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600">
                              Date
                            </th>
                            <th className="pb-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600">
                              Amount
                            </th>
                            <th className="pb-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600">
                              Method
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPayments.map((payment, i) => (
                            <tr
                              key={i}
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">
                                {new Date(
                                  payment.date ||
                                    payment.created_at ||
                                    Date.now()
                                ).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-xs sm:text-sm font-semibold text-emerald-600">
                                KES{" "}
                                {(
                                  payment.amount ||
                                  payment.amount_paid ||
                                  0
                                ).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-xs sm:text-sm text-gray-600">
                                {payment.method ||
                                  payment.payment_method ||
                                  "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Academic Information
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100 pr-2">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course/Program
                        </label>
                        <input
                          type="text"
                          value={editData.course || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, course: e.target.value })
                          }
                          placeholder="e.g., Bachelor of Science in Computer Science"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Performance
                        </label>
                        <textarea
                          value={editData.academic_performance || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              academic_performance: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                          rows={4}
                          placeholder="Share your academic achievements, GPA, awards, or any other relevant academic information..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {student?.course && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-1">
                            Course/Program
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-800">
                            {student.course}
                          </p>
                        </div>
                      )}
                      {student?.admission_number && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-1">
                            Admission Number
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-800">
                            {student.admission_number}
                          </p>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-2">
                          Academic Performance
                        </p>
                        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                          {student?.academic_performance || (
                            <span className="text-gray-500 italic">
                              No academic performance information provided yet.{" "}
                              {isEditing
                                ? "Add your academic achievements above."
                                : "Click Edit to add your academic information."}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    About Me
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100 pr-2">
                  {isEditing ? (
                    <textarea
                      value={editData.background_story || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          background_story: e.target.value,
                        })
                      }
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      rows={5}
                      placeholder="Share your background story, interests, aspirations, and what makes you unique. This helps potential sponsors connect with your journey..."
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {student?.background_story || student?.bio || (
                        <span className="text-gray-500 italic">
                          No background story provided yet. Click Edit to share
                          your story with potential sponsors.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Family Situation
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100 pr-2">
                  {isEditing ? (
                    <textarea
                      value={editData.family_situation || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          family_situation: e.target.value,
                        })
                      }
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      rows={5}
                      placeholder="Describe your family background, living situation, family members, guardians, and any challenges you face. This helps sponsors understand your circumstances..."
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {student?.family_situation || (
                        <span className="text-gray-500 italic">
                          No family situation information provided yet. Click
                          Edit to add details about your family background.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      Payment Account Information
                    </h3>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setIsAddingAccount(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <span className="text-lg">+</span>
                      Add Account
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100 pr-2">
                  {paymentAccounts.length > 0 ? (
                    <div className="space-y-3">
                      {paymentAccounts.map((account, idx) => (
                        <div
                          key={account.id || idx}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {account.account_name || account.bank_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {account.account_type
                                    ?.replace("_", " ")
                                    .toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-gray-500">Bank Name</p>
                              <p className="font-medium text-gray-800">
                                {account.bank_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Account Number
                              </p>
                              <p className="font-medium text-gray-800">
                                {account.account_number}
                              </p>
                            </div>
                            {account.swift_code && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  SWIFT Code
                                </p>
                                <p className="font-medium text-gray-800">
                                  {account.swift_code}
                                </p>
                              </div>
                            )}
                            {account.additional_info && (
                              <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500">
                                  Additional Info
                                </p>
                                <p className="font-medium text-gray-800">
                                  {account.additional_info}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        No payment accounts added yet
                      </p>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Add your school fee account details for sponsorships
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {isAddingAccount && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                      <h4 className="text-xl font-bold text-gray-800 mb-4">
                        Add Payment Account
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                          </label>
                          <select
                            value={newAccount.account_type}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                account_type: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="school_fees">School Fees</option>
                            <option value="bank_account">Bank Account</option>
                            <option value="mobile_money">Mobile Money</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name
                          </label>
                          <input
                            type="text"
                            value={newAccount.account_name}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                account_name: e.target.value,
                              })
                            }
                            placeholder="e.g., Main School Account"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={newAccount.bank_name}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                bank_name: e.target.value,
                              })
                            }
                            placeholder="e.g., Equity Bank"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={newAccount.account_number}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                account_number: e.target.value,
                              })
                            }
                            placeholder="e.g., 1234567890"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SWIFT Code (Optional)
                          </label>
                          <input
                            type="text"
                            value={newAccount.swift_code}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                swift_code: e.target.value,
                              })
                            }
                            placeholder="e.g., EQBLKENA"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Info (Optional)
                          </label>
                          <textarea
                            value={newAccount.additional_info}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                additional_info: e.target.value,
                              })
                            }
                            placeholder="Any additional information"
                            rows={2}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => {
                            setIsAddingAccount(false);
                            setNewAccount({
                              account_type: "school_fees",
                              account_name: "",
                              account_number: "",
                              bank_name: "",
                              swift_code: "",
                              additional_info: "",
                            });
                          }}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              !newAccount.account_name ||
                              !newAccount.account_number ||
                              !newAccount.bank_name
                            ) {
                              alert("Please fill in all required fields");
                              return;
                            }
                            alert(
                              "Payment account creation endpoint not yet implemented in backend. This will be added soon."
                            );
                            setIsAddingAccount(false);
                          }}
                          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Save Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {student.institution && (
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <School className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      Institution
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">School Name</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-800">
                        {student.institution.name}
                      </p>
                    </div>
                    {student.institution.email && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700 break-all">
                          {student.institution.email}
                        </p>
                      </div>
                    )}
                    {student.institution.phone && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700">
                          {student.institution.phone}
                        </p>
                      </div>
                    )}
                    {student.institution.address && (
                      <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-gray-700">
                          {student.institution.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
