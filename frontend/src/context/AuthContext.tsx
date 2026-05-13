import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, AuthState } from '../types/auth';

interface LoginPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // On app load — restore session from localStorage
  useEffect(() => {
    const userRaw = localStorage.getItem('rs_user');
    if (userRaw) {
      try {
        const user: User = JSON.parse(userRaw);
        setState({ user, token: 'bypass', isAuthenticated: true, isLoading: false });
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    // Bypass authentication - just store user data
    const user: User = {
      id: Date.now().toString(),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      student_id: undefined,
    };
    localStorage.setItem('rs_user', JSON.stringify(user));
    setState({ user, token: 'bypass', isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('rs_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}