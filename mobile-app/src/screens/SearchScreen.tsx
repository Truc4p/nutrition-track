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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { usdaService } from '../services/api';
import { USDAFood } from '../types';
import { groupNutrientsByCategory, NUTRIENT_GROUP_ORDER, formatNutrientValue } from '../utils/nutrientUtils';

const SearchScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<USDAFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [foodQuantity, setFoodQuantity] = useState('100');
  const [addedFoods, setAddedFoods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await usdaService.search(searchInput.trim(), 20);
      
      if (response.success && response.foods) {
        // Filter for Foundation, SR Legacy, and Survey data types
        const allowedTypes = ['Foundation', 'SR Legacy', 'Survey (FNDDS)'];
        const filtered = response.foods.filter((food: any) => 
          allowedTypes.includes(food.dataType)
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search foods');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFood = async (food: USDAFood) => {
    setSelectedFood(food);
    setSearchResults([]);
  };

  const addFood = () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food first');
      return;
    }

    const quantity = parseFloat(foodQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const scalingFactor = quantity / 100;
    const nutrients: Record<string, any> = {};

    selectedFood.foodNutrients.forEach(nutrient => {
      if (nutrient.value > 0) {
        const formattedName = nutrient.nutrientName
          .replace(/,\s*/g, ', ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
          .trim();

        nutrients[nutrient.nutrientName.toLowerCase()] = {
          name: formattedName,
          value: nutrient.value * scalingFactor,
          unit: nutrient.unitName.toUpperCase(),
        };
      }
    });

    const newFood = {
      id: `food_${Date.now()}`,
      name: selectedFood.description,
      quantity,
      allNutrients: nutrients,
    };

    setAddedFoods([...addedFoods, newFood]);
    Alert.alert('Success', 'Food added to your list!');
  };

  const removeFood = (id: string) => {
    setAddedFoods(addedFoods.filter(food => food.id !== id));
  };

  const clearAllFoods = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to remove all foods?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setAddedFoods([]) },
      ]
    );
  };

  const calculateTotals = () => {
    const totals: Record<string, any> = {};

    addedFoods.forEach(food => {
      Object.values(food.allNutrients).forEach((nutrient: any) => {
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
    });

    return totals;
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;

    return (
      <View style={styles.searchResults}>
        <ScrollView style={styles.searchResultsScroll}>
          {searchResults.map((food) => {
            const calories = food.foodNutrients.find(n =>
              n.nutrientName.toLowerCase().includes('energy')
            )?.value || 0;

            return (
              <TouchableOpacity
                key={food.fdcId}
                style={styles.searchResultItem}
                onPress={() => selectFood(food)}
              >
                <Text style={styles.resultFoodName}>{food.description}</Text>
                <Text style={styles.resultCalories}>{Math.round(calories)} kcal/100g</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderFoodDetails = () => {
    if (!selectedFood) return null;

    const groupedNutrients = groupNutrientsByCategory(
      Object.fromEntries(
        selectedFood.foodNutrients.map(n => [
          n.nutrientName.toLowerCase(),
          {
            name: n.nutrientName,
            value: n.value,
            unit: n.unitName,
          },
        ])
      )
    );

    return (
      <View style={styles.foodDetails}>
        <View style={styles.foodDetailsHeader}>
          <Text style={styles.selectedFoodName}>{selectedFood.description}</Text>
          <Text style={styles.perServing}>per 100g</Text>
        </View>

        <View style={styles.foodActions}>
          <TextInput
            style={styles.quantityInput}
            placeholder="Quantity (g)"
            keyboardType="numeric"
            value={foodQuantity}
            onChangeText={setFoodQuantity}
          />
          <TouchableOpacity style={styles.addButton} onPress={addFood}>
            <Text style={styles.addButtonText}>Add Food</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.nutrientsScroll}>
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
        </ScrollView>
      </View>
    );
  };

  const renderAddedFoods = () => {
    if (addedFoods.length === 0) return null;

    const totals = calculateTotals();
    const groupedTotals = groupNutrientsByCategory(totals);

    return (
      <View style={styles.addedFoodsSection}>
        <View style={styles.addedFoodsHeader}>
          <Text style={styles.sectionTitle}>Added Foods</Text>
          <TouchableOpacity onPress={clearAllFoods} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {addedFoods.map((food) => (
          <View key={food.id} style={styles.addedFoodItem}>
            <View style={styles.addedFoodInfo}>
              <Text style={styles.addedFoodName}>{food.name}</Text>
              <Text style={styles.addedFoodQuantity}>{food.quantity}g</Text>
            </View>
            <TouchableOpacity onPress={() => removeFood(food.id)}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Total Nutrition</Text>
        <View style={styles.totalsContainer}>
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
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Foods</Text>
        
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a food (e.g., apple, chicken)"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Ionicons name="search" size={24} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {renderSearchResults()}
        {renderFoodDetails()}
      </View>

      {renderAddedFoods()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  searchBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 54,
  },
  searchResults: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    maxHeight: 300,
    marginBottom: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultsScroll: {
    maxHeight: 300,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultFoodName: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 4,
  },
  resultCalories: {
    fontSize: 14,
    color: Colors.textLight,
  },
  foodDetails: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodDetailsHeader: {
    marginBottom: 15,
  },
  selectedFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  perServing: {
    fontSize: 14,
    color: Colors.textLight,
  },
  foodActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  nutrientsScroll: {
    maxHeight: 400,
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
  addedFoodsSection: {
    padding: 20,
    paddingTop: 0,
  },
  addedFoodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.errorBg,
    padding: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  addedFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  addedFoodInfo: {
    flex: 1,
  },
  addedFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  addedFoodQuantity: {
    fontSize: 14,
    color: Colors.textLight,
  },
  totalsContainer: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 15,
  },
});

export default SearchScreen;
