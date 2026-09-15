export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: {
                code: 405,
                message: 'Method not allowed'
            }
        });
    }

    const rawKey = process.env.GEMINI_API_KEY;
    const apiKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["'];?$|;$/g, '') : '';

    if (!apiKey) {
        console.error("[Vercel Serverless] Error: GEMINI_API_KEY is missing or empty.");
        return res.status(500).json({
            error: {
                code: 500,
                message: "Missing GEMINI_API_KEY in Vercel environment variables."
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
            console.error("[Vercel Serverless] Upstream Google API Error:", JSON.stringify(data));
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("[Vercel Serverless] Request error:", error);
        return res.status(500).json({
            error: {
                code: 500,
                message: "Failed to communicate with Gemini API: " + error.message
            }
        });
    }
}
