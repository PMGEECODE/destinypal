"use client"

import type React from "react"

import { useState } from "react"
import {
  Heart,
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  Globe,
  UserCheck,
  Bell,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface PrivacyPolicyProps {
  onBack?: () => void
}

interface Section {
  id: string
  icon: React.ElementType
  title: string
  summary: string
  content: React.ReactNode
}

const PRIVACY_SECTIONS: Section[] = [
  {
    id: "information-collected",
    icon: Database,
    title: "Information We Collect",
    summary: "Types of personal and usage data we gather",
    content: (
      <div className="space-y-4">
        <p>We collect information to provide and improve our services. This includes:</p>

        <div className="bg-slate-50 rounded-xl p-5 space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Information You Provide</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Account registration details (name, email, phone number)</li>
              <li>Profile information (photo, biography, location)</li>
              <li>Identity verification documents</li>
              <li>Payment and billing information</li>
              <li>Communications with us and other users</li>
              <li>Educational records and financial information (students)</li>
              <li>Institution details (for partner schools)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Information Collected Automatically</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage patterns and interaction with our platform</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log data and analytics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Information from Third Parties</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Verification data from partner institutions</li>
              <li>Payment processing information</li>
              <li>Social media profile data (if you connect accounts)</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    icon: Settings,
    title: "How We Use Your Information",
    summary: "Purposes for processing your personal data",
    content: (
      <div className="space-y-4">
        <p>We use your information for the following purposes:</p>

        <div className="grid gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-1">Service Delivery</h4>
            <p className="text-sm text-blue-800">
              To create and manage your account, process transactions, connect sponsors with students, and provide
              customer support.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-1">Verification & Security</h4>
            <p className="text-sm text-green-800">
              To verify identities, prevent fraud, ensure platform security, and maintain the integrity of our services.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-1">Communication</h4>
            <p className="text-sm text-amber-800">
              To send important updates, notifications about sponsorships, marketing communications (with consent), and
              respond to inquiries.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-1">Improvement & Analytics</h4>
            <p className="text-sm text-purple-800">
              To analyze usage patterns, improve our platform, develop new features, and conduct research.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Legal Compliance</h4>
            <p className="text-sm text-slate-700">
              To comply with legal obligations, respond to legal requests, and protect our rights.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sharing",
    icon: Share2,
    title: "How We Share Your Information",
    summary: "When and with whom we may share your data",
    content: (
      <div className="space-y-4">
        <p>We may share your information in the following circumstances:</p>

        <div className="space-y-3">
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">With Other Users</h4>
            <p className="text-sm text-slate-600">
              Sponsors can view student profiles (limited information). Students can see sponsor names. Institutions can
              access their students' information.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Service Providers</h4>
            <p className="text-sm text-slate-600">
              Payment processors, cloud hosting providers, email services, analytics providers, and customer support
              tools that help us operate our platform.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Partner Institutions</h4>
            <p className="text-sm text-slate-600">
              Schools and universities receive student and sponsorship information necessary for educational
              administration.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Legal Requirements</h4>
            <p className="text-sm text-slate-600">
              When required by law, court order, or to protect the safety and rights of DestinyPal, our users, or the
              public.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Business Transfers</h4>
            <p className="text-sm text-slate-600">
              In connection with a merger, acquisition, or sale of assets, your information may be transferred to the
              successor organization.
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            <strong>We never sell your personal information.</strong> We do not share your data with third parties for
            their marketing purposes.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "your-rights",
    icon: UserCheck,
    title: "Your Rights & Choices",
    summary: "Control you have over your personal data",
    content: (
      <div className="space-y-4">
        <p>You have the following rights regarding your personal information:</p>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Access</h4>
            <p className="text-sm text-slate-600">Request a copy of the personal data we hold about you.</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Correction</h4>
            <p className="text-sm text-slate-600">Update or correct inaccurate information in your account.</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Deletion</h4>
            <p className="text-sm text-slate-600">Request deletion of your account and personal data.</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Portability</h4>
            <p className="text-sm text-slate-600">Receive your data in a structured, machine-readable format.</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Opt-Out</h4>
            <p className="text-sm text-slate-600">Unsubscribe from marketing communications at any time.</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Restriction</h4>
            <p className="text-sm text-slate-600">Request limitations on how we process your data.</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          To exercise these rights, contact us at{" "}
          <a href="mailto:privacy@destinypal.org" className="text-blue-600 hover:underline">
            privacy@destinypal.org
          </a>
          . We will respond within 30 days.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    icon: Eye,
    title: "Cookies & Tracking",
    summary: "How we use cookies and similar technologies",
    content: (
      <div className="space-y-4">
        <p>We use cookies and similar tracking technologies to enhance your experience:</p>

        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Essential Cookies</h4>
            <p className="text-sm text-slate-600">Required for the platform to function. These cannot be disabled.</p>
          </div>

          <div className="border-l-4 border-green-500 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Performance Cookies</h4>
            <p className="text-sm text-slate-600">
              Help us understand how visitors interact with our platform to improve it.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Functional Cookies</h4>
            <p className="text-sm text-slate-600">Remember your preferences and personalize your experience.</p>
          </div>

          <div className="border-l-4 border-purple-500 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Marketing Cookies</h4>
            <p className="text-sm text-slate-600">Used to deliver relevant advertisements (only with your consent).</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          You can manage cookie preferences through your browser settings. Note that disabling certain cookies may
          affect platform functionality.
        </p>
      </div>
    ),
  },
  {
    id: "security",
    icon: Lock,
    title: "Data Security",
    summary: "How we protect your information",
    content: (
      <div className="space-y-4">
        <p>We implement comprehensive security measures to protect your data:</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Encryption</h4>
              <p className="text-xs text-slate-600">TLS/SSL encryption for all data in transit</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Secure Storage</h4>
              <p className="text-xs text-slate-600">Encrypted databases with access controls</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Access Control</h4>
              <p className="text-xs text-slate-600">Role-based permissions and 2FA</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Monitoring</h4>
              <p className="text-xs text-slate-600">24/7 security monitoring and audits</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Security Notice:</strong> While we implement strong security measures, no system is 100% secure.
            Please protect your account credentials and report any suspicious activity.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "retention",
    icon: Database,
    title: "Data Retention",
    summary: "How long we keep your information",
    content: (
      <div className="space-y-4">
        <p>We retain your information for as long as necessary to:</p>

        <ul className="list-disc list-inside space-y-2">
          <li>Provide our services to you</li>
          <li>Comply with legal and regulatory requirements</li>
          <li>Resolve disputes and enforce agreements</li>
          <li>Maintain security and prevent fraud</li>
        </ul>

        <div className="bg-slate-50 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="font-medium text-slate-900">Account Data</span>
            <span className="text-sm text-slate-600">Duration of account + 3 years</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="font-medium text-slate-900">Transaction Records</span>
            <span className="text-sm text-slate-600">7 years (legal requirement)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="font-medium text-slate-900">Support Communications</span>
            <span className="text-sm text-slate-600">3 years</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium text-slate-900">Analytics Data</span>
            <span className="text-sm text-slate-600">2 years (anonymized after)</span>
          </div>
        </div>

        <p className="text-sm text-slate-600">After the retention period, we securely delete or anonymize your data.</p>
      </div>
    ),
  },
  {
    id: "international",
    icon: Globe,
    title: "International Transfers",
    summary: "How we handle cross-border data transfers",
    content: (
      <div className="space-y-4">
        <p>
          DestinyPal operates primarily in Kenya but may transfer data internationally for processing. When we transfer
          data outside Kenya, we ensure appropriate safeguards:
        </p>

        <ul className="list-disc list-inside space-y-2">
          <li>Standard contractual clauses approved by data protection authorities</li>
          <li>Adequacy decisions where applicable</li>
          <li>Vendor security assessments and data processing agreements</li>
          <li>Encryption and access controls for data in transit and at rest</li>
        </ul>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Our primary data centers are located in secure facilities with appropriate certifications. We only work with
            service providers who meet our security and privacy standards.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "children",
    icon: UserCheck,
    title: "Children's Privacy",
    summary: "Our approach to minors' data",
    content: (
      <div className="space-y-4">
        <p>Our platform may be used by students under 18 years of age. For minor students:</p>

        <ul className="list-disc list-inside space-y-2">
          <li>Registration requires parental or guardian consent</li>
          <li>We collect only information necessary for the educational sponsorship purpose</li>
          <li>Parents/guardians can request access to or deletion of their child's data</li>
          <li>We do not knowingly market to children</li>
        </ul>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            If you believe we have collected information from a child without proper consent, please contact us
            immediately at{" "}
            <a href="mailto:privacy@destinypal.org" className="text-amber-900 hover:underline">
              privacy@destinypal.org
            </a>
            .
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "updates",
    icon: Bell,
    title: "Policy Updates",
    summary: "How we notify you of changes",
    content: (
      <div className="space-y-4">
        <p>
          We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal
          requirements, or other factors.
        </p>

        <p>When we make changes:</p>

        <ul className="list-disc list-inside space-y-2">
          <li>We will update the "Last updated" date at the top of this policy</li>
          <li>For material changes, we will notify you via email and/or platform notification</li>
          <li>We may ask for your consent if required by law</li>
          <li>Continued use of our services after changes constitutes acceptance</li>
        </ul>

        <p className="text-sm text-slate-600">
          We encourage you to review this policy periodically to stay informed about how we protect your information.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    icon: FileText,
    title: "Contact Us",
    summary: "How to reach our privacy team",
    content: (
      <div className="space-y-4">
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please
          contact us:
        </p>

        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Privacy Team</h4>
            <p className="text-sm text-slate-600">
              Email:{" "}
              <a href="mailto:privacy@destinypal.org" className="text-blue-600 hover:underline">
                privacy@destinypal.org
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Data Protection Officer</h4>
            <p className="text-sm text-slate-600">
              Email:{" "}
              <a href="mailto:dpo@destinypal.org" className="text-blue-600 hover:underline">
                dpo@destinypal.org
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Mailing Address</h4>
            <p className="text-sm text-slate-600">
              DestinyPal Privacy Team
              <br />
              Westlands, ABC Place, 5th Floor
              <br />
              P.O. Box 12345-00100
              <br />
              Nairobi, Kenya
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600">We aim to respond to all privacy-related inquiries within 30 days.</p>
      </div>
    ),
  },
]

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("information-collected")

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: December 6, 2025</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200 mb-8">
          <p className="text-slate-600 leading-relaxed mb-4">
            At DestinyPal, we are committed to protecting your privacy and ensuring the security of your personal
            information. This Privacy Policy explains how we collect, use, share, and protect your data when you use our
            platform.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We believe in transparency and want you to understand exactly how your information is handled. This policy
            is designed to be clear and comprehensive, following the structure of leading privacy policies to ensure
            nothing is left unexplained.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-4">Privacy at a Glance</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <Lock className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Your Data is Secure</h3>
              <p className="text-sm text-blue-100">We use industry-standard encryption and security measures.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <UserCheck className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">You're in Control</h3>
              <p className="text-sm text-blue-100">Access, update, or delete your data anytime.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Shield className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">No Data Sales</h3>
              <p className="text-sm text-blue-100">We never sell your personal information.</p>
            </div>
          </div>
        </div>

        {/* Expandable Sections (Facebook-style) */}
        <div className="space-y-3">
          {PRIVACY_SECTIONS.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <div key={section.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{section.title}</h3>
                    <p className="text-sm text-slate-500 truncate">{section.summary}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="border-t border-slate-200 pt-5 text-slate-600 leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Final Note */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            By using DestinyPal, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Questions? Contact us at{" "}
            <a href="mailto:privacy@destinypal.org" className="text-blue-600 hover:underline">
              privacy@destinypal.org
            </a>
          </p>
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
