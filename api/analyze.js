export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metod rugsat edilmedi' });
    }

    const { poem } = req.body;
    if (!poem) {
        return res.status(400).json({ error: 'Goşgy ýok' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
        return res.status(500).json({ error: 'Серверная ошибка: Ключ не найден на Vercel.' });
    }

    const fullPrompt = `Sen edebiýatçy alym, türkmen poeziýasynyň bilermeni. Berlen türkmençe goşgyny synergetik (ulgamlaýyn, metofora böküşleri, tertip we haos) taýdan derňe we DIŇE we DIŇE arassa JSON görnüşinde jogap ber. Markdown formatyny (\`\`\`json) ulanma. Jogabyň dili professional edebi türkmen dili bolmaly. Struktura anyk şu görnüşde bolmaly: {"summary": "pelsepewi netije", "details": [{"phrase": "metofora", "analysis": "manysy"}]}. \n\n Derňelmeli goşgy:\n${poem}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
            })
        });

        if (!response.ok) {
            return res.status(500).json({ error: 'Google API error' });
        }

        const data = await response.json();
        const rawJsonText = data.candidates[0].content.parts[0].text;
        
        return res.status(200).json(JSON.parse(rawJsonText));
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
}
