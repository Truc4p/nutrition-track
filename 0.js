const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Replace with your Gemini API key
const GEMINI_KEY = 'AIzaSyAZbp4SEeaAq8ioyvuWNF7kcwalhNA8h8I';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// Enable CORS with proper configuration
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Allow requests from this origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

// Middleware
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Endpoint to handle recommendations
app.post('/ai/recommend_nutrition', async (req, res) => {
    const { healthCondition } = req.body;

    console.log('Request body:', req.body);

    if (!healthCondition) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields: healthCondition.' });
    }

    const prompt = `Based on health conditions of ${healthCondition}, recommend daily intake of nutritions.`;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        });
    
        if (!response.ok) {
            const errorText = await response.text(); // Log the full error response
            console.error('Gemini API error:', response.status, response.statusText, errorText);
            throw new Error(`Gemini API error: ${response.statusText}`);
        }
    
        const data = await response.json();
        console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
        const recommendation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation available.';
        res.json({ recommendation });
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation from Gemini API.' });
    }
});

// Start the server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});