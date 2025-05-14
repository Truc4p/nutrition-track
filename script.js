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

const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');
const recommendButton = document.getElementById('recommend-button');
const recommendationText = document.getElementById('recommendation-text');
const goal = document.getElementById('goal').value;
const healthCondition = document.getElementById('health-condition').value.trim();

document.addEventListener('DOMContentLoaded', () => {

    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // CHATBOT
    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;

            // Display user message in the chat
            appendMessage('You', userMessage);

            // Clear input field
            chatInput.value = '';

            try {
                // Send user message to the chatbot.js server
                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userMessage }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Display chatbot response in the chat
                appendMessage('Nutrition Assistant', data.recommendation || 'No response received.');
            } catch (error) {
                console.error('Error communicating with chatbot server:', error);
                appendMessage('Nutrition Assistant', 'Sorry, I could not process your request. Please try again later.');
            }
        });
    }

    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        const isUser = sender === 'You';
        messageDiv.className = isUser ? 'user-message' : 'chatbot-message';
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${formatResponse(message)}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
    }

    function formatResponse(response) {
        return response
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
            .replace(/\n/g, '<br>') // Line breaks
            .replace(/\* (.*?)\n/g, '<ul><li>$1</li></ul>'); // Bullets
    }

    // --- Event Listeners ---
    if (chatInput) {
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendButton.click();
            }
        });
    }
});










recommendButton.addEventListener('click', async () => {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const age = parseInt(ageInput.value, 10);
    const gender = document.getElementById('gender').value;
    const activityLevel = document.getElementById('activity-level').value;
    const goal = document.getElementById('goal').value;
    const healthCondition = document.getElementById('health-condition').value.trim();

    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Update the global recommendation variable
        recommendation = calculateNutrition(weight, height, age, gender, activityLevel, healthCondition);

        // Add console.log to debug the recommendation variable
        console.log("Recommendation data:", recommendation);

        recommendationText.innerHTML = `
            <strong>Calories:</strong> ${formatValue(recommendation.calories)} kcal<br>
            <strong>Fats:</strong> ${formatValue(recommendation.fats.min)}g - ${formatValue(recommendation.fats.max)}g<br>
            <strong>Carbs:</strong> ${formatValue(recommendation.carbs.min)}g - ${formatValue(recommendation.carbs.max)}g<br>
            <strong>Protein:</strong> ${formatValue(recommendation.protein.min)}g - ${formatValue(recommendation.protein.max)}g<br>
            <strong>Fiber:</strong> ${formatValue(recommendation.fiber)}g<br>
            <strong>Cholesterol:</strong> ${formatValue(recommendation.cholesterol)}mg
        `;

        // Utility function to format values
        function formatValue(value) {
            const roundedValue = parseFloat(value.toFixed(2)); // Round to 2 decimal places
            return roundedValue % 1 === 0 ? roundedValue.toFixed(0) : roundedValue.toFixed(2); // Show as integer if no decimal part
        }

        renderRecommendedNutritionChart(); // Render the new chart

    } catch (error) {
        console.error("Error calculating recommendation:", error);
        recommendationText.textContent = "Failed to calculate recommendation. Please try again.";
    }
});

