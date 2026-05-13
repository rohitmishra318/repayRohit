import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface Props {
  allowedRole?: 'admin' | 'student';
}

export function ProtectedLayout({ allowedRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
        <LoadingSpinner label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Wrong role — redirect to their correct home
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/my-dashboard'} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0F0F13]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}