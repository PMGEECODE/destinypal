"use client";

import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import type { StudentWithPaymentAccounts } from "../../types";
import { PaymentService } from "../../services/paymentService";

interface SponsorshipModalProps {
  student: StudentWithPaymentAccounts;
  onClose: () => void;
  onComplete: () => void;
}

type PaymentMethod =
  | "mpesa"
  | "airtel_money"
  | "card"
  | "bank_transfer"
  | "paypal";
type ModalStep =
  | "info"
  | "commitment"
  | "payment-method"
  | "payment-details"
  | "processing"
  | "completed"
  | "failed";

const PAYMENT_METHODS = [
  { id: "mobile_money", name: "Mobile Money", icon: Smartphone },
  { id: "card", name: "Credit Card", icon: CreditCard },
  { id: "bank_transfer", name: "Bank Transfer", icon: Building2 },
  { id: "paypal", name: "PayPal", icon: Wallet },
];

const safeNumber = (value: unknown, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

const safeString = (value: unknown, defaultValue = ""): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "string") return value;
  if (typeof value === "object") return defaultValue;
  return String(value);
};

export function SponsorshipModal({
  student,
  onClose,
  onComplete,
}: SponsorshipModalProps) {
  const [step, setStep] = useState<ModalStep>("info");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    commitmentType: "full" as "full" | "partial",
    customAmount: "",
    paymentType: "full" as "full" | "partial",
    paymentAmount: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [mobileProvider, setMobileProvider] = useState<
    "mpesa" | "airtel_money" | ""
  >("");

  const [mobileMoneyData, setMobileMoneyData] = useState({
    phone_number: "",
  });

  const [cardData, setCardData] = useState({
    card_number: "",
    card_holder_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  const [bankTransferDetails, setBankTransferDetails] = useState<{
    bank_name: string;
    account_name: string;
    account_number: string;
    swift_code: string;
    reference: string;
  } | null>(null);

  const feeBalance = safeNumber(student.fee_balance?.balance_due);
  const studentName = safeString(student.full_name, "this student");

  const getCommitmentAmount = () => {
    return formData.commitmentType === "full"
      ? feeBalance
      : Number.parseFloat(formData.customAmount) || 0;
  };

  const getPaymentAmount = () => {
    return formData.paymentType === "full"
      ? getCommitmentAmount()
      : Number.parseFloat(formData.paymentAmount) || 0;
  };

  const handleMobileMoneyPayment = async () => {
    try {
      setLoading(true);
      setStep("processing");

      if (!mobileProvider) {
        throw new Error("Please select a mobile money provider");
      }

      const paymentAmount = getPaymentAmount();

      const response = await PaymentService.initiateTransaction({
        student_id: student.id,
        amount: paymentAmount,
        currency: "USD",
        payment_method: mobileProvider,
        payment_type: "sponsorship",
        phone_number: mobileMoneyData.phone_number,
        metadata: {
          sponsor_name: formData.fullName,
          sponsor_email: formData.email,
          sponsor_phone: formData.phone,
          commitment_type: formData.commitmentType,
          commitment_amount: getCommitmentAmount(),
          payment_type: formData.paymentType,
        },
      });

      setTransactionId(response.transaction.reference_id);
      setStep("completed");
    } catch (error: any) {
      console.error("Mobile money payment error:", error);
      setErrorMessage(
        error.message || "Mobile money payment failed. Please try again."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    try {
      setLoading(true);
      setStep("processing");

      const paymentAmount = getPaymentAmount();

      const response = await PaymentService.initiateTransaction({
        student_id: student.id,
        amount: paymentAmount,
        currency: "USD",
        payment_method: "card",
        payment_type: "sponsorship",
        card_token: btoa(JSON.stringify(cardData)),
        metadata: {
          sponsor_name: formData.fullName,
          sponsor_email: formData.email,
          sponsor_phone: formData.phone,
          commitment_type: formData.commitmentType,
          commitment_amount: getCommitmentAmount(),
          payment_type: formData.paymentType,
        },
      });

      setTransactionId(response.transaction.reference_id);
      setStep("completed");
    } catch (error: any) {
      console.error("Card payment error:", error);
      setErrorMessage(
        error.message || "Card payment failed. Please try again."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    try {
      setLoading(true);
      setStep("processing");

      const paymentAmount = getPaymentAmount();

      const response = await PaymentService.initiateTransaction({
        student_id: student.id,
        amount: paymentAmount,
        currency: "USD",
        payment_method: "bank_transfer",
        payment_type: "sponsorship",
        metadata: {
          sponsor_name: formData.fullName,
          sponsor_email: formData.email,
          sponsor_phone: formData.phone,
          commitment_type: formData.commitmentType,
          commitment_amount: getCommitmentAmount(),
          payment_type: formData.paymentType,
        },
      });

      setBankTransferDetails({
        bank_name: "Destiny Bank",
        account_name: "Destiny Foundation",
        account_number: "1234567890",
        swift_code: "DESTKE22",
        reference: response.transaction.reference_id,
      });

      setTransactionId(response.transaction.reference_id);
    } catch (error: any) {
      console.error("Bank transfer error:", error);
      setErrorMessage(
        error.message ||
          "Failed to generate bank transfer details. Please try again."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      setLoading(true);
      setStep("processing");

      const paymentAmount = getPaymentAmount();

      const response = await PaymentService.initiateTransaction({
        student_id: student.id,
        amount: paymentAmount,
        currency: "USD",
        payment_method: "paypal",
        payment_type: "sponsorship",
        metadata: {
          sponsor_name: formData.fullName,
          sponsor_email: formData.email,
          sponsor_phone: formData.phone,
          commitment_type: formData.commitmentType,
          commitment_amount: getCommitmentAmount(),
          payment_type: formData.paymentType,
        },
      });

      setTransactionId(response.transaction.reference_id);

      if (response.transaction.payment_url) {
        window.open(response.transaction.payment_url, "_blank");
      }

      setStep("completed");
    } catch (error: any) {
      console.error("PayPal payment error:", error);
      setErrorMessage(
        error.message || "PayPal payment failed. Please try again."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) return;

    if (paymentMethod === "card") {
      await handleCardPayment();
    } else if (paymentMethod === "bank_transfer") {
      await handleBankTransfer();
    } else if (paymentMethod === "paypal") {
      await handlePayPalPayment();
    } else if (paymentMethod === "mobile_money") {
      await handleMobileMoneyPayment();
    }
  };

  const handleCompleteSponsorship = async () => {
    try {
      // Close modal and trigger refresh
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error completing sponsorship:", error);
    }
  };

  if (step === "processing" && bankTransferDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              Bank Transfer Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">
                Transfer ${getPaymentAmount()} to:
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Bank Name</div>
                  <div className="font-medium text-gray-800">
                    {bankTransferDetails.bank_name}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Account Name</div>
                  <div className="font-medium text-gray-800">
                    {bankTransferDetails.account_name}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Account Number</div>
                  <div className="font-medium text-gray-800">
                    {bankTransferDetails.account_number}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">SWIFT Code</div>
                  <div className="font-medium text-gray-800">
                    {bankTransferDetails.swift_code}
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-200">
                  <div className="text-sm text-gray-600">
                    Reference (Important!)
                  </div>
                  <div className="font-bold text-blue-600 text-lg">
                    {bankTransferDetails.reference}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Please include this reference in your transfer
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                After completing the bank transfer, your sponsorship will be
                verified within 1-2 business days. You will receive an email
                confirmation once verified.
              </p>
            </div>

            <button
              onClick={handleCompleteSponsorship}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              I've Made the Transfer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "completed") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Thank you for sponsoring {studentName}! Your payment of $
            {getPaymentAmount()} has been processed successfully.
          </p>
          {transactionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">Transaction ID</div>
              <div className="font-mono text-sm text-gray-800 break-all">
                {transactionId}
              </div>
            </div>
          )}
          <button
            onClick={handleCompleteSponsorship}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("payment-details")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Processing Payment
          </h2>
          <p className="text-gray-600 text-center">
            Please wait while we process your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Sponsor {studentName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-8">
            {["info", "commitment", "payment-method", "payment-details"].map(
              (s, index) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      step === s ||
                      [
                        "commitment",
                        "payment-method",
                        "payment-details",
                      ].indexOf(step) >
                        [
                          "commitment",
                          "payment-method",
                          "payment-details",
                        ].indexOf(s)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        [
                          "commitment",
                          "payment-method",
                          "payment-details",
                        ].indexOf(step) > index
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Total Fees Outstanding:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${feeBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {step === "info" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Step 1: Your Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+254..."
                />
              </div>

              <button
                type="button"
                onClick={() => setStep("commitment")}
                disabled={!formData.fullName || !formData.email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === "commitment" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Step 2: Sponsorship Commitment
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="commitmentType"
                    value="full"
                    checked={formData.commitmentType === "full"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commitmentType: e.target.value as "full",
                      })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Full Sponsorship
                    </div>
                    <div className="text-sm text-gray-600">
                      Commit to covering all fees ($
                      {feeBalance.toLocaleString()})
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="commitmentType"
                    value="partial"
                    checked={formData.commitmentType === "partial"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commitmentType: e.target.value as "partial",
                      })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      Partial Sponsorship
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Contribute what you can
                    </div>
                    {formData.commitmentType === "partial" && (
                      <input
                        type="number"
                        required
                        min="1"
                        max={feeBalance}
                        placeholder="Enter amount"
                        value={formData.customAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customAmount: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("payment-method")}
                  disabled={
                    formData.commitmentType === "partial" &&
                    !formData.customAmount
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "payment-method" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Step 3: Select Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const methodId =
                    method.id === "mobile_money"
                      ? "mobile_money"
                      : (method.id as PaymentMethod);
                  return (
                    <label
                      key={method.id}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === methodId
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={methodId}
                        checked={paymentMethod === methodId}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as PaymentMethod)
                        }
                        className="sr-only"
                      />
                      <Icon className="w-8 h-8 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {method.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("commitment")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("payment-details")}
                  disabled={!paymentMethod}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "payment-details" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Step 4: Payment Details
              </h3>

              {/* Payment amount selection */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={formData.paymentType === "full"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentType: e.target.value as "full",
                      })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Pay Full Amount
                    </div>
                    <div className="text-sm text-gray-600">
                      Pay ${getCommitmentAmount().toLocaleString()} now
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentType"
                    value="partial"
                    checked={formData.paymentType === "partial"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentType: e.target.value as "partial",
                      })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      Make Partial Payment
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Pay a portion now
                    </div>
                    {formData.paymentType === "partial" && (
                      <input
                        type="number"
                        required
                        min="1"
                        max={getCommitmentAmount()}
                        placeholder="Enter payment amount"
                        value={formData.paymentAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentAmount: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>

              {/* Mobile Money Details */}
              {paymentMethod === "mobile_money" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Provider *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          mobileProvider === "mpesa"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobileProvider"
                          value="mpesa"
                          checked={mobileProvider === "mpesa"}
                          onChange={(e) =>
                            setMobileProvider(e.target.value as "mpesa")
                          }
                          className="sr-only"
                        />
                        <div className="text-2xl">📱</div>
                        <span className="font-medium">M-Pesa</span>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          mobileProvider === "airtel_money"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobileProvider"
                          value="airtel_money"
                          checked={mobileProvider === "airtel_money"}
                          onChange={(e) =>
                            setMobileProvider(e.target.value as "airtel_money")
                          }
                          className="sr-only"
                        />
                        <div className="text-2xl">📲</div>
                        <span className="font-medium">Airtel Money</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileMoneyData.phone_number}
                      onChange={(e) =>
                        setMobileMoneyData({
                          ...mobileMoneyData,
                          phone_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="254..."
                    />
                  </div>
                </div>
              )}

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardData.card_number}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          card_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardData.card_holder_name}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          card_holder_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="JOHN DOE"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.expiry_month}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            expiry_month: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.expiry_year}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            expiry_year: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="YY"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.cvv}
                        onChange={(e) =>
                          setCardData({ ...cardData, cvv: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === "bank_transfer" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    You will receive bank transfer details after clicking
                    "Complete Payment" below. Please use the provided reference
                    number when making your transfer.
                  </p>
                </div>
              )}

              {/* PayPal Info */}
              {paymentMethod === "paypal" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    You will be redirected to PayPal to complete your payment
                    securely.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Payment Amount:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${getPaymentAmount().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("payment-method")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={
                    loading ||
                    (formData.paymentType === "partial" &&
                      !formData.paymentAmount) ||
                    (paymentMethod === "mobile_money" &&
                      (!mobileProvider || !mobileMoneyData.phone_number)) ||
                    (paymentMethod === "card" &&
                      (!cardData.card_number ||
                        !cardData.card_holder_name ||
                        !cardData.expiry_month ||
                        !cardData.expiry_year ||
                        !cardData.cvv))
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
