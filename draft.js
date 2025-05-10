

askButton.addEventListener('click', async () => {

    if (!healthCondition) { // Check if the value is empty
        alert("Please fill in all fields.");
        return;
    }

    try {
        const recommendation = await getNutritionRecommendation(healthCondition); // Pass the value
        askText.textContent = recommendation;
    } catch (error) {
        console.error("Error fetching recommendation:", error);
        askText.textContent = "Failed to get recommendation. Please try again.";
    }
});

async function getNutritionRecommendation(healthCondition) {
    const API_URL = "http://127.0.0.1:5000/ai/chat"; // Replace with your AI API endpoint

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ healthCondition }), // Send the value
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendation; // Assuming the API returns a "recommendation" field
}