function calculateNutrition(weight, height, age, gender, activityLevel, healthCondition) {
    // Mifflin-St Jeor Equation for BMR
    const bmr =
        gender === "male"
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity level multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        "lightly-active": 1.375,
        "moderately-active": 1.55,
        "very-active": 1.725,
        athlete: 1.9,
    };

    const calories = bmr * activityMultipliers[activityLevel];

    // Adjust calories based on goal
    if (goal === "loss") {
        calories -= 500; // Subtract 500 calories for weight loss
    } else if (goal === "gain") {
        calories += 500; // Add 500 calories for weight gain
    }

    // AMDR (Acceptable Macronutrient Distribution Ranges) for macronutrients
    const fats = {
        min: (calories * 0.2) / 9, // 20% of calories
        max: (calories * 0.35) / 9, // 35% of calories
    };
    const carbs = {
        min: (calories * 0.45) / 4, // 45% of calories
        max: (calories * 0.65) / 4, // 65% of calories
    };
    const protein = {
        min: (calories * 0.1) / 4, // 10% of calories
        max: (calories * 0.35) / 4, // 35% of calories
    };

    // RDA/AI for fiber and cholesterol
    let fiber;
    if (age >= 1 && age <= 3) {
        fiber = 14; // Children 1-3 years
    } else if (age >= 4 && age <= 8) {
        fiber = 18; // Children 4-8 years
    } else if (age >= 9 && age <= 13) {
        fiber = gender === "male" ? 24 : 20; // Boys 9-13: 24g, Girls 9-13: 20g
    } else if (age >= 14 && age <= 18) {
        fiber = gender === "male" ? 28 : 22; // Boys 14-18: 28g, Girls 14-18: 22g
    } else if (age >= 19 && age <= 50) {
        if (gender === "male") {
            fiber = 30; // Men 19-50: 30-38g
        } else if (gender === "female") {
            fiber = 25; // Women 19-50: 25-28g
        } else {
            fiber = 28; // Pregnancy: 25-28g, Lactation: 27-30g
        }
    } else if (age >= 51) {
        fiber = gender === "male" ? 30 : 21; // Men 51+: 30g, Women 51+: 21-25g
    } else {
        fiber = 0; // Default if age is not valid
    }

    // Cholesterol recommendation
    let cholesterol = 300; // General recommendation
    const conditions = ["heart disease", "diabetes"];
    if (conditions.includes(healthCondition.toLowerCase())) {
        cholesterol = 200; // Limit for individuals with heart disease or diabetes
    }

    return { calories, fats, carbs, protein, fiber, cholesterol };
}




// --- State ---
let foods = [];
let isLoading = false;
let recommendation = null; // Add a global variable for recommendation
const API_URL = "http://127.0.0.1:8000/nlp/process_text_and_get_nutrition/";
const GEMINI_API_URL = "http://127.0.0.1:5000/ai/chat/"; 
// const QWEN_API_URL = "http://127.0.0.1:1234/v1/chat/completions";

const QWEN_API_URL = "http://localhost:8000/chat";

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
        datasets: [
            {
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
            },
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                enabled: true // Keep tooltips enabled
            },
            datalabels: {
                display: true,
                color: 'black',
                font: {
                    weight: 'bold'
                },
                formatter: (value) => value.toFixed(2) // Format the value if needed
            }
        }
    };

    // Add this plugin to render values on top of bars
    Chart.register({
        id: 'value-on-top',
        afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];
                    const roundedValue = parseFloat(value.toFixed(2)); // Round to 2 decimal places
                    if (roundedValue !== 0) { // Only show if not 0.00
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(roundedValue, bar.x, bar.y - 5); // Position the text above the bar
                    }
                });
            });
        }
    });

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


function renderRecommendedNutritionChart() {
    if (!recommendation) {
        console.error("Recommendation data is not available.");
        return;
    }

    const ctx = document.getElementById('recommended-nutrition-chart').getContext('2d');
    const chartData = {
        labels: ['Fats', 'Carbs', 'Protein', 'Fiber', 'Cholesterol', 'Calories'],
        datasets: [
            {
                label: 'Recommended Nutrition',
                data: [
                    recommendation.fats.max,
                    recommendation.carbs.max,
                    recommendation.protein.max,
                    recommendation.fiber,
                    recommendation.cholesterol,
                    recommendation.calories
                ],
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
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                enabled: true // Keep tooltips enabled
            },
            datalabels: {
                display: true,
                color: 'black',
                font: {
                    weight: 'bold'
                },
                formatter: (value) => value.toFixed(2) // Format the value if needed
            }
        }
    };

    // Add this plugin to render values on top of bars
    Chart.register({
        id: 'value-on-top',
        afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];
                    const roundedValue = parseFloat(value.toFixed(2)); // Round to 2 decimal places
                    if (roundedValue !== 0) { // Only show if not 0.00
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(roundedValue, bar.x, bar.y - 5); // Position the text above the bar
                    }
                });
            });
        }
    });

    // Destroy existing chart instance if it exists
    if (window.recommendedNutritionChart) {
        window.recommendedNutritionChart.destroy();
    }

    // Create new chart instance
    window.recommendedNutritionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

// --- Initial Setup ---
handleInputChange(); // Set initial button states
updateUI(); // Initial render (likely empty)