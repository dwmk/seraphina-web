const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function getPrompts(version) {
  if (version === 'v1.4') {
    return {
      system: process.env.PROMPT_V14 || process.env.PROMPT || 'You are Seraphina, a helpful AI assistant.',
      special: process.env.SPECIALPROMPT_V14 || process.env.SPECIALPROMPT || process.env.PROMPT_V14 || process.env.PROMPT || 'You are Seraphina, a helpful AI assistant.',
    };
  }
  return {
    system: process.env.PROMPT || 'You are Seraphina, a helpful AI assistant.',
    special: process.env.SPECIALPROMPT || process.env.PROMPT || 'You are Seraphina, a helpful AI assistant.',
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GROQ_API_KEY = process.env.GROQ || '';
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ API key not configured' });

  try {
    const { messages, wifeMode, version } = req.body || {};
    const history = Array.isArray(messages) ? messages : [];
    const ver = version === 'v1.4' ? 'v1.4' : 'v1.6';
    const { system, special } = getPrompts(ver);

    // 1. Cap the memory to the last 10-15 messages to prevent prompt dilution
    const recentHistory = history.slice(-12);

    // 2. Re-introduce the contextual anchor block to reinforce the prompt
    const basePrompt = wifeMode ? special : system;
    const contextualPrompt = `${basePrompt}\n\n--- CURRENT CONTEXT ---\nMaintain your established persona, instructions, and formatting strictly in your next response.`;

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.7, // You may want to lower this to 0.5 or 0.6 if she is still drifting
      max_tokens: 1024,
      messages: [
        { role: 'system', content: contextualPrompt },
        ...recentHistory,
      ],
    };

    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
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
