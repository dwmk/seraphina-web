import { motion, AnimatePresence } from 'framer-motion';
import { PaintPalette, X, Check } from '@phosphor-icons/react';
import { THEMES } from '../lib/themes';

export function ThemeSidebar({ activeTheme, onSelect, open, onClose }) {
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
            style={{ background: 'var(--overlay-bg-dark)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      <aside
        className="fixed top-0 right-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 border-l backdrop-blur-2xl"
        style={{
          background: 'var(--theme-sidebar-bg)',
          borderColor: 'var(--theme-sidebar-border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'var(--theme-sidebar-border)' }}>
          <PaintPalette size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-lg" style={{ color: 'var(--theme-sidebar-text, var(--sidebar-text))' }}>Themes</span>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--sidebar-text-secondary)' }}
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
                className="w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden"
                style={{
                  borderColor: isActive ? 'var(--theme-card-active-border)' : 'var(--theme-card-border)',
                  background: 'var(--theme-card-bg)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--theme-card-text)' }}>
                      {theme.name}
                    </span>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                        <Check size={12} weight="bold" color="#fff" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 h-8 rounded-lg overflow-hidden">
                    {theme.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-md"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t text-xs text-center" style={{ borderColor: 'var(--theme-sidebar-border)', color: 'var(--sidebar-text-muted)' }}>
          Pick a theme to instantly restyle Seraphina
        </div>
      </aside>
    </>
  );
}
