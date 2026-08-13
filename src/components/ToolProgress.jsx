import { motion } from 'framer-motion';
import { SpinnerGap, Check, Wrench, Brain, ArrowsClockwise } from '@phosphor-icons/react';

const TOOL_LABELS = {
  get_current_weather: 'Weather Lookup',
  get_current_time: 'Time Check',
  get_ip_info: 'Network Info',
  get_browser_info: 'Browser Info',
  get_crypto_price: 'Crypto Price',
};

export function ToolProgressDisplay({ progress, isDark }) {
  const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const textPrimary = isDark ? 'text-zinc-100' : 'text-zinc-800';
  const accentText = isDark ? 'text-blue-400' : 'text-blue-500';
  const doneText = isDark ? 'text-emerald-400' : 'text-emerald-600';
  const headerText = isDark ? 'text-zinc-300' : 'text-zinc-600';

  if (progress.phase === 'thinking') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <SpinnerGap size={16} className={`animate-spin ${textMuted}`} />
        <span className={textMuted}>Thinking…</span>
      </div>
    );
  }

  if (progress.phase === 'thinking_after_tools') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Brain size={16} className={accentText} />
        <span className={textMuted}>Formulating response…</span>
      </div>
    );
  }

  if (progress.phase === 'processing_results') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <ArrowsClockwise size={16} className={`animate-spin ${accentText}`} />
        <span className={textMuted}>Processing results…</span>
      </div>
    );
  }

  if (progress.phase === 'calling_tools' && progress.tools) {
    return (
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-0.5 ${headerText}`}>
          <Wrench size={12} />
          <span>Using Tools</span>
        </div>
        {progress.tools.map((tool, i) => {
          const label = TOOL_LABELS[tool.name] || tool.name;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-sm"
            >
              {tool.status === 'done' ? (
                <Check size={14} className={doneText} weight="bold" />
              ) : tool.status === 'executing' ? (
                <SpinnerGap size={14} className={`animate-spin ${accentText}`} />
              ) : (
                <span className={`w-3.5 h-3.5 rounded-full border border-current opacity-30 ${textMuted}`} />
              )}
              <span className={tool.status === 'done' ? doneText : tool.status === 'executing' ? accentText : textMuted}>
                {label}
              </span>
              {tool.status === 'executing' && (
                <span className={`text-xs ${textMuted} italic`}>running…</span>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
