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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } bg-zinc-950/80 backdrop-blur-2xl border-r border-white/10`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <Logo size={32} variant={1} />
          <span className="font-bold text-lg text-white">Seraphina</span>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-200 transition-colors"
          >
            <Plus size={18} weight="bold" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.length === 0 && (
            <p className="text-center text-zinc-500 text-sm mt-8 px-4">No conversations yet</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                c.id === activeId
                  ? 'bg-white/10 text-white'
                  : 'hover:bg-white/5 text-zinc-400'
              }`}
            >
              <Chat size={18} className="shrink-0 text-zinc-500" />
              <span className="flex-1 text-sm font-medium truncate">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/10 text-xs text-zinc-600 text-center">
          Seraphina v3.0
        </div>
      </aside>
    </>
  );
}
