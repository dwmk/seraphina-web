import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Chat, X } from '@phosphor-icons/react';
import { Logo } from './Logo';

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, open, onClose, theme }) {
  const panelBg = theme === 'dark' ? 'bg-zinc-950/80 border-white/10' : 'bg-white/90 border-zinc-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-zinc-900';
  const textSecondary = theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600';
  const textMuted = theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-100';
  const activeBg = theme === 'dark' ? 'bg-white/10' : 'bg-zinc-200/70';
  const borderCol = theme === 'dark' ? 'border-white/10' : 'border-zinc-200';
  const newChatBg = theme === 'dark' ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black';
  const overlayBg = theme === 'dark' ? 'bg-black/50' : 'bg-black/30';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 border-r ${panelBg} backdrop-blur-2xl ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`p-4 flex items-center gap-3 border-b ${borderCol}`}>
          <Logo size={32} variant={1} />
          <span className={`font-bold text-lg ${textPrimary}`}>Seraphina</span>
          <button
            onClick={onClose}
            className={`ml-auto p-1.5 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${newChatBg}`}
          >
            <Plus size={18} weight="bold" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.length === 0 && (
            <p className={`text-center text-sm mt-8 px-4 ${textMuted}`}>No conversations yet</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                c.id === activeId ? `${activeBg} ${textPrimary}` : `${hoverBg} ${textSecondary}`
              }`}
            >
              <Chat size={18} className={`shrink-0 ${textMuted}`} />
              <span className="flex-1 text-sm font-medium truncate">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className={`opacity-0 group-hover:opacity-100 ${textMuted} hover:text-red-400 transition-opacity`}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className={`p-3 border-t ${borderCol} text-xs ${textMuted} text-center`}>
          Seraphina v3.0
        </div>
      </aside>
    </>
  );
}
