const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Required for Node.js

const app = express();
const PORT = 1234;

const GWEN_API_URL = "http://127.0.0.1:1234/v1";

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

// Health check
app.get('/models', (req, res) => {
    res.send('Server is running');
});

// Main chat endpoint
app.post('/chat/completions', async (req, res) => {
    const { userMessage } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing userMessage.' });
    }

    const prompt = `Answer ${userMessage}`;

    try {
        console.log('Request body sent to Gwen API:', JSON.stringify({
            model: "qwen2.5-0.5b-instruct-mlx",
            messages: [
                { role: "user", content: prompt }
            ]
        }, null, 2)); // Log the request body

        const response = await fetch(GWEN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                model: "qwen2.5-0.5b-instruct-mlx",
                messages: [
                    { role: "user", content: prompt }
                ]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gwen API error:', response.status, response.statusText, errorText);
            throw new Error(`Gwen API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Gwen API response:', data);

        const recommendation = data.choices?.[0]?.message?.content || 'No response.';
        res.json({ recommendation });

    } catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation from Gwen API.' });
    }
});

// Catch-all route (this should be last!)
app.use((req, res) => {
    console.warn(`Unexpected request to ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});



// app.use(cors({
//     origin: 'http://127.0.0.1:5500', // Allow requests only from this origin
//     methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
// }));


// // Method check
// app.all('/chat/completions', (req, res, next) => {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ error: 'Method not allowed' });
//     }
//     next();
// });


// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = 5000;

// // // Replace with your Gemini API key
// const GEMINI_KEY = 'AIzaSyAZbp4SEeaAq8ioyvuWNF7kcwalhNA8h8I';
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// // Enable CORS with proper configuration
// app.use(cors({
//     origin: '*', // Allow all origins
//     // origin: 'http://127.0.0.1:5500', // Allow requests from this origin
//     methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
// }));

// // Middleware
// app.use(bodyParser.json());

// // Health check route
// app.get('/', (req, res) => {
//     res.send('Server is running');
// });

// // Endpoint to handle recommendations
// app.post('/ai/chat', async (req, res) => {
//     const { userMessage } = req.body;

//     console.log('Request body:', req.body);

//     if (!userMessage) {
//         console.error('Missing required fields');
//         return res.status(400).json({ error: 'Missing required fields: userMessage.' });
//     }

//     const prompt = `Answer ${userMessage}`;

//     try {
//         const response = await fetch(GEMINI_API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 contents: [
//                     {
//                         parts: [{ text: prompt }],
//                     },
//                 ],
//             }),
//         });

//         if (!response.ok) {
//             const errorText = await response.text(); // Log the full error response
//             console.error('Gemini API error:', response.status, response.statusText, errorText);
//             throw new Error(`Gemini API error: ${response.statusText}`);
//         }

//         const data = await response.json();
//         console.log('Gemini API response:', JSON.stringify(data, null, 2));

//         // Extract the recommendation from the response
//         const recommendation =
//             data.candidates && data.candidates[0]?.content?.parts[0]?.text
//                 ? data.candidates[0].content.parts[0].text
//                 : 'No recommendation available.';
//         res.json({ recommendation });
//     } catch (error) {
//         console.error('Error fetching recommendation:', error);
//         res.status(500).json({ error: 'Failed to fetch recommendation from Gemini API.' });
//     }
// });

// // Start the server
// app.listen(PORT, '127.0.0.1', () => {
//     console.log(`Server is running on http://127.0.0.1:${PORT}`);
// });