import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Heart, Calendar, BarChart3, Loader2 } from 'lucide-react';

interface AdminAnalyticsProps {
  adminEmail: string;
}

interface MonthlyData {
  month: string;
  students: number;
  sponsors: number;
  revenue: number;
  donations: number;
}

export function AdminAnalytics({ adminEmail }: AdminAnalyticsProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'6months' | '12months' | 'all'>('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [studentsData, sponsorsData, paymentsData, donationsData] = await Promise.all([
        supabase.from('students').select('created_at'),
        supabase.from('sponsors').select('created_at'),
        supabase.from('payments').select('amount, payment_date, payment_status'),
        supabase.from('organization_donations').select('amount, created_at'),
      ]);

      const monthsToShow = timeRange === '6months' ? 6 : timeRange === '12months' ? 12 : 24;
      const months: MonthlyData[] = [];

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        const students = (studentsData.data || []).filter(s => {
          const created = new Date(s.created_at);
          return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
        }).length;

        const sponsors = (sponsorsData.data || []).filter(s => {
          const created = new Date(s.created_at);
          return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
        }).length;

        const revenue = (paymentsData.data || [])
          .filter(p => {
            const paymentDate = new Date(p.payment_date);
            return p.payment_status === 'completed' &&
              paymentDate.getFullYear() === date.getFullYear() &&
              paymentDate.getMonth() === date.getMonth();
          })
          .reduce((sum, p) => sum + p.amount, 0);

        const donations = (donationsData.data || [])
          .filter(d => {
            const created = new Date(d.created_at);
            return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
          })
          .reduce((sum, d) => sum + d.amount, 0);

        months.push({
          month: monthName,
          students,
          sponsors,
          revenue,
          donations,
        });
      }

      setMonthlyData(months);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const maxStudents = Math.max(...monthlyData.map(m => m.students), 1);
  const maxSponsors = Math.max(...monthlyData.map(m => m.sponsors), 1);

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalDonations = monthlyData.reduce((sum, m) => sum + m.donations, 0);
  const totalStudents = monthlyData.reduce((sum, m) => sum + m.students, 0);
  const totalSponsors = monthlyData.reduce((sum, m) => sum + m.sponsors, 0);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Analytics & Reports</h1>
          <p className="text-lg text-gray-600">Detailed insights and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">Last 24 Months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <p className="text-sm opacity-90">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">In selected period</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <p className="text-sm opacity-90">New Students</p>
          </div>
          <p className="text-3xl font-bold">{totalStudents}</p>
          <p className="text-sm opacity-75 mt-2">Registered</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" />
            <p className="text-sm opacity-90">New Sponsors</p>
          </div>
          <p className="text-3xl font-bold">{totalSponsors}</p>
          <p className="text-sm opacity-75 mt-2">Joined</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <p className="text-sm opacity-90">Donations</p>
          </div>
          <p className="text-3xl font-bold">${totalDonations.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">Received</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-slate-600" />
          <h2 className="text-2xl font-bold text-gray-800">Revenue Trend</h2>
        </div>
        <div className="space-y-4">
          {monthlyData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{data.month}</span>
                <span className="text-sm font-bold text-emerald-600">${data.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                >
                  {data.revenue > 0 && (
                    <span className="text-xs font-semibold text-white">
                      ${data.revenue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Student Growth</h2>
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-sm font-bold text-blue-600">{data.students} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(data.students / maxStudents) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">Sponsor Growth</h2>
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-sm font-bold text-red-600">{data.sponsors} sponsors</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(data.sponsors / maxSponsors) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
