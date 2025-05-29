// Using local API instead of Spoonacular
const BASE_URL = 'http://127.0.0.1:5001/api/recipes';

// DOM Elements
const recipeContent = document.getElementById('recipe-content');
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
    try {
        // No API key needed for local API
        const params = new URLSearchParams({});
        
        // Only fetch recipe information, not nutrition (since it's not in our database)
        const recipeResponse = await fetch(`${BASE_URL}/${recipeId}/information?${params}`);
        const recipeData = await recipeResponse.json();
        
        if (!recipeResponse.ok) {
            throw new Error('Failed to fetch recipe details');
        }
        
        displayRecipeDetails(recipeData);
    } catch (error) {
        console.error('Error loading recipe details:', error);
        showError('Failed to load recipe details. Please try again later.');
    }
}

function displayRecipeDetails(recipe) {
    document.title = `${recipe.title} - Recipe Details`;
    
    // Create dietary tags
    const dietaryTags = [];
    if (recipe.vegetarian) dietaryTags.push('<span class="badge vegetarian">Vegetarian</span>');
    if (recipe.vegan) dietaryTags.push('<span class="badge vegan">Vegan</span>');
    if (recipe.glutenFree) dietaryTags.push('<span class="badge gluten-free">Gluten Free</span>');
    
    recipeContent.innerHTML = `
        <div class="recipe-header">
            <h1>${recipe.title}</h1>
        </div>

        <div class="recipe-image">
            <img src="${recipe.image}" alt="${recipe.title}">
        </div>
        
        <div class="recipe-description">
            <p>${recipe.description || ''}</p>
        </div>

        <div class="recipe-sections">
            <div class="recipe-section">
                <h2>Ingredients</h2>
                <ul class="ingredients-list">
                    ${recipe.extendedIngredients.map(ing => `
                        <li>
                            ${ing.amount && ing.unit ? 
                              `<span class="ingredient-amount">${ing.amount} ${ing.unit}</span>` : ''}
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
            
            ${recipe.url ? `
            <div class="recipe-section">
                <h2>Source</h2>
                <p><a href="${recipe.url}" target="_blank">View original recipe at Pick Up Limes</a></p>
            </div>
            ` : ''}
        </div>
    `;
}

// Nutrition-related functions have been removed as they're no longer needed

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