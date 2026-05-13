import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from './context/SessionContext';
import { Shell } from './components/layout/Shell';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { FirebaseConfigError } from './components/auth/FirebaseConfigError';
import { Spinner } from './components/shared/Spinner';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppRoutes() {
  const { role, isAuthenticated, isLoading, firebaseError } = useSession();

  // Show Firebase config error if present
  if (firebaseError) {
    return <FirebaseConfigError />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-3">
          <Spinner size="lg" label="Loading..." />
          <p className="text-slate-600">Setting up your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <HomePage />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={
          <Navigate to={role === 'admin' ? '/dashboard' : '/my'} replace />
        } />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/student/:id" element={<StudentDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/my" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}