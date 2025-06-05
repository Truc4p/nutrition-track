// --- DOM Elements ---
const foodInput = document.getElementById('food-input');
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const foodListContainer = document.getElementById('food-list');
const totalsSection = document.getElementById('totals-section');

const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');
const recommendButton = document.getElementById('recommend-button');
const recommendationText = document.getElementById('recommendation-text');

// Initialize these variables only when needed
let goal = '';
let healthCondition = '';

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for this page

    // Event listeners
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

                // Organize recommendations by category
                const categories = {
                    'Proximates': [],
                    'Minerals': [],
                    'Vitamins': [],
                    'Lipids': [],
                    'Protein': [],
                    'Carbohydrates': [],
                    'Other': []
                };

                // Add all nutrients to appropriate categories
                const nutrients = [
                    { name: 'Calories', value: recommendation.calories, unit: 'kcal' },
                    { name: 'Fats', value: `${formatValue(recommendation.fats.min)} - ${formatValue(recommendation.fats.max)}`, unit: 'g' },
                    { name: 'Carbohydrates', value: `${formatValue(recommendation.carbs.min)} - ${formatValue(recommendation.carbs.max)}`, unit: 'g' },
                    { name: 'Protein', value: `${formatValue(recommendation.protein.min)} - ${formatValue(recommendation.protein.max)}`, unit: 'g' },
                    { name: 'Fiber', value: recommendation.fiber, unit: 'g' },
                    { name: 'Cholesterol', value: recommendation.cholesterol, unit: 'mg' },
                    { name: 'Omega-3', value: recommendation.omega3, unit: 'g' },
                    { name: 'Omega-6', value: recommendation.omega6, unit: 'g' },
                    { name: 'Saturated Fat', value: recommendation.saturatedFat, unit: 'g' },
                    { name: 'Trans Fat', value: recommendation.transFat, unit: 'g' },
                    { name: 'Iron', value: recommendation.iron, unit: 'mg' },
                    { name: 'Sodium', value: recommendation.sodium, unit: 'mg' },
                    { name: 'Potassium', value: recommendation.potassium, unit: 'mg' },
                    { name: 'Calcium', value: recommendation.calcium, unit: 'mg' },
                    { name: 'Magnesium', value: recommendation.magnesium, unit: 'mg' },
                    { name: 'Zinc', value: recommendation.zinc, unit: 'mg' },
                    { name: 'Copper', value: recommendation.copper, unit: 'mcg' },
                    { name: 'Manganese', value: recommendation.manganese, unit: 'mg' },
                    { name: 'Phosphorus', value: recommendation.phosphorus, unit: 'mg' },
                    { name: 'Selenium', value: recommendation.selenium, unit: 'mcg' },
                    { name: 'Vitamin A', value: recommendation.vitaminA, unit: 'mcg RAE' },
                    { name: 'Vitamin B6', value: recommendation.vitaminB6, unit: 'mg' },
                    { name: 'Vitamin B12', value: recommendation.vitaminB12, unit: 'mcg' },
                    { name: 'Vitamin C', value: recommendation.vitaminC, unit: 'mg' },
                    { name: 'Vitamin D', value: recommendation.vitaminD, unit: 'IU' },
                    { name: 'Vitamin E', value: recommendation.vitaminE, unit: 'mg' },
                    { name: 'Vitamin K', value: recommendation.vitaminK, unit: 'mcg' },
                    { name: 'Folate', value: recommendation.folate, unit: 'mcg DFE' },
                    { name: 'Thiamin', value: recommendation.thiamin, unit: 'mg' },
                    { name: 'Riboflavin', value: recommendation.riboflavin, unit: 'mg' },
                    { name: 'Niacin', value: recommendation.niacin, unit: 'mg' },
                    { name: 'Choline', value: recommendation.choline, unit: 'mg' }
                ];

                nutrients.forEach(nutrient => {
                    const displayValue = typeof nutrient.value === 'string' ? nutrient.value : formatValue(nutrient.value);
                    const nutrientInfo = `
                        <div class="nutrition-total-item">
                            <span class="nutrient-name">${nutrient.name}:</span>
                            <span class="nutrient-value">${displayValue} ${nutrient.unit}</span>
                        </div>`;

                    const name = nutrient.name;
                    if (name.includes('Vitamin')) {
                        categories['Vitamins'].push(nutrientInfo);
                    } else if (name.includes('Iron') || name.includes('Calcium') || name.includes('Zinc') || 
                              name.includes('Magnesium') || name.includes('Potassium') || name.includes('Sodium') || 
                              name.includes('Phosphorus') || name.includes('Selenium') || name.includes('Copper') || 
                              name.includes('Manganese')) {
                        categories['Minerals'].push(nutrientInfo);
                    } else if (name.includes('Protein') || name.includes('Amino')) {
                        categories['Protein'].push(nutrientInfo);
                    } else if (name.includes('Carbohydrate') || name.includes('Fiber')) {
                        categories['Carbohydrates'].push(nutrientInfo);
                    } else if (name.includes('Fat') || name.includes('Fatty') || name.includes('Cholesterol') || 
                              name.includes('Omega')) {
                        categories['Lipids'].push(nutrientInfo);
                    } else if (name.includes('Calories')) {
                        categories['Proximates'].push(nutrientInfo);
                    } else {
                        categories['Other'].push(nutrientInfo);
                    }
                });

                // Create nutrition div with same structure as food items
                const nutritionDiv = document.createElement('div');
                nutritionDiv.className = 'food-nutrition';

                // Display nutrients by category using same structure as food items
                Object.entries(categories).forEach(([categoryName, nutrients]) => {
                    if (nutrients.length > 0) {
                        const categoryDiv = document.createElement('div');
                        categoryDiv.className = 'nutrition-category';
                        
                        const categoryTitle = document.createElement('h4');
                        categoryTitle.className = 'category-title';
                        categoryTitle.textContent = categoryName;
                        categoryDiv.appendChild(categoryTitle);

                        categoryDiv.innerHTML += nutrients.join('');
                        nutritionDiv.appendChild(categoryDiv);
                    }
                });

                recommendationListItem.appendChild(nutritionDiv);
                recommendationText.appendChild(recommendationListItem);
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

    const calories = bmr * activityMultipliers[activityLevel];

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
        } else if (gender === "female") {
            fiber = 25; // Women 19-50: 25-28g
        } else {
            fiber = 28; // Pregnancy: 25-28g, Lactation: 27-30g
        }
    } else if (age >= 51) {
        fiber = gender === "male" ? 30 : 21; // Men 51+: 30g, Women 51+: 21-25g
    } else {
        fiber = 0; // Default if age is not valid
    }

    // Cholesterol recommendation
    let cholesterol = 300; // General recommendation
    const conditions = ["heart disease", "diabetes"];
    if (conditions.some(condition => healthCondition.toLowerCase().includes(condition))) {
        cholesterol = 200; // Limit for individuals with heart disease or diabetes
    }
    
    // Calculate recommendations for additional nutrients
    
    // Fat breakdown recommendations
    const omega3 = gender === "male" ? 1.6 : 1.1; // g/day (ALA)
    const omega6 = gender === "male" ? 17 : 12; // g/day (Linoleic acid)
    const saturatedFat = (calories * 0.07) / 9; // Max 7% of calories for saturated fat
    const transFat = (calories * 0.01) / 9; // Max 1% of calories for trans fat
    
    // Mineral recommendations based on age and gender
    let iron, calcium, magnesium, zinc, copper, manganese, phosphorus, selenium;
    let sodium, potassium;
    
    // Sodium and Potassium
    sodium = 1500; // mg, general recommendation
    potassium = 4700; // mg, general recommendation
    
    // Iron recommendations (mg/day)
    if (age >= 19 && age <= 50) {
        iron = gender === "male" ? 8 : 18;
    } else if (age > 50) {
        iron = 8; // Both men and women over 50
    } else if (age >= 14 && age <= 18) {
        iron = gender === "male" ? 11 : 15;
    } else if (age >= 9 && age <= 13) {
        iron = 8;
    } else {
        iron = 10; // Default
    }
    
    // Calcium recommendations (mg/day)
    if (age >= 19 && age <= 50) {
        calcium = 1000;
    } else if (age > 50 && age <= 70) {
        calcium = gender === "male" ? 1000 : 1200;
    } else if (age > 70) {
        calcium = 1200;
    } else if (age >= 14 && age <= 18) {
        calcium = 1300;
    } else if (age >= 9 && age <= 13) {
        calcium = 1300;
    } else {
        calcium = 1000; // Default
    }
    
    // Magnesium recommendations (mg/day)
    if (age >= 19 && age <= 30) {
        magnesium = gender === "male" ? 400 : 310;
    } else if (age > 30) {
        magnesium = gender === "male" ? 420 : 320;
    } else if (age >= 14 && age <= 18) {
        magnesium = gender === "male" ? 410 : 360;
    } else {
        magnesium = 350; // Default
    }
    
    // Zinc recommendations (mg/day)
    if (age >= 19) {
        zinc = gender === "male" ? 11 : 8;
    } else if (age >= 14 && age <= 18) {
        zinc = gender === "male" ? 11 : 9;
    } else {
        zinc = 10; // Default
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
    } else if (age > 50) {
        vitaminB6 = gender === "male" ? 1.7 : 1.5;
    } else {
        vitaminB6 = 1.3; // Default
    }
    
    // Vitamin B12 (mcg/day)
    vitaminB12 = 2.4; // General adult recommendation
    
    // Vitamin C (mg/day)
    if (age >= 19) {
        vitaminC = gender === "male" ? 90 : 75;
        // Adjust for smokers
        if (healthCondition.toLowerCase().includes("smoke")) {
            vitaminC += 35; // Additional 35mg for smokers
        }
    } else if (age >= 14 && age <= 18) {
        vitaminC = gender === "male" ? 75 : 65;
    } else {
        vitaminC = 75; // Default
    }
    
    // Vitamin D (IU/day)
    if (age <= 70) {
        vitaminD = 600;
    } else {
        vitaminD = 800; // For adults over 70
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
    if (activityLevel === "moderately-active" || activityLevel === "very-active" || activityLevel === "athlete") {
        // Increase certain nutrients for active individuals
        vitaminC *= 1.2; // 20% increase
        iron *= 1.1; // 10% increase
        magnesium *= 1.1; // 10% increase
        zinc *= 1.1; // 10% increase
        potassium *= 1.1; // 10% increase
    }
    
    // Adjust recommendations based on health conditions
    if (healthCondition.toLowerCase().includes("diabetes")) {
        // For diabetes, reduce sodium and increase certain nutrients
        sodium = 1500; // Stricter sodium restriction
        magnesium *= 1.2; // 20% increase
        chromium = 200; // mcg/day, important for glucose metabolism
    }
    
    if (healthCondition.toLowerCase().includes("hypertension") || 
        healthCondition.toLowerCase().includes("high blood pressure")) {
        // For hypertension, reduce sodium and increase potassium
        sodium = 1500; // Stricter sodium restriction
        potassium *= 1.1; // 10% increase
    }
    
    return { 
        calories, 
        fats, 
        carbs, 
        protein, 
        fiber, 
        cholesterol,
        // Additional nutrients
        omega3,
        omega6,
        saturatedFat,
        transFat,
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

// --- State ---
let foods = [];
let isLoading = false;
let recommendation = null;
const API_URL = "http://127.0.0.1:8000/nlp/process_text_and_get_nutrition/";

// Add these variables at the top with other declarations
let selectedFood = null;
let addedFoods = [];

// --- Event Listeners ---
if (foodInput) {
    foodInput.addEventListener('input', handleInputChange);
}
if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
}

// --- Functions ---

// Enable/disable buttons based on input
function handleInputChange() {
    const isEmpty = foodInput.value.trim() === '';
    submitButton.disabled = isEmpty;
}

// Handle form submission
async function handleSubmit() {
    const inputText = foodInput.value.trim();
    if (!inputText) return;

    setLoading(true);
    await processText(inputText);
    setLoading(false);
    updateUI(); // Update UI after fetching
}

// Show/hide loading indicator
function setLoading(loading) {
    isLoading = loading;
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    submitButton.disabled = isLoading; // Disable submit while loading
}

// Fetch data from the backend API
async function processText(inputText) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Corresponds to NutritionResponse
        console.log('Backend response:', data); // Debug log

        // Process the result into the 'foods' array with all nutrients
        foods = data.result.map(ingredient => {
            const fatsValue = parseFloat(ingredient.total_fat) || 0.0;
            const carbsValue = parseFloat(ingredient.carbohydrates) || 0.0;
            const proteinValue = parseFloat(ingredient.protein) || 0.0;
            const fiberValue = parseFloat(ingredient.fiber) || 0.0;
            const cholesterolValue = parseFloat(ingredient.cholesterol) || 0.0;
            const quantityValue = parseFloat(ingredient.quantity) || 0.0;
            const conversion = parseFloat(ingredient.conversion_factor) || 1.0;

            // Get calories from all_nutrients if available, otherwise calculate
            let totalCalories = 0;
            if (ingredient.all_nutrients && ingredient.all_nutrients['energy']) {
                totalCalories = parseFloat(ingredient.all_nutrients['energy'].value) * conversion;
            } else {
                totalCalories = (fatsValue * 9 + carbsValue * 4 + proteinValue * 4) * conversion;
            }

            // Process all nutrients from all_nutrients field
            const allNutrients = {};
            if (ingredient.all_nutrients) {
                Object.entries(ingredient.all_nutrients).forEach(([key, nutrient]) => {
                    const value = parseFloat(nutrient.value) || 0;
                    if (value > 0) {
                        // Better formatting for nutrient names
                        let formattedName = key
                            .replace(/,\s*/g, ', ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        // Handle special cases
                        if (formattedName.toLowerCase().includes('vitamin')) {
                            formattedName = formattedName.replace(/Vitamin\s+(\w)/g, 'Vitamin $1');
                        }
                        if (formattedName.toLowerCase().includes('fatty acids')) {
                            formattedName = formattedName.replace(/Fatty Acids/gi, 'Fatty Acids');
                        }
                        
                        allNutrients[key] = {
                            name: formattedName,
                            value: value * conversion,
                            unit: nutrient.unit.toUpperCase(),
                            category: nutrient.category || 'other'
                        };
                    }
                });
            }

            return {
                id: ingredient.id,
                name: ingredient.name,
                fats: fatsValue * conversion,
                saturatedFats: (parseFloat(ingredient.saturated_fat) || 0.0) * conversion,
                carbohydrates: carbsValue * conversion,
                protein: proteinValue * conversion,
                fiber: fiberValue * conversion,
                cholesterol: cholesterolValue * conversion,
                totalCalories: totalCalories,
                quantity: quantityValue,
                measurementType: ingredient.measurement_type || '',
                allNutrients: allNutrients // Add all nutrients
            };
        });

    } catch (error) {
        console.error("Error fetching or processing nutrition data:", error);
        alert(`Failed to get nutrition data: ${error.message}`); // Inform user
        foods = []; // Clear data on error
    }
}

