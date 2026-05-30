export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metod rugsat edilmedi' });
    }

    const { poem } = req.body;
    if (!poem) {
        return res.status(400).json({ error: 'Goşgy ýok' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 
    const systemPrompt = `Sen edebiýatçy alym, türkmen poeziýasynyň bilermeni. Berlen türkmençe goşgyny synergetik taýdan derňe we DIŇE JSON görnüşinde jogap ber. Artykmaç söz ýazma, Markdown formatyny (\`\`\`json) ulanma. Struktura: {"summary": "pelsepewi netije", "details": [{"phrase": "metofora", "analysis": "manysy"}]}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: poem }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
            })
        });

        const data = await response.json();
        const rawJsonText = data.candidates[0].content.parts[0].text;
        
        return res.status(200).json(JSON.parse(rawJsonText));
    } catch (error) {
        return res.status(500).json({ error: 'Server näsazlygy', details: error.message });
    }
}
