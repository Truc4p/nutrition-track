// --- DOM Elements ---
const foodInput = document.getElementById('food-input');
const submitButton = document.getElementById('submit-button');
const resetButton = document.getElementById('reset-button');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const foodListContainer = document.getElementById('food-list');
const totalsSection = document.getElementById('totals-section');
const totalFatsSpan = document.getElementById('total-fats');
const totalCarbsSpan = document.getElementById('total-carbs');
const totalProteinSpan = document.getElementById('total-protein');
const totalFiberSpan = document.getElementById('total-fiber');
const totalCholesterolSpan = document.getElementById('total-cholesterol');
const totalCaloriesSpan = document.getElementById('total-calories');

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

                // Create tabs for different nutrient categories
                recommendationText.innerHTML = `
                    <div class="recommendation-tabs">
                        <button class="tab-button active" data-tab="macros">Macronutrients</button>
                        <button class="tab-button" data-tab="fats">Fats</button>
                        <button class="tab-button" data-tab="minerals">Minerals</button>
                        <button class="tab-button" data-tab="vitamins">Vitamins</button>
                    </div>
                    
                    <div class="tab-content" id="macros-tab" style="display: block;">
                        <div class="nutrient-item">
                            <span class="nutrient-name">Calories:</span>
                            <span class="nutrient-value">${formatValue(recommendation.calories)} kcal</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Fats:</span>
                            <span class="nutrient-value">${formatValue(recommendation.fats.min)}g - ${formatValue(recommendation.fats.max)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Carbs:</span>
                            <span class="nutrient-value">${formatValue(recommendation.carbs.min)}g - ${formatValue(recommendation.carbs.max)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Protein:</span>
                            <span class="nutrient-value">${formatValue(recommendation.protein.min)}g - ${formatValue(recommendation.protein.max)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Fiber:</span>
                            <span class="nutrient-value">${formatValue(recommendation.fiber)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Cholesterol:</span>
                            <span class="nutrient-value">${formatValue(recommendation.cholesterol)}mg</span>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="fats-tab" style="display: none;">
                        <div class="nutrient-item">
                            <span class="nutrient-name">Omega-3:</span>
                            <span class="nutrient-value">${formatValue(recommendation.omega3)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Omega-6:</span>
                            <span class="nutrient-value">${formatValue(recommendation.omega6)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Saturated Fat:</span>
                            <span class="nutrient-value">${formatValue(recommendation.saturatedFat)}g</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Trans Fat:</span>
                            <span class="nutrient-value">${formatValue(recommendation.transFat)}g</span>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="minerals-tab" style="display: none;">
                        <div class="nutrient-item">
                            <span class="nutrient-name">Iron:</span>
                            <span class="nutrient-value">${formatValue(recommendation.iron)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Sodium:</span>
                            <span class="nutrient-value">${formatValue(recommendation.sodium)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Potassium:</span>
                            <span class="nutrient-value">${formatValue(recommendation.potassium)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Calcium:</span>
                            <span class="nutrient-value">${formatValue(recommendation.calcium)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Magnesium:</span>
                            <span class="nutrient-value">${formatValue(recommendation.magnesium)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Zinc:</span>
                            <span class="nutrient-value">${formatValue(recommendation.zinc)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Copper:</span>
                            <span class="nutrient-value">${formatValue(recommendation.copper)}mcg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Manganese:</span>
                            <span class="nutrient-value">${formatValue(recommendation.manganese)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Phosphorus:</span>
                            <span class="nutrient-value">${formatValue(recommendation.phosphorus)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Selenium:</span>
                            <span class="nutrient-value">${formatValue(recommendation.selenium)}mcg</span>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="vitamins-tab" style="display: none;">
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin A:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminA)}mcg RAE</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin B6:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminB6)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin B12:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminB12)}mcg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin C:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminC)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin D:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminD)}IU</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin E:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminE)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamin K:</span>
                            <span class="nutrient-value">${formatValue(recommendation.vitaminK)}mcg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Folate:</span>
                            <span class="nutrient-value">${formatValue(recommendation.folate)}mcg DFE</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Thiamin:</span>
                            <span class="nutrient-value">${formatValue(recommendation.thiamin)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Riboflavin:</span>
                            <span class="nutrient-value">${formatValue(recommendation.riboflavin)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Niacin:</span>
                            <span class="nutrient-value">${formatValue(recommendation.niacin)}mg</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Choline:</span>
                            <span class="nutrient-value">${formatValue(recommendation.choline)}mg</span>
                        </div>
                    </div>
                `;

                renderRecommendedNutritionChart();
                
                // Show the chart container
                document.getElementById('chart-container').style.display = 'block';
                
                // Add event listeners for tab buttons
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.addEventListener('click', () => {
                        // Remove active class from all buttons
                        document.querySelectorAll('.tab-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        
                        // Add active class to clicked button
                        button.classList.add('active');
                        
                        // Hide all tab content
                        document.querySelectorAll('.tab-content').forEach(content => {
                            content.style.display = 'none';
                        });
                        
                        // Show selected tab content
                        const tabId = button.getAttribute('data-tab');
                        document.getElementById(`${tabId}-tab`).style.display = 'block';
                    });
                });
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
if (resetButton) {
    resetButton.addEventListener('click', handleReset);
}

