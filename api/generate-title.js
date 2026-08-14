const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function getPromptForVersion(version) {
  if (version === 'v1.4') {
    return process.env.PROMPT_V14;
  }
  return process.env.PROMPT;
}

// Keep track of the current index and whether the initial key scan was logged
let currentGroqKeyIndex = 0;
let keysCountLogged = false;

function getNextGroqKey() {
  const keys = Object.keys(process.env)
    .filter(k => k === 'GROQ' || k.match(/^GROQ_\d+$/))
    .sort((a, b) => {
      if (a === 'GROQ') return -1;
      if (b === 'GROQ') return 1;
      // Sort numerically for GROQ_2, GROQ_3, etc.
      return parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]);
    })
    .map(k => process.env[k])
    .filter(Boolean); // Remove undefined/empty keys

  if (keys.length === 0) {
    console.log("0 flavors of snacks found.");
    return null;
  }

  // Log how many total keys were discovered on warm/cold start once
  if (!keysCountLogged) {
    console.log(`${keys.length} flavors of snacks loaded.`);
    keysCountLogged = true;
  }

  // Calculate 1-indexed number for "flavor #"
  const flavorNumber = (currentGroqKeyIndex % keys.length) + 1;
  const selectedKey = keys[currentGroqKeyIndex % keys.length];

  // Log which flavor (API Key) is being used
  console.log(`Used flavor #${flavorNumber}`);

  // Increment and loop index
  currentGroqKeyIndex = (currentGroqKeyIndex + 1) % keys.length;

  return selectedKey;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GROQ_API_KEY = getNextGroqKey();
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ API key not configured' });

  try {
    const { messages, version } = req.body || {};
    const history = Array.isArray(messages) ? messages : [];
    const ver = version === 'v1.4' ? 'v1.4' : 'v1.6';
    const prompt = getPromptForVersion(ver);

    const systemContent = (
      `${prompt}\n\n` +
      `Based on the system prompt above and the conversation messages below, ` +
      `generate a short title that summarizes the topic of this conversation in 5 words or fewer. ` +
      `Return only the title text, no quotes, no punctuation at the end.`
    );

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 30,
      messages: [
        { role: 'system', content: systemContent },
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
    
    // MODIFIED: Return null instead of 'New chat' if content is missing
    const rawTitle = data.choices?.[0]?.message?.content?.trim();
    const title = rawTitle ? rawTitle.slice(0, 60) : null;
    
    return res.status(200).json({ title });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error' });
  }
}
