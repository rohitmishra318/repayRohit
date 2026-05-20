

// ============ Auth Types ============
type UserRole = 'admin' | 'student';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  student_id?: string; // only for students
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  student_id?: string; // students link their loan account
}

interface AuthResponse {
  user: User;
  token: string;
}

// ============ Student Types ============
interface StudentListItem {
  student_id: string;
  name: string;
  course_type: string;
  course_family: string;
  target_field: string;
  risk_score: number;
  risk_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  months_since_graduation: number;
  placement_status: 'placed' | 'searching';
  institute_tier: string;
  city?: string;
}

interface StudentDetail extends StudentListItem {
  cgpa: number;
  internship_employer_tier: string;
  ppo_exists: boolean;
  cert_count: number;
  target_city_tier: number;
  loan_emi_monthly: number;
  data_trust_score: number;
  tenth_board_score?: number;
  twelfth_board_score?: number;
}

export interface StudentUpdatePayload {
  cgpa?: number;
  internship_count?: number;
  cert_count?: number;
  ppo_exists?: boolean;
  tenth_board_score?: number;
  twelth_board_score?: number;
  target_field?: string;
  target_city_tier?: number;
  months_since_graduation?: number;
}

export interface ShapDriver {
  feature: string;
  direction: 'increases_risk' | 'reduces_risk';
  magnitude: number;
  display: string;
}

interface BiasFlag {
  flag: string;
  severity: string;
}

interface RiskData {
  student_id: string;
  risk_score: number;
  ci_lower: number;
  ci_upper: number;
  ci_width: number;
  p_3mo: number;
  p_6mo: number;
  p_12mo: number;
  predicted_salary_lower: number;
  predicted_salary_upper: number;
  repayment_stress_index: number;
  repayment_stress_label: string;
  shap_drivers: ShapDriver[];
  bias_flags: BiasFlag[];
  data_trust_weight: number;
  course_family: string;
  regulatory_note?: string;
  needs_human_review: boolean;
  xai_card_text?: string;
  scored_at: string;
}

interface Intervention {
  id: string;
  name: string;
  category: string;
  base_lift_pp: number;
  adjusted_lift_pp: number;
  cost_tier: string;
  delivery: string;
  description: string;
}

export interface Alert {
  id: string;
  student_id: string;
  student_name: string;
  student_course: string;
  trigger_id: string;
  trigger_name: string;
  severity: 'high' | 'low';
  state: 'triggered' | 'actioned' | 'resolved';
  assignee: string;
  deadline: string | null;
  action_taken: string | null;
}

interface SectorExposure {
  field: string;
  student_count: number;
  avg_risk: number;
  demand_percentile: number;
}

interface PortfolioSummary {
  total_students: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  avg_risk_score: number;
  sector_exposure: SectorExposure[];
  recent_alerts: Alert[];
  model_version?: any;
}

export type { PortfolioSummary, SectorExposure, Alert, Intervention, RiskData, BiasFlag, ShapDriver, StudentDetail, StudentListItem, StudentUpdatePayload, AuthResponse, RegisterPayload, LoginPayload, AuthState, User, UserRole };