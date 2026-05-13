import client from './client';
import type { PortfolioSummary } from '../types/portfolio';

export const portfolioApi = {
  getSummary: () =>
    client.get<PortfolioSummary>('/portfolio').then(r => r.data),

  stressTest: (field: string, shock_pct: number) =>
    client.post('/stress-test', { field, shock_pct }).then(r => r.data),
};