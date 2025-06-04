// Using Pick Up Limes website directly instead of local API
const PICKUP_LIMES_BASE_URL = 'https://www.pickuplimes.com/recipe/?sb=&public=on';
const CORS_PROXY = 'https://api.allorigins.win/raw?url='; // CORS proxy to bypass browser restrictions
const YOUTUBE_API_KEY = 'AIzaSyCl2hSa3ZZ2MIXBiyMZaWite5lIn3Snowg'; // You'll need to replace this with a valid YouTube API key
const PICKUP_LIMES_CHANNEL_ID = 'UCq2E1mIwUKMWzCA4liA_XGQ'; // Pick Up Limes channel ID
const RAINBOW_PLANT_LIFE_CHANNEL_ID = 'UCDbZvuDA_tZ6XP5wKKFuemQ'; // Rainbow Plant Life channel ID

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

// Cache for recipes to avoid repeated requests
let cachedRecipes = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    // Show recipes by default
    performSearch();
    // Set results tab as active by default
    switchTab('results');
});

async function fetchPickUpLimesRecipes() {
    try {
        // Check if we have cached data that's still fresh
        const now = Date.now();
        if (cachedRecipes.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
            console.log('Using cached recipes');
            return cachedRecipes;
        }

        console.log('Fetching fresh recipes from Pick Up Limes...');
        
        // Use CORS proxy to fetch the Pick Up Limes recipe page
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(PICKUP_LIMES_BASE_URL)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('Fetched HTML length:', html.length);
        
        // Parse the HTML to extract recipe data
        const recipes = parsePickUpLimesHTML(html);
        
        // Cache the results
        cachedRecipes = recipes;
        lastFetchTime = now;
        
        console.log('Extracted recipes:', recipes.length);
        return recipes;
        
    } catch (error) {
        console.error('Error fetching Pick Up Limes recipes:', error);
        
        // If there's an error but we have cached data, use it
        if (cachedRecipes.length > 0) {
            console.log('Using cached recipes due to fetch error');
            return cachedRecipes;
        }
        
        throw error;
    }
}

