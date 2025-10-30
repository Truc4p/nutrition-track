// --- DOM Elements ---
const foodInput = document.getElementById('food-input');
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const foodListContainer = document.getElementById('food-list');
const totalsSection = document.getElementById('totals-section');

// Image upload elements
const mealImageInput = document.getElementById('meal-image-input');
const uploadImageButton = document.getElementById('upload-image-button');
const analyzeImageButton = document.getElementById('analyze-image-button');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageButton = document.getElementById('remove-image-button');

document.addEventListener('DOMContentLoaded', () => {
    // State management event listeners
    window.addEventListener('savePageState', (event) => {
        if (event.detail.pageKey === 'home') {
            const state = {
                foodInput: foodInput ? foodInput.value : '',
                foods: foods || [],
                addedFoods: addedFoods || []
                };

            event.detail.saveState('home', state);
        }
    });

    window.addEventListener('loadPageState', (event) => {
        if (event.detail.pageKey === 'home') {
            const state = event.detail.loadState('home');
            if (state) {
                // Restore input field
                if (foodInput && state.foodInput) {
                    foodInput.value = state.foodInput;
                    handleInputChange(); // Update button state
                }
                
                // Restore foods array and update UI
                if (state.foods) {
                    foods = state.foods;
                    updateUI();
                    calculateAndDisplayTotals();
                }
                
                // Restore other state
                if (state.addedFoods) {
                    addedFoods = state.addedFoods;
                }
            }
        }
    });
    
    // Listen for the clearPageInputs event to clear input fields when state is cleared
    window.addEventListener('clearPageInputs', () => {
        if (foodInput) {
            foodInput.value = '';
            handleInputChange(); // Update button state
        }
        
        // Reset foods and addedFoods arrays
        foods = [];
        addedFoods = [];
        
        // Clear UI
        if (foodListContainer) {
            foodListContainer.innerHTML = '';
        }
        if (totalsSection) {
            totalsSection.innerHTML = '';
        }
        if (resultsHeader) {
            resultsHeader.style.display = 'none';
        }
    });
});

// --- State ---
let foods = [];
let isLoading = false;

// Django NLP API Configuration
const DJANGO_API_URL = '/nlp/process_text/';

// USDA API Configuration
const USDA_API_KEY = '7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_DETAIL_URL = 'https://api.nal.usda.gov/fdc/v1/food';

// Local USDA Database Configuration (faster!)
const USDA_LOCAL_SEARCH_URL = '/api/usda/search';
const USDA_LOCAL_DETAIL_URL = '/api/usda/food';
let USE_LOCAL_USDA = true; // Try local database first, fallback to API if unavailable

// Add these variables at the top with other declarations
let selectedFood = null;
let addedFoods = [];

// Helper function to get nutrient group from the 9-group structure
function getNutrientGroup(nutrientName) {
    // Try to get nutrient info from the database first
    let category = null;
    
    // Get nutrient info from the database
    if (typeof window !== 'undefined' && window.NutrientDatabase) {
        const nutrientInfo = window.NutrientDatabase.getNutrientInfo(nutrientName);
        if (nutrientInfo && nutrientInfo.category) {
            category = nutrientInfo.category;
        }
    }
    
    // Fallback to NUTRIENT_DATABASE if available
    if (!category && typeof NUTRIENT_DATABASE !== 'undefined') {
        if (NUTRIENT_DATABASE[nutrientName]) {
            category = NUTRIENT_DATABASE[nutrientName].category;
        } else {
            // Try case-insensitive match
            const lowerNutrientName = nutrientName.toLowerCase();
            for (const [key, value] of Object.entries(NUTRIENT_DATABASE)) {
                if (key.toLowerCase() === lowerNutrientName) {
                    category = value.category;
                    break;
                }
            }
        }
    }
    
    // Map categories to the 9 major groups
    const categoryToGroup = {
        // GROUP 1: ENERGY & FOUNDATION
        'Energy': 'GROUP 1: ENERGY & FOUNDATION',
        'Basic Components': 'GROUP 1: ENERGY & FOUNDATION',
        
        // GROUP 2: MACRONUTRIENTS
        'Macronutrients': 'GROUP 2: MACRONUTRIENTS',
        
        // GROUP 3: VITAMINS
        'Fat-Soluble Vitamins': 'GROUP 3: VITAMINS',
        'Water-Soluble Vitamins': 'GROUP 3: VITAMINS',
        'B Vitamins': 'GROUP 3: VITAMINS',
        'Vitamin E': 'GROUP 3: VITAMINS',
        'Folate': 'GROUP 3: VITAMINS',
        
        // GROUP 4: MINERALS
        'Major Minerals': 'GROUP 4: MINERALS',
        'Trace Minerals': 'GROUP 4: MINERALS',
        
        // GROUP 5: CARBOHYDRATES
        'Fiber': 'GROUP 5: CARBOHYDRATES',
        'Sugars': 'GROUP 5: CARBOHYDRATES',
        'Complex Carbohydrates': 'GROUP 5: CARBOHYDRATES',
        
        // GROUP 6: LIPIDS & FATS
        'Lipids': 'GROUP 6: LIPIDS & FATS',
        'Fatty Acid Totals': 'GROUP 6: LIPIDS & FATS',
        'Saturated Fatty Acids': 'GROUP 6: LIPIDS & FATS',
        'Monounsaturated Fatty Acids': 'GROUP 6: LIPIDS & FATS',
        'Polyunsaturated Fatty Acids': 'GROUP 6: LIPIDS & FATS',
        'Trans Fatty Acids': 'GROUP 6: LIPIDS & FATS',
        'Phytosterols': 'GROUP 6: LIPIDS & FATS',
        
        // GROUP 7: PROTEINS
        'Amino Acids': 'GROUP 7: PROTEINS',
        
        // GROUP 8: BIOACTIVE COMPOUNDS
        'Carotenoids': 'GROUP 8: BIOACTIVE COMPOUNDS',
        'Choline': 'GROUP 8: BIOACTIVE COMPOUNDS',
        'Isoflavones': 'GROUP 8: BIOACTIVE COMPOUNDS',
        
        // GROUP 9: MISCELLANEOUS
        'Other Compounds': 'GROUP 9: MISCELLANEOUS',
        'Organic Acids': 'GROUP 9: MISCELLANEOUS'
    };
    
    return categoryToGroup[category] || 'GROUP 9: MISCELLANEOUS';
}

