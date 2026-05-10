import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import GradesPage from './pages/student/GradesPage';
import JournalPage from './pages/teacher/JournalPage';
import AdminPage from './pages/admin/AdminPage';
import Layout from './components/Layout';
import { BookOpen } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  if (user.role === 0) {
    return (
      <Layout>
        <GradesPage />
      </Layout>
    );
  }

  if (user.role === 1) {
    return (
      <Layout
        tabs={[{ id: 'journal', label: 'Журнал', icon: <BookOpen className="w-4 h-4" /> }]}
        activeTab="journal"
      >
        <JournalPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminPage />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
