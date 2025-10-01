// --- DOM Elements ---
const foodInput = document.getElementById('food-input');
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const foodListContainer = document.getElementById('food-list');
const totalsSection = document.getElementById('totals-section');

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

// --- Functions ---

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
    updateUI(); // Update UI after fetching
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
        
        // Strategy 2: Clean version (remove descriptors)
        foodName.replace(/\b(raw|cooked|fresh|frozen|dried|steamed|baked|grilled|fried|boiled|roasted)\b/gi, '').trim(),
        
        // Strategy 3: Just the main food word (first word usually)
        foodName.split(/[\s,]+/)[0],
        
        // Strategy 4: Common variations
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
            const response = await fetch(
                `${USDA_API_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchTerm)}&pageSize=20`
            );
            
            if (!response.ok) {
                console.log(`⚠️ Strategy ${i + 1} failed: HTTP ${response.status}`);
                continue;
            }
            
            const data = await response.json();
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
        
        // 2. Exact match bonus (but much lower than data type preference)
        if (description === originalLower) {
            score += 50;
        }
        
        // 3. Contains all original words
        const containsAllWords = originalWords.every(word => description.includes(word));
        if (containsAllWords) {
            score += 30;
        }
        
        // 4. Word match ratio (how many original words are found)
        const foundWords = originalWords.filter(word => description.includes(word));
        const wordMatchRatio = foundWords.length / originalWords.length;
        score += wordMatchRatio * 20;
        
        // 5. Starts with original food name
        if (description.startsWith(originalLower)) {
            score += 15;
        }
        
        // 6. Description quality checks
        const wordCount = description.split(/\s+/).length;
        if (wordCount > 8) {
            score -= 10; // Penalize very long descriptions
        }
        
        // 7. Bonus for descriptive, detailed names
        if (wordCount >= 3 && wordCount <= 6) {
            score += 10; // Bonus for appropriately detailed descriptions
        }
        
        // 7. Bonus for common preparation states if original doesn't specify
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
        
        // 8. Penalize branded/restaurant items for generic searches
        if (food.dataType === 'Branded' && /\b(brand|restaurant|company|inc|llc|corp)\b/i.test(description)) {
            score -= 15;
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
                return foodObject;
                
            } catch (error) {
                console.error(`❌ Failed to process food ${foodItem.name}:`, error);
                return null;
            }
        });
        
        // Wait for all food processing to complete
        console.log('⏳ Waiting for all food processing to complete...');
        const processedFoods = await Promise.all(foodPromises);
        
        // Filter out failed foods and update global foods array
        foods = processedFoods.filter(food => food !== null);
        
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
    // Clear previous list items
    foodListContainer.innerHTML = '';

    if (foods.length === 0) {
        totalsSection.style.display = 'none'; // Hide totals if no food
        return; // Nothing more to render
    }

    // --- Populate Food List ---
    foods.forEach((food, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'food-item';
        listItem.id = `food-item-${index}`;

        // Top: Food name and quantity as h4
        const headerDiv = document.createElement('div');
        headerDiv.className = 'food-header';
        const headerH4 = document.createElement('h4');
        headerH4.className = 'food-title';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'food-name2';
        nameSpan.textContent = food.name;
        
        headerH4.appendChild(nameSpan);
        headerDiv.appendChild(headerH4);
        
        // Add quantity span
        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'food-quantity';
        quantitySpan.textContent = `${food.quantity.toFixed(2)} ${food.measurementType}`;
        headerDiv.appendChild(quantitySpan);
        
        // Add collapse icon
        const collapseIcon = document.createElement('i');
        collapseIcon.className = 'fas fa-chevron-down collapse-icon';
        headerDiv.appendChild(collapseIcon);

        // All Nutrition Info organized by categories 
        const nutritionDiv = document.createElement('div');
        nutritionDiv.className = 'food-nutrition';

        // Organize nutrients by categories from nutrient database
        const categories = {};
        
        // Track energy/calorie values to avoid duplicates
        let energyValue = 0;
        let hasEnergyNutrient = false;

        // First pass: check if we have energy nutrients and get the kcal value
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                energyValue = nutrient.value;
                hasEnergyNutrient = true;
            }
        });

        // If no kcal energy nutrient found, use totalCalories
        if (!hasEnergyNutrient && food.totalCalories > 0) {
            energyValue = food.totalCalories;
        }

        // Add consolidated energy entry if we have a value
        if (energyValue > 0) {
            const energyGroup = getNutrientGroup('Energy');
            if (!categories[energyGroup]) categories[energyGroup] = [];
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Energy:</span>
                    <span class="nutrient-value">${Math.round(energyValue)} kcal</span>
                </div>`;
            categories[energyGroup].push(nutrientInfo);
        }

        // Track folate values to consolidate them
        let folateValue = 0;
        let folateUnit = 'ug';
        let hasFolate = false;

        // First pass: find the best folate value (prefer DFE, then total, then food)
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            if (name.includes('folate')) {
                if (name.includes('dfe') && nutrient.value > 0) {
                    // DFE is the preferred measurement
                    folateValue = nutrient.value;
                    folateUnit = nutrient.unit.toLowerCase();
                    hasFolate = true;
                } else if (!hasFolate && name.includes('total') && nutrient.value > 0) {
                    // Use total if no DFE found
                    folateValue = nutrient.value;
                    folateUnit = nutrient.unit.toLowerCase();
                    hasFolate = true;
                } else if (!hasFolate && name.includes('food') && nutrient.value > 0) {
                    // Use food folate as last resort
                    folateValue = nutrient.value;
                    folateUnit = nutrient.unit.toLowerCase();
                    hasFolate = true;
                }
            }
        });

        // Add consolidated folate entry if we have a value
        if (hasFolate && folateValue > 0 && Math.round(folateValue) > 0) {
            const folateGroup = getNutrientGroup('Folate, DFE') || 'GROUP 3: VITAMINS';
            if (!categories[folateGroup]) categories[folateGroup] = [];
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">Folate, DFE:</span>
                    <span class="nutrient-value">${Math.round(folateValue)} ${folateUnit}</span>
                </div>`;
            categories[folateGroup].push(nutrientInfo);
        }

        // Organize all other nutrients by group (excluding energy/calorie and folate nutrients)
        Object.values(food.allNutrients)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(nutrient => {
                if (!nutrient.value || nutrient.value === 0) return;
                if (Math.round(nutrient.value) === 0) return; // Skip values that round to 0
                
                const name = nutrient.name.toLowerCase();
                const unit = nutrient.unit.toLowerCase();
                
                // Skip all energy/calorie related nutrients as we've already handled them
                if (name.includes('energy') || name.includes('calorie')) {
                    return;
                }

                // Skip all folate nutrients as we've consolidated them
                if (name.includes('folate')) {
                    return;
                }

                // Skip MUFA, TFA, PUFA, SFA nutrients
                if (name.includes('mufa') || name.includes('tfa') || name.includes('pufa') || name.includes('sfa')) {
                    return;
                }
                
                const displayName = nutrient.name;
                const value = nutrient.value;
                const nutrientInfo = `
                    <div class="nutrition-total-item">
                        <span class="nutrient-name">${displayName}:</span>
                        <span class="nutrient-value">${Math.round(value)} ${unit}</span>
                    </div>`;

                // Get nutrient group for this nutrient
                const nutrientGroup = getNutrientGroup(displayName);
                
                // Initialize category array if it doesn't exist
                if (!categories[nutrientGroup]) {
                    categories[nutrientGroup] = [];
                }
                
                categories[nutrientGroup].push(nutrientInfo);
            });

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
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'nutrition-category';
                
                const categoryTitle = document.createElement('h4');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = groupName;
                categoryDiv.appendChild(categoryTitle);

                categoryDiv.innerHTML += categories[groupName].join('');
                nutritionDiv.appendChild(categoryDiv);
            }
        });

        listItem.appendChild(headerDiv);
        listItem.appendChild(nutritionDiv);
        foodListContainer.appendChild(listItem);
        
        // Add click event listener to toggle expansion
        listItem.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // --- Calculate and Display Comprehensive Totals ---
    calculateAndDisplayTotals();
}

