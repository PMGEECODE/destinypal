"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils/utils"

interface FAQItem {
  question: string
  answer: string
}

const leftColumnFAQs: FAQItem[] = [
  {
    question: "What is DestinyMee Foundation?",
    answer:
      "DestinyMee Foundation is a non-profit organization dedicated to empowering underprivileged children through quality education, mentorship, and holistic support. We connect sponsors with students to create lasting impact in their lives.",
  },
  {
    question: "How and When did it start?",
    answer:
      "DestinyMee Foundation was established with a vision to bridge the educational gap for underprivileged children. Our journey began with a small group of dedicated volunteers who believed every child deserves access to quality education.",
  },
  {
    question: "Are You Registered Officially?",
    answer:
      "Yes, DestinyMee Foundation is a legally registered non-profit organization. We maintain full transparency in our operations and comply with all regulatory requirements.",
  },
  {
    question: "Who is the Founder?",
    answer:
      "DestinyMee Foundation was founded by a team of passionate educators and philanthropists who shared a common vision of transforming lives through education.",
  },
  {
    question: "How can my Company or I support DestinyMee?",
    answer:
      "You can support us by sponsoring a child, making general donations, volunteering your time and skills, or partnering with us for corporate social responsibility initiatives. Every contribution makes a difference.",
  },
  {
    question: "What are the expansion plans for DestinyMee?",
    answer:
      "We aim to expand our reach to more communities, increase the number of students we support, and introduce new programs focused on skill development, mental health, and career guidance.",
  },
]

const rightColumnFAQs: FAQItem[] = [
  {
    question: "What are the main objectives of DestinyMee?",
    answer:
      "Our main objectives include providing quality education to underprivileged children, offering nutritional support, facilitating mentorship programs, and creating pathways for higher education and career opportunities.",
  },
  {
    question: "How does the sponsorship process work?",
    answer:
      "Sponsors can browse student profiles, select a child to support, and make monthly or annual contributions. You'll receive regular updates about your sponsored child's progress, including academic reports and personal stories.",
  },
  {
    question: "What curriculum does DestinyMee follow?",
    answer:
      "We follow the national curriculum while supplementing it with additional programs in English, computer literacy, life skills, and extracurricular activities to ensure holistic development.",
  },
  {
    question: "How do you manage the accounts?",
    answer:
      "We maintain complete financial transparency. Our accounts are audited annually by certified auditors, and detailed financial reports are available to donors and stakeholders upon request.",
  },
  {
    question: "How can I make a donation?",
    answer:
      "You can donate through our secure online payment system, bank transfer, or mobile payment options. We accept one-time donations as well as recurring monthly contributions.",
  },
  {
    question: "How can I get involved as a volunteer?",
    answer:
      "We welcome volunteers for teaching, mentoring, administrative support, and event organization. You can apply through our website or contact us directly to discuss how you can contribute.",
  },
  {
    question: "What is DestinyMee's plan for marginalized communities?",
    answer:
      "DestinyMee understands that to give individuals from underserved communities the chance of a better tomorrow, we need to empower their future generations. Through our efforts, we provide children from marginalized communities with educational opportunities, nutritious meals, skill development training, and access to scholarships.",
  },
]

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "border border-border rounded-lg overflow-hidden transition-all duration-200",
        isOpen ? "bg-orange-50 border-orange-200" : "bg-card hover:border-orange-200",
      )}
    >
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between text-left">
        <span className={cn("font-medium text-sm md:text-base pr-4", isOpen ? "text-orange-700" : "text-foreground")}>
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform duration-200",
            isOpen ? "rotate-180 text-orange-600" : "text-muted-foreground",
          )}
        />
      </button>
      <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-96" : "max-h-0")}>
        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (question: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(question)) {
        newSet.delete(question)
      } else {
        newSet.add(question)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-orange-100 text-sm md:text-base mb-3">
            Empower Minds, Inspire Change: Join us in Shaping a Brighter Future
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Frequently Asked Questions</h1>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
            {/* Left Column */}
            <div className="space-y-3">
              {leftColumnFAQs.map((item) => (
                <FAQAccordionItem
                  key={item.question}
                  item={item}
                  isOpen={openItems.has(item.question)}
                  onToggle={() => toggleItem(item.question)}
                />
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {rightColumnFAQs.map((item) => (
                <FAQAccordionItem
                  key={item.question}
                  item={item}
                  isOpen={openItems.has(item.question)}
                  onToggle={() => toggleItem(item.question)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Please reach out to our friendly team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  )
}
