import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, X, Sparkles, Loader2, MessageSquare, 
  Instagram, Youtube, Video, Hash, Copy, 
  Check, ArrowRight, Trash2, Image as ImageIcon,
  Zap, Heart, Layout, Send, History, TrendingUp,
  Lightbulb, ChevronRight, Quote, ChevronDown
} from 'lucide-react';
import { safeGenerateContent, SYSTEM_INSTRUCTIONS, cleanJsonString } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { FilterSelect } from '../ui/FilterSelect';

interface CaptionResult {
  vibe: string;
  caption: string;
  hashtags: string[];
  hook_type: string;
}

export const CaptionGenerator = ({ initialContext = '' }: { initialContext?: string }) => {
  const { theme } = useTheme();
  
  // Input States
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [platform, setPlatform] = useState('Instagram');
  const [context, setContext] = useState(initialContext);
  const [vibe, setVibe] = useState('');
  const [ctaGoal, setCtaGoal] = useState('');

  // App States
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CaptionResult[] | null>(null);
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('caption_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (initialContext) {
      setContext(initialContext);
    }
  }, [initialContext]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToHistory = (newResults: CaptionResult[], contextData: any) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      results: newResults,
      config: contextData,
      media: image ? (isVideo ? 'video' : 'image') : 'text-only'
    };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('caption_history', JSON.stringify(updated));
  };

  const removeHistoryItem = (id: number) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('caption_history', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsVideo(selectedFile.type.startsWith('video/'));
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResults(null);
      setError(null);
    }
  };

  const removeMedia = () => {
    setImage(null);
    setFile(null);
    setIsVideo(false);
    setResults(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateCaptions = async () => {
    if (!image && !context) {
      setError("Please upload an image/video OR provide some context/topic for the AI.");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setError(null);

    const steps = [
      "Initializing Neural Copywriter...",
      image ? "Scanning Visual Signatures..." : "Parsing Contextual Metadata...",
      "Analyzing Viral Vibe Trajectory...",
      "Generating Engagement Hooks...",
      "Platform Character Calibration...",
      "Refining Output Matrix..."
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      let parts: any[] = [];
      
      if (image) {
        const base64Data = image.split(',')[1];
        const mimeType = file?.type || 'image/jpeg';
        parts.push({ inlineData: { data: base64Data, mimeType } });
      }

      const prompt = `Task: Generate captions for this ${image ? (isVideo ? 'video' : 'image') : 'content topic'}.
      Target Platform: ${platform}
      User Topic/Context: ${context || 'Analyze the visual content only'}
      Desired Vibe: ${vibe || 'Random / Varied'}
      CTA Goal: ${ctaGoal || 'Engagement / Interaction'}
      
      Requirements: Generate 8 unique, high-performing captions. Ensure diversity in length and style.`;

      parts.push({ text: prompt });

      const { data, error: apiError, errorType } = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts
        }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.CAPTION_GENERATOR,
          responseMimeType: "application/json",
          temperature: 0.8,
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
        if (Array.isArray(parsed)) {
          setResults(parsed);
          saveToHistory(parsed, { platform, context, vibe, ctaGoal });
        } else {
          throw new Error("Invalid output format");
        }
      } catch (e) {
        console.error("JSON Parse Error:", e, "Raw:", parsedData);
        throw new Error("Failed to generate captions. The AI response was unusual.");
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || "Neural engine failed. Please try again.");
    } finally {
      clearInterval(stepInterval);
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
            <Sparkles className="w-3 h-3" />
            AI Caption Engine
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
          >
            AI Caption <br /> <span className="text-gradient">Generator</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("max-w-2xl mx-auto text-lg font-medium leading-relaxed", theme === 'dark' ? "text-white/40" : "text-slate-500")}
          >
            You've created the perfect photo or video, but now comes the hard part: the caption. 
            Don't let writer's block slow you down. Our AI turns your visual content into compelling posts in seconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Generator Area */}
          <div className="lg:col-span-8 space-y-12">
            {/* Input Section */}
            <div className={cn(
              "glass-card p-8 border transition-all",
              theme === 'dark' ? "border-white/5" : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50"
            )}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={cn("text-xl font-bold font-display uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Content Neural Parser</h2>
                  <p className={cn("text-sm", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Upload media or describe your topic for AI-driven copywriting.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Media Upload Area */}
                <div className="space-y-4">
                  <div className={cn(
                    "relative group aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all bg-white/[0.02]",
                    theme === 'dark' ? "border-white/10 hover:border-neon-blue/40" : "border-slate-200 hover:border-neon-blue/30"
                  )}>
                    {image ? (
                      <>
                        {isVideo ? (
                          <video src={image} className="w-full h-full object-cover" />
                        ) : (
                          <img src={image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        )}
                        <button 
                          onClick={removeMedia}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-center cursor-pointer p-6"
                      >
                        <Upload className={cn("w-6 h-6 mx-auto mb-2", theme === 'dark' ? "text-white/20 group-hover:text-neon-blue" : "text-slate-300 group-hover:text-neon-blue")} />
                        <p className={cn("text-xs font-bold", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Global Media Drop</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={cn("block text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Context / Topic</label>
                  <textarea 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Describe what's happening or your goal..."
                    className={cn(
                      "w-full h-[150px] p-4 rounded-2xl border outline-none transition-all text-sm resize-none",
                      theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-neon-blue" : "bg-white border-slate-200 text-slate-900 focus:border-neon-blue"
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FilterSelect 
                  label="Platform"
                  value={platform}
                  options={[
                    { label: 'Instagram', value: 'Instagram' },
                    { label: 'TikTok', value: 'TikTok' },
                    { label: 'Twitter / X', value: 'X' },
                    { label: 'LinkedIn', value: 'LinkedIn' }
                  ]}
                  onChange={setPlatform}
                  theme={theme}
                />
                <FilterSelect 
                  label="Desired Vibe"
                  value={vibe}
                  options={[
                    { label: 'Auto-Detect', value: '' },
                    { label: 'Storytelling', value: 'Storytelling' },
                    { label: 'Baddy/Bold', value: 'Baddy/Bold' },
                    { label: 'Witty', value: 'Witty' },
                    { label: 'Minimalist', value: 'Minimalist' }
                  ]}
                  onChange={setVibe}
                  theme={theme}
                />
                <FilterSelect 
                  label="CTA Goal"
                  value={ctaGoal}
                  options={[
                    { label: 'Generic', value: '' },
                    { label: 'Get Comments', value: 'Comments' },
                    { label: 'Link in Bio', value: 'Link in Bio' },
                    { label: 'Saves', value: 'Saves' }
                  ]}
                  onChange={setCtaGoal}
                  theme={theme}
                />
              </div>

              <button 
                onClick={generateCaptions}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-neon-blue hover:bg-light-blue text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                )}
                {isLoading ? 'Processing Neurons...' : 'Generate Neural Captions'}
              </button>
              
              {error && (
                <p className="text-red-500 text-xs font-bold text-center mt-4">
                  {error}
                </p>
              )}
            </div>

            {/* Results Display Area */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-12 text-center space-y-6"
                >
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-neon-blue/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-4 border-light-blue/40 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-neon-blue animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Neural Drafting in Progress</h3>
                    <p className="text-neon-blue text-sm font-mono animate-pulse">
                      {["Initializing Neural Copywriter...", 
                        image ? "Scanning Visual Signatures..." : "Parsing Contextual Metadata...",
                        "Analyzing Viral Vibe Trajectory...",
                        "Generating Engagement Hooks...",
                        "Platform Character Calibration...",
                        "Refining Output Matrix..."][loadingStep]}
                    </p>
                  </div>
                </motion.div>
              ) : results ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {results.map((res, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "glass-card p-6 border group hover:border-neon-blue/50 transition-all",
                        theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "bg-white border-slate-200 shadow-md"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-2 py-0.5 rounded-md bg-neon-blue/10 text-neon-blue text-[10px] font-black uppercase">
                          {res.vibe}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(res.caption, idx)}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            copiedIndex === idx ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/20 hover:text-white"
                          )}
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className={cn("text-sm font-bold leading-relaxed mb-4 italic line-clamp-4", theme === 'dark' ? "text-white/90" : "text-slate-800")}>
                        "{res.caption}"
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {res.hashtags.map((tag, i) => (
                          <span key={i} className="text-neon-blue text-[10px] font-bold">{tag}</span>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-white/20">Hook Type</span>
                        <span className="text-[9px] font-black text-light-blue uppercase">{res.hook_type}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                  <Quote className="w-12 h-12 text-white/5 mx-auto mb-4" />
                  <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Awaiting Input Signal</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* History Section */}
            <div className={cn(
              "glass-card p-6 border",
              theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "bg-white border-slate-200 shadow-xl"
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-neon-blue" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Neural History</h3>
                </div>
                {history.length > 0 && (
                   <button 
                    onClick={() => {
                      localStorage.removeItem('caption_history');
                      setHistory([]);
                    }}
                    className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-blue/30 transition-all cursor-pointer group"
                    onClick={() => setResults(item.results)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.media === 'video' ? <Video className="w-3 h-3 text-neon-blue" /> : 
                         item.media === 'image' ? <ImageIcon className="w-3 h-3 text-neon-blue" /> : 
                         <Hash className="w-3 h-3 text-neon-blue" />}
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-white/60 line-clamp-2 italic leading-relaxed">
                      "{item.results[0].caption}"
                    </p>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-10 opacity-20 italic text-[10px]">No recent scans found</div>
                )}
              </div>
            </div>

            {/* Platform Strategy Card */}
            <div className="glass-card p-6 border border-light-blue/20 bg-light-blue/5">
              <div className="flex items-center gap-2 mb-4 text-light-blue">
                <Lightbulb className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">Platform Hack</h3>
              </div>
              <p className="text-[11px] font-medium text-white/60 leading-relaxed mb-4">
                {platform === 'Instagram' ? "Focus on the first 125 characters. That's what users see before 'More'. Use a strong hook!" :
                 platform === 'TikTok' ? "Captions should be short and spark a question. TikTok's SEO is powered by caption keywords." :
                 platform === 'X' ? "Twitter/X threads get 3x more engagement than single posts. Consider splitting your longest captions." :
                 "LinkedIn engagement peaks between 8am and 10am. Use professional but relatable storytelling for the feed."}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-light-blue uppercase">
                <span>View Strategy Guide</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Vibe Cloud */}
            <div className={cn(
              "glass-card p-6 border",
              theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "bg-white border-slate-200 shadow-xl"
            )}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-neon-blue" />
                <h3 className="text-xs font-black uppercase tracking-widest">Global Vibe Trends</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Silent Luxury', 'Chaos Core', 'Main Character', 'Aesthetic Minimalist', 'Raw & Unfiltered', 'Storytime'].map((v) => (
                  <button 
                    key={v}
                    onClick={() => setVibe(v)}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 hover:text-white hover:border-neon-blue transition-all"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="space-y-32 border-t border-white/10 pt-32">
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h2 className={cn("text-5xl font-black font-display tracking-tighter uppercase leading-[0.9]", theme === 'dark' ? "text-white" : "text-slate-900")}>
                Never Write a <br />
                <span className="text-gradient">Boring Caption</span> Again.
              </h2>
              <p className={cn("text-lg leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
                A great photo or video deserves a great caption, but coming up with clever, engaging text on the spot can be tough. 
                Our AI Caption Generator is designed to eliminate writer's block and give you a wealth of creative options for every post. 
                By analyzing the visual content of your media, our AI understands the context, mood, and subject matter, allowing it to craft captions that truly resonate.
              </p>
            </div>
            <div className={cn(
              "p-8 rounded-[40px] border rotate-2",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className={cn("font-black uppercase tracking-widest text-[10px]", theme === 'dark' ? "text-white/40" : "text-slate-500")}>AI Insight</p>
                  <p className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Emotional Core Trigger</p>
                </div>
              </div>
              <p className={cn("text-xl italic font-bold", theme === 'dark' ? "text-white/80" : "text-slate-700")}>
                "The most viral captions don't just describe the photo; they evoke a feeling or start a conversation. Our neural engine prioritizes engagement loops."
              </p>
            </div>
          </div>

          {/* Section 2: How it works */}
          <div className="space-y-12">
            <h2 className={cn("text-center text-4xl font-black font-display tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              How to Generate Perfect Captions with AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <HowItWorkCard 
                theme={theme}
                number="01"
                title="Upload Your Media"
                description="Click the upload box and select any image or video file from your device. Our tool can handle everything from beautiful photos to dynamic video clips."
              />
              <HowItWorkCard 
                theme={theme}
                number="02"
                title="Provide Optional Context"
                description="Give the AI some direction. Select your target platform, desired vibe, or a specific call-to-action you want to include. The more context you provide, the better the results will be."
              />
              <HowItWorkCard 
                theme={theme}
                number="03"
                title="Generate and Choose"
                description="Click 'Generate Captions,' and our AI will instantly provide you with 8 unique options, each with a different creative angle, a complete caption, and a relevant set of hashtags."
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="pb-20 text-center max-w-4xl mx-auto space-y-8">
            <h2 className={cn("text-5xl font-black font-display tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              More Than Just a <br /><span className="text-neon-blue">Caption Writer.</span>
            </h2>
            <p className={cn("text-xl leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
              Our AI goes beyond simple text generation. It's a creative partner that helps you explore different angles for your content. 
              By providing 8 distinct options with varying vibes—from 'Storytelling' to 'Minimalist' to 'Bold'—it encourages you to see your own content in new ways. 
              Each option comes with a tailored set of hashtags designed to maximize your reach on your chosen platform. It's the ultimate tool for creating more engaging posts, faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorkCard = ({ number, title, description, theme }: { number: string, title: string, description: string, theme: 'light' | 'dark' }) => (
  <div className={cn(
    "p-8 rounded-3xl border transition-all hover:scale-[1.02]",
    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
  )}>
    <span className="text-neon-blue text-4xl font-black font-display italic opacity-20 block mb-4">{number}</span>
    <h3 className={cn("text-xl font-black uppercase tracking-tight mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>{title}</h3>
    <p className={cn("text-sm font-medium leading-relaxed", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{description}</p>
  </div>
);
