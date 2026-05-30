const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Настройка CORS заголовков
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metod rugsat edilmedi' });
    }

    try {
        const { poem } = req.body;
        if (!poem) {
            return res.status(400).json({ error: 'Goşgy ýok' });
        }

        const apiKey = process.env.GEMINI_API_KEY; 
        if (!apiKey) {
            return res.status(500).json({ error: 'Klyuç Vercel-de tapylmady' });
        }

        const fullPrompt = `Sen edebiýatçy alym, türkmen poeziýasynyň bilermeni. Berlen türkmençe goşgyny synergetik taýdan derňe we DIŇE JSON görnüşinde jogap ber. Markdown formatyny ulanma. Struktura takyk şu görnüşde bolmaly: {"summary": "pelsepewi netije", "details": [{"phrase": "metofora", "analysis": "manysy"}]}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${fullPrompt}\n\nGoşgy:\n${poem}` }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
            })
        });

        if (!googleResponse.ok) {
            const errText = await googleResponse.text();
            return res.status(500).json({ error: 'Google şowsuz boldy', details: errText });
        }

        const data = await googleResponse.json();
        const rawJsonText = data.candidates[0].content.parts[0].text;
        
        return res.status(200).json(JSON.parse(rawJsonText));

    } catch (error) {
        return res.status(500).json({ error: 'Server näsazlygy', details: error.message });
    }
};
