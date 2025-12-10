"use client"

import { Mail, Phone, MessageCircle, HelpCircle, FileText, Users, DollarSign } from "lucide-react"

interface StudentHelpProps {
  userEmail: string
}

export function StudentHelp({ userEmail }: StudentHelpProps) {
  const faqs = [
    {
      question: "How do I view my sponsors?",
      answer:
        'Navigate to the "My Sponsors" section from the sidebar to see all sponsors supporting your education, including their contact information and payment history.',
    },
    {
      question: "How can I update my profile information?",
      answer:
        "Your profile information is managed by your institution. If you need to update any details, please contact your school administrator.",
    },
    {
      question: "When will I receive payment notifications?",
      answer:
        "You will receive email notifications whenever a payment is made toward your fees. Make sure email notifications are enabled in your Settings.",
    },
    {
      question: "Can I contact my sponsors directly?",
      answer:
        'Yes, you can see your sponsors\' contact information in the "My Sponsors" section. However, we recommend maintaining professional communication.',
    },
    {
      question: "How do I track my fee balance?",
      answer:
        "Your fee balance is displayed on your profile page. It shows the total fees, amount paid, and remaining balance.",
    },
    {
      question: "What if I have issues with my account?",
      answer:
        "Contact our support team using the contact information below, or reach out to your institution administrator for immediate assistance.",
    },
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@destinypal.org",
      description: "Get help via email",
      color: "blue",
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+254 700 000 000",
      description: "Call us during business hours",
      color: "green",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      value: "Available Mon-Fri",
      description: "9:00 AM - 5:00 PM EAT",
      color: "amber",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
      green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50" },
      amber: { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50" },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 lg:ml-64">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Help & Support</h1>
          <p className="text-lg text-gray-600">Get assistance and find answers to common questions</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contactMethods.map((method) => {
            const Icon = method.icon
            const colors = getColorClasses(method.color)
            return (
              <div key={method.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className={`${colors.light} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{method.title}</h3>
                <p className={`font-semibold ${colors.text} mb-2`}>{method.value}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            )
          })}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <HelpCircle className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Quick Links</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">View Sponsors</h3>
                <p className="text-sm text-gray-600">See who is supporting you</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Fee Balance</h3>
                <p className="text-sm text-gray-600">Check your payment status</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Settings</h3>
                <p className="text-sm text-gray-600">Manage your preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our support team is here to help you. Don't hesitate to reach out if you have any questions or concerns.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`mailto:support@destinypal.org?subject=Support Request from ${userEmail}`}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Email Support
            </a>
            <button className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-6 rounded-lg transition-colors">
              Contact Institution
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
