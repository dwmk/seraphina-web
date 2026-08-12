const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = process.env.PROMPT || 'You are Seraphina, a helpful AI assistant.';
const SPECIAL_PROMPT = process.env.SPECIALPROMPT || SYSTEM_PROMPT;
const GROQ_API_KEY = process.env.GROQ || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, wifeMode } = req.body || {};
    const history = Array.isArray(messages) ? messages : [];

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: wifeMode ? SPECIAL_PROMPT : SYSTEM_PROMPT },
        ...history,
      ],
    };

    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      return res.status(502).json({ error: 'Upstream error', detail: txt });
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