function parsePickUpLimesHTML(html) {
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const recipes = [];
    
    // Look for recipe cards - Pick Up Limes uses specific selectors
    // Based on the HTML structure from the search results
    const recipeElements = doc.querySelectorAll('a[href*="/recipe/"]');
    
    recipeElements.forEach((element, index) => {
        try {
            const link = element.href;
            
            // Skip if this is not a proper recipe link
            if (!link || link.includes('?') || !link.includes('/recipe/')) return;
            
            // Extract recipe name from the link or text content
            let name = '';
            const titleElement = element.querySelector('h3, .recipe-title, [class*="title"]');
            if (titleElement) {
                name = titleElement.textContent.trim();
            } else {
                // Fallback: extract from URL
                const urlParts = link.split('/');
                const recipePart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
                name = recipePart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            
            if (!name) return;
            
            // Extract image
            let image = '';
            const imgElement = element.querySelector('img');
            if (imgElement) {
                image = imgElement.src || imgElement.getAttribute('data-src') || '';
                // Convert relative URLs to absolute
                if (image && image.startsWith('/')) {
                    image = 'https://www.pickuplimes.com' + image;
                }
            }
            
            // Extract time information if available
            let cookingTime = '';
            const timeElement = element.querySelector('[class*="time"], .duration, .cook-time');
            if (timeElement) {
                cookingTime = timeElement.textContent.trim();
            }
            
            // Extract tags/categories
            const tags = [];
            const tagElements = element.querySelectorAll('[class*="tag"], [class*="category"], .badge');
            tagElements.forEach(tag => {
                const tagText = tag.textContent.trim();
                if (tagText && !tags.includes(tagText)) {
                    tags.push(tagText);
                }
            });
            
            // Create recipe object
            const recipe = {
                id: index + 1,
                title: name,
                image: image,
                url: link.startsWith('http') ? link : `https://www.pickuplimes.com${link}`,
                cookingTime: cookingTime,
                tags: tags,
                source: 'Pick Up Limes'
            };
            
            recipes.push(recipe);
            
        } catch (error) {
            console.error('Error parsing recipe element:', error);
        }
    });
    
    // If we didn't find recipes with the above method, try alternative parsing
    if (recipes.length === 0) {
        console.log('No recipes found with primary method, trying alternative parsing...');
        
        // Look for any links that might contain recipe information
        const allLinks = doc.querySelectorAll('a');
        allLinks.forEach((link, index) => {
            const href = link.href || link.getAttribute('href');
            if (href && href.includes('/recipe/') && !href.includes('?')) {
                const text = link.textContent.trim();
                if (text && text.length > 3) {
                    recipes.push({
                        id: index + 1,
                        title: text,
                        image: '',
                        url: href.startsWith('http') ? href : `https://www.pickuplimes.com${href}`,
                        cookingTime: '',
                        tags: [],
                        source: 'Pick Up Limes'
                    });
                }
            }
        });
    }
    
    // Remove duplicates based on title
    const uniqueRecipes = [];
    const seenTitles = new Set();
    
    recipes.forEach(recipe => {
        if (!seenTitles.has(recipe.title)) {
            seenTitles.add(recipe.title);
            uniqueRecipes.push(recipe);
        }
    });
    
    return uniqueRecipes.slice(0, 50); // Limit to 50 recipes
}

async function performSearch(defaultQuery) {
    const query = typeof defaultQuery === 'string' ? defaultQuery : searchInput.value.trim();
    const diet = dietFilter.value;
    
    clearResults();
    
    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    loadingDiv.innerHTML = '<p>Fetching fresh recipes from Pick Up Limes...</p>';
    resultsContainer.appendChild(loadingDiv);
    
    try {
        // Fetch recipes from Pick Up Limes
        const allRecipes = await fetchPickUpLimesRecipes();
        
        // Filter recipes based on search query and diet filter
        let filteredRecipes = allRecipes;
        
        if (query) {
            filteredRecipes = allRecipes.filter(recipe => 
                recipe.title.toLowerCase().includes(query.toLowerCase()) ||
                recipe.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
        }
        
        if (diet) {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.tags.some(tag => tag.toLowerCase().includes(diet.toLowerCase())) ||
                (diet === 'vegetarian' && recipe.tags.some(tag => 
                    tag.toLowerCase().includes('vegetarian') || tag.toLowerCase().includes('plant')
                )) ||
                (diet === 'vegan' && recipe.tags.some(tag => 
                    tag.toLowerCase().includes('vegan') || tag.toLowerCase().includes('plant')
                )) ||
                (diet === 'gluten-free' && recipe.tags.some(tag => 
                    tag.toLowerCase().includes('gluten') && tag.toLowerCase().includes('free')
                ))
            );
        }
        
        // Clear loading message
        clearResults();
        
        if (filteredRecipes.length === 0) {
            showError(`No recipes found matching your criteria. Found ${allRecipes.length} total recipes from Pick Up Limes.`);
        } else {
            console.log(`Displaying ${filteredRecipes.length} recipes`);
            displayResults(filteredRecipes);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        clearResults();
        showError(`Failed to fetch recipes from Pick Up Limes: ${error.message}. Please try again later.`);
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
    
    // Create tags HTML
    const tagsHTML = recipe.tags.length > 0 
        ? `<div class="recipe-tags">${recipe.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}</div>`
        : '';
    
    // Create cooking time HTML
    const cookingTimeHTML = recipe.cookingTime 
        ? `<div class="cooking-time"><i class="time-icon">⏱️</i> ${recipe.cookingTime}</div>`
        : '';
    
    card.innerHTML = `
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" onerror="this.style.display='none'">` : '<div class="no-image">No Image Available</div>'}
        <div class="recipe-card-content">
            <h3>${recipe.title}</h3>
            ${cookingTimeHTML}
            ${tagsHTML}
            <div class="recipe-source">Source: ${recipe.source}</div>
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
    errorDiv.innerHTML = `<p>${message}</p>`;
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