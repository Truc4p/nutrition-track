const API_KEY = '8b6eb5b7d0144cb1aae1ba0d41e25c3f';
const BASE_URL = 'https://api.spoonacular.com/recipes';

// DOM Elements
const searchInput = document.getElementById('meal-search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('recipe-results');
const loadingSpinner = document.getElementById('loading');
const cuisineFilter = document.getElementById('cuisine-filter');
const dietFilter = document.getElementById('diet-filter');

// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

window.addEventListener('DOMContentLoaded', () => {
    // Show healthy meal recipes by default
    performSearch('healthy');
});

async function performSearch(defaultQuery) {
    const query = typeof defaultQuery === 'string' ? defaultQuery : searchInput.value.trim();
    const cuisine = cuisineFilter.value;
    const diet = dietFilter.value;
    
    if (!query) return;
    
    showLoading();
    clearResults();
    
    try {
        const params = new URLSearchParams({
            apiKey: API_KEY,
            query: query,
            number: 12,
            addRecipeInformation: true,
            addRecipeNutrition: true
        });
        
        if (cuisine) params.append('cuisine', cuisine);
        if (diet) params.append('diet', diet);
        
        const response = await fetch(`${BASE_URL}/complexSearch?${params}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to fetch recipes');
        
        // Filter out recipes without images
        const recipesWithImages = (data.results || []).filter(r => r.image);
        displayResults(recipesWithImages);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayResults(recipes) {
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        resultsContainer.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const dietaryTags = [];
    if (recipe.vegetarian) dietaryTags.push('<span class="badge vegetarian">Vegetarian</span>');
    if (recipe.vegan) dietaryTags.push('<span class="badge vegan">Vegan</span>');
    if (recipe.glutenFree) dietaryTags.push('<span class="badge gluten-free">Gluten Free</span>');
    
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" onerror="this.parentNode.remove()">
        <div class="recipe-card-content">
            <h3>${recipe.title}</h3>
            <div class="recipe-meta">
                <span>Ready in ${recipe.readyInMinutes} minutes</span>
                <div class="dietary-tags">
                    ${dietaryTags.join('')}
                </div>
            </div>
            <a href="recipe-details.html?id=${recipe.id}" class="view-recipe-button">View Recipe</a>
        </div>
    `;
    return card;
}

function showLoading() {
    loadingSpinner.style.display = 'block';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function clearResults() {
    resultsContainer.innerHTML = '';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    resultsContainer.appendChild(errorDiv);
} 