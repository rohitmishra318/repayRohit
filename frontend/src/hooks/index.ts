import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export const STUDENT_ID = 'a0750f22-f898-58b9-8b89-fb5bf64c6dbe';

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: api.getPortfolio,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useStudents(filters?: { course_family?: string; risk_tier?: string }) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => api.getStudents({ ...filters, limit: 2500 }),
    staleTime: 30_000,
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => api.getStudent(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useRisk(studentId: string | undefined, realtime = false) {
  return useQuery({
    queryKey: ['risk', studentId, realtime],
    queryFn: () => realtime ? api.getRisk(studentId!) : api.getCachedRisk(studentId!),
    enabled: !!studentId,
    staleTime: realtime ? 60_000 : 120_000,
  });
}

export function useRiskCard(studentId: string | undefined) {
  return useQuery({
    queryKey: ['risk-card', studentId],
    queryFn: () => api.getRiskCard(studentId!),
    enabled: !!studentId,
    staleTime: 300_000,
  });
}

export function useInterventions(studentId: string | undefined) {
  return useQuery({
    queryKey: ['interventions', studentId],
    queryFn: () => api.getInterventions(studentId!),
    enabled: !!studentId,
    staleTime: 300_000,
  });
}

export function useAlerts(state: 'triggered' | 'actioned' | 'resolved' = 'triggered') {
  return useQuery({
    queryKey: ['alerts', state],
    queryFn: () => api.getAlerts(state, 20),
    staleTime: 30_000,
    refetchInterval: state === 'triggered' ? 30_000 : false,
    retry: 1,
  });
}

export function usePatchAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patchAlert(id, action),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (error) => {
      console.error('Failed to update alert:', error);
    },
  });
}