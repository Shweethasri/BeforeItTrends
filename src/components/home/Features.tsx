import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, Instagram, Youtube, Twitter, Facebook, Play, Flame } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

const platforms = [
  { name: 'TikTok', icon: <Play className="w-5 h-5 fill-current" /> },
  { name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
  { name: 'YouTube', icon: <Youtube className="w-5 h-5" /> },
  { name: 'Twitter / X', icon: <Twitter className="w-5 h-5" /> },
  { name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
];

export const Features = ({ onPageChange }: { onPageChange: (page: string) => void }) => {
  const { theme } = useTheme();

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className={cn("text-4xl md:text-6xl font-black font-display mb-6 tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
            Your All-in-One Virality Prediction Suite
          </h2>
          <p className={cn("text-lg md:text-xl max-w-2xl mx-auto font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
            Built to help you create smarter posts, reach larger audiences, and grow faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard 
            theme={theme}
            icon={<Sparkles className="w-8 h-8 text-brand-pink" />}
            title="Strategic Optimizer"
            description="Neural post optimization: CNN visual scanning, sentiment analysis, and AI-powered growth recommendations."
            onClick={() => onPageChange('post-optimizer')}
          />
          <FeatureCard 
            theme={theme}
            icon={<Flame className="w-8 h-8 text-orange-500" />}
            title="Trending Dashboard"
            description="Real-time, AI-powered snapshots of significant trends across niches and regions with full post plans."
            onClick={() => onPageChange('trending')}
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description, onClick, theme }: { icon: React.ReactNode, title: string, description: string, onClick?: () => void, theme: 'light' | 'dark' }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="p-10 glass-card transition-all group border-white/5"
  >
    <div className={cn(
      "mb-8 p-4 inline-block bg-black/40 rounded-2xl border transition-all",
      theme === 'dark' ? "border-white/5 group-hover:border-white/20" : "border-slate-200 group-hover:border-neon-blue/20"
    )}>
      {icon}
    </div>
    <h3 className={cn("text-2xl font-bold mb-4 group-hover:text-gradient transition-all", theme === 'dark' ? "text-white" : "text-slate-900")}>{title}</h3>
    <p className={cn("text-base leading-relaxed mb-8", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{description}</p>
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-neon-blue font-bold group/btn"
    >
      Try Now
      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
    </button>
  </motion.div>
);
