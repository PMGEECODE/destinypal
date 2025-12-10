"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Search,
  Building2,
  GraduationCap,
  Heart,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { ComplianceBadge } from "../ComplianceBadge"
import { VerifiedBadge } from "../VerifiedBadge"
import type { Institution, Student, Sponsor, ComplianceStatus } from "../../types"

interface AdminComplianceProps {
  adminEmail: string
}

type EntityType = "institutions" | "students" | "sponsors"

interface ComplianceModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
  entityName: string
  currentStatus: ComplianceStatus
  onUpdate: (status: ComplianceStatus, reason: string) => void
}

function ComplianceModal({ isOpen, onClose, entityType, entityName, currentStatus, onUpdate }: ComplianceModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus>(currentStatus)
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!reason.trim() && selectedStatus !== "active") {
      alert("Please provide a reason for this compliance action.")
      return
    }
    onUpdate(selectedStatus, reason)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Update Compliance Status</h3>
        <p className="text-sm text-gray-600 mb-4">
          Update compliance status for <strong>{entityName}</strong>
        </p>

        <div className="space-y-3 mb-4">
          {(["active", "whitelisted", "blacklisted", "suspended"] as ComplianceStatus[]).map((status) => (
            <label
              key={status}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStatus === status ? "border-slate-600 bg-slate-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
                className="sr-only"
              />
              <ComplianceBadge status={status} size="sm" />
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for change {selectedStatus !== "active" && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for this compliance action..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminCompliance({ adminEmail }: AdminComplianceProps) {
  const [activeTab, setActiveTab] = useState<EntityType>("institutions")
  const [searchTerm, setSearchTerm] = useState("")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [students, setStudents] = useState<(Student & { institution?: Institution })[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<{
    type: EntityType
    id: string
    name: string
    status: ComplianceStatus
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === "institutions") {
        const { data } = await supabase.from("institutions").select("*").order("name")
        setInstitutions(data || [])
      } else if (activeTab === "students") {
        const { data } = await supabase.from("students").select("*, institution:institutions(*)").order("full_name")
        setStudents(data || [])
      } else {
        const { data } = await supabase.from("sponsors").select("*").order("full_name")
        setSponsors(data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  const handleComplianceUpdate = async (status: ComplianceStatus, reason: string) => {
    if (!selectedEntity) return

    try {
      const { error } = await supabase
        .from(selectedEntity.type)
        .update({
          compliance_status: status,
          compliance_reason: reason,
          compliance_updated_at: new Date().toISOString(),
          compliance_updated_by: adminEmail,
        })
        .eq("id", selectedEntity.id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error updating compliance:", error)
      alert("Failed to update compliance status")
    }
  }

  const openComplianceModal = (type: EntityType, id: string, name: string, status: ComplianceStatus) => {
    setSelectedEntity({ type, id, name, status: status || "active" })
    setModalOpen(true)
  }

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase()
    if (activeTab === "institutions") {
      return institutions.filter((i) => i.name.toLowerCase().includes(term) || i.email.toLowerCase().includes(term))
    } else if (activeTab === "students") {
      return students.filter((s) => s.full_name.toLowerCase().includes(term))
    } else {
      return sponsors.filter((s) => s.full_name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term))
    }
  }

  const getStats = () => {
    const data = activeTab === "institutions" ? institutions : activeTab === "students" ? students : sponsors
    return {
      total: data.length,
      active: data.filter((d) => !d.compliance_status || d.compliance_status === "active").length,
      whitelisted: data.filter((d) => d.compliance_status === "whitelisted").length,
      blacklisted: data.filter((d) => d.compliance_status === "blacklisted").length,
      suspended: data.filter((d) => d.compliance_status === "suspended").length,
    }
  }

  const stats = getStats()
  const filteredData = getFilteredData()

  const tabs = [
    { id: "institutions" as EntityType, label: "Institutions", icon: Building2 },
    { id: "students" as EntityType, label: "Students", icon: GraduationCap },
    { id: "sponsors" as EntityType, label: "Sponsors", icon: Heart },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Compliance Management</h1>
        <p className="text-gray-600">
          Manage blacklist/whitelist status for institutions, students, and sponsors based on Destiny Pall policy
          violations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Whitelisted</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.whitelisted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <ShieldX className="w-4 h-4" />
            <span className="text-sm font-medium">Blacklisted</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.blacklisted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm font-medium">Suspended</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.suspended}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-slate-800 border-b-2 border-slate-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No {activeTab} found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Last Updated</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === "institutions" &&
                  (filteredData as Institution[]).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          {item.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.email}</td>
                      <td className="px-6 py-4">
                        <ComplianceBadge status={item.compliance_status || "active"} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.compliance_reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.compliance_updated_at ? new Date(item.compliance_updated_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            openComplianceModal("institutions", item.id, item.name, item.compliance_status || "active")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === "students" &&
                  (filteredData as (Student & { institution?: Institution })[]).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item.full_name}</span>
                          {item.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-xs text-gray-500">{item.institution?.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.grade_level}</td>
                      <td className="px-6 py-4">
                        <ComplianceBadge status={item.compliance_status || "active"} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.compliance_reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.compliance_updated_at ? new Date(item.compliance_updated_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            openComplianceModal("students", item.id, item.full_name, item.compliance_status || "active")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === "sponsors" &&
                  (filteredData as Sponsor[]).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{item.full_name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.email}</td>
                      <td className="px-6 py-4">
                        <ComplianceBadge status={item.compliance_status || "active"} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.compliance_reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.compliance_updated_at ? new Date(item.compliance_updated_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            openComplianceModal("sponsors", item.id, item.full_name, item.compliance_status || "active")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Policy Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 mb-1">Destiny Pall Compliance Policy</h4>
          <p className="text-sm text-amber-700">
            All compliance actions are logged and audited. Ensure you provide clear reasons for any blacklist or
            suspension actions. Whitelisted entities are marked as trusted partners. Contact the policy team for
            guidance on complex cases.
          </p>
        </div>
      </div>

      {/* Compliance Modal */}
      {selectedEntity && (
        <ComplianceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          entityName={selectedEntity.name}
          currentStatus={selectedEntity.status}
          onUpdate={handleComplianceUpdate}
        />
      )}
    </div>
  )
}
