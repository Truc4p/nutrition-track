// --- DOM Elements ---
const recipeNameInput = document.getElementById('recipe-name');
const recipeIngredientsInput = document.getElementById('recipe-ingredients');
const recipeServingsInput = document.getElementById('recipe-servings');
const calculateNutritionBtn = document.getElementById('calculate-nutrition-btn');
const clearRecipeBtn = document.getElementById('clear-recipe-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsSection = document.getElementById('results-section');
const recipeTitle = document.getElementById('recipe-title');
const totalServings = document.getElementById('total-servings');
const ingredientsCount = document.getElementById('ingredients-count');
const perServingContent = document.getElementById('per-serving-content');
const totalRecipeContent = document.getElementById('total-recipe-content');
const ingredientsList = document.getElementById('ingredients-list');

// --- State ---
let recipeData = {
    name: '',
    ingredients: '',
    servings: 1,
    foods: [],
    isLoading: false
};

const API_URL = "/api/nlp/process_text_and_get_nutrition/";

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // State management event listeners
    window.addEventListener('savePageState', (event) => {
        if (event.detail.pageKey === 'recipe-nutrition') {
            const state = {
                recipeName: recipeNameInput ? recipeNameInput.value : '',
                recipeIngredients: recipeIngredientsInput ? recipeIngredientsInput.value : '',
                recipeServings: recipeServingsInput ? recipeServingsInput.value : 1,
                foods: recipeData.foods || []
            };
            event.detail.saveState('recipe-nutrition', state);
        }
    });

    window.addEventListener('loadPageState', (event) => {
        if (event.detail.pageKey === 'recipe-nutrition') {
            const state = event.detail.loadState('recipe-nutrition');
            if (state) {
                // Restore form fields
                if (recipeNameInput && state.recipeName) {
                    recipeNameInput.value = state.recipeName;
                }
                if (recipeIngredientsInput && state.recipeIngredients) {
                    recipeIngredientsInput.value = state.recipeIngredients;
                }
                if (recipeServingsInput && state.recipeServings) {
                    recipeServingsInput.value = state.recipeServings;
                }
                
                // Restore recipe data
                if (state.foods) {
                    recipeData.foods = state.foods;
                    recipeData.name = state.recipeName || '';
                    recipeData.ingredients = state.recipeIngredients || '';
                    recipeData.servings = parseInt(state.recipeServings) || 1;
                    
                    if (recipeData.foods.length > 0) {
                        updateUI();
                    }
                }
                
                handleInputChange(); // Update button state
            }
        }
    });
    
    // Listen for the clearPageInputs event
    window.addEventListener('clearPageInputs', () => {
        clearRecipe();
    });

    // Initialize event listeners
    setupEventListeners();
    handleInputChange(); // Set initial button state
});

function setupEventListeners() {
    if (recipeIngredientsInput) {
        recipeIngredientsInput.addEventListener('input', handleInputChange);
    }
    if (recipeServingsInput) {
        recipeServingsInput.addEventListener('input', handleInputChange);
    }
    if (calculateNutritionBtn) {
        calculateNutritionBtn.addEventListener('click', handleCalculateNutrition);
    }
    if (clearRecipeBtn) {
        clearRecipeBtn.addEventListener('click', clearRecipe);
    }
}

// --- Functions ---

// Enable/disable calculate button based on input
function handleInputChange() {
    const hasIngredients = recipeIngredientsInput && recipeIngredientsInput.value.trim() !== '';
    const hasValidServings = recipeServingsInput && recipeServingsInput.value > 0;
    
    if (calculateNutritionBtn) {
        calculateNutritionBtn.disabled = !hasIngredients || !hasValidServings || recipeData.isLoading;
    }
}

// Handle calculate nutrition button click
async function handleCalculateNutrition() {
    const ingredients = recipeIngredientsInput.value.trim();
    const servings = parseInt(recipeServingsInput.value) || 1;
    
    if (!ingredients) return;

    recipeData.name = recipeNameInput.value.trim() || 'Unnamed Recipe';
    recipeData.ingredients = ingredients;
    recipeData.servings = servings;

    setLoading(true);
    await processRecipeIngredients(ingredients);
    setLoading(false);
    updateUI();
}