// Update the HTML based on the current state (foods array)
function updateUI() {
    // Clear previous list items
    foodListContainer.innerHTML = '';

    // Set header text
    resultsHeader.textContent = foods.length > 0 ? "Your Daily Nutrition" : "Foods";

    if (foods.length === 0) {
        totalsSection.style.display = 'none'; // Hide totals if no food
        return; // Nothing more to render
    }

    // --- Populate Food List ---
    foods.forEach(food => {
        const listItem = document.createElement('li');
        listItem.className = 'food-item';

        // Top: Food name and quantity as h3
        const headerDiv = document.createElement('div');
        headerDiv.className = 'food-header';
        const headerH3 = document.createElement('h3');
        headerH3.className = 'food-title';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'food-name2';
        nameSpan.textContent = food.name;
        
        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'food-quantity';
        quantitySpan.textContent = `${food.quantity.toFixed(2)} ${food.measurementType}`;
        
        headerH3.appendChild(nameSpan);
        headerH3.appendChild(quantitySpan);
        headerDiv.appendChild(headerH3);

        // All Nutrition Info organized by categories (same style as search.js)
        const nutritionDiv = document.createElement('div');
        nutritionDiv.className = 'food-nutrition';

        // Organize nutrients by category (using same categories as search.js)
        const categories = {
            'Proximates': [],
            'Minerals': [],
            'Vitamins': [],
            'Lipids': [],
            'Protein': [],
            'Carbohydrates': [],
            'Other': []
        };

        // Add basic nutrients first if not in allNutrients
        if (!food.allNutrients['energy']) {
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Calories:</span>
                    <span class="nutrient-value">${food.totalCalories.toFixed(2)} kcal</span>
                </div>`;
            categories['Proximates'].push(nutrientInfo);
        }

        // Organize all nutrients by category using same logic as search.js
        Object.values(food.allNutrients)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                if (nutrient.value <= 0) return;
                
                const name = nutrient.name;
                const value = nutrient.value;
                const unit = nutrient.unit.toLowerCase();
                const nutrientInfo = `
                    <div class="nutrition-total-item">
                        <span class="nutrient-name">${name}:</span>
                        <span class="nutrient-value">${value.toFixed(2)} ${unit}</span>
                    </div>`;

                if (name.includes('Vitamin')) {
                    categories['Vitamins'].push(nutrientInfo);
                } else if (name.includes('Mineral') || name.includes('Iron') || name.includes('Calcium') || 
                          name.includes('Zinc') || name.includes('Magnesium') || name.includes('Potassium') ||
                          name.includes('Sodium') || name.includes('Phosphorus')) {
                    categories['Minerals'].push(nutrientInfo);
                } else if (name.includes('Protein') || name.includes('Amino')) {
                    categories['Protein'].push(nutrientInfo);
                } else if (name.includes('Carbohydrate') || name.includes('Fiber') || name.includes('Sugar')) {
                    categories['Carbohydrates'].push(nutrientInfo);
                } else if (name.includes('Fat') || name.includes('Fatty') || name.includes('Cholesterol')) {
                    categories['Lipids'].push(nutrientInfo);
                } else if (name.includes('Energy') || name.includes('Water') || name.includes('Ash')) {
                    categories['Proximates'].push(nutrientInfo);
                } else {
                    categories['Other'].push(nutrientInfo);
                }
            });

        // Display nutrients by category using same structure as search.js
        Object.entries(categories).forEach(([categoryName, nutrients]) => {
            if (nutrients.length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'nutrition-category';
                
                const categoryTitle = document.createElement('h4');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = categoryName;
                categoryDiv.appendChild(categoryTitle);

                categoryDiv.innerHTML += nutrients.join('');
                nutritionDiv.appendChild(categoryDiv);
            }
        });

        listItem.appendChild(headerDiv);
        listItem.appendChild(nutritionDiv);
        foodListContainer.appendChild(listItem);
    });

    // --- Calculate and Display Comprehensive Totals ---
    calculateAndDisplayTotals();
}

// New function to calculate and display comprehensive totals
function calculateAndDisplayTotals() {
    // Calculate totals for all nutrients
    const nutritionTotals = {};

    foods.forEach(food => {
        // Add all nutrients from allNutrients
        Object.values(food.allNutrients).forEach(nutrient => {
            const key = nutrient.name.toLowerCase();
            if (!nutritionTotals[key]) {
                nutritionTotals[key] = {
                    name: nutrient.name,
                    value: 0,
                    unit: nutrient.unit,
                    category: nutrient.category
                };
            }
            nutritionTotals[key].value += nutrient.value;
        });

        // Add calories if not in allNutrients
        if (!nutritionTotals['energy'] && !nutritionTotals['calories']) {
            if (!nutritionTotals['calories']) {
                nutritionTotals['calories'] = {
                    name: 'Calories',
                    value: 0,
                    unit: 'KCAL',
                    category: 'macronutrient'
                };
            }
            nutritionTotals['calories'].value += food.totalCalories;
        }
    });

    // Clear and rebuild totals section
    totalsSection.innerHTML = '';

    // Create a single list item for totals (same structure as food-list)
    const totalListItem = document.createElement('div');
    totalListItem.className = 'total-food-item';

    // Create header similar to food items
    const headerDiv = document.createElement('div');
    headerDiv.className = 'food-header';
    const headerH3 = document.createElement('h3');
    headerH3.className = 'food-title';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'food-name2';
    nameSpan.textContent = 'TOTAL NUTRITION';
    
    const summarySpan = document.createElement('span');
    summarySpan.className = 'food-quantity';
    summarySpan.textContent = `${foods.length} item${foods.length !== 1 ? 's' : ''}`;
    
    headerH3.appendChild(nameSpan);
    headerH3.appendChild(summarySpan);
    headerDiv.appendChild(headerH3);

    // Organize totals by category (using same categories as food items)
    const categories = {
        'Proximates': [],
        'Minerals': [],
        'Vitamins': [],
        'Lipids': [],
        'Protein': [],
        'Carbohydrates': [],
        'Other': []
    };

    Object.values(nutritionTotals)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(nutrient => {
            if (nutrient.value <= 0) return;
            
            const name = nutrient.name;
            const value = nutrient.value;
            const unit = nutrient.unit.toLowerCase();
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">${name}:</span>
                    <span class="nutrient-value">${value.toFixed(2)} ${unit}</span>
                </div>`;

            if (name.includes('Vitamin')) {
                categories['Vitamins'].push(nutrientInfo);
            } else if (name.includes('Mineral') || name.includes('Iron') || name.includes('Calcium') || 
                      name.includes('Zinc') || name.includes('Magnesium') || name.includes('Potassium') ||
                      name.includes('Sodium') || name.includes('Phosphorus')) {
                categories['Minerals'].push(nutrientInfo);
            } else if (name.includes('Protein') || name.includes('Amino')) {
                categories['Protein'].push(nutrientInfo);
            } else if (name.includes('Carbohydrate') || name.includes('Fiber') || name.includes('Sugar')) {
                categories['Carbohydrates'].push(nutrientInfo);
            } else if (name.includes('Fat') || name.includes('Fatty') || name.includes('Cholesterol')) {
                categories['Lipids'].push(nutrientInfo);
            } else if (name.includes('Energy') || name.includes('Water') || name.includes('Ash') || name.includes('Calories')) {
                categories['Proximates'].push(nutrientInfo);
            } else {
                categories['Other'].push(nutrientInfo);
            }
        });

    // Create nutrition div with same structure as food items
    const nutritionDiv = document.createElement('div');
    nutritionDiv.className = 'food-nutrition';

    // Display nutrients by category using same structure as food items
    Object.entries(categories).forEach(([categoryName, nutrients]) => {
        if (nutrients.length > 0) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'nutrition-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = categoryName;
            categoryDiv.appendChild(categoryTitle);

            categoryDiv.innerHTML += nutrients.join('');
            nutritionDiv.appendChild(categoryDiv);
        }
    });

    totalListItem.appendChild(headerDiv);
    totalListItem.appendChild(nutritionDiv);
    totalsSection.appendChild(totalListItem);

    totalsSection.style.display = 'block'; // Show totals
}

