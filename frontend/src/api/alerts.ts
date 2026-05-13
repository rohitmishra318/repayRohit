import client from './client';

export const alertsApi = {
  list: (state = 'triggered', limit = 20) =>
    client.get('/alerts', { params: { state, limit } }).then(r => r.data),

  markActioned: (alertId: string, action_taken: string) =>
    client.patch(`/alerts/${alertId}`, { action_taken }).then(r => r.data),
};