import { useState } from 'react';
import { User, DollarSign, CreditCard, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InstitutionRegisterStudentProps {
  institutionEmail: string;
  onSuccess: () => void;
}

interface PaymentAccountForm {
  account_type: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  swift_code: string;
  additional_info: string;
}

export function InstitutionRegisterStudent({ institutionEmail, onSuccess }: InstitutionRegisterStudentProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);

  const [studentData, setStudentData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    grade_level: '',
    location: '',
    photo_url: '',
    background_story: '',
    family_situation: '',
    academic_performance: '',
    need_level: 5,
  });

  const [feeData, setFeeData] = useState({
    total_fees: '',
    amount_paid: '',
  });

  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccountForm[]>([
    {
      account_type: 'bank_account',
      account_name: '',
      account_number: '',
      bank_name: '',
      swift_code: '',
      additional_info: '',
    },
  ]);

  const addPaymentAccount = () => {
    setPaymentAccounts([
      ...paymentAccounts,
      {
        account_type: 'bank_account',
        account_name: '',
        account_number: '',
        bank_name: '',
        swift_code: '',
        additional_info: '',
      },
    ]);
  };

  const removePaymentAccount = (index: number) => {
    const updated = paymentAccounts.filter((_, i) => i !== index);
    setPaymentAccounts(updated);
    if (activeAccountIndex >= updated.length && activeAccountIndex > 0) {
      setActiveAccountIndex(activeAccountIndex - 1);
    }
  };

  const updatePaymentAccount = (index: number, field: keyof PaymentAccountForm, value: string) => {
    const updated = [...paymentAccounts];
    updated[index][field] = value;
    setPaymentAccounts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: institution } = await supabase
        .from('institutions')
        .select('id')
        .eq('email', institutionEmail)
        .maybeSingle();

      if (!institution) {
        throw new Error('Institution not found');
      }

      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([{
          institution_id: institution.id,
          ...studentData,
        }])
        .select()
        .single();

      if (studentError) throw studentError;

      const totalFees = parseFloat(feeData.total_fees) || 0;
      const amountPaid = parseFloat(feeData.amount_paid) || 0;

      const { error: feeError } = await supabase
        .from('student_fee_balances')
        .insert([{
          student_id: student.id,
          total_fees: totalFees,
          amount_paid: amountPaid,
          balance_due: totalFees - amountPaid,
        }]);

      if (feeError) throw feeError;

      const validAccounts = paymentAccounts.filter(
        acc => acc.account_name && acc.account_number && (acc.account_type === 'mobile_money' || acc.bank_name)
      );

      if (validAccounts.length > 0) {
        const accountsToInsert = validAccounts.map(acc => ({
          student_id: student.id,
          ...acc,
        }));

        const { error: accountError } = await supabase
          .from('payment_accounts')
          .insert(accountsToInsert);

        if (accountError) throw accountError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error registering student:', err);
      setError(err instanceof Error ? err.message : 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Student Registered Successfully!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">The student has been added to your institution.</p>
          <p className="text-xs sm:text-sm text-gray-500">Redirecting to students list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Register New Student</h1>
        <p className="text-sm sm:text-base text-gray-600">Fill in the student information to create their profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={studentData.full_name}
                onChange={(e) => setStudentData({ ...studentData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={studentData.date_of_birth}
                onChange={(e) => setStudentData({ ...studentData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                required
                value={studentData.gender}
                onChange={(e) => setStudentData({ ...studentData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Grade Level *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Grade 10, Form 4"
                value={studentData.grade_level}
                onChange={(e) => setStudentData({ ...studentData, grade_level: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country"
                value={studentData.location}
                onChange={(e) => setStudentData({ ...studentData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Photo URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={studentData.photo_url}
                onChange={(e) => setStudentData({ ...studentData, photo_url: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Need Level (1-10) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={studentData.need_level}
                onChange={(e) => setStudentData({ ...studentData, need_level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-0.5">1 = Low need, 10 = Critical need</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Background Story
              </label>
              <textarea
                rows={3}
                value={studentData.background_story}
                onChange={(e) => setStudentData({ ...studentData, background_story: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Family Situation
              </label>
              <textarea
                rows={2}
                value={studentData.family_situation}
                onChange={(e) => setStudentData({ ...studentData, family_situation: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Academic Performance
              </label>
              <textarea
                rows={2}
                value={studentData.academic_performance}
                onChange={(e) => setStudentData({ ...studentData, academic_performance: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Fee Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Total Fees *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={feeData.total_fees}
                onChange={(e) => setFeeData({ ...feeData, total_fees: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Amount Already Paid
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={feeData.amount_paid}
                onChange={(e) => setFeeData({ ...feeData, amount_paid: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 bg-blue-50 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-gray-700">
                <span className="font-semibold">Balance Due:</span>{' '}
                ${((parseFloat(feeData.total_fees) || 0) - (parseFloat(feeData.amount_paid) || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Payment Accounts</h2>
            </div>
            <button
              type="button"
              onClick={addPaymentAccount}
              className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Add Account
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Add bank account details or M-Pesa information where sponsors can send payments.
          </p>

          <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Account {activeAccountIndex + 1}</h3>
              {paymentAccounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePaymentAccount(activeAccountIndex)}
                  className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={paymentAccounts[activeAccountIndex].account_type === 'mobile_money' ? 'md:col-span-2' : ''}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={paymentAccounts[activeAccountIndex].account_type}
                  onChange={(e) => updatePaymentAccount(activeAccountIndex, 'account_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="bank_account">Bank Account</option>
                  <option value="mobile_money">Mobile Money (M-Pesa)</option>
                </select>
              </div>

              {paymentAccounts[activeAccountIndex].account_type === 'mobile_money' ? (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Paybill Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 400200"
                      value={paymentAccounts[activeAccountIndex].bank_name}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'bank_name', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Registration number or full name"
                      value={paymentAccounts[activeAccountIndex].account_name}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'account_name', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-0.5">
                      For universities: registration number | For high schools: full name
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      placeholder="Student name or institution name"
                      value={paymentAccounts[activeAccountIndex].account_name}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'account_name', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Registration number or account number"
                      value={paymentAccounts[activeAccountIndex].account_number}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'account_number', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Equity Bank"
                      value={paymentAccounts[activeAccountIndex].bank_name}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'bank_name', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      SWIFT/BIC Code
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={paymentAccounts[activeAccountIndex].swift_code}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'swift_code', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Additional Information
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Branch details, special instructions, etc."
                      value={paymentAccounts[activeAccountIndex].additional_info}
                      onChange={(e) => updatePaymentAccount(activeAccountIndex, 'additional_info', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {paymentAccounts.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {paymentAccounts.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveAccountIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeAccountIndex === index
                        ? 'bg-orange-600 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to account ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-red-800">Error</p>
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm sm:text-base font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm sm:text-base font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Register Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
