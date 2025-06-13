// Using local API 
const BASE_URL = 'http://127.0.0.1:5001/api/recipes';
const YOUTUBE_API_URL = 'http://127.0.0.1:5002/api/youtube';
// The YouTube API key is no longer needed here as we're using our own API
// const YOUTUBE_API_KEY = 'AIzaSyCl2hSa3ZZ2MIXBiyMZaWite5lIn3Snowg';
// const PICKUP_LIMES_CHANNEL_ID = 'UCq2E1mIwUKMWzCA4liA_XGQ';
// const RAINBOW_PLANT_LIFE_CHANNEL_ID = 'UCDbZvuDA_tZ6XP5wKKFuemQ';

// DOM Elements
const searchInput = document.getElementById('meal-search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('recipe-results');
const youtubeResults = document.getElementById('youtube-results');

// Tab Elements
const resultsTab = document.getElementById('results-tab');
const youtubeTab = document.getElementById('youtube-tab');
const resultsSection = document.getElementById('results-section');
const youtubeSection = document.getElementById('youtube-section');

// Event Listeners
searchButton.addEventListener('click', () => {
    // Determine which tab is active and perform the appropriate search
    const activeTab = document.querySelector('.tab-button.active').id;
    if (activeTab === 'results-tab') {
        performSearch();
    } else if (activeTab === 'youtube-tab') {
        fetchYoutubeVideos(searchInput.value);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // Determine which tab is active and perform the appropriate search
        const activeTab = document.querySelector('.tab-button.active').id;
        if (activeTab === 'results-tab') {
            performSearch();
        } else if (activeTab === 'youtube-tab') {
            fetchYoutubeVideos(searchInput.value);
        }
    }
});

// Tab switching event listeners
resultsTab.addEventListener('click', () => switchTab('results'));
youtubeTab.addEventListener('click', () => switchTab('youtube'));

window.addEventListener('DOMContentLoaded', () => {
    // State management event listeners
    window.addEventListener('savePageState', (event) => {
        if (event.detail.pageKey === 'meal-search') {
            const activeTab = document.querySelector('.tab-button.active')?.id === 'youtube-tab' ? 'youtube' : 'results';
            const state = {
                searchInput: searchInput ? searchInput.value : '',
                activeTab: activeTab,
                recipeResults: resultsContainer ? resultsContainer.innerHTML : '',
                youtubeResults: youtubeResults ? youtubeResults.innerHTML : ''
            };
            event.detail.saveState('meal-search', state);
        }
    });

    window.addEventListener('loadPageState', (event) => {
        if (event.detail.pageKey === 'meal-search') {
            const state = event.detail.loadState('meal-search');
            if (state) {
                // Restore search input
                if (searchInput && state.searchInput) {
                    searchInput.value = state.searchInput;
                }
                
                // Restore active tab
                if (state.activeTab) {
                    switchTab(state.activeTab);
                }
                
                // Restore recipe results
                if (state.recipeResults && resultsContainer) {
                    resultsContainer.innerHTML = state.recipeResults;
                    // Re-attach click events to recipe cards
                    reattachRecipeCardEvents();
                }
                
                // Restore YouTube results
                if (state.youtubeResults && youtubeResults) {
                    youtubeResults.innerHTML = state.youtubeResults;
                }
                
                return; // Skip default loading if state was restored
            }
        }
        
        // Only show default content if no state was restored
        if (!event.detail.loadState || !event.detail.loadState('meal-search')) {
            performSearch('');
            switchTab('results');
        }
    });
    
    // Listen for the clearPageInputs event to clear input fields when state is cleared
    window.addEventListener('clearPageInputs', () => {
        if (searchInput) {
            searchInput.value = '';
        }
    });
    
    // Show healthy meal recipes by default if no state loaded
    // This will be overridden by state loading if available
    setTimeout(() => {
        if (!window.StateManager || !window.StateManager.loadPageState('meal-search')) {
            performSearch('');
            switchTab('results');
        }
    }, 100);
});

async function performSearch(defaultQuery) {
    const query = typeof defaultQuery === 'string' ? defaultQuery : searchInput.value.trim();
    
    // Allow empty query to show all recipes
    // if (!query) return;
    
    clearResults();
    
    try {
        const params = new URLSearchParams({
            number: 500 // Increased number to show more recipes
        });
        
        // Only add query param if it's not empty
        if (query) params.append('query', query);
        
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

function formatTimeDisplay(timeString) {
    if (!timeString) return '';

    let days = 0;
    let hours = 0;
    let minutes = 0;

    const dayMatch = timeString.match(/(\d+)\s*day/i);
    if (dayMatch) {
        days = parseInt(dayMatch[1], 10);
    }

    const hourMatch = timeString.match(/(\d+)\s*hour/i);
    if (hourMatch) {
        hours = parseInt(hourMatch[1], 10);
    }

    const minMatch = timeString.match(/(\d+)\s*min/i);
    if (minMatch) {
        minutes = parseInt(minMatch[1], 10);
    }

    // If we couldn't parse anything, return original string.
    if (days === 0 && hours === 0 && minutes === 0 && !dayMatch && !hourMatch && !minMatch) {
        return timeString;
    }

    const parts = [];
    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} min`);
    }

    return parts.join(' ');
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('data-recipe-id', recipe.id);
    card.style.cursor = 'pointer';

    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" onerror="this.parentNode.remove()">
        <div class="recipe-card-content">
            <h3>${recipe.title}</h3>
            <div class="recipe-time">
                <span class="time-icon">⏱️</span>
                <span>${formatTimeDisplay(recipe.timeDisplay)}</span>
            </div>
        </div>
    `;
    
    // Add click event to the entire card
    card.addEventListener('click', () => {
        window.open(recipe.url, '_blank');
    });
    
    return card;
}

function clearResults() {
    resultsContainer.innerHTML = '';
}

function reattachRecipeCardEvents() {
    // Re-attach click events to recipe cards after restoring from state
    const recipeCards = resultsContainer.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        const recipeId = card.getAttribute('data-recipe-id');
        if (recipeId) {
            card.addEventListener('click', () => {
                // Try to get the recipe URL from the card's structure
                const img = card.querySelector('img');
            });
        }
    });
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
            fetchYoutubeVideos(searchInput.value);
        }
    }
    
    // Update the search button placeholder based on active tab
    if (tabName === 'results') {
        searchInput.placeholder = 'Search for recipes...';
    } else if (tabName === 'youtube') {
        searchInput.placeholder = 'Search for videos...';
    }
}

