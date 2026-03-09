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
        
        console.log('[AnalyzeImage] Sending request — file type:', file.type, '| base64 length:', base64Data.length);
        
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
        
        console.log('[AnalyzeImage] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // BUG WAS HERE: API returns { success, foods, raw_response } — NOT result.analysis
        console.log('[AnalyzeImage] Full response JSON:', result);
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // API returns foods as an array: [{quantity, unit, food_name}, ...]
        if (result.foods && result.foods.length > 0) {
            const analysisText = result.foods
                .map(f => `${f.quantity}${f.unit} ${f.food_name}`)
                .join(', ');
            console.log('[AnalyzeImage] Converted foods to text:', analysisText);
            foodInput.value = analysisText;
            handleInputChange();
        } else if (result.raw_response) {
            // Fallback: no structured foods parsed, use raw AI text
            console.warn('[AnalyzeImage] No structured foods found, falling back to raw_response:', result.raw_response);
            foodInput.value = result.raw_response;
            handleInputChange();
        } else {
            console.warn('[AnalyzeImage] Empty or unexpected response shape:', result);
            alert('Could not identify food items in the image. Please try again or describe your meal manually.');
        }
        
    } catch (error) {
        console.error('[AnalyzeImage] Error:', error);
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

// Process text using AI-powered parsing and USDA matching
async function processText(inputText) {
    console.log('🚀 STARTING processText function with AI');
    console.log('📝 Input text:', inputText);
    
    try {
        // Use the new AI-powered endpoint
        console.log('🤖 Calling AI to parse and match foods...');
        const response = await fetch('/ai/parse-and-match-foods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText
            })
        });
        
        if (!response.ok) {
            throw new Error(`AI parsing error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ AI parse result:', result);
        
        // API returns 'parsed_foods', not 'foods'
        const foodItems = result.parsed_foods || result.foods;
        
        if (!result.success || !foodItems || foodItems.length === 0) {
            console.log('⚠️ No foods found in text');
            foods = [];
            return;
        }
        
        console.log(`✅ Found ${foodItems.length} food items`);
        
        // Clear existing foods array
        foods = [];
        
        // Show results header
        if (resultsHeader) resultsHeader.style.display = 'block';
        
        // Process each food item
        for (const item of foodItems) {
            try {
                // API returns usda_matches array; pick the best match (first)
                const usdaFood = (item.usda_matches && item.usda_matches.length > 0)
                    ? item.usda_matches[0]
                    : item.usda_food;
                const quantity = item.quantity;
                const unit = item.unit;
                
                if (!usdaFood || !usdaFood.fdcId) {
                    console.warn(`⚠️ No USDA match for: ${item.food_name}`);
                    continue;
                }
                
                console.log(`📋 Processing: ${quantity}${unit} ${usdaFood.description}`);
                
                // Get detailed nutrition data
                const fdcId = usdaFood.fdcId;
                const detailResponse = await fetch(`/api/usda/food/${fdcId}`);
                
                if (!detailResponse.ok) {
                    console.log(`⚠️ Failed to get details for: ${usdaFood.description}`);
                    continue;
                }
                
                const detailData = await detailResponse.json();
                if (!detailData.success) {
                    console.log(`⚠️ No detail data for: ${usdaFood.description}`);
                    continue;
                }
                
                const detailedNutrition = detailData.food;
                console.log(`📊 Processing nutrition data for ${usdaFood.description}...`);
                
                // Extract key macronutrients
                const nutrients = detailedNutrition.foodNutrients || [];
                let fatsValue = 0;
                let carbsValue = 0; 
                let proteinValue = 0;
                let fiberValue = 0;
                let totalCalories = 0;
                
                // Create allNutrients object
                const allNutrients = {};
                let processedNutrientCount = 0;
                
                nutrients.forEach(nutrient => {
                    if (!nutrient.amount || nutrient.amount === 0) return;
                    
                    const name = nutrient.nutrient.name.toLowerCase();
                    const value = nutrient.amount;
                    const unitName = nutrient.nutrient.unitName || '';
                    
                    // Extract macronutrients
                    if (name.includes('energy') && unitName.toLowerCase() === 'kcal') {
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
                    
                    // Add to allNutrients
                    if (value > 0) {
                        processedNutrientCount++;
                        
                        let formattedName = nutrient.nutrient.name
                            .replace(/,\s*/g, ', ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        const key = nutrient.nutrient.name.toLowerCase();
                        allNutrients[key] = {
                            name: formattedName,
                            value: value,
                            unit: unitName.toUpperCase(),
                        };
                    }
                });
                
                console.log(`✅ Processed ${processedNutrientCount} nutrients`);
                console.log(`📊 Key values - Calories: ${totalCalories}, Protein: ${proteinValue}g, Carbs: ${carbsValue}g, Fat: ${fatsValue}g`);
                
                // Scale nutrition values based on quantity (USDA data is per 100g)
                const scalingFactor = quantity / 100;
                
                const foodObject = {
                    id: `usda_${fdcId}_${foods.length}`,
                    name: detailedNutrition.description,
                    originalName: item.food_name || item.original_input?.food_name || detailedNutrition.description,
                    usdaDescription: detailedNutrition.description,
                    fats: fatsValue * scalingFactor,
                    carbohydrates: carbsValue * scalingFactor, 
                    protein: proteinValue * scalingFactor,
                    fiber: fiberValue * scalingFactor,
                    totalCalories: totalCalories * scalingFactor,
                    quantity: quantity,
                    measurementType: unit,
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
                
                console.log(`✅ Created food object:`, foodObject);
                
                // Add to global foods array and update UI immediately
                foods.push(foodObject);
                updateUI();
                
            } catch (error) {
                console.error(`❌ Failed to process food item:`, error);
            }
        }
        
        console.log('✅ Successfully processed all foods');
        console.log('📊 Final foods array:', foods);
        
    } catch (error) {
        console.error("💥 ERROR in processText function:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Stack trace:", error.stack);
        
        alert('Failed to process text. Please try again.');
        foods = [];
    }
    
    console.log('🏁 FINISHED processText function');
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
