import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Warning } from '@phosphor-icons/react';

export function BlockScreen({ resetIn, theme }) {
  const mins = Math.ceil(resetIn / 60000);
  const secs = Math.ceil((resetIn % 60000) / 1000);
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-zinc-950/95' : 'bg-white/95';
  const textPrimary = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[200] ${bg} backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center`}
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500 blur-[80px] opacity-30 animate-pulse" />
          <Lock size={96} className="text-red-500 relative z-10" weight="duotone" />
          <Warning size={32} className="text-white absolute -top-2 -right-2 z-20 animate-bounce p-1 bg-red-500 rounded-full" weight="fill" />
        </div>
        <h2 className={`text-4xl sm:text-5xl font-black mb-4 tracking-tighter ${textPrimary}`}>YOU ARE BLOCKED</h2>
        <p className="text-red-500 uppercase tracking-[0.3em] text-xs font-bold mb-6">Rate Limit Exceeded</p>
        <div className={`text-xl sm:text-2xl font-mono font-bold mb-2 ${textPrimary}`}>
          {mins > 0 ? `${mins}m ${secs}s remaining` : 'Resetting...'}
        </div>
        <p className={`text-sm mt-4 max-w-sm ${textMuted}`}>
          You have sent too many messages. Please wait 30 minutes before sending more.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
