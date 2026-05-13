import client from './client';
import type { RiskScore } from '../types/risk';

export const riskApi = {
  getByStudentId: (studentId: string) =>
    client.get<RiskScore>(`/risk/${studentId}`).then(r => r.data),

  getCached: (studentId: string) =>
    client.get<RiskScore>(`/risk/${studentId}/cached`).then(r => r.data),

  getRiskCard: (studentId: string) =>
    client.post<{ risk_summary: string; generated_at: string }>('/risk/card', { student_id: studentId }).then(r => r.data),
};