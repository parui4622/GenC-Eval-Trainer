export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY environment variable is not defined on Vercel.");
        return res.status(500).json({ error: "Missing GEMINI_API_KEY environment variable on server." });
    }

    const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(GOOGLE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API rejected request:", JSON.stringify(data));
            return res.status(response.status).json({ error: data.error?.message || "Google rejected the request" });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Fetch failure:", error.message);
        return res.status(500).json({ error: "Serverless function failed to reach Google API: " + error.message });
    }
}