// Utility function to format values
function formatValue(value) {
    const roundedValue = parseFloat(value.toFixed(2));
    return roundedValue % 1 === 0 ? roundedValue.toFixed(0) : roundedValue.toFixed(2);
}

function addSelectedFood() {
    if (!selectedFood) {
        alert('Please select a food first');
        return;
    }

    const quantity = parseFloat(document.getElementById('food-quantity').value);
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }

    // Add food with its nutrients and quantity
    const foodWithQuantity = {
        ...selectedFood,
        quantity: quantity,
        id: Date.now() // Unique ID for removal
    };

    addedFoods.push(foodWithQuantity);
    updateAddedFoodsList();
    calculateTotalNutrition();
}

function updateAddedFoodsList() {
    const addedFoodsList = document.getElementById('added-foods-list');
    addedFoodsList.innerHTML = '';

    addedFoods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'added-food-item';
        
        foodItem.innerHTML = `
            <div class="food-item-details">
                <div class="food-item-name">${food.description}</div>
                <div class="food-item-quantity">${food.quantity}g</div>
            </div>
            <button class="remove-food" onclick="removeFood(${food.id})">Remove</button>
        `;
        
        addedFoodsList.appendChild(foodItem);
    });
}

function removeFood(foodId) {
    addedFoods = addedFoods.filter(food => food.id !== foodId);
    updateAddedFoodsList();
    calculateTotalNutrition();
}

