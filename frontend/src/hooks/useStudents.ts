import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../api/students';

export function useStudentList(filters?: { course_family?: string; risk_tier?: string }) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsApi.list({ ...filters, limit: 100 }),
    staleTime: 30_000,
  });
}

export function useStudentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getById(id!),
    enabled: !!id,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => studentsApi.getMyProfile(),
  });
}