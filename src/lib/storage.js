const KEY = 'seraphina_state_v1';
const WIFE_KEY = 'seraphina_wife_v1';

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadConversations() {
  return loadState().conversations || [];
}

export function saveConversations(conversations) {
  const state = loadState();
  state.conversations = conversations;
  saveState(state);
}

export function createConversation(title = 'New chat') {
  const conv = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    messages: [],
    createdAt: Date.now(),
  };
  const convs = loadConversations();
  convs.unshift(conv);
  saveConversations(convs);
  return conv;
}

export function deleteConversation(id) {
  const convs = loadConversations().filter((c) => c.id !== id);
  saveConversations(convs);
  return convs;
}

export function updateConversation(id, updater) {
  const convs = loadConversations();
  const idx = convs.findIndex((c) => c.id === id);
  if (idx === -1) return convs;
  convs[idx] = updater(convs[idx]) || convs[idx];
  saveConversations(convs);
  return convs;
}

const RATE_MAX = 30;
const RATE_WINDOW_MS = 30 * 60 * 1000;

export function getRateInfo() {
  const state = loadState();
  const now = Date.now();
  const timestamps = (state.rateTimestamps || []).filter((t) => now - t < RATE_WINDOW_MS);
  return {
    count: timestamps.length,
    remaining: Math.max(0, RATE_MAX - timestamps.length),
    blocked: timestamps.length >= RATE_MAX,
    oldest: timestamps[0] || null,
    resetIn: timestamps[0] ? Math.max(0, RATE_WINDOW_MS - (now - timestamps[0])) : 0,
  max: RATE_MAX,
  windowMinutes: 30,
  timestamps,
  windowMs: RATE_WINDOW_MS,
  oldestTimestamp: timestamps[0] || null,
  resetAt: timestamps[0] ? timestamps[0] + RATE_WINDOW_MS : 0,
  blocked_: timestamps.length >= RATE_MAX,
  resetInMs: timestamps[0] ? Math.max(0, RATE_WINDOW_MS - (now - timestamps[0])) : 0,
  remainingMessages: Math.max(0, RATE_MAX - timestamps.length),
    messageCount: timestamps.length,
    limit: RATE_MAX,
    windowMin: 30,
    oldestTs: timestamps[0] || null,
  };
}

export function recordMessage() {
  const state = loadState();
  const now = Date.now();
  const timestamps = (state.rateTimestamps || []).filter((t) => now - t < RATE_WINDOW_MS);
  timestamps.push(now);
  state.rateTimestamps = timestamps;
  saveState(state);
  return getRateInfo();
}

export function isWifeEnabled() {
  return localStorage.getItem(WIFE_KEY) === '1';
}

export function setWifeEnabled(on) {
  localStorage.setItem(WIFE_KEY, on ? '1' : '0');
}
