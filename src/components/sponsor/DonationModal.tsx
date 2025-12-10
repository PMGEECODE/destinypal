import { X, Heart, CreditCard, Smartphone, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { detectCardType, validateCardNumber, validateCVV, validateExpiryDate, formatCardNumber, validatePhoneNumber, formatPhoneNumber } from '../../utils/cardValidation';

interface DonationModalProps {
  onClose: () => void;
  onSubmit: (data: {
    donor_name: string;
    donor_email: string;
    amount: number;
    payment_method: string;
    message: string | null;
    transaction_id?: string;
  }) => Promise<void>;
}

type PaymentMethod = 'mpesa' | 'airtel_money' | 'card';
type PaymentStep = 'details' | 'payment' | 'processing' | 'completed' | 'failed';

const SUGGESTED_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

export function DonationModal({ onClose, onSubmit }: DonationModalProps) {
  const [step, setStep] = useState<PaymentStep>('details');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    payment_method: '' as PaymentMethod | '',
    message: '',
  });

  const [mobileMoneyData, setMobileMoneyData] = useState({
    phone_number: '',
  });

  const [cardData, setCardData] = useState({
    card_number: '',
    card_holder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
  });

  const [cardInfo, setCardInfo] = useState({ type: 'unknown', brand: 'Unknown', icon: '💳' });

  useEffect(() => {
    if (cardData.card_number) {
      setCardInfo(detectCardType(cardData.card_number));
    }
  }, [cardData.card_number]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === 'processing' && transactionId) {
      interval = setInterval(async () => {
        try {
          const transaction = await PaymentService.checkPaymentStatus(transactionId);

          if (transaction.status === 'completed') {
            setStep('completed');
            clearInterval(interval);
          } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
            setErrorMessage(transaction.failure_reason || 'Payment failed. Please try again.');
            setStep('failed');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, transactionId]);

  const handleContinueToPayment = () => {
    if (!formData.donor_name || !formData.donor_email || !formData.amount || !formData.payment_method) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setErrorMessage('');
    setStep('payment');
  };

  const handleMobileMoneyPayment = async () => {
    if (!validatePhoneNumber(mobileMoneyData.phone_number)) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const referenceId = PaymentService.generateReferenceId('DON');

      const transaction = await PaymentService.initiateTransaction({
        reference_id: referenceId,
        payment_type: 'donation',
        amount: parseFloat(formData.amount),
        currency: 'USD',
        payment_method: formData.payment_method as 'mpesa' | 'airtel_money',
        phone_number: formatPhoneNumber(mobileMoneyData.phone_number),
        metadata: {
          donor_name: formData.donor_name,
          donor_email: formData.donor_email,
          message: formData.message,
        },
      });

      setTransactionId(transaction.id!);
      setStep('processing');

      if (formData.payment_method === 'mpesa') {
        await PaymentService.processMpesaPayment(transaction.id!, {
          phone_number: formatPhoneNumber(mobileMoneyData.phone_number),
          amount: parseFloat(formData.amount),
          account_reference: referenceId,
          transaction_desc: `Donation to DestinyPal by ${formData.donor_name}`,
        });
      } else {
        await PaymentService.processAirtelMoneyPayment(transaction.id!, {
          phone_number: formatPhoneNumber(mobileMoneyData.phone_number),
          amount: parseFloat(formData.amount),
          account_reference: referenceId,
          transaction_desc: `Donation to DestinyPal by ${formData.donor_name}`,
        });
      }
    } catch (error) {
      console.error('Error processing mobile money payment:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!validateCardNumber(cardData.card_number)) {
      setErrorMessage('Please enter a valid card number');
      return;
    }

    if (!validateCVV(cardData.cvv, cardInfo.type)) {
      setErrorMessage('Please enter a valid CVV');
      return;
    }

    if (!validateExpiryDate(cardData.expiry_month, cardData.expiry_year)) {
      setErrorMessage('Card has expired or invalid expiry date');
      return;
    }

    if (!cardData.card_holder_name) {
      setErrorMessage('Please enter cardholder name');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const referenceId = PaymentService.generateReferenceId('DON');

      const transaction = await PaymentService.initiateTransaction({
        reference_id: referenceId,
        payment_type: 'donation',
        amount: parseFloat(formData.amount),
        currency: 'USD',
        payment_method: 'card',
        card_last4: cardData.card_number.slice(-4),
        card_brand: cardInfo.brand,
        metadata: {
          donor_name: formData.donor_name,
          donor_email: formData.donor_email,
          message: formData.message,
        },
      });

      setTransactionId(transaction.id!);
      setStep('processing');

      const result = await PaymentService.processCardPayment(transaction.id!, {
        card_number: cardData.card_number.replace(/\s/g, ''),
        expiry_month: cardData.expiry_month,
        expiry_year: cardData.expiry_year,
        cvv: cardData.cvv,
        card_holder_name: cardData.card_holder_name,
        amount: parseFloat(formData.amount),
      });

      if (result.success) {
        setStep('completed');
      } else {
        setErrorMessage(result.message);
        setStep('failed');
      }
    } catch (error) {
      console.error('Error processing card payment:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.payment_method === 'card') {
      await handleCardPayment();
    } else {
      await handleMobileMoneyPayment();
    }
  };

  const handleComplete = async () => {
    try {
      await onSubmit({
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        message: formData.message || null,
        transaction_id: transactionId || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error saving donation:', error);
      setErrorMessage('Donation completed but failed to save. Please contact support.');
    }
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600 mb-4">
            {formData.payment_method === 'card'
              ? 'Please wait while we process your card payment...'
              : 'Please check your phone and enter your PIN to complete the payment.'}
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> ${formData.amount}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Reference:</strong> {transactionId?.slice(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your generous donation of ${formData.amount} to DestinyPal!
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

  if (step === 'failed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{errorMessage || 'Something went wrong. Please try again.'}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setStep('payment');
                setErrorMessage('');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 mb-0 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Donate to DestinyPal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {step === 'details' && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Support Our Mission
              </h3>
              <p className="text-gray-600 text-sm">
                Your donation helps us provide educational opportunities to students in need.
                Every contribution makes a difference in changing lives.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.donor_email}
                  onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Donation Amount *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {SUGGESTED_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                        formData.amount === amount.toString()
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Or enter custom amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.payment_method === 'mpesa'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="mpesa"
                      checked={formData.payment_method === 'mpesa'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                      className="sr-only"
                    />
                    <Smartphone className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">M-Pesa</span>
                  </label>

                  <label
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.payment_method === 'airtel_money'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="airtel_money"
                      checked={formData.payment_method === 'airtel_money'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                      className="sr-only"
                    />
                    <Smartphone className="w-8 h-8 text-red-600" />
                    <span className="text-sm font-medium text-gray-700">Airtel Money</span>
                  </label>

                  <label
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.payment_method === 'card'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={formData.payment_method === 'card'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                      className="sr-only"
                    />
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Share a message about why you're donating..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={!formData.payment_method || !formData.amount || !formData.donor_name || !formData.donor_email}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-1">
                <strong>Donation Amount:</strong> ${formData.amount}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Payment Method:</strong> {formData.payment_method === 'mpesa' ? 'M-Pesa' : formData.payment_method === 'airtel_money' ? 'Airtel Money' : 'Card'}
              </p>
            </div>

            {(formData.payment_method === 'mpesa' || formData.payment_method === 'airtel_money') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 0712345678 or +254712345678"
                  value={mobileMoneyData.phone_number}
                  onChange={(e) => setMobileMoneyData({ ...mobileMoneyData, phone_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your {formData.payment_method === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} number
                </p>
              </div>
            )}

            {formData.payment_method === 'card' && (
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
                      onChange={(e) => setCardData({ ...cardData, card_number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {cardInfo.type !== 'unknown' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="text-xs font-medium text-gray-600">{cardInfo.brand}</span>
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
                    onChange={(e) => setCardData({ ...cardData, card_holder_name: e.target.value.toUpperCase() })}
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
                      onChange={(e) => setCardData({ ...cardData, expiry_month: e.target.value.replace(/\D/g, '') })}
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
                      onChange={(e) => setCardData({ ...cardData, expiry_year: e.target.value.replace(/\D/g, '') })}
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
                      maxLength={cardInfo.type === 'amex' ? 4 : 3}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
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
                onClick={() => setStep('details')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${formData.amount}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
