"use client";

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
  Camera,
  CreditCard,
  Users,
  Edit3,
  Save,
  X,
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

  const [isEditingFees, setIsEditingFees] = useState(false);
  const [editFeeData, setEditFeeData] = useState({
    total_fees: 0,
    amount_paid: 0,
  });
  const [savingFees, setSavingFees] = useState(false);

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

        if (balances && balances.length > 0) {
          const firstBalance = balances[0];
          setEditFeeData({
            total_fees: firstBalance.total_fees || 0,
            amount_paid: firstBalance.amount_paid || 0,
          });
        }
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

  const handleSaveFees = async () => {
    if (feeBalances.length === 0) {
      alert("No fee balance record found. Please contact your institution.");
      return;
    }

    const feeBalance = feeBalances[0];

    try {
      setSavingFees(true);
      console.log("[v0] Updating fee balance:", {
        studentId,
        balanceId: feeBalance.id,
        data: editFeeData,
      });

      // Calculate balance automatically
      const balanceDue = editFeeData.total_fees - editFeeData.amount_paid;

      await studentStore.updateStudentFeeBalance(studentId, feeBalance.id, {
        total_fees: editFeeData.total_fees,
        amount_paid: editFeeData.amount_paid,
        balance_due: balanceDue,
      });

      // Refresh fee balances
      const updatedBalances = await studentStore.getStudentFeeBalances(
        studentId
      );
      setFeeBalances(updatedBalances || []);

      setIsEditingFees(false);
      alert("Fee balance updated successfully!");
    } catch (err) {
      console.error("[v0] Error updating fee balance:", err);
      alert("Failed to update fee balance. Please try again.");
    } finally {
      setSavingFees(false);
    }
  };

  const handleStartEditingFees = () => {
    if (feeBalances.length > 0) {
      const firstBalance = feeBalances[0];
      setEditFeeData({
        total_fees: firstBalance.total_fees || 0,
        amount_paid: firstBalance.amount_paid || 0,
      });
      setIsEditingFees(true);
    }
  };

  const handleCancelEditingFees = () => {
    setIsEditingFees(false);
    if (feeBalances.length > 0) {
      const firstBalance = feeBalances[0];
      setEditFeeData({
        total_fees: firstBalance.total_fees || 0,
        amount_paid: firstBalance.amount_paid || 0,
      });
    }
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

  const editBalanceDue = editFeeData.total_fees - editFeeData.amount_paid;
  const editPaymentProgress =
    editFeeData.total_fees > 0
      ? (editFeeData.amount_paid / editFeeData.total_fees) * 100
      : 0;

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
      <div className="min-h-screen bg-gray-100 lg:ml-64 p-4 sm:p-6 lg:p-8">
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
      <div className="min-h-screen bg-gray-100 lg:ml-64 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-12 text-center max-w-md w-full">
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
      <div className="min-h-screen bg-gray-100 lg:ml-64 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-12 text-center max-w-md w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 lg:ml-72 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 mb-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              My Profile
            </h1>
            <p className="text-base text-gray-600 mt-2">
              View and update your profile information
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                className="px-5 py-2.5 rounded-xl font-medium transition-all border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() =>
                isEditing ? handleSaveProfile() : setIsEditing(true)
              }
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                isEditing
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300"
              }`}
            >
              {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 lg:sticky lg:top-24 shadow-md">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-56 h-56 sm:w-60 sm:h-60 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-gray-100 shadow-xl relative ring-4 ring-white">
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
                      className={`w-full h-full flex items-center justify-center text-white text-5xl sm:text-6xl font-bold ${
                        photoUrl ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                  </div>

                  {isEditing && (
                    <label className="absolute bottom-2 right-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full cursor-pointer shadow-xl transition-all hover:scale-110">
                      {uploadingPhoto ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6" />
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
                    className="text-2xl font-bold text-gray-800 mb-2 text-center border-b-2 border-emerald-500 focus:outline-none w-full px-2 py-1 bg-transparent"
                    placeholder="Full Name"
                  />
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
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
                    className="text-base text-gray-600 mb-6 text-center border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full px-2 py-1 bg-transparent"
                    placeholder="Grade Level"
                  />
                ) : (
                  <p className="text-base text-emerald-700 font-semibold mb-6 text-center">
                    {gradeLevel}
                  </p>
                )}

                <div className="w-full space-y-3 mt-6">
                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <Calendar className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">
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
                          className="text-sm font-semibold border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full bg-transparent"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 break-words">
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

                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <User className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">
                        Gender
                      </p>
                      {isEditing ? (
                        <select
                          value={editData.gender || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, gender: e.target.value })
                          }
                          className="text-sm font-semibold border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full bg-transparent"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">
                          {student.gender || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">
                        Location
                      </p>
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
                          className="text-sm font-semibold border-b border-gray-300 focus:outline-none focus:border-emerald-500 w-full bg-transparent"
                          placeholder="City, Country"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 break-words">
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
                    <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <Users className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">
                          Emergency Contact
                        </p>
                        <p className="text-sm font-semibold text-gray-900 break-words">
                          {student.emergency_contact_name ||
                            student.guardian_name ||
                            "Not provided"}
                        </p>
                        {(student.guardian_phone ||
                          student.emergency_contact_phone) && (
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1.5 break-all">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            {student.guardian_phone ||
                              student.emergency_contact_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <Mail className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <Phone className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-gray-900 break-all">
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
            <div className="space-y-6">
              {/* Show either view mode or edit mode for fees */}
              {feeBalances.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 rounded-xl">
                        <DollarSign className="w-7 h-7 text-emerald-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Fee Balance
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      {isEditingFees ? (
                        <>
                          <button
                            onClick={handleCancelEditingFees}
                            disabled={savingFees}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveFees}
                            disabled={savingFees}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            {savingFees ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {savingFees ? "Saving..." : "Save"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleStartEditingFees}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Fees
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditingFees ? (
                    // Edit mode
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Total Fees Input */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow">
                          <label className="text-xs text-blue-700 mb-2 font-medium block">
                            Total Fees (KES)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editFeeData.total_fees}
                            onChange={(e) =>
                              setEditFeeData({
                                ...editFeeData,
                                total_fees:
                                  Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full text-xl sm:text-2xl font-bold text-blue-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none transition-colors"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Amount Paid Input */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow">
                          <label className="text-xs text-emerald-700 mb-2 font-medium block">
                            Amount Paid (KES)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editFeeData.amount_paid}
                            onChange={(e) =>
                              setEditFeeData({
                                ...editFeeData,
                                amount_paid:
                                  Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full text-xl sm:text-2xl font-bold text-emerald-900 bg-transparent border-b-2 border-emerald-300 focus:border-emerald-500 outline-none transition-colors"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Auto-calculated Balance Due */}
                      <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-5 border border-rose-200 shadow">
                        <p className="text-xs text-rose-700 mb-1.5 font-medium">
                          Balance Due (Auto-calculated)
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-rose-900">
                          KES{" "}
                          {editBalanceDue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      {/* Payment Progress Preview */}
                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-sm font-medium text-gray-700">
                            Payment Progress (Preview)
                          </span>
                          <span className="text-base font-bold text-emerald-700">
                            {editPaymentProgress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3.5 sm:h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-sm"
                            style={{
                              width: `${Math.min(editPaymentProgress, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 italic bg-blue-50 p-3 rounded-lg border border-blue-100">
                        Note: Balance Due is automatically calculated as Total
                        Fees minus Amount Paid
                      </p>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-7">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow">
                          <p className="text-xs text-blue-700 mb-1.5 font-medium">
                            Total Fees
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-900">
                            KES {totalFees.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow">
                          <p className="text-xs text-emerald-700 mb-1.5 font-medium">
                            Amount Paid
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                            KES {totalPaid.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-5 border border-rose-200 shadow">
                          <p className="text-xs text-rose-700 mb-1.5 font-medium">
                            Balance Due
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-rose-900">
                            KES {balanceDue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-sm font-medium text-gray-700">
                            Payment Progress
                          </span>
                          <span className="text-base font-bold text-emerald-700">
                            {paymentProgress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3.5 sm:h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-sm"
                            style={{
                              width: `${Math.min(paymentProgress, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {recentPayments.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                      <CreditCard className="w-7 h-7 text-emerald-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Recent Payments
                    </h3>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full">
                        <thead className="border-b-2 border-gray-200 sticky top-0 bg-white/60 backdrop-blur-sm">
                          <tr>
                            <th className="pb-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase">
                              Date
                            </th>
                            <th className="pb-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase">
                              Amount
                            </th>
                            <th className="pb-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase">
                              Method
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPayments.map((payment, i) => (
                            <tr
                              key={i}
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-gray-700">
                                {new Date(
                                  payment.date ||
                                    payment.created_at ||
                                    Date.now()
                                ).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-emerald-600">
                                KES{" "}
                                {(
                                  payment.amount ||
                                  payment.amount_paid ||
                                  0
                                ).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
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

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <TrendingUp className="w-7 h-7 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80"
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
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80"
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

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <Heart className="w-7 h-7 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">About Me</h3>
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
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80"
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

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <Users className="w-7 h-7 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
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
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80"
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

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                      <CreditCard className="w-7 h-7 text-emerald-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Payment Account Information
                    </h3>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setIsAddingAccount(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
                    >
                      <span className="text-xl">+</span>
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
                          className="bg-white/80 rounded-xl p-4 border border-gray-200 shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-emerald-700" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">
                                  {account.account_name || account.bank_name}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                  {account.account_type
                                    ?.replace("_", " ")
                                    .toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5 uppercase font-medium">
                                Bank Name
                              </p>
                              <p className="font-semibold text-gray-800">
                                {account.bank_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5 uppercase font-medium">
                                Account Number
                              </p>
                              <p className="font-semibold text-gray-800">
                                {account.account_number}
                              </p>
                            </div>
                            {account.swift_code && (
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-medium">
                                  SWIFT Code
                                </p>
                                <p className="font-semibold text-gray-800">
                                  {account.swift_code}
                                </p>
                              </div>
                            )}
                            {account.additional_info && (
                              <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-medium">
                                  Additional Info
                                </p>
                                <p className="font-semibold text-gray-800">
                                  {account.additional_info}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl shadow">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-medium">
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
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
                      <h4 className="text-2xl font-bold text-gray-800 mb-5">
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-8">
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
                          className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
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
                          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-md"
                        >
                          Save Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {student.institution && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                      <School className="w-7 h-7 text-emerald-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Institution
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1 uppercase font-medium">
                        School Name
                      </p>
                      <p className="text-sm sm:text-base font-bold text-gray-800">
                        {student.institution.name}
                      </p>
                    </div>
                    {student.institution.email && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700 break-all">
                          {student.institution.email}
                        </p>
                      </div>
                    )}
                    {student.institution.phone && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700">
                          {student.institution.phone}
                        </p>
                      </div>
                    )}
                    {student.institution.address && (
                      <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
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
