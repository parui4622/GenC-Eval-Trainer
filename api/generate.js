export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawKey = process.env.GEMINI_API_KEY;
    const API_KEY = rawKey ? rawKey.trim() : null;

    if (!API_KEY) {
        console.error("Diagnostic: API Key is missing or empty.");
        return res.status(500).json({ error: "Missing API key in Vercel environment." });
    }

    // DIFFERENT APPROACH: Passing the API key strictly as a URL query parameter
    const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: {
                // Notice: No authorization headers here anymore
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", JSON.stringify(data));
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Network failure: " + error.message });
    }
}
