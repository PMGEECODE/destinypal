// "use client"

// import { useEffect, useState } from "react"
// import {
//   Heart,
//   Users,
//   School,
//   Loader2,
//   AlertCircle,
//   ChevronRight,
//   ArrowLeft,
//   Building2,
//   GraduationCap,
//   UserX,
//   UserCheck,
//   UserMinus,
// } from "lucide-react"
// import { api } from "../../lib/api"
// import type { Institution, StudentWithFeeBalance, GroupedUnsponsoredStudents } from "../../lib/api/types"
// import { StudentCard } from "./StudentCard"
// import { StudentDetailModal } from "./StudentDetailModal"
// import { SponsorshipModal } from "./SponsorshipModal"
// import { DonationModal } from "./DonationModal"
// import type { Sponsor, StudentWithPaymentAccounts } from "../../types"
// import { VerifiedBadge } from "../VerifiedBadge"

// interface InstitutionWithCounts extends Institution {
//   unsponsored_count?: number
//   partially_sponsored_count?: number
//   fully_sponsored_count?: number
// }

// export function StudentsInNeedDashboard() {
//   const [groupedStudents, setGroupedStudents] = useState<GroupedUnsponsoredStudents>({})
//   const [institutions, setInstitutions] = useState<InstitutionWithCounts[]>([])
//   const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null)
//   const [selectedStudent, setSelectedStudent] = useState<StudentWithPaymentAccounts | null>(null)
//   const [sponsorshipStudent, setSponsorshipStudent] = useState<StudentWithPaymentAccounts | null>(null)
//   const [showDonationModal, setShowDonationModal] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [stats, setStats] = useState({ totalStudents: 0, totalInstitutions: 0, totalNeeded: 0 })

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const response = await api.getStudentsInNeed()

//       setGroupedStudents(response.grouped_students || {})
//       setInstitutions(response.institutions || [])
//       setStats({
//         totalStudents: response.stats?.total_students || 0,
//         totalInstitutions: response.stats?.total_institutions || 0,
//         totalNeeded: response.stats?.total_needed || 0,
//       })
//     } catch (err: any) {
//       const errorMessage =
//         typeof err === "object" && err !== null ? err.detail || err.message || JSON.stringify(err) : String(err)
//       setError(errorMessage)
//       console.error("[v0] Error fetching data:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const transformToStudentWithPaymentAccounts = (
//     student: StudentWithFeeBalance,
//     institution: Institution,
//   ): StudentWithPaymentAccounts => {
//     return {
//       id: student.id,
//       institution_id: student.institution_id,
//       full_name: `${student.first_name} ${student.last_name}`,
//       date_of_birth: student.date_of_birth || "",
//       gender: student.gender || "",
//       grade_level: student.course || student.year_of_study?.toString() || "",
//       location: student.city || student.address || null,
//       photo_url: student.profile_image_url || null,
//       background_story: student.bio || null,
//       family_situation: null,
//       academic_performance: null,
//       need_level: 5,
//       created_at: student.created_at,
//       updated_at: student.created_at,
//       payment_accounts: [],
//       institution: {
//         id: institution.id,
//         name: institution.name,
//         email: institution.email || "",
//         phone: institution.phone || null,
//         address: institution.address || null,
//         created_at: institution.created_at,
//         is_verified: institution.is_verified,
//       },
//       fee_balance: {
//         id: student.id,
//         student_id: student.id,
//         total_fees: student.total_fees || 0,
//         amount_paid: student.amount_paid || 0,
//         balance_due: student.fee_balance || 0,
//         last_updated: student.created_at,
//       },
//     }
//   }

//   const sortStudentsBySponsorshipStatus = (students: StudentWithFeeBalance[]): StudentWithFeeBalance[] => {
//     const statusOrder: Record<string, number> = {
//       unsponsored: 0,
//       no_fees_recorded: 1,
//       partially_sponsored: 2,
//       fully_sponsored: 3,
//     }

//     return [...students].sort((a, b) => {
//       const orderA = statusOrder[a.sponsorship_status || "unsponsored"] ?? 0
//       const orderB = statusOrder[b.sponsorship_status || "unsponsored"] ?? 0
//       return orderA - orderB
//     })
//   }

//   const handleStudentClick = async (student: StudentWithFeeBalance, institution: Institution) => {
//     if (student.sponsorship_status === "fully_sponsored") {
//       return
//     }

//     try {
//       // Use the correct API method
//       const feeBalance = await api.getStudentFeeBalance(student.id)

//       const studentWithPayments = transformToStudentWithPaymentAccounts(student, institution)
//       studentWithPayments.fee_balance = {
//         id: student.id,
//         student_id: student.id,
//         total_fees: feeBalance.total_fees || student.total_fees || 0,
//         amount_paid: feeBalance.amount_paid || student.amount_paid || 0,
//         balance_due: feeBalance.balance || student.fee_balance || 0,
//         last_updated: feeBalance.updated_at || student.created_at,
//       }

//       setSelectedStudent(studentWithPayments)
//     } catch (err) {
//       console.error("[v0] Error fetching student details:", err)
//       // Fallback to transformed student without additional fee details
//       setSelectedStudent(transformToStudentWithPaymentAccounts(student, institution))
//     }
//   }

//   const handleSponsorClick = async () => {
//     if (selectedStudent) {
//       setSponsorshipStudent(selectedStudent)
//       setSelectedStudent(null)
//     }
//   }

//   const handleSponsorshipSubmit = async (data: {
//     sponsor: Omit<Sponsor, "id" | "user_id" | "is_active" | "created_at">
//     commitmentType: "full" | "partial"
//     amount: number
//     paymentMethod: string
//     paymentType: "full" | "partial"
//   }) => {
//     try {
//       if (!sponsorshipStudent) return

//       await api.createSponsorship({
//         student_id: sponsorshipStudent.id,
//         amount: data.amount, // Use 'amount' instead of 'amount_per_period'
//         currency: "USD",
//         notes: `Payment method: ${data.paymentMethod}, Type: ${data.commitmentType}`,
//       })

//       alert("Sponsorship created successfully!")
//       setSponsorshipStudent(null)
//       fetchData()
//     } catch (error) {
//       console.error("Error creating sponsorship:", error)
//       throw error
//     }
//   }

//   const handleDonationSubmit = async (data: {
//     donor_name: string
//     donor_email: string
//     amount: number
//     payment_method: string
//     message: string | null
//   }) => {
//     try {
//       await api.createDonation({
//         amount: data.amount,
//         currency: "USD",
//         payment_method: data.payment_method,
//         notes: data.message || undefined, // Use 'notes' instead of 'message', removed donor_name/donor_email
//       })

