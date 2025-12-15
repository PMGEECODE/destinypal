"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Users,
  Search,
  Loader2,
  BadgeCheck,
  RefreshCw,
  Plus,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { api, type Institution } from "../../lib/api";
import { VerifiedBadge } from "../VerifiedBadge";

interface AdminInstitutionsProps {
  adminEmail: string;
}

interface InstitutionWithCount extends Institution {
  student_count: number;
}

interface NewInstitutionForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  country: string;
  institution_type: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  website: string;
  registration_number: string;
  description: string;
}

const initialFormState: NewInstitutionForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  region: "",
  country: "Uganda",
  institution_type: "secondary_school",
  contact_person_name: "",
  contact_person_email: "",
  contact_person_phone: "",
  website: "",
  registration_number: "",
  description: "",
};

export function AdminInstitutions({ adminEmail }: AdminInstitutionsProps) {
  const [institutions, setInstitutions] = useState<InstitutionWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<InstitutionWithCount | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] =
    useState<NewInstitutionForm>(initialFormState);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchInstitutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getInstitutions({ limit: 100 });
      const data: InstitutionWithCount[] = (
        response.items ||
        response ||
        []
      ).map((inst: any) => ({
        ...inst,
        student_count: inst.student_count || 0,
      }));
      setInstitutions(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch institutions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const handleVerifyAll = async () => {
    setVerifyingAll(true);
    const unverified = institutions.filter((i) => !i.is_verified);
    await Promise.all(
      unverified.map((i) => api.updateInstitution(i.id, { is_verified: true }))
    );
    setInstitutions((prev) => prev.map((i) => ({ ...i, is_verified: true })));
    setVerifyingAll(false);
  };

  const toggleVerification = async (id: string, current: boolean) => {
    setVerifyingId(id);
    try {
      await api.updateInstitution(id, { is_verified: !current });
      setInstitutions((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_verified: !current } : i))
      );
    } catch (e) {
      console.error("Verification toggle failed", e);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setCreateError(null);
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    if (!formData.name.trim()) {
      setCreateError("Institution name is required");
      setCreating(false);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setCreateError("Valid email address is required");
      setCreating(false);
      return;
    }

    try {
      const newInstitution = await api.createInstitution({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        region: formData.region.trim() || undefined,
        country: formData.country.trim() || "Uganda",
        institution_type: formData.institution_type,
        contact_person_name: formData.contact_person_name.trim() || undefined,
        contact_person_email: formData.contact_person_email.trim() || undefined,
        contact_person_phone: formData.contact_person_phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        registration_number: formData.registration_number.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      setInstitutions((prev) => [
        { ...newInstitution, student_count: 0 },
        ...prev,
      ]);
      setCreateSuccess(true);
      setTimeout(() => {
        setShowCreateModal(false);
        setFormData(initialFormState);
        setCreateSuccess(false);
      }, 2000);
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        setCreateError("An institution with this name or email already exists");
      } else {
        setCreateError(err.message || "Failed to create institution");
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredInstitutions = institutions.filter((inst) =>
    [inst.name, inst.email, inst.region]
      .filter(Boolean)
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const verifiedCount = institutions.filter((i) => i.is_verified).length;
  const totalStudents = institutions.reduce(
    (sum, i) => sum + i.student_count,
    0
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-sm text-gray-600">
            Manage schools and educational organizations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchInstitutions}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading && "animate-spin"}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={verifyingAll || verifiedCount === institutions.length}
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-amber-600" />
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {institutions.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <BadgeCheck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-sm text-gray-600">Students</p>
          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchInstitutions}
            className="text-sm text-red-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Institutions Grid */}
      {filteredInstitutions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            {searchTerm ? "No institutions found" : "No institutions yet"}
          </h3>
          <p className="text-gray-500 mt-1">
            {searchTerm
              ? "Try a different search"
              : "Create your first institution"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Institution
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredInstitutions.map((inst) => (
            <InstitutionCard
              key={inst.id}
              institution={inst}
              verifyingId={verifyingId}
              onToggleVerify={toggleVerification}
              onReadMore={() => setSelectedInst(inst)}
            />
          ))}
        </div>
      )}

      {/* Detail Overlay */}
      {selectedInst && (
        <InstitutionDetailOverlay
          institution={selectedInst}
          onClose={() => setSelectedInst(null)}
        />
      )}

      {/* Create Institution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Institution
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData(initialFormState);
                  setCreateError(null);
                  setCreateSuccess(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {createSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Institution Created!
                  </h3>
                  <p className="text-gray-600">
                    "{formData.name}" has been successfully registered.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateInstitution} className="space-y-6">
                  {createError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="institution_type"
                        value={formData.institution_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="primary_school">Primary School</option>
                        <option value="secondary_school">
                          Secondary School
                        </option>
                        <option value="high_school">High School</option>
                        <option value="university">University</option>
                        <option value="vocational">Vocational</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="email"
                        name="contact_person_email"
                        value={formData.contact_person_email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="tel"
                        name="contact_person_phone"
                        value={formData.contact_person_phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData(initialFormState);
                        setCreateError(null);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center gap-2 transition"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Building2 className="w-5 h-5" />
                          Create Institution
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Institution Card Component
function InstitutionCard({
  institution,
  verifyingId,
  onToggleVerify,
  onReadMore,
}: {
  institution: InstitutionWithCount;
  verifyingId: string | null;
  onToggleVerify: (id: string, current: boolean) => void;
  onReadMore: () => void;
}) {
  const initials = institution.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const location = [
    institution.address,
    institution.region,
    institution.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {institution.name}
              </h3>
              {institution.is_verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-600">
              {institution.student_count} students
            </p>

            {institution.email && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{institution.email}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={onReadMore}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Read More
          </button>

          <button
            onClick={() =>
              onToggleVerify(institution.id, institution.is_verified)
            }
            disabled={verifyingId === institution.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              institution.is_verified
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {verifyingId === institution.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : institution.is_verified ? (
              "Unverify"
            ) : (
              "Verify"
            )}
          </button>
        </div>

        <div className="mt-3 flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {new Date(institution.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              institution.compliance_status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {institution.compliance_status || "Active"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Detail Overlay
function InstitutionDetailOverlay({
  institution,
  onClose,
}: {
  institution: InstitutionWithCount;
  onClose: () => void;
}) {
  const initials = institution.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const location = [
    institution.address,
    institution.region,
    institution.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Institution Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {initials}
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
                {institution.name}
                {institution.is_verified && <VerifiedBadge size="lg" />}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>{" "}
                  {institution.institution_type
                    ?.replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A"}
                </div>
                <div>
                  <span className="text-gray-500">Students:</span>{" "}
                  {institution.student_count}
                </div>
                {institution.email && (
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    {institution.email}
                  </div>
                )}
                {institution.phone && (
                  <div>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {institution.phone}
                  </div>
                )}
                {institution.registration_number && (
                  <div>
                    <span className="text-gray-500">Reg #:</span>{" "}
                    {institution.registration_number}
                  </div>
                )}
                {institution.website && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Website:</span>{" "}
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {institution.website}
                    </a>
                  </div>
                )}
                {location && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Location:</span> {location}
                  </div>
                )}
              </div>

              {institution.description && (
                <div className="mt-6">
                  <p className="font-medium text-gray-800 mb-1">Description</p>
                  <p className="text-gray-700 leading-relaxed">
                    {institution.description}
                  </p>
                </div>
              )}

              {(institution.contact_person_name ||
                institution.contact_person_email ||
                institution.contact_person_phone) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-semibold text-gray-800 mb-3">
                    Contact Person
                  </p>
                  <div className="space-y-2 text-sm">
                    {institution.contact_person_name && (
                      <p>
                        <span className="text-gray-500">Name:</span>{" "}
                        {institution.contact_person_name}
                      </p>
                    )}
                    {institution.contact_person_email && (
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        {institution.contact_person_email}
                      </p>
                    )}
                    {institution.contact_person_phone && (
                      <p>
                        <span className="text-gray-500">Phone:</span>{" "}
                        {institution.contact_person_phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
