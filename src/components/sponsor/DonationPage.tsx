import type React from "react"

import { useState } from "react"
import { Heart, Users, GraduationCap, Globe, TrendingUp, Shield, ChevronRight } from "lucide-react"
import { DonationModal } from "./DonationModal"
import { api } from "../../lib/api"

interface ImpactStat {
  icon: React.ReactNode
  value: string
  label: string
}

const IMPACT_STATS: ImpactStat[] = [
  {
    icon: <Users className="w-6 h-6" />,
    value: "2,500+",
    label: "Students Supported",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    value: "85%",
    label: "Graduation Rate",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    value: "15+",
    label: "Partner Institutions",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    value: "$1.2M",
    label: "Total Donations",
  },
]

const DONATION_USES = [
  {
    title: "Tuition & Fees",
    description: "Cover school fees, exam costs, and registration expenses for students.",
    percentage: 45,
  },
  {
    title: "Learning Materials",
    description: "Provide textbooks, stationery, and digital learning resources.",
    percentage: 25,
  },
  {
    title: "Student Welfare",
    description: "Support meals, transport, and essential living expenses.",
    percentage: 20,
  },
  {
    title: "Program Operations",
    description: "Maintain platform infrastructure and support services.",
    percentage: 10,
  },
]

const TESTIMONIALS = [
  {
    quote:
      "Thanks to DestinyPal donors, I was able to complete my nursing degree. I now work at a local hospital and support my family.",
    name: "Sarah M.",
    role: "Nursing Graduate, Class of 2023",
  },
  {
    quote: "The scholarship I received changed my life. I am now pursuing my dream of becoming an engineer.",
    name: "David O.",
    role: "Engineering Student",
  },
]

export function DonationPage() {
  const [showDonationModal, setShowDonationModal] = useState(false)

  const handleDonationSubmit = async (data: {
    donor_name: string
    donor_email: string
    amount: number
    payment_method: string
    message: string | null
    transaction_id?: string
  }) => {
    try {
      await api.createDonation({
        donor_name: data.donor_name,
        donor_email: data.donor_email,
        amount: data.amount,
        message: data.message || undefined,
      })
      setShowDonationModal(false)
    } catch (error) {
      console.error("Error creating donation:", error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

          <div className="relative z-10 p-8 md:p-16 lg:p-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20 shadow-lg">
                <Heart className="w-4 h-4 fill-current" />
                <span>Support Our Mission</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Help Us Change Lives Through Education
              </h1>

              <p className="text-xl md:text-2xl text-blue-50 mb-8 leading-relaxed font-light">
                Your donation to DestinyPal directly supports students in need, providing them with the resources and
                opportunities they deserve. Every contribution makes a meaningful difference.
              </p>

              <button
                onClick={() => setShowDonationModal(true)}
                className="group inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
              >
                Donate Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute right-20 bottom-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-y-1/3" />
        </section>

        {/* Impact Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {IMPACT_STATS.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                {stat.icon}
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm md:text-base text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Why Donate Section */}
        <section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Why Donate to DestinyPal?</h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
            </div>

            <div className="space-y-5">
              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">100% Transparent</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Track exactly where your donation goes. We provide detailed reports on fund allocation and student
                    progress.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Impact</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Your funds go directly to students in need, covering tuition, materials, and essential expenses.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Long-term Change</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Education breaks the cycle of poverty. You are investing in future leaders and changemakers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How Funds Are Used */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">How Your Donation Is Used</h2>
              <div className="w-16 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
            </div>

            <div className="space-y-7">
              {DONATION_USES.map((use, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-lg">{use.title}</h3>
                    <span className="text-lg font-bold text-blue-600 min-w-[3rem] text-right">{use.percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                      style={{ width: `${use.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{use.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Stories of Impact</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 md:p-10 relative shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-200"
              >
                <div className="absolute top-6 right-6 text-7xl text-blue-100 font-serif leading-none select-none">&ldquo;</div>

                <div className="relative z-10">
                  <p className="text-slate-700 text-lg leading-relaxed mb-6 italic">
                    {testimonial.quote}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl mx-auto mb-6 shadow-xl">
              <Heart className="w-8 h-8 fill-current" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>

            <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Join our community of sponsors and donors who are transforming lives through education. Your generosity
              creates opportunities that last a lifetime.
            </p>

            <button
              onClick={() => setShowDonationModal(true)}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
            >
              <Heart className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              Donate Now
            </button>
          </div>

          <div className="absolute left-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </section>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} onSubmit={handleDonationSubmit} />
      )}
    </div>
  )
}