// --- Functions ---

// Enable/disable buttons based on input
function handleInputChange() {
    const isEmpty = foodInput.value.trim() === '';
    submitButton.disabled = isEmpty;
    resetButton.disabled = isEmpty;
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

// Handle reset button click
function handleReset() {
    foodInput.value = '';
    foods = [];
    handleInputChange(); // Update button states
    updateUI(); // Clear results
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

        // Process the result into the 'foods' array (similar to your ViewModel mapping)
        foods = data.result.map(ingredient => {
            const fatsValue = parseFloat(ingredient.total_fat) || 0.0;
            const carbsValue = parseFloat(ingredient.carbohydrates) || 0.0;
            const proteinValue = parseFloat(ingredient.protein) || 0.0;
            const fiberValue = parseFloat(ingredient.fiber) || 0.0;
            const cholesterolValue = parseFloat(ingredient.cholesterol) || 0.0;
            const quantityValue = parseFloat(ingredient.quantity) || 0.0;
            const conversion = parseFloat(ingredient.conversion_factor) || 1.0;

            // Calculate total calories based on macros * conversion
            const totalCalories = (fatsValue * 9 + carbsValue * 4 + proteinValue * 4) * conversion;

            return {
                id: ingredient.id,
                name: ingredient.name,
                fats: fatsValue * conversion,
                saturatedFats: (parseFloat(ingredient.saturated_fat) || 0.0) * conversion, // Keep if needed later
                carbohydrates: carbsValue * conversion,
                protein: proteinValue * conversion,
                fiber: fiberValue * conversion,
                cholesterol: cholesterolValue * conversion,
                totalCalories: totalCalories,
                quantity: quantityValue,
                measurementType: ingredient.measurement_type || '' // Handle potential null/undefined
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
        document.getElementById('nutrition-chart-container').style.display = 'none'; // Hide chart if no food
        return; // Nothing more to render
    }

    // --- Populate Food List ---
    foods.forEach(food => {
        const listItem = document.createElement('li');

        // Left side: Name and Quantity
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'food-details';
        const nameP = document.createElement('div'); // Use div for block display
        nameP.className = 'food-name';
        nameP.textContent = food.name;
        const quantityP = document.createElement('div'); // Use div for block display
        quantityP.className = 'food-quantity';
        quantityP.textContent = `${food.quantity.toFixed(2)} ${food.measurementType}`;
        detailsDiv.appendChild(nameP);
        detailsDiv.appendChild(quantityP);

        // Right side: Nutrition Info
        const nutritionDiv = document.createElement('div');
        nutritionDiv.className = 'food-nutrition';

        // Helper to add nutrient if > 0
        const addNutrient = (label, value) => {
            if (value > 0) {
                const span = document.createElement('span');
                span.textContent = `${label}: ${value.toFixed(2)}`;
                nutritionDiv.appendChild(span);
            }
        };

        addNutrient('Fats', food.fats);
        addNutrient('Carbs', food.carbohydrates);
        addNutrient('Protein', food.protein);
        addNutrient('Fiber', food.fiber);
        addNutrient('Cholesterol', food.cholesterol);
        addNutrient('Calories', food.totalCalories); // Add calories per item

        listItem.appendChild(detailsDiv);
        listItem.appendChild(nutritionDiv);
        foodListContainer.appendChild(listItem);
    });

    // --- Calculate and Display Totals ---
    const totalFats = foods.reduce((sum, food) => sum + food.fats, 0);
    const totalCarbs = foods.reduce((sum, food) => sum + food.carbohydrates, 0);
    const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
    const totalFiber = foods.reduce((sum, food) => sum + food.fiber, 0);
    const totalCholesterol = foods.reduce((sum, food) => sum + food.cholesterol, 0);
    const totalCalories = foods.reduce((sum, food) => sum + food.totalCalories, 0);

    totalFatsSpan.textContent = totalFats.toFixed(2);
    totalCarbsSpan.textContent = totalCarbs.toFixed(2);
    totalProteinSpan.textContent = totalProtein.toFixed(2);
    totalFiberSpan.textContent = totalFiber.toFixed(2);
    totalCholesterolSpan.textContent = totalCholesterol.toFixed(2);
    totalCaloriesSpan.textContent = totalCalories.toFixed(2);

    totalsSection.style.display = 'block'; // Show totals

    // Show the nutrition chart container
    document.getElementById('nutrition-chart-container').style.display = 'block';

    // --- Render Chart ---
    const chartElement = document.getElementById('nutrition-chart');
    if (!chartElement) {
        console.error('Chart element with ID "nutrition-chart" not found');
        return;
    }
    
    const ctx = chartElement.getContext('2d');
    const chartData = {
        labels: ['Fats', 'Carbs', 'Protein', 'Fiber', 'Cholesterol', 'Calories'],
        datasets: [
            {
                label: 'Nutrition Totals',
                data: [totalFats, totalCarbs, totalProtein, totalFiber, totalCholesterol, totalCalories],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // Fats
                    'rgba(54, 162, 235, 0.2)', // Carbs
                    'rgba(75, 192, 192, 0.2)', // Protein
                    'rgba(153, 102, 255, 0.2)', // Fiber
                    'rgba(255, 159, 64, 0.2)', // Cholesterol
                    'rgba(255, 206, 86, 0.2)'  // Calories
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            },
        ]
    };

    const chartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                enabled: true // Keep tooltips enabled
            },
            datalabels: {
                display: true,
                color: 'black',
                font: {
                    weight: 'bold'
                },
                formatter: (value) => value.toFixed(2) // Format the value if needed
            }
        }
    };

    // Add this plugin to render values on top of bars
    Chart.register({
        id: 'value-on-top',
        afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];
                    const roundedValue = parseFloat(value.toFixed(2)); // Round to 2 decimal places
                    if (roundedValue !== 0) { // Only show if not 0.00
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(roundedValue, bar.x, bar.y - 5); // Position the text above the bar
                    }
                });
            });
        }
    });

    // Destroy existing chart instance if it exists
    if (window.nutritionChart) {
        window.nutritionChart.destroy();
    }

    // Create new chart instance
    window.nutritionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

