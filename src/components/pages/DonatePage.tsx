import { useState } from "react";
import {
  Heart,
  Check,
  ArrowRight,
  Users,
  GraduationCap,
  Shield,
  Globe,
} from "lucide-react";

// Reuse the same DonateModal from previous implementation
import { DonateModal } from "./DonateModal"; // Adjust path as needed

export function DonatePage() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-yellow-400/30">
              <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-300 font-semibold">
                Your Support Changes Lives
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Make a Donation Today
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed">
              Every contribution directly supports talented students across
              Africa by covering tuition, books, and essential educational
              resources. Your generosity helps break the cycle of poverty
              through education.
            </p>

            <button
              onClick={() => setDonateModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-yellow-400/50 transition-all hover:-translate-y-1 inline-flex items-center gap-3"
            >
              <Heart className="w-6 h-6 fill-slate-900" />
              Donate Today
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Your Impact
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                See how far your donation goes in transforming students' lives
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-2xl mb-4 shadow-lg">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-5xl font-bold text-slate-800 mb-2">$50</h3>
                <p className="text-gray-600">
                  Provides textbooks and supplies for one semester
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-2xl mb-4 shadow-lg">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <h3 className="text-5xl font-bold text-slate-800 mb-2">$200</h3>
                <p className="text-gray-600">
                  Covers full tuition for one semester
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-2xl mb-4 shadow-lg">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="text-5xl font-bold text-slate-800 mb-2">$800</h3>
                <p className="text-gray-600">
                  Supports a student for an entire academic year
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency & Trust */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                100% Transparent & Secure
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                <Shield className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Fully Transparent
                </h3>
                <p className="text-gray-600">
                  Every donation is tracked and reported. You can see exactly
                  how your contribution is used to support students.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                <Check className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Secure Payments
                </h3>
                <p className="text-gray-600">
                  All transactions are encrypted and processed through trusted
                  payment gateways. Your information is always safe.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => setDonateModalOpen(true)}
                className="bg-slate-700 hover:bg-slate-800 text-yellow-400 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/30 transition-all hover:-translate-y-1 inline-flex items-center gap-3"
              >
                <Heart className="w-6 h-6" />
                Donate Securely Today
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Donation Modal */}
      <DonateModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
      />
    </>
  );
}
