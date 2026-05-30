export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metod rugsat edilmedi' }), { status: 405 });
  }

  try {
    const { poem } = await req.json();
    if (!poem) {
      return new Response(JSON.stringify({ error: 'Goşgy ýok' }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key tapylmady' }), { status: 500 });
    }

    const fullPrompt = `Sen edebiýatçy alym, türkmen poeziýasynyň bilermeni. Berlen türkmençe goşgyny synergetik taýdan derňe we DIŇE JSON görnüşinde jogap ber. Markdown formatyny ulanma. Struktura: {"summary": "pelsepewi netije", "details": [{"phrase": "metofora", "analysis": "manysy"}]}. \n\n Goşgy:\n${poem}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
      })
    });

    const data = await response.json();
    const rawJsonText = data.candidates[0].content.parts[0].text;

    return new Response(rawJsonText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), { status: 500 });
  }
}
