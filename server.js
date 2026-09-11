const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// PASTE YOUR BRAND NEW "AQ." API KEY HERE
const API_KEY = "AQ.Ab8RN6LMg_UL4nIO-TzKZEve0sEim3IA-plxcUYJFZYh29sSoQ"; 

// Pass the key directly in the URL parameter instead of headers
const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

app.post('/api/generate', async (req, res) => {
    try {
        const response = await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Header 'x-goog-api-key' removed, now using URL parameter
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Google API Gateway Error:", data);
            return res.status(500).json({ error: data.error?.message || "Google rejected the request" });
        }

        res.json(data);
    } catch (error) {
        console.error("Backend Fetch Exception:", error);
        res.status(500).json({ error: "Backend routing failed to reach Google." });
    }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));