// Show/hide loading indicator
function setLoading(loading) {
    recipeData.isLoading = loading;
    if (loadingIndicator) {
        loadingIndicator.style.display = loading ? 'block' : 'none';
    }
    handleInputChange(); // Update button state
}

// Process recipe ingredients using the same API as home.js
async function processRecipeIngredients(ingredients) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: ingredients }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Backend response:', data);

        // Process the result into the 'foods' array with all nutrients (same logic as home.js)
        recipeData.foods = data.result.map(ingredient => {
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
                allNutrients: allNutrients
            };
        });

    } catch (error) {
        console.error("Error fetching or processing nutrition data:", error);
        alert(`Failed to get nutrition data: ${error.message}`);
        recipeData.foods = [];
    }
}

// Update the UI with recipe results
function updateUI() {
    if (recipeData.foods.length === 0) {
        resultsSection.style.display = 'none';
        document.getElementById('recipe-summary').style.display = 'none';
        document.getElementById('ingredients-breakdown').style.display = 'none';
        return;
    }

    // Show results sections
    resultsSection.style.display = 'block';
    document.getElementById('recipe-summary').style.display = 'block';
    document.getElementById('ingredients-breakdown').style.display = 'block';

    // Update recipe summary
    recipeTitle.textContent = recipeData.name || 'Recipe Nutrition Facts';
    totalServings.textContent = `Servings: ${recipeData.servings}`;
    ingredientsCount.textContent = `Ingredients: ${recipeData.foods.length}`;

    // Calculate total nutrition for entire recipe
    const totalNutrition = calculateTotalNutrition();
    
    // Calculate per-serving nutrition
    const perServingNutrition = calculatePerServingNutrition(totalNutrition);

    // Display nutrition information (similar to home.js totals)
    displayNutritionData(perServingContent, perServingNutrition, 'per-serving');
    displayNutritionData(totalRecipeContent, totalNutrition, 'total');

    // Display ingredients breakdown (similar to home.js food list)
    displayIngredientsBreakdown();
}

