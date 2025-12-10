import { useState } from 'react';
import { Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';

interface InstitutionHeaderProps {
  institutionEmail: string;
  onLogout: () => void;
}

export function InstitutionHeader({ institutionEmail, onLogout }: InstitutionHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg">
            <span className="text-2xl">🏫</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Institution Portal</h1>
            <p className="text-xs text-gray-600">DestinyPal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-full">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">Institution</p>
                <p className="text-xs text-gray-600 truncate max-w-[150px]">{institutionEmail}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Signed in as</p>
                  <p className="text-xs text-gray-600 truncate">{institutionEmail}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
