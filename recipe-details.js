// Using local API instead of Spoonacular
const BASE_URL = 'http://127.0.0.1:5001/api/recipes';

// DOM Elements
const recipeContent = document.getElementById('recipe-content');
const loadingSpinner = document.getElementById('loading');
const saveRecipeButton = document.getElementById('save-recipe');

// Get recipe ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

// Load recipe details when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (recipeId) {
        loadRecipeDetails(recipeId);
    } else {
        showError('Recipe ID not found');
    }
});

async function loadRecipeDetails(recipeId) {
    showLoading();
    
    try {
        // No API key needed for local API
        const params = new URLSearchParams({});
        
        // First try to get the recipe information
        const recipeResponse = await fetch(`${BASE_URL}/${recipeId}/information?${params}`);
        
        if (!recipeResponse.ok) {
            throw new Error(`Failed to fetch recipe details: ${recipeResponse.status}`);
        }
        
        const recipeData = await recipeResponse.json();
        
        // Then get the nutrition information
        const nutritionResponse = await fetch(`${BASE_URL}/${recipeId}/nutritionWidget.json?${params}`);
        const nutritionData = await nutritionResponse.json();
        
        // Display the recipe details even if nutrition data fails
        displayRecipeDetails(recipeData, nutritionData);
        
        console.log('Recipe details loaded successfully:', recipeData.title);
    } catch (error) {
        console.error('Error loading recipe details:', error);
        showError(`Error loading recipe: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayRecipeDetails(recipe, nutrition) {
    document.title = `${recipe.title} - Recipe Details`;
    
    recipeContent.innerHTML = `
        <div class="recipe-header">
            <h1>${recipe.title}</h1>
            <div class="recipe-meta">
                <span>Ready in ${recipe.readyInMinutes} minutes</span>
                <span>Servings: ${recipe.servings}</span>
                <span class="health-score">Health Score: ${recipe.healthScore || 0}%</span>
                ${recipe.vegetarian ? '<span class="badge vegetarian">Vegetarian</span>' : ''}
                ${recipe.vegan ? '<span class="badge vegan">Vegan</span>' : ''}
                ${recipe.glutenFree ? '<span class="badge gluten-free">Gluten Free</span>' : ''}
            </div>
        </div>

        <div class="recipe-image">
            <img src="${recipe.image}" alt="${recipe.title}">
        </div>

        <div class="recipe-sections">
            <div class="recipe-section nutrition-section">
                <h2>Nutrition Information</h2>
                
                <div class="nutrition-category">
                    <h3>Limit These</h3>
                    <div class="nutrition-grid limit">
                        ${createNutrientItem('Calories', nutrition.calories, null)}
                        ${createNutrientItem('Fat', nutrition.fat, getNutrientAmount(nutrition.nutrients, 'Fat'))}
                        ${createNutrientItem('Saturated Fat', nutrition.saturatedFat, getNutrientAmount(nutrition.nutrients, 'Saturated Fat'))}
                        ${createNutrientItem('Carbohydrates', nutrition.carbs, getNutrientAmount(nutrition.nutrients, 'Carbohydrates'))}
                        ${createNutrientItem('Sugar', nutrition.sugar, getNutrientAmount(nutrition.nutrients, 'Sugar'))}
                        ${createNutrientItem('Cholesterol', nutrition.cholesterol, getNutrientAmount(nutrition.nutrients, 'Cholesterol'))}
                        ${createNutrientItem('Sodium', nutrition.sodium, getNutrientAmount(nutrition.nutrients, 'Sodium'))}
                        ${createNutrientItem('Alcohol', nutrition.alcohol || '0g', 0)}
                    </div>
                </div>

                <div class="nutrition-category">
                    <h3>Get Enough Of These</h3>
                    <div class="nutrition-grid enough">
                        ${createNutrientItem('Protein', nutrition.protein, getNutrientAmount(nutrition.nutrients, 'Protein'))}
                        ${createNutrientItem('Vitamin B12', null, getNutrientAmount(nutrition.nutrients, 'Vitamin B12'))}
                        ${createNutrientItem('Vitamin A', null, getNutrientAmount(nutrition.nutrients, 'Vitamin A'))}
                        ${createNutrientItem('Vitamin K', null, getNutrientAmount(nutrition.nutrients, 'Vitamin K'))}
                        ${createNutrientItem('Selenium', null, getNutrientAmount(nutrition.nutrients, 'Selenium'))}
                        ${createNutrientItem('Vitamin C', null, getNutrientAmount(nutrition.nutrients, 'Vitamin C'))}
                        ${createNutrientItem('Vitamin B3', null, getNutrientAmount(nutrition.nutrients, 'Vitamin B3'))}
                        ${createNutrientItem('Vitamin B6', null, getNutrientAmount(nutrition.nutrients, 'Vitamin B6'))}
                        ${createNutrientItem('Phosphorus', null, getNutrientAmount(nutrition.nutrients, 'Phosphorus'))}
                        ${createNutrientItem('Vitamin B2', null, getNutrientAmount(nutrition.nutrients, 'Vitamin B2'))}
                        ${createNutrientItem('Vitamin D', null, getNutrientAmount(nutrition.nutrients, 'Vitamin D'))}
                        ${createNutrientItem('Potassium', null, getNutrientAmount(nutrition.nutrients, 'Potassium'))}
                        ${createNutrientItem('Manganese', null, getNutrientAmount(nutrition.nutrients, 'Manganese'))}
                        ${createNutrientItem('Vitamin B1', null, getNutrientAmount(nutrition.nutrients, 'Vitamin B1'))}
                        ${createNutrientItem('Folate', null, getNutrientAmount(nutrition.nutrients, 'Folate'))}
                        ${createNutrientItem('Magnesium', null, getNutrientAmount(nutrition.nutrients, 'Magnesium'))}
                        ${createNutrientItem('Fiber', nutrition.fiber, getNutrientAmount(nutrition.nutrients, 'Fiber'))}
                        ${createNutrientItem('Iron', null, getNutrientAmount(nutrition.nutrients, 'Iron'))}
                        ${createNutrientItem('Vitamin B5', null, getNutrientAmount(nutrition.nutrients, 'Vitamin B5'))}
                        ${createNutrientItem('Vitamin E', null, getNutrientAmount(nutrition.nutrients, 'Vitamin E'))}
                        ${createNutrientItem('Copper', null, getNutrientAmount(nutrition.nutrients, 'Copper'))}
                        ${createNutrientItem('Zinc', null, getNutrientAmount(nutrition.nutrients, 'Zinc'))}
                        ${createNutrientItem('Calcium', null, getNutrientAmount(nutrition.nutrients, 'Calcium'))}
                    </div>
                </div>
            </div>

            <div class="recipe-section">
                <h2>Ingredients</h2>
                <ul class="ingredients-list">
                    ${recipe.extendedIngredients.map(ing => `
                        <li>
                            <span class="ingredient-amount">${ing.amount} ${ing.unit}</span>
                            <span class="ingredient-name">${ing.original}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="recipe-section">
                <h2>Instructions</h2>
                <ol class="instructions-list">
                    ${recipe.analyzedInstructions[0]?.steps.map(step => `
                        <li>${step.step}</li>
                    `).join('') || 'No instructions available'}
                </ol>
            </div>
        </div>
    `;
}

function getNutrientAmount(nutrients, name) {
    if (!nutrients) return null;
    const nutrient = nutrients.find(n => n.name === name);
    return nutrient ? {
        amount: nutrient.amount + nutrient.unit,
        percentOfDailyNeeds: nutrient.percentOfDailyNeeds
    } : null;
}

function createNutrientItem(name, value, nutrientData) {
    if (!nutrientData && !value) return '';
    
    const displayValue = value || (nutrientData ? nutrientData.amount : '0');
    const percentDaily = nutrientData ? nutrientData.percentOfDailyNeeds : 0;
    
    const percentDisplay = percentDaily ? `
        <div class="daily-value">
            <div class="progress-bar" style="width: ${Math.min(percentDaily, 100)}%"></div>
            <span>${Math.round(percentDaily)}% Daily Value</span>
        </div>
    ` : '';

    return `
        <div class="nutrient-item">
            <div class="nutrient-header">
                <span class="name">${name}</span>
                <span class="value">${displayValue}</span>
            </div>
            ${percentDisplay}
        </div>
    `;
}

function showLoading() {
    loadingSpinner.style.display = 'block';
    recipeContent.style.opacity = '0.5';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
    recipeContent.style.opacity = '1';
}

function showError(message) {
    recipeContent.innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}

// Save recipe functionality (you can implement this based on your needs)
saveRecipeButton.addEventListener('click', () => {
    // Implement save recipe functionality
    alert('Recipe saved!');
}); 