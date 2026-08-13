import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Lock, CaretDown, Sun, Moon } from '@phosphor-icons/react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { BlockScreen } from './components/BlockScreen';
import { DeleteModal } from './components/DeleteModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { fetchAIReply, verifyWifePassword, generateTitle } from './lib/api';
import { TOOL_DEFINITIONS, executeTool, getBrowserInfo } from './lib/tools';
import {
  loadConversations, createConversation, deleteConversation, updateConversation,
  getRateInfo, recordMessage, isWifeEnabled, setWifeEnabled, getTheme, setTheme,
} from './lib/storage';
import { ToolProgressDisplay } from './components/ToolProgress';

const VERSIONS = ['v1.6', 'v1.4'];
const GENERIC_ERROR = "Action could not be completed. Seraphina couldn't receive your message or she couldn't react to it.";

function TalkingAvatar({ logoBox, size = 56 }) {
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    let timeoutId;
    const startTime = Date.now();
    const DURATION = 3000; // 3 seconds total

    const cycle = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= DURATION) {
        setVariant(1); // Ensure it strictly ends on variant 1
        return;
      }

      // Toggle between variant 1 and 2
      setVariant((prev) => (prev === 1 ? 2 : 1));

      // Rhythmic & slightly unpredictable delay interval (130ms to 260ms)
      const nextDelay = Math.floor(Math.random() * (260 - 130 + 1)) + 130;
      timeoutId = setTimeout(cycle, nextDelay);
    };

    // Kick off initial switch from 1 -> 2
    const initialDelay = Math.floor(Math.random() * (260 - 130 + 1)) + 130;
    timeoutId = setTimeout(cycle, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${logoBox} border flex items-center justify-center shrink-0 mt-1 overflow-hidden`}>
      <Logo size={size} variant={variant} overflow />
    </div>
  );
}

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rateInfo, setRateInfo] = useState({ blocked: false, resetIn: 0, remaining: 30, max: 30 });
  const [wifeMode, setWifeMode] = useState(false);
  const [wifeModal, setWifeModal] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState('v1.6');
  const [versionDropdown, setVersionDropdown] = useState(false);
  const [theme, setThemeState] = useState('light');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modelOptions, setModelOptions] = useState({
    jsonMode: false,
    toolCalling: false,
    temperature: 0.6,
  });
  const [toolProgress, setToolProgress] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    setWifeMode(isWifeEnabled());
    setRateInfo(getRateInfo());
    setThemeState(getTheme());

    // URL Parameter handling for unique chat ID
    const params = new URLSearchParams(window.location.search);
    const urlChatId = params.get('chat');
    if (urlChatId && convs.some((c) => c.id === urlChatId)) {
      setActiveId(urlChatId);
    } else if (urlChatId) {
      // Chat not found, clear invalid URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Add this new useEffect right beneath it to update the URL dynamically:
  useEffect(() => {
    const url = new URL(window.location);
    if (activeId) {
      url.searchParams.set('chat', activeId);
    } else {
      url.searchParams.delete('chat');
    }
    window.history.replaceState({}, '', url);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    const conv = conversations.find((c) => c.id === activeId);
    setMessages(conv ? conv.messages : []);
  }, [activeId, conversations]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const t = setInterval(() => {
      const info = getRateInfo();
      setRateInfo(info);
      if (!info.blocked) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setTheme(next);
  };

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

  const handleRename = (id, newTitle) => {
    // Add customTitle: true to prevent auto-generation overrides
    updateConversation(id, (c) => ({ ...c, title: newTitle, customTitle: true }));
    setConversations(loadConversations());
  };

  const handleDeleteRequest = (id) => {
    const conv = conversations.find((c) => c.id === id);
    setDeleteTarget(conv || { id, title: 'New chat' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const remaining = deleteConversation(deleteTarget.id);
    setConversations(remaining);
    if (activeId === deleteTarget.id) {
      setActiveId(remaining[0]?.id || null);
      setMessages(remaining[0]?.messages || []);
    }
    setDeleteTarget(null);
  };

  const persistMessages = (convId, msgs) => {
    updateConversation(convId, (c) => ({ ...c, messages: msgs }));
    setConversations(loadConversations());
  };

  const maybeGenerateTitle = async (convId, msgs) => {
    if (!msgs || msgs.length === 0 || msgs.length % 5 !== 0) return;
    
    // Ignore generation if the user has manually renamed the title
    const activeConv = conversations.find((c) => c.id === convId);
    if (activeConv?.customTitle) return;

    try {
      const title = await generateTitle(msgs, version);
      // ADDED: Only update if we got a real title back that isn't the default
      if (title && title !== 'New chat') {
        updateConversation(convId, (c) => ({ ...c, title }));
        setConversations(loadConversations());
      }
    } catch {
      // Suppress console error output
    }
  };

  const handleSend = async (text) => {
    let convId = activeId;
    let currentConvs = conversations;
    
    if (!convId) {
      const conv = createConversation('New chat');
      convId = conv.id;
      currentConvs = loadConversations();
      setConversations(currentConvs);
      setActiveId(convId);
    }

    // Number conversations as "Chat #X" on the first message sent
    const activeConv = currentConvs.find(c => c.id === convId);
    if (activeConv && activeConv.title === 'New chat' && messages.length === 0) {
      const newTitle = `Chat #${currentConvs.length}`;
      updateConversation(convId, (c) => ({ ...c, title: newTitle }));
      currentConvs = loadConversations();
      setConversations(currentConvs);
    }

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    persistMessages(convId, newMsgs);

    setLoading(true);
    setError('');
    setToolProgress({ phase: 'thinking' });

    const tools = modelOptions.toolCalling ? TOOL_DEFINITIONS : null;
    const browserInfo = getBrowserInfo();
    const MAX_TOOL_ROUNDS = 5;
    let conversationHistory = [...newMsgs];
    let gotFinalReply = false;

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const data = await fetchAIReply(conversationHistory, wifeMode, version, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: round === 0 ? tools : null,
        });

        if (!data.toolCalls || !Array.isArray(data.toolCalls) || data.toolCalls.length === 0) {
          const replyText = data.reply || '';
          const aiMsg = { role: 'assistant', content: replyText };
          const finalMsgs = [...newMsgs, aiMsg];
          setMessages(finalMsgs);
          persistMessages(convId, finalMsgs);
          const info = recordMessage();
          setRateInfo(info);
          maybeGenerateTitle(convId, finalMsgs);
          gotFinalReply = true;
          break;
        }

        if (data.reply) {
          conversationHistory.push({ role: 'assistant', content: data.reply });
        }

        const toolProgressList = data.toolCalls.map((tc) => ({
          name: tc.function?.name || 'unknown',
          status: 'pending',
        }));
        setToolProgress({ phase: 'calling_tools', tools: toolProgressList });

        const toolResultParts = [];

        for (let i = 0; i < data.toolCalls.length; i++) {
          const tc = data.toolCalls[i];
          const toolName = tc.function?.name || 'unknown';
          let parsedArgs = {};
          try { parsedArgs = JSON.parse(tc.function?.arguments || '{}'); } catch {}

          toolProgressList[i].status = 'executing';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          const result = await executeTool(toolName, parsedArgs, browserInfo);

          toolProgressList[i].status = 'done';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          toolResultParts.push(`[Tool: ${toolName}]\nArguments: ${JSON.stringify(parsedArgs)}\nResult: ${result}`);
        }

        setToolProgress({ phase: 'processing_results' });

        conversationHistory.push({
          role: 'user',
          content: `Here are the real-time tool results. Use this data to answer the user's question. Do NOT call any more tools — just respond naturally using this data.\n\n${toolResultParts.join('\n\n')}`,
        });
      }

      if (!gotFinalReply) {
        setToolProgress({ phase: 'thinking_after_tools' });
        const finalData = await fetchAIReply(conversationHistory, wifeMode, version, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: null,
        });
        const replyText = finalData.reply || 'I was unable to process the tool results.';
        const aiMsg = { role: 'assistant', content: replyText };
        const finalMsgs = [...newMsgs, aiMsg];
        setMessages(finalMsgs);
        persistMessages(convId, finalMsgs);
        const info = recordMessage();
        setRateInfo(info);
        maybeGenerateTitle(convId, finalMsgs);
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
      setToolProgress(null);
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

  const isDark = theme === 'dark';
  const bgBase = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const textBase = isDark ? 'text-white' : 'text-zinc-900';
  const headerBg = isDark ? 'bg-zinc-950/50 border-white/5' : 'bg-white/70 border-zinc-200';
  const userBubble = isDark ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white';
  const aiBubble = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200';
  const aiBubbleText = isDark ? 'text-zinc-100' : 'text-zinc-800';
  const logoBox = isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200';
  const versionBtn = isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600';
  const dropdownBg = isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200';
  const versionActive = isDark ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-900';
  const versionInactive = isDark ? 'text-zinc-400 hover:bg-white/5' : 'text-zinc-500 hover:bg-zinc-100';
  const errorBg = isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600';
  const welcomeText = isDark ? 'text-white' : 'text-zinc-900';
  const welcomeSub = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const counterText = rateInfo.remaining <= 5 ? 'text-amber-400' : isDark ? 'text-zinc-400' : 'text-zinc-500';
  const counterLabel = isDark ? 'text-zinc-600' : 'text-zinc-400';
  const themeBtn = isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600';
  const burgerBtn = isDark ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900';

  return (
    <div className={`h-screen w-screen overflow-hidden ${bgBase} ${textBase} relative`}>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-pink-500/10 rounded-full blur-[120px] animate-aurora-1" />
        <div className="absolute top-1/3 -right-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-aurora-2" />
        <div className="absolute -bottom-1/4 left-1/3 w-[450px] h-[450px] sm:w-[550px] sm:h-[550px] bg-emerald-500/8 rounded-full blur-[120px] animate-aurora-3" />
      </div>

      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDeleteRequest}
        onRename={handleRename}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
      />

      <div className="absolute inset-0 flex flex-col z-10">
        <header className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b ${headerBg} backdrop-blur-xl`}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={`p-2 rounded-lg transition-colors ${burgerBtn}`}
          >
            <List size={22} />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg">Seraphina</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setVersionDropdown((v) => !v)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${versionBtn}`}
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
                    className={`absolute top-full left-0 mt-2 w-28 sm:w-32 ${dropdownBg} border rounded-xl shadow-2xl overflow-hidden z-20`}
                  >
                    {VERSIONS.map((v) => (
                      <button
                        key={v}
                        onClick={() => { setVersion(v); setVersionDropdown(false); }}
                        className={`w-full text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                          v === version ? versionActive : versionInactive
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
            <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-pink-500/20">
              Wife Mode
            </span>
          )}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <span className={`font-mono ${counterText}`}>
                {rateInfo.remaining}/{rateInfo.max || 30}
              </span>
              <span className={`${counterLabel} text-xs hidden sm:inline`}>left</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${themeBtn}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {messages.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center pt-12 sm:pt-20"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-4 sm:mb-6"
                >
                  <Logo size={56} variant={1} />
                </motion.div>
                <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${welcomeText}`}>How can I help you today?</h2>
                <p className={`text-sm ${welcomeSub}`}>Start a conversation with Seraphina</p>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <TalkingAvatar logoBox={logoBox} size={56} />
                  )}
                  <div
                    className={`group/msg max-w-[85%] sm:max-w-[80%] px-4 sm:px-5 py-3 rounded-2xl text-sm sm:text-base leading-relaxed transition-all duration-200 cursor-default ${
                      msg.role === 'user'
                        ? `${userBubble} rounded-tr-sm hover:shadow-lg hover:-translate-y-0.5`
                        : `${aiBubble} ${aiBubbleText} rounded-tl-sm backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-50'} ${isDark ? 'hover:border-white/20' : 'hover:border-zinc-300'}`
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="break-words space-y-2 text-sm sm:text-base"
                      components={{
                        // Discord-style paragraph line height
                        p: ({ node, ...props }) => <p className="whitespace-pre-wrap leading-relaxed inline-block w-full" {...props} />,
                        
                        // Discord code blocks and inline code
                        code: ({ node, inline, className, children, ...props }) => {
                          return !inline ? (
                            <div className="bg-[#2b2d31] text-[#dbdee1] p-3 rounded-md overflow-x-auto my-2 text-xs sm:text-sm font-mono border border-zinc-700/50 shadow-sm">
                              <code className={className} {...props}>{children}</code>
                            </div>
                          ) : (
                            <code className="bg-[#2b2d31] text-[#dbdee1] rounded px-1.5 py-0.5 text-[0.875em] font-mono border border-zinc-700/30" {...props}>{children}</code>
                          );
                        },
                        
                        // Discord blockquotes
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-zinc-500/80 pl-3 my-1 italic text-zinc-400" {...props} />
                        ),

                        // Discord lists
                        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" target="_blank" rel="noreferrer" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 sm:gap-3 justify-start"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${logoBox} border flex items-center justify-center shrink-0 mt-1 overflow-hidden`}>
                  <Logo size={56} variant={2} overflow />
                </div>
                <div className={`px-4 sm:px-5 py-4 rounded-2xl ${aiBubble} border min-h-[56px] flex items-center`}>
                  <ToolProgressDisplay progress={toolProgress || { phase: 'thinking' }} isDark={isDark} />
                </div>
              </motion.div>
            )}

            {error && (
              <div className={`max-w-3xl mx-auto text-sm border rounded-xl px-4 py-3 ${errorBg}`}>
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
          theme={theme}
          options={modelOptions}
          onOptionsChange={setModelOptions}
        />
      </div>

      {rateInfo.blocked && <BlockScreen resetIn={rateInfo.resetIn} theme={theme} />}

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
              className={`${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} border rounded-3xl max-w-sm w-full p-8 shadow-2xl`}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Lock size={28} className="text-pink-400" weight="duotone" />
                </div>
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Wife Mode</h3>
              <p className={`text-center text-sm mb-6 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Enter the password to enable Wife Mode</p>
              <input
                type="password"
                autoFocus
                value={wifeModal.input}
                onChange={(e) => setWifeModal({ ...wifeModal, input: e.target.value, error: '' })}
                onKeyDown={(e) => { if (e.key === 'Enter' && !wifeModal.loading) submitWifePassword(); }}
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:border-pink-500/50 mb-2 ${
                  isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                }`}
              />
              {wifeModal.error && <p className="text-red-400 text-xs mb-2">{wifeModal.error}</p>}
              <button
                onClick={submitWifePassword}
                disabled={wifeModal.loading}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {wifeModal.loading ? 'Verifying...' : 'Unlock'}
              </button>
              <button
                onClick={() => setWifeModal(null)}
                className={`w-full py-2 mt-2 text-sm ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'} transition-colors`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {deleteTarget && (
        <DeleteModal
          conversation={deleteTarget}
          theme={theme}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}