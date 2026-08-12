import { useState } from 'react';
import { PaperPlaneTilt, Lock, LockOpen } from '@phosphor-icons/react';

export function ChatInput({ onSend, disabled, wifeMode, onToggleWifeMode }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="w-full px-4 pb-4 pt-2 relative z-10">
      <form onSubmit={submit} className="relative max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl focus-within:border-white/30 transition-colors pl-5 pr-2 py-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); }
            }}
            placeholder="Message Seraphina..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none resize-none text-white placeholder-zinc-500 font-medium text-base py-3 max-h-40 disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="w-11 h-11 shrink-0 rounded-full bg-white text-zinc-900 flex items-center justify-center hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3 px-2">
          <button
            type="button"
            onClick={onToggleWifeMode}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${wifeMode ? 'text-pink-400' : 'text-zinc-500'}`}
          >
            {wifeMode ? <LockOpen size={14} weight="fill" /> : <Lock size={14} />}
            <span>Wife Mode</span>
          </button>
          <button
            type="button"
            onClick={onToggleWifeMode}
            className={`relative w-9 h-5 rounded-full transition-colors ${wifeMode ? 'bg-pink-500' : 'bg-zinc-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${wifeMode ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      </form>
    </div>
  );
}