// --- Event Listeners ---
if (foodInput) {
    foodInput.addEventListener('input', handleInputChange);
}
if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
}

// Image upload event listeners
if (uploadImageButton) {
    uploadImageButton.addEventListener('click', () => {
        mealImageInput.click();
    });
}

if (mealImageInput) {
    mealImageInput.addEventListener('change', handleImageSelect);
}

if (removeImageButton) {
    removeImageButton.addEventListener('click', handleRemoveImage);
}

if (analyzeImageButton) {
    analyzeImageButton.addEventListener('click', handleAnalyzeImage);
}

// --- Functions ---

// Image upload handling functions
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            analyzeImageButton.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }
}

function handleRemoveImage() {
    mealImageInput.value = '';
    previewImg.src = '';
    imagePreview.style.display = 'none';
    analyzeImageButton.style.display = 'none';
}

async function handleAnalyzeImage() {
    const file = mealImageInput.files[0];
    if (!file) return;

    setLoading(true);
    
    try {
        // Convert image to base64
        const base64Image = await fileToBase64(file);
        
        // Remove the data URL prefix to get just the base64 string
        const base64Data = base64Image.split(',')[1];
        
        // Send to server for Gemini analysis
        const response = await fetch('/ai/analyze-meal-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Data,
                mimeType: file.type
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Parse the response and populate the food input
        if (result.analysis) {
            foodInput.value = result.analysis;
            handleInputChange();
            
            // Optionally auto-submit the analysis
            // await handleSubmit();
        }
        
    } catch (error) {
        console.error('Error analyzing image:', error);
        alert(`Failed to analyze image: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Enable/disable buttons based on input
function handleInputChange() {
    const isEmpty = foodInput.value.trim() === '';
    submitButton.disabled = isEmpty;
}

// Handle form submission
async function handleSubmit() {
    const inputText = foodInput.value.trim();
    if (!inputText) return;

    setLoading(true);
    await processText(inputText);
    setLoading(false);
    // UI is already updated progressively in processText, no need to call updateUI here
}

// Show/hide loading indicator
function setLoading(loading) {
    isLoading = loading;
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    submitButton.disabled = isLoading; // Disable submit while loading
}

// Process text using Django NLP API to extract food information
async function extractFoodsWithDjangoAPI(inputText) {
    console.log('🤖 Starting Django NLP text extraction...');
    
    try {
        const response = await fetch(DJANGO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText
            })
        });
        
        if (!response.ok) {
            throw new Error(`Django API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🤖 Django NLP response:', result);
        
        if (!result.ingredients || !Array.isArray(result.ingredients)) {
            throw new Error('Invalid response format from Django NLP API');
        }
        
        // Convert Django NLP format to our expected format
        const extractedFoods = result.ingredients.map(ingredient => ({
            name: ingredient.food_name,
            originalName: ingredient.food_name,
            quantity: ingredient.quantity,
            unit: ingredient.measurement_type
        }));
        
        console.log('✅ Extracted food items:', extractedFoods);
        return extractedFoods;
        
    } catch (error) {
        console.error('💥 Django NLP extraction error:', error);
        throw error;
    }
}

// Search USDA database for a food item using multiple strategies
async function searchUSDAFood(foodName) {
    console.log(`🔍 Searching USDA for: ${foodName}`);
    
    // Try multiple search strategies in order of preference
    const searchStrategies = [
        // Strategy 1: Exact search
        foodName,
        
        // Strategy 2: Remove color descriptors but keep main food words
        // "red bell pepper" -> "bell pepper", "red onion" -> "onion"
        foodName.replace(/\b(red|green|yellow|orange|white|purple|black|brown)\s+/gi, '').trim(),
        
        // Strategy 3: Remove both color AND "bell" for peppers (USDA uses "peppers" not "bell peppers")
        // "red bell pepper" -> "pepper", "bell pepper" -> "pepper"
        foodName.replace(/\b(red|green|yellow|orange|white|purple|black|brown|bell)\s+/gi, '').trim(),
        
        // Strategy 4: Clean version (remove cooking descriptors)
        foodName.replace(/\b(raw|cooked|fresh|frozen|dried|steamed|baked|grilled|fried|boiled|roasted)\b/gi, '').trim(),
        
        // Strategy 5: For compound foods, try just the last significant word
        // "red bell pepper" -> "pepper", "red onion" -> "onion"
        (() => {
            const words = foodName.split(/[\s,]+/);
            return words[words.length - 1];
        })(),
        
        // Strategy 6: Common variations
        foodName.replace(/\bs\b/gi, ''), // Remove plural 's'
        foodName.replace(/\b(chicken|beef|pork|fish)\s+(breast|thigh|leg|fillet)\b/gi, '$1, $2'), // "chicken breast" -> "chicken, breast"
    ];
    
    // Remove duplicates and empty strings
    const uniqueStrategies = [...new Set(searchStrategies)].filter(term => term && term.trim().length > 0);
    
    console.log(`🔍 Will try ${uniqueStrategies.length} search strategies: ${uniqueStrategies.map(s => `"${s}"`).join(', ')}`);
    
    // Try each search strategy
    for (let i = 0; i < uniqueStrategies.length; i++) {
        const searchTerm = uniqueStrategies[i];
        console.log(`🔍 Strategy ${i + 1}: Searching for "${searchTerm}"`);
        
        try {
            let data;
            
            // Try local database first if available
            if (USE_LOCAL_USDA) {
                try {
                    const localResponse = await fetch(
                        `${USDA_LOCAL_SEARCH_URL}?query=${encodeURIComponent(searchTerm)}&limit=20`
                    );
                    
                    if (localResponse.ok) {
                        const localData = await localResponse.json();
                        if (localData.success) {
                            console.log(`⚡ Using LOCAL database (fast!)`);
                            data = { foods: localData.foods };
                        } else if (localData.fallback_to_api) {
                            console.log(`⚠️ Local DB not available, falling back to API`);
                            USE_LOCAL_USDA = false; // Disable for future requests this session
                        }
                    }
                } catch (localError) {
                    console.log(`⚠️ Local DB error, falling back to API: ${localError.message}`);
                    USE_LOCAL_USDA = false;
                }
            }
            
            // Fallback to USDA API if local not available
            if (!data) {
                const response = await fetch(
                    `${USDA_API_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchTerm)}&pageSize=20`
                );
                
                if (!response.ok) {
                    console.log(`⚠️ Strategy ${i + 1} failed: HTTP ${response.status}`);
                    continue;
                }
                
                data = await response.json();
            }
            
            const foods = data.foods || [];
            
            console.log(`📊 Strategy ${i + 1} returned ${foods.length} results for "${searchTerm}"`);
            
            if (foods.length === 0) {
                console.log(`⚠️ Strategy ${i + 1}: No results found`);
                continue;
            }
            
            // Find the best match using intelligent scoring
            const bestMatch = findBestFoodMatch(foodName, foods);
            
            if (bestMatch) {
                console.log(`✅ Found USDA match with Strategy ${i + 1}: ${bestMatch.food.description} (${bestMatch.food.dataType}) - Score: ${bestMatch.score.toFixed(2)}`);
                return bestMatch.food;
            }
            
            console.log(`⚠️ Strategy ${i + 1}: No suitable matches found`);
            
        } catch (error) {
            console.log(`❌ Strategy ${i + 1} failed: ${error.message}`);
            continue;
        }
    }
    
    console.log(`❌ All search strategies failed for: ${foodName}`);
    return null;
}

// Intelligent food matching using multiple criteria
function findBestFoodMatch(originalFoodName, usdaFoods) {
    const originalLower = originalFoodName.toLowerCase().trim();
    const originalWords = originalLower.split(/[\s,.-]+/).filter(w => w.length > 0);
    
    console.log(`🎯 Finding best match for "${originalFoodName}" from ${usdaFoods.length} options`);
    console.log(`🎯 Original words: [${originalWords.join(', ')}]`);
    
    // Identify key food words (not color descriptors or common modifiers)
    const colorWords = ['red', 'green', 'yellow', 'orange', 'white', 'purple', 'black', 'brown'];
    const modifierWords = ['raw', 'cooked', 'fresh', 'frozen', 'dried', 'steamed', 'baked', 'grilled', 'fried', 'boiled', 'roasted'];
    const keyFoodWords = originalWords.filter(word => 
        !colorWords.includes(word) && !modifierWords.includes(word)
    );
    
    console.log(`🎯 Key food words (excluding colors/modifiers): [${keyFoodWords.join(', ')}]`);
    
    const scoredFoods = usdaFoods.map(food => {
        const description = food.description.toLowerCase();
        let score = 0;
        
        // Scoring factors:
        
        // 1. Data type preference (HIGHEST PRIORITY - heavily favor government data over branded)
        if (food.dataType === 'Foundation') {
            score += 1000; // Massive boost for Foundation data
        } else if (food.dataType === 'SR Legacy') {
            score += 950; // Very high boost for SR Legacy
        } else if (food.dataType === 'Survey (FNDDS)') {
            score += 900; // High boost for FNDDS
        } else if (food.dataType === 'Branded') {
            score += 10; // Very low base score for branded items
            
            // Heavy penalty for overly simple branded descriptions
            const wordCount = description.split(/\s+/).length;
            if (wordCount <= 1) {
                score -= 500; // Massive penalty for single-word branded items
            }
        }
        
        // 2. CRITICAL: Must contain ALL key food words (not just any words)
        const containsAllKeyWords = keyFoodWords.every(word => description.includes(word));
        if (!containsAllKeyWords) {
            score -= 800; // Massive penalty if missing key food words
            console.log(`   ⚠️ "${description}" missing key food words - heavy penalty`);
        } else {
            score += 100; // Big bonus for having all key words
            console.log(`   ✅ "${description}" contains all key food words`);
        }
        
        // 3. Exact match bonus (but much lower than data type preference)
        if (description === originalLower) {
            score += 50;
        }
        
        // 4. Contains all original words (including color/modifiers)
        const containsAllWords = originalWords.every(word => description.includes(word));
        if (containsAllWords) {
            score += 30;
        }
        
        // 5. Word match ratio (how many original words are found)
        const foundWords = originalWords.filter(word => description.includes(word));
        const wordMatchRatio = foundWords.length / originalWords.length;
        score += wordMatchRatio * 20;
        
        // 6. Starts with original food name or key food words
        if (description.startsWith(originalLower)) {
            score += 15;
        } else if (keyFoodWords.length > 0 && keyFoodWords.some(word => description.startsWith(word))) {
            score += 10;
        }
        
        // 7. Description quality checks
        const wordCount = description.split(/\s+/).length;
        if (wordCount > 8) {
            score -= 10; // Penalize very long descriptions
        }
        
        // 8. Bonus for descriptive, detailed names
        if (wordCount >= 3 && wordCount <= 6) {
            score += 10; // Bonus for appropriately detailed descriptions
        }
        
        // 9. Bonus for common preparation states if original doesn't specify
        const hasPreparation = /\b(raw|cooked|fresh|frozen|dried|steamed|baked|grilled|fried|boiled|roasted)\b/i.test(originalLower);
        if (!hasPreparation) {
            // Prefer "raw" for fruits/vegetables, "cooked" for meats/grains
            const isFruitVegetable = /\b(apple|banana|orange|grape|berry|lettuce|spinach|carrot|tomato|pepper|onion|garlic|broccoli)\b/i.test(originalLower);
            const isMeatGrain = /\b(chicken|beef|pork|fish|salmon|rice|pasta|bread|oat)\b/i.test(originalLower);
            
            if (isFruitVegetable && /\braw\b/i.test(description)) {
                score += 8;
            } else if (isMeatGrain && /\b(cooked|baked|grilled)\b/i.test(description)) {
                score += 8;
            }
        }
        
        // 10. Penalize branded/restaurant items for generic searches
        if (food.dataType === 'Branded' && /\b(brand|restaurant|company|inc|llc|corp)\b/i.test(description)) {
            score -= 15;
        }
        
        // 10b. CRITICAL: Penalize processed/prepared/fried foods - applies to ALL searches
        const processedFoodTerms = [
            'rings', 'fried', 'breaded', 'battered', 'par fried', 
            'fast food', 'restaurant', 'snacks', 'chips', 'crackers',
            'pickled', 'jarred', 'bottled',
            'sandwich', 'burger', 'pizza', 'taco', 'sub',
            'candy', 'dessert', 'cake', 'cookie', 'ice cream'
        ];
        
        const hasProcessedTerms = processedFoodTerms.some(term => description.includes(term));
        if (hasProcessedTerms) {
            score -= 700; // Massive penalty for processed/fried foods
            console.log(`   ⚠️⚠️ Penalizing "${description}" for being processed/fried food (-700)`);
        }
        
        // 10c. Big bonus for raw/fresh whole foods
        const isWholeFood = /\b(raw|fresh)\b/i.test(description) && !hasProcessedTerms;
        if (isWholeFood) {
            score += 200; // Big bonus for raw/fresh whole foods
            console.log(`   ✅✅ Bonus for "${description}" being a raw/fresh whole food (+200)`);
        }
        
        // 9. Prefer actual food over processed products for generic searches
        if (!hasPreparation) { // Only for generic searches like "salmon", "rice"
            // Heavy penalties for processed products when searching for basic foods
            if (/\b(oil|paper|powder|flour|extract|supplement|pill|capsule|sauce|dressing|cake|bread|soup|mix|product)\b/i.test(description)) {
                score -= 200; // Even heavier penalty for processed products
            }
            
            // Specific penalties for obvious non-food matches
            if (/\b(oil|paper|dressing|sauce|powder|extract|supplement)\b/i.test(description)) {
                score -= 500; // Massive penalty for oils, papers, dressings, supplements etc.
            }
            
            // Bonus for basic food preparations - but only if it's actually the food, not a product
            const isBasicFood = /\b(raw|cooked|baked|grilled|steamed|boiled|roasted|fresh)\b/i.test(description);
            const isNotProcessed = !/\b(oil|paper|dressing|sauce|powder|extract|supplement|cake|bread|soup|mix|product)\b/i.test(description);
            
            if (isBasicFood && isNotProcessed) {
                score += 50; // Higher bonus for simple food preparations
            }
            
            // Extra bonus for whole foods vs processed foods
            if (isNotProcessed) {
                score += 25; // Higher bonus for non-processed foods
            }
        }
        
        // 9b. Penalize compound/mixed foods when searching for simple ingredients
        // If searching for single word like "rice", heavily penalize results with other main food items
        if (originalWords.length === 1) {
            const searchWord = originalWords[0];
            const descWords = description.split(/[\s,]+/);
            
            // Penalize non-food products (beverages, snacks, babyfood, desserts)
            const unwantedCategories = [
                'alcoholic', 'beverage', 'drink', 'juice', 'soda',
                'babyfood', 'baby', 'infant',
                'snacks', 'snack', 'candy', 'dessert', 'cake', 'cookie', 'bar',
                'cereal', 'breakfast',
                'sauce', 'dressing', 'condiment',
                'supplement', 'powder', 'mix'
            ];
            
            const hasUnwantedCategory = unwantedCategories.some(cat => 
                description.includes(cat)
            );
            
            if (hasUnwantedCategory) {
                score -= 400; // Heavy penalty for non-food products
                console.log(`   ⚠️ Penalizing "${description}" for unwanted category (-400)`);
            }
            
            // List of major food items that indicate a compound/mixed dish
            const otherFoodItems = ['pork', 'beef', 'chicken', 'turkey', 'sausage', 'bacon', 'ham',
                                   'tuna', 'shrimp', 'cheese', 'egg', 'tofu',
                                   'beans', 'lentils', 'pasta', 'noodles', 'bread',
                                   'potato', 'corn', 'wheat', 'oat', 'barley', 'apple', 'banana'];
            
            // Special handling for fish/seafood - don't penalize "fish" when searching for fish types
            const isFishSearch = ['salmon', 'tuna', 'cod', 'trout', 'tilapia', 'halibut', 'mackerel'].includes(searchWord);
            
            // Check if description contains other major food items not in the search
            const hasOtherFoods = descWords.some(word => {
                const isOtherFood = otherFoodItems.includes(word) && word !== searchWord;
                // Don't penalize "fish" if we're searching for a fish type
                if (isFishSearch && word === 'fish') {
                    return false;
                }
                return isOtherFood;
            });
            
            if (hasOtherFoods) {
                score -= 300; // Heavy penalty for compound foods
                console.log(`   ⚠️ Penalizing "${description}" for being a compound food (-300)`);
            }
            
            // Check if the search word is actually the PRIMARY food (not just an ingredient)
            // For single-word searches, prefer results that start with the food name or just have the food name
            const startsWithSearchWord = descWords[0] === searchWord || 
                                        (descWords[1] === searchWord && ['the', 'a', 'an'].includes(descWords[0]));
            
            // Check if it's a simple food description (food name + preparation method only)
            const preparationWords = ['raw', 'cooked', 'baked', 'grilled', 'steamed', 'boiled', 'roasted', 
                                     'fried', 'fresh', 'frozen', 'dried', 'canned', 'chopped', 'sliced'];
            const typeWords = ['white', 'brown', 'red', 'green', 'yellow', 'long-grain', 'short-grain',
                              'wild', 'atlantic', 'pacific', 'chinook', 'sockeye', 'coho', 'pink'];
            
            const isSimpleDescription = descWords.every(word => 
                word === searchWord || 
                preparationWords.includes(word) || 
                typeWords.includes(word) ||
                word === 'and' || word === 'with' || word === 'without' ||
                word.includes('(') || word.includes(')')  // Allow parenthetical notes
            );
            
            if (startsWithSearchWord && isSimpleDescription && !hasUnwantedCategory) {
                score += 200; // Big bonus for simple, pure food
                console.log(`   ✅ Bonus for "${description}" - simple primary food (+200)`);
            } else if (startsWithSearchWord && !hasUnwantedCategory) {
                score += 100; // Moderate bonus if it starts with search word
                console.log(`   ✅ Bonus for "${description}" - starts with search word (+100)`);
            }
        }

        // 10. Bonus for having good nutrition data
        const nutrientCount = food.foodNutrients ? food.foodNutrients.length : 0;
        if (nutrientCount > 20) {
            score += 5;
        } else if (nutrientCount < 5) {
            score -= 10;
        }
        
        return {
            food: food,
            score: score,
            description: description,
            wordMatchRatio: wordMatchRatio,
            foundWords: foundWords
        };
    });
    
    // Sort by score (highest first)
    scoredFoods.sort((a, b) => b.score - a.score);
    
    // Log top matches for debugging
    console.log(`🎯 Top 5 matches:`);
    scoredFoods.slice(0, 5).forEach((match, index) => {
        console.log(`   ${index + 1}. "${match.food.description}" (${match.food.dataType}) - Score: ${match.score.toFixed(2)} - Words: ${match.wordMatchRatio.toFixed(2)}`);
    });
    
    // Return best match if it has a reasonable score
    const bestMatch = scoredFoods[0];
    if (bestMatch && bestMatch.score >= 50) { // Higher threshold due to new scoring system
        return bestMatch;
    }
    
    console.log(`⚠️ No match met minimum score threshold of 50 (best was ${bestMatch ? bestMatch.score.toFixed(2) : 'N/A'})`);
    return null;
}

// Get detailed nutrition data from USDA for a specific food ID
async function getUSDANutritionDetails(fdcId) {
    console.log(`📊 Fetching detailed nutrition for USDA ID: ${fdcId}`);
    
    try {
        // Try local database first if available
        if (USE_LOCAL_USDA) {
            try {
                const localResponse = await fetch(`${USDA_LOCAL_DETAIL_URL}/${fdcId}`);
                
                if (localResponse.ok) {
                    const localData = await localResponse.json();
                    if (localData.success) {
                        console.log(`⚡ Using LOCAL database (fast!)`);
                        console.log(`✅ Retrieved detailed nutrition data for: ${localData.food.description}`);
                        return localData.food;
                    } else if (localData.fallback_to_api) {
                        console.log(`⚠️ Local DB not available, falling back to API`);
                        USE_LOCAL_USDA = false;
                    }
                }
            } catch (localError) {
                console.log(`⚠️ Local DB error, falling back to API: ${localError.message}`);
                USE_LOCAL_USDA = false;
            }
        }
        
        // Fallback to USDA API if local not available
        const response = await fetch(`${USDA_DETAIL_URL}/${fdcId}?api_key=${USDA_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`USDA detail error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Retrieved detailed nutrition data for: ${data.description}`);
        
        return data;
        
    } catch (error) {
        console.error(`❌ Failed to get USDA nutrition details:`, error);
        return null;
    }
}

// Process text using Django NLP + USDA API instead of backend
async function processText(inputText) {
    console.log('🚀 STARTING processText function');
    console.log('📝 Input text:', inputText);
    
    try {
        // Step 1: Use Django NLP to extract food information
        console.log('🤖 Step 1: Extracting foods with Django NLP...');
        const extractedFoods = await extractFoodsWithDjangoAPI(inputText);
        
        if (!extractedFoods || extractedFoods.length === 0) {
            console.log('⚠️ No foods found in text');
            foods = [];
            return;
        }
        
        console.log(`✅ Found ${extractedFoods.length} food items`);
        
        // Clear existing foods array to start fresh
        foods = [];
        
        // Show results header immediately so user sees something is happening
        if (resultsHeader) resultsHeader.style.display = 'block';
        
        // Step 2: Search USDA database for each food and get nutrition data
        console.log('� Step 2: Searching USDA database for each food...');
        const foodPromises = extractedFoods.map(async (foodItem, index) => {
            console.log(`📋 Processing food ${index + 1}/${extractedFoods.length}: ${foodItem.name}`);
            
            try {
                // Search USDA database
                const usdaFood = await searchUSDAFood(foodItem.name);
                if (!usdaFood) {
                    console.log(`⚠️ No USDA data found for: ${foodItem.name}`);
                    return null;
                }
                
                // Get detailed nutrition data
                const detailedNutrition = await getUSDANutritionDetails(usdaFood.fdcId);
                if (!detailedNutrition) {
                    console.log(`⚠️ No detailed nutrition found for: ${foodItem.name}`);
                    return null;
                }
                
                // Process nutrition data similar to original format
                console.log(`� Processing nutrition data for ${foodItem.name}...`);
                
                // Extract key macronutrients
                const nutrients = detailedNutrition.foodNutrients || [];
                let fatsValue = 0;
                let carbsValue = 0; 
                let proteinValue = 0;
                let fiberValue = 0;
                let totalCalories = 0;
                
                // Create allNutrients object similar to original format
                const allNutrients = {};
                let processedNutrientCount = 0;
                
                nutrients.forEach(nutrient => {
                    if (!nutrient.amount || nutrient.amount === 0) return;
                    
                    const name = nutrient.nutrient.name.toLowerCase();
                    const value = nutrient.amount;
                    const unit = nutrient.nutrient.unitName || '';
                    
                    // Extract macronutrients
                    if (name.includes('energy') && unit.toLowerCase() === 'kcal') {
                        totalCalories = value;
                    } else if (name.includes('protein')) {
                        proteinValue = value;
                    } else if (name.includes('total lipid') || name.includes('fat')) {
                        fatsValue = value;
                    } else if (name.includes('carbohydrate, by difference')) {
                        carbsValue = value;
                    } else if (name.includes('fiber, total dietary')) {
                        fiberValue = value;
                    }
                    
                    // Add to allNutrients with formatting similar to original
                    if (value > 0) {
                        processedNutrientCount++;
                        
                        // Format nutrient name
                        let formattedName = nutrient.nutrient.name
                            .replace(/,\s*/g, ', ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        const key = nutrient.nutrient.name.toLowerCase();
                        allNutrients[key] = {
                            name: formattedName,
                            value: value,
                            unit: unit.toUpperCase(),
                        };
                    }
                });
                
                console.log(`✅ Processed ${processedNutrientCount} nutrients for ${foodItem.name}`);
                console.log(`📊 Key values - Calories: ${totalCalories}, Protein: ${proteinValue}g, Carbs: ${carbsValue}g, Fat: ${fatsValue}g`);
                
                // Scale nutrition values based on quantity (USDA data is per 100g)
                const scalingFactor = foodItem.quantity / 100;
                
                const foodObject = {
                    id: `usda_${usdaFood.fdcId}_${index}`,
                    name: detailedNutrition.description, // Use actual USDA description instead of original name
                    originalName: foodItem.originalName || foodItem.name, // Keep original for reference
                    usdaDescription: detailedNutrition.description, // Store USDA description
                    fats: fatsValue * scalingFactor,
                    carbohydrates: carbsValue * scalingFactor, 
                    protein: proteinValue * scalingFactor,
                    fiber: fiberValue * scalingFactor,
                    totalCalories: totalCalories * scalingFactor,
                    quantity: foodItem.quantity,
                    measurementType: foodItem.unit,
                    allNutrients: Object.fromEntries(
                        Object.entries(allNutrients).map(([key, nutrient]) => [
                            key, 
                            {
                                ...nutrient,
                                value: nutrient.value * scalingFactor
                            }
                        ])
                    )
                };
                
                console.log(`✅ Created food object for ${foodItem.name}:`, foodObject);
                
                // Add to global foods array and update UI immediately (progressive rendering)
                foods.push(foodObject);
                updateUI();
                
                return foodObject;
                
            } catch (error) {
                console.error(`❌ Failed to process food ${foodItem.name}:`, error);
                return null;
            }
        });
        
        // Wait for all food processing to complete
        console.log('⏳ Processing foods progressively (updating UI as each completes)...');
        await Promise.all(foodPromises);
        
        console.log('✅ Successfully processed foods');
        console.log('📊 Final foods array:', foods);
        console.log(`📊 Successfully processed ${foods.length} out of ${extractedFoods.length} foods`);
        
    } catch (error) {
        console.error("💥 ERROR in processText function:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Stack trace:", error.stack);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to process text';
        if (error.message.includes('Django')) {
            errorMessage = 'Failed to understand the text. Please try rephrasing your input.';
        } else if (error.message.includes('USDA')) {
            errorMessage = 'Failed to find nutrition data. Please check food names and try again.';
        } else if (error.message.includes('API key')) {
            errorMessage = 'API configuration error. Please contact support.';
        }
        
        alert(errorMessage);
        foods = []; // Clear data on error
        console.log('🔄 Cleared foods array due to error');
    }
    
    console.log('🏁 FINISHED processText function');
    console.log('📊 Final foods array length:', foods.length);
}

// Update the HTML based on the current state (foods array)
function updateUI() {
    console.time('updateUI'); // Performance timing
    
    // Clear previous list items
    foodListContainer.innerHTML = '';

    if (foods.length === 0) {
        totalsSection.style.display = 'none'; // Hide totals if no food
        console.timeEnd('updateUI');
        return; // Nothing more to render
    }

    // Use DocumentFragment for better performance (single reflow instead of multiple)
    const fragment = document.createDocumentFragment();

    // --- Populate Food List ---
    foods.forEach((food, index) => {
        // Build HTML string instead of creating elements one by one
        let htmlContent = '';
        
        // Header HTML
        htmlContent += `
            <div class="food-header">
                <h4 class="food-title">
                    <span class="food-name2">${food.name}</span>
                </h4>
                <span class="food-quantity">${food.quantity.toFixed(2)} ${food.measurementType}</span>
                <i class="fas fa-chevron-down collapse-icon"></i>
            </div>
        `;

        // Organize nutrients by categories from nutrient database
        const categories = {};
        
        // Track energy and folate values
        let energyValue = 0;
        let hasEnergyNutrient = false;
        let folateValue = 0;
        let folateUnit = 'ug';
        let hasFolate = false;

        // Single pass through nutrients - collect all data at once
        const sortedNutrients = Object.values(food.allNutrients).sort((a, b) => a.name.localeCompare(b.name));
        
        sortedNutrients.forEach(nutrient => {
            if (!nutrient.value || nutrient.value === 0) return;
            if (Math.round(nutrient.value) === 0) return;
            
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            // Check for energy
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                energyValue = nutrient.value;
                hasEnergyNutrient = true;
                return; // Skip adding to categories
            }
            
            // Check for folate (prefer DFE, then total, then food)
            if (name.includes('folate')) {
                if (name.includes('dfe') && nutrient.value > 0) {
                    folateValue = nutrient.value;
                    folateUnit = nutrient.unit.toLowerCase();
                    hasFolate = true;
                } else if (!hasFolate && name.includes('total') && nutrient.value > 0) {
                    folateValue = nutrient.value;
                    folateUnit = nutrient.unit.toLowerCase();
                    hasFolate = true;
                } else if (!hasFolate && name.includes('food') && nutrient.value > 0) {
                    folateValue = nutrient.value;
                    folateUnit = nutrient.unit.toLowerCase();
                    hasFolate = true;
                }
                return; // Skip adding to categories
            }
            
            // Skip MUFA, TFA, PUFA, SFA nutrients
            if (name.includes('mufa') || name.includes('tfa') || name.includes('pufa') || name.includes('sfa')) {
                return;
            }
            
            // Add to appropriate category
            const nutrientGroup = getNutrientGroup(nutrient.name);
            if (!categories[nutrientGroup]) categories[nutrientGroup] = [];
            
            categories[nutrientGroup].push(`
                <div class="nutrition-total-item">
                    <span class="nutrient-name">${nutrient.name}:</span>
                    <span class="nutrient-value">${Math.round(nutrient.value)} ${unit}</span>
                </div>`);
        });

        // If no kcal energy nutrient found, use totalCalories
        if (!hasEnergyNutrient && food.totalCalories > 0) {
            energyValue = food.totalCalories;
        }

        // Add consolidated energy entry
        if (energyValue > 0) {
            const energyGroup = getNutrientGroup('Energy');
            if (!categories[energyGroup]) categories[energyGroup] = [];
            categories[energyGroup].unshift(`
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Energy:</span>
                    <span class="nutrient-value">${Math.round(energyValue)} kcal</span>
                </div>`);
        }

        // Add consolidated folate entry
        if (hasFolate && folateValue > 0 && Math.round(folateValue) > 0) {
            const folateGroup = getNutrientGroup('Folate, DFE') || 'GROUP 3: VITAMINS';
            if (!categories[folateGroup]) categories[folateGroup] = [];
            categories[folateGroup].push(`
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Folate, DFE:</span>
                    <span class="nutrient-value">${Math.round(folateValue)} ${folateUnit}</span>
                </div>`);
        }

        // Build nutrition HTML by category in the correct order
        const groupOrder = [
            'GROUP 1: ENERGY & FOUNDATION',
            'GROUP 2: MACRONUTRIENTS',
            'GROUP 3: VITAMINS',
            'GROUP 4: MINERALS',
            'GROUP 5: CARBOHYDRATES',
            'GROUP 6: LIPIDS & FATS',
            'GROUP 7: PROTEINS',
            'GROUP 8: BIOACTIVE COMPOUNDS',
            'GROUP 9: MISCELLANEOUS'
        ];

        let nutritionHtml = '<div class="food-nutrition">';
        groupOrder.forEach(groupName => {
            if (categories[groupName] && categories[groupName].length > 0) {
                nutritionHtml += `
                    <div class="nutrition-category">
                        <h4 class="category-title">${groupName}</h4>
                        ${categories[groupName].join('')}
                    </div>`;
            }
        });
        nutritionHtml += '</div>';

        // Create list item and set all HTML at once
        const listItem = document.createElement('li');
        listItem.className = 'food-item';
        listItem.id = `food-item-${index}`;
        listItem.innerHTML = htmlContent + nutritionHtml;
        
        // Add click event listener to toggle expansion
        listItem.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
        
        // Add to fragment instead of directly to DOM
        fragment.appendChild(listItem);
    });

    // Single DOM update - much faster than multiple appendChild calls
    foodListContainer.appendChild(fragment);
    
    console.timeEnd('updateUI');

    // --- Calculate and Display Comprehensive Totals ---
    calculateAndDisplayTotals();
}

// New function to calculate and display comprehensive totals
function calculateAndDisplayTotals() {
    console.time('calculateAndDisplayTotals'); // Performance timing
    
    // Calculate totals for all nutrients
    const nutritionTotals = {};
    let totalEnergyKcal = 0;
    
    // Single pass through all foods and their nutrients
    foods.forEach(food => {
        let foodEnergyKcal = 0;
        let hasEnergyNutrient = false;
        
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            // Handle energy
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                foodEnergyKcal = nutrient.value;
                hasEnergyNutrient = true;
                return;
            }

            // Skip MUFA, TFA, PUFA, SFA nutrients
            if (name.includes('mufa') || name.includes('tfa') || name.includes('pufa') || name.includes('sfa')) {
                return;
            }
            
            // Accumulate other nutrients
            const key = nutrient.name.toLowerCase();
            if (!nutritionTotals[key]) {
                nutritionTotals[key] = {
                    name: nutrient.name,
                    value: 0,
                    unit: nutrient.unit,
                    category: nutrient.category
                };
            }
            nutritionTotals[key].value += nutrient.value;
        });
        
        // If no kcal energy nutrient found, use totalCalories
        if (!hasEnergyNutrient && food.totalCalories > 0) {
            foodEnergyKcal = food.totalCalories;
        }
        
        totalEnergyKcal += foodEnergyKcal;
    });
    
    // Add consolidated energy entry
    if (totalEnergyKcal > 0) {
        nutritionTotals['energy'] = {
            name: 'Energy',
            value: totalEnergyKcal,
            unit: 'KCAL',
            category: 'energy'
        };
    }

    // Get recommendation data from global state (if available)
    let recommendationData = null;
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const savedState = localStorage.getItem('app_state_recommend');
            console.log('Saved state from localStorage:', savedState);
            if (savedState) {
                const state = JSON.parse(savedState);
                console.log('Parsed state:', state);
                if (state.recommendation) {
                    recommendationData = state.recommendation;
                    console.log('Recommendation data found:', recommendationData);
                }
            }
        } catch (e) {
            console.log('Error accessing recommendation data:', e);
        }
    }

    // Helper function to get recommended value for a nutrient
    function getRecommendedValue(nutrientName, unit) {
        if (!recommendationData) return null;
        
        const name = nutrientName.toLowerCase();
        const unitLower = unit ? unit.toLowerCase() : '';
        
        // Map nutrient names to recommendation object properties
        const mappings = {
            'energy': 'calories',
            'calories': 'calories',
            'protein': 'protein',
            'total lipid (fat)': 'fats',
            'fat': 'fats',
            'fats': 'fats',
            'carbohydrate, by difference': 'carbs',
            'carbohydrates': 'carbs',
            'carbs': 'carbs',
            'fiber, total dietary': 'fiber',
            'fiber': 'fiber',
            'water': 'water',
            'cholesterol': 'cholesterol',
            'fatty acids, total saturated': 'saturatedFat',
            'saturated fat': 'saturatedFat',
            'fatty acids, total trans': 'transFat',
            'trans fat': 'transFat',
            'iron, fe': 'iron',
            'iron': 'iron',
            'sodium, na': 'sodium',
            'sodium': 'sodium',
            'potassium, k': 'potassium',
            'potassium': 'potassium',
            'calcium, ca': 'calcium',
            'calcium': 'calcium',
            'magnesium, mg': 'magnesium',
            'magnesium': 'magnesium',
            'zinc, zn': 'zinc',
            'zinc': 'zinc',
            'copper, cu': 'copper',
            'copper': 'copper',
            'manganese, mn': 'manganese',
            'manganese': 'manganese',
            'phosphorus, p': 'phosphorus',
            'phosphorus': 'phosphorus',
            'selenium, se': 'selenium',
            'selenium': 'selenium',
            'vitamin a, rae': 'vitaminA',
            'vitamin a': 'vitaminA',
            'vitamin b-6': 'vitaminB6',
            'vitamin b6': 'vitaminB6',
            'vitamin b-12': 'vitaminB12',
            'vitamin b12': 'vitaminB12',
            'vitamin c, total ascorbic acid': 'vitaminC',
            'vitamin c': 'vitaminC',
            'vitamin d (d2 + d3)': 'vitaminD',
            'vitamin d': 'vitaminD',
            'vitamin e (alpha-tocopherol)': 'vitaminE',
            'vitamin e': 'vitaminE',
            'vitamin k (phylloquinone)': 'vitaminK',
            'vitamin k': 'vitaminK',
            'folate, dfe': 'folate',
            'folate': 'folate',
            'thiamin': 'thiamin',
            'riboflavin': 'riboflavin',
            'niacin': 'niacin',
            'choline, total': 'choline',
            'choline': 'choline'
        };
        
        const mappedKey = mappings[name];
        if (mappedKey && recommendationData[mappedKey] !== undefined) {
            // Only show calorie recommendations for kcal, not kJ
            if (name === 'energy' && unitLower !== 'kcal') {
                return null;
            }
            
            const value = recommendationData[mappedKey];
            
            // Handle range values (min-max)
            if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                return `${Math.round(value.min)}-${Math.round(value.max)}`;
            }
            
            return Math.round(value);
        }
        
        return null;
    }

    // Organize totals by the 9 major groups from nutrient database
    const categories = {};

    // Track and consolidate folate values (prefer DFE, then total, then food)
    let totalFolateValue = 0;
    let folateUnit = 'ug';
    let hasTotalFolate = false;

    // Sort and process all nutrients in a single pass
    const sortedNutrients = Object.values(nutritionTotals)
        .filter(nutrient => nutrient.value > 0 && Math.round(nutrient.value) > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    sortedNutrients.forEach(nutrient => {
        const name = nutrient.name.toLowerCase();
        
        // Handle folate consolidation
        if (name.includes('folate')) {
            if (name.includes('dfe') && nutrient.value > 0) {
                totalFolateValue = nutrient.value;
                folateUnit = nutrient.unit.toLowerCase();
                hasTotalFolate = true;
            } else if (!hasTotalFolate && name.includes('total') && nutrient.value > 0) {
                totalFolateValue = nutrient.value;
                folateUnit = nutrient.unit.toLowerCase();
                hasTotalFolate = true;
            } else if (!hasTotalFolate && name.includes('food') && nutrient.value > 0) {
                totalFolateValue = nutrient.value;
                folateUnit = nutrient.unit.toLowerCase();
                hasTotalFolate = true;
            }
            return; // Skip adding individual folate entries
        }
        
        // Process other nutrients
        const unit = nutrient.unit.toLowerCase();
        const recommendedValue = getRecommendedValue(nutrient.name, unit);
        
        let valueDisplay;
        if (recommendedValue) {
            valueDisplay = `${Math.round(nutrient.value)} / <span class="recommended-value">${recommendedValue}</span> ${unit}`;
        } else {
            valueDisplay = `${Math.round(nutrient.value)} ${unit}`;
        }
        
        const nutrientGroup = getNutrientGroup(nutrient.name);
        if (!categories[nutrientGroup]) categories[nutrientGroup] = [];
        
        categories[nutrientGroup].push(`
            <div class="nutrition-total-item">
                <span class="nutrient-name">${nutrient.name}:</span>
                <span class="nutrient-value">${valueDisplay}</span>
            </div>`);
    });

    // Add consolidated folate entry
    if (hasTotalFolate && totalFolateValue > 0 && Math.round(totalFolateValue) > 0) {
        const folateGroup = getNutrientGroup('Folate, DFE') || 'GROUP 3: VITAMINS';
        if (!categories[folateGroup]) categories[folateGroup] = [];
        
        const recommendedValue = getRecommendedValue('Folate, DFE', folateUnit);
        let valueDisplay;
        if (recommendedValue) {
            valueDisplay = `${Math.round(totalFolateValue)} / <span class="recommended-value">${recommendedValue}</span> ${folateUnit}`;
        } else {
            valueDisplay = `${Math.round(totalFolateValue)} ${folateUnit}`;
        }
        
        categories[folateGroup].push(`
            <div class="nutrition-total-item">
                <span class="nutrient-name">Folate, DFE:</span>
                <span class="nutrient-value">${valueDisplay}</span>
            </div>`);
    }

    // Build complete HTML string
    let htmlContent = `
        <div class="total-food-item expanded" id="total-food-item">
            <div class="food-header">
                <h4 class="food-title">
                    <span class="food-name2">TOTAL NUTRITION</span>
                </h4>
                <span class="food-quantity">${foods.length} item${foods.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="food-nutrition">`;

    // Display nutrients by category in the correct 1-9 group order
    const groupOrder = [
        'GROUP 1: ENERGY & FOUNDATION',
        'GROUP 2: MACRONUTRIENTS',
        'GROUP 3: VITAMINS',
        'GROUP 4: MINERALS',
        'GROUP 5: CARBOHYDRATES',
        'GROUP 6: LIPIDS & FATS',
        'GROUP 7: PROTEINS',
        'GROUP 8: BIOACTIVE COMPOUNDS',
        'GROUP 9: MISCELLANEOUS'
    ];

    groupOrder.forEach(groupName => {
        if (categories[groupName] && categories[groupName].length > 0) {
            htmlContent += `
                <div class="nutrition-category">
                    <h4 class="category-title">${groupName}</h4>
                    ${categories[groupName].join('')}
                </div>`;
        }
    });

    htmlContent += `
            </div>
        </div>`;

    // Single DOM update
    totalsSection.innerHTML = htmlContent;
    totalsSection.style.display = 'block';
    
    console.timeEnd('calculateAndDisplayTotals');
}

// Utility function to format values
function formatValue(value) {
    return Math.round(value);
}
// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)
