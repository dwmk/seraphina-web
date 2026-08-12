import { useState } from 'react';
import { PaperPlaneTilt, Lock, LockOpen, DiscordLogo } from '@phosphor-icons/react';

export function ChatInput({ onSend, disabled, wifeMode, onToggleWifeMode, theme }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const isDark = theme === 'dark';
  const inputBg = isDark ? 'bg-zinc-900/60 border-white/10 focus-within:border-white/30' : 'bg-white border-zinc-200 focus-within:border-zinc-400';
  const inputText = isDark ? 'text-white placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400';
  const sendBtn = isDark ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black';
  const wifeText = wifeMode ? 'text-pink-400' : isDark ? 'text-zinc-500' : 'text-zinc-400';
  const toggleBg = wifeMode ? 'bg-pink-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-300';
  const discordText = isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900';

  return (
    <div className="w-full px-4 pb-4 pt-2 relative z-10">
      <form onSubmit={submit} className="relative max-w-3xl mx-auto">
        <div className={`flex items-end gap-2 backdrop-blur-xl border rounded-3xl shadow-lg transition-colors pl-4 sm:pl-5 pr-2 py-2 ${inputBg}`}>
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
