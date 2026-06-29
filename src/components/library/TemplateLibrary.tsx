import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Camera, Utensils, Zap, Cpu, 
  Shirt, Gamepad2, HeartPulse, Hammer,
  Briefcase, Copy, Check, Search, Filter,
  TrendingUp, Hash, MessageCircle, Heart, Globe,
  Sparkles, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { initialDomainTemplates, Template } from '../../data/templateData';
import { safeGenerateContent, cleanJsonString } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';
import { Type } from "@google/genai";

interface Domain {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const domains: Domain[] = [
  { id: 'tech', name: 'Tech & AI', icon: <Cpu className="w-5 h-5" /> },
  { id: 'fashion', name: 'Fashion & Aesthetic', icon: <Shirt className="w-5 h-5" /> },
  { id: 'food', name: 'Food & Cooking', icon: <Utensils className="w-5 h-5" /> },
  { id: 'fitness', name: 'Fitness & Health', icon: <HeartPulse className="w-5 h-5" /> },
  { id: 'gaming', name: 'Gaming', icon: <Gamepad2 className="w-5 h-5" /> },
  { id: 'business', name: 'Business', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'travel', name: 'Travel & Explore', icon: <Globe className="w-5 h-5" /> },
  { id: 'pets', name: 'Pets & Animals', icon: <Heart className="w-5 h-5" /> },
  { id: 'education', name: 'Education & Books', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'diy', name: 'DIY & Crafts', icon: <Hammer className="w-5 h-5" /> },
  { id: 'automotive', name: 'Automotive', icon: <Zap className="w-5 h-5" /> }
];

export const TemplateLibrary = () => {
  const { theme } = useTheme();
  const [selectedDomain, setSelectedDomain] = useState(domains[0].id);
  const [allTemplates, setAllTemplates] = useState<Record<string, Template[]>>(initialDomainTemplates);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeTemplates = allTemplates[selectedDomain] || [];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateMoreTemplates = async () => {
    setIsGenerating(true);
    const domainName = domains.find(d => d.id === selectedDomain)?.name;
    
    try {
      const prompt = `Generate 50 high-performing social media templates for the domain: "${domainName}".
      Each template must have:
      1. A viral caption (with emojis)
      2. 5-7 relevant hashtags
      3. A type (e.g., "Motivational", "Educational", "Relatable", "Review", "Behind the Scenes")
      
      Return ONLY a JSON array of objects.`;

      const { data, error: apiError, errorType } = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                type: { type: Type.STRING }
              },
              required: ["caption", "hashtags", "type"]
            }
          }
        }
      });

      if (apiError) {
        const displayError = errorType && (ERROR_MESSAGES as any)[errorType] 
          ? (ERROR_MESSAGES as any)[errorType] 
          : apiError;
        throw new Error(displayError);
      }

      if (data) {
        const newTemplates = JSON.parse(cleanJsonString(data));
        setAllTemplates(prev => ({
          ...prev,
          [selectedDomain]: [...(prev[selectedDomain] || []), ...newTemplates]
        }));
      }
    } catch (err: any) {
      console.error("Failed to generate templates:", err);
      // Optional: set a local error state if needed
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = activeTemplates.filter(t => 
    t.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={cn("pt-32 pb-20 px-6 min-h-screen transition-colors duration-300", theme === 'dark' ? "bg-black" : "bg-white")}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-light-blue/10 border border-light-blue/20 text-light-blue text-xs font-black uppercase tracking-widest"
          >
            <TrendingUp className="w-3 h-3" />
            Ready-Made Content Library
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
          >
            Viral Content <br /> <span className="text-gradient">Ready-Made Vault</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("text-lg font-medium leading-relaxed max-w-3xl mx-auto", theme === 'dark' ? "text-white/40" : "text-slate-500")}
          >
            Skip the writing block. Browse our vetted library of high-engagement captions and hashtag bundles 
            curated for every major domain. Optimized for virality across all platforms.
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* Sidebar Domains */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className={cn("text-xs font-black uppercase tracking-widest mb-6 px-4", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Select Domain</h3>
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  selectedDomain === domain.id 
                    ? "bg-neon-blue text-black" 
                    : (theme === 'dark' ? "text-white/40 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-black/5 hover:text-slate-900")
                )}
              >
                {domain.icon}
                <span className="font-bold tracking-tight">{domain.name}</span>
                {selectedDomain === domain.id && (
                  <motion.div layoutId="activeDomain" className="absolute left-0 w-1.5 h-full bg-black/20" />
                )}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className={cn(
                "p-4 flex items-center gap-4 rounded-2xl border transition-all w-full md:max-w-md",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
              )}>
                <Search className={cn("w-5 h-5", theme === 'dark' ? "text-white/20" : "text-slate-400")} />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm font-medium"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateMoreTemplates}
                disabled={isGenerating}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                  isGenerating 
                    ? "bg-white/10 text-white/40 cursor-not-allowed" 
                    : "bg-gradient-to-r from-light-blue to-neon-blue text-black hover:shadow-lg hover:shadow-neon-blue/20"
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating Patterns...' : 'Unlock 200+ AI Patterns'}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTemplates?.map((template, idx) => (
                  <motion.div
                    key={`${selectedDomain}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "group glass-card p-6 border transition-all flex flex-col justify-between",
                      theme === 'dark' ? "border-white/5 hover:border-neon-blue/20" : "bg-white border-slate-200 hover:border-neon-blue shadow-lg shadow-slate-200/40"
                    )}
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <MessageCircle className="w-3 h-3 text-neon-blue" />
                          {template.type}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(template.caption, `${idx}-cap`)}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              theme === 'dark' ? "hover:bg-white/10 text-white/20 hover:text-white" : "hover:bg-black/5 text-slate-400 hover:text-slate-900"
                            )}
                            title="Copy Caption"
                          >
                            {copiedIndex === `${idx}-cap` ? <Check className="w-4 h-4 text-neon-blue" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <p className={cn("text-lg font-bold italic leading-relaxed", theme === 'dark' ? "text-white/80" : "text-slate-700")}>
                        "{template.caption}"
                      </p>
                    </div>

                    <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-light-blue">
                            <Hash className="w-3 h-3" />
                            Viral Bundle
                         </div>
                         <button 
                            onClick={() => copyToClipboard(template.hashtags.join(' '), `${idx}-hash`)}
                            className="text-[10px] font-black uppercase tracking-widest hover:text-neon-blue transition-colors flex items-center gap-1.5"
                          >
                            {copiedIndex === `${idx}-hash` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedIndex === `${idx}-hash` ? 'Copied' : 'Copy All'}
                          </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.hashtags.map(tag => (
                          <span key={tag} className={cn(
                            "px-2 py-1 rounded bg-white/5 text-[10px] font-bold",
                            theme === 'dark' ? "text-white/40" : "text-slate-500"
                          )}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-20 border-t border-white/10">
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-4xl font-black font-display text-neon-blue">2,000+</h4>
            <p className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Potential Patterns</p>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-4xl font-black font-display text-light-blue">11</h4>
            <p className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Global Domains</p>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-4xl font-black font-display text-white">100k+</h4>
            <p className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Neural Hashtags</p>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-4xl font-black font-display text-brand-pink">Live</h4>
            <p className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>AI Generation</p>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl py-20 space-y-20">
          <div className="space-y-6">
            <h2 className={cn("text-4xl font-black font-display tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Why Use a Template Library?
            </h2>
            <p className={cn("text-lg font-medium leading-relaxed", theme === 'dark' ? "text-white/60" : "text-slate-600")}>
              The hardest part of social media growth isn't taking the photo or recording the video—it's knowing how to package it for the algorithm. Our Template Library gives you a professional head start by providing captions that have been tested for readability, emotional impact, and keyword density.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className={cn("text-4xl font-black font-display tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Optimized Hashtag Bundles
            </h2>
            <p className={cn("text-lg font-medium leading-relaxed", theme === 'dark' ? "text-white/60" : "text-slate-600")}>
              Hashtags are the SEO of social media. We don't just give you a list of words; we provide carefully weighted bundles that target a mix of high-volume and niche-specific categories. Copy a single bio or a full hashtag bundle with a single click and watch your distribution scale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
