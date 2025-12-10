import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { PaymentService } from '../../services/paymentService';
import type { PaymentTransaction } from '../../services/paymentService';

interface PaymentStatusTrackerProps {
  transactionId: string;
  onStatusChange?: (status: PaymentTransaction['status']) => void;
}

export function PaymentStatusTracker({ transactionId, onStatusChange }: PaymentStatusTrackerProps) {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransaction();
    const interval = setInterval(fetchTransaction, 5000);

    return () => clearInterval(interval);
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const data = await PaymentService.getTransactionById(transactionId);
      if (data) {
        setTransaction(data);
        onStatusChange?.(data.status);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch transaction status');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !transaction) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
        <span className="text-sm text-gray-700">Loading payment status...</span>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }

  if (!transaction) return null;

  const getStatusConfig = () => {
    switch (transaction.status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          iconColor: 'text-green-600',
          label: 'Payment Completed',
          description: 'Your payment has been successfully processed.',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          label: 'Payment Failed',
          description: transaction.failure_reason || 'Payment processing failed. Please try again.',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-600',
          label: 'Payment Cancelled',
          description: 'The payment was cancelled.',
        };
      case 'processing':
      case 'pending':
        return {
          icon: Clock,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          label: 'Payment Pending',
          description: 'Please complete the payment on your device.',
        };
      case 'initiated':
        return {
          icon: Loader2,
          color: 'blue',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-600',
          label: 'Payment Initiated',
          description: 'Payment request has been sent.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-600',
          label: 'Unknown Status',
          description: 'Payment status is unknown.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`p-4 ${config.bgColor} rounded-lg border border-${config.color}-200`}>
      <div className="flex items-start gap-3">
        <Icon
          className={`w-6 h-6 ${config.iconColor} flex-shrink-0 ${
            transaction.status === 'initiated' ? 'animate-spin' : ''
          }`}
        />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.textColor} mb-1`}>{config.label}</h4>
          <p className="text-sm text-gray-600 mb-3">{config.description}</p>

          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Reference:</span>
              <span className="font-mono">{transaction.reference_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">${transaction.amount.toLocaleString()} {transaction.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
            </div>
            {transaction.phone_number && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{transaction.phone_number}</span>
              </div>
            )}
            {transaction.card_brand && transaction.card_last4 && (
              <div className="flex justify-between">
                <span>Card:</span>
                <span>{transaction.card_brand} •••• {transaction.card_last4}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