//       alert("Thank you for your donation!")
//       setShowDonationModal(false)
//     } catch (error) {
//       console.error("Error creating donation:", error)
//       throw error
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading institutions and students...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={fetchData}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const selectedInstitution = selectedInstitutionId ? groupedStudents[selectedInstitutionId] : null

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-1">Students in Need</h1>
//           <p className="text-gray-600">Find and sponsor students who need your help</p>
//         </div>
//         <button
//           onClick={() => setShowDonationModal(true)}
//           className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
//         >
//           <Heart className="w-5 h-5" />
//           Donate to DestinyPal
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-100 p-3 rounded-xl">
//               <Users className="w-6 h-6 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-gray-500 text-sm font-medium">Total Students</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <div className="flex items-center gap-4">
//             <div className="bg-green-100 p-3 rounded-xl">
//               <Building2 className="w-6 h-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-gray-500 text-sm font-medium">Institutions</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalInstitutions}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <div className="flex items-center gap-4">
//             <div className="bg-orange-100 p-3 rounded-xl">
//               <Heart className="w-6 h-6 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-gray-500 text-sm font-medium">Total Fees Needed</p>
//               <p className="text-2xl font-bold text-gray-900">${stats.totalNeeded.toLocaleString()}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!selectedInstitutionId ? (
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-900">All Institutions</h2>
//             <p className="text-sm text-gray-500">{institutions.length} institutions registered</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {institutions.map((institution) => {
//               const studentCount = groupedStudents[institution.id]?.students.length || 0
//               const unsponsoredCount = institution.unsponsored_count || 0
//               const partialCount = institution.partially_sponsored_count || 0
//               const fullyCount = institution.fully_sponsored_count || 0
//               const totalNeededForInstitution = institution.total_balance_needed || 0

//               return (
//                 <div
//                   key={institution.id}
//                   onClick={() => setSelectedInstitutionId(institution.id)}
//                   className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
//                 >
//                   {/* Institution Header with Logo/Icon */}
//                   <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white relative overflow-hidden">
//                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
//                     <div className="relative">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
//                           <School className="w-8 h-8 text-white" />
//                         </div>
//                         <ChevronRight className="w-6 h-6 opacity-70 group-hover:translate-x-1 transition-transform" />
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <h3 className="text-lg font-bold group-hover:underline">{institution.name}</h3>
//                         {institution.is_verified && <VerifiedBadge size="sm" />}
//                       </div>
//                       <p className="text-blue-100 text-sm mt-1 capitalize">
//                         {institution.institution_type?.replace(/_/g, " ") || "Educational Institution"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Institution Details */}
//                   <div className="p-5 space-y-4">
//                     {/* Student Count - Prominent */}
//                     <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
//                       <GraduationCap className="w-8 h-8 text-blue-600" />
//                       <div>
//                         <p className="text-2xl font-bold text-blue-600">{studentCount}</p>
//                         <p className="text-xs text-gray-600">Total Students Registered</p>
//                       </div>
//                     </div>

//                     {studentCount > 0 && (
//                       <div className="grid grid-cols-3 gap-2 text-center">
//                         <div className="p-2 bg-red-50 rounded-lg">
//                           <UserX className="w-4 h-4 text-red-500 mx-auto mb-1" />
//                           <p className="text-lg font-bold text-red-600">{unsponsoredCount}</p>
//                           <p className="text-xs text-gray-500">Unsponsored</p>
//                         </div>
//                         <div className="p-2 bg-orange-50 rounded-lg">
//                           <UserMinus className="w-4 h-4 text-orange-500 mx-auto mb-1" />
//                           <p className="text-lg font-bold text-orange-600">{partialCount}</p>
//                           <p className="text-xs text-gray-500">Partial</p>
//                         </div>
//                         <div className="p-2 bg-green-50 rounded-lg">
//                           <UserCheck className="w-4 h-4 text-green-500 mx-auto mb-1" />
//                           <p className="text-lg font-bold text-green-600">{fullyCount}</p>
//                           <p className="text-xs text-gray-500">Sponsored</p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Total Needed */}
//                     {totalNeededForInstitution > 0 && (
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-gray-500">Total Funding Needed</span>
//                         <span className="font-semibold text-orange-600">
//                           ${totalNeededForInstitution.toLocaleString()}
//                         </span>
//                       </div>
//                     )}

//                     {/* Location */}
//                     {institution.address && (
//                       <div>
//                         <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
//                         <p className="text-sm text-gray-700">{institution.address}</p>
//                       </div>
//                     )}

//                     {/* View Students Button */}
//                     <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors group-hover:shadow-md">
//                       View {studentCount} Student{studentCount !== 1 ? "s" : ""}
//                     </button>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//           {institutions.length === 0 && (
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
//               <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">No Institutions Found</h3>
//               <p className="text-gray-600 max-w-md mx-auto">
//                 There are currently no institutions registered in the system. Please check back later.
//               </p>
//             </div>
//           )}
//         </div>
//       ) : selectedInstitution ? (
//         /* Students List View - shown when an institution is selected */
//         <div>
//           {/* Back Button */}
//           <button
//             onClick={() => setSelectedInstitutionId(null)}
//             className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium mb-4"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back to All Institutions
//           </button>

//           {/* Selected Institution Header */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
//               <div className="flex items-start gap-4">
//                 <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
//                   <School className="w-10 h-10 text-white" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h2 className="text-2xl font-bold">{selectedInstitution.institution.name}</h2>
//                     {selectedInstitution.institution.is_verified && <VerifiedBadge size="md" />}
//                   </div>
//                   <p className="text-blue-100 capitalize mb-3">
//                     {selectedInstitution.institution.institution_type?.replace(/_/g, " ") || "Educational Institution"}
//                   </p>
//                   <div className="flex flex-wrap gap-4 text-sm text-blue-100">
//                     {selectedInstitution.institution.address && <span>{selectedInstitution.institution.address}</span>}
//                     {selectedInstitution.institution.email && (
//                       <span>Email: {selectedInstitution.institution.email}</span>
//                     )}
//                     {selectedInstitution.institution.phone && (
//                       <span>Phone: {selectedInstitution.institution.phone}</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-right bg-white/10 rounded-xl px-5 py-3">
//                   <p className="text-3xl font-bold">{selectedInstitution.students.length}</p>
//                   <p className="text-sm text-blue-100">Students</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {(() => {
//             const sortedStudents = sortStudentsBySponsorshipStatus(selectedInstitution.students)
//             const unsponsoredStudents = sortedStudents.filter(
//               (s) => s.sponsorship_status === "unsponsored" || s.sponsorship_status === "no_fees_recorded",
//             )
//             const partiallySponsored = sortedStudents.filter((s) => s.sponsorship_status === "partially_sponsored")
//             const fullySponsored = sortedStudents.filter((s) => s.sponsorship_status === "fully_sponsored")

