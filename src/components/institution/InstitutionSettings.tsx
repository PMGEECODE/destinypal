import { Save, Bell, Lock, Eye, Shield } from 'lucide-react';
import { useState } from 'react';

interface InstitutionSettingsProps {
  institutionEmail: string;
}

export function InstitutionSettings({ institutionEmail }: InstitutionSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    paymentNotifications: true,
    registrationAlerts: true,
    monthlyReports: true,
    sponsorUpdates: true,
    studentProfileVisibility: 'public' as 'public' | 'sponsors-only' | 'private',
    twoFactorAuth: false,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-lg text-gray-600">Configure your institution preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-800">Payment Notifications</p>
                <p className="text-sm text-gray-600">Get notified when payments are received</p>
              </div>
              <input
                type="checkbox"
                checked={settings.paymentNotifications}
                onChange={(e) => setSettings({ ...settings, paymentNotifications: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-800">Registration Alerts</p>
                <p className="text-sm text-gray-600">Notifications for new student registrations</p>
              </div>
              <input
                type="checkbox"
                checked={settings.registrationAlerts}
                onChange={(e) => setSettings({ ...settings, registrationAlerts: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-800">Monthly Reports</p>
                <p className="text-sm text-gray-600">Receive monthly summary reports</p>
              </div>
              <input
                type="checkbox"
                checked={settings.monthlyReports}
                onChange={(e) => setSettings({ ...settings, monthlyReports: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-800">Sponsor Updates</p>
                <p className="text-sm text-gray-600">Get updates about new sponsorships</p>
              </div>
              <input
                type="checkbox"
                checked={settings.sponsorUpdates}
                onChange={(e) => setSettings({ ...settings, sponsorUpdates: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Eye className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Privacy Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Default Student Profile Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={settings.studentProfileVisibility === 'public'}
                    onChange={(e) => setSettings({ ...settings, studentProfileVisibility: e.target.value as any })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800">Public</p>
                    <p className="text-sm text-gray-600">Student profiles visible to all potential sponsors</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="sponsors-only"
                    checked={settings.studentProfileVisibility === 'sponsors-only'}
                    onChange={(e) => setSettings({ ...settings, studentProfileVisibility: e.target.value as any })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800">Sponsors Only</p>
                    <p className="text-sm text-gray-600">Only current sponsors can view full profiles</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={settings.studentProfileVisibility === 'private'}
                    onChange={(e) => setSettings({ ...settings, studentProfileVisibility: e.target.value as any })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800">Private</p>
                    <p className="text-sm text-gray-600">Profiles hidden from public platform</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Security</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </label>

            <button className="w-full md:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Save className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">Settings saved successfully!</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