function clearAddedFoods() {
    addedFoods = [];
    updateAddedFoodsList();
    calculateTotalNutrition();
}

function calculateTotalNutrition() {
    const nutritionTotals = {};

    addedFoods.forEach(food => {
        const multiplier = food.quantity / 100; // Convert to proportion of 100g
        food.foodNutrients.forEach(nutrient => {
            if (nutrient.value && nutrient.value !== 0) {
                const key = `${nutrient.nutrientName}_${nutrient.unitName}`;
                if (!nutritionTotals[key]) {
                    nutritionTotals[key] = {
                        name: nutrient.nutrientName,
                        value: 0,
                        unit: nutrient.unitName
                    };
                }
                nutritionTotals[key].value += nutrient.value * multiplier;
            }
        });
    });

    displayTotalNutrition(nutritionTotals);
}

function displayTotalNutrition(totals) {
    const nutritionTotalsDiv = document.getElementById('nutrition-totals');
    nutritionTotalsDiv.innerHTML = '';

    // Sort nutrients by name
    const sortedTotals = Object.values(totals).sort((a, b) => 
        a.name.localeCompare(b.name)
    );

    sortedTotals.forEach(nutrient => {
        const totalItem = document.createElement('div');
        totalItem.className = 'nutrition-total-item';
        totalItem.innerHTML = `
            <span>${nutrient.name}:</span>
            <span>${nutrient.value.toFixed(2)} ${nutrient.unit.toLowerCase()}</span>
        `;
        nutritionTotalsDiv.appendChild(totalItem);
    });
}
// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)
