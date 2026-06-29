import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[] | { label: string; value: string }[];
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  placeholder?: string;
  className?: string;
}

export const FilterSelect = ({ label, value, options, onChange, theme, placeholder, className }: FilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayValue = () => {
    const selected = options.find(opt => 
      typeof opt === 'string' ? opt === value : opt.value === value
    );
    if (!selected) return placeholder || `Select ${label}`;
    return typeof selected === 'string' ? selected : selected.label;
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-between px-4 py-2.5 rounded-xl border min-w-[140px] cursor-pointer transition-all active:scale-95 group select-none",
          theme === 'dark' 
            ? "bg-white/[0.04] border-white/10 hover:border-neon-blue/30 hover:bg-white/[0.06]" 
            : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
        )}
      >
        <div className="flex flex-col">
           <span className="text-[8px] font-black uppercase tracking-wider opacity-40">{label}</span>
           <span className={cn(
            "text-xs font-black transition-colors truncate",
            theme === 'dark' ? "text-white/80 group-hover:text-neon-blue" : "text-slate-600 group-hover:text-slate-900"
          )}>
            {getDisplayValue()}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 transition-transform shrink-0 ml-2",
          isOpen && "rotate-180",
          theme === 'dark' ? "text-white/20 group-hover:text-neon-blue" : "text-slate-400 group-hover:text-slate-600"
        )} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute top-full left-0 right-0 mt-2 z-50 max-h-[250px] overflow-y-auto rounded-2xl border backdrop-blur-3xl shadow-2xl custom-scrollbar p-1",
                theme === 'dark' ? "bg-black/90 border-white/10" : "bg-white border-slate-200"
              )}
            >
              {options.map((opt) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                
                return (
                  <div 
                    key={optValue}
                    onClick={() => { onChange(optValue); setIsOpen(false); }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all mb-1",
                      value === optValue 
                        ? "bg-neon-blue text-black" 
                        : (theme === 'dark' ? "text-white/60 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                    )}
                  >
                    {optLabel}
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
