import apiClient from '@/lib/apiClient';
import type { CreatePGPayload, PGFilters, PGListing, PGListingsResponse } from '@/types';

/**
 * PG API — identical to web api/pg.ts.
 *
 * Mobile difference: uploadImages uses URI-based FormData instead of File objects.
 * The core pgApi.uploadImages signature is extended for mobile — accepts
 * { uri, name, type } asset objects from expo-image-picker.
 */

export interface ImageAsset {
  uri: string;
  name: string;
  type: string;
}

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

  updateListing: async ({
    id,
    payload,
  }: {
    id: string;
    payload: Partial<CreatePGPayload>;
  }) => {
    const res = await apiClient.patch(`/pg/${id}`, payload);
    return res.data;
  },

  deleteListing: async (id: string) => {
    await apiClient.delete(`/pg/${id}`);
  },

  /**
   * Upload images from expo-image-picker.
   * Mobile uses URI-based FormData (not File objects like web).
   */
  uploadImages: async (id: string, assets: ImageAsset[]) => {
    const form = new FormData();
    assets.forEach((asset) => {
      // React Native FormData accepts { uri, name, type } shape
      form.append('images', {
        uri: asset.uri,
        name: asset.name,
        type: asset.type,
      } as unknown as Blob);
    });
    const res = await apiClient.post(`/pg/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getMyListings: async (): Promise<PGListingsResponse> => {
    const res = await apiClient.get('/pg/owner/my-listings');
    return res.data;
  },

  deleteImage: async ({ id, publicId }: { id: string; publicId: string }) => {
    const res = await apiClient.delete(
      `/pg/${id}/images/${encodeURIComponent(publicId)}`
    );
    return res.data;
  },
};
