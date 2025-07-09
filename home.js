// --- DOM Elements ---
const foodInput = document.getElementById('food-input');
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const foodListContainer = document.getElementById('food-list');
const totalsSection = document.getElementById('totals-section');

// Note: weight, height, age, recommendButton, and recommendationText elements 
// are now handled in recommend.js for the recommendation page

// Note: goal and healthCondition variables are now handled in recommend.js

document.addEventListener('DOMContentLoaded', () => {
    // State management event listeners
    window.addEventListener('savePageState', (event) => {
        if (event.detail.pageKey === 'home') {
            const state = {
                foodInput: foodInput ? foodInput.value : '',
                foods: foods || [],
                addedFoods: addedFoods || []
                };

            event.detail.saveState('home', state);
        }
    });

    window.addEventListener('loadPageState', (event) => {
        if (event.detail.pageKey === 'home') {
            const state = event.detail.loadState('home');
            if (state) {
                // Restore input field
                if (foodInput && state.foodInput) {
                    foodInput.value = state.foodInput;
                    handleInputChange(); // Update button state
                }
                
                // Restore foods array and update UI
                if (state.foods) {
                    foods = state.foods;
                    updateUI();
                    calculateAndDisplayTotals();
                }
                
                // Restore other state
                if (state.addedFoods) {
                    addedFoods = state.addedFoods;
                }
            }
        }
    });
    
    // Listen for the clearPageInputs event to clear input fields when state is cleared
    window.addEventListener('clearPageInputs', () => {
        if (foodInput) {
            foodInput.value = '';
            handleInputChange(); // Update button state
        }
        
        // Reset foods and addedFoods arrays
        foods = [];
        addedFoods = [];
        
        // Clear UI
        if (foodListContainer) {
            foodListContainer.innerHTML = '';
        }
        if (totalsSection) {
            totalsSection.innerHTML = '';
        }
        if (resultsHeader) {
            resultsHeader.style.display = 'none';
        }
    });

    // Event listeners for this page

    // Note: Recommendation functionality is now handled in recommend.js
    // Event listeners for home page only
});

// Note: calculateNutrition function removed - we now use recommendations from recommend.js
// This eliminates code duplication and ensures consistency

// --- State ---
let foods = [];
let isLoading = false;
// Note: recommendation variable moved to recommend.js
const API_URL = "/api/nlp/process_text_and_get_nutrition/";

// Add these variables at the top with other declarations
let selectedFood = null;
let addedFoods = [];

