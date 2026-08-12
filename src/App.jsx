import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, Lock } from '@phosphor-icons/react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { BlockScreen } from './components/BlockScreen';
import { fetchAIReply } from './lib/api';
import {
  loadConversations, createConversation, deleteConversation, updateConversation,
  getRateInfo, recordMessage, isWifeEnabled, setWifeEnabled,
} from './lib/storage';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rateInfo, setRateInfo] = useState({ blocked: false, resetIn: 0 });
  const [wifeMode, setWifeMode] = useState(false);
  const [wifeModal, setWifeModal] = useState(null);
  const [error, setError] = useState('');

  const scrollRef = useRef(null);

  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    setWifeMode(isWifeEnabled());
    setRateInfo(getRateInfo());
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const conv = conversations.find((c) => c.id === activeId);
    setMessages(conv ? conv.messages : []);
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

  const handleSend = async (text) => {
    if (!activeId) handleNew();
    const convId = activeId || (createConversation('New chat').id);
    if (!activeId) {
      setConversations(loadConversations());
      setActiveId(convId);
    }

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    updateConversation(convId, (c) => ({ ...c, messages: newMsgs, title: c.messages.length === 0 ? text.slice(0, 40) : c.title }));
    setConversations(loadConversations());

    setLoading(true);
    setError('');
    try {
      const reply = await fetchAIReply(newMsgs, wifeMode);
      const aiMsg = { role: 'assistant', content: reply };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      updateConversation(convId, (c) => ({ ...c, messages: finalMsgs }));
      setConversations(loadConversations());
      const info = recordMessage();
      setRateInfo(info);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleWifePassword = () => {
    if (wifeMode) {
      setWifeMode(false);
      setWifeEnabled(false);
      return;
    }
    setWifeModal({ input: '', error: '' });
  };

  const submitWifePassword = () => {
    const password = process.env.VITE_WIFE_PASSWORD || 'seraphina';
    if (wifeModal.input === password) {
      setWifeMode(true);
      setWifeEnabled(true);
      setWifeModal(null);
    } else {
      setWifeModal({ ...wifeModal, error: 'Incorrect password' });
    }
  };

  return (
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 p-4 border-b border-zinc-200 bg-white/80 backdrop-blur-sm z-20">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100"
          >
            <List size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={28} variant={2} />
            <span className="font-bold text-zinc-900">Seraphina</span>
          </div>
          {wifeMode && (
            <span className="ml-auto text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
              Wife Mode
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center pt-20">
                <Logo size={64} variant={1} className="mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">How can I help you today?</h2>
                <p className="text-zinc-400 text-sm">Start a conversation with Seraphina</p>
              </div>
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
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-1">
                      <Logo size={20} variant={2} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zinc-900 text-zinc-100 rounded-tr-sm'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-1">
                  <Logo size={20} variant={2} />
                </div>
                <div className="px-5 py-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="max-w-3xl mx-auto text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
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
          onToggleWifeMode={handleWifePassword}
        />
      </div>

      {rateInfo.blocked && <BlockScreen resetIn={rateInfo.resetIn} />}

      <AnimatePresence>
        {wifeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setWifeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
                  <Lock size={28} className="text-pink-500" weight="duotone" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-zinc-900 mb-2">Wife Mode Password</h3>
              <p className="text-center text-zinc-400 text-sm mb-6">Enter the password to enable Wife Mode</p>
              <input
                type="password"
                autoFocus
                value={wifeModal.input}
                onChange={(e) => setWifeModal({ ...wifeModal, input: e.target.value, error: '' })}
                onKeyDown={(e) => { if (e.key === 'Enter') submitWifePassword(); }}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-pink-400 text-zinc-900 mb-2"
              />
              {wifeModal.error && <p className="text-red-500 text-xs mb-2">{wifeModal.error}</p>}
              <button
                onClick={submitWifePassword}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                Unlock
              </button>
              <button
                onClick={() => setWifeModal(null)}
                className="w-full py-2 mt-2 text-zinc-400 text-sm hover:text-zinc-600"
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
