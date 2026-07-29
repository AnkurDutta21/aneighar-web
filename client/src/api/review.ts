import apiClient from '@/lib/apiClient';
import type { ReviewsResponse, CreateReviewPayload, ApiResponse, Review } from '@/types';

export const reviewApi = {
  getPGReviews: async (pgId: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
    const res = await apiClient.get<ReviewsResponse>(`/pg/${pgId}/reviews`, {
      params: { page, limit },
    });
    return res.data;
  },

  addOrUpdateReview: async (
    pgId: string,
    payload: CreateReviewPayload
  ): Promise<ApiResponse<{ review: Review }>> => {
    const res = await apiClient.post<ApiResponse<{ review: Review }>>(`/pg/${pgId}/reviews`, payload);
    return res.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },
};