// Helper function to get USDA nutrient category
function getUSDANutrientCategory(nutrientName) {
    // Try to get nutrient info from the database
    if (typeof window !== 'undefined' && window.NutrientDatabase) {
        const nutrientInfo = window.NutrientDatabase.getNutrientInfo(nutrientName);
        if (nutrientInfo && nutrientInfo.category) {
            return nutrientInfo.category;
        }
    }
    
    // Fallback to NUTRIENT_DATABASE if available
    if (typeof NUTRIENT_DATABASE !== 'undefined') {
        if (NUTRIENT_DATABASE[nutrientName]) {
            return NUTRIENT_DATABASE[nutrientName].category;
        }
        
        // Try case-insensitive match
        const lowerNutrientName = nutrientName.toLowerCase();
        for (const [key, value] of Object.entries(NUTRIENT_DATABASE)) {
            if (key.toLowerCase() === lowerNutrientName) {
                return value.category;
            }
        }
        
        // Try common mappings
        const commonMappings = {
            'calories': 'Energy',
            'energy': 'Energy',
            'fat': 'Total lipid (fat)',
            'fats': 'Total lipid (fat)',
            'carbs': 'Carbohydrate, by difference',
            'carbohydrates': 'Carbohydrate, by difference',
            'fiber': 'Fiber, total dietary',
            'sugar': 'Sugars, Total',
            'protein': 'Protein',
            'cholesterol': 'Cholesterol',
            'saturated fat': 'Fatty acids, total saturated',
            'trans fat': 'Fatty acids, total trans',
            'vitamin a': 'Vitamin A, RAE',
            'vitamin b6': 'Vitamin B-6',
            'vitamin b12': 'Vitamin B-12',
            'vitamin c': 'Vitamin C, total ascorbic acid',
            'vitamin d': 'Vitamin D (D2 + D3)',
            'vitamin e': 'Vitamin E (alpha-tocopherol)',
            'vitamin k': 'Vitamin K (phylloquinone)',
            'folate': 'Folate, DFE',
            'thiamin': 'Thiamin',
            'riboflavin': 'Riboflavin',
            'niacin': 'Niacin',
            'choline': 'Choline, total',
            'calcium': 'Calcium, Ca',
            'iron': 'Iron, Fe',
            'magnesium': 'Magnesium, Mg',
            'phosphorus': 'Phosphorus, P',
            'potassium': 'Potassium, K',
            'sodium': 'Sodium, Na',
            'zinc': 'Zinc, Zn',
            'copper': 'Copper, Cu',
            'manganese': 'Manganese, Mn',
            'selenium': 'Selenium, Se'
        };
        
        const mappedName = commonMappings[lowerNutrientName];
        if (mappedName && NUTRIENT_DATABASE[mappedName]) {
            return NUTRIENT_DATABASE[mappedName].category;
        }
    }
    
    // Return null if no category found - will be placed in "Other" category
    return null;
}

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
            // New Gemini API response format
            const nutritionData = ingredient.nutrition || {};
            
            const fatsValue = parseFloat(ingredient.fat) || parseFloat(nutritionData['total lipid (fat) (G)']) || 0.0;
            const carbsValue = parseFloat(ingredient.carbs) || parseFloat(nutritionData['carbohydrate, by difference (G)']) || 0.0;
            const proteinValue = parseFloat(ingredient.protein) || parseFloat(nutritionData['protein (G)']) || 0.0;
            const fiberValue = parseFloat(ingredient.fiber) || parseFloat(nutritionData['fiber, total dietary (G)']) || 0.0;
            const quantityValue = parseFloat(ingredient.quantity) || 0.0;
            const totalCalories = parseFloat(ingredient.calories) || parseFloat(nutritionData['energy (KCAL)']) || 0.0;

            // Process all nutrients from nutrition field
            const allNutrients = {};
            if (nutritionData) {
                Object.entries(nutritionData).forEach(([key, value]) => {
                    const numValue = parseFloat(value) || 0;
                    if (numValue > 0) {
                        // Better formatting for nutrient names
                        let formattedName = key
                            .replace(/,\s*/g, ', ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        // Extract unit from key (e.g., "(MG)" from "calcium, ca (MG)")
                        const unitMatch = key.match(/\(([^)]+)\)$/);
                        const unit = unitMatch ? unitMatch[1].toUpperCase() : '';
                        
                        // Clean the name by removing the unit part
                        if (unitMatch) {
                            formattedName = formattedName.replace(/\s*\([^)]+\)$/, '');
                        }
                        
                        // Handle special cases
                        if (formattedName.toLowerCase().includes('vitamin')) {
                            formattedName = formattedName.replace(/Vitamin\s+(\w)/g, 'Vitamin $1');
                        }
                        if (formattedName.toLowerCase().includes('fatty acids')) {
                            formattedName = formattedName.replace(/Fatty Acids/gi, 'Fatty Acids');
                        }
                        
                        allNutrients[key] = {
                            name: formattedName,
                            value: numValue,
                            unit: unit,
                            category: 'other' // Default category
                        };
                    }
                });
            }

            return {
                id: ingredient.id,
                name: ingredient.name,
                fats: fatsValue,
                saturatedFats: 0, // Not provided in new format, could be calculated if needed
                carbohydrates: carbsValue,
                protein: proteinValue,
                fiber: fiberValue,
                cholesterol: 0, // Not provided in new format
                totalCalories: totalCalories,
                quantity: quantityValue,
                measurementType: ingredient.original_unit || 'g',
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

    if (foods.length === 0) {
        totalsSection.style.display = 'none'; // Hide totals if no food
        return; // Nothing more to render
    }

    // --- Populate Food List ---
    foods.forEach((food, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'food-item';
        listItem.id = `food-item-${index}`;

        // Top: Food name and quantity as h4
        const headerDiv = document.createElement('div');
        headerDiv.className = 'food-header';
        const headerH4 = document.createElement('h4');
        headerH4.className = 'food-title';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'food-name2';
        nameSpan.textContent = food.name;
        
        headerH4.appendChild(nameSpan);
        headerDiv.appendChild(headerH4);
        
        // Add quantity span
        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'food-quantity';
        quantitySpan.textContent = `${food.quantity.toFixed(2)} ${food.measurementType}`;
        headerDiv.appendChild(quantitySpan);
        
        // Add collapse icon
        const collapseIcon = document.createElement('i');
        collapseIcon.className = 'fas fa-chevron-down collapse-icon';
        headerDiv.appendChild(collapseIcon);

        // All Nutrition Info organized by categories (same style as search.js)
        const nutritionDiv = document.createElement('div');
        nutritionDiv.className = 'food-nutrition';

        // Organize nutrients by USDA categories from nutrient database
        const categories = {};
        
        // Track energy/calorie values to avoid duplicates
        let energyValue = 0;
        let hasEnergyNutrient = false;

        // First pass: check if we have energy nutrients and get the kcal value
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                energyValue = nutrient.value;
                hasEnergyNutrient = true;
            }
        });

        // If no kcal energy nutrient found, use totalCalories
        if (!hasEnergyNutrient && food.totalCalories > 0) {
            energyValue = food.totalCalories;
        }

        // Add consolidated energy entry if we have a value
        if (energyValue > 0) {
            const energyCategory = getUSDANutrientCategory('Energy');
            if (!categories[energyCategory]) categories[energyCategory] = [];
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Energy:</span>
                    <span class="nutrient-value">${Math.round(energyValue)} kcal</span>
                </div>`;
            categories[energyCategory].push(nutrientInfo);
        }

        // Organize all other nutrients by USDA category (excluding energy/calorie nutrients)
        Object.values(food.allNutrients)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                if (!nutrient.value || nutrient.value === 0) return;
                if (Math.round(nutrient.value) === 0) return; // Skip values that round to 0
                
                const name = nutrient.name.toLowerCase();
                const unit = nutrient.unit.toLowerCase();
                
                // Skip all energy/calorie related nutrients as we've already handled them
                if (name.includes('energy') || name.includes('calorie')) {
                    return;
                }
                
                const displayName = nutrient.name;
                const value = nutrient.value;
                const nutrientInfo = `
                    <div class="nutrition-total-item">
                        <span class="nutrient-name">${displayName}:</span>
                        <span class="nutrient-value">${Math.round(value)} ${unit}</span>
                    </div>`;

                // Get USDA category for this nutrient
                const usdaCategory = getUSDANutrientCategory(displayName) || 'Other';
                
                // Initialize category array if it doesn't exist
                if (!categories[usdaCategory]) {
                    categories[usdaCategory] = [];
                }
                
                categories[usdaCategory].push(nutrientInfo);
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
        
        // Add click event listener to toggle expansion
        listItem.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // --- Calculate and Display Comprehensive Totals ---
    calculateAndDisplayTotals();
}

// New function to calculate and display comprehensive totals
function calculateAndDisplayTotals() {
    // Calculate totals for all nutrients
    const nutritionTotals = {};

    // First, consolidate energy values
    let totalEnergyKcal = 0;
    
    foods.forEach(food => {
        // Track energy for this food
        let foodEnergyKcal = 0;
        let hasEnergyNutrient = false;
        
        // Check for energy nutrients in kcal
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                foodEnergyKcal = nutrient.value;
                hasEnergyNutrient = true;
            }
        });
        
        // If no kcal energy nutrient found, use totalCalories
        if (!hasEnergyNutrient && food.totalCalories > 0) {
            foodEnergyKcal = food.totalCalories;
        }
        
        totalEnergyKcal += foodEnergyKcal;
        
        // Add all other nutrients (excluding energy/calorie nutrients)
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            // Skip energy/calorie nutrients as we handle them separately
            if (name.includes('energy') || name.includes('calorie')) {
                return;
            }
            
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
    });
    
    // Add consolidated energy entry
    if (totalEnergyKcal > 0) {
        nutritionTotals['energy'] = {
            name: 'Energy',
            value: totalEnergyKcal,
            unit: 'KCAL',
            category: 'energy'
        };
    }

    // Get recommendation data from global state (if available)
    let recommendationData = null;
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const savedState = localStorage.getItem('app_state_recommend');
            console.log('Saved state from localStorage:', savedState);
            if (savedState) {
                const state = JSON.parse(savedState);
                console.log('Parsed state:', state);
                if (state.recommendation) {
                    recommendationData = state.recommendation;
                    console.log('Recommendation data found:', recommendationData);
                }
            }
        } catch (e) {
            console.log('Error accessing recommendation data:', e);
        }
    }

    // Clear and rebuild totals section
    totalsSection.innerHTML = '';

    // Create a single list item for totals (same structure as food-list)
    const totalListItem = document.createElement('div');
    totalListItem.className = 'total-food-item expanded';
    totalListItem.id = 'total-food-item';

    // Create header similar to food items
    const headerDiv = document.createElement('div');
    headerDiv.className = 'food-header';
    const headerH4 = document.createElement('h4');
    headerH4.className = 'food-title';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'food-name2';
    nameSpan.textContent = 'TOTAL NUTRITION';
    
    headerH4.appendChild(nameSpan);
    headerDiv.appendChild(headerH4);
    
    // Add summary span
    const summarySpan = document.createElement('span');
    summarySpan.className = 'food-quantity';
    summarySpan.textContent = `${foods.length} item${foods.length !== 1 ? 's' : ''}`;
    headerDiv.appendChild(summarySpan);

    // Organize totals by USDA categories from nutrient database
    const categories = {};

    // Helper function to get recommended value for a nutrient
    function getRecommendedValue(nutrientName, unit) {
        if (!recommendationData) return null;
        
        const name = nutrientName.toLowerCase();
        const unitLower = unit ? unit.toLowerCase() : '';
        
        // Map nutrient names to recommendation object properties
        const mappings = {
            'energy': 'calories',
            'calories': 'calories',
            'protein': 'protein',
            'total lipid (fat)': 'fats',
            'fat': 'fats',
            'fats': 'fats',
            'carbohydrate, by difference': 'carbs',
            'carbohydrates': 'carbs',
            'carbs': 'carbs',
            'fiber, total dietary': 'fiber',
            'fiber': 'fiber',
            'water': 'water',
            'cholesterol': 'cholesterol',
            'fatty acids, total saturated': 'saturatedFat',
            'saturated fat': 'saturatedFat',
            'fatty acids, total trans': 'transFat',
            'trans fat': 'transFat',
            'iron, fe': 'iron',
            'iron': 'iron',
            'sodium, na': 'sodium',
            'sodium': 'sodium',
            'potassium, k': 'potassium',
            'potassium': 'potassium',
            'calcium, ca': 'calcium',
            'calcium': 'calcium',
            'magnesium, mg': 'magnesium',
            'magnesium': 'magnesium',
            'zinc, zn': 'zinc',
            'zinc': 'zinc',
            'copper, cu': 'copper',
            'copper': 'copper',
            'manganese, mn': 'manganese',
            'manganese': 'manganese',
            'phosphorus, p': 'phosphorus',
            'phosphorus': 'phosphorus',
            'selenium, se': 'selenium',
            'selenium': 'selenium',
            'vitamin a, rae': 'vitaminA',
            'vitamin a': 'vitaminA',
            'vitamin b-6': 'vitaminB6',
            'vitamin b6': 'vitaminB6',
            'vitamin b-12': 'vitaminB12',
            'vitamin b12': 'vitaminB12',
            'vitamin c, total ascorbic acid': 'vitaminC',
            'vitamin c': 'vitaminC',
            'vitamin d (d2 + d3)': 'vitaminD',
            'vitamin d': 'vitaminD',
            'vitamin e (alpha-tocopherol)': 'vitaminE',
            'vitamin e': 'vitaminE',
            'vitamin k (phylloquinone)': 'vitaminK',
            'vitamin k': 'vitaminK',
            'folate, dfe': 'folate',
            'folate': 'folate',
            'thiamin': 'thiamin',
            'riboflavin': 'riboflavin',
            'niacin': 'niacin',
            'choline, total': 'choline',
            'choline': 'choline'
        };
        
        const mappedKey = mappings[name];
        if (mappedKey && recommendationData[mappedKey] !== undefined) {
            // Only show calorie recommendations for kcal, not kJ
            if (name === 'energy' && unitLower !== 'kcal') {
                return null;
            }
            
            const value = recommendationData[mappedKey];
            
            // Handle range values (min-max)
            if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                return `${Math.round(value.min)}-${Math.round(value.max)}`;
            }
            
            return Math.round(value);
        }
        
        return null;
    }

            Object.values(nutritionTotals)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(nutrient => {
            if (!nutrient.value || nutrient.value === 0) return;
            if (Math.round(nutrient.value) === 0) return; // Skip values that round to 0
            
            const name = nutrient.name;
            const actualValue = nutrient.value;
            const unit = nutrient.unit.toLowerCase();
            const recommendedValue = getRecommendedValue(name, unit);
            
            // Format the value display
            let valueDisplay;
            if (recommendedValue) {
                valueDisplay = `${Math.round(actualValue)} / <span class="recommended-value">${recommendedValue}</span> ${unit}`;
            } else {
                valueDisplay = `${Math.round(actualValue)} ${unit}`;
            }
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">${name}:</span>
                    <span class="nutrient-value">${valueDisplay}</span>
                </div>`;

            // Get USDA category for this nutrient
            const usdaCategory = getUSDANutrientCategory(name) || 'Other';
            
            // Initialize category array if it doesn't exist
            if (!categories[usdaCategory]) {
                categories[usdaCategory] = [];
            }
            
            categories[usdaCategory].push(nutrientInfo);
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
    return Math.round(value);
}
// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)
