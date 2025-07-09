// DOM Elements for search functionality
document.addEventListener('DOMContentLoaded', () => {
    // State management event listeners
    window.addEventListener('savePageState', (event) => {
        if (event.detail.pageKey === 'search') {
            const state = {
                searchInput: searchInput ? searchInput.value : '',
                selectedFood: selectedFood,
                addedFoods: addedFoods || [],
                foodQuantity: foodQuantity ? foodQuantity.value : '100'
            };
            event.detail.saveState('search', state);
        }
    });

    window.addEventListener('loadPageState', (event) => {
        if (event.detail.pageKey === 'search') {
            const state = event.detail.loadState('search');
            if (state) {
                // Restore search input
                if (searchInput && state.searchInput) {
                    searchInput.value = state.searchInput;
                }

                // Restore selected food and display details
                if (state.selectedFood) {
                    selectedFood = state.selectedFood;
                    window.displayNutritionDetails(selectedFood);
                }

                // Restore added foods and update display
                if (state.addedFoods) {
                    addedFoods = state.addedFoods;
                    updateAddedFoodsList();
                    calculateTotalNutrition();
                }

                // Restore quantity
                if (foodQuantity && state.foodQuantity) {
                    foodQuantity.value = state.foodQuantity;
                }
            }
        }
    });

    // Listen for the clearPageInputs event to clear input fields when state is cleared
    window.addEventListener('clearPageInputs', () => {
        if (searchInput) {
            searchInput.value = '';
        }
        if (foodQuantity) {
            foodQuantity.value = '100';
        }
        selectedFood = null;
        addedFoods = [];
        if (foodDetails) {
            foodDetails.innerHTML = '';
        }
        if (addedFoodsList) {
            addedFoodsList.innerHTML = '';
        }
        if (nutritionTotals) {
            nutritionTotals.innerHTML = '';
        }
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    });

    const searchInput = document.getElementById('food-search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const foodDetails = document.getElementById('food-details');
    const foodQuantity = document.getElementById('food-quantity');
    const addFoodButton = document.getElementById('add-food-button');
    const addedFoodsList = document.getElementById('added-foods-list');
    const nutritionTotals = document.getElementById('nutrition-totals');
    const clearFoodsButton = document.getElementById('clear-foods-button');

    // USDA API Configuration
    const USDA_API_KEY = '7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx';
    const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

    let selectedFood = null;
    let addedFoods = [];
    let searchTimeout;

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

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchFoods(query);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const searchTerm = this.value.trim();

            if (searchTerm.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(() => {
                searchFoods(searchTerm);
            }, 500);
        });

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchFoods(query);
                }
            }
        });
    }

    if (addFoodButton) {
        addFoodButton.addEventListener('click', addSelectedFood);
    }

    if (clearFoodsButton) {
        clearFoodsButton.addEventListener('click', clearAddedFoods);
    }

    // Functions
    async function searchFoods(query) {
        try {
            const response = await fetch(`${USDA_API_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            displaySearchResults(data.foods || []);
        } catch (error) {
            console.error('Error searching foods:', error);
            searchResults.innerHTML = '<p class="error">Error searching foods. Please try again.</p>';
        }
    }

    function displaySearchResults(foods) {
        // Only include foods from Foundation, SR Legacy, or Survey (FNDDS)
        const allowedTypes = ['Foundation', 'SR Legacy', 'Survey (FNDDS)'];
        const filteredFoods = foods.filter(food => allowedTypes.includes(food.dataType));
        searchResults.style.display = 'block';
        if (filteredFoods.length === 0) {
            searchResults.innerHTML = '<p>No foods found.</p>';
            return;
        }

        searchResults.innerHTML = filteredFoods.map(food => {
            // Find calories for display in search results
            const calories = food.foodNutrients?.find(n =>
                n.nutrientName.toLowerCase().includes('energy'))?.value || 0;

            return `
                <div class="search-result-item" onclick='displayNutritionDetails(${JSON.stringify({
                description: food.description,
                brandOwner: food.brandOwner,
                fdcId: food.fdcId,
                dataType: food.dataType,
                servingSize: food.servingSize,
                servingSizeUnit: food.servingSizeUnit,
                foodNutrients: food.foodNutrients
            }).replace(/'/g, "&apos;")})'> 
                    <div class="food-name">${food.description}</div>
                    <div class="food-calories">${Math.round(calories)} kcal/100g</div>
                </div>
            `;
        }).join('');
    }

    // Make displayNutritionDetails available globally
    window.displayNutritionDetails = function (food) {
        selectedFood = food;
        const nutrients = food.foodNutrients || [];

        // Sort nutrients alphabetically by name for better readability
        const sortedNutrients = nutrients.sort((a, b) =>
            a.nutrientName.localeCompare(b.nutrientName)
        );

        // Create the HTML structure exactly like food items in home.js
        let nutritionHtml = `
            <div class="food-item">
                <div class="food-header">
                    <h4 class="food-title">
                        <span class="food-name2">${food.description}</span>
                    </h4>
                    <span class="food-quantity">per 100g</span>
                </div>
                <div class="food-nutrition">`;

        // Group nutrients by USDA categories from nutrient database
        const categories = {};
        
        // Track energy/calorie values to avoid duplicates
        let energyValue = 0;
        let hasEnergyNutrient = false;

        // First pass: find energy nutrients and get the kcal value
        nutrients.forEach(nutrient => {
            const name = nutrient.nutrientName.toLowerCase();
            const unit = nutrient.unitName.toLowerCase();
            
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal' && nutrient.value > 0) {
                energyValue = nutrient.value;
                hasEnergyNutrient = true;
            }
        });

        // Add consolidated energy entry if we have a value
        if (energyValue > 0) {
            const energyCategory = getUSDANutrientCategory('Energy') || 'Energy';
            if (!categories[energyCategory]) categories[energyCategory] = [];
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Energy:</span>
                    <span class="nutrient-value">${Math.round(energyValue)} kcal</span>
                </div>`;
            categories[energyCategory].push(nutrientInfo);
        }

        // Categorize all other nutrients using USDA categories (excluding energy/calorie nutrients)
        sortedNutrients.forEach(nutrient => {
            if (!nutrient.value || nutrient.value === 0) return;
            if (Math.round(nutrient.value) === 0) return; // Skip values that round to 0
            
            const name = nutrient.nutrientName.toLowerCase();
            const unit = nutrient.unitName.toLowerCase();
            
            // Skip all energy/calorie related nutrients as we've already handled them
            if (name.includes('energy') || name.includes('calorie')) {
                return;
            }

            const displayName = nutrient.nutrientName;
            const value = nutrient.value;
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">${displayName}</span>
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

        // Display nutrients by category using same structure as home.js
        Object.entries(categories).forEach(([categoryName, nutrients]) => {
            if (nutrients.length > 0) {
                nutritionHtml += `
                    <div class="nutrition-category">
                        <h4 class="category-title">${categoryName}</h4>
                        ${nutrients.join('')}
                    </div>`;
            }
        });

        // Close the nutrition and item divs
        nutritionHtml += `
                </div>
            </div>`;

        // Update the food details div
        const foodDetailsElement = document.getElementById('food-details');
        foodDetailsElement.innerHTML = nutritionHtml;
    };

    function addSelectedFood() {
        if (!selectedFood) return;

        const quantity = parseFloat(foodQuantity.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }

        // Store all the food information including all nutrients
        const foodWithQuantity = {
            id: Date.now(),
            name: selectedFood.description,
            quantity: quantity,
            foodNutrients: selectedFood.foodNutrients // Store all nutrients
        };

        addedFoods.push(foodWithQuantity);
        updateAddedFoodsList();
        calculateTotalNutrition();
    }

    function updateAddedFoodsList() {
        // Show/hide clear button based on whether there are foods
        clearFoodsButton.style.display = addedFoods.length > 0 ? 'inline-flex' : 'none';

        addedFoodsList.innerHTML = addedFoods.map(food => {
            // Find calories for this food item
            const calories = food.foodNutrients.find(n =>
                n.nutrientName.toLowerCase().includes('energy'))?.value || 0;
            const totalCalories = Math.round(calories * food.quantity / 100);

            return `
                <div class="added-food-item" data-id="${food.id}">
                    <div class="food-item-content">
                        <div class="food-name">${food.name}</div>
                        <div class="food-quantity">${food.quantity}g - ${totalCalories} kcal</div>
                    </div>
                    <div class="food-item-actions">
                        <button class="remove-food-button" onclick="removeFood(${food.id})" title="Remove food">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        calculateTotalNutrition();
    }

    // Add the removeFood function to window scope
    window.removeFood = function (foodId) {
        addedFoods = addedFoods.filter(food => food.id !== foodId);
        updateAddedFoodsList();
    }

    function clearAddedFoods() {
        addedFoods = [];
        updateAddedFoodsList();
        calculateTotalNutrition();
    }

    function calculateTotalNutrition() {
        // Create an object to store all nutrients
        const totals = {};
        
        // Track energy separately to consolidate
        let totalEnergyKcal = 0;

        addedFoods.forEach(food => {
            const multiplier = food.quantity / 100; // Convert to per 100g

            // Get all nutrients from the food
            const nutrients = food.foodNutrients || [];
            nutrients.forEach(nutrient => {
                if (!nutrient.value || nutrient.value === 0) return; // Skip empty values

                const name = nutrient.nutrientName.toLowerCase();
                const unit = nutrient.unitName.toLowerCase();
                
                // Handle energy/calorie nutrients separately
                if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                    totalEnergyKcal += nutrient.value * multiplier;
                    return; // Skip adding to totals, we'll add consolidated energy later
                }
                
                // Skip other energy units (like kJ) since we want to show only kcal
                if (name.includes('energy') || name.includes('calorie')) {
                    return;
                }

                const key = `${nutrient.nutrientName}_${nutrient.unitName}`; // Create unique key for each nutrient
                if (!totals[key]) {
                    totals[key] = {
                        name: nutrient.nutrientName,
                        value: 0,
                        unit: nutrient.unitName.toLowerCase()
                    };
                }
                totals[key].value += nutrient.value * multiplier;
            });
        });

        // Add consolidated energy entry
        if (totalEnergyKcal > 0) {
            totals['Energy_KCAL'] = {
                name: 'Energy',
                value: totalEnergyKcal,
                unit: 'kcal'
            };
        }

        displayTotalNutrition(totals);
    }

    function displayTotalNutrition(totals) {
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

        // Helper function to get recommended value for a nutrient
        function getRecommendedValue(nutrientName, unit) {
            if (!recommendationData) return null;
            
            const name = nutrientName.toLowerCase();
            const unitLower = unit.toLowerCase();
            
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

        // Group nutrients by USDA categories from nutrient database
        const categories = {};

        // Filter out zero values
        const allNutrients = Object.values(totals)
            .filter(nutrient => nutrient.value > 0) // Filter out zero or negative values
            .filter(nutrient => Math.round(nutrient.value) > 0); // Filter out values that round to 0

        // Track energy/calorie values to avoid duplicates
        let totalEnergyKcal = 0;
        let hasEnergyNutrient = false;
        
        // First pass: consolidate all energy nutrients
        allNutrients.forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                totalEnergyKcal += nutrient.value;
                hasEnergyNutrient = true;
            }
        });
        
        // Add consolidated energy entry if we have a value
        if (hasEnergyNutrient && totalEnergyKcal > 0) {
            const energyCategory = getUSDANutrientCategory('Energy') || 'Energy';
            if (!categories[energyCategory]) categories[energyCategory] = [];
            
            const recommendedValue = getRecommendedValue('Energy', 'kcal');
            let valueDisplay;
            if (recommendedValue) {
                valueDisplay = `${Math.round(totalEnergyKcal)} / <span class="recommended-value">${recommendedValue}</span> kcal`;
            } else {
                valueDisplay = `${Math.round(totalEnergyKcal)} kcal`;
            }
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Energy:</span>
                    <span class="nutrient-value">${valueDisplay}</span>
                </div>`;
            categories[energyCategory].push(nutrientInfo);
        }

        // Sort and categorize other nutrients using USDA categories (excluding energy/calorie nutrients)
        allNutrients
            .filter(nutrient => {
                const name = nutrient.name.toLowerCase();
                return !name.includes('energy') && !name.includes('calorie');
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                const name = nutrient.name;
                const actualValue = nutrient.value;
                const unit = nutrient.unit;
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
                        <span class="nutrient-name">${name}</span>
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

        // Build the HTML
        let html = '';
        Object.entries(categories).forEach(([category, nutrients]) => {
            if (nutrients.length > 0) {
                html += `
                    <div class="nutrition-category">
                        <h4 class="category-title">${category}</h4>
                        ${nutrients.join('')}
                    </div>`;
            }
        });

        nutritionTotals.innerHTML = html;
    }
}); 