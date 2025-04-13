// --- DOM Elements ---
const foodInput = document.getElementById('food-input');
const submitButton = document.getElementById('submit-button');
const resetButton = document.getElementById('reset-button');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const foodListContainer = document.getElementById('food-list');
const totalsSection = document.getElementById('totals-section');
const totalFatsSpan = document.getElementById('total-fats');
const totalCarbsSpan = document.getElementById('total-carbs');
const totalProteinSpan = document.getElementById('total-protein');
const totalFiberSpan = document.getElementById('total-fiber');
const totalCholesterolSpan = document.getElementById('total-cholesterol');
const totalCaloriesSpan = document.getElementById('total-calories');

// --- State ---
let foods = [];
let isLoading = false;
const API_URL = "http://127.0.0.1:8000/nlp/process_text_and_get_nutrition/";

// --- Event Listeners ---
foodInput.addEventListener('input', handleInputChange);
submitButton.addEventListener('click', handleSubmit);
resetButton.addEventListener('click', handleReset);

// --- Functions ---

// Enable/disable buttons based on input
function handleInputChange() {
    const isEmpty = foodInput.value.trim() === '';
    submitButton.disabled = isEmpty;
    resetButton.disabled = isEmpty;
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

// Handle reset button click
function handleReset() {
    foodInput.value = '';
    foods = [];
    handleInputChange(); // Update button states
    updateUI(); // Clear results
}

// Show/hide loading indicator
function setLoading(loading) {
    isLoading = loading;
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    submitButton.disabled = isLoading; // Disable submit while loading
}

// Fetch data from the backend API
async function processText(inputText) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Corresponds to NutritionResponse

        // Process the result into the 'foods' array (similar to your ViewModel mapping)
        foods = data.result.map(ingredient => {
            const fatsValue = parseFloat(ingredient.total_fat) || 0.0;
            const carbsValue = parseFloat(ingredient.carbohydrates) || 0.0;
            const proteinValue = parseFloat(ingredient.protein) || 0.0;
            const fiberValue = parseFloat(ingredient.fiber) || 0.0;
            const cholesterolValue = parseFloat(ingredient.cholesterol) || 0.0;
            const quantityValue = parseFloat(ingredient.quantity) || 0.0;
            const conversion = parseFloat(ingredient.conversion_factor) || 1.0;

            // Calculate total calories based on macros * conversion
            const totalCalories = (fatsValue * 9 + carbsValue * 4 + proteinValue * 4) * conversion;

            return {
                id: ingredient.id,
                name: ingredient.name,
                fats: fatsValue * conversion,
                saturatedFats: (parseFloat(ingredient.saturated_fat) || 0.0) * conversion, // Keep if needed later
                carbohydrates: carbsValue * conversion,
                protein: proteinValue * conversion,
                fiber: fiberValue * conversion,
                cholesterol: cholesterolValue * conversion,
                totalCalories: totalCalories,
                quantity: quantityValue,
                measurementType: ingredient.measurement_type || '' // Handle potential null/undefined
            };
        });

    } catch (error) {
        console.error("Error fetching or processing nutrition data:", error);
        alert(`Failed to get nutrition data: ${error.message}`); // Inform user
        foods = []; // Clear data on error
    }
}

// Update the HTML based on the current state (foods array)
function updateUI() {
    // Clear previous list items
    foodListContainer.innerHTML = '';

    // Set header text
    resultsHeader.textContent = foods.length > 0 ? "Your Daily Nutrition" : "Foods";

    if (foods.length === 0) {
        totalsSection.style.display = 'none'; // Hide totals if no food
        return; // Nothing more to render
    }

    // --- Populate Food List ---
    foods.forEach(food => {
        const listItem = document.createElement('li');

        // Left side: Name and Quantity
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'food-details';
        const nameP = document.createElement('div'); // Use div for block display
        nameP.className = 'food-name';
        nameP.textContent = food.name;
        const quantityP = document.createElement('div'); // Use div for block display
        quantityP.className = 'food-quantity';
        quantityP.textContent = `${food.quantity.toFixed(2)} ${food.measurementType}`;
        detailsDiv.appendChild(nameP);
        detailsDiv.appendChild(quantityP);

        // Right side: Nutrition Info
        const nutritionDiv = document.createElement('div');
        nutritionDiv.className = 'food-nutrition';

        // Helper to add nutrient if > 0
        const addNutrient = (label, value) => {
            if (value > 0) {
                const span = document.createElement('span');
                span.textContent = `${label}: ${value.toFixed(2)}`;
                nutritionDiv.appendChild(span);
            }
        };

        addNutrient('Fats', food.fats);
        addNutrient('Carbs', food.carbohydrates);
        addNutrient('Protein', food.protein);
        addNutrient('Fiber', food.fiber);
        addNutrient('Cholesterol', food.cholesterol);
        addNutrient('Calories', food.totalCalories); // Add calories per item

        listItem.appendChild(detailsDiv);
        listItem.appendChild(nutritionDiv);
        foodListContainer.appendChild(listItem);
    });

    // --- Calculate and Display Totals ---
    const totalFats = foods.reduce((sum, food) => sum + food.fats, 0);
    const totalCarbs = foods.reduce((sum, food) => sum + food.carbohydrates, 0);
    const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
    const totalFiber = foods.reduce((sum, food) => sum + food.fiber, 0);
    const totalCholesterol = foods.reduce((sum, food) => sum + food.cholesterol, 0);
    const totalCalories = foods.reduce((sum, food) => sum + food.totalCalories, 0);

    totalFatsSpan.textContent = totalFats.toFixed(2);
    totalCarbsSpan.textContent = totalCarbs.toFixed(2);
    totalProteinSpan.textContent = totalProtein.toFixed(2);
    totalFiberSpan.textContent = totalFiber.toFixed(2);
    totalCholesterolSpan.textContent = totalCholesterol.toFixed(2);
    totalCaloriesSpan.textContent = totalCalories.toFixed(2);

    totalsSection.style.display = 'block'; // Show totals

    // --- Render Chart ---
    const ctx = document.getElementById('nutrition-chart').getContext('2d');
    const chartData = {
        labels: ['Fats', 'Carbs', 'Protein', 'Fiber', 'Cholesterol', 'Calories'],
        datasets: [{
            label: 'Nutrition Totals',
            data: [totalFats, totalCarbs, totalProtein, totalFiber, totalCholesterol, totalCalories],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)', // Fats
                'rgba(54, 162, 235, 0.2)', // Carbs
                'rgba(75, 192, 192, 0.2)', // Protein
                'rgba(153, 102, 255, 0.2)', // Fiber
                'rgba(255, 159, 64, 0.2)', // Cholesterol
                'rgba(255, 206, 86, 0.2)'  // Calories
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Destroy existing chart instance if it exists
    if (window.nutritionChart) {
        window.nutritionChart.destroy();
    }

    // Create new chart instance
    window.nutritionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)