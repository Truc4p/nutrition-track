// DOM Elements
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');
const recommendButton = document.getElementById('recommend-button');
const recommendationText = document.getElementById('recommendation-text');

// Initialize these variables only when needed
let goal = '';
let healthCondition = '';
let recommendation = null;

// Helper function to get nutrient group from the 9-group structure
function getNutrientGroup(nutrientName) {
    // Try to get nutrient info from the database first
    let category = null;
    
    if (typeof window !== 'undefined' && window.NutrientDatabase) {
        const nutrientInfo = window.NutrientDatabase.getNutrientInfo(nutrientName);
        if (nutrientInfo && nutrientInfo.category) {
            category = nutrientInfo.category;
        }
    }
    
    // Fallback to NUTRIENT_DATABASE if available
    if (!category && typeof NUTRIENT_DATABASE !== 'undefined') {
        if (NUTRIENT_DATABASE[nutrientName]) {
            category = NUTRIENT_DATABASE[nutrientName].category;
        } else {
            // Try case-insensitive match
            const lowerNutrientName = nutrientName.toLowerCase();
            for (const [key, value] of Object.entries(NUTRIENT_DATABASE)) {
                if (key.toLowerCase() === lowerNutrientName) {
                    category = value.category;
                    break;
                }
            }
        }
    }
    
    // Map categories to the 9 major groups
    const categoryToGroup = {
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
    
    return categoryToGroup[category] || 'GROUP 9: MISCELLANEOUS';
}

document.addEventListener('DOMContentLoaded', () => {
    // State management event listeners
    window.addEventListener('savePageState', (event) => {
        if (event.detail.pageKey === 'recommend') {
            const weightField = document.getElementById('weight');
            const heightField = document.getElementById('height');
            const ageField = document.getElementById('age');
            const genderField = document.getElementById('gender');
            const activityField = document.getElementById('activity-level');
            const goalField = document.getElementById('goal');
            const healthConditionField = document.getElementById('health-condition');
            const recommendationField = document.getElementById('recommendation-text');
            
            const state = {
                recommendation: recommendation,
                goal: goal,
                healthCondition: healthCondition,
                recommendForm: {
                    weight: weightField ? weightField.value : '',
                    height: heightField ? heightField.value : '',
                    age: ageField ? ageField.value : '',
                    gender: genderField ? genderField.value : '',
                    activityLevel: activityField ? activityField.value : '',
                    goalValue: goalField ? goalField.value : '',
                    healthConditionValue: healthConditionField ? healthConditionField.value : '',
                    recommendationText: recommendationField ? recommendationField.innerHTML : ''
                }
            };
            
            event.detail.saveState('recommend', state);
        }
    });

    window.addEventListener('loadPageState', (event) => {
        if (event.detail.pageKey === 'recommend') {
            const state = event.detail.loadState('recommend');
            if (state) {
                // Restore other state
                if (state.recommendation) {
                    recommendation = state.recommendation;
                }
                
                if (state.goal) {
                    goal = state.goal;
                }
                
                if (state.healthCondition) {
                    healthCondition = state.healthCondition;
                }
                
                // Restore recommend form fields
                if (state.recommendForm) {
                    const form = state.recommendForm;
                    const weightField = document.getElementById('weight');
                    const heightField = document.getElementById('height');
                    const ageField = document.getElementById('age');
                    const genderField = document.getElementById('gender');
                    const activityField = document.getElementById('activity-level');
                    const goalField = document.getElementById('goal');
                    const healthConditionField = document.getElementById('health-condition');
                    const recommendationField = document.getElementById('recommendation-text');
                    
                    if (weightField && form.weight) weightField.value = form.weight;
                    if (heightField && form.height) heightField.value = form.height;
                    if (ageField && form.age) ageField.value = form.age;
                    if (genderField && form.gender) genderField.value = form.gender;
                    if (activityField && form.activityLevel) activityField.value = form.activityLevel;
                    if (goalField && form.goalValue) goalField.value = form.goalValue;
                    if (healthConditionField && form.healthConditionValue) healthConditionField.value = form.healthConditionValue;
                    if (recommendationField && form.recommendationText) {
                        recommendationField.innerHTML = form.recommendationText;
                        // Refresh nutrient tooltips after restoring recommendation content
                        if (window.nutrientTooltip) {
                            setTimeout(() => window.nutrientTooltip.refresh(), 100);
                        }
                    }
                }
            }
        }
    });
    
    // Listen for the clearPageInputs event to clear input fields when state is cleared
    window.addEventListener('clearPageInputs', () => {
        const weightField = document.getElementById('weight');
        const heightField = document.getElementById('height');
        const ageField = document.getElementById('age');
        const genderField = document.getElementById('gender');
        const activityField = document.getElementById('activity-level');
        const goalField = document.getElementById('goal');
        const healthConditionField = document.getElementById('health-condition');
        const recommendationField = document.getElementById('recommendation-text');
        
        if (weightField) weightField.value = '';
        if (heightField) heightField.value = '';
        if (ageField) ageField.value = '';
        if (genderField) genderField.value = 'female';  // Default option to match HTML
        if (activityField) activityField.value = 'sedentary';  // Default option
        if (goalField) goalField.value = 'maintain';  // Default option
        if (healthConditionField) healthConditionField.value = '';
        if (recommendationField) recommendationField.innerHTML = '';
        
        // Reset global variables
        recommendation = null;
        goal = '';
        healthCondition = '';
    });

    // Event listeners for recommendation page
    if (recommendButton) {
        recommendButton.addEventListener('click', async () => {
            // Get the current values when the button is clicked
            goal = document.getElementById('goal').value;
            healthCondition = document.getElementById('health-condition').value.trim();
            
            const weight = parseFloat(weightInput.value);
            const height = parseFloat(heightInput.value);
            const age = parseInt(ageInput.value, 10);
            const gender = document.getElementById('gender').value;
            const activityLevel = document.getElementById('activity-level').value;

            if (!weight || !height || !age || !gender || !activityLevel || !goal) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                // Update the global recommendation variable
                recommendation = calculateNutrition(weight, height, age, gender, activityLevel, healthCondition);

                // Add console.log to debug the recommendation variable
                console.log("Recommendation data:", recommendation);

                // Clear and rebuild recommendation section
                recommendationText.innerHTML = '';

                // Create a single list item for recommendations (same structure as totals)
                const recommendationListItem = document.createElement('div');
                recommendationListItem.className = 'recommendation-food-item';

                // No header for recommendations - start directly with nutrition categories

                // Organize recommendations by USDA categories from nutrient database
                const categories = {};

                // Add all nutrients to appropriate categories
                const nutrients = [
                    { name: 'Energy', value: recommendation.calories, unit: 'kcal' },
                    { name: 'Fatty acids, total saturated', value: recommendation.saturatedFat, unit: 'g' },
                    { name: 'Fatty acids, total trans', value: recommendation.transFat, unit: 'g' },
                    { name: 'Omega-3', value: recommendation.omega3, unit: 'g' },
                    { name: 'Omega-6', value: recommendation.omega6, unit: 'g' },
                    { name: 'Carbohydrate', value: `${Math.round(recommendation.carbs.min)} - ${Math.round(recommendation.carbs.max)}`, unit: 'g' },
                    { name: 'Protein', value: `${Math.round(recommendation.protein.min)} - ${Math.round(recommendation.protein.max)}`, unit: 'g' },
                    { name: 'Fiber, total dietary', value: recommendation.fiber, unit: 'g' },
                    { name: 'Water', value: recommendation.water, unit: 'g' },
                    { name: 'Cholesterol', value: recommendation.cholesterol, unit: 'mg' },
                    { name: 'Iron, Fe', value: recommendation.iron, unit: 'mg' },
                    { name: 'Sodium, Na', value: recommendation.sodium, unit: 'mg' },
                    { name: 'Potassium, K', value: recommendation.potassium, unit: 'mg' },
                    { name: 'Calcium, Ca', value: recommendation.calcium, unit: 'mg' },
                    { name: 'Magnesium, Mg', value: recommendation.magnesium, unit: 'mg' },
                    { name: 'Zinc, Zn', value: recommendation.zinc, unit: 'mg' },
                    { name: 'Copper, Cu', value: recommendation.copper, unit: 'mcg' },
                    { name: 'Manganese, Mn', value: recommendation.manganese, unit: 'mg' },
                    { name: 'Phosphorus, P', value: recommendation.phosphorus, unit: 'mg' },
                    { name: 'Selenium, Se', value: recommendation.selenium, unit: 'mcg' },
                    { name: 'Vitamin A, RAE', value: recommendation.vitaminA, unit: 'mcg RAE' },
                    { name: 'Vitamin B-6', value: recommendation.vitaminB6, unit: 'mg' },
                    { name: 'Vitamin B-12', value: recommendation.vitaminB12, unit: 'mcg' },
                    { name: 'Vitamin C, total ascorbic acid', value: recommendation.vitaminC, unit: 'mg' },
                    { name: 'Vitamin D (D2 + D3)', value: recommendation.vitaminD, unit: 'IU' },
                    { name: 'Vitamin E (alpha-tocopherol)', value: recommendation.vitaminE, unit: 'mg' },
                    { name: 'Vitamin K (phylloquinone)', value: recommendation.vitaminK, unit: 'mcg' },
                    { name: 'Folate, DFE', value: recommendation.folate, unit: 'mcg DFE' },
                    { name: 'Thiamin', value: recommendation.thiamin, unit: 'mg' },
                    { name: 'Riboflavin', value: recommendation.riboflavin, unit: 'mg' },
                    { name: 'Niacin', value: recommendation.niacin, unit: 'mg' },
                    { name: 'Choline, total', value: recommendation.choline, unit: 'mg' }
                ];

                nutrients.forEach(nutrient => {
                    const displayValue = typeof nutrient.value === 'string' ? nutrient.value : Math.round(nutrient.value);
                    const nutrientInfo = `
                        <div class="nutrition-total-item">
                            <span class="nutrient-name">${nutrient.name}:</span>
                            <span class="nutrient-value">${displayValue} ${nutrient.unit}</span>
                        </div>`;

                    const name = nutrient.name;
                    
                    // Get USDA category for this nutrient
                    const nutrientGroup = getNutrientGroup(name) || 'GROUP 9: MISCELLANEOUS';
                    
                    // Initialize category array if it doesn't exist
                    if (!categories[nutrientGroup]) {
                        categories[nutrientGroup] = [];
                    }
                    
                    categories[nutrientGroup].push(nutrientInfo);
                });

                // Create nutrition div with same structure as food items
                const nutritionDiv = document.createElement('div');
                nutritionDiv.className = 'food-nutrition';

                // Define the desired order of categories
                const categoryOrder = [
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

                // Display nutrients by category in the specified order
                categoryOrder.forEach(categoryName => {
                    if (categories[categoryName] && categories[categoryName].length > 0) {
                        const categoryDiv = document.createElement('div');
                        categoryDiv.className = 'nutrition-category';
                        
                        const categoryTitle = document.createElement('h4');
                        categoryTitle.className = 'category-title';
                        categoryTitle.textContent = categoryName;
                        categoryDiv.appendChild(categoryTitle);

                        categoryDiv.innerHTML += categories[categoryName].join('');
                        nutritionDiv.appendChild(categoryDiv);
                    }
                });

                recommendationListItem.appendChild(nutritionDiv);
                recommendationText.appendChild(recommendationListItem);

                // Refresh nutrient tooltips after adding recommendations
                if (window.nutrientTooltip) {
                    window.nutrientTooltip.refresh();
                }
            } catch (error) {
                console.error("Error calculating recommendation:", error);
                recommendationText.textContent = "Failed to calculate recommendation. Please try again.";
            }
        });
    }
});

function calculateNutrition(weight, height, age, gender, activityLevel, healthCondition) {
    // Mifflin-St Jeor Equation for BMR
    const bmr =
        gender === "male"
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity level multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        "lightly-active": 1.375,
        "moderately-active": 1.55,
        "very-active": 1.725,
        athlete: 1.9,
    };

    let calories = bmr * activityMultipliers[activityLevel];

    // Adjust calories based on goal
    if (goal === "lose") {
        calories -= 500; // Subtract 500 calories for weight loss
    } else if (goal === "gain") {
        calories += 500; // Add 500 calories for weight gain
    }

    // AMDR (Acceptable Macronutrient Distribution Ranges) for macronutrients
    const fats = {
        min: (calories * 0.2) / 9, // 20% of calories
        max: (calories * 0.35) / 9, // 35% of calories
    };
    const carbs = {
        min: (calories * 0.45) / 4, // 45% of calories
        max: (calories * 0.65) / 4, // 65% of calories
    };
    const protein = {
        min: (calories * 0.1) / 4, // 10% of calories
        max: (calories * 0.35) / 4, // 35% of calories
    };

    // RDA/AI for fiber and cholesterol
    let fiber;
    if (age >= 1 && age <= 3) {
        fiber = 14; // Children 1-3 years
    } else if (age >= 4 && age <= 8) {
        fiber = 18; // Children 4-8 years
    } else if (age >= 9 && age <= 13) {
        fiber = gender === "male" ? 24 : 20; // Boys 9-13: 24g, Girls 9-13: 20g
    } else if (age >= 14 && age <= 18) {
        fiber = gender === "male" ? 28 : 22; // Boys 14-18: 28g, Girls 14-18: 22g
    } else if (age >= 19 && age <= 50) {
        if (gender === "male") {
            fiber = 30; // Men 19-50: 30-38g
        } else {
            fiber = 25; // Women 19-50: 25g
        }
    } else {
        // Over 50
        fiber = gender === "male" ? 30 : 21; // Men >50: 30g, Women >50: 21g
    }

    // Water recommendation (total fluid intake from all sources)
    // Based on U.S. National Academies DRI guidelines
    let water = gender === "male" ? 3700 : 2700; // Milliliters/Grams per day

    // Cholesterol recommendation
    let cholesterol = 300; // General recommendation
    const conditions = ["heart disease", "diabetes"];
    if (conditions.some(condition => healthCondition.toLowerCase().includes(condition))) {
        cholesterol = 200; // Limit for individuals with heart disease or diabetes
    }

    // Calculate recommendations for additional nutrients

    // Fat breakdown recommendations
    const saturatedFat = calories * 0.1 / 9; // <10% of calories
    const transFat = 0; // As low as possible
    const omega3 = 1.6; // AI for adult males
    const omega6 = 17; // AI for adult males

    // Mineral recommendations based on age and gender
    let iron, calcium, magnesium, zinc, copper, manganese, phosphorus, selenium;

    // General recommendations
    sodium = 1500; // mg, general recommendation
    potassium = 4700; // mg, general recommendation

    // Iron recommendations (mg/day)
    if (gender === "male") {
        iron = 8; // Men
    } else {
        if (age >= 19 && age <= 50) {
            iron = 18; // Women 19-50
        } else {
            iron = 8; // Women >50
        }
    }

    // Calcium recommendations (mg/day)
    if (age >= 19 && age <= 50) {
        calcium = 1000;
    } else if (age >= 51 && age <= 70) {
        if (gender === "male") {
            calcium = 1000;
        } else {
            calcium = 1200; // Women >50
        }
    } else {
        calcium = 1200; // Both genders >70
    }

    // Magnesium recommendations (mg/day)
    if (gender === "male") {
        magnesium = age >= 31 ? 420 : 400;
    } else {
        magnesium = age >= 31 ? 320 : 310;
    }

    // Zinc recommendations (mg/day)
    if (gender === "male") {
        zinc = 11;
    } else {
        zinc = 8;
    }

    // Copper recommendations (mcg/day)
    copper = 900; // General adult recommendation

    // Manganese recommendations (mg/day)
    manganese = gender === "male" ? 2.3 : 1.8;

    // Phosphorus recommendations (mg/day)
    phosphorus = 700; // General adult recommendation

    // Selenium recommendations (mcg/day)
    selenium = 55; // General adult recommendation

    // Vitamin recommendations
    let vitaminA, vitaminB6, vitaminB12, vitaminC, vitaminD, vitaminE, vitaminK;
    let folate, thiamin, riboflavin, niacin, choline;

    // Vitamin A (mcg RAE/day)
    vitaminA = gender === "male" ? 900 : 700;

    // Vitamin B6 (mg/day)
    if (age >= 19 && age <= 50) {
        vitaminB6 = 1.3;
    } else {
        vitaminB6 = gender === "male" ? 1.7 : 1.5;
    }

    // Vitamin B12 (mcg/day)
    vitaminB12 = 2.4; // General adult recommendation

    // Vitamin C (mg/day)
    if (gender === "male") {
        vitaminC = 90;
    } else {
        vitaminC = 75;
    }

    // Vitamin D (IU/day)
    if (age >= 19 && age <= 70) {
        vitaminD = 600;
    } else {
        vitaminD = 800; // >70 years
    }

    // Vitamin E (mg/day)
    vitaminE = 15; // General adult recommendation

    // Vitamin K (mcg/day)
    vitaminK = gender === "male" ? 120 : 90;

    // Folate (mcg DFE/day)
    folate = 400; // General adult recommendation

    // Thiamin (mg/day)
    thiamin = gender === "male" ? 1.2 : 1.1;

    // Riboflavin (mg/day)
    riboflavin = gender === "male" ? 1.3 : 1.1;

    // Niacin (mg/day)
    niacin = gender === "male" ? 16 : 14;

    // Choline (mg/day)
    choline = gender === "male" ? 550 : 425;

    // Adjust recommendations based on activity level
    if (activityLevel === "very-active" || activityLevel === "athlete") {
        // Increase certain nutrients for very active individuals
        protein.min *= 1.2;
        protein.max *= 1.2;
        vitaminC *= 1.2;
        vitaminE *= 1.1;
        magnesium *= 1.1;
        zinc *= 1.1;
    }

    // Adjust for health conditions
    if (healthCondition && healthCondition.toLowerCase().includes("diabetes")) {
        // Adjust fiber for diabetes
        fiber *= 1.2;
        // Reduce simple carbs recommendation
        carbs.max *= 0.9;
    }

    // Adjust for water intake
    if (activityLevel === "very-active" || activityLevel === "athlete") {
        water *= 1.2;
    }

    return {
        calories,
        fats,
        carbs,
        protein,
        fiber,
        water,
        cholesterol,
        saturatedFat,
        transFat,
        omega3,
        omega6,
        iron,
        sodium,
        potassium,
        calcium,
        magnesium,
        zinc,
        copper,
        manganese,
        phosphorus,
        selenium,
        vitaminA,
        vitaminB6,
        vitaminB12,
        vitaminC,
        vitaminD,
        vitaminE,
        vitaminK,
        folate,
        thiamin,
        riboflavin,
        niacin,
        choline
    };
}

function formatValue(value) {
    return typeof value === 'number' ? Math.round(value) : value;
} 