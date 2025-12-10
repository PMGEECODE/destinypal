import { useEffect, useState } from 'react';
import { Building, Mail, Phone, MapPin, Calendar, Save, Loader2, CheckCircle } from 'lucide-react';
import type { Institution } from '../../types';

interface InstitutionProfileProps {
  institutionEmail: string;
}

export function InstitutionProfile({ institutionEmail }: InstitutionProfileProps) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchInstitution();
  }, [institutionEmail]);

  const fetchInstitution = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('email', institutionEmail)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setInstitution(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching institution:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!institution) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('institutions')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
        })
        .eq('id', institution.id);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Building className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Institution Not Found</h2>
          <p className="text-gray-600">
            We couldn't find an institution profile associated with this email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Institution Profile</h1>
        <p className="text-lg text-gray-600">Manage your institution information</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Building className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="flex-1 bg-transparent text-gray-600 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500">
              <Phone className="w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="flex-1 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="flex items-start gap-3 px-4 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter institution address"
                className="flex-1 outline-none resize-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-sm text-gray-600">
                  {new Date(institution.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">Changes saved successfully!</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => fetchInstitution()}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
