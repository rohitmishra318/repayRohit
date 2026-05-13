import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';
import type { Role } from './context/SessionContext';
import { Shell } from './components/layout/Shell';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { SectorRiskPage } from './pages/SectorRiskPage';
import { StressTestPage } from './pages/StressTestPage';
import { FirebaseConfigError } from './components/auth/FirebaseConfigError';
import { Spinner } from './components/shared/Spinner';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

/** Renders children only when the session role matches; otherwise redirects. */
function RequireRole({ allowed, fallback, children }: { allowed: Role; fallback: string; children: ReactNode }) {
  const { role } = useSession();
  if (role !== allowed) return <Navigate to={fallback} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { role, isAuthenticated, isLoading, firebaseError } = useSession();

  // Show Firebase config error if present
  if (firebaseError) {
    return <FirebaseConfigError />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-3">
          <Spinner size="lg" label="Loading..." />
          <p className="text-slate-600 dark:text-slate-400">Setting up your session...</p>
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
        {/* Default redirect based on role */}
        <Route path="/" element={
          <Navigate to={role === 'admin' ? '/dashboard' : '/my'} replace />
        } />

        {/* Admin-only routes */}
        <Route path="/dashboard" element={
          <RequireRole allowed="admin" fallback="/my">
            <AdminDashboard />
          </RequireRole>
        } />
        <Route path="/student/:id" element={
          <RequireRole allowed="admin" fallback="/my">
            <StudentDetailPage />
          </RequireRole>
        } />
        <Route path="/alerts" element={
          <RequireRole allowed="admin" fallback="/my">
            <AlertsPage />
          </RequireRole>
        } />
        <Route path="/sector-risk" element={
          <RequireRole allowed="admin" fallback="/my">
            <SectorRiskPage />
          </RequireRole>
        } />
        <Route path="/stress-test" element={
          <RequireRole allowed="admin" fallback="/my">
            <StressTestPage />
          </RequireRole>
        } />

        {/* Student-only routes */}
        <Route path="/my" element={
          <RequireRole allowed="student" fallback="/dashboard">
            <StudentDashboard />
          </RequireRole>
        } />
        <Route path="/my/profile" element={
          <RequireRole allowed="student" fallback="/dashboard">
            <StudentProfilePage />
          </RequireRole>
        } />
        <Route path="/my/insights" element={
          <RequireRole allowed="student" fallback="/dashboard">
            <AIInsightsPage />
          </RequireRole>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}