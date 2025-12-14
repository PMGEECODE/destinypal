import { X, Heart, Check } from "lucide-react";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              <h2 className="text-2xl font-bold">Donate to DestinyPal</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-slate-200">
            Your generous donation helps students across Africa access quality
            education.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {["50", "100", "200"].map((amount) => (
              <button
                key={amount}
                className="py-4 px-6 border-2 border-slate-300 rounded-xl font-semibold text-slate-700 hover:border-slate-700 hover:bg-slate-50 transition-all"
              >
                ${amount}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount in USD"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:outline-none transition-colors"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>100% Transparent:</strong> Every dollar goes directly
                toward student tuition, books, and fees.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>Tax Deductible:</strong> Donations may be tax-deductible
                (consult your tax advisor).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-5 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-800 text-yellow-400 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            <Heart className="w-5 h-5" />
            Donate Now
          </button>
        </div>
      </div>
    </div>
  );
}
