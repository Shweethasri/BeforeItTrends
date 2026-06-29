import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border shadow-2xl pointer-events-auto",
                theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
              )}
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between px-6 py-4 border-b",
                theme === 'dark' ? "border-white/5" : "border-slate-100"
              )}>
                <h3 className={cn(
                  "text-lg font-bold font-display uppercase tracking-wider",
                  theme === 'dark' ? "text-white" : "text-slate-900"
                )}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' ? "hover:bg-white/5 text-white/40" : "hover:bg-slate-100 text-slate-400"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className={cn(
                "p-6 overflow-y-auto max-h-[calc(80vh-80px)]",
                theme === 'dark' ? "text-white/60" : "text-slate-600"
              )}>
                <div className="prose prose-sm max-w-none">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
