// Using local API instead of Spoonacular
const BASE_URL = 'http://127.0.0.1:5001/api/recipes';
const YOUTUBE_API_KEY = 'AIzaSyCl2hSa3ZZ2MIXBiyMZaWite5lIn3Snowg'; // You'll need to replace this with a valid YouTube API key
const PICKUP_LIMES_CHANNEL_ID = 'UCq2E1mIwUKMWzCA4liA_XGQ'; // Pick Up Limes channel ID

// DOM Elements
const searchInput = document.getElementById('meal-search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('recipe-results');
const cuisineFilter = document.getElementById('cuisine-filter');
const dietFilter = document.getElementById('diet-filter');
const youtubeResults = document.getElementById('youtube-results');

// Tab Elements
const resultsTab = document.getElementById('results-tab');
const youtubeTab = document.getElementById('youtube-tab');
const resultsSection = document.getElementById('results-section');
const youtubeSection = document.getElementById('youtube-section');

// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Tab switching event listeners
resultsTab.addEventListener('click', () => switchTab('results'));
youtubeTab.addEventListener('click', () => switchTab('youtube'));

window.addEventListener('DOMContentLoaded', () => {
    // Show healthy meal recipes by default
    performSearch('healthy');
    // Set results tab as active by default
    switchTab('results');
});

async function performSearch(defaultQuery) {
    const query = typeof defaultQuery === 'string' ? defaultQuery : searchInput.value.trim();
    const diet = dietFilter.value;
    
    // Allow empty query to show all recipes
    // if (!query) return;
    
    clearResults();
    
    try {
        const params = new URLSearchParams({
            number: 24 // Increased number to show more recipes
        });
        
        // Only add query param if it's not empty
        if (query) params.append('query', query);
        if (diet) params.append('diet', diet);
        
        const url = `${BASE_URL}/search?${params}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (!response.ok) throw new Error(data.message || 'Failed to fetch recipes');
        
        // Filter out recipes without images
        const recipesWithImages = (data.results || []).filter(r => r.image);
        console.log('Recipes with images:', recipesWithImages.length);
        
        if (recipesWithImages.length === 0) {
            showError('No recipes found matching your criteria. Try a different search term.');
        } else {
            displayResults(recipesWithImages);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message);
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
        </div>
    `;
    
    // Add click event to the entire card
    card.addEventListener('click', () => {
        window.location.href = `recipe-details.html?id=${recipe.id}`;
    });
    
    return card;
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
// Function to switch between tabs
function switchTab(tabName) {
    // Remove active class from all tabs and content
    resultsTab.classList.remove('active');
    youtubeTab.classList.remove('active');
    resultsSection.classList.remove('active');
    youtubeSection.classList.remove('active');
    
    // Add active class to selected tab and content
    if (tabName === 'results') {
        resultsTab.classList.add('active');
        resultsSection.classList.add('active');
    } else if (tabName === 'youtube') {
        youtubeTab.classList.add('active');
        youtubeSection.classList.add('active');
        
        // If YouTube tab is selected and no videos are loaded yet, fetch them
        if (youtubeResults.children.length === 0) {
            fetchYoutubeVideos();
        }
    }
}



async function fetchYoutubeVideos() {
    youtubeResults.innerHTML = '';
    
    try {
        // Using the YouTube Data API with the provided API key
        // Add search terms to filter for food-related content
        const searchTerms = 'recipe OR meal OR food OR cook OR cooking OR vegan OR vegetarian OR plant-based OR breakfast OR lunch OR dinner';
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${PICKUP_LIMES_CHANNEL_ID}&part=snippet,id&order=date&maxResults=20&type=video&q=${encodeURIComponent(searchTerms)}`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Additional client-side filtering to ensure we only get food-related videos
            const foodKeywords = ['recipe', 'meal', 'food', 'healthy', 'cook', 'cooking', 'vegan', 'vegetarian', 'plant-based', 
                                'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'prep', 'kitchen', 'eat', 'eating'];
            
            const filteredVideos = data.items.filter(video => {
                const title = video.snippet.title.toLowerCase();
                const description = video.snippet.description.toLowerCase();
                return foodKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
            });
            
            // Limit to 9 videos after filtering
            const limitedVideos = filteredVideos.slice(0, 9);
            
            if (limitedVideos.length > 0) {
                displayYoutubeVideos(limitedVideos);
            } else {
                showError('No food-related videos found from Pick Up Limes channel.', youtubeResults);
            }
        } else {
            showError('No videos found from Pick Up Limes channel.', youtubeResults);
        }
    } catch (error) {
        showError('Failed to load YouTube videos. Please try again later.', youtubeResults);
        console.error('YouTube API error:', error);
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