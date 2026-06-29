import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Sparkles, Loader2, Copy, Check, Zap, 
  Instagram, Twitter, Linkedin, Smartphone,
  Target, Heart, Layout, Send, Globe,
  Shield, Star, Zap as ZapIcon, ChevronDown
} from 'lucide-react';
import { safeGenerateContent, SYSTEM_INSTRUCTIONS, cleanJsonString } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { FilterSelect } from '../ui/FilterSelect';

interface BioResult {
  bio: string;
  style: string;
  target_platform: string;
  impact_score: number;
}

export const BioGenerator = () => {
  const { theme } = useTheme();
  
  // Input States
  const [platform, setPlatform] = useState('Instagram');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vibe, setVibe] = useState('Professional');
  const [cta, setCta] = useState('');
  const [includeEmojis, setIncludeEmojis] = useState(true);

  // App States
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BioResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateBios = async () => {
    if (!description.trim()) {
      setError("Please describe yourself or your brand first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Generate bios for:
      Platform: ${platform}
      Name/Brand: ${name || 'Not specified'}
      Description: ${description}
      Vibe: ${vibe}
      CTA: ${cta || 'None'}
      Include Emojis: ${includeEmojis ? 'Yes' : 'No'}
      
      Generate 5 unique, platform-optimized bios.`;

      const { data, error: apiError, errorType } = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.BIO_GENERATOR,
          responseMimeType: "application/json",
        }
      });

      if (apiError) {
        const displayError = errorType && (ERROR_MESSAGES as any)[errorType] 
          ? (ERROR_MESSAGES as any)[errorType] 
          : apiError;
        throw new Error(displayError);
      }
      
      const parsedData = cleanJsonString(data);
      try {
        const parsed = JSON.parse(parsedData);
        setResults(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("JSON Parse Error:", e, "Raw:", parsedData);
        throw new Error("Failed to generate bios. The AI response was malformed.");
      }
    } catch (err: any) {
      console.error('Bio Generation error:', err);
      setError(err.message || "Neural engine failed to generate bios. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("pt-32 pb-20 px-6 min-h-screen transition-colors duration-300", theme === 'dark' ? "bg-black" : "bg-white")}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-black uppercase tracking-widest"
          >
            <User className="w-3 h-3" />
            Personal Brand Dashboard
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
          >
            AI Social Media <br /> <span className="text-gradient">Bio Generator</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("max-w-3xl mx-auto text-lg font-medium leading-relaxed", theme === 'dark' ? "text-white/40" : "text-slate-500")}
          >
            Your bio is your digital handshake. It’s the first thing people see and your one chance to 
            make a great impression. Don't leave it to chance. Our AI helps you craft 
            the perfect introduction in seconds.
          </motion.p>
        </div>

        {/* Input Section */}
        <div className={cn(
          "glass-card p-10 mb-20 border transition-all",
          theme === 'dark' ? "border-white/5" : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50"
        )}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn("text-xl font-bold font-display uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Generate Your Bio</h2>
              <p className={cn("text-sm", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Fill in the details below to get started. The more context you provide, the better the results.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FilterSelect 
                label="Target Platform"
                value={platform}
                options={['Instagram', 'TikTok', 'Twitter', 'LinkedIn', 'Facebook', 'YouTube']}
                onChange={setPlatform}
                theme={theme}
              />
              <div>
                <label className={cn("block mb-2 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Your Name / Brand Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm",
                    theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-neon-blue" : "bg-white border-slate-200 text-slate-900 focus:border-neon-blue shadow-sm"
                  )}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Describe Yourself or Your Brand</label>
                <div className="flex gap-2">
                  <span className={cn("text-[10px] font-bold uppercase", theme === 'dark' ? "text-neon-blue/40" : "text-neon-blue/60")}>Examples</span>
                </div>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 'I'm a software engineer who loves sharing AI tips and drinking coffee.' or 'We sell handmade, sustainable jewelry.'"
                className={cn(
                  "w-full h-32 px-4 py-3 rounded-xl border outline-none transition-all text-sm resize-none mb-3",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-neon-blue" : "bg-white border-slate-200 text-slate-900 focus:border-neon-blue shadow-sm"
                )}
              />
              <div className="flex flex-wrap gap-2">
                {[
                  "AI Software Engineer",
                  "Yoga for Techies",
                  "Sustainable Jewelry",
                  "Scandinavian Photography",
                  "E-commerce Strategist"
                ].map((tag, i) => {
                  const examples = [
                    "Software engineer sharing AI automations & high-performance coding tips.",
                    "Yoga instructor specialized in mindful movement for tech professionals.",
                    "Boutique brand creating sustainable, handcrafted leather accessories.",
                    "Travel photographer documenting untouched landscapes across Scandinavia.",
                    "Digital marketing strategist focused on scaling e-commerce brands."
                  ];
                  return (
                    <button
                      key={tag}
                      onClick={() => setDescription(examples[i])}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                        theme === 'dark' 
                          ? "bg-white/5 border-white/10 text-white/40 hover:bg-neon-blue/10 hover:border-neon-blue/20 hover:text-neon-blue"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-neon-blue hover:text-white hover:border-neon-blue"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FilterSelect 
                label="Vibe / Tone"
                value={vibe}
                options={['Professional', 'Witty', 'Inspirational', 'Creative', 'Minimalist', 'Aesthetic']}
                onChange={setVibe}
                theme={theme}
              />
              <div>
                <label className={cn("block mb-2 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Call-to-Action (Optional)</label>
                <input 
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g., '👇 Shop my new collection'"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm",
                    theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-neon-blue" : "bg-white border-slate-200 text-slate-900 focus:border-neon-blue shadow-sm"
                  )}
                />
              </div>
            </div>

            <div className={cn(
              "p-5 rounded-2xl border flex items-center justify-between",
              theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div>
                <p className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Include Emojis</p>
                <p className={cn("text-[10px] uppercase font-black tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Tailored emoji integration</p>
              </div>
              <button 
                onClick={() => setIncludeEmojis(!includeEmojis)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-300",
                  includeEmojis ? "bg-neon-blue" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                  includeEmojis ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <button 
              onClick={generateBios}
              disabled={isLoading || !description.trim()}
              className="w-full py-5 rounded-2xl bg-neon-blue hover:bg-light-blue text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              )}
              {isLoading ? 'Architecting Your Identity...' : 'Generate Bios'}
            </button>
            
            {error && (
              <p className="text-red-500 text-xs font-bold text-center italic animate-bounce">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32"
            >
              {results.map((res, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "glass-card p-6 border transition-all hover:border-neon-blue group relative",
                    theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "bg-white border-slate-200 shadow-xl"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 rounded bg-neon-blue/10 text-neon-blue text-[9px] font-black uppercase tracking-widest">
                      {res.style}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <ZapIcon className="w-3 h-3 text-light-blue" />
                      <span className="text-[10px] font-bold text-light-blue">{res.impact_score}% Impact</span>
                    </div>
                  </div>
                  <div className={cn(
                    "p-4 rounded-xl border mb-4 min-h-[100px] flex items-center justify-center text-center",
                    theme === 'dark' ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200"
                  )}>
                    <p className={cn("text-sm font-medium leading-relaxed", theme === 'dark' ? "text-white/90" : "text-slate-800")}>
                      {res.bio}
                    </p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(res.bio, idx)}
                    className="w-full py-2.5 rounded-lg bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedIndex === idx ? 'Copied' : 'Copy Bio'}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Sections */}
        <div className="space-y-32 border-t border-white/10 pt-32">
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h2 className={cn("text-5xl font-black font-display tracking-tighter uppercase leading-[0.9]", theme === 'dark' ? "text-white" : "text-slate-900")}>
                Your Perfect First Impression, <br />
                <span className="text-gradient">Written by AI.</span>
              </h2>
              <p className={cn("text-lg leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
                Your social media bio is one of the most important pieces of text on your profile. In just a few seconds, it needs to tell people who you are, what you do, and why they should follow you. That's a lot of pressure! Our AI Social Media Bio Generator is here to help you craft a compelling bio that makes an impact. Whether you're a professional looking to network on LinkedIn, a creator building a brand on Instagram, or a business owner on Facebook, we've got you covered.
              </p>
            </div>
            <div className={cn(
              "p-8 rounded-[40px] border",
              theme === 'dark' ? "bg-white/5 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]" : "bg-slate-50 border-slate-200 shadow-xl shadow-slate-200/50"
            )}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-light-blue/20 flex items-center justify-center text-light-blue">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className={cn("font-black uppercase tracking-widest text-[10px]", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Algorithm Expert</p>
                  <p className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Bio SEO Optimization</p>
                </div>
              </div>
              <p className={cn("text-lg italic font-medium leading-relaxed", theme === 'dark' ? "text-white/70" : "text-slate-600")}>
                "By understanding your description and desired tone, our AI generates five unique options that are tailored to the character limits and conventions of your chosen platform."
              </p>
            </div>
          </div>

          {/* Section 2: Steps */}
          <div className="space-y-16">
            <h2 className={cn("text-center text-4xl font-black font-display tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              How to Create an Unforgettable Bio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BioStepCard 
                theme={theme}
                number="01"
                title="Tell Us About You"
                description="In the description box, provide a few keywords or a short sentence about what you do or what your brand is about. The more detail, the better!"
              />
              <BioStepCard 
                theme={theme}
                number="02"
                title="Choose Your Platform and Vibe"
                description="Select where you'll be using the bio and the tone you want to convey—whether it's 'Professional,' 'Witty,' or 'Inspirational.'"
              />
              <BioStepCard 
                theme={theme}
                number="03"
                title="Generate and Select"
                description="Click 'Generate Bios' to receive five distinct options. You can use them as they are or mix and match ideas to create the perfect bio for your profile."
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="pb-20 text-center max-w-4xl mx-auto space-y-10">
            <h2 className={cn("text-5xl font-black font-display tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Optimized for <br /><span className="text-neon-blue">Every Platform.</span>
            </h2>
            <p className={cn("text-xl leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
              A great Twitter bio is very different from a great LinkedIn bio. Our AI knows this. It takes into account the different length requirements, audience expectations, and best practices for each social network. This ensures that the bios you receive are not just well-written, but also optimized to perform well on the specific platform you're targeting.
            </p>
            <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale transition-all hover:grayscale-0">
               <Instagram className="w-8 h-8" />
               <Twitter className="w-8 h-8" />
               <Linkedin className="w-8 h-8" />
               <Globe className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BioStepCard = ({ number, title, description, theme }: { number: string, title: string, description: string, theme: 'light' | 'dark' }) => (
  <div className={cn(
    "p-8 rounded-3xl border transition-all h-full",
    theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-slate-200 shadow-xl hover:shadow-2xl"
  )}>
    <span className="text-neon-blue font-black font-display opacity-20 text-4xl mb-4 block">{number}</span>
    <h3 className={cn("text-xl font-black uppercase tracking-tight mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>{title}</h3>
    <p className={cn("text-sm font-medium leading-relaxed", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{description}</p>
  </div>
);
