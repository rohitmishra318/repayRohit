import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

export type Role = 'admin' | 'student';

export interface StudentSession {
  student_id?: string;
  institute_id?: string;
  name: string;
  email: string;
  course?: string;
  course_family?: string;
  cgpa?: number;
  internship_count?: number;
  internship_employer_tier?: string;
  ppo_exists?: boolean;
  cert_count?: number;
  loan_emi_monthly?: number;
  tenth_board_score?: number;
  twelth_board_score?: number;
  months_since_graduation?: number;


}

interface SessionContextValue {
  firebaseUser: User | null;
  role: Role;
  setRole: (r: Role) => void;
  student: StudentSession | null;
  setStudent: (s: StudentSession | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  firebaseError: string | null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('student');
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!auth) {
      setFirebaseError('Firebase not configured. Please check your .env.local file.');
      setIsLoading(false);
      return;
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setFirebaseUser(user);

        if (!user) {
          setStudent(null);
          setIsLoading(false);
          return;
        }

        // ── Admin shortcut ─────────────────────────────────────────────
        // If the logged-in email is the admin email, grant admin role
        // immediately — no DB record needed.
        const ADMIN_EMAIL = 'admin@gmail.com';
        if (user.email === ADMIN_EMAIL) {
          setRole('admin');
          setStudent(null);
          setIsLoading(false);
          console.log('Admin user detected via email — admin role granted.');
          return;
        }

        // User is logged in, fetch their student data from backend
        try {
          const token = await user.getIdToken();
          const apiUrl = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;
          const response = await fetch(`${apiUrl}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Auth state change - user logged in:', user.email);
          console.log('GET /auth/me response:', { status: response.status, ok: response.ok });

          if (response.ok) {
            const userData = await response.json();
            console.log('User data received:', userData);
            setStudent({
              name: userData.name,
              email: userData.email,
              student_id: userData.student_id,
              institute_id: userData.institute_id,
              course: userData.course_type,
              course_family: userData.course_family,
              cgpa: userData.cgpa,
              internship_count: userData.internship_count,
              internship_employer_tier: userData.internship_employer_tier,
              ppo_exists: userData.ppo_exists,
              cert_count: userData.cert_count,
              loan_emi_monthly: userData.loan_emi_monthly,
              tenth_board_score: userData.tenth_board_score,
              twelfth_board_score: userData.twelfth_board_score,
              months_since_graduation: userData.months_since_graduation,
              institute_tier: userData.institute_tier,
              target_field: userData.target_field,
              target_city_tier: userData.target_city_tier,
            });
            // Determine role based on whether they're an admin
            setRole(userData.role === 'admin' ? 'admin' : 'student');
          } else {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('Failed to fetch user data:', response.status, errorData);
            setStudent(null);
            setRole('student');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setStudent(null);
          setRole('student');
        } finally {
          setIsLoading(false);
        }

      },
      (error) => {
        console.error('Auth state change error:', error);
        setFirebaseError(error.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        firebaseUser,
        role,
        setRole,
        student,
        setStudent,
        isLoading,
        isAuthenticated: !!firebaseUser,
        logout,
        firebaseError,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}