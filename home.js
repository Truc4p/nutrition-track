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
                    <span class="nutrient-value">${Math.round(food.totalCalories)} kcal</span>
                </div>`;
            categories['Proximates'].push(nutrientInfo);
        }

        // Organize all nutrients by category using same logic as search.js
        Object.values(food.allNutrients)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                if (!nutrient.value || nutrient.value === 0) return;
                if (Math.round(nutrient.value) === 0) return; // Skip values that round to 0
                
                const name = nutrient.name;
                const value = nutrient.value;
                const unit = nutrient.unit.toLowerCase();
                const nutrientInfo = `
                    <div class="nutrition-total-item">
                        <span class="nutrient-name">${name}:</span>
                        <span class="nutrient-value">${Math.round(value)} ${unit}</span>
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
    return Math.round(value);
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
            <span>${Math.round(nutrient.value)} ${nutrient.unit.toLowerCase()}</span>
        `;
        nutritionTotalsDiv.appendChild(totalItem);
    });
}
// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)
