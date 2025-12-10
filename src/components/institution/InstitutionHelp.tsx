import { Mail, Phone, MessageCircle, HelpCircle, FileText, Users, BookOpen, AlertCircle } from 'lucide-react';

interface InstitutionHelpProps {
  institutionEmail: string;
}

export function InstitutionHelp({ institutionEmail }: InstitutionHelpProps) {
  const faqs = [
    {
      question: 'How do I register a new student?',
      answer: 'Navigate to the "Register Student" section from the sidebar. Fill in all required information including personal details, fee information, and payment account details. Multiple payment accounts can be added for different banks.',
    },
    {
      question: 'What payment account information should I provide?',
      answer: 'For universities, provide your institution\'s bank account details. For secondary schools, you can use the bank account details with the student\'s name as the account holder. This allows sponsors to make direct payments to the appropriate accounts.',
    },
    {
      question: 'How do I track student payments?',
      answer: 'Each student\'s card in the Students section shows their payment progress. You can see total fees, amount paid, and outstanding balance. The dashboard also provides overall payment statistics.',
    },
    {
      question: 'Can I edit student information after registration?',
      answer: 'Yes, you can view student details and make updates as needed. This ensures that all information stays current and accurate for potential sponsors.',
    },
    {
      question: 'How do sponsors find our students?',
      answer: 'Students registered by your institution appear in the sponsor platform where potential sponsors can browse and choose to support students. Sponsors can see full student profiles including background, academic performance, and payment needs.',
    },
    {
      question: 'What is the need level rating?',
      answer: 'The need level is a scale from 1-10 that indicates the urgency of a student\'s financial need. Higher numbers (8-10) indicate critical need, helping sponsors prioritize their support.',
    },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      value: 'institutions@destinypal.org',
      description: 'Get help via email',
      color: 'blue',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      value: '+254 700 000 000',
      description: 'Call us during business hours',
      color: 'green',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      value: 'Available Mon-Fri',
      description: '9:00 AM - 5:00 PM EAT',
      color: 'amber',
    },
  ];

  const quickGuides = [
    {
      icon: Users,
      title: 'Student Registration',
      description: 'Step-by-step guide to register students',
      topics: [
        'Preparing student information',
        'Adding payment accounts',
        'Setting up fee structures',
        'Photo and document requirements',
      ],
    },
    {
      icon: BookOpen,
      title: 'Managing Students',
      description: 'Best practices for student management',
      topics: [
        'Viewing and filtering students',
        'Updating student information',
        'Tracking sponsorships',
        'Managing payment accounts',
      ],
    },
    {
      icon: AlertCircle,
      title: 'Common Issues',
      description: 'Solutions to frequent problems',
      topics: [
        'Login and access issues',
        'Student profile not appearing',
        'Payment account verification',
        'Data export and reports',
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
      green: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Help Center</h1>
        <p className="text-lg text-gray-600">Get support and find answers to common questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          const colors = getColorClasses(method.color);
          return (
            <div key={method.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className={`${colors.light} p-3 rounded-lg w-fit mb-4`}>
                <Icon className={`w-8 h-8 ${colors.text}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{method.title}</h3>
              <p className={`font-semibold ${colors.text} mb-2`}>{method.value}</p>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-2 rounded-lg">
            <HelpCircle className="w-6 h-6 text-orange-600" />
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
              <div className="px-4 pb-4 text-gray-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Quick Guides</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.title}
                className="border border-gray-200 rounded-lg p-6 hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
                  <Icon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
                <ul className="space-y-2">
                  {guide.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-md p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
        <p className="text-lg mb-6 opacity-90">
          Our support team is here to help you manage your institution and students effectively. Don't hesitate to reach out if you have any questions or concerns.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href={`mailto:institutions@destinypal.org?subject=Support Request from ${institutionEmail}`}
            className="bg-white text-orange-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Email Support
          </a>
          <button className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-6 rounded-lg transition-colors">
            Schedule a Call
          </button>
        </div>
      </div>
    </div>
  );
}