function renderRecommendedNutritionChart() {
    if (!recommendation) return;
    
    // Check if the chart element exists
    const chartElement = document.getElementById('recommended-nutrition-chart');
    if (!chartElement) {
        console.error('Chart element with ID "recommended-nutrition-chart" not found');
        return;
    }
    
    const ctx = chartElement.getContext('2d');
    
    // Create a dropdown to select which nutrient category to display
    const chartContainer = document.getElementById('chart-container');
    
    // Check if the dropdown already exists
    let chartCategorySelect = document.getElementById('chart-category-select');
    if (!chartCategorySelect) {
        // Create the dropdown if it doesn't exist
        const selectContainer = document.createElement('div');
        selectContainer.className = 'chart-select-container';
        selectContainer.innerHTML = `
            <label for="chart-category-select">Select nutrient category to display:</label>
            <select id="chart-category-select">
                <option value="macros" selected>Macronutrients</option>
                <option value="fats">Fats</option>
                <option value="minerals">Minerals</option>
                <option value="vitamins">Vitamins</option>
            </select>
        `;
        
        // Insert the dropdown before the chart-wrapper
        const chartWrapper = chartContainer.querySelector('.chart-wrapper');
        if (chartWrapper) {
            chartContainer.insertBefore(selectContainer, chartWrapper);
        } else {
            // Fallback: append to container if wrapper not found
            chartContainer.appendChild(selectContainer);
        }
        
        // Get the newly created dropdown
        chartCategorySelect = document.getElementById('chart-category-select');
    }
    
    // Define chart data for different categories
    const chartCategories = {
        macros: {
            labels: ['Calories (kcal)', 'Fats (g)', 'Carbs (g)', 'Protein (g)', 'Fiber (g)', 'Cholesterol (mg)'],
            values: [
                recommendation.calories,
                (recommendation.fats.min + recommendation.fats.max) / 2, // Average of min and max
                (recommendation.carbs.min + recommendation.carbs.max) / 2, // Average of min and max
                (recommendation.protein.min + recommendation.protein.max) / 2, // Average of min and max
                recommendation.fiber,
                recommendation.cholesterol
            ]
        },
        fats: {
            labels: ['Omega-3 (g)', 'Omega-6 (g)', 'Saturated Fat (g)', 'Trans Fat (g)'],
            values: [
                recommendation.omega3,
                recommendation.omega6,
                recommendation.saturatedFat,
                recommendation.transFat
            ]
        },
        minerals: {
            labels: ['Iron (mg)', 'Sodium (mg)', 'Potassium (mg)', 'Calcium (mg)', 'Magnesium (mg)', 'Zinc (mg)', 'Phosphorus (mg)'],
            values: [
                recommendation.iron,
                recommendation.sodium / 100, // Scaled down for better visualization
                recommendation.potassium / 100, // Scaled down for better visualization
                recommendation.calcium / 10, // Scaled down for better visualization
                recommendation.magnesium,
                recommendation.zinc,
                recommendation.phosphorus / 10 // Scaled down for better visualization
            ]
        },
        vitamins: {
            labels: ['Vitamin A (mcg)', 'Vitamin B6 (mg)', 'Vitamin B12 (mcg)', 'Vitamin C (mg)', 'Vitamin D (IU)', 'Vitamin E (mg)', 'Folate (mcg)'],
            values: [
                recommendation.vitaminA / 10, // Scaled down for better visualization
                recommendation.vitaminB6,
                recommendation.vitaminB12,
                recommendation.vitaminC,
                recommendation.vitaminD / 10, // Scaled down for better visualization
                recommendation.vitaminE,
                recommendation.folate / 10 // Scaled down for better visualization
            ]
        }
    };
    
    // Get the selected category
    const selectedCategory = chartCategorySelect.value;
    
    // Prepare data for chart based on selected category
    const labels = chartCategories[selectedCategory].labels;
    const values = chartCategories[selectedCategory].values;
    
    // Define colors - generate enough colors for all categories
    const generateColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 137.5) % 360; // Use golden angle approximation for even distribution
            colors.push(`hsla(${hue}, 70%, 60%, 0.2)`);
        }
        return colors;
    };
    
    const generateBorderColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 137.5) % 360;
            colors.push(`hsla(${hue}, 70%, 50%, 1)`);
        }
        return colors;
    };
    
    const backgroundColors = generateColors(labels.length);
    const borderColors = generateBorderColors(labels.length);
    
    // Prepare chart data
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Recommended Daily Intake',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
        }]
    };
    
    // Chart options
    const chartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += renderRecommendedNutritionChart.formatter(context.parsed.y);
                            
                            // Add scaling note for scaled values
                            const nutrientLabel = labels[context.dataIndex].toLowerCase();
                            if (nutrientLabel.includes('sodium') || nutrientLabel.includes('potassium')) {
                                label += ' (×100)';
                            } else if (nutrientLabel.includes('calcium') || nutrientLabel.includes('phosphorus') || 
                                      nutrientLabel.includes('vitamin a') || nutrientLabel.includes('vitamin d') || 
                                      nutrientLabel.includes('folate')) {
                                label += ' (×10)';
                            }
                        }
                        return label;
                    }
                }
            },
            legend: {
                display: false
            }
        },
        animation: {
            onComplete: function() {
                renderRecommendedNutritionChart.afterDatasetsDraw(this);
            }
        }
    };
    
    // Custom formatter for tooltip values
    renderRecommendedNutritionChart.formatter = function(value) {
        return value.toLocaleString();
    };
    
    // Custom function to add values on top of bars
    renderRecommendedNutritionChart.afterDatasetsDraw = function(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            if (!meta.hidden) {
                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];
                    const roundedValue = parseFloat(value.toFixed(2));
                    if (roundedValue !== 0) { // Only show if not 0.00
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(roundedValue, bar.x, bar.y - 5); // Position the text above the bar
                    }
                });
            }
        });
    };
    
    // Destroy existing chart instance if it exists
    if (window.recommendedNutritionChart) {
        window.recommendedNutritionChart.destroy();
    }
    
    // Create new chart instance
    window.recommendedNutritionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
    
    // Add event listener to the dropdown to update the chart when selection changes
    chartCategorySelect.addEventListener('change', renderRecommendedNutritionChart);
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