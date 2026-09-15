import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve the .env path from the project directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Silence browser favicon 404 requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve static frontend assets from root directory
app.use(express.static(__dirname));

// POST /api/generate endpoint calling Gemini 1.5 Flash
app.post('/api/generate', async (req, res) => {
    const rawKey = process.env.GEMINI_API_KEY;
    const apiKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["'];?$|;$/g, '') : '';

    if (!apiKey) {
        console.error("[Local Server] Error: GEMINI_API_KEY is not set in .env file.");
        return res.status(500).json({
            error: {
                code: 500,
                message: "Missing GEMINI_API_KEY in local .env file. Please check your configuration."
            }
        });
    }

    const GOOGLE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    try {
        const response = await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Local Server] Google Gemini API error:", JSON.stringify(data));
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("[Local Server] Request error:", error);
        return res.status(500).json({
            error: {
                code: 500,
                message: "Failed to communicate with Gemini API: " + error.message
            }
        });
    }
});

// Explicit route for root to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    const rawKey = process.env.GEMINI_API_KEY;
    const isLoaded = Boolean(rawKey && rawKey.trim());
    const keyLength = isLoaded ? rawKey.trim().length : 0;

    console.log(`Local calibration server running at http://localhost:${PORT}`);
    console.log(`GEMINI_API_KEY loaded: ${isLoaded ? 'YES' : 'NO'} (Length: ${keyLength})`);
});
