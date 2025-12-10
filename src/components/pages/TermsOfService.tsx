"use client"

import { Heart, ArrowLeft, FileText, Scale, Shield, AlertTriangle, Users, CreditCard } from "lucide-react"

interface TermsOfServiceProps {
  onBack?: () => void
}

const TABLE_OF_CONTENTS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "accounts", title: "3. User Accounts" },
  { id: "sponsor-terms", title: "4. Sponsor Terms" },
  { id: "student-terms", title: "5. Student Terms" },
  { id: "institution-terms", title: "6. Institution Terms" },
  { id: "payments", title: "7. Payments & Donations" },
  { id: "prohibited", title: "8. Prohibited Conduct" },
  { id: "intellectual-property", title: "9. Intellectual Property" },
  { id: "disclaimers", title: "10. Disclaimers" },
  { id: "liability", title: "11. Limitation of Liability" },
  { id: "termination", title: "12. Termination" },
  { id: "governing-law", title: "13. Governing Law" },
  { id: "changes", title: "14. Changes to Terms" },
  { id: "contact", title: "15. Contact Information" },
]

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">DestinyPal</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Table of Contents</h3>
              </div>
              <nav className="space-y-1">
                {TABLE_OF_CONTENTS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Terms of Service</h1>
                  <p className="text-slate-500">Last updated: December 6, 2025</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Welcome to DestinyPal. These Terms of Service govern your use of our platform and services. Please read
                them carefully before using our services.
              </p>
            </div>

            {/* Terms Content */}
            <div className="space-y-10 text-slate-600 leading-relaxed">
              {/* Section 1 */}
              <section id="acceptance">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">1.</span> Acceptance of Terms
                </h2>
                <p className="mb-4">
                  By accessing or using the DestinyPal platform ("Service"), you agree to be bound by these Terms of
                  Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and DestinyPal ("we," "us," or "our").
                  We may update these Terms from time to time, and your continued use of the Service constitutes
                  acceptance of any modifications.
                </p>
              </section>

              {/* Section 2 */}
              <section id="eligibility">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">2.</span> Eligibility
                </h2>
                <p className="mb-4">To use our Service, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be at least 18 years of age, or have parental/guardian consent if under 18</li>
                  <li>Have the legal capacity to enter into a binding agreement</li>
                  <li>Not be prohibited from using our services under applicable laws</li>
                  <li>Provide accurate and complete registration information</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="accounts">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">3.</span> User Accounts
                </h2>
                <p className="mb-4">
                  When you create an account, you must provide accurate, complete, and current information. You are
                  responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Immediately notifying us of any unauthorized use</li>
                  <li>Keeping your contact information up to date</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent
                  activity.
                </p>
              </section>

              {/* Section 4 */}
              <section id="sponsor-terms">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">4.</span> Sponsor Terms
                </h2>
                <p className="mb-4">As a sponsor, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Provide accurate payment information and honor your sponsorship commitments</li>
                  <li>Understand that sponsorship funds go directly to educational expenses</li>
                  <li>Respect the privacy of sponsored students</li>
                  <li>Not contact students outside of the platform without proper authorization</li>
                  <li>Report any concerns about fund usage through proper channels</li>
                </ul>
                <p>
                  Sponsorship payments are processed through secure third-party payment providers. Refunds may be
                  available within 30 days if funds have not been disbursed.
                </p>
              </section>

              {/* Section 5 */}
              <section id="student-terms">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">5.</span> Student Terms
                </h2>
                <p className="mb-4">As a student, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Provide accurate information about your educational status and financial need</li>
                  <li>Submit valid documentation for verification purposes</li>
                  <li>Use sponsorship funds exclusively for educational purposes</li>
                  <li>Provide progress updates as requested</li>
                  <li>Maintain satisfactory academic standing</li>
                  <li>Notify us of any changes in your enrollment status</li>
                </ul>
                <p>Misrepresentation of information may result in termination of sponsorship and account suspension.</p>
              </section>

              {/* Section 6 */}
              <section id="institution-terms">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">6.</span> Institution Terms
                </h2>
                <p className="mb-4">Partner institutions agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Verify the enrollment and academic status of students</li>
                  <li>Apply sponsorship funds as directed</li>
                  <li>Maintain accurate records and provide reports as required</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Protect student data in accordance with privacy laws</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="payments">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">7.</span> Payments & Donations
                </h2>
                <p className="mb-4">
                  All payments are processed securely through our authorized payment partners. By making a payment, you
                  agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Provide accurate billing information</li>
                  <li>Authorize us to charge your selected payment method</li>
                  <li>Accept that donations are generally non-refundable once disbursed</li>
                </ul>
                <p>
                  We do not store complete credit card information on our servers. All payment data is handled by
                  PCI-DSS compliant payment processors.
                </p>
              </section>

              {/* Section 8 */}
              <section id="prohibited">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">8.</span> Prohibited Conduct
                </h2>
                <p className="mb-4">You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Submit false or misleading information</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Attempt to gain unauthorized access to any systems</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Engage in harassment, discrimination, or abuse of other users</li>
                  <li>Solicit funds outside of the platform</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section id="intellectual-property">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">9.</span> Intellectual Property
                </h2>
                <p>
                  All content, features, and functionality of the Service are owned by DestinyPal and are protected by
                  copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify,
                  or create derivative works without our express written permission.
                </p>
              </section>

              {/* Section 10 */}
              <section id="disclaimers">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">10.</span> Disclaimers
                </h2>
                <p className="mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                  IMPLIED. We do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>That the Service will be uninterrupted or error-free</li>
                  <li>The accuracy or completeness of any information</li>
                  <li>Specific outcomes from using the Service</li>
                  <li>That sponsorships will result in educational completion</li>
                </ul>
              </section>

              {/* Section 11 */}
              <section id="liability">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">11.</span> Limitation of Liability
                </h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DESTINYPAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. Our total liability
                  shall not exceed the amount you have paid to us in the twelve months preceding the claim.
                </p>
              </section>

              {/* Section 12 */}
              <section id="termination">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">12.</span> Termination
                </h2>
                <p>
                  We may suspend or terminate your access to the Service at any time for violation of these Terms or for
                  any other reason. Upon termination, your right to use the Service will immediately cease. Provisions
                  that by their nature should survive termination shall survive.
                </p>
              </section>

              {/* Section 13 */}
              <section id="governing-law">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">13.</span> Governing Law
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to
                  conflict of law principles. Any disputes shall be resolved in the courts of Nairobi, Kenya.
                </p>
              </section>

              {/* Section 14 */}
              <section id="changes">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">14.</span> Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes
                  via email or through the Service. Your continued use of the Service after changes become effective
                  constitutes acceptance of the modified Terms.
                </p>
              </section>

              {/* Section 15 */}
              <section id="contact">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">15.</span> Contact Information
                </h2>
                <p className="mb-4">If you have any questions about these Terms, please contact us:</p>
                <div className="bg-slate-50 rounded-xl p-6">
                  <p className="font-semibold text-slate-900 mb-2">DestinyPal Legal Team</p>
                  <p>Email: legal@destinypal.org</p>
                  <p>Address: Westlands, ABC Place, 5th Floor, Nairobi, Kenya</p>
                  <p>Phone: +254 700 123 456</p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} DestinyPal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
