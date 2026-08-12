const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GROQ_API_KEY = process.env.GROQ || '';
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ API key not configured' });

  try {
    const { messages } = req.body || {};
    const history = Array.isArray(messages) ? messages : [];

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 30,
      messages: [
        { role: 'system', content: 'Generate a short, concise title (max 5 words) for this conversation. Return only the title, no quotes, no punctuation at the end.' },
        ...history.slice(-6),
      ],
    };

    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) return res.status(502).json({ error: 'Upstream error' });

    const data = await upstream.json();
    const title = (data.choices?.[0]?.message?.content?.trim() || 'New chat').slice(0, 60);
    return res.status(200).json({ title });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error' });
  }
}
