import { Home, Users, UserPlus, User, Settings, HelpCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface InstitutionSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: Home,
    description: 'Overview and statistics',
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    description: 'View all students',
  },
  {
    id: 'register',
    label: 'Register Student',
    icon: UserPlus,
    description: 'Add new student',
  },
  {
    id: 'profile',
    label: 'Institution Profile',
    icon: User,
    description: 'Manage institution details',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configure preferences',
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: HelpCircle,
    description: 'Support and documentation',
  },
];

export function InstitutionSidebar({ currentView, onNavigate }: InstitutionSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-orange-600 to-orange-700 shadow-lg transition-transform duration-300 z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="h-full px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white shadow-md'
                    : 'text-orange-100 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-orange-200 group-hover:text-white'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-orange-50'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-orange-100' : 'text-orange-200'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}
