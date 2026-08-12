export async function fetchAIReply(messages, wifeMode = false, version = 'v1.6') {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, wifeMode, version }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Request failed (${res.status})`);
  }
  const data = await res.json();
  return data.reply;
}

export async function verifyWifePassword(password) {
  const res = await fetch('/api/verify-wife', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  return data.valid === true;
}

export async function generateTitle(messages, version = 'v1.6') {
  const res = await fetch('/api/generate-title', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, version }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data.title || null;
}
