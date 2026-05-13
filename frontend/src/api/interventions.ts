import client from './client';

export const interventionsApi = {
  getByStudentId: (studentId: string) =>
    client.get(`/interventions/${studentId}`).then(r => r.data),
};