// src/components/ChatInput.jsx
import { useState, useRef } from 'react';
import { 
  PaperPlaneTilt, 
  Lock, 
  LockOpen, 
  DiscordLogo, 
  Plus, 
  BracketsCurly, 
  Wrench, 
  SlidersHorizontal,
  Paperclip,
  X 
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatInput({ 
  onSend, 
  disabled, 
  wifeMode, 
  onToggleWifeMode, 
  theme,
  options = {},
  onOptionsChange
}) {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null); // { base64, preview }
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        base64: reader.result.split(',')[1], // Strip data URL prefix
        preview: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if ((!value.trim() && !attachedImage) || disabled) return;
    // Pass message and image to parent handler
    onSend(value.trim(), attachedImage?.base64 || null);
    setValue('');
    setAttachedImage(null);
  };

  const isDark = theme === 'dark';
  const inputBg = isDark ? 'bg-zinc-900/60 border-white/10 focus-within:border-white/30' : 'bg-white border-zinc-200 focus-within:border-zinc-400';
  const inputText = isDark ? 'text-white placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400';
  const sendBtn = isDark ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black';
  const wifeText = wifeMode ? 'text-pink-400' : isDark ? 'text-zinc-500' : 'text-zinc-400';
  const toggleBg = wifeMode ? 'bg-pink-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-300';
  const discordText = isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900';
  const menuBg = isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900';
  const plusBtnClass = isDark 
    ? 'text-zinc-400 hover:text-white hover:bg-white/10' 
    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100';

  return (
    <div className="w-full px-4 pb-4 pt-2 relative z-10">
      <form onSubmit={submit} className="relative max-w-3xl mx-auto">
        
        {/* Features Menu Dropdown (+ Button Popover) */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute bottom-full left-0 mb-3 w-72 p-3 border rounded-2xl shadow-2xl z-30 ${menuBg}`}
              >
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                  Extra Capabilities
                </div>

                {/* 1. Structured JSON Mode Toggle */}
                <button
                  type="button"
                  onClick={() => onOptionsChange?.({ ...options, jsonMode: !options.jsonMode })}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors mb-1 ${
                    options.jsonMode 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BracketsCurly size={18} />
                    <span>JSON Output Mode</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-current">
                    {options.jsonMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 2. Tool / Function Calling Toggle */}
                <button
                  type="button"
                  onClick={() => onOptionsChange?.({ ...options, toolCalling: !options.toolCalling })}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors mb-1 ${
                    options.toolCalling 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench size={18} />
                    <span>Tool Calling Agent</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-current">
                    {options.toolCalling ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 3. Temperature Slider */}
                <div className="p-2.5 rounded-xl border border-white/5 mt-2">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <SlidersHorizontal size={16} /> Temperature
                    </span>
                    <span className="font-mono text-xs font-bold">{options.temperature ?? 0.6}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={options.temperature ?? 0.6}
                    onChange={(e) => onOptionsChange?.({ ...options, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500 cursor-pointer h-1 bg-zinc-700 rounded-lg"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className={`flex items-end gap-2 backdrop-blur-xl border rounded-3xl shadow-lg transition-colors pl-3 sm:pl-4 pr-2 py-2 ${inputBg}`}>
          
          {/* "+" Icon Button inside chat input on left side */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            // ADDED: mb-0.5 sm:mb-1 to nudge the icon upward
            className={`p-2 mb-0.5 sm:mb-1 rounded-full transition-transform active:scale-95 ${plusBtnClass} ${menuOpen ? 'rotate-45' : ''}`}
            title="Model Capabilities & Tools"
          >
            <Plus size={20} weight="bold" />
          </button>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); }
            }}
            placeholder="Message Seraphina..."
            rows={1}
            disabled={disabled}
            className={`flex-1 bg-transparent outline-none resize-none font-medium text-sm sm:text-base py-3 max-h-40 disabled:opacity-50 ${inputText}`}
            style={{ minHeight: '24px' }}
          />

          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${sendBtn}`}
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 px-2">
          {/* Wife Mode - bottom left */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleWifeMode}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${wifeText}`}
            >
              {wifeMode ? <LockOpen size={14} weight="fill" /> : <Lock size={14} />}
              <span>Wife Mode</span>
            </button>
            <button
              type="button"
              onClick={onToggleWifeMode}
              className={`relative w-9 h-5 rounded-full transition-colors ${toggleBg}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${wifeMode ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          {/* Active capability indicators */}
          <div className="flex items-center gap-1.5">
            {options.jsonMode && (
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                JSON Mode
              </span>
            )}
            {options.toolCalling && (
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                Tools Active
              </span>
            )}
          </div>

          {/* Discord link - bottom right */}
          <a
            href="https://discord.com/oauth2/authorize?client_id=1536094288142794792"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${discordText}`}
          >
            <DiscordLogo size={16} weight="fill" />
            <span className="hidden sm:inline">Use the Discord bot version</span>
            <span className="sm:hidden">Discord bot</span>
          </a>
        </div>
      </form>
    </div>
  );
}