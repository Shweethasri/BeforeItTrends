import React from 'react';
import { motion } from 'motion/react';
import { 
  Instagram, Facebook, Youtube, Twitter, 
  Play, Globe, TrendingUp 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';

const trendItems = [
  { text: "get your tiktok trends", icon: <Play className="w-5 h-5" />, color: "text-[#EE1D52]" },
  { text: "get your instagram trends", icon: <Instagram className="w-5 h-5" />, color: "text-[#E4405F]" },
  { text: "get your youtube trends", icon: <Youtube className="w-5 h-5" />, color: "text-[#FF0000]" },
  { text: "get your twitter/x trends", icon: <Twitter className="w-5 h-5" />, color: "text-light-blue" },
  { text: "get your facebook trends", icon: <Facebook className="w-5 h-5" />, color: "text-[#1877F2]" },
  { text: "get your global reach", icon: <Globe className="w-5 h-5" />, color: "text-neon-blue" },
  { text: "get your viral strategy", icon: <TrendingUp className="w-5 h-5" />, color: "text-brand-pink" },
];

export const TrendsMarquee = () => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "w-full overflow-hidden py-10 border-y transition-colors",
      theme === 'dark' ? "bg-black/50 border-white/5" : "bg-slate-50 border-slate-200"
    )}>
      <motion.div
        className="flex whitespace-nowrap gap-12"
        animate={{
          x: [0, -1035], // Adjust based on content width
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30, // Adjust speed
            ease: "linear",
          },
        }}
      >
        {/* Render items twice for infinite loop */}
        {[...Array(3)].map((_, i) => (
          <React.Fragment key={i}>
            {trendItems.map((item, idx) => {
              const content = (
                <div 
                  key={`${i}-${idx}`} 
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    theme === 'dark' ? "bg-white/5 group-hover:bg-white/10" : "bg-white border border-slate-200 shadow-sm group-hover:shadow-md"
                  )}>
                    <span className={item.color}>{item.icon}</span>
                  </div>
                  <span className={cn(
                    "text-2xl font-black font-display uppercase tracking-tighter italic",
                    theme === 'dark' ? "text-white group-hover:text-neon-blue" : "text-slate-900 group-hover:text-dark-blue"
                  )}>
                    {item.text}
                  </span>
                  <span className="text-white/10 text-4xl font-display mx-4">•</span>
                </div>
              );

              if (item.text.includes("instagram")) {
                return (
                  <a 
                    key={`${i}-${idx}`}
                    href="https://www.instagram.com/before_it_trends_?igsh=emJ1N2ZuM2N6ZnJ0"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                );
              }

              if (item.text.includes("youtube")) {
                return (
                  <a 
                    key={`${i}-${idx}`}
                    href="https://www.youtube.com/@BeforeItTrends-c2c"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                );
              }

              if (item.text.includes("twitter")) {
                return (
                  <a 
                    key={`${i}-${idx}`}
                    href="https://x.com/BeforeItTrendss"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                );
              }

              return content;
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
