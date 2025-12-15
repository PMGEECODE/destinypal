"use client";

import type React from "react";

import {
  X,
  Heart,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Wallet,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PaymentService } from "../../services/paymentService";
import {
  detectCardType,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  formatCardNumber,
  validatePhoneNumber,
  formatPhoneNumber,
} from "../../utils/cardValidation";
import type { StudentWithPaymentAccounts } from "../../types";

interface SponsorshipPaymentModalProps {
  student: StudentWithPaymentAccounts;
  sponsorInfo: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  commitmentType: "full" | "partial";
  commitmentAmount: number;
  onClose: () => void;
  onComplete: (transactionId: string, paymentAmount: number) => Promise<void>;
}

type PaymentMethod =
  | "mpesa"
  | "airtel_money"
  | "card"
  | "bank_transfer"
  | "paypal";
type PaymentStep = "payment" | "processing" | "completed" | "failed";

export function SponsorshipPaymentModal({
  student,
  sponsorInfo,
  commitmentType,
  commitmentAmount,
  onClose,
  onComplete,
}: SponsorshipPaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("payment");
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [paymentAmount, setPaymentAmount] = useState<string>(
    commitmentAmount.toString()
  );

  const [mobileMoneyData, setMobileMoneyData] = useState({
    phone_number: sponsorInfo.phone || "",
  });

  const [cardData, setCardData] = useState({
    card_number: "",
    card_holder_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  const [cardInfo, setCardInfo] = useState({
    type: "unknown",
    brand: "Unknown",
    icon: "💳",
  });

  const [bankTransferDetails, setBankTransferDetails] = useState<{
    bank_name: string;
    account_name: string;
    account_number: string;
    swift_code: string;
    reference: string;
  } | null>(null);

  const [paypalData, setPaypalData] = useState({
    approval_url: "",
    order_id: "",
  });

  const feeBalance = student.fee_balance?.balance_due || 0;

  useEffect(() => {
    if (cardData.card_number) {
      setCardInfo(detectCardType(cardData.card_number));
    }
  }, [cardData.card_number]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === "processing" && transactionId) {
      interval = setInterval(async () => {
        try {
          const transaction = await PaymentService.checkPaymentStatus(
            transactionId
          );

          if (transaction.status === "completed") {
            setStep("completed");
            clearInterval(interval);
          } else if (
            transaction.status === "failed" ||
            transaction.status === "cancelled"
          ) {
            setErrorMessage(
              transaction.failure_reason || "Payment failed. Please try again."
            );
            setStep("failed");
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, transactionId]);

  const handleMobileMoneyPayment = async () => {
    if (!validatePhoneNumber(mobileMoneyData.phone_number)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const amount = Number.parseFloat(paymentAmount);

      const transaction = await PaymentService.initiateTransaction({
        payment_type: "sponsorship",
        amount,
        currency: "USD",
        payment_method: paymentMethod as "mpesa" | "airtel_money",
        phone_number: formatPhoneNumber(mobileMoneyData.phone_number),
        metadata: {
          sponsor_name: sponsorInfo.full_name,
          sponsor_email: sponsorInfo.email,
          student_id: student.id,
          student_name: student.full_name,
          commitment_type: commitmentType,
          commitment_amount: commitmentAmount,
        },
      });

      setTransactionId(transaction.id!);
      setStep("processing");

      if (paymentMethod === "mpesa") {
        await PaymentService.processMpesaPayment(transaction.id!, {
          phone_number: formatPhoneNumber(mobileMoneyData.phone_number),
          amount,
          account_reference: transaction.reference_id,
          transaction_desc: `Sponsorship for ${student.full_name} by ${sponsorInfo.full_name}`,
        });
      } else {
        await PaymentService.processAirtelMoneyPayment(transaction.id!, {
          phone_number: formatPhoneNumber(mobileMoneyData.phone_number),
          amount,
          account_reference: transaction.reference_id,
          transaction_desc: `Sponsorship for ${student.full_name} by ${sponsorInfo.full_name}`,
        });
      }
    } catch (error) {
      console.error("Error processing mobile money payment:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const amount = Number.parseFloat(paymentAmount);

      const transaction = await PaymentService.initiateTransaction({
        payment_type: "sponsorship",
        amount,
        currency: "USD",
        payment_method: "bank_transfer",
        metadata: {
          sponsor_name: sponsorInfo.full_name,
          sponsor_email: sponsorInfo.email,
          student_id: student.id,
          student_name: student.full_name,
          commitment_type: commitmentType,
          commitment_amount: commitmentAmount,
        },
      });

      setTransactionId(transaction.id!);

      const result = await PaymentService.initiateBankTransfer(
        transaction.id!,
        {
          amount,
          currency: "USD",
          donor_name: sponsorInfo.full_name,
          donor_email: sponsorInfo.email,
        }
      );

      setBankTransferDetails(result.bank_details);
      setStep("processing");
    } catch (error) {
      console.error("Error initiating bank transfer:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Bank transfer initiation failed."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const amount = Number.parseFloat(paymentAmount);

      const transaction = await PaymentService.initiateTransaction({
        payment_type: "sponsorship",
        amount,
        currency: "USD",
        payment_method: "paypal",
        metadata: {
          sponsor_name: sponsorInfo.full_name,
          sponsor_email: sponsorInfo.email,
          student_id: student.id,
          student_name: student.full_name,
          commitment_type: commitmentType,
          commitment_amount: commitmentAmount,
        },
      });

      setTransactionId(transaction.id!);

      const result = await PaymentService.processPayPalPayment(
        transaction.id!,
        {
          amount,
          currency: "USD",
          return_url: `${window.location.origin}/sponsor/sponsorships?payment=success`,
          cancel_url: `${window.location.origin}/sponsor/sponsorships?payment=cancelled`,
          description: `Sponsorship for ${student.full_name}`,
        }
      );

      if (result.approval_url) {
        setPaypalData({
          approval_url: result.approval_url,
          order_id: result.paypal_order_id || "",
        });
        // Redirect to PayPal
        window.location.href = result.approval_url;
      }
    } catch (error) {
      console.error("Error processing PayPal payment:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "PayPal payment failed."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!validateCardNumber(cardData.card_number)) {
      setErrorMessage("Please enter a valid card number");
      return;
    }

    if (!validateCVV(cardData.cvv, cardInfo.type)) {
      setErrorMessage("Please enter a valid CVV");
      return;
    }

    if (!validateExpiryDate(cardData.expiry_month, cardData.expiry_year)) {
      setErrorMessage("Card has expired or invalid expiry date");
      return;
    }

    if (!cardData.card_holder_name) {
      setErrorMessage("Please enter cardholder name");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const amount = Number.parseFloat(paymentAmount);

      // In production, tokenize card first using payment gateway SDK
      // For now, we'll generate a mock token
      const paymentToken = `tok_${cardData.card_number
        .replace(/\s/g, "")
        .slice(-4)}_${Date.now()}`;

      const transaction = await PaymentService.initiateTransaction({
        payment_type: "sponsorship",
        amount,
        currency: "USD",
        payment_method: "card",
        metadata: {
          sponsor_name: sponsorInfo.full_name,
          sponsor_email: sponsorInfo.email,
          student_id: student.id,
          student_name: student.full_name,
          commitment_type: commitmentType,
          commitment_amount: commitmentAmount,
          card_last4: cardData.card_number.slice(-4),
          card_brand: cardInfo.brand,
        },
      });

      setTransactionId(transaction.id!);
      setStep("processing");

      const result = await PaymentService.processCardPayment(transaction.id!, {
        payment_token: paymentToken,
        amount,
        billing_name: cardData.card_holder_name,
        billing_email: sponsorInfo.email,
      });

      if (result.success) {
        setStep("completed");
      } else {
        setErrorMessage(result.message);
        setStep("failed");
      }
    } catch (error) {
      console.error("Error processing card payment:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "card") {
      await handleCardPayment();
    } else if (paymentMethod === "bank_transfer") {
      await handleBankTransfer();
    } else if (paymentMethod === "paypal") {
      await handlePayPalPayment();
    } else {
      await handleMobileMoneyPayment();
    }
  };

  const handleComplete = async () => {
    if (!transactionId) return;

    try {
      await onComplete(transactionId, Number.parseFloat(paymentAmount));
      onClose();
    } catch (error) {
      console.error("Error completing sponsorship:", error);
      setErrorMessage(
        "Payment completed but failed to save sponsorship. Please contact support."
      );
    }
  };

  if (step === "processing") {
    if (paymentMethod === "bank_transfer" && bankTransferDetails) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Bank Transfer Details
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Please transfer ${paymentAmount} to the account below
            </p>

            <div className="bg-blue-50 rounded-lg p-4 space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-600">Bank Name</p>
                <p className="font-semibold text-gray-800">
                  {bankTransferDetails.bank_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Account Name</p>
                <p className="font-semibold text-gray-800">
                  {bankTransferDetails.account_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Account Number</p>
                <p className="font-semibold text-gray-800">
                  {bankTransferDetails.account_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">SWIFT Code</p>
                <p className="font-semibold text-gray-800">
                  {bankTransferDetails.swift_code}
                </p>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <p className="text-xs text-gray-600">Reference (IMPORTANT)</p>
                <p className="font-bold text-blue-600 text-lg">
                  {bankTransferDetails.reference}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please include this reference in your transfer
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Your sponsorship will be activated within 1-3 business days
                after we confirm your transfer.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              I've Noted the Details
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Processing Payment
          </h2>
          <p className="text-gray-600 mb-4">
            {paymentMethod === "card"
              ? "Please wait while we process your card payment..."
              : "Please check your phone and enter your PIN to complete the payment."}
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Student:</strong> {student.full_name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> ${paymentAmount}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Reference:</strong> {transactionId?.slice(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "completed") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for sponsoring {student.full_name}! Your payment of $
            {paymentAmount} has been processed successfully.
          </p>
          <button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || "Something went wrong. Please try again."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setStep("payment");
                setErrorMessage("");
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Sponsor {student.full_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-semibold text-gray-800">
                  {student.full_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fees Due:</span>
                <span className="font-semibold text-gray-800">
                  ${feeBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commitment Type:</span>
                <span className="font-semibold text-gray-800">
                  {commitmentType === "full" ? "Full" : "Partial"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commitment Amount:</span>
                <span className="font-semibold text-blue-600">
                  ${commitmentAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Amount *
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentType === "full"}
                  onChange={(e) => {
                    setPaymentType("full");
                    setPaymentAmount(feeBalance.toString());
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-gray-800">
                    Pay Full Amount
                  </div>
                  <div className="text-sm text-gray-600">
                    Pay ${feeBalance.toLocaleString()} now
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="paymentType"
                  value="partial"
                  checked={paymentType === "partial"}
                  onChange={(e) => setPaymentType("partial")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    Make Partial Payment
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Pay a portion now
                  </div>
                  {paymentType === "partial" && (
                    <input
                      type="number"
                      required
                      min="1"
                      max={feeBalance}
                      placeholder="Enter payment amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "mpesa"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="mpesa"
                  checked={paymentMethod === "mpesa"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="sr-only"
                />
                <Smartphone className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  M-Pesa
                </span>
              </label>

              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "airtel_money"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="airtel_money"
                  checked={paymentMethod === "airtel_money"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="sr-only"
                />
                <Smartphone className="w-8 h-8 text-red-600" />
                <span className="text-sm font-medium text-gray-700">
                  Airtel Money
                </span>
              </label>

              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="sr-only"
                />
                <CreditCard className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Card</span>
              </label>

              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "bank_transfer"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="sr-only"
                />
                <Building2 className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Bank Transfer
                </span>
              </label>

              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="sr-only"
                />
                <Wallet className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  PayPal
                </span>
              </label>
            </div>
          </div>

          {(paymentMethod === "mpesa" || paymentMethod === "airtel_money") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g., 0712345678 or +254712345678"
                value={mobileMoneyData.phone_number}
                onChange={(e) =>
                  setMobileMoneyData({
                    ...mobileMoneyData,
                    phone_number: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your{" "}
                {paymentMethod === "mpesa" ? "M-Pesa" : "Airtel Money"} number
              </p>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={cardData.card_number}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        card_number: formatCardNumber(e.target.value),
                      })
                    }
                    maxLength={19}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {cardInfo.type !== "unknown" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-xs font-medium text-gray-600">
                        {cardInfo.brand}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={cardData.card_holder_name}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      card_holder_name: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM"
                    maxLength={2}
                    value={cardData.expiry_month}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        expiry_month: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YY"
                    maxLength={2}
                    value={cardData.expiry_year}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        expiry_year: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    maxLength={cardInfo.type === "amex" ? 4 : 3}
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !paymentMethod || !paymentAmount}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${paymentAmount}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
