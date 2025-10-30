import { Nutrient } from '../types';

// Helper function to get nutrient group from the 9-group structure
export const getNutrientGroup = (nutrientName: string): string => {
  const categoryToGroup: Record<string, string> = {
    // GROUP 1: ENERGY & FOUNDATION
    'Energy': 'GROUP 1: ENERGY & FOUNDATION',
    'Basic Components': 'GROUP 1: ENERGY & FOUNDATION',
    
    // GROUP 2: MACRONUTRIENTS
    'Macronutrients': 'GROUP 2: MACRONUTRIENTS',
    
    // GROUP 3: VITAMINS
    'Fat-Soluble Vitamins': 'GROUP 3: VITAMINS',
    'Water-Soluble Vitamins': 'GROUP 3: VITAMINS',
    'B Vitamins': 'GROUP 3: VITAMINS',
    'Vitamin E': 'GROUP 3: VITAMINS',
    'Folate': 'GROUP 3: VITAMINS',
    
    // GROUP 4: MINERALS
    'Major Minerals': 'GROUP 4: MINERALS',
    'Trace Minerals': 'GROUP 4: MINERALS',
    
    // GROUP 5: CARBOHYDRATES
    'Fiber': 'GROUP 5: CARBOHYDRATES',
    'Sugars': 'GROUP 5: CARBOHYDRATES',
    'Complex Carbohydrates': 'GROUP 5: CARBOHYDRATES',
    
    // GROUP 6: LIPIDS & FATS
    'Lipids': 'GROUP 6: LIPIDS & FATS',
    'Fatty Acid Totals': 'GROUP 6: LIPIDS & FATS',
    'Saturated Fatty Acids': 'GROUP 6: LIPIDS & FATS',
    'Monounsaturated Fatty Acids': 'GROUP 6: LIPIDS & FATS',
    'Polyunsaturated Fatty Acids': 'GROUP 6: LIPIDS & FATS',
    'Trans Fatty Acids': 'GROUP 6: LIPIDS & FATS',
    'Phytosterols': 'GROUP 6: LIPIDS & FATS',
    
    // GROUP 7: PROTEINS
    'Amino Acids': 'GROUP 7: PROTEINS',
    
    // GROUP 8: BIOACTIVE COMPOUNDS
    'Carotenoids': 'GROUP 8: BIOACTIVE COMPOUNDS',
    'Choline': 'GROUP 8: BIOACTIVE COMPOUNDS',
    'Isoflavones': 'GROUP 8: BIOACTIVE COMPOUNDS',
    
    // GROUP 9: MISCELLANEOUS
    'Other Compounds': 'GROUP 9: MISCELLANEOUS',
    'Organic Acids': 'GROUP 9: MISCELLANEOUS'
  };

  // Try to find category for the nutrient
  // This is a simplified version - in production, you'd want the full nutrient database
  const lowerName = nutrientName.toLowerCase();
  
  if (lowerName.includes('energy') || lowerName.includes('calorie')) {
    return 'GROUP 1: ENERGY & FOUNDATION';
  }
  if (lowerName.includes('protein') || lowerName.includes('carbohydrate') || lowerName.includes('fat') || lowerName.includes('lipid')) {
    return 'GROUP 2: MACRONUTRIENTS';
  }
  if (lowerName.includes('vitamin')) {
    return 'GROUP 3: VITAMINS';
  }
  if (lowerName.includes('calcium') || lowerName.includes('iron') || lowerName.includes('zinc') || 
      lowerName.includes('sodium') || lowerName.includes('potassium') || lowerName.includes('magnesium')) {
    return 'GROUP 4: MINERALS';
  }
  if (lowerName.includes('fiber') || lowerName.includes('sugar')) {
    return 'GROUP 5: CARBOHYDRATES';
  }
  if (lowerName.includes('fatty acid') || lowerName.includes('cholesterol')) {
    return 'GROUP 6: LIPIDS & FATS';
  }
  if (lowerName.includes('amino acid')) {
    return 'GROUP 7: PROTEINS';
  }
  if (lowerName.includes('carotenoid') || lowerName.includes('choline')) {
    return 'GROUP 8: BIOACTIVE COMPOUNDS';
  }
  
  return 'GROUP 9: MISCELLANEOUS';
};

// Group nutrients by category
export const groupNutrientsByCategory = (nutrients: Record<string, Nutrient>) => {
  const grouped: Record<string, Nutrient[]> = {};
  
  Object.values(nutrients).forEach(nutrient => {
    const group = getNutrientGroup(nutrient.name);
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(nutrient);
  });
  
  return grouped;
};

// Group order for displaying nutrients
export const NUTRIENT_GROUP_ORDER = [
  'GROUP 1: ENERGY & FOUNDATION',
  'GROUP 2: MACRONUTRIENTS',
  'GROUP 3: VITAMINS',
  'GROUP 4: MINERALS',
  'GROUP 5: CARBOHYDRATES',
  'GROUP 6: LIPIDS & FATS',
  'GROUP 7: PROTEINS',
  'GROUP 8: BIOACTIVE COMPOUNDS',
  'GROUP 9: MISCELLANEOUS'
];

// Format nutrient value for display
export const formatNutrientValue = (value: number, unit: string): string => {
  return `${Math.round(value)} ${unit.toUpperCase()}`;
};

// Calculate total nutrition from multiple foods
export const calculateTotalNutrition = (foods: any[]) => {
  const totals: Record<string, Nutrient> = {};
  
  foods.forEach(food => {
    Object.entries(food.allNutrients || {}).forEach(([key, nutrient]: [string, any]) => {
      if (!totals[key]) {
        totals[key] = {
          name: nutrient.name,
          value: 0,
          unit: nutrient.unit,
          category: nutrient.category
        };
      }
      totals[key].value += nutrient.value;
    });
  });
  
  return totals;
};
