import apiClient from '@/lib/apiClient';
import type { CreateInquiryPayload } from '@/types';

export const inquiryApi = {
  createInquiry: async (payload: CreateInquiryPayload) => {
    const res = await apiClient.post('/inquiries', payload);
    return res.data;
  },

  getOwnerInquiries: async (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const res = await apiClient.get(`/inquiries/owner?${query.toString()}`);
    return res.data;
  },

  getStudentInquiries: async () => {
    const res = await apiClient.get('/inquiries/student');
    return res.data;
  },

  updateStatus: async ({ id, status }: { id: string; status: string }) => {
    const res = await apiClient.patch(`/inquiries/${id}/status`, { status });
    return res.data;
  },
};

export const savesApi = {
  toggleSave: async (pgId: string) => {
    const res = await apiClient.post(`/saves/${pgId}`);
    return res.data;
  },

  getSavedListings: async () => {
    const res = await apiClient.get('/saves');
    return res.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },
};
