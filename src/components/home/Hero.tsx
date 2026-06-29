import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

export const Hero = ({ onStart }: { onStart: () => void }) => {
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);
  const { theme } = useTheme();

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className={cn(
        "absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[120px] rounded-full -z-10 transition-colors duration-500",
        theme === 'dark' ? "bg-neon-blue/20" : "bg-light-blue/10"
      )} />
      <div className={cn(
        "absolute bottom-1/4 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full -z-10 transition-colors duration-500",
        theme === 'dark' ? "bg-dark-blue/20" : "bg-neon-blue/5"
      )} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex mb-8"
      >
        
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={cn("text-5xl md:text-8xl font-black font-display text-center leading-[1.1] mb-8 tracking-tighter transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
      >
        Stop Posting Blind<br />
        <span className="text-gradient">Start Posting Strategically</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={cn("text-lg md:text-xl text-center max-w-2xl mb-12 font-medium transition-colors duration-300", theme === 'dark' ? "text-white/60" : "text-slate-600")}
      >
        AI-powered popularity forecasting, anomaly detection, and content optimization for creators who want to grow before it trends.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="group relative inline-flex items-center gap-2 px-10 py-5 bg-neon-blue text-black rounded-2xl font-bold text-lg hover:bg-neon-blue/90 transition-all shadow-lg shadow-neon-blue/30"
      >
        Optimize Before Posting
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 flex flex-col items-center"
      >
        
        
        {isCodeVisible && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 glass-card border-brand-purple/20 bg-black/60 font-mono text-[10px] text-brand-purple w-[300px] overflow-hidden whitespace-pre"
          >
            {`import flask\napp = flask.Flask(__name__)\n\n@app.route("/api/trends")\ndef get_trends():\n    return {"status": "viral"}`}
          </motion.div>
        )}
      </motion.div>

      
    </section>
  );
};
