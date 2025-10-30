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
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../constants/colors';
import { UserDetails, NutritionRecommendation } from '../types';
import { groupNutrientsByCategory, NUTRIENT_GROUP_ORDER, formatNutrientValue } from '../utils/nutrientUtils';

const RecommendScreen = () => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    weight: 48,
    height: 158,
    age: 27,
    gender: 'female',
    activityLevel: 'sedentary',
    goal: 'maintain',
  });
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateRecommendation = () => {
    if (!userDetails.weight || !userDetails.height || !userDetails.age) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr: number;
    if (userDetails.gender === 'male') {
      bmr = 10 * userDetails.weight + 6.25 * userDetails.height - 5 * userDetails.age + 5;
    } else {
      bmr = 10 * userDetails.weight + 6.25 * userDetails.height - 5 * userDetails.age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'athlete': 1.9,
    };

    const tdee = bmr * activityMultipliers[userDetails.activityLevel];

    // Adjust for goals
    let targetCalories = tdee;
    if (userDetails.goal === 'lose') {
      targetCalories = tdee * 0.8; // 20% deficit
    } else if (userDetails.goal === 'gain') {
      targetCalories = tdee * 1.1; // 10% surplus
    }

    // Calculate macros
    const protein = userDetails.weight * (userDetails.goal === 'gain' ? 2 : 1.6); // g per kg
    const fats = (targetCalories * 0.25) / 9; // 25% of calories from fat
    const carbs = (targetCalories - (protein * 4 + fats * 9)) / 4; // Remaining calories from carbs

    // Calculate micronutrients (based on RDA)
    const fiber = 25; // g
    const water = userDetails.weight * 35; // ml per kg
    const calcium = userDetails.gender === 'male' ? 1000 : 1200; // mg
    const iron = userDetails.gender === 'male' ? 8 : 18; // mg
    const vitaminC = 90; // mg
    const vitaminD = 15; // µg
    const sodium = 2300; // mg (max)
    const potassium = 3500; // mg

    const rec: NutritionRecommendation = {
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      fats: Math.round(fats),
      carbs: Math.round(carbs),
      fiber,
      water: Math.round(water),
      calcium,
      iron,
      vitaminC,
      vitaminD,
      sodium,
      potassium,
    };

    setTimeout(() => {
      setRecommendation(rec);
      setIsLoading(false);
    }, 500);
  };

  const renderRecommendation = () => {
    if (!recommendation) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Enter your details and click "Get Recommendation" to see personalized nutrition goals
          </Text>
        </View>
      );
    }

    const nutrients: Record<string, any> = {
      'energy': {
        name: 'Energy',
        value: recommendation.calories,
        unit: 'KCAL',
      },
      'protein': {
        name: 'Protein',
        value: recommendation.protein,
        unit: 'G',
      },
      'total lipid (fat)': {
        name: 'Total Lipid (Fat)',
        value: recommendation.fats,
        unit: 'G',
      },
      'carbohydrate, by difference': {
        name: 'Carbohydrate, By Difference',
        value: recommendation.carbs,
        unit: 'G',
      },
      'fiber, total dietary': {
        name: 'Fiber, Total Dietary',
        value: recommendation.fiber,
        unit: 'G',
      },
      'water': {
        name: 'Water',
        value: recommendation.water,
        unit: 'ML',
      },
      'calcium, ca': {
        name: 'Calcium, Ca',
        value: recommendation.calcium,
        unit: 'MG',
      },
      'iron, fe': {
        name: 'Iron, Fe',
        value: recommendation.iron,
        unit: 'MG',
      },
      'vitamin c, total ascorbic acid': {
        name: 'Vitamin C, Total Ascorbic Acid',
        value: recommendation.vitaminC,
        unit: 'MG',
      },
      'vitamin d (d2 + d3)': {
        name: 'Vitamin D (D2 + D3)',
        value: recommendation.vitaminD,
        unit: 'UG',
      },
      'sodium, na': {
        name: 'Sodium, Na',
        value: recommendation.sodium,
        unit: 'MG',
      },
      'potassium, k': {
        name: 'Potassium, K',
        value: recommendation.potassium,
        unit: 'MG',
      },
    };

    const groupedNutrients = groupNutrientsByCategory(nutrients);

    return (
      <View style={styles.recommendationContainer}>
        {NUTRIENT_GROUP_ORDER.map(groupName => {
          const groupNutrients = groupedNutrients[groupName];
          if (!groupNutrients || groupNutrients.length === 0) return null;

          return (
            <View key={groupName} style={styles.nutritionCategory}>
              <Text style={styles.categoryTitle}>{groupName}</Text>
              {groupNutrients.map((nutrient, idx) => (
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

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About Your Recommendation</Text>
          <Text style={styles.infoText}>
            These recommendations are calculated based on your age, weight, height, activity level, and goals.
            They represent general guidelines and may need to be adjusted based on your individual needs.
          </Text>
          <Text style={styles.infoText}>
            Consult with a healthcare professional or registered dietitian for personalized advice.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enter Your Details</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 70"
            keyboardType="numeric"
            value={userDetails.weight.toString()}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, weight: parseFloat(text) || 0 })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Height (cm) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 170"
            keyboardType="numeric"
            value={userDetails.height.toString()}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, height: parseFloat(text) || 0 })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 25"
            keyboardType="numeric"
            value={userDetails.age.toString()}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, age: parseFloat(text) || 0 })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userDetails.gender}
              onValueChange={(value: any) => setUserDetails({ ...userDetails, gender: value })}
              style={styles.picker}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>How active are you on an average day? *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userDetails.activityLevel}
              onValueChange={(value: any) => setUserDetails({ ...userDetails, activityLevel: value })}
              style={styles.picker}
            >
              <Picker.Item label="Sedentary" value="sedentary" />
              <Picker.Item label="Lightly Active" value="lightly-active" />
              <Picker.Item label="Moderately Active" value="moderately-active" />
              <Picker.Item label="Very Active" value="very-active" />
              <Picker.Item label="Athlete Level" value="athlete" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight Goal *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userDetails.goal}
              onValueChange={(value: any) => setUserDetails({ ...userDetails, goal: value })}
              style={styles.picker}
            >
              <Picker.Item label="Maintain Weight" value="maintain" />
              <Picker.Item label="Gain Weight" value="gain" />
              <Picker.Item label="Lose Weight" value="lose" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.recommendButton, isLoading && styles.recommendButtonDisabled]}
          onPress={calculateRecommendation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.recommendButtonText}>Get Recommendation</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition Recommendations</Text>
        {renderRecommendation()}
      </View>
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
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  recommendButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  recommendButtonDisabled: {
    opacity: 0.5,
  },
  recommendButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  recommendationContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: Colors.secondary,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutrientName: {
    fontSize: 14,
    color: Colors.textGray,
    flex: 1,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.recommended,
  },
  infoBox: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default RecommendScreen;
