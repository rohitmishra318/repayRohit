import client from './client';
import type { StudentListItem, StudentDetail } from '../types/student';

export const studentsApi = {
  list: (params?: { course_family?: string; risk_tier?: string; limit?: number }) =>
    client.get<StudentListItem[]>('/students', { params }).then(r => r.data),

  getById: (id: string) =>
    client.get<StudentDetail>(`/students/${id}`).then(r => r.data),

  getMyProfile: () =>
    client.get<StudentDetail>('/students/me').then(r => r.data),
};