import React from 'react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

const testimonials = [
  {
    quote: "Before It Trends is my secret weapon. I found a trend for my cooking channel, posted a video, and it hit a million views in two days. It felt like cheating.",
    author: "@foodiecreator",
    role: "TikTok Creator, 1.2M Followers",
    avatar: "https://picsum.photos/seed/food/100/100"
  },
  {
    quote: "As a social media manager for multiple brands, this tool saves me hours of research every week. The AI-powered accuracy is mind-blowing. I can finally be proactive instead of reactive.",
    author: "Sarah L.",
    role: "Social Media Manager",
    avatar: "https://picsum.photos/seed/sarah/100/100"
  },
  {
    quote: "We use Before It Trends to inform content strategy for all our clients. The ability to forecast trends by niche and region is a game-changer for getting our clients ahead of the competition.",
    author: "Mark Chen",
    role: "Founder, Apex Marketing Agency",
    avatar: "https://picsum.photos/seed/mark/100/100"
  }
];

export const Testimonials = () => {
  const { theme } = useTheme();

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[120px] rounded-full -z-10",
        theme === 'dark' ? "bg-neon-blue/5" : "bg-neon-blue/10"
      )} />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 text-balance">
          <h2 className={cn("text-4xl md:text-6xl font-black font-display mb-6 tracking-tighter leading-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
            Trusted by the World's Fastest-Growing Creators
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.author} className={cn(
              "p-10 glass-card flex flex-col justify-between transition-all",
              theme === 'dark' ? "bg-black/40 border-white/5 hover:border-neon-blue/30" : "bg-white border-slate-200 hover:border-neon-blue shadow-lg shadow-slate-200/50"
            )}>
              <div>
                <p className={cn("text-lg md:text-xl leading-relaxed font-medium mb-12", theme === 'dark' ? "text-white/80" : "text-slate-700")}>
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src={t.avatar} 
                  alt={t.author} 
                  className={cn("w-12 h-12 rounded-full border", theme === 'dark' ? "border-white/10" : "border-slate-200")}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className={cn("font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{t.author}</h4>
                  <p className={cn("text-xs font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