// New function to calculate and display comprehensive totals
function calculateAndDisplayTotals() {
    // Calculate totals for all nutrients
    const nutritionTotals = {};

    // First, consolidate energy values
    let totalEnergyKcal = 0;
    
    foods.forEach(food => {
        // Track energy for this food
        let foodEnergyKcal = 0;
        let hasEnergyNutrient = false;
        
        // Check for energy nutrients in kcal
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            if ((name.includes('energy') || name.includes('calorie')) && unit === 'kcal') {
                foodEnergyKcal = nutrient.value;
                hasEnergyNutrient = true;
            }
        });
        
        // If no kcal energy nutrient found, use totalCalories
        if (!hasEnergyNutrient && food.totalCalories > 0) {
            foodEnergyKcal = food.totalCalories;
        }
        
        totalEnergyKcal += foodEnergyKcal;
        
        // Add all other nutrients (excluding energy/calorie nutrients)
        Object.values(food.allNutrients).forEach(nutrient => {
            const name = nutrient.name.toLowerCase();
            const unit = nutrient.unit.toLowerCase();
            
            // Skip energy/calorie nutrients as we handle them separately
            if (name.includes('energy') || name.includes('calorie')) {
                return;
            }

            // Skip MUFA, TFA, PUFA, SFA nutrients
            if (name.includes('mufa') || name.includes('tfa') || name.includes('pufa') || name.includes('sfa')) {
                return;
            }
            
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

    // Clear and rebuild totals section
    totalsSection.innerHTML = '';

    // Create a single list item for totals (same structure as food-list)
    const totalListItem = document.createElement('div');
    totalListItem.className = 'total-food-item expanded';
    totalListItem.id = 'total-food-item';

    // Create header similar to food items
    const headerDiv = document.createElement('div');
    headerDiv.className = 'food-header';
    const headerH4 = document.createElement('h4');
    headerH4.className = 'food-title';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'food-name2';
    nameSpan.textContent = 'TOTAL NUTRITION';
    
    headerH4.appendChild(nameSpan);
    headerDiv.appendChild(headerH4);
    
    // Add summary span
    const summarySpan = document.createElement('span');
    summarySpan.className = 'food-quantity';
    summarySpan.textContent = `${foods.length} item${foods.length !== 1 ? 's' : ''}`;
    headerDiv.appendChild(summarySpan);

    // Organize totals by the 9 major groups from nutrient database
    const categories = {};

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

    // Track folate values to consolidate them in totals
    let totalFolateValue = 0;
    let folateUnit = 'ug';
    let hasTotalFolate = false;

    // First pass: find and consolidate folate values (prefer DFE, then total, then food)
    Object.values(nutritionTotals).forEach(nutrient => {
        const name = nutrient.name.toLowerCase();
        if (name.includes('folate')) {
            if (name.includes('dfe') && nutrient.value > 0) {
                // DFE is the preferred measurement
                totalFolateValue = nutrient.value;
                folateUnit = nutrient.unit.toLowerCase();
                hasTotalFolate = true;
            } else if (!hasTotalFolate && name.includes('total') && nutrient.value > 0) {
                // Use total if no DFE found
                totalFolateValue = nutrient.value;
                folateUnit = nutrient.unit.toLowerCase();
                hasTotalFolate = true;
            } else if (!hasTotalFolate && name.includes('food') && nutrient.value > 0) {
                // Use food folate as last resort
                totalFolateValue = nutrient.value;
                folateUnit = nutrient.unit.toLowerCase();
                hasTotalFolate = true;
            }
        }
    });

    // Add consolidated folate entry if we have a value
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
        
        const nutrientInfo = `
            <div class="nutrition-total-item">
                <span class="nutrient-name">Folate, DFE:</span>
                <span class="nutrient-value">${valueDisplay}</span>
            </div>`;
        categories[folateGroup].push(nutrientInfo);
    }

    // Process all other nutrients (excluding folate which we've consolidated)
    Object.values(nutritionTotals)
        .filter(nutrient => !nutrient.name.toLowerCase().includes('folate')) // Exclude folate nutrients
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(nutrient => {
            if (!nutrient.value || nutrient.value === 0) return;
            if (Math.round(nutrient.value) === 0) return; // Skip values that round to 0
            
            const name = nutrient.name;
            
            const actualValue = nutrient.value;
            const unit = nutrient.unit.toLowerCase();
            const recommendedValue = getRecommendedValue(name, unit);
            
            // Format the value display
            let valueDisplay;
            if (recommendedValue) {
                valueDisplay = `${Math.round(actualValue)} / <span class="recommended-value">${recommendedValue}</span> ${unit}`;
            } else {
                valueDisplay = `${Math.round(actualValue)} ${unit}`;
            }
            
            const nutrientInfo = `
                <div class="nutrition-total-item">
                    <span class="nutrient-name">${name}:</span>
                    <span class="nutrient-value">${valueDisplay}</span>
                </div>`;

            // Get nutrient group for this nutrient
            const nutrientGroup = getNutrientGroup(name);
            
            // Initialize category array if it doesn't exist
            if (!categories[nutrientGroup]) {
                categories[nutrientGroup] = [];
            }
            
            categories[nutrientGroup].push(nutrientInfo);
        });

    // Create nutrition div with same structure as food items
    const nutritionDiv = document.createElement('div');
    nutritionDiv.className = 'food-nutrition';

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
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'nutrition-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = groupName;
            categoryDiv.appendChild(categoryTitle);

            categoryDiv.innerHTML += categories[groupName].join('');
            nutritionDiv.appendChild(categoryDiv);
        }
    });

    totalListItem.appendChild(headerDiv);
    totalListItem.appendChild(nutritionDiv);
    totalsSection.appendChild(totalListItem);

    totalsSection.style.display = 'block'; // Show totals
}

// Utility function to format values
function formatValue(value) {
    return Math.round(value);
}
// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)
