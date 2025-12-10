import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Filter, Calendar, Loader2, TrendingUp } from 'lucide-react';

interface AdminPaymentsProps {
  adminEmail: string;
}

export function AdminPayments({ adminEmail }: AdminPaymentsProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    completedAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data: transactionsData } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      const completed = (transactionsData || []).filter(t => t.status === 'completed');
      const pending = (transactionsData || []).filter(t => t.status === 'pending' || t.status === 'processing');
      const failed = (transactionsData || []).filter(t => t.status === 'failed');

      const totalAmount = (transactionsData || []).reduce((sum, t) => sum + t.amount, 0);
      const completedAmount = completed.reduce((sum, t) => sum + t.amount, 0);

      setTransactions(transactionsData || []);
      setStats({
        total: transactionsData?.length || 0,
        completed: completed.length,
        pending: pending.length,
        failed: failed.length,
        totalAmount,
        completedAmount,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return transaction.status === 'pending' || transaction.status === 'processing';
    return transaction.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-16 h-16 text-slate-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Transactions</h1>
        <p className="text-lg text-gray-600">Monitor all payment activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <p className="text-sm opacity-90">Total Transactions</p>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8" />
            <p className="text-sm opacity-90">Completed</p>
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
          <p className="text-xs opacity-75 mt-1">${stats.completedAmount.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8" />
            <p className="text-sm opacity-90">Pending</p>
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8" />
            <p className="text-sm opacity-90">Failed</p>
          </div>
          <p className="text-3xl font-bold">{stats.failed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Transactions</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-800">{transaction.reference_id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800 capitalize">{transaction.payment_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-800">
                        ${transaction.amount.toLocaleString()} {transaction.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold capitalize">{transaction.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(transaction.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {((stats.completed / stats.total) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <p className="text-sm text-gray-600">Avg Transaction</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ${(stats.totalAmount / stats.total || 0).toFixed(0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-violet-600" />
              <p className="text-sm text-gray-600">Total Processed</p>
            </div>
            <p className="text-3xl font-bold text-violet-600">
              ${stats.completedAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
