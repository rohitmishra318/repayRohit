import { useQuery } from '@tanstack/react-query';
import { riskApi } from '../api/risk';

export function useRiskScore(studentId: string | undefined) {
  return useQuery({
    queryKey: ['risk', studentId],
    queryFn: () => riskApi.getByStudentId(studentId!),
    enabled: !!studentId,
    staleTime: 60_000,
  });
}

export function useCachedRiskScore(studentId: string | undefined) {
  return useQuery({
    queryKey: ['risk-cached', studentId],
    queryFn: () => riskApi.getCached(studentId!),
    enabled: !!studentId,
    staleTime: 120_000,
  });
}

export function useRiskCard(studentId: string | undefined) {
  return useQuery({
    queryKey: ['risk-card', studentId],
    queryFn: () => riskApi.getRiskCard(studentId!),
    enabled: !!studentId,
    staleTime: 300_000,
  });
}