// src/components/ThemeSidebar.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from '@phosphor-icons/react';
import { THEMES, getThemeById } from '../lib/themes';

export function ThemeSidebar({ activeTheme, onSelect, open, onClose }) {
  // Matching the exact styling logic from Sidebar.jsx
  const isDark = getThemeById(activeTheme).isDark;
  const panelBg = isDark ? 'bg-zinc-950/80 border-white/10' : 'bg-white/90 border-zinc-200';
  const textPrimary = isDark ? 'text-white' : 'text-zinc-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100';
  const borderCol = isDark ? 'border-white/10' : 'border-zinc-200';
  const cardBg = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const overlayBg = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)';

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
            style={{ background: overlayBg, backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 right-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 border-l ${panelBg} backdrop-blur-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className={`p-4 flex items-center gap-3 border-b ${borderCol}`}>
          <Palette size={20} className={textPrimary} />
          <span className={`font-bold text-lg ${textPrimary}`}>Themes</span>
          <button
            onClick={onClose}
            className={`ml-auto p-1.5 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {THEMES.map((theme) => {
            const isActive = theme.id === activeTheme;
            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                className={`w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden ${cardBg} ${
                  isActive ? 'scale-[1.02] shadow-md' : `${borderCol} hover:border-zinc-300 dark:hover:border-zinc-600 scale-100`
                }`}
                style={isActive ? { borderColor: 'var(--accent, #3b82f6)' } : {}}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold text-sm ${textPrimary}`}>
                      {theme.name}
                    </span>
                    {isActive && (
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm" 
                        style={{ background: 'var(--accent, #3b82f6)' }}
                      >
                        <Check size={12} weight="bold" color="#fff" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 h-8 rounded-lg overflow-hidden border border-black/5 dark:border-white/5">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={`p-3 border-t ${borderCol} text-xs ${textMuted} text-center`}>
          Pick a theme to instantly restyle Seraphina
        </div>
      </aside>
    </>
  );
}