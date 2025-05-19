// DOM Elements for search functionality
document.addEventListener('DOMContentLoaded', () => {
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
        searchInput.addEventListener('input', function() {
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
        searchResults.style.display = 'block';
        if (foods.length === 0) {
            searchResults.innerHTML = '<p>No foods found.</p>';
            return;
        }

        searchResults.innerHTML = foods.map(food => {
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
                    <div class="food-calories">${calories.toFixed(1)} kcal/100g</div>
                </div>
            `;
        }).join('');
    }

    // Make displayNutritionDetails available globally
    window.displayNutritionDetails = function(food) {
        selectedFood = food;
        const nutrients = food.foodNutrients || [];

        // Sort nutrients alphabetically by name for better readability
        const sortedNutrients = nutrients.sort((a, b) => 
            a.nutrientName.localeCompare(b.nutrientName)
        );

        // Create the HTML structure for food details
        let nutritionHtml = `
            <div class="food-basic-info">
                <h4>${food.description}</h4>
                <div class="nutrient-item">
                    <span class="nutrient-name">FDC ID:</span>
                    <span class="nutrient-value">${food.fdcId}</span>
                </div>`;

        if (food.brandOwner) {
            nutritionHtml += `
                <div class="nutrient-item">
                    <span class="nutrient-name">Brand:</span>
                    <span class="nutrient-value">${food.brandOwner}</span>
                </div>`;
        }

        if (food.servingSize) {
            nutritionHtml += `
                <div class="nutrient-item">
                    <span class="nutrient-name">Serving Size:</span>
                    <span class="nutrient-value">${food.servingSize}${food.servingSizeUnit || 'g'}</span>
                </div>`;
        }

        nutritionHtml += `
            <div class="nutrient-item">
                <span class="nutrient-name">Data Type:</span>
                <span class="nutrient-value">${food.dataType}</span>
            </div>
        </div>`;

        // Group nutrients by category
        const categories = {
            'Proximates': [],
            'Minerals': [],
            'Vitamins': [],
            'Lipids': [],
            'Protein': [],
            'Carbohydrates': [],
            'Other': []
        };

        // Categorize nutrients
        sortedNutrients.forEach(nutrient => {
            if (!nutrient.value || nutrient.value === 0) return;

            const name = nutrient.nutrientName;
            const value = nutrient.value;
            const unit = nutrient.unitName.toLowerCase();
            const nutrientHtml = `
                <div class="nutrient-item">
                    <span class="nutrient-name">${name}:</span>
                    <span class="nutrient-value">${value.toFixed(2)} ${unit}</span>
                </div>`;

            if (name.includes('Vitamin')) {
                categories['Vitamins'].push(nutrientHtml);
            } else if (name.includes('Mineral') || name.includes('Iron') || name.includes('Calcium') || 
                      name.includes('Zinc') || name.includes('Magnesium') || name.includes('Potassium') ||
                      name.includes('Sodium') || name.includes('Phosphorus')) {
                categories['Minerals'].push(nutrientHtml);
            } else if (name.includes('Protein') || name.includes('Amino')) {
                categories['Protein'].push(nutrientHtml);
            } else if (name.includes('Carbohydrate') || name.includes('Fiber') || name.includes('Sugar')) {
                categories['Carbohydrates'].push(nutrientHtml);
            } else if (name.includes('Fat') || name.includes('Fatty') || name.includes('Cholesterol')) {
                categories['Lipids'].push(nutrientHtml);
            } else if (name.includes('Energy') || name.includes('Water') || name.includes('Ash')) {
                categories['Proximates'].push(nutrientHtml);
            } else {
                categories['Other'].push(nutrientHtml);
            }
        });

        // Add each category to the nutrition HTML
        Object.entries(categories).forEach(([category, nutrients]) => {
            if (nutrients.length > 0) {
                nutritionHtml += `
                    <div class="nutrient-category">
                        <h4>${category}</h4>
                        ${nutrients.join('')}
                    </div>`;
            }
        });

        // Add source information
        nutritionHtml += `
            <div class="nutrient-category">
                <div class="nutrient-item">
                    <span class="nutrient-name">Source:</span>
                    <span class="nutrient-value">USDA Food Data Central</span>
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
            const totalCalories = (calories * food.quantity / 100).toFixed(1);
            
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
    window.removeFood = function(foodId) {
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

        addedFoods.forEach(food => {
            const multiplier = food.quantity / 100; // Convert to per 100g
            
            // Get all nutrients from the food
            const nutrients = food.foodNutrients || [];
            nutrients.forEach(nutrient => {
                if (!nutrient.value || nutrient.value === 0) return; // Skip empty values

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

        displayTotalNutrition(totals);
    }

    function displayTotalNutrition(totals) {
        // Group nutrients by category
        const categories = {
            'Proximates': [],
            'Minerals': [],
            'Vitamins': [],
            'Lipids': [],
            'Protein': [],
            'Carbohydrates': [],
            'Other': []
        };

        // Sort and categorize nutrients
        Object.values(totals)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                const name = nutrient.name;
                const value = nutrient.value;
                const unit = nutrient.unit;
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