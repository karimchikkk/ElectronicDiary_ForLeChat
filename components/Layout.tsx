import { ReactNode } from 'react';
import { BookOpen, LogOut, User, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS: Record<number, string> = {
  0: 'Ученик',
  1: 'Учитель',
  2: 'Администратор',
};

const ROLE_ICONS: Record<number, ReactNode> = {
  0: <GraduationCap className="w-4 h-4" />,
  1: <User className="w-4 h-4" />,
  2: <Shield className="w-4 h-4" />,
};

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface LayoutProps {
  children: ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function Layout({ children, tabs, activeTab, onTabChange }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg hidden sm:block">Электронный дневник</span>
            <span className="font-bold text-slate-800 text-lg sm:hidden">Дневник</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">{user?.fullName}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                {ROLE_ICONS[user?.role ?? 0]}
                {ROLE_LABELS[user?.role ?? 0]}
              </span>
            </div>
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm sm:flex hidden">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:block">Выйти</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
