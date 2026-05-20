import axios from 'axios';
import { getIdToken } from '../services/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add request interceptor to attach Firebase ID token
 */
api.interceptors.request.use(async config => {
  try {
    const token = await getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    // User not logged in, no token to add
  }
  return config;
}, error => Promise.reject(error));

export interface CreateStudentData {
  firebase_uid: string;
  email: string;
  name: string;
  institute_name: string;
  institute_tier: 'tier_1' | 'tier_2' | 'tier_3';
  course_type: string;
  course_family: string;
  target_field: string;
  target_city_tier: 1 | 2 | 3;
  cgpa: number;
  internship_count: number;
  internship_employer_tier: 'recognized' | 'unverified' | 'none';
  ppo_exists: boolean;
  cert_count: number;
  graduation_month: number;
  graduation_year: number;
  loan_emi_monthly: number;
  tenth_board_score?: number;
  twelfth_board_score?: number;
  city?: string;
}

/**
 * Create a new student record in backend
 */
export async function createStudent(data: CreateStudentData) {
  const response = await api.post('/students/register', data);
  return response.data;
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export const authApi = {
  createStudent,
  getCurrentUser,
};

export default api;