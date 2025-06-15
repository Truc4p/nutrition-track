const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// // Replace with your Gemini API key
const GEMINI_KEY = 'AIzaSyAZbp4SEeaAq8ioyvuWNF7kcwalhNA8h8I';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// Enable CORS with proper configuration
app.use(cors({
    origin: '*', // Allow all origins
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
app.post('/ai/chat', async (req, res) => {
    const { userMessage } = req.body;

    console.log('Request body:', req.body);

    if (!userMessage) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields: userMessage.' });
    }

    const prompt = `Answer ${userMessage}`;

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

        // Extract the recommendation from the response
        const recommendation =
            data.candidates && data.candidates[0]?.content?.parts[0]?.text
                ? data.candidates[0].content.parts[0].text
                : 'No recommendation available.';
        res.json({ recommendation });
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation from Gemini API.' });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Access from local machine: http://127.0.0.1:${PORT}`);
    console.log(`Access from network: http://192.168.88.55:${PORT}`);
});