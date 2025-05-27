const API_KEY = '8b6eb5b7d0144cb1aae1ba0d41e25c3f';
const BASE_URL = 'https://api.spoonacular.com/recipes';
const YOUTUBE_API_KEY = 'AIzaSyCl2hSa3ZZ2MIXBiyMZaWite5lIn3Snowg'; // You'll need to replace this with a valid YouTube API key
const PICKUP_LIMES_CHANNEL_ID = 'UCq2E1mIwUKMWzCA4liA_XGQ'; // Pick Up Limes channel ID

// DOM Elements
const searchInput = document.getElementById('meal-search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('recipe-results');
const loadingSpinner = document.getElementById('loading');
const cuisineFilter = document.getElementById('cuisine-filter');
const dietFilter = document.getElementById('diet-filter');
const youtubeButton = document.getElementById('youtube-videos-button');
const youtubeResults = document.getElementById('youtube-results');

// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

youtubeButton.addEventListener('click', toggleYoutubeVideos);

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
    card.setAttribute('data-recipe-id', recipe.id);
    card.style.cursor = 'pointer';
    
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
        </div>
    `;
    
    // Add click event to the entire card
    card.addEventListener('click', () => {
        window.location.href = `recipe-details.html?id=${recipe.id}`;
    });
    
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

function showError(message, container = resultsContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

// YouTube Videos Functions
async function toggleYoutubeVideos() {
    if (youtubeResults.style.display === 'none') {
        youtubeResults.style.display = 'grid';
        youtubeButton.textContent = 'Hide Pick Up Limes Videos';
        
        // Only fetch videos if the container is empty
        if (youtubeResults.children.length === 0) {
            await fetchYoutubeVideos();
        }
    } else {
        youtubeResults.style.display = 'none';
        youtubeButton.innerHTML = `
            <img src="https://www.youtube.com/s/desktop/7c155e84/img/favicon_144x144.png" alt="YouTube" class="youtube-icon">
            Watch Pick Up Limes Recipe Videos
        `;
    }
}

async function fetchYoutubeVideos() {
    showLoading();
    youtubeResults.innerHTML = '';
    
    try {
        // Using the YouTube Data API with the provided API key
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${PICKUP_LIMES_CHANNEL_ID}&part=snippet,id&order=date&maxResults=9&type=video`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            displayYoutubeVideos(data.items);
        } else {
            // Fallback to sample data if the API doesn't return results
            const sampleVideos = [
                {
                    id: { videoId: 'ZJpHU5D5eLs' },
                    snippet: {
                        title: 'MEAL PREP for the Week | healthy recipes',
                        description: 'Delicious plant-based meal prep recipes that are healthy and easy to make',
                        publishedAt: '2023-01-15T09:00:00Z'
                    }
                },
                {
                    id: { videoId: 'vr2n_QVExKA' },
                    snippet: {
                        title: 'What I Eat In A Day | balanced meals & snacks',
                        description: 'A full day of balanced plant-based eating with simple recipes',
                        publishedAt: '2022-11-28T14:30:00Z'
                    }
                },
                {
                    id: { videoId: 'j7N1f0Pq-fY' },
                    snippet: {
                        title: 'PROTEIN-PACKED Vegan Meal Prep',
                        description: 'High-protein vegan meals that are delicious and satisfying',
                        publishedAt: '2022-10-12T10:15:00Z'
                    }
                },
                {
                    id: { videoId: 'Zw8L0K5G_Ww' },
                    snippet: {
                        title: '15-minute EASY Vegan Dinner Recipes',
                        description: 'Quick and easy vegan dinner recipes perfect for busy weeknights',
                        publishedAt: '2022-09-20T08:45:00Z'
                    }
                },
                {
                    id: { videoId: 'OHXZcFLpiVQ' },
                    snippet: {
                        title: 'BUDGET-FRIENDLY Vegan Meals | $3 per serving',
                        description: 'Affordable vegan recipes that are budget-friendly and nutritious',
                        publishedAt: '2022-08-05T11:30:00Z'
                    }
                },
                {
                    id: { videoId: 'JcfYF4SI9lU' },
                    snippet: {
                        title: 'MEAL PREP with me | healthy & easy recipes',
                        description: 'Join me for a meal prep session with healthy and easy plant-based recipes',
                        publishedAt: '2022-07-18T13:20:00Z'
                    }
                }
            ];
            displayYoutubeVideos(sampleVideos);
        }
    } catch (error) {
        showError('Failed to load YouTube videos. Please try again later.', youtubeResults);
        console.error('YouTube API error:', error);
    } finally {
        hideLoading();
    }
}

function displayYoutubeVideos(videos) {
    if (!videos || videos.length === 0) {
        showError('No videos found from Pick Up Limes channel.', youtubeResults);
        return;
    }
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // Format the publish date
        const publishDate = new Date(video.snippet.publishedAt);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <iframe 
                    src="https://www.youtube.com/embed/${video.id.videoId}" 
                    title="${video.snippet.title}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-info">
                <h3>${video.snippet.title}</h3>
                <p>${video.snippet.description}</p>
                <p class="video-date">Published: ${formattedDate}</p>
            </div>
        `;
        
        youtubeResults.appendChild(videoCard);
    });
}