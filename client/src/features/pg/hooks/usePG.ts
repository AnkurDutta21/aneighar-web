import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pgApi, inquiryApi, dashboardApi } from '@/lib/api/pg.api'
import type { PGFilters } from '@/features/pg/pg.types'

// ── Query Keys ────────────────────────────────────────────────────
export const pgKeys = {
  all: ['pgs'] as const,
  list: (filters: PGFilters) => ['pgs', 'list', filters] as const,
  detail: (id: string) => ['pgs', 'detail', id] as const,
  ownerListings: () => ['pgs', 'owner'] as const,
  saved: () => ['pgs', 'saved'] as const,
  dashboard: () => ['dashboard'] as const,
  inquiriesOwner: (page: number, status?: string) => ['inquiries', 'owner', page, status] as const,
  inquiriesStudent: () => ['inquiries', 'student'] as const,
}

// ── PG Queries ────────────────────────────────────────────────────
export const usePGList = (filters: PGFilters) =>
  useQuery({
    queryKey: pgKeys.list(filters),
    queryFn: () => pgApi.getAll(filters),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })

export const usePGDetail = (id: string) =>
  useQuery({
    queryKey: pgKeys.detail(id),
    queryFn: () => pgApi.getById(id),
    enabled: !!id,
    staleTime: 60_000,
  })

export const useOwnerListings = () =>
  useQuery({
    queryKey: pgKeys.ownerListings(),
    queryFn: pgApi.getOwnerListings,
  })

export const useSavedListings = () =>
  useQuery({
    queryKey: pgKeys.saved(),
    queryFn: pgApi.getSaved,
  })

export const useDashboard = () =>
  useQuery({
    queryKey: pgKeys.dashboard(),
    queryFn: dashboardApi.getStats,
    staleTime: 60_000,
  })

// ── PG Mutations ──────────────────────────────────────────────────
export const useCreatePG = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pgApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: pgKeys.all }),
  })
}

export const useUpdatePG = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PGFilters> }) =>
      pgApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: pgKeys.detail(id) })
      qc.invalidateQueries({ queryKey: pgKeys.ownerListings() })
    },
  })
}

export const useDeletePG = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pgApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pgKeys.all })
      qc.invalidateQueries({ queryKey: pgKeys.ownerListings() })
    },
  })
}

export const useToggleSave = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pgApi.toggleSave,
    onSuccess: () => qc.invalidateQueries({ queryKey: pgKeys.saved() }),
  })
}

export const useUploadImages = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      pgApi.uploadImages(id, formData),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: pgKeys.detail(id) }),
  })
}

// ── Inquiry ───────────────────────────────────────────────────────
export const useOwnerInquiries = (page = 1, status?: string) =>
  useQuery({
    queryKey: pgKeys.inquiriesOwner(page, status),
    queryFn: () => inquiryApi.getOwnerInquiries({ page, status }),
  })

export const useStudentInquiries = () =>
  useQuery({
    queryKey: pgKeys.inquiriesStudent(),
    queryFn: inquiryApi.getStudentInquiries,
  })

export const useCreateInquiry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inquiryApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: pgKeys.inquiriesStudent() }),
  })
}

export const useUpdateInquiryStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inquiryApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inquiries', 'owner'] }),
  })
}
