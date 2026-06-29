import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Brain, Layers, BarChart3, Binary, ScanEye, MessageSquareHeart } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

const techs = [
  {
    icon: <ScanEye className="w-8 h-8 text-neon-blue" />,
    name: "CNN Visual Engine",
    description: "Our Convolutional Neural Networks analyze every frame of your video and every pixel of your image to identify high-retention visual markers.",
    details: ["Object Detection", "Scene Recognition", "Aesthetic Scoring"]
  },
  {
    icon: <MessageSquareHeart className="w-8 h-8 text-brand-pink" />,
    name: "Sentiment Analysis",
    description: "Advanced NLP pipelines process captions and comments to determine emotional tone, ensuring your content resonates positively with your core audience.",
    details: ["Emotional Tone", "Comment Synthesis", "Brand Alignment"]
  },
  {
    icon: <Binary className="w-8 h-8 text-brand-purple" />,
    name: "Predictive Modeling",
    description: "Using Decision Trees and Random Forests, we calculate a precise 'Virality Probability' before you even press publish.",
    details: ["Decision Trees", "Random Forests", "Historical Correlation"]
  },
  {
    icon: <Brain className="w-8 h-8 text-green-400" />,
    name: "Suggestions Engine",
    description: "If our models detect a low performance score, the AI provides actionable suggestions to fix hooks, pacing, or lighting.",
    details: ["Hook Optimization", "Format Tweaks", "Pacing Logic"]
  }
];

export const TechStack = () => {
  const { theme } = useTheme();

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-black uppercase tracking-widest mb-6"
          >
            <Cpu className="w-3 h-3" />
            The Intelligence Suite
          </motion.div>
          <h2 className={cn("text-4xl md:text-6xl font-black font-display mb-6 tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
            Proprietary <span className="text-gradient">AI Architecture</span>
          </h2>
          <p className={cn("text-lg md:text-xl max-w-2xl mx-auto font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
            We combine state-of-the-art neural networks with classical machine learning to give you an unfair advantage.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techs.map((tech, idx) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-8 rounded-3xl border transition-all group",
                theme === 'dark' ? "bg-white/[0.02] border-white/5 hover:border-neon-blue/30" : "bg-white border-slate-200 hover:border-neon-blue shadow-lg hover:shadow-neon-blue/10"
              )}
            >
              <div className={cn(
                "mb-6 p-4 inline-block rounded-2xl transition-all",
                theme === 'dark' ? "bg-white/5" : "bg-slate-50"
              )}>
                {tech.icon}
              </div>
              <h3 className={cn("text-xl font-bold mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>
                {tech.name}
              </h3>
              <p className={cn("text-sm leading-relaxed mb-6", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                {tech.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {tech.details.map((detail) => (
                  <span key={detail} className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                    theme === 'dark' ? "border-white/5 bg-white/5 text-white/30" : "border-slate-100 bg-slate-50 text-slate-400"
                  )}>
                    {detail}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent -rotate-12 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-purple/20 to-transparent rotate-12 pointer-events-none" />
    </section>
  );
};
