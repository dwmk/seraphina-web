import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Lock, CaretDown } from '@phosphor-icons/react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { BlockScreen } from './components/BlockScreen';
import { fetchAIReply, verifyWifePassword, generateTitle } from './lib/api';
import {
  loadConversations, createConversation, deleteConversation, updateConversation,
  getRateInfo, recordMessage, isWifeEnabled, setWifeEnabled,
} from './lib/storage';

const VERSIONS = ['v1.6', 'v1.4'];

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rateInfo, setRateInfo] = useState({ blocked: false, resetIn: 0, remaining: 30 });
  const [wifeMode, setWifeMode] = useState(false);
  const [wifeModal, setWifeModal] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState('v1.6');
  const [versionDropdown, setVersionDropdown] = useState(false);

  const scrollRef = useRef(null);
  const msgCountRef = useRef(0);

  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    setWifeMode(isWifeEnabled());
    setRateInfo(getRateInfo());
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    const conv = conversations.find((c) => c.id === activeId);
    setMessages(conv ? conv.messages : []);
    msgCountRef.current = conv ? conv.messages.length : 0;
  }, [activeId, conversations]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!rateInfo.blocked) return;
    const t = setInterval(() => {
      const info = getRateInfo();
      setRateInfo(info);
      if (!info.blocked) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [rateInfo.blocked]);

  const handleNew = () => {
    const conv = createConversation('New chat');
    setConversations(loadConversations());
    setActiveId(conv.id);
    setMessages([]);
    msgCountRef.current = 0;
    setSidebarOpen(false);
    setError('');
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError('');
  };

  const handleDelete = (id) => {
    const remaining = deleteConversation(id);
    setConversations(remaining);
    if (activeId === id) {
      setActiveId(remaining[0]?.id || null);
      setMessages(remaining[0]?.messages || []);
    }
  };

  const persistMessages = (convId, msgs) => {
    updateConversation(convId, (c) => ({ ...c, messages: msgs }));
    setConversations(loadConversations());
  };

  const maybeGenerateTitle = async (convId, msgs) => {
    if (msgCountRef.current > 0 && msgCountRef.current % 5 !== 0) return;
    try {
      const title = await generateTitle(msgs);
      if (title) {
        updateConversation(convId, (c) => ({ ...c, title }));
        setConversations(loadConversations());
      }
    } catch {}
  };

  const handleSend = async (text) => {
    let convId = activeId;
    if (!convId) {
      const conv = createConversation('New chat');
      convId = conv.id;
      setConversations(loadConversations());
      setActiveId(convId);
    }

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    persistMessages(convId, newMsgs);
    msgCountRef.current += 1;

    setLoading(true);
    setError('');
    try {
      const reply = await fetchAIReply(newMsgs, wifeMode, version);
      const aiMsg = { role: 'assistant', content: reply };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      persistMessages(convId, finalMsgs);
      msgCountRef.current += 1;

      const info = recordMessage();
      setRateInfo(info);

      maybeGenerateTitle(convId, finalMsgs);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWifeMode = () => {
    if (wifeMode) {
      setWifeMode(false);
      setWifeEnabled(false);
    } else {
      setWifeModal({ input: '', error: '', loading: false });
    }
  };

  const submitWifePassword = async () => {
    setWifeModal({ ...wifeModal, loading: true, error: '' });
    try {
      const valid = await verifyWifePassword(wifeModal.input);
      if (valid) {
        setWifeMode(true);
        setWifeEnabled(true);
        setWifeModal(null);
      } else {
        setWifeModal({ ...wifeModal, loading: false, error: 'Incorrect password' });
      }
    } catch {
      setWifeModal({ ...wifeModal, loading: false, error: 'Verification failed' });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-white relative">
      {/* Animated aurora background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] animate-aurora-1" />
        <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-aurora-2" />
        <div className="absolute -bottom-1/4 left-1/3 w-[550px] h-[550px] bg-emerald-500/8 rounded-full blur-[120px] animate-aurora-3" />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area - always centered */}
      <div className="absolute inset-0 flex flex-col z-10 pointer-events-none">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl pointer-events-auto">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
          >
            <List size={22} />
          </button>

          <div className="flex items-center gap-2">
            <Logo size={28} variant={2} />
            <span className="font-bold text-white">Seraphina</span>
          </div>

          {/* Version dropdown */}
          <div className="relative">
            <button
              onClick={() => setVersionDropdown((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-zinc-300 transition-colors"
            >
              {version}
              <CaretDown size={14} className={`transition-transform ${versionDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {versionDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setVersionDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-2 w-32 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
                  >
                    {VERSIONS.map((v) => (
                      <button
                        key={v}
                        onClick={() => { setVersion(v); setVersionDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          v === version ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {wifeMode && (
            <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              Wife Mode
            </span>
          )}

          {/* Message counter - top right */}
          <div className="ml-auto flex items-center gap-2 text-sm text-zinc-400">
            <span className={`font-mono ${rateInfo.remaining <= 5 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {rateInfo.remaining}/{rateInfo.max || 30}
            </span>
            <span className="text-zinc-600 text-xs">messages left</span>
          </div>
        </header>

        {/* Chat messages - centered */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pointer-events-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center pt-20"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-6"
                >
                  <Logo size={72} variant={1} />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
                <p className="text-zinc-500 text-sm">Start a conversation with Seraphina</p>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                      <Logo size={20} variant={2} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-white text-zinc-900 rounded-tr-sm'
                        : 'bg-white/5 border border-white/10 text-zinc-100 rounded-tl-sm backdrop-blur-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                  <Logo size={20} variant={2} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="max-w-3xl mx-auto text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </main>

        <ChatInput
          onSend={handleSend}
          disabled={loading || rateInfo.blocked}
          wifeMode={wifeMode}
          onToggleWifeMode={handleToggleWifeMode}
        />
      </div>

      {rateInfo.blocked && <BlockScreen resetIn={rateInfo.resetIn} />}

      {/* Wife Mode password modal */}
      <AnimatePresence>
        {wifeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => !wifeModal.loading && setWifeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-3xl max-w-sm w-full p-8 shadow-2xl"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Lock size={28} className="text-pink-400" weight="duotone" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-white mb-2">Wife Mode</h3>
              <p className="text-center text-zinc-500 text-sm mb-6">Enter the password to enable Wife Mode</p>
              <input
                type="password"
                autoFocus
                value={wifeModal.input}
                onChange={(e) => setWifeModal({ ...wifeModal, input: e.target.value, error: '' })}
                onKeyDown={(e) => { if (e.key === 'Enter' && !wifeModal.loading) submitWifePassword(); }}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 outline-none focus:border-pink-500/50 text-white placeholder-zinc-600 mb-2"
              />
              {wifeModal.error && <p className="text-red-400 text-xs mb-2">{wifeModal.error}</p>}
              <button
                onClick={submitWifePassword}
                disabled={wifeModal.loading}
                className="w-full py-3 bg-white text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {wifeModal.loading ? 'Verifying...' : 'Unlock'}
              </button>
              <button
                onClick={() => setWifeModal(null)}
                className="w-full py-2 mt-2 text-zinc-500 text-sm hover:text-zinc-300"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