// Calculate total nutrition for entire recipe
function calculateTotalNutrition() {
    const nutritionTotals = {};

    recipeData.foods.forEach(food => {
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

    return nutritionTotals;
}

// Calculate per-serving nutrition
function calculatePerServingNutrition(totalNutrition) {
    const perServingNutrition = {};
    
    Object.entries(totalNutrition).forEach(([key, nutrient]) => {
        perServingNutrition[key] = {
            ...nutrient,
            value: nutrient.value / recipeData.servings
        };
    });

    return perServingNutrition;
}

// Display nutrition data in organized categories (styled like home.js totals)
function displayNutritionData(container, nutritionData, type) {
    container.innerHTML = '';

    // Get recommendation data from global state (if available)
    let recommendationData = null;
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const savedState = localStorage.getItem('app_state_recommend');
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.recommendation) {
                    recommendationData = state.recommendation;
                }
            }
        } catch (e) {
            console.log('Error accessing recommendation data:', e);
        }
    }

    // Create a single list item for totals (same structure as home.js totals section)
    const totalListItem = document.createElement('div');
    totalListItem.className = 'total-food-item expanded';
    totalListItem.id = `${type}-nutrition-item`;

    // Create header similar to food items (but without collapse icon for totals)
    const headerDiv = document.createElement('div');
    headerDiv.className = 'food-header';
    const headerH4 = document.createElement('h4');
    headerH4.className = 'food-title';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'food-name2';
    nameSpan.textContent = type === 'per-serving' ? 'PER SERVING' : 'TOTAL RECIPE';
    
    headerH4.appendChild(nameSpan);
    headerDiv.appendChild(headerH4);

    // Organize nutrients by category
    const categories = {
        'Proximates': [],
        'Minerals': [],
        'Vitamins': [],
        'Lipids': [],
        'Protein': [],
        'Carbohydrates': [],
        'Other': []
    };

    // Helper function to get recommended value for a nutrient (only for per-serving)
    function getRecommendedValue(nutrientName, unit) {
        if (type !== 'per-serving' || !recommendationData) return null;
        
        const name = nutrientName.toLowerCase();
        const unitLower = unit ? unit.toLowerCase() : '';
        
        // Map nutrient names to recommendation object properties (same as home.js)
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
            'sodium, na': 'sodium',
            'sodium': 'sodium',
            'potassium, k': 'potassium',
            'potassium': 'potassium',
            'calcium, ca': 'calcium',
            'calcium': 'calcium',
            'iron, fe': 'iron',
            'iron': 'iron',
            'vitamin c, total ascorbic acid': 'vitaminC',
            'vitamin c': 'vitaminC',
            'vitamin a, rae': 'vitaminA',
            'vitamin a': 'vitaminA'
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

    Object.values(nutritionData)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(nutrient => {
            if (nutrient.value === 0) return;
            
            const name = nutrient.name;
            const actualValue = nutrient.value;
            const unit = nutrient.unit.toLowerCase();
            const recommendedValue = getRecommendedValue(name, unit);
            
            // Format the value display
            let valueDisplay;
            if (recommendedValue && type === 'per-serving') {
                valueDisplay = `${Math.round(actualValue)} / <span class="recommended-value">${recommendedValue}</span> ${unit}`;
            } else {
                valueDisplay = `${Math.round(actualValue)} ${unit}`;
            }
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">${name}:</span>
                    <span class="nutrient-value">${valueDisplay}</span>
                </div>`;

            // Categorize nutrients (same logic as home.js)
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

    // Create nutrition div with same structure as home.js totals
    const nutritionDiv = document.createElement('div');
    nutritionDiv.className = 'food-nutrition';

    // Display nutrients by category using same structure as home.js
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
    container.appendChild(totalListItem);
}

// Display ingredients breakdown (styled like home.js food list)
function displayIngredientsBreakdown() {
    ingredientsList.innerHTML = '';

    recipeData.foods.forEach((food, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'food-item';
        listItem.id = `ingredient-item-${index}`;

        // Top: Food name and quantity as h4 (same as home.js)
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

        // All Nutrition Info organized by categories (same style as home.js)
        const nutritionDiv = document.createElement('div');
        nutritionDiv.className = 'food-nutrition';

        // Organize nutrients by category (using same categories as home.js)
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

        // Organize all nutrients by category using same logic as home.js
        Object.values(food.allNutrients)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                if (nutrient.value === 0) return;
                
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

        // Display nutrients by category using same structure as home.js
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
        ingredientsList.appendChild(listItem);
        
        // Add click event listener to toggle expansion (same as home.js)
        listItem.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
}

// Clear recipe form and results
function clearRecipe() {
    // Clear form inputs
    if (recipeNameInput) recipeNameInput.value = '';
    if (recipeIngredientsInput) recipeIngredientsInput.value = '';
    if (recipeServingsInput) recipeServingsInput.value = '1';
    
    // Clear recipe data
    recipeData = {
        name: '',
        ingredients: '',
        servings: 1,
        foods: [],
        isLoading: false
    };
    
    // Hide all results sections
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    const recipeSummary = document.getElementById('recipe-summary');
    if (recipeSummary) {
        recipeSummary.style.display = 'none';
    }
    const ingredientsBreakdown = document.getElementById('ingredients-breakdown');
    if (ingredientsBreakdown) {
        ingredientsBreakdown.style.display = 'none';
    }
    
    // Clear content
    if (perServingContent) perServingContent.innerHTML = '';
    if (totalRecipeContent) totalRecipeContent.innerHTML = '';
    if (ingredientsList) ingredientsList.innerHTML = '';
    
    // Update button state
    handleInputChange();
} 