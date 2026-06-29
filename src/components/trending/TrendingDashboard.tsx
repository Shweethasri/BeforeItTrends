import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Globe, Zap, Search, 
  MapPin, Clock, Filter, ArrowRight,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ChevronDown, X, MessageSquare,
  Sparkles, Activity, Users, Share2, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, Cell, ResponsiveContainer 
} from 'recharts';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { FilterSelect } from '../ui/FilterSelect';
import { WorldMap } from './WorldMap';
import { TrendIntelligenceService, TrendItem, NICHES, COUNTRIES } from '../../services/TrendIntelligenceService';

export const TrendingDashboard = ({ onAction }: { onAction?: (context: string) => void }) => {
  const { theme } = useTheme();
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);

  useEffect(() => {
    // Initial fetch
    setTrends(TrendIntelligenceService.getInitialTrends());

    // Live updates
    const interval = setInterval(() => {
      setTrends(TrendIntelligenceService.getLiveUpdates());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredTrends = trends.filter(t => 
    (selectedCategory === '' || t.niche === selectedCategory) &&
    (selectedCountry === '' || t.country === selectedCountry)
  );

  const displayTrends = filteredTrends.slice(0, 50);

  return (
    <div className={cn("pt-32 pb-20 px-6 min-h-screen transition-colors duration-300", theme === 'dark' ? "bg-black" : "bg-white")}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[10px] font-black uppercase tracking-widest"
            >
              <Activity className="w-3 h-3" />
              Live Pulse Engine
            </motion.div>
            <h1 className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Global Market <br /> <span className="text-gradient">Pulse Metrics</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <FilterSelect 
              label="Niche"
              value={selectedCategory}
              options={NICHES}
              onChange={setSelectedCategory}
              theme={theme}
              placeholder="All Niches"
            />
            <FilterSelect 
              label="Country"
              value={selectedCountry}
              options={COUNTRIES}
              onChange={setSelectedCountry}
              theme={theme}
              placeholder="All Countries"
            />
          </div>
        </div>

        {/* Map Section */}
        <div className={cn(
          "relative rounded-[40px] border overflow-hidden p-8 min-h-[500px]",
          theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
        )}>
          <div className="absolute top-8 left-8 z-10 flex flex-col gap-1">
            <h3 className={cn("text-xl font-black uppercase tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>Engagement Density</h3>
            <div className="flex items-center gap-3">
              <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40", theme === 'dark' ? "text-white" : "text-slate-500")}>Real-time signal intensity</p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                <span className="text-[9px] font-black text-neon-blue uppercase tracking-tighter">Live Ingestion</span>
              </div>
            </div>
          </div>
          <div className="w-full h-[500px]">
             <WorldMap 
               theme={theme} 
               trends={trends} 
               onCountryClick={setSelectedCountry} 
             />
          </div>
        </div>

        {/* Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayTrends.map((trend) => (
              <TrendCard 
                key={trend.id} 
                trend={trend} 
                theme={theme} 
                onClick={() => setSelectedTrend(trend)} 
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedTrend && (
            <TrendDetailDialog 
              trend={selectedTrend} 
              onClose={() => setSelectedTrend(null)} 
              theme={theme} 
              onAction={onAction}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface TrendCardProps {
  key?: React.Key;
  trend: TrendItem;
  theme: 'light' | 'dark';
  onClick: () => void;
}

const TrendCard = ({ trend, theme, onClick }: TrendCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    onClick={onClick}
    className={cn(
      "p-8 rounded-[40px] border cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden h-full flex flex-col",
      theme === 'dark' ? "bg-white/[0.02] border-white/10 hover:border-neon-blue/30" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-neon-blue/30"
    )}
  >
    <div className="flex items-center justify-between mb-6">
       <div className="flex items-center gap-2">
         <span className="px-3 py-1 rounded-lg bg-neon-blue/10 text-neon-blue text-[10px] font-black uppercase tracking-widest">
           {trend.niche}
         </span>
         {trend.status === 'Breaking' && (
           <span className="px-2 py-1 rounded-md bg-red-500 text-white text-[8px] font-black uppercase tracking-widest animate-pulse">
             Breaking
           </span>
         )}
       </div>
       <div className="flex items-center gap-1 text-green-500 text-[10px] font-black">
         <TrendingUpIcon className="w-3 h-3" />
         +{trend.growth}%
       </div>
    </div>
    
    <h3 className={cn("text-2xl font-black font-display uppercase tracking-tight leading-tight mb-4 group-hover:text-neon-blue transition-colors", theme === 'dark' ? "text-white" : "text-slate-900")}>
      {trend.title}
    </h3>
    <p className={cn("text-sm font-medium opacity-40 line-clamp-3 mb-8 flex-grow", theme === 'dark' ? "text-white" : "text-slate-600")}>
      {trend.description}
    </p>

    <div className="flex items-center justify-between pt-6 border-t border-white/5">
       <div className="flex items-center gap-2">
         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <Zap className="w-4 h-4 text-neon-blue" />
         </div>
         <span className="text-xs font-black">{trend.score} Pts</span>
       </div>
       <div className="flex items-center gap-1">
         <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{trend.country}</span>
       </div>
    </div>
  </motion.div>
);

const TrendDetailDialog = ({ trend, onClose, theme, onAction }: { trend: TrendItem, onClose: () => void, theme: 'light' | 'dark', onAction?: (context: string) => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/90 backdrop-blur-3xl" 
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={cn(
        "relative max-w-2xl w-full rounded-[40px] border p-12 overflow-hidden",
        theme === 'dark' ? "bg-black border-white/10" : "bg-white border-slate-200 shadow-2xl"
      )}
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="space-y-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-neon-blue/20 text-neon-blue text-xs font-black uppercase tracking-widest">{trend.niche}</span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-white/40 text-xs font-black uppercase tracking-widest">{trend.platform}</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tighter leading-[0.9]">{trend.title}</h2>
        </div>

        <p className={cn("text-xl font-medium leading-relaxed opacity-60", theme === 'light' && "text-slate-600")}>
          {trend.description}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Signal Score</p>
              <p className="text-2xl font-black">{trend.score}</p>
           </div>
           <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Growth</p>
              <p className="text-2xl font-black text-green-500">+{trend.growth}%</p>
           </div>
           <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Velocity</p>
              <p className="text-2xl font-black text-neon-blue">{trend.velocity}%</p>
           </div>
           <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Virality</p>
              <p className="text-2xl font-black uppercase text-brand-purple">{trend.viralOpportunityScore}%</p>
           </div>
        </div>

        <div className="space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Relevant Clusters</p>
           <div className="flex flex-wrap gap-2">
              {trend.hashtags.map(tag => (
                 <span key={tag} className="px-3 py-1 rounded-lg bg-black text-neon-blue text-[10px] font-black uppercase border border-neon-blue/20">#{tag}</span>
              ))}
           </div>
           <div className="p-6 rounded-3xl bg-neon-blue/5 border border-neon-blue/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue mb-2">Suggested Angle</p>
              <p className="text-sm font-bold opacity-80">{trend.suggestedAngle}</p>
           </div>
           <button 
            onClick={() => onAction?.(`${trend.title}: ${trend.description}. Recommended Angle: ${trend.suggestedAngle}`)}
            className="w-full py-4 rounded-2xl bg-neon-blue text-black font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-neon-blue/20"
           >
              Turn into Content
           </button>
        </div>
      </div>
    </motion.div>
  </div>
);
