"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Users,
  School,
  Loader2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Building2,
  GraduationCap,
  UserX,
  UserCheck,
  UserMinus,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";
import type {
  Institution,
  StudentWithFeeBalance,
  GroupedUnsponsoredStudents,
} from "../../lib/api/types";
import { StudentCard } from "./StudentCard";
import { StudentDetailModal } from "./StudentDetailModal";
import { SponsorshipModal } from "./SponsorshipModal";
import { DonationModal } from "./DonationModal";
import { SponsorshipPaymentModal } from "./SponsorshipPaymentModal"; // Import new component
import type {
  Sponsor,
  StudentWithPaymentAccounts,
  StudentWithDetails,
} from "../../types";
import { VerifiedBadge } from "../VerifiedBadge";

interface InstitutionWithCounts extends Institution {
  unsponsored_count?: number;
  partially_sponsored_count?: number;
  fully_sponsored_count?: number;
}

type InstitutionCategory = "secondary_school" | "university" | null;

export function StudentsInNeedDashboard() {
  const [groupedStudents, setGroupedStudents] =
    useState<GroupedUnsponsoredStudents>({});
  const [institutions, setInstitutions] = useState<InstitutionWithCounts[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<InstitutionCategory>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithPaymentAccounts | null>(null);
  const [sponsorshipStudent, setSponsorshipStudent] =
    useState<StudentWithPaymentAccounts | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // New state for payment modal
  const [sponsorInfo, setSponsorInfo] = useState<{
    full_name: string;
    email: string;
    phone: string | null;
  } | null>(null); // New state for sponsor info
  const [commitmentType, setCommitmentType] = useState<"full" | "partial">(
    "full"
  ); // New state for commitment type
  const [commitmentAmount, setCommitmentAmount] = useState<number>(0); // New state for commitment amount
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstitutions: 0,
    totalNeeded: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getStudentsInNeed();

      setGroupedStudents(response.grouped_students || {});
      setInstitutions(response.institutions || []);
      setStats({
        totalStudents: response.stats?.total_students || 0,
        totalInstitutions: response.stats?.total_institutions || 0,
        totalNeeded: response.stats?.total_needed || 0,
      });
    } catch (err: any) {
      const errorMessage =
        typeof err === "object" && err !== null
          ? err.detail || err.message || JSON.stringify(err)
          : String(err);
      setError(errorMessage);
      console.error("[v0] Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInstitutions = () => {
    if (!selectedCategory) return institutions;
    return institutions.filter((inst) => {
      const type = inst.institution_type?.toLowerCase() || "";
      if (selectedCategory === "secondary_school") {
        return (
          type.includes("secondary") ||
          type.includes("high_school") ||
          type === "secondary_school"
        );
      }
      if (selectedCategory === "university") {
        return (
          type.includes("university") ||
          type.includes("college") ||
          type === "university"
        );
      }
      return false;
    });
  };

  const getCategoryStats = () => {
    const secondarySchools = institutions.filter((inst) => {
      const type = inst.institution_type?.toLowerCase() || "";
      return (
        type.includes("secondary") ||
        type.includes("high_school") ||
        type === "secondary_school"
      );
    });
    const universities = institutions.filter((inst) => {
      const type = inst.institution_type?.toLowerCase() || "";
      return (
        type.includes("university") ||
        type.includes("college") ||
        type === "university"
      );
    });

    const secondaryStudents = secondarySchools.reduce(
      (acc, inst) => acc + (groupedStudents[inst.id]?.students.length || 0),
      0
    );
    const universityStudents = universities.reduce(
      (acc, inst) => acc + (groupedStudents[inst.id]?.students.length || 0),
      0
    );

    const secondaryNeeded = secondarySchools.reduce(
      (acc, inst) => acc + (inst.total_balance_needed || 0),
      0
    );
    const universityNeeded = universities.reduce(
      (acc, inst) => acc + (inst.total_balance_needed || 0),
      0
    );

    return {
      secondary: {
        count: secondarySchools.length,
        students: secondaryStudents,
        needed: secondaryNeeded,
      },
      university: {
        count: universities.length,
        students: universityStudents,
        needed: universityNeeded,
      },
    };
  };

  const handleBack = () => {
    if (selectedInstitutionId) {
      setSelectedInstitutionId(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const transformToStudentWithPaymentAccounts = (
    student: StudentWithFeeBalance,
    institution: Institution
  ): StudentWithPaymentAccounts => {
    console.log("[v0] Transforming student:", student);
    return {
      id: student.id,
      institution_id: student.institution_id,
      // Use full_name directly from backend response
      full_name: student.full_name || "Unknown Student",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      grade_level: student.grade_level || "",
      location: student.location || null,
      // Use photo_url directly from backend
      photo_url: student.photo_url || null,
      // Use all the story fields directly from backend
      background_story: student.background_story || null,
      family_situation: student.family_situation || null,
      academic_performance: student.academic_performance || null,
      need_level: student.need_level || 5,
      created_at: student.created_at,
      updated_at: student.updated_at || student.created_at, // updated_at is on Student type, but not StudentWithFeeBalance
      // Payment accounts will be empty initially, can be fetched separately
      payment_accounts: [],
      institution: {
        id: institution.id,
        name: institution.name,
        email: institution.email || "",
        phone: institution.phone || null,
        address: institution.address || null,
        created_at: institution.created_at,
        is_verified: institution.is_verified,
      },
      fee_balance: student.fee_balance
        ? {
            id: student.id,
            student_id: student.id,
            total_fees: student.fee_balance.total_fees || 0,
            amount_paid: student.fee_balance.amount_paid || 0,
            balance_due:
              student.fee_balance.balance_due ||
              student.fee_balance.balance ||
              0,
            last_updated:
              student.fee_balance.last_updated || student.created_at,
          }
        : undefined,
    };
  };

  const sortStudentsBySponsorshipStatus = (
    students: StudentWithFeeBalance[]
  ): StudentWithFeeBalance[] => {
    const statusOrder: Record<string, number> = {
      unsponsored: 0,
      no_fees_recorded: 1,
      partially_sponsored: 2,
      fully_sponsored: 3,
    };

    return [...students].sort((a, b) => {
      const orderA = statusOrder[a.sponsorship_status || "unsponsored"] ?? 0;
      const orderB = statusOrder[b.sponsorship_status || "unsponsored"] ?? 0;
      return orderA - orderB;
    });
  };

  const handleStudentClick = async (
    student: StudentWithFeeBalance,
    institution: Institution
  ) => {
    if (student.sponsorship_status === "fully_sponsored") {
      return;
    }

    try {
      console.log("[v0] Fetching details for student:", student.id);

      const [feeBalance, studentDetails] = await Promise.all([
        api.getStudentFeeBalance(student.id),
        api.getStudentForSponsorship(student.id),
      ]);

      console.log("[v0] Student details fetched:", studentDetails);
      console.log("[v0] Fee balance fetched:", feeBalance);

      const studentWithPayments = transformToStudentWithPaymentAccounts(
        // Use the full details from the API which has all fields
        { ...student, ...studentDetails },
        institution
      );

      studentWithPayments.fee_balance = {
        id: student.id,
        student_id: student.id,
        total_fees: feeBalance.total_fees || 0,
        amount_paid: feeBalance.amount_paid || 0,
        balance_due: feeBalance.balance_due || feeBalance.balance || 0,
        last_updated: feeBalance.updated_at || new Date().toISOString(),
      };

      console.log("[v0] Transformed student data:", studentWithPayments);
      setSelectedStudent(studentWithPayments);
    } catch (err) {
      console.error("[v0] Error fetching student details:", err);
      // Fallback to basic transformation
      setSelectedStudent(
        transformToStudentWithPaymentAccounts(student, institution)
      );
    }
  };

  const handleSponsorClick = async () => {
    if (selectedStudent) {
      setSponsorshipStudent(selectedStudent);
      setSelectedStudent(null);
    }
  };

  const handleSponsorshipSubmit = async (data: {
    sponsor: Omit<Sponsor, "id" | "user_id" | "is_active" | "created_at">;
    commitmentType: "full" | "partial";
    amount: number;
    paymentMethod: string;
    paymentType: "full" | "partial";
  }) => {
    try {
      if (!sponsorshipStudent) return;

      // Store sponsor info for payment modal
      setSponsorInfo({
        full_name: data.sponsor.full_name,
        email: data.sponsor.email,
        phone: data.sponsor.phone || null,
      });
      setCommitmentType(data.commitmentType);
      setCommitmentAmount(data.amount);

      // Close sponsor info modal and open payment modal
      setSponsorshipStudent(null);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error preparing sponsorship:", error);
      throw error;
    }
  };

  const handlePaymentComplete = async (
    transactionId: string,
    paymentAmount: number
  ) => {
    try {
      if (!sponsorInfo || !sponsorshipStudent) return;

      // Create sponsorship after successful payment
      await api.createSponsorship({
        student_id: sponsorshipStudent.id,
        amount: commitmentAmount,
        currency: "USD",
        notes: `Transaction ID: ${transactionId}, Payment Amount: ${paymentAmount}`,
      });

      alert("Sponsorship created successfully!");
      setShowPaymentModal(false);
      setSponsorInfo(null);
      fetchData();
    } catch (error) {
      console.error("Error creating sponsorship:", error);
      alert(
        "Payment completed but sponsorship creation failed. Please contact support with transaction ID: " +
          transactionId
      );
    }
  };

  const handleDonationSubmit = async (data: {
    donor_name: string;
    donor_email: string;
    amount: number;
    payment_method: string;
    message: string | null;
  }) => {
    try {
      await api.createDonation({
        amount: data.amount,
        currency: "USD",
        payment_method: data.payment_method,
        notes: data.message || undefined,
      });

      alert("Thank you for your donation!");
      setShowDonationModal(false);
    } catch (error) {
      console.error("Error creating donation:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base font-medium">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchData}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm shadow-lg shadow-emerald-600/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const selectedInstitution = selectedInstitutionId
    ? groupedStudents[selectedInstitutionId]
    : null;
  const filteredInstitutions = getFilteredInstitutions();
  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!selectedCategory && !selectedInstitutionId ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                    Make a Difference
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                  Change a Student's Life Today
                </h1>
                <p className="text-emerald-50 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
                  Every student deserves the chance to pursue their dreams. Your
                  sponsorship can transform a life and create a brighter future.
                </p>

                <button
                  onClick={() => setShowDonationModal(true)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 active:scale-95 font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-black/10 flex items-center gap-3 text-base group"
                >
                  <Heart className="w-5 h-5 group-hover:fill-current transition-all" />
                  Support Our Mission
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 rounded-xl shrink-0">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Students Waiting
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-teal-100 to-teal-50 p-3 rounded-xl shrink-0">
                    <Building2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Institutions
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalInstitutions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-xl shrink-0">
                    <Heart className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Total Needed
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(stats.totalNeeded / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center py-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Choose Where to Help
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Select an education level to view students
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setSelectedCategory("secondary_school")}
                  className="bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-98 transition-all duration-300 overflow-hidden group text-left"
                >
                  <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <School className="w-7 h-7 text-white" />
                        </div>
                        <ChevronRight className="w-6 h-6 opacity-70 group-hover:translate-x-2 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        Secondary Schools
                      </h3>
                      <p className="text-emerald-100 text-sm">
                        High school students
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl">
                        <Building2 className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-emerald-600">
                          {categoryStats.secondary.count}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Schools</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-teal-600">
                          {categoryStats.secondary.students}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Students</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
                        <Heart className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-orange-600">
                          ${(categoryStats.secondary.needed / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Needed</p>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedCategory("university")}
                  className="bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/10 active:scale-98 transition-all duration-300 overflow-hidden group text-left"
                >
                  <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <ChevronRight className="w-6 h-6 opacity-70 group-hover:translate-x-2 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Universities</h3>
                      <p className="text-teal-100 text-sm">
                        College & university students
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl">
                        <Building2 className="w-5 h-5 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-teal-600">
                          {categoryStats.university.count}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Universities
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-cyan-600">
                          {categoryStats.university.students}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Students</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
                        <Heart className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-orange-600">
                          ${(categoryStats.university.needed / 1000).toFixed(0)}
                          k
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Needed</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {institutions.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Institutions Yet
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check back soon for students who need your help.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : selectedCategory && !selectedInstitutionId ? (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-3 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-xl transition-colors font-semibold text-sm shadow-sm border border-emerald-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    selectedCategory === "secondary_school"
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                      : "bg-gradient-to-br from-teal-100 to-teal-50"
                  }`}
                >
                  {selectedCategory === "secondary_school" ? (
                    <School className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-teal-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === "secondary_school"
                      ? "Secondary Schools"
                      : "Universities"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {filteredInstitutions.length} institutions
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {filteredInstitutions.map((institution) => {
                const studentCount =
                  groupedStudents[institution.id]?.students.length || 0;
                const unsponsoredCount = institution.unsponsored_count || 0;
                const partialCount = institution.partially_sponsored_count || 0;
                const fullyCount = institution.fully_sponsored_count || 0;
                const totalNeededForInstitution =
                  institution.total_balance_needed || 0;

                const gradientClass =
                  selectedCategory === "secondary_school"
                    ? "from-emerald-500 via-emerald-600 to-teal-600"
                    : "from-teal-500 via-teal-600 to-cyan-600";

                return (
                  <button
                    key={institution.id}
                    onClick={() => setSelectedInstitutionId(institution.id)}
                    className="bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50 active:scale-98 transition-all overflow-hidden group text-left"
                  >
                    <div
                      className={`bg-gradient-to-br ${gradientClass} p-6 text-white relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg">
                            {selectedCategory === "secondary_school" ? (
                              <School className="w-6 h-6 text-white" />
                            ) : (
                              <GraduationCap className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold leading-tight">
                            {institution.name}
                          </h3>
                          {institution.is_verified && (
                            <VerifiedBadge size="sm" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          selectedCategory === "secondary_school"
                            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                            : "bg-gradient-to-br from-teal-50 to-teal-100/50"
                        }`}
                      >
                        <GraduationCap
                          className={`w-7 h-7 shrink-0 ${
                            selectedCategory === "secondary_school"
                              ? "text-emerald-600"
                              : "text-teal-600"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              selectedCategory === "secondary_school"
                                ? "text-emerald-600"
                                : "text-teal-600"
                            }`}
                          >
                            {studentCount}
                          </p>
                          <p className="text-xs text-gray-600">Students</p>
                        </div>
                      </div>

                      {studentCount > 0 && (
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg">
                            <UserX className="w-4 h-4 text-red-500 mx-auto mb-1" />
                            <p className="text-base font-bold text-red-600">
                              {unsponsoredCount}
                            </p>
                            <p className="text-[9px] text-gray-500 leading-tight">
                              Need Help
                            </p>
                          </div>
                          <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg">
                            <UserMinus className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                            <p className="text-base font-bold text-orange-600">
                              {partialCount}
                            </p>
                            <p className="text-[9px] text-gray-500 leading-tight">
                              Partial
                            </p>
                          </div>
                          <div className="p-2 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
                            <UserCheck className="w-4 h-4 text-green-500 mx-auto mb-1" />
                            <p className="text-base font-bold text-green-600">
                              {fullyCount}
                            </p>
                            <p className="text-[9px] text-gray-500 leading-tight">
                              Funded
                            </p>
                          </div>
                        </div>
                      )}

                      {totalNeededForInstitution > 0 && (
                        <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                          <span className="text-gray-600 font-medium">
                            Funding Needed
                          </span>
                          <span className="font-bold text-orange-600">
                            ${(totalNeededForInstitution / 1000).toFixed(1)}k
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredInstitutions.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No{" "}
                  {selectedCategory === "secondary_school"
                    ? "Schools"
                    : "Universities"}{" "}
                  Yet
                </h3>
                <p className="text-sm text-gray-600">
                  Check back soon for students who need your support.
                </p>
              </div>
            )}
          </div>
        ) : selectedInstitution ? (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-3 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-xl transition-colors font-semibold text-sm shadow-sm border border-emerald-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div
                className={`bg-gradient-to-br ${
                  selectedCategory === "secondary_school"
                    ? "from-emerald-500 via-emerald-600 to-teal-600"
                    : "from-teal-500 via-teal-600 to-cyan-600"
                } p-6 sm:p-8 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-xl">
                    {selectedCategory === "secondary_school" ? (
                      <School className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    ) : (
                      <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h2 className="text-xl sm:text-2xl font-bold truncate">
                        {selectedInstitution.institution.name}
                      </h2>
                      {selectedInstitution.institution.is_verified && (
                        <VerifiedBadge size="sm" />
                      )}
                    </div>
                    <p className="text-white/90 text-sm capitalize mb-3">
                      {selectedInstitution.institution.institution_type?.replace(
                        /_/g,
                        " "
                      ) || "Educational Institution"}
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 inline-block shadow-lg">
                      <p className="text-2xl font-bold">
                        {selectedInstitution.students.length}
                      </p>
                      <p className="text-xs text-white/80">Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const sortedStudents = sortStudentsBySponsorshipStatus(
                selectedInstitution.students
              );
              const unsponsoredStudents = sortedStudents.filter(
                (s) =>
                  s.sponsorship_status === "unsponsored" ||
                  s.sponsorship_status === "no_fees_recorded"
              );
              const partiallySponsored = sortedStudents.filter(
                (s) => s.sponsorship_status === "partially_sponsored"
              );
              const fullySponsored = sortedStudents.filter(
                (s) => s.sponsorship_status === "fully_sponsored"
              );

              return (
                <div className="space-y-8">
                  {unsponsoredStudents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-5 px-1">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-red-50 rounded-xl shadow-sm">
                          <UserX className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Students Needing Sponsors
                          </h3>
                          <p className="text-sm text-gray-500">
                            {unsponsoredStudents.length} students waiting
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {unsponsoredStudents.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={
                              {
                                ...transformToStudentWithPaymentAccounts(
                                  student,
                                  selectedInstitution.institution
                                ),
                                is_sponsored: false,
                              } as StudentWithDetails
                            }
                            onClick={() =>
                              handleStudentClick(
                                student,
                                selectedInstitution.institution
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {partiallySponsored.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-5 px-1">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl shadow-sm">
                          <UserMinus className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Partially Sponsored
                          </h3>
                          <p className="text-sm text-gray-500">
                            {partiallySponsored.length} need more support
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {partiallySponsored.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={
                              {
                                ...transformToStudentWithPaymentAccounts(
                                  student,
                                  selectedInstitution.institution
                                ),
                                is_sponsored: true,
                              } as StudentWithDetails
                            }
                            onClick={() =>
                              handleStudentClick(
                                student,
                                selectedInstitution.institution
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {fullySponsored.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-5 px-1">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-xl shadow-sm">
                          <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Fully Sponsored
                          </h3>
                          <p className="text-sm text-gray-500">
                            {fullySponsored.length} students supported
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto opacity-60">
                        {fullySponsored.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={
                              {
                                ...transformToStudentWithPaymentAccounts(
                                  student,
                                  selectedInstitution.institution
                                ),
                                is_sponsored: true,
                              } as StudentWithDetails
                            }
                            onClick={() => {}}
                            disabled
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {sortedStudents.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        No Students Yet
                      </h3>
                      <p className="text-sm text-gray-600">
                        This institution has no registered students.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSponsor={handleSponsorClick}
        />
      )}

      {sponsorshipStudent && (
        <SponsorshipModal
          student={sponsorshipStudent}
          onClose={() => setSponsorshipStudent(null)}
          onSubmit={handleSponsorshipSubmit}
        />
      )}

      {showDonationModal && (
        <DonationModal
          onClose={() => setShowDonationModal(false)}
          onSubmit={handleDonationSubmit}
        />
      )}

      {showPaymentModal && sponsorInfo && sponsorshipStudent && (
        <SponsorshipPaymentModal
          student={sponsorshipStudent}
          sponsorInfo={sponsorInfo}
          commitmentType={commitmentType}
          commitmentAmount={commitmentAmount}
          onClose={() => {
            setShowPaymentModal(false);
            setSponsorInfo(null);
          }}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
