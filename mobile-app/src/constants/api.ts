// API Configuration
// Change this to your server's IP address when testing on a physical device
// For iOS simulator: http://localhost:5001
// For Android emulator: http://10.0.2.2:5001
// For physical device: http://YOUR_COMPUTER_IP:5001 (use 192.168.88.55 based on your network)
export const API_BASE_URL = 'http://192.168.88.55:5001';

export const API_ENDPOINTS = {
  // NLP endpoints
  nlpProcessText: '/nlp/process_text/',
  
  // AI endpoints
  aiChat: '/ai/chat',
  aiAnalyzeMealImage: '/ai/analyze-meal-image',
  aiParseAndMatchFoods: '/ai/parse-and-match-foods',
  
  // Recipe endpoints
  recipesSearch: '/api/recipes/search',
  
  // USDA endpoints
  usdaSearch: '/api/usda/search',
  usdaFoodDetails: '/api/usda/food',
  
  // YouTube endpoints
  youtubeVideos: '/api/youtube/videos',
  youtubeRefresh: '/api/youtube/refresh',
  youtubeStats: '/api/youtube/stats',
};

// USDA API Configuration
export const USDA_API_KEY = '7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx';
export const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
export const USDA_DETAIL_URL = 'https://api.nal.usda.gov/fdc/v1/food';
