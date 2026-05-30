export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Разрешаем CORS-запросы
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metod rugsat edilmedi' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // В Edge-функциях данные всегда читаются через req.json()
    const body = await req.json();
    const poem = body.poem;

    if (!poem) {
      return new Response(JSON.stringify({ error: 'Goşgy ýok' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key tapylmady' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
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

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: 'Google API error', details: errText }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const rawJsonText = data.candidates[0].content.parts[0].text;

    return new Response(rawJsonText, {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
