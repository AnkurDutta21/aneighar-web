import apiClient from './client'
import type { PGFilters } from '@/features/pg/pg.types'

export const pgApi = {
  getAll: (params?: PGFilters) =>
    apiClient.get('/pg', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/pg/${id}`).then((r) => r.data.data.pg),

  create: (data: FormData) =>
    apiClient.post('/pg', data, {
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.data.data.pg),

  update: (id: string, data: Partial<PGFilters>) =>
    apiClient.put(`/pg/${id}`, data).then((r) => r.data.data.pg),

  delete: (id: string) => apiClient.delete(`/pg/${id}`),

  uploadImages: (id: string, formData: FormData) =>
    apiClient.post(`/pg/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data.pg),

  deleteImage: (id: string, publicId: string) =>
    apiClient.delete(`/pg/${id}/images/${encodeURIComponent(publicId)}`).then((r) => r.data.data.pg),

  getOwnerListings: () =>
    apiClient.get('/pg/owner/my-listings').then((r) => r.data.data.listings),

  toggleSave: (pgId: string) =>
    apiClient.post(`/saves/${pgId}`).then((r) => r.data.data),

  getSaved: () =>
    apiClient.get('/saves').then((r) => r.data.data.saved),
}

export const inquiryApi = {
  create: (data: { pgId: string; message: string; phone?: string }) =>
    apiClient.post('/inquiries', data).then((r) => r.data.data.inquiry),

  getOwnerInquiries: (params?: { page?: number; status?: string }) =>
    apiClient.get('/inquiries/owner', { params }).then((r) => r.data),

  getStudentInquiries: () =>
    apiClient.get('/inquiries/my-inquiries').then((r) => r.data.data.inquiries),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/inquiries/${id}/status`, { status }).then((r) => r.data.data.inquiry),
}

export const dashboardApi = {
  getStats: () =>
    apiClient.get('/dashboard').then((r) => r.data.data),
}