//             return (
//               <div className="space-y-8">
//                 {/* Unsponsored Students Section */}
//                 {unsponsoredStudents.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-red-100 rounded-lg">
//                         <UserX className="w-5 h-5 text-red-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">Students Needing Sponsors</h3>
//                         <p className="text-sm text-gray-500">
//                           {unsponsoredStudents.length} students without sponsorship
//                         </p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {unsponsoredStudents.map((student) => (
//                         <StudentCard
//                           key={student.id}
//                           student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
//                           onClick={() => handleStudentClick(student, selectedInstitution.institution)}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Partially Sponsored Students Section */}
//                 {partiallySponsored.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-orange-100 rounded-lg">
//                         <UserMinus className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">Partially Sponsored</h3>
//                         <p className="text-sm text-gray-500">
//                           {partiallySponsored.length} students with partial funding
//                         </p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {partiallySponsored.map((student) => (
//                         <StudentCard
//                           key={student.id}
//                           student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
//                           onClick={() => handleStudentClick(student, selectedInstitution.institution)}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Fully Sponsored Students Section */}
//                 {fullySponsored.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-green-100 rounded-lg">
//                         <UserCheck className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">Fully Sponsored</h3>
//                         <p className="text-sm text-gray-500">{fullySponsored.length} students with full sponsorship</p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
//                       {fullySponsored.map((student) => (
//                         <StudentCard
//                           key={student.id}
//                           student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
//                           onClick={() => {}}
//                           disabled
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {sortedStudents.length === 0 && (
//                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
//                     <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
//                     <p className="text-gray-600">This institution has no students registered yet.</p>
//                   </div>
//                 )}
//               </div>
//             )
//           })()}
//         </div>
//       ) : null}

//       {/* Student Detail Modal */}
//       {selectedStudent && (
//         <StudentDetailModal
//           student={selectedStudent}
//           onClose={() => setSelectedStudent(null)}
//           onSponsor={handleSponsorClick}
//         />
//       )}

//       {/* Sponsorship Modal */}
//       {sponsorshipStudent && (
//         <SponsorshipModal
//           student={sponsorshipStudent}
//           onClose={() => setSponsorshipStudent(null)}
//           onSubmit={handleSponsorshipSubmit}
//         />
//       )}

//       {/* Donation Modal */}
//       {showDonationModal && (
//         <DonationModal onClose={() => setShowDonationModal(false)} onSubmit={handleDonationSubmit} />
//       )}
//     </div>
//   )
// }
// "use client"

// import { useEffect, useState } from "react"
// import {
//   Heart,
//   Users,
//   School,
//   Loader2,
//   AlertCircle,
//   ChevronRight,
//   ArrowLeft,
//   Building2,
//   GraduationCap,
//   UserX,
//   UserCheck,
//   UserMinus,
// } from "lucide-react"
// import { api } from "../../lib/api"
// import type { Institution, StudentWithFeeBalance, GroupedUnsponsoredStudents } from "../../lib/api/types"
// import { StudentCard } from "./StudentCard"
// import { StudentDetailModal } from "./StudentDetailModal"
// import { SponsorshipModal } from "./SponsorshipModal"
// import { DonationModal } from "./DonationModal"
// import type { Sponsor, StudentWithPaymentAccounts } from "../../types"
// import { VerifiedBadge } from "../VerifiedBadge"

// interface InstitutionWithCounts extends Institution {
//   unsponsored_count?: number
//   partially_sponsored_count?: number
//   fully_sponsored_count?: number
// }

// type InstitutionCategory = "secondary_school" | "university" | null

// export function StudentsInNeedDashboard() {
//   const [groupedStudents, setGroupedStudents] = useState<GroupedUnsponsoredStudents>({})
//   const [institutions, setInstitutions] = useState<InstitutionWithCounts[]>([])
//   const [selectedCategory, setSelectedCategory] = useState<InstitutionCategory>(null)
//   const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null)
//   const [selectedStudent, setSelectedStudent] = useState<StudentWithPaymentAccounts | null>(null)
//   const [sponsorshipStudent, setSponsorshipStudent] = useState<StudentWithPaymentAccounts | null>(null)
//   const [showDonationModal, setShowDonationModal] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [stats, setStats] = useState({ totalStudents: 0, totalInstitutions: 0, totalNeeded: 0 })

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const response = await api.getStudentsInNeed()

//       setGroupedStudents(response.grouped_students || {})
//       setInstitutions(response.institutions || [])
//       setStats({
//         totalStudents: response.stats?.total_students || 0,
//         totalInstitutions: response.stats?.total_institutions || 0,
//         totalNeeded: response.stats?.total_needed || 0,
//       })
//     } catch (err: any) {
//       const errorMessage =
//         typeof err === "object" && err !== null ? err.detail || err.message || JSON.stringify(err) : String(err)
//       setError(errorMessage)
//       console.error("[v0] Error fetching data:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getFilteredInstitutions = () => {
//     if (!selectedCategory) return institutions
//     return institutions.filter((inst) => {
//       const type = inst.institution_type?.toLowerCase() || ""
//       if (selectedCategory === "secondary_school") {
//         return type.includes("secondary") || type.includes("high_school") || type === "secondary_school"
//       }
//       if (selectedCategory === "university") {
//         return type.includes("university") || type.includes("college") || type === "university"
//       }
//       return false
//     })
//   }

//   const getCategoryStats = () => {
//     const secondarySchools = institutions.filter((inst) => {
//       const type = inst.institution_type?.toLowerCase() || ""
//       return type.includes("secondary") || type.includes("high_school") || type === "secondary_school"
//     })
//     const universities = institutions.filter((inst) => {
//       const type = inst.institution_type?.toLowerCase() || ""
//       return type.includes("university") || type.includes("college") || type === "university"
//     })

//     const secondaryStudents = secondarySchools.reduce(
//       (acc, inst) => acc + (groupedStudents[inst.id]?.students.length || 0),
//       0,
//     )
//     const universityStudents = universities.reduce(
//       (acc, inst) => acc + (groupedStudents[inst.id]?.students.length || 0),
//       0,
//     )

//     const secondaryNeeded = secondarySchools.reduce((acc, inst) => acc + (inst.total_balance_needed || 0), 0)
//     const universityNeeded = universities.reduce((acc, inst) => acc + (inst.total_balance_needed || 0), 0)

//     return {
//       secondary: {
//         count: secondarySchools.length,
//         students: secondaryStudents,
//         needed: secondaryNeeded,
//       },
//       university: {
//         count: universities.length,
//         students: universityStudents,
//         needed: universityNeeded,
//       },
//     }
//   }

//   const handleBack = () => {
//     if (selectedInstitutionId) {
//       setSelectedInstitutionId(null)
//     } else if (selectedCategory) {
//       setSelectedCategory(null)
//     }
//   }

//   const transformToStudentWithPaymentAccounts = (
//     student: StudentWithFeeBalance,
//     institution: Institution,
//   ): StudentWithPaymentAccounts => {
//     return {
//       id: student.id,
//       institution_id: student.institution_id,
//       full_name: `${student.first_name} ${student.last_name}`,
//       date_of_birth: student.date_of_birth || "",
//       gender: student.gender || "",
//       grade_level: student.course || student.year_of_study?.toString() || "",
//       location: student.city || student.address || null,
//       photo_url: student.profile_image_url || null,
//       background_story: student.bio || null,
//       family_situation: null,
//       academic_performance: null,
//       need_level: 5,
//       created_at: student.created_at,
//       updated_at: student.created_at,
//       payment_accounts: [],
//       institution: {
//         id: institution.id,
//         name: institution.name,
//         email: institution.email || "",
//         phone: institution.phone || null,
//         address: institution.address || null,
//         created_at: institution.created_at,
//         is_verified: institution.is_verified,
//       },
//       fee_balance: {
//         id: student.id,
//         student_id: student.id,
//         total_fees: student.total_fees || 0,
//         amount_paid: student.amount_paid || 0,
//         balance_due: student.fee_balance || 0,
//         last_updated: student.created_at,
//       },
//     }
//   }

//   const sortStudentsBySponsorshipStatus = (students: StudentWithFeeBalance[]): StudentWithFeeBalance[] => {
//     const statusOrder: Record<string, number> = {
//       unsponsored: 0,
//       no_fees_recorded: 1,
//       partially_sponsored: 2,
//       fully_sponsored: 3,
//     }

//     return [...students].sort((a, b) => {
//       const orderA = statusOrder[a.sponsorship_status || "unsponsored"] ?? 0
//       const orderB = statusOrder[b.sponsorship_status || "unsponsored"] ?? 0
//       return orderA - orderB
//     })
//   }

//   const handleStudentClick = async (student: StudentWithFeeBalance, institution: Institution) => {
//     if (student.sponsorship_status === "fully_sponsored") {
//       return
//     }

//     try {
//       const feeBalance = await api.getStudentFeeBalance(student.id)

//       const studentWithPayments = transformToStudentWithPaymentAccounts(student, institution)
//       studentWithPayments.fee_balance = {
//         id: student.id,
//         student_id: student.id,
//         total_fees: feeBalance.total_fees || student.total_fees || 0,
//         amount_paid: feeBalance.amount_paid || student.amount_paid || 0,
//         balance_due: feeBalance.balance || student.fee_balance || 0,
//         last_updated: feeBalance.updated_at || student.created_at,
//       }

//       setSelectedStudent(studentWithPayments)
//     } catch (err) {
//       console.error("[v0] Error fetching student details:", err)
//       setSelectedStudent(transformToStudentWithPaymentAccounts(student, institution))
//     }
//   }

//   const handleSponsorClick = async () => {
//     if (selectedStudent) {
//       setSponsorshipStudent(selectedStudent)
//       setSelectedStudent(null)
//     }
//   }

//   const handleSponsorshipSubmit = async (data: {
//     sponsor: Omit<Sponsor, "id" | "user_id" | "is_active" | "created_at">
//     commitmentType: "full" | "partial"
//     amount: number
//     paymentMethod: string
//     paymentType: "full" | "partial"
//   }) => {
//     try {
//       if (!sponsorshipStudent) return

//       await api.createSponsorship({
//         student_id: sponsorshipStudent.id,
//         amount: data.amount,
//         currency: "USD",
//         notes: `Payment method: ${data.paymentMethod}, Type: ${data.commitmentType}`,
//       })

//       alert("Sponsorship created successfully!")
//       setSponsorshipStudent(null)
//       fetchData()
//     } catch (error) {
//       console.error("Error creating sponsorship:", error)
//       throw error
//     }
//   }

//   const handleDonationSubmit = async (data: {
//     donor_name: string
//     donor_email: string
//     amount: number
//     payment_method: string
//     message: string | null
//   }) => {
//     try {
//       await api.createDonation({
//         amount: data.amount,
//         currency: "USD",
//         payment_method: data.payment_method,
//         notes: data.message || undefined,
//       })

//       alert("Thank you for your donation!")
//       setShowDonationModal(false)
//     } catch (error) {
//       console.error("Error creating donation:", error)
//       throw error
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading institutions and students...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={fetchData}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const selectedInstitution = selectedInstitutionId ? groupedStudents[selectedInstitutionId] : null
//   const filteredInstitutions = getFilteredInstitutions()
//   const categoryStats = getCategoryStats()

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-1">Students in Need</h1>
//           <p className="text-gray-600">Find and sponsor students who need your help</p>
//         </div>
//         <button
//           onClick={() => setShowDonationModal(true)}
//           className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
//         >
//           <Heart className="w-5 h-5" />
//           Donate to DestinyPal
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-100 p-3 rounded-xl">
//               <Users className="w-6 h-6 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-gray-500 text-sm font-medium">Total Students</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <div className="flex items-center gap-4">
//             <div className="bg-green-100 p-3 rounded-xl">
//               <Building2 className="w-6 h-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-gray-500 text-sm font-medium">Institutions</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalInstitutions}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <div className="flex items-center gap-4">
//             <div className="bg-orange-100 p-3 rounded-xl">
//               <Heart className="w-6 h-6 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-gray-500 text-sm font-medium">Total Fees Needed</p>
//               <p className="text-2xl font-bold text-gray-900">${stats.totalNeeded.toLocaleString()}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!selectedCategory && !selectedInstitutionId ? (
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-900">Select Institution Type</h2>
//             <p className="text-sm text-gray-500">Choose a category to view institutions</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Secondary Schools Card */}
//             <div
//               onClick={() => setSelectedCategory("secondary_school")}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
//             >
//               <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
//                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
//                 <div className="relative">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
//                       <School className="w-10 h-10 text-white" />
//                     </div>
//                     <ChevronRight className="w-8 h-8 opacity-70 group-hover:translate-x-2 transition-transform" />
//                   </div>
//                   <h3 className="text-2xl font-bold mb-2">Secondary Schools</h3>
//                   <p className="text-emerald-100">High schools and secondary education institutions</p>
//                 </div>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   <div className="p-3 bg-emerald-50 rounded-xl">
//                     <Building2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-emerald-600">{categoryStats.secondary.count}</p>
//                     <p className="text-xs text-gray-500">Schools</p>
//                   </div>
//                   <div className="p-3 bg-blue-50 rounded-xl">
//                     <GraduationCap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-blue-600">{categoryStats.secondary.students}</p>
//                     <p className="text-xs text-gray-500">Students</p>
//                   </div>
//                   <div className="p-3 bg-orange-50 rounded-xl">
//                     <Heart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
//                     <p className="text-lg font-bold text-orange-600">
//                       ${categoryStats.secondary.needed.toLocaleString()}
//                     </p>
//                     <p className="text-xs text-gray-500">Needed</p>
//                   </div>
//                 </div>

//                 <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors group-hover:shadow-md">
//                   View Secondary Schools
//                 </button>
//               </div>
//             </div>

//             {/* Universities Card */}
//             <div
//               onClick={() => setSelectedCategory("university")}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
//             >
//               <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 text-white relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
//                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
//                 <div className="relative">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
//                       <GraduationCap className="w-10 h-10 text-white" />
//                     </div>
//                     <ChevronRight className="w-8 h-8 opacity-70 group-hover:translate-x-2 transition-transform" />
//                   </div>
//                   <h3 className="text-2xl font-bold mb-2">Universities</h3>
//                   <p className="text-indigo-100">Universities and higher education institutions</p>
//                 </div>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   <div className="p-3 bg-indigo-50 rounded-xl">
//                     <Building2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-indigo-600">{categoryStats.university.count}</p>
//                     <p className="text-xs text-gray-500">Universities</p>
//                   </div>
//                   <div className="p-3 bg-blue-50 rounded-xl">
//                     <GraduationCap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
//                     <p className="text-2xl font-bold text-blue-600">{categoryStats.university.students}</p>
//                     <p className="text-xs text-gray-500">Students</p>
//                   </div>
//                   <div className="p-3 bg-orange-50 rounded-xl">
//                     <Heart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
//                     <p className="text-lg font-bold text-orange-600">
//                       ${categoryStats.university.needed.toLocaleString()}
//                     </p>
//                     <p className="text-xs text-gray-500">Needed</p>
//                   </div>
//                 </div>

//                 <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors group-hover:shadow-md">
//                   View Universities
//                 </button>
//               </div>
//             </div>
//           </div>

//           {institutions.length === 0 && (
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center mt-6">
//               <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">No Institutions Found</h3>
//               <p className="text-gray-600 max-w-md mx-auto">
//                 There are currently no institutions registered in the system. Please check back later.
//               </p>
//             </div>
//           )}
//         </div>
//       ) : selectedCategory && !selectedInstitutionId ? (
//         /* Institutions List View - Show when a category is selected */
//         <div>
//           {/* Back Button */}
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium mb-4"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back to Categories
//           </button>

//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <div
//                 className={`p-2 rounded-lg ${selectedCategory === "secondary_school" ? "bg-emerald-100" : "bg-indigo-100"}`}
//               >
//                 {selectedCategory === "secondary_school" ? (
//                   <School className={`w-6 h-6 text-emerald-600`} />
//                 ) : (
//                   <GraduationCap className={`w-6 h-6 text-indigo-600`} />
//                 )}
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {selectedCategory === "secondary_school" ? "Secondary Schools" : "Universities"}
//                 </h2>
//                 <p className="text-sm text-gray-500">{filteredInstitutions.length} institutions registered</p>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredInstitutions.map((institution) => {
//               const studentCount = groupedStudents[institution.id]?.students.length || 0
//               const unsponsoredCount = institution.unsponsored_count || 0
//               const partialCount = institution.partially_sponsored_count || 0
//               const fullyCount = institution.fully_sponsored_count || 0
//               const totalNeededForInstitution = institution.total_balance_needed || 0

//               const gradientClass =
//                 selectedCategory === "secondary_school"
//                   ? "from-emerald-600 to-emerald-700"
//                   : "from-indigo-600 to-indigo-700"

//               return (
//                 <div
//                   key={institution.id}
//                   onClick={() => setSelectedInstitutionId(institution.id)}
//                   className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
//                 >
//                   <div className={`bg-gradient-to-r ${gradientClass} p-5 text-white relative overflow-hidden`}>
//                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
//                     <div className="relative">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
//                           {selectedCategory === "secondary_school" ? (
//                             <School className="w-8 h-8 text-white" />
//                           ) : (
//                             <GraduationCap className="w-8 h-8 text-white" />
//                           )}
//                         </div>
//                         <ChevronRight className="w-6 h-6 opacity-70 group-hover:translate-x-1 transition-transform" />
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <h3 className="text-lg font-bold group-hover:underline">{institution.name}</h3>
//                         {institution.is_verified && <VerifiedBadge size="sm" />}
//                       </div>
//                       <p className="text-white/80 text-sm mt-1 capitalize">
//                         {institution.institution_type?.replace(/_/g, " ") || "Educational Institution"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="p-5 space-y-4">
//                     <div
//                       className={`flex items-center gap-3 p-3 rounded-lg ${selectedCategory === "secondary_school" ? "bg-emerald-50" : "bg-indigo-50"}`}
//                     >
//                       <GraduationCap
//                         className={`w-8 h-8 ${selectedCategory === "secondary_school" ? "text-emerald-600" : "text-indigo-600"}`}
//                       />
//                       <div>
//                         <p
//                           className={`text-2xl font-bold ${selectedCategory === "secondary_school" ? "text-emerald-600" : "text-indigo-600"}`}
//                         >
//                           {studentCount}
//                         </p>
//                         <p className="text-xs text-gray-600">Total Students Registered</p>
//                       </div>
//                     </div>

//                     {studentCount > 0 && (
//                       <div className="grid grid-cols-3 gap-2 text-center">
//                         <div className="p-2 bg-red-50 rounded-lg">
//                           <UserX className="w-4 h-4 text-red-500 mx-auto mb-1" />
//                           <p className="text-lg font-bold text-red-600">{unsponsoredCount}</p>
//                           <p className="text-xs text-gray-500">Unsponsored</p>
//                         </div>
//                         <div className="p-2 bg-orange-50 rounded-lg">
//                           <UserMinus className="w-4 h-4 text-orange-500 mx-auto mb-1" />
//                           <p className="text-lg font-bold text-orange-600">{partialCount}</p>
//                           <p className="text-xs text-gray-500">Partial</p>
//                         </div>
//                         <div className="p-2 bg-green-50 rounded-lg">
//                           <UserCheck className="w-4 h-4 text-green-500 mx-auto mb-1" />
//                           <p className="text-lg font-bold text-green-600">{fullyCount}</p>
//                           <p className="text-xs text-gray-500">Sponsored</p>
//                         </div>
//                       </div>
//                     )}

//                     {totalNeededForInstitution > 0 && (
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-gray-500">Total Funding Needed</span>
//                         <span className="font-semibold text-orange-600">
//                           ${totalNeededForInstitution.toLocaleString()}
//                         </span>
//                       </div>
//                     )}

//                     {institution.address && (
//                       <div>
//                         <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
//                         <p className="text-sm text-gray-700">{institution.address}</p>
//                       </div>
//                     )}

//                     <button
//                       className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-colors group-hover:shadow-md text-white ${selectedCategory === "secondary_school" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
//                     >
//                       View {studentCount} Student{studentCount !== 1 ? "s" : ""}
//                     </button>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//           {filteredInstitutions.length === 0 && (
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
//               <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No {selectedCategory === "secondary_school" ? "Secondary Schools" : "Universities"} Found
//               </h3>
//               <p className="text-gray-600 max-w-md mx-auto">
//                 There are currently no {selectedCategory === "secondary_school" ? "secondary schools" : "universities"}{" "}
//                 registered in the system.
//               </p>
//             </div>
//           )}
//         </div>
//       ) : selectedInstitution ? (
//         /* Students List View - shown when an institution is selected */
//         <div>
//           {/* Back Button */}
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium mb-4"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back to {selectedCategory === "secondary_school" ? "Secondary Schools" : "Universities"}
//           </button>

//           {/* Selected Institution Header */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
//             <div
//               className={`bg-gradient-to-r ${selectedCategory === "secondary_school" ? "from-emerald-600 to-emerald-700" : "from-indigo-600 to-indigo-700"} p-6 text-white`}
//             >
//               <div className="flex items-start gap-4">
//                 <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
//                   {selectedCategory === "secondary_school" ? (
//                     <School className="w-10 h-10 text-white" />
//                   ) : (
//                     <GraduationCap className="w-10 h-10 text-white" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h2 className="text-2xl font-bold">{selectedInstitution.institution.name}</h2>
//                     {selectedInstitution.institution.is_verified && <VerifiedBadge size="md" />}
//                   </div>
//                   <p className="text-white/80 capitalize mb-3">
//                     {selectedInstitution.institution.institution_type?.replace(/_/g, " ") || "Educational Institution"}
//                   </p>
//                   <div className="flex flex-wrap gap-4 text-sm text-white/80">
//                     {selectedInstitution.institution.address && <span>{selectedInstitution.institution.address}</span>}
//                     {selectedInstitution.institution.email && (
//                       <span>Email: {selectedInstitution.institution.email}</span>
//                     )}
//                     {selectedInstitution.institution.phone && (
//                       <span>Phone: {selectedInstitution.institution.phone}</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-right bg-white/10 rounded-xl px-5 py-3">
//                   <p className="text-3xl font-bold">{selectedInstitution.students.length}</p>
//                   <p className="text-sm text-white/80">Students</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {(() => {
//             const sortedStudents = sortStudentsBySponsorshipStatus(selectedInstitution.students)
//             const unsponsoredStudents = sortedStudents.filter(
//               (s) => s.sponsorship_status === "unsponsored" || s.sponsorship_status === "no_fees_recorded",
//             )
//             const partiallySponsored = sortedStudents.filter((s) => s.sponsorship_status === "partially_sponsored")
//             const fullySponsored = sortedStudents.filter((s) => s.sponsorship_status === "fully_sponsored")

//             return (
//               <div className="space-y-8">
//                 {/* Unsponsored Students Section */}
//                 {unsponsoredStudents.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-red-100 rounded-lg">
//                         <UserX className="w-5 h-5 text-red-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">Students Needing Sponsors</h3>
//                         <p className="text-sm text-gray-500">
//                           {unsponsoredStudents.length} students without sponsorship
//                         </p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {unsponsoredStudents.map((student) => (
//                         <StudentCard
//                           key={student.id}
//                           student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
//                           onClick={() => handleStudentClick(student, selectedInstitution.institution)}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Partially Sponsored Students Section */}
//                 {partiallySponsored.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-orange-100 rounded-lg">
//                         <UserMinus className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">Partially Sponsored</h3>
//                         <p className="text-sm text-gray-500">
//                           {partiallySponsored.length} students with partial funding
//                         </p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {partiallySponsored.map((student) => (
//                         <StudentCard
//                           key={student.id}
//                           student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
//                           onClick={() => handleStudentClick(student, selectedInstitution.institution)}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Fully Sponsored Students Section */}
//                 {fullySponsored.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-green-100 rounded-lg">
//                         <UserCheck className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">Fully Sponsored</h3>
//                         <p className="text-sm text-gray-500">{fullySponsored.length} students with full sponsorship</p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
//                       {fullySponsored.map((student) => (
//                         <StudentCard
//                           key={student.id}
//                           student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
//                           onClick={() => {}}
//                           disabled
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {sortedStudents.length === 0 && (
//                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
//                     <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
//                     <p className="text-gray-600">This institution has no students registered yet.</p>
//                   </div>
//                 )}
//               </div>
//             )
//           })()}
//         </div>
//       ) : null}

//       {/* Student Detail Modal */}
//       {selectedStudent && (
//         <StudentDetailModal
//           student={selectedStudent}
//           onClose={() => setSelectedStudent(null)}
//           onSponsor={handleSponsorClick}
//         />
//       )}

//       {/* Sponsorship Modal */}
//       {sponsorshipStudent && (
//         <SponsorshipModal
//           student={sponsorshipStudent}
//           onClose={() => setSponsorshipStudent(null)}
//           onSubmit={handleSponsorshipSubmit}
//         />
//       )}

//       {/* Donation Modal */}
//       {showDonationModal && (
//         <DonationModal onClose={() => setShowDonationModal(false)} onSubmit={handleDonationSubmit} />
//       )}
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { api } from "../../lib/api"
import type { Institution, StudentWithFeeBalance, GroupedUnsponsoredStudents } from "../../lib/api/types"
import { StudentCard } from "./StudentCard"
import { StudentDetailModal } from "./StudentDetailModal"
import { SponsorshipModal } from "./SponsorshipModal"
import { DonationModal } from "./DonationModal"
import type { Sponsor, StudentWithPaymentAccounts } from "../../types"
import { VerifiedBadge } from "../VerifiedBadge"


interface InstitutionWithCounts extends Institution {
  unsponsored_count?: number
  partially_sponsored_count?: number
  fully_sponsored_count?: number
}

type InstitutionCategory = "secondary_school" | "university" | null

export function StudentsInNeedDashboard() {
  const [groupedStudents, setGroupedStudents] = useState<GroupedUnsponsoredStudents>({})
  const [institutions, setInstitutions] = useState<InstitutionWithCounts[]>([])
  const [selectedCategory, setSelectedCategory] = useState<InstitutionCategory>(null)
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithPaymentAccounts | null>(null)
  const [sponsorshipStudent, setSponsorshipStudent] = useState<StudentWithPaymentAccounts | null>(null)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalStudents: 0, totalInstitutions: 0, totalNeeded: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.getStudentsInNeed()

      setGroupedStudents(response.grouped_students || {})
      setInstitutions(response.institutions || [])
      setStats({
        totalStudents: response.stats?.total_students || 0,
        totalInstitutions: response.stats?.total_institutions || 0,
        totalNeeded: response.stats?.total_needed || 0,
      })
    } catch (err: any) {
      const errorMessage =
        typeof err === "object" && err !== null ? err.detail || err.message || JSON.stringify(err) : String(err)
      setError(errorMessage)
      console.error("[v0] Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredInstitutions = () => {
    if (!selectedCategory) return institutions
    return institutions.filter((inst) => {
      const type = inst.institution_type?.toLowerCase() || ""
      if (selectedCategory === "secondary_school") {
        return type.includes("secondary") || type.includes("high_school") || type === "secondary_school"
      }
      if (selectedCategory === "university") {
        return type.includes("university") || type.includes("college") || type === "university"
      }
      return false
    })
  }

  const getCategoryStats = () => {
    const secondarySchools = institutions.filter((inst) => {
      const type = inst.institution_type?.toLowerCase() || ""
      return type.includes("secondary") || type.includes("high_school") || type === "secondary_school"
    })
    const universities = institutions.filter((inst) => {
      const type = inst.institution_type?.toLowerCase() || ""
      return type.includes("university") || type.includes("college") || type === "university"
    })

    const secondaryStudents = secondarySchools.reduce(
      (acc, inst) => acc + (groupedStudents[inst.id]?.students.length || 0),
      0,
    )
    const universityStudents = universities.reduce(
      (acc, inst) => acc + (groupedStudents[inst.id]?.students.length || 0),
      0,
    )

    const secondaryNeeded = secondarySchools.reduce((acc, inst) => acc + (inst.total_balance_needed || 0), 0)
    const universityNeeded = universities.reduce((acc, inst) => acc + (inst.total_balance_needed || 0), 0)

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
    }
  }

  const handleBack = () => {
    if (selectedInstitutionId) {
      setSelectedInstitutionId(null)
    } else if (selectedCategory) {
      setSelectedCategory(null)
    }
  }

  const transformToStudentWithPaymentAccounts = (
    student: StudentWithFeeBalance,
    institution: Institution,
  ): StudentWithPaymentAccounts => {
    return {
      id: student.id,
      institution_id: student.institution_id,
      full_name: `${student.first_name} ${student.last_name}`,
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      grade_level: student.course || student.year_of_study?.toString() || "",
      location: student.city || student.address || null,
      photo_url: student.profile_image_url || null,
      background_story: student.bio || null,
      family_situation: null,
      academic_performance: null,
      need_level: 5,
      created_at: student.created_at,
      updated_at: student.created_at,
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
      fee_balance: {
        id: student.id,
        student_id: student.id,
        total_fees: student.total_fees || 0,
        amount_paid: student.amount_paid || 0,
        balance_due: student.fee_balance || 0,
        last_updated: student.created_at,
      },
    }
  }

  const sortStudentsBySponsorshipStatus = (students: StudentWithFeeBalance[]): StudentWithFeeBalance[] => {
    const statusOrder: Record<string, number> = {
      unsponsored: 0,
      no_fees_recorded: 1,
      partially_sponsored: 2,
      fully_sponsored: 3,
    }

    return [...students].sort((a, b) => {
      const orderA = statusOrder[a.sponsorship_status || "unsponsored"] ?? 0
      const orderB = statusOrder[b.sponsorship_status || "unsponsored"] ?? 0
      return orderA - orderB
    })
  }

  const handleStudentClick = async (student: StudentWithFeeBalance, institution: Institution) => {
    if (student.sponsorship_status === "fully_sponsored") {
      return
    }

    try {
      const feeBalance = await api.getStudentFeeBalance(student.id)

      const studentWithPayments = transformToStudentWithPaymentAccounts(student, institution)
      studentWithPayments.fee_balance = {
        id: student.id,
        student_id: student.id,
        total_fees: feeBalance.total_fees || student.total_fees || 0,
        amount_paid: feeBalance.amount_paid || student.amount_paid || 0,
        balance_due: feeBalance.balance || student.fee_balance || 0,
        last_updated: feeBalance.updated_at || student.created_at,
      }

      setSelectedStudent(studentWithPayments)
    } catch (err) {
      console.error("[v0] Error fetching student details:", err)
      setSelectedStudent(transformToStudentWithPaymentAccounts(student, institution))
    }
  }

  const handleSponsorClick = async () => {
    if (selectedStudent) {
      setSponsorshipStudent(selectedStudent)
      setSelectedStudent(null)
    }
  }

  const handleSponsorshipSubmit = async (data: {
    sponsor: Omit<Sponsor, "id" | "user_id" | "is_active" | "created_at">
    commitmentType: "full" | "partial"
    amount: number
    paymentMethod: string
    paymentType: "full" | "partial"
  }) => {
    try {
      if (!sponsorshipStudent) return

      await api.createSponsorship({
        student_id: sponsorshipStudent.id,
        amount: data.amount,
        currency: "USD",
        notes: `Payment method: ${data.paymentMethod}, Type: ${data.commitmentType}`,
      })

      alert("Sponsorship created successfully!")
      setSponsorshipStudent(null)
      fetchData()
    } catch (error) {
      console.error("Error creating sponsorship:", error)
      throw error
    }
  }

  const handleDonationSubmit = async (data: {
    donor_name: string
    donor_email: string
    amount: number
    payment_method: string
    message: string | null
  }) => {
    try {
      await api.createDonation({
        amount: data.amount,
        currency: "USD",
        payment_method: data.payment_method,
        notes: data.message || undefined,
      })

      alert("Thank you for your donation!")
      setShowDonationModal(false)
    } catch (error) {
      console.error("Error creating donation:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 px-3">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 px-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-2 px-5 rounded-lg transition-all text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const selectedInstitution = selectedInstitutionId ? groupedStudents[selectedInstitutionId] : null
  const filteredInstitutions = getFilteredInstitutions()
  const categoryStats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {!selectedCategory && !selectedInstitutionId ? (
          <div className="space-y-4">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs font-semibold text-blue-100 uppercase tracking-wide">Make a Difference</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Change a Student's Life Today</h1>
                <p className="text-blue-100 text-sm sm:text-base max-w-2xl mb-6">
                  Every student deserves the chance to pursue their dreams. Your sponsorship can transform a life and create a brighter future.
                </p>

                <button
                  onClick={() => setShowDonationModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 active:scale-95 font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm group"
                >
                  <Heart className="w-4 h-4 group-hover:fill-current transition-all" />
                  Support Our Mission
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-lg shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Students Waiting</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-lg shrink-0">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Institutions</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalInstitutions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2.5 rounded-lg shrink-0">
                    <Heart className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Total Needed</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">${(stats.totalNeeded / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <div className="text-center py-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Choose Where to Help</h2>
                <p className="text-xs sm:text-sm text-gray-600">Select an education level to view students</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
                {/* Secondary Schools Card */}
                <button
                  onClick={() => setSelectedCategory("secondary_school")}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg active:scale-98 transition-all duration-300 overflow-hidden group text-left"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 sm:p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <School className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1">Secondary Schools</h3>
                      <p className="text-emerald-100 text-xs">High school students</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Building2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-emerald-600">{categoryStats.secondary.count}</p>
                        <p className="text-[10px] text-gray-500">Schools</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-600">{categoryStats.secondary.students}</p>
                        <p className="text-[10px] text-gray-500">Students</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Heart className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-orange-600">
                          ${(categoryStats.secondary.needed / 1000).toFixed(0)}k
                        </p>
                        <p className="text-[10px] text-gray-500">Needed</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Universities Card */}
                <button
                  onClick={() => setSelectedCategory("university")}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg active:scale-98 transition-all duration-300 overflow-hidden group text-left"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 sm:p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1">Universities</h3>
                      <p className="text-blue-100 text-xs">College & university students</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-600">{categoryStats.university.count}</p>
                        <p className="text-[10px] text-gray-500">Universities</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-600">{categoryStats.university.students}</p>
                        <p className="text-[10px] text-gray-500">Students</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Heart className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-orange-600">
                          ${(categoryStats.university.needed / 1000).toFixed(0)}k
                        </p>
                        <p className="text-[10px] text-gray-500">Needed</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {institutions.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-md mx-auto">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No Institutions Yet</h3>
                  <p className="text-sm text-gray-600">Check back soon for students who need your help.</p>
                </div>
              )}
            </div>
          </div>
        ) : selectedCategory && !selectedInstitutionId ? (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${selectedCategory === "secondary_school" ? "bg-emerald-100" : "bg-blue-100"}`}
                >
                  {selectedCategory === "secondary_school" ? (
                    <School className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedCategory === "secondary_school" ? "Secondary Schools" : "Universities"}
                  </h2>
                  <p className="text-xs text-gray-500">{filteredInstitutions.length} institutions</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
              {filteredInstitutions.map((institution) => {
                const studentCount = groupedStudents[institution.id]?.students.length || 0
                const unsponsoredCount = institution.unsponsored_count || 0
                const partialCount = institution.partially_sponsored_count || 0
                const fullyCount = institution.fully_sponsored_count || 0
                const totalNeededForInstitution = institution.total_balance_needed || 0

                const gradientClass =
                  selectedCategory === "secondary_school"
                    ? "from-emerald-500 to-emerald-600"
                    : "from-blue-500 to-blue-600"

                return (
                  <button
                    key={institution.id}
                    onClick={() => setSelectedInstitutionId(institution.id)}
                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg active:scale-98 transition-all overflow-hidden group text-left"
                  >
                    <div className={`bg-gradient-to-br ${gradientClass} p-4 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                            {selectedCategory === "secondary_school" ? (
                              <School className="w-5 h-5 text-white" />
                            ) : (
                              <GraduationCap className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold leading-tight">{institution.name}</h3>
                          {institution.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      <div
                        className={`flex items-center gap-2 p-2 rounded-lg ${selectedCategory === "secondary_school" ? "bg-emerald-50" : "bg-blue-50"}`}
                      >
                        <GraduationCap
                          className={`w-6 h-6 shrink-0 ${selectedCategory === "secondary_school" ? "text-emerald-600" : "text-blue-600"}`}
                        />
                        <div>
                          <p
                            className={`text-xl font-bold ${selectedCategory === "secondary_school" ? "text-emerald-600" : "text-blue-600"}`}
                          >
                            {studentCount}
                          </p>
                          <p className="text-[10px] text-gray-600">Students</p>
                        </div>
                      </div>

                      {studentCount > 0 && (
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 bg-red-50 rounded-lg">
                            <UserX className="w-3 h-3 text-red-500 mx-auto mb-0.5" />
                            <p className="text-sm font-bold text-red-600">{unsponsoredCount}</p>
                            <p className="text-[9px] text-gray-500">Need Help</p>
                          </div>
                          <div className="p-1.5 bg-orange-50 rounded-lg">
                            <UserMinus className="w-3 h-3 text-orange-500 mx-auto mb-0.5" />
                            <p className="text-sm font-bold text-orange-600">{partialCount}</p>
                            <p className="text-[9px] text-gray-500">Partial</p>
                          </div>
                          <div className="p-1.5 bg-green-50 rounded-lg">
                            <UserCheck className="w-3 h-3 text-green-500 mx-auto mb-0.5" />
                            <p className="text-sm font-bold text-green-600">{fullyCount}</p>
                            <p className="text-[9px] text-gray-500">Funded</p>
                          </div>
                        </div>
                      )}

                      {totalNeededForInstitution > 0 && (
                        <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                          <span className="text-gray-500">Funding Needed</span>
                          <span className="font-bold text-orange-600">
                            ${(totalNeededForInstitution / 1000).toFixed(1)}k
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {filteredInstitutions.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-md mx-auto">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  No {selectedCategory === "secondary_school" ? "Schools" : "Universities"} Yet
                </h3>
                <p className="text-sm text-gray-600">Check back soon for students who need your support.</p>
              </div>
            )}
          </div>
        ) : selectedInstitution ? (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className={`bg-gradient-to-br ${selectedCategory === "secondary_school" ? "from-emerald-500 to-emerald-600" : "from-blue-500 to-blue-600"} p-4 sm:p-5 text-white`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    {selectedCategory === "secondary_school" ? (
                      <School className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    ) : (
                      <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-lg sm:text-xl font-bold truncate">{selectedInstitution.institution.name}</h2>
                      {selectedInstitution.institution.is_verified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-white/80 text-xs capitalize mb-2">
                      {selectedInstitution.institution.institution_type?.replace(/_/g, " ") || "Educational Institution"}
                    </p>
                    <div className="bg-white/10 rounded-lg px-3 py-1.5 inline-block">
                      <p className="text-xl font-bold">{selectedInstitution.students.length}</p>
                      <p className="text-[10px] text-white/80">Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const sortedStudents = sortStudentsBySponsorshipStatus(selectedInstitution.students)
              const unsponsoredStudents = sortedStudents.filter(
                (s) => s.sponsorship_status === "unsponsored" || s.sponsorship_status === "no_fees_recorded",
              )
              const partiallySponsored = sortedStudents.filter((s) => s.sponsorship_status === "partially_sponsored")
              const fullySponsored = sortedStudents.filter((s) => s.sponsorship_status === "fully_sponsored")

              return (
                <div className="space-y-6">
                  {unsponsoredStudents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                          <UserX className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Students Needing Sponsors</h3>
                          <p className="text-xs text-gray-500">{unsponsoredStudents.length} students waiting</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
                        {unsponsoredStudents.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
                            onClick={() => handleStudentClick(student, selectedInstitution.institution)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {partiallySponsored.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <UserMinus className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Partially Sponsored</h3>
                          <p className="text-xs text-gray-500">{partiallySponsored.length} need more support</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
                        {partiallySponsored.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
                            onClick={() => handleStudentClick(student, selectedInstitution.institution)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {fullySponsored.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <UserCheck className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Fully Sponsored</h3>
                          <p className="text-xs text-gray-500">{fullySponsored.length} students supported</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto opacity-60">
                        {fullySponsored.map((student) => (
                          <StudentCard
                            key={student.id}
                            student={transformToStudentWithPaymentAccounts(student, selectedInstitution.institution)}
                            onClick={() => {}}
                            disabled
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {sortedStudents.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-md mx-auto">
                      <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-gray-900 mb-1">No Students Yet</h3>
                      <p className="text-sm text-gray-600">This institution has no registered students.</p>
                    </div>
                  )}
                </div>
              )
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
        <DonationModal onClose={() => setShowDonationModal(false)} onSubmit={handleDonationSubmit} />
      )}
    </div>
  )
}
