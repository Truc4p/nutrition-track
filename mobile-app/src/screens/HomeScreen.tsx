import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { API_BASE_URL } from '../constants/api';
import { aiService } from '../services/api';
import { Food } from '../types';
import { groupNutrientsByCategory, NUTRIENT_GROUP_ORDER, formatNutrientValue } from '../utils/nutrientUtils';

const HomeScreen = () => {
  const [foodInput, setFoodInput] = useState('I ate 150g salmon, 100g rice, and 50g broccoli');
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedFoodIndex, setExpandedFoodIndex] = useState<number | null>(null);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      
      // Analyze the image
      try {
        setIsLoading(true);
        const response = await aiService.analyzeMealImage(
          result.assets[0].base64,
          result.assets[0].type || 'image/jpeg'
        );
        
        if (response.success && response.analysis) {
          setFoodInput(response.analysis);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to analyze image');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      
      // Analyze the image
      try {
        setIsLoading(true);
        const response = await aiService.analyzeMealImage(
          result.assets[0].base64,
          result.assets[0].type || 'image/jpeg'
        );
        
        if (response.success && response.analysis) {
          setFoodInput(response.analysis);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to analyze image');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!foodInput.trim()) return;

    setIsLoading(true);
    try {
      console.log('Sending request to API:', API_BASE_URL);
      console.log('Food input:', foodInput.trim());
      
      const response = await aiService.parseAndMatchFoods(foodInput.trim());
      
      console.log('API Response:', response);
      
      if (!response.success || !response.foods || response.foods.length === 0) {
        Alert.alert('No Results', 'No foods found in the text');
        setFoods([]);
        return;
      }

      const processedFoods: Food[] = [];

      for (const item of response.foods) {
        const usdaFood = item.usda_food;
        const quantity = item.quantity;
        const unit = item.unit;

        // Get detailed nutrition data
        const detailResponse = await fetch(`${API_BASE_URL}/api/usda/food/${usdaFood.fdcId}`);
        const detailData = await detailResponse.json();

        if (!detailData.success) continue;

        const detailedNutrition = detailData.food;
        const nutrients = detailedNutrition.foodNutrients || [];

        let fatsValue = 0;
        let carbsValue = 0;
        let proteinValue = 0;
        let fiberValue = 0;
        let totalCalories = 0;
        const allNutrients: Record<string, any> = {};

        nutrients.forEach((nutrient: any) => {
          if (!nutrient.amount || nutrient.amount === 0) return;

          const name = nutrient.nutrient.name.toLowerCase();
          const value = nutrient.amount;
          const unitName = nutrient.nutrient.unitName || '';

          if (name.includes('energy') && unitName.toLowerCase() === 'kcal') {
            totalCalories = value;
          } else if (name.includes('protein')) {
            proteinValue = value;
          } else if (name.includes('total lipid') || name.includes('fat')) {
            fatsValue = value;
          } else if (name.includes('carbohydrate, by difference')) {
            carbsValue = value;
          } else if (name.includes('fiber, total dietary')) {
            fiberValue = value;
          }

          if (value > 0) {
            const formattedName = nutrient.nutrient.name
              .replace(/,\s*/g, ', ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
              .trim();

            allNutrients[nutrient.nutrient.name.toLowerCase()] = {
              name: formattedName,
              value: value,
              unit: unitName.toUpperCase(),
            };
          }
        });

        const scalingFactor = quantity / 100;

        const foodObject: Food = {
          id: `usda_${usdaFood.fdcId}_${processedFoods.length}`,
          name: detailedNutrition.description,
          originalName: item.original_input.food_name,
          usdaDescription: detailedNutrition.description,
          fats: fatsValue * scalingFactor,
          carbohydrates: carbsValue * scalingFactor,
          protein: proteinValue * scalingFactor,
          fiber: fiberValue * scalingFactor,
          totalCalories: totalCalories * scalingFactor,
          quantity: quantity,
          measurementType: unit,
          allNutrients: Object.fromEntries(
            Object.entries(allNutrients).map(([key, nutrient]: [string, any]) => [
              key,
              {
                ...nutrient,
                value: nutrient.value * scalingFactor,
              },
            ])
          ),
        };

        processedFoods.push(foodObject);
      }

      setFoods(processedFoods);
    } catch (error: any) {
      console.error('Error processing text:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        config: error?.config?.url,
      });
      Alert.alert('Error', `Failed to process your input: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFoodExpansion = (index: number) => {
    setExpandedFoodIndex(expandedFoodIndex === index ? null : index);
  };

  const calculateTotals = () => {
    const totals: Record<string, any> = {};
    let totalEnergyKcal = 0;

    foods.forEach(food => {
      let foodEnergyKcal = 0;
      let hasEnergyNutrient = false;

      Object.values(food.allNutrients).forEach((nutrient: any) => {
        const name = nutrient.name.toLowerCase();
        const unit = nutrient.unit.toLowerCase();

        if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
          foodEnergyKcal = nutrient.value;
          hasEnergyNutrient = true;
          return;
        }

        if (name.includes('mufa') || name.includes('tfa') || name.includes('pufa') || name.includes('sfa')) {
          return;
        }

        const key = nutrient.name.toLowerCase();
        if (!totals[key]) {
          totals[key] = {
            name: nutrient.name,
            value: 0,
            unit: nutrient.unit,
          };
        }
        totals[key].value += nutrient.value;
      });

      if (!hasEnergyNutrient && food.totalCalories > 0) {
        foodEnergyKcal = food.totalCalories;
      }

      totalEnergyKcal += foodEnergyKcal;
    });

    if (totalEnergyKcal > 0) {
      totals['energy'] = {
        name: 'Energy',
        value: totalEnergyKcal,
        unit: 'KCAL',
      };
    }

    return totals;
  };

  const renderFoodItem = (food: Food, index: number) => {
    const isExpanded = expandedFoodIndex === index;
    const groupedNutrients = groupNutrientsByCategory(food.allNutrients);

    return (
      <TouchableOpacity
        key={food.id}
        style={styles.foodItem}
        onPress={() => toggleFoodExpansion(index)}
      >
        <View style={styles.foodHeader}>
          <View style={styles.foodTitleContainer}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodQuantity}>
              {food.quantity.toFixed(2)} {food.measurementType}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={Colors.primary}
          />
        </View>

        {isExpanded && (
          <View style={styles.foodNutrition}>
            {NUTRIENT_GROUP_ORDER.map(groupName => {
              const nutrients = groupedNutrients[groupName];
              if (!nutrients || nutrients.length === 0) return null;

              return (
                <View key={groupName} style={styles.nutritionCategory}>
                  <Text style={styles.categoryTitle}>{groupName}</Text>
                  {nutrients.map((nutrient, idx) => (
                    <View key={idx} style={styles.nutrientItem}>
                      <Text style={styles.nutrientName}>{nutrient.name}:</Text>
                      <Text style={styles.nutrientValue}>
                        {formatNutrientValue(nutrient.value, nutrient.unit)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTotals = () => {
    if (foods.length === 0) return null;

    const totals = calculateTotals();
    const groupedTotals = groupNutrientsByCategory(totals);

    return (
      <View style={styles.totalsSection}>
        <View style={styles.totalsFoodItem}>
          <View style={styles.foodHeader}>
            <View style={styles.foodTitleContainer}>
              <Text style={styles.foodName}>TOTAL NUTRITION</Text>
              <Text style={styles.foodQuantity}>
                {foods.length} item{foods.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.foodNutrition}>
            {NUTRIENT_GROUP_ORDER.map(groupName => {
              const nutrients = groupedTotals[groupName];
              if (!nutrients || nutrients.length === 0) return null;

              return (
                <View key={groupName} style={styles.nutritionCategory}>
                  <Text style={styles.categoryTitle}>{groupName}</Text>
                  {nutrients.map((nutrient, idx) => (
                    <View key={idx} style={styles.nutrientItem}>
                      <Text style={styles.nutrientName}>{nutrient.name}:</Text>
                      <Text style={styles.nutrientValue}>
                        {formatNutrientValue(nutrient.value, nutrient.unit)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What did you eat today?</Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 1 cup of rice and 100g chicken breast"
            multiline={true}
            value={foodInput}
            onChangeText={setFoodInput}
          />

          <View style={styles.imageSection}>
            <Text style={styles.imageSectionTitle}>Or upload a meal image:</Text>
            
            {selectedImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Ionicons name="close-circle" size={32} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                  <Ionicons name="images" size={24} color={Colors.white} />
                  <Text style={styles.imageButtonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={handleCameraCapture}>
                  <Ionicons name="camera" size={24} color={Colors.white} />
                  <Text style={styles.imageButtonText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!foodInput.trim() || isLoading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!foodInput.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>

          {foods.length > 0 && (
            <>
              <Text style={styles.resultsHeader}>Food's Nutrition</Text>
              {foods.map((food, index) => renderFoodItem(food, index))}
            </>
          )}
        </View>

        {renderTotals()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 10,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 25,
    gap: 8,
  },
  imageButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 10,
    marginBottom: 15,
  },
  foodItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodTitleContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  foodQuantity: {
    fontSize: 14,
    color: Colors.textLight,
  },
  foodNutrition: {
    marginTop: 15,
  },
  nutritionCategory: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: Colors.secondary,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  nutrientName: {
    fontSize: 14,
    color: Colors.textGray,
    flex: 1,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  totalsSection: {
    padding: 20,
    paddingTop: 0,
  },
  totalsFoodItem: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default HomeScreen;
