// Using local API 
const BASE_URL = '/api/recipes';
const YOUTUBE_API_URL = '/api/youtube';

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

// Event Listeners - Add flag to prevent duplicate listeners
let eventListenersAdded = false;

function addEventListeners() {
    if (eventListenersAdded) return;
    
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', handleKeyPress);
    resultsTab.addEventListener('click', () => switchTab('results'));
    youtubeTab.addEventListener('click', () => switchTab('youtube'));
    
    eventListenersAdded = true;
}

function handleSearch() {
    const activeTab = document.querySelector('.tab-button.active').id;
    if (activeTab === 'results-tab') {
        performSearch();
    } else if (activeTab === 'youtube-tab') {
        fetchYoutubeVideos(searchInput.value);
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-button.active').id;
        if (activeTab === 'results-tab') {
            performSearch();
        } else if (activeTab === 'youtube-tab') {
            fetchYoutubeVideos(searchInput.value);
        }
    }
}

// Track initialization state
let domContentLoaded = false;

window.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple initializations
    if (domContentLoaded) {
        return;
    }
    domContentLoaded = true;
    
    // Add event listeners only once
    addEventListeners();
    
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
                    // Clear first to prevent duplicates
                    resultsContainer.innerHTML = '';
                    resultsContainer.innerHTML = state.recipeResults;
                    // Re-attach click events to recipe cards
                    reattachRecipeCardEvents();
                }
                
                // Restore YouTube results
                if (state.youtubeResults && youtubeResults) {
                    // Clear first to prevent duplicates
                    youtubeResults.innerHTML = '';
                    youtubeResults.innerHTML = state.youtubeResults;
                }
                
                return; // Skip default loading if state was restored
            }
        }
        
        // Only show default content if no state was restored
        const loadedState = event.detail.loadState && event.detail.loadState('meal-search');
        if (!loadedState) {
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
        const stateLoaded = window.StateManager && window.StateManager.loadPageState('meal-search');
        if (!stateLoaded) {
            // Only perform default search if no state was loaded
            performSearch('');
            switchTab('results');
        }
    }, 100);
});

// Flag to prevent multiple simultaneous recipe search calls
let isLoadingRecipes = false;

async function performSearch(defaultQuery) {
    // Prevent multiple simultaneous calls
    if (isLoadingRecipes) {
        return;
    }
    
    isLoadingRecipes = true;
    const query = typeof defaultQuery === 'string' ? defaultQuery : searchInput.value.trim();
    
    // Clear results at the beginning to prevent duplicates
    clearResults(resultsContainer);
    
    try {
        const params = new URLSearchParams({
            number: 80 // Increased number to show more recipes
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
        
        if (recipesWithImages.length === 0) {
            showError('No recipes found matching your criteria. Try a different search term.');
        } else {
            displayResults(recipesWithImages);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message);
    } finally {
        // Reset the loading flag
        isLoadingRecipes = false;
    }
}

function displayResults(recipes) {
    // Clear existing results first to prevent duplicates
    clearResults(resultsContainer);
    
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
    card.setAttribute('data-recipe-url', recipe.url || '');
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
        if (recipe.url) {
            window.open(recipe.url, '_blank');
        }
    });
    
    return card;
}

function clearResults(container = resultsContainer) {
    if (container) {
        container.innerHTML = '';
    }
}

function reattachRecipeCardEvents() {
    // Re-attach click events to recipe cards after restoring from state
    const recipeCards = resultsContainer.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        const recipeUrl = card.getAttribute('data-recipe-url');
        if (recipeUrl) {
            // Add click event to open external recipe URL in new tab
            card.addEventListener('click', () => {
                window.open(recipeUrl, '_blank');
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
        
        // Check if recipes section is empty, if so, load recipes
        if (!resultsContainer.children.length) {
            performSearch(searchInput.value || '');
        }
    } else if (tabName === 'youtube') {
        youtubeTab.classList.add('active');
        youtubeSection.classList.add('active');
        
        // Always fetch new videos when switching to YouTube tab
        // This ensures we have fresh results and prevents stale/duplicate content
        fetchYoutubeVideos(searchInput.value);
    }
    
    // Update the search button placeholder based on active tab
    if (tabName === 'results') {
        searchInput.placeholder = 'Search for recipes...';
    } else if (tabName === 'youtube') {
        searchInput.placeholder = 'Search for videos...';
    }
}

// Flag to prevent multiple simultaneous YouTube API calls
let isLoadingYoutubeVideos = false;

// Keep track of the last videos displayed to prevent duplicates
let lastDisplayedVideoIds = [];

async function fetchYoutubeVideos(customQuery = '') {
    // Prevent multiple simultaneous calls
    if (isLoadingYoutubeVideos) {
        return;
    }
    
    isLoadingYoutubeVideos = true;
    const query = customQuery || searchInput.value.trim();
    
    // Clear results at the beginning to prevent duplicates
    clearResults(youtubeResults);
    
    try {
        const params = new URLSearchParams({
            query: query || 'healthy recipes',
            limit: 40
        });
        
        const url = `${YOUTUBE_API_URL}/videos?${params}`;
        console.log('Fetching YouTube videos from:', url);
        
        const response = await fetch(url);
        console.log('YouTube response status:', response.status);
        
        const data = await response.json();
        console.log('Received YouTube data:', data);
        
        if (!response.ok) throw new Error(data.message || 'Failed to fetch videos');
        
        if (!data.results || data.results.length === 0) {
            showError('No videos found matching your criteria. Try a different search term.', youtubeResults);
        } else {
            displayYoutubeVideos(data.results);
        }
    } catch (error) {
        console.error('YouTube search error:', error);
        showError('Failed to load YouTube videos. Please try again later.', youtubeResults);
    } finally {
        // Reset the loading flag
        isLoadingYoutubeVideos = false;
    }
}

function displayYoutubeVideos(videos) {
    if (!videos || videos.length === 0) {
        showError('No videos found from our channels.', youtubeResults);
        return;
    }
    
    // Clear existing videos first to prevent duplicates
    clearResults(youtubeResults);
    
    // Reset the list of displayed video IDs
    lastDisplayedVideoIds = [];
    
    // Create a document fragment to improve performance
    const fragment = document.createDocumentFragment();
    
    videos.forEach(video => {
        // Skip if we've already added this video (prevent duplicates)
        if (lastDisplayedVideoIds.includes(video.video_id)) {
            return;
        }
        
        // Add to the list of displayed videos
        lastDisplayedVideoIds.push(video.video_id);
        
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
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
        
        // Add to fragment instead of directly to DOM
        fragment.appendChild(videoCard);
    });
    
    // Add all videos at once for better performance
    youtubeResults.appendChild(fragment);
    
    console.log('Finished adding videos, final count:', youtubeResults.children.length);
}