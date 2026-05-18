import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: import('../types/index').StudentUpdatePayload }) => 
      studentsApi.updateProfile(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both the specific student, general profile, and risk/insight queries
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['risk', id] });
      queryClient.invalidateQueries({ queryKey: ['risk-card', id] });
    },
  });
}