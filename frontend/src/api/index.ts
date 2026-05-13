import client from './client';

export const api = {
  // Students
  getStudents: (params?: { course_family?: string; risk_tier?: string; limit?: number }) =>
    client.get('/students', { params }).then(r => r.data),

  getStudent: (id: string) =>
    client.get(`/students/${id}`).then(r => r.data),

  // Risk
  getRisk: (studentId: string) =>
    client.get(`/risk/${studentId}`).then(r => r.data),

  getCachedRisk: (studentId: string) =>
    client.get(`/risk/${studentId}/cached`).then(r => r.data),

  getRiskCard: (studentId: string) =>
    client.post('/risk/card', { student_id: studentId }).then(r => r.data),

  // Portfolio
  getPortfolio: () =>
    client.get('/portfolio').then(r => r.data),

  stressTest: (field: string, shock_pct: number) =>
    client.post('/stress-test', { field, shock_pct }).then(r => r.data),

  // Interventions
  getInterventions: (studentId: string) =>
    client.get(`/interventions/${studentId}`).then(r => r.data),

  // Alerts
  getAlerts: (state = 'triggered', limit = 20) =>
    client.get('/alerts', { params: { state, limit } }).then(r => r.data),

  patchAlert: (alertId: string, action_taken: string) =>
    client.patch(`/alerts/${alertId}`, { action_taken }).then(r => r.data),
};