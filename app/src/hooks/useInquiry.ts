import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inquiryApi, savesApi, dashboardApi } from '@/api/inquiry';
import type { CreateInquiryPayload } from '@/types';

/**
 * Inquiry, saves, and dashboard hooks — 1:1 port from web hooks/useInquiry.ts.
 */

// ─── Inquiry Keys ─────────────────────────────────────────────────────────────
export const inquiryKeys = {
  all: ['inquiries'] as const,
  owner: (params?: object) => [...inquiryKeys.all, 'owner', params] as const,
  student: () => [...inquiryKeys.all, 'student'] as const,
};

// ─── Saves Keys ───────────────────────────────────────────────────────────────
export const savesKeys = {
  all: ['saves'] as const,
  list: () => [...savesKeys.all, 'list'] as const,
};

// ─── Dashboard Keys ───────────────────────────────────────────────────────────
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

// ─── Inquiry Hooks ────────────────────────────────────────────────────────────
export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInquiryPayload) =>
      inquiryApi.createInquiry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inquiryKeys.student() });
    },
  });
}

export function useOwnerInquiries(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: inquiryKeys.owner(params),
    queryFn: () => inquiryApi.getOwnerInquiries(params),
  });
}

export function useStudentInquiries() {
  return useQuery({
    queryKey: inquiryKeys.student(),
    queryFn: () => inquiryApi.getStudentInquiries(),
  });
}

export function useUpdateInquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inquiryApi.updateStatus({ id, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}

// ─── Saves Hooks ─────────────────────────────────────────────────────────────
export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pgId: string) => savesApi.toggleSave(pgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savesKeys.list() });
    },
  });
}

export function useSavedListings() {
  return useQuery({
    queryKey: savesKeys.list(),
    queryFn: () => savesApi.getSavedListings(),
  });
}

// ─── Dashboard Hook ───────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
  });
}
