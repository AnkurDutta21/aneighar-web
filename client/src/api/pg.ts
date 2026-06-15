import apiClient from '@/lib/apiClient';
import type { CreatePGPayload, PGFilters, PGListing, PGListingsResponse } from '@/types';

export const pgApi = {
  getListings: async (filters: PGFilters = {}): Promise<PGListingsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const res = await apiClient.get(`/pg?${params.toString()}`);
    return res.data;
  },

  getListing: async (id: string): Promise<{ status: string; data: { pg: PGListing } }> => {
    const res = await apiClient.get(`/pg/${id}`);
    return res.data;
  },

  createListing: async (payload: CreatePGPayload) => {
    const res = await apiClient.post('/pg', payload);
    return res.data;
  },

  updateListing: async ({ id, payload }: { id: string; payload: Partial<CreatePGPayload> }) => {
    const res = await apiClient.patch(`/pg/${id}`, payload);
    return res.data;
  },

  deleteListing: async (id: string) => {
    await apiClient.delete(`/pg/${id}`);
  },

  uploadImages: async (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    // Do NOT set Content-Type manually — axios auto-sets multipart/form-data
    // with the correct boundary when it detects a FormData body.
    const res = await apiClient.post(`/pg/${id}/images`, form);
    return res.data;
  },

  getMyListings: async (): Promise<PGListingsResponse> => {
    const res = await apiClient.get('/pg/owner/my-listings');
    return res.data;
  },

  deleteImage: async ({ id, publicId }: { id: string; publicId: string }) => {
    // publicId can contain slashes (e.g. aneighar/pg-images/xyz) — encode it
    const res = await apiClient.delete(`/pg/${id}/images/${encodeURIComponent(publicId)}`);
    return res.data;
  },
};
