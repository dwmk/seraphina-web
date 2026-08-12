import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Chat } from '@phosphor-icons/react';
import { Logo } from './Logo';

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, open, onClose }) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed md:static top-0 left-0 h-full w-72 bg-zinc-50 border-r border-zinc-200 z-40 flex flex-col"
      >
        <div className="p-4 flex items-center gap-2 border-b border-zinc-200">
          <Logo size={32} variant={1} />
          <span className="font-bold text-lg text-zinc-900">Seraphina</span>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-black transition-colors"
          >
            <Plus size={18} weight="bold" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.length === 0 && (
            <p className="text-center text-zinc-400 text-sm mt-8 px-4">No conversations yet</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                c.id === activeId ? 'bg-zinc-200/70 text-zinc-900' : 'hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              <Chat size={18} className="shrink-0 text-zinc-400" />
              <span className="flex-1 text-sm font-medium truncate">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-200 text-xs text-zinc-400 text-center">
          Seraphina v3.0
        </div>
      </motion.aside>
    </>
  );
}
