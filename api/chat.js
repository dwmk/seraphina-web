// api/chat.js
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const TOOL_ALIASES = {
  brave_search: 'web_search',
  search: 'web_search',
  google_search: 'web_search',
  ddg_search: 'web_search',
  bing_search: 'web_search',
  wiki: 'wikipedia_search',
  wikipedia: 'wikipedia_search',
  wiki_search: 'wikipedia_search',
  internet_search: 'web_search',
  web_lookup: 'web_search',
};

function parseTextToolCalls(content) {
  if (!content || typeof content !== 'string') return null;

  const regex = /<function=(\w+)>\s*([\s\S]*?)<\/function>/g;
  const calls = [];
  let match;
  let firstIndex = content.length;
  let lastIndex = 0;

  while ((match = regex.exec(content)) !== null) {
    let name = match[1];
    if (TOOL_ALIASES[name]) name = TOOL_ALIASES[name];

    let rawArgs = match[2].trim();
    try { JSON.parse(rawArgs); } catch { rawArgs = '{}'; }

    calls.push({
      id: `text_call_${calls.length}`,
      function: { name, arguments: rawArgs },
    });
    firstIndex = Math.min(firstIndex, match.index);
    lastIndex = Math.max(lastIndex, regex.lastIndex);
  }

  if (calls.length === 0) return null;

  const textBefore = content.slice(0, firstIndex).trim();
  const textAfter = content.slice(lastIndex).trim();
  const reply = [textBefore, textAfter].filter(Boolean).join('\n\n');

  return { toolCalls: calls, reply };
}

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

    let contextualPrompt = `${basePrompt}\n\n--- CURRENT CONTEXT ---\nMaintain your established persona, instructions, and formatting strictly in your next response.\n\n--- MATH FORMATTING ---\nWhen writing mathematical expressions, use LaTeX notation wrapped in dollar signs. Use $...$ for inline math (e.g. $E = mc^2$) and $...$ for display/block math (e.g. $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$). Always use \\frac for fractions, \\sum for summations, \\sqrt for roots, etc. Never use plain-text math notation like "x^2" or "1/2" when LaTeX is available.`;

    if (tools && Array.isArray(tools) && tools.length > 0) {
      const toolNames = tools.map(t => t.function.name).join(', ');
      contextualPrompt += `\n\n--- TOOL USE INSTRUCTIONS ---\nYou have access to these tools: ${toolNames}.\nWhen the user asks for real-time data (weather, time, prices, web search, etc.), you MUST call the appropriate tool instead of guessing.\nOnly call tools from the list above. Do NOT invent tool names like "brave_search" or "google_search" — use "web_search" for web lookups and "wikipedia_search" for encyclopedic info.\nCall tools using the standard function-calling format provided by the system.`;
    }

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
    
    // Handle structured Function Call / Tool Call response
    if (choice?.tool_calls && Array.isArray(choice.tool_calls) && choice.tool_calls.length > 0) {
      const mappedCalls = choice.tool_calls.map(tc => {
        let name = tc.function?.name || '';
        if (TOOL_ALIASES[name]) name = TOOL_ALIASES[name];
        return { ...tc, function: { ...tc.function, name } };
      });
      return res.status(200).json({ 
        toolCalls: mappedCalls, 
        reply: choice.content || '' 
      });
    }

    // Fallback: parse text-based tool calls from content
    const textParsed = parseTextToolCalls(choice?.content || '');
    if (textParsed) {
      return res.status(200).json({ 
        toolCalls: textParsed.toolCalls, 
        reply: textParsed.reply 
      });
    }

    const reply = choice?.content?.trim() || '';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}