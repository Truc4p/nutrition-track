// Using local API instead of Spoonacular
const BASE_URL = 'http://127.0.0.1:5001/api/recipes';
const YOUTUBE_API_KEY = 'AIzaSyCl2hSa3ZZ2MIXBiyMZaWite5lIn3Snowg'; // You'll need to replace this with a valid YouTube API key
const PICKUP_LIMES_CHANNEL_ID = 'UCq2E1mIwUKMWzCA4liA_XGQ'; // Pick Up Limes channel ID
const RAINBOW_PLANT_LIFE_CHANNEL_ID = 'UCDbZvuDA_tZ6XP5wKKFuemQ'; // Rainbow Plant Life channel ID

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
    // Show healthy meal recipes by default
    performSearch('');
    // Set results tab as active by default
    switchTab('results');
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
            <div class="recipe-time">
                <span class="time-icon">⏱️</span>
                <span>${recipe.readyInMinutes || 30} mins</span>
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
        
        // Fetch videos from both channels and combine results
        // Always include food-related terms in the search
        const searchUrl1 = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${PICKUP_LIMES_CHANNEL_ID}&part=snippet,id&order=relevance&maxResults=20&type=video&videoDuration=medium&q=${encodeURIComponent(searchTerms)}`;
        const searchUrl2 = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${RAINBOW_PLANT_LIFE_CHANNEL_ID}&part=snippet,id&order=relevance&maxResults=20&type=video&videoDuration=medium&q=${encodeURIComponent(searchTerms)}`;
        
        console.log('Search URL 1:', searchUrl1);
        console.log('Search URL 2:', searchUrl2);
        
        const rainbowPlantLifeResponse = await fetch(searchUrl1);        
        const rainbowPlantLifeData = await rainbowPlantLifeResponse.json();
        
        const pickupLimesResponse = await fetch(searchUrl2);        
        const pickupLimesData = await pickupLimesResponse.json();
        
        console.log('Rainbow Plant Life API response:', rainbowPlantLifeData);
        console.log('Pick Up Limes API response:', pickupLimesData);
        
        // Combine results from both channels
        const data = {
            items: [...(rainbowPlantLifeData.items || []), ...(pickupLimesData.items || [])]
        };
        
        console.log('Total videos found:', data.items.length);
        
        if (data.items && data.items.length > 0) {
            // Get video IDs to fetch duration information
            const videoIds = data.items.map(video => video.id.videoId).join(',');
            console.log('Fetching duration for video IDs:', videoIds);
            
            // Fetch video details including duration
            const videoDetailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=contentDetails,snippet`);
            const videoDetailsData = await videoDetailsResponse.json();
            
            console.log('Video details response:', videoDetailsData);
            
            if (!videoDetailsData.items) {
                console.error('No video details found');
                showError('Failed to load video details.', youtubeResults);
                return;
            }
            
            // Filter out YouTube Shorts (videos shorter than 60 seconds)
            const longFormVideos = videoDetailsData.items.filter(video => {
                const duration = video.contentDetails.duration;
                const durationInSeconds = parseDuration(duration);
                console.log(`Video: ${video.snippet.title}, Duration: ${duration}, Seconds: ${durationInSeconds}`);
                
                // Multiple criteria to filter out shorts:
                // 1. Duration less than 60 seconds
                // 2. Check if video title contains "#shorts" or similar indicators
                // 3. Video aspect ratio (though this isn't always available in basic API)
                
                const title = video.snippet.title.toLowerCase();
                const description = video.snippet.description.toLowerCase();
                
                // Check for shorts indicators in title/description
                const hasShortsIndicator = title.includes('#shorts') || 
                                         title.includes('#short') || 
                                         description.includes('#shorts') || 
                                         description.includes('#short') ||
                                         title.includes('shorts') ||
                                         title.includes('short');
                
                const isLongForm = durationInSeconds >= 60 && !hasShortsIndicator;
                
                if (!isLongForm) {
                    console.log(`Filtering out video: ${video.snippet.title} (${durationInSeconds}s, hasShortsIndicator: ${hasShortsIndicator})`);
                }
                
                return isLongForm;
            });
            
            console.log(`Filtered ${data.items.length} videos down to ${longFormVideos.length} long-form videos`);
            
            // Additional client-side filtering to ensure we only get food-related videos
            const foodKeywords = ['healthy', 'vegan', 'vegetarian', 'plant', 'nutrition', 'diet', 'salad', 'smoothie', 'green', 'meal', 'dish'];
            
            const filteredVideos = longFormVideos.filter(video => {
                const title = video.snippet.title.toLowerCase();
                const description = video.snippet.description.toLowerCase();
                
                // Check if any food keyword is found
                const hasFoodKeyword = foodKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
                
                console.log(`Video: "${video.snippet.title}"`);
                console.log(`  Title: "${title}"`);
                console.log(`  Description preview: "${description.substring(0, 100)}..."`);
                console.log(`  Has food keyword: ${hasFoodKeyword}`);
                
                if (!hasFoodKeyword) {
                    console.log(`  ❌ FILTERED OUT: No food keywords found`);
                } else {
                    console.log(`  ✅ PASSED: Contains food keywords`);
                }
                
                return hasFoodKeyword;
            });

            console.log(`After food keyword filtering: ${filteredVideos.length} videos`);

            // Limit to 40 videos after filtering
            const limitedVideos = filteredVideos.slice(0, 40);
            
            if (limitedVideos.length > 0) {
                displayYoutubeVideos(limitedVideos);
            } else {
                showError('No food-related videos found from our channels.', youtubeResults);
            }
        } else {
            showError('No videos found from our channels.', youtubeResults);
        }
    } catch (error) {
        showError('Failed to load YouTube videos. Please try again later.', youtubeResults);
        console.error('YouTube API error:', error);
    }
}

// Helper function to parse YouTube duration format (PT4M13S) to seconds
function parseDuration(duration) {
    if (!duration) {
        console.warn('No duration provided');
        return 0;
    }
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) {
        console.warn('Could not parse duration:', duration);
        return 0;
    }
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds;
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
        const publishDate = new Date(video.snippet.publishedAt);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create a clickable thumbnail instead of an iframe
        const thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
        const videoId = video.id; // Changed from video.id.videoId since we're now using videos API
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
                    <img src="${thumbnailUrl}" alt="${video.snippet.title}" />
                    <div class="play-button"></div>
                </a>
            </div>
            <div class="video-info">
                <h3><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">${video.snippet.title}</a></h3>
                <p>${video.snippet.description}</p>
                <p class="video-date">Published: ${formattedDate}</p>
            </div>
        `;
        
        youtubeResults.appendChild(videoCard);
    });
}