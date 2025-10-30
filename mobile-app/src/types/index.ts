// Type definitions for the nutrition tracker app

export interface Food {
  id: string;
  name: string;
  originalName?: string;
  usdaDescription?: string;
  fats: number;
  carbohydrates: number;
  protein: number;
  fiber: number;
  totalCalories: number;
  quantity: number;
  measurementType: string;
  allNutrients: Record<string, Nutrient>;
}

export interface Nutrient {
  name: string;
  value: number;
  unit: string;
  category?: string;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: USDANutrient[];
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber?: string;
  unitName: string;
  value: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  url: string;
  timeDisplay: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  channel_title: string;
  published_at: string;
  duration: string;
  view_count: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UserDetails {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'athlete';
  goal: 'maintain' | 'gain' | 'lose';
}

export interface NutritionRecommendation {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  fiber: number;
  water: number;
  [key: string]: number | { min: number; max: number };
}
