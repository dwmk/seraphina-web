import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Chat, X, Pencil, Check } from '@phosphor-icons/react';
import { Logo } from './Logo';

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onRename, open, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startRename = (e, c) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditingTitle(c.title);
  };

  const saveRename = (e, id) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRename(id, editingTitle.trim());
    }
    setEditingId(null);
  };

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
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 border-r themed-sidebar-panel backdrop-blur-2xl ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`p-4 flex items-center gap-3 border-b border-inherit`}>
          <span className={`font-bold text-lg themed-sidebar-text`}>Conversations</span>
          <button
            onClick={onClose}
            className={`ml-auto p-1.5 rounded-lg themed-sidebar-hover themed-sidebar-secondary transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors themed-new-chat`}
          >
            <Plus size={18} weight="bold" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.length === 0 && (
            <p className={`text-center text-sm mt-8 px-4 themed-sidebar-muted`}>No conversations yet</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => editingId !== c.id && onSelect(c.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                c.id === activeId ? 'themed-sidebar-active' : 'themed-sidebar-hover themed-sidebar-secondary'
              }`}
            >
              <Chat size={18} className={`shrink-0 themed-sidebar-muted`} />
              
              {editingId === c.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(e, c.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className={`w-full px-2 py-0.5 text-xs rounded border outline-none themed-sidebar-input`}
                  />
                  <button onClick={(e) => saveRename(e, c.id)} className="p-1 hover:text-green-400">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium truncate themed-sidebar-text">{c.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startRename(e, c)}
                      className={`themed-sidebar-muted hover:text-blue-400 p-0.5`}
                      title="Rename conversation"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                      className={`themed-sidebar-muted hover:text-red-400 p-0.5`}
                      title="Delete conversation"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={`p-3 border-t border-inherit text-xs themed-sidebar-muted text-center`}>
          © Seraphina Management Team
        </div>
      </aside>
    </>
  );
}