async function fetchYoutubeVideos(customQuery = '') {
    youtubeResults.innerHTML = '';
    
    try {
        // Use custom query if provided, otherwise use default food-related terms
        let searchTerms = customQuery.trim();
        if (!searchTerms) {
            // When no search query is provided, use a more specific food-related search
            searchTerms = 'recipe cooking meal healthy food';
        }
        
        console.log('Search terms being used:', searchTerms);
        
        // Use our local YouTube API instead of calling YouTube directly
        const url = `${YOUTUBE_API_URL}/videos?query=${encodeURIComponent(searchTerms)}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch videos');
        }
        
        if (!data.results || data.results.length === 0) {
            showError('No videos found matching your criteria.', youtubeResults);
            return;
        }
        
        // Display the videos
        displayYoutubeVideos(data.results);
        
    } catch (error) {
        showError('Failed to load YouTube videos. Please try again later.', youtubeResults);
        console.error('YouTube API error:', error);
    }
}

function displayYoutubeVideos(videos) {
    if (!videos || videos.length === 0) {
        showError('No videos found from our channels.', youtubeResults);
        return;
    }
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // Format the publish date
        const publishDate = new Date(video.published_at);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create a clickable thumbnail
        const thumbnailUrl = video.thumbnail_url;
        const videoId = video.video_id;
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
                    <img src="${thumbnailUrl}" alt="${video.title}" />
                    <div class="play-button"></div>
                </a>
            </div>
            <div class="video-info">
                <h3><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">${video.title}</a></h3>
            </div>
        `;
        
        youtubeResults.appendChild(videoCard);
    });
}