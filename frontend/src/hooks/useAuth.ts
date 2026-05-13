import { useAuthContext } from '../context/AuthContext';

// Re-exports context with helper computed values
export function useAuth() {
  const auth = useAuthContext();

  return {
    ...auth,
    isAdmin: auth.user?.role === 'admin',
    isStudent: auth.user?.role === 'student',
    studentId: auth.user?.student_id ?? null,
  };
}