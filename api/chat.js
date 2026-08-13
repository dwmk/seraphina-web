// api/chat.js
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function getPrompts(version) {
  if (version === 'v1.4') {
    return {
      system: process.env.PROMPT_V14,
      special: process.env.SPECIALPROMPT_V14,
    };
  }
  return {
    system: process.env.PROMPT,
    special: process.env.SPECIALPROMPT,
  };
}

// Keep track of the current index and whether the initial key scan was logged
let currentGroqKeyIndex = 0;
let keysCountLogged = false;

// Helper to retrieve all configured GROQ keys in order
function getGroqKeys() {
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

  if (!keysCountLogged && keys.length > 0) {
    console.log(`${keys.length} flavors of snacks loaded.`);
    keysCountLogged = true;
  }
  return keys;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const keys = getGroqKeys();
  if (keys.length === 0) {
    return res.status(500).json({ error: 'GROQ API key not configured' });
  }

  try {
    const { 
      messages, 
      wifeMode, 
      version, 
      jsonMode = false, 
      tools = null, 
      temperature = 0.6 
    } = req.body || {};

    const history = Array.isArray(messages) ? messages : [];
    const ver = version === 'v1.4' ? 'v1.4' : 'v1.6';
    const { system, special } = getPrompts(ver);

    // 1. Cap the memory to prevent prompt dilution (allow more when tools are active)
    const cap = tools && Array.isArray(tools) && tools.length > 0 ? 25 : 12;
    const recentHistory = history.slice(-cap);
    let basePrompt = wifeMode ? special : system;

    if (jsonMode) {
      basePrompt += '\n\nIMPORTANT: You must respond ONLY with valid JSON formatting.';
    }

    const contextualPrompt = `${basePrompt}\n\n--- CURRENT CONTEXT ---\nMaintain your established persona, instructions, and formatting strictly in your next response.`;

    // Construct full Groq payload with Llama 3.1 8B capabilities
    const payload = {
      model: GROQ_MODEL,
      temperature: temperature,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: contextualPrompt },
        ...recentHistory,
      ],
    };

    // 1. Enable Structured JSON Output if requested
    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    // 2. Pass Tools / Function Calling schema if active
    if (tools && Array.isArray(tools) && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = 'auto';
    }

    // Attempt request across ALL available keys until one succeeds
    let lastErrorDetail = null;
    let upstreamSuccess = false;
    let responseData = null;

    for (let i = 0; i < keys.length; i++) {
      const keyIndex = (currentGroqKeyIndex + i) % keys.length;
      const apiKey = keys[keyIndex];

      console.log(`Trying flavor #${keyIndex + 1}`);

      try {
        const upstream = await fetch(GROQ_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${apiKey}` 
          },
          body: JSON.stringify(payload),
        });

        if (upstream.ok) {
          responseData = await upstream.json();
          // Update starting index for the next call to load-balance keys
          currentGroqKeyIndex = (keyIndex + 1) % keys.length;
          upstreamSuccess = true;
          break; // Key worked, exit loop!
        } else {
          lastErrorDetail = await upstream.text();
          console.warn(`Flavor #${keyIndex + 1} failed:`, lastErrorDetail);
        }
      } catch (err) {
        lastErrorDetail = String(err);
        console.warn(`Flavor #${keyIndex + 1} network exception:`, err);
      }
    }

    // Only return error if ALL keys have been tried and failed
    if (!upstreamSuccess) {
      return res.status(502).json({ 
        error: 'All GROQ API keys failed', 
        detail: lastErrorDetail 
      });
    }

    const choice = responseData.choices?.[0]?.message;
    
    // Handle Function Call / Tool Call response if triggered
    if (choice?.tool_calls) {
      return res.status(200).json({ 
        toolCalls: choice.tool_calls, 
        reply: choice.content || '' 
      });
    }

    const reply = choice?.content?.trim() || '';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}