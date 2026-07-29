import apiClient from '@/lib/apiClient';
import type { ChatbotResponse } from '@/types';

export interface UserLocationParam {
  lat?: number;
  lng?: number;
  city?: string;
  area?: string;
}

export const chatbotApi = {
  getRecommendations: async (
    message: string,
    history: any[] = [],
    userLocation?: UserLocationParam | null
  ): Promise<ChatbotResponse> => {
    const res = await apiClient.post<ChatbotResponse>('/chatbot/recommend', {
      message,
      history,
      userLocation,
    });
    return res.data;
  },
};
