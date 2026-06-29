import React from 'react';
import { LayoutGrid, Sparkles, MessageSquare, Video, User, BookOpen, Moon, Sun, Target, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  theme: 'light' | 'dark';
}

const NavItem = ({ icon, label, active, onClick, theme }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm font-medium",
      active 
        ? (theme === 'dark' ? "bg-white/10 text-white" : "bg-black/10 text-slate-900")
        : (theme === 'dark' ? "text-white/60 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-black/5")
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Navbar = ({ currentPage, onPageChange }: { currentPage: string, onPageChange: (page: string) => void }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className={cn(
        "backdrop-blur-xl border rounded-full px-6 py-2 flex items-center justify-between transition-all duration-300",
        theme === 'dark' 
          ? "bg-black/40 border-white/10" 
          : "bg-white/70 border-slate-200 shadow-lg shadow-slate-200/50"
      )}>
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onPageChange('home')}
        >
          <span className="text-xl font-bold font-display italic tracking-tighter">
            <span className="text-neon-blue">Before</span>
            <span className={cn(theme === 'dark' ? "text-white" : "text-slate-900")}>It</span>
            <span className="text-light-blue">Trends</span>
          </span>
        </div>

        <div className={cn(
          "hidden md:flex items-center gap-1 rounded-full p-1 border",
          theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
        )}>
          <NavItem 
            theme={theme}
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Home" 
            active={currentPage === 'home'} 
            onClick={() => onPageChange('home')}
          />
          <NavItem 
            theme={theme}
            icon={<Sparkles className="w-4 h-4" />} 
            label="Top Trending" 
            active={currentPage === 'trending'}
            onClick={() => onPageChange('trending')}
          />
          <NavItem 
            theme={theme} 
            icon={<MessageSquare className="w-4 h-4" />} 
            label="Captions" 
            active={currentPage === 'captions'}
            onClick={() => onPageChange('captions')}
          />
          <NavItem 
            theme={theme} 
            icon={<Video className="w-4 h-4" />} 
            label="POV" 
            active={currentPage === 'pov'}
            onClick={() => onPageChange('pov')}
          />
          <NavItem 
            theme={theme} 
            icon={<User className="w-4 h-4" />} 
            label="Bio" 
            active={currentPage === 'bio'}
            onClick={() => onPageChange('bio')}
          />
          <NavItem 
            theme={theme}
            icon={<Target className="w-4 h-4" />} 
            label="Optimize" 
            active={currentPage === 'post-optimizer'}
            onClick={() => onPageChange('post-optimizer')}
          />
          <NavItem 
            theme={theme}
            icon={<Shield className="w-4 h-4" />} 
            label="Anomaly Scan" 
            active={currentPage === 'anomaly'}
            onClick={() => onPageChange('anomaly')}
          />
          <NavItem 
            theme={theme} 
            icon={<BookOpen className="w-4 h-4" />} 
            label="Viral Vault" 
            active={currentPage === 'library'}
            onClick={() => onPageChange('library')}
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              theme === 'dark' ? "hover:bg-neon-blue/10 text-white/60 hover:text-neon-blue" : "hover:bg-black/5 text-slate-500 hover:text-neon-blue"
            )}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
