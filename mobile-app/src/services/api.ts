import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { Food, USDAFood } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NLP Services
export const nlpService = {
  processText: async (text: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.nlpProcessText, { text });
      return response.data;
    } catch (error) {
      console.error('NLP process text error:', error);
      throw error;
    }
  },
};

// AI Services
export const aiService = {
  chat: async (userMessage: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.aiChat, { userMessage });
      return response.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  analyzeMealImage: async (imageData: string, mimeType: string = 'image/jpeg') => {
    try {
      const response = await api.post(API_ENDPOINTS.aiAnalyzeMealImage, {
        image: imageData,
        mimeType,
      });
      return response.data;
    } catch (error) {
      console.error('AI analyze meal image error:', error);
      throw error;
    }
  },

  parseAndMatchFoods: async (text: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.aiParseAndMatchFoods, { text });
      return response.data;
    } catch (error) {
      console.error('AI parse and match foods error:', error);
      throw error;
    }
  },
};

// USDA Services
export const usdaService = {
  search: async (query: string, limit: number = 20) => {
    try {
      const response = await api.get(API_ENDPOINTS.usdaSearch, {
        params: { query, limit },
      });
      return response.data;
    } catch (error) {
      console.error('USDA search error:', error);
      throw error;
    }
  },

  getFoodDetails: async (fdcId: number) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.usdaFoodDetails}/${fdcId}`);
      return response.data;
    } catch (error) {
      console.error('USDA food details error:', error);
      throw error;
    }
  },
};

// Recipe Services
export const recipeService = {
  search: async (query: string = '', limit: number = 40) => {
    try {
      const response = await api.get(API_ENDPOINTS.recipesSearch, {
        params: { query, number: limit },
      });
      return response.data;
    } catch (error) {
      console.error('Recipe search error:', error);
      throw error;
    }
  },
};

// YouTube Services
export const youtubeService = {
  getVideos: async (query: string = '', limit: number = 40) => {
    try {
      const response = await api.get(API_ENDPOINTS.youtubeVideos, {
        params: { query, limit },
      });
      return response.data;
    } catch (error) {
      console.error('YouTube get videos error:', error);
      throw error;
    }
  },

  refreshVideos: async (query: string = '') => {
    try {
      const response = await api.post(API_ENDPOINTS.youtubeRefresh, { query });
      return response.data;
    } catch (error) {
      console.error('YouTube refresh error:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.youtubeStats);
      return response.data;
    } catch (error) {
      console.error('YouTube stats error:', error);
      throw error;
    }
  },
};

export default api;
