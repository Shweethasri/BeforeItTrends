import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, X, Sparkles, Loader2, MessageSquare, 
  Video, Hash, Copy, Check, Info, 
  Heart, Zap, Layout, Music, Globe, Send,
  HelpCircle, MoreVertical, ChevronDown
} from 'lucide-react';
import { safeGenerateContent, SYSTEM_INSTRUCTIONS, cleanJsonString } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { FilterSelect } from '../ui/FilterSelect';

interface POVResult {
  pov_caption: string;
  suggested_audio: string;
  hashtags: string[];
  mood: string;
}

export const POVGenerator = () => {
  const { theme } = useTheme();
  
  // Input States
  const [scenario, setScenario] = useState('');
  const [songIdea, setSongIdea] = useState('');
  const [vibe, setVibe] = useState('Funny');
  const [language, setLanguage] = useState('English');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [suggestSong, setSuggestSong] = useState(true);

  // App States
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<POVResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generatePOVs = async () => {
    if (!scenario.trim()) {
      setError("Please describe a POV scenario first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Generate POV captions for this scenario: "${scenario}"
      Vibe: ${vibe}
      Language: ${language}
      Include Emojis: ${includeEmojis ? 'Yes' : 'No'}
      Existing Song Idea: ${songIdea || 'None'}
      Should Suggest Song: ${suggestSong ? 'Yes' : 'No'}
      
      Generate 5 unique, viral POV ideas.`;

      const { data, error: apiError, errorType } = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.POV_GENERATOR,
          responseMimeType: "application/json",
          temperature: 0.7,
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
        throw new Error("Failed to generate POV ideas. The AI response was malformed.");
      }
    } catch (err: any) {
      console.error('POV Generation error:', err);
      setError(err.message || "Neural engine failed to generate POVs. Please try again.");
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
            <Video className="w-3 h-3" />
            Viral POV Dashboard
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
          >
            AI POV <br /> <span className="text-gradient">Caption Generator</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("max-w-3xl mx-auto text-lg font-medium leading-relaxed italic", theme === 'dark' ? "text-white/40" : "text-slate-500")}
          >
            "POV" (Point of View) videos are one of the most dominant formats on social media, 
            known for their ability to be relatable, funny, or dramatic. Our AI POV Generator is your 
            secret weapon for brainstorming these viral scenarios. Simply describe a situation, pick a mood, 
            and our AI will create 5 unique, scroll-stopping POV captions.
          </motion.p>
        </div>

        {/* Input Section */}
        <div className={cn(
          "glass-card p-10 mb-20 border transition-all",
          theme === 'dark' ? "border-white/5" : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50"
        )}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn("text-xl font-bold font-display uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Generate POV Ideas</h2>
              <p className={cn("text-sm", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Fill in the details below to get started. The more specific your scenario, the better the results.</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Scenario Textarea */}
            <div>
              <label className={cn("block mb-3 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>POV Scenario</label>
              <textarea 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="e.g., 'A dog watching its owner leave for work' or 'You're the main character in a movie'"
                className={cn(
                  "w-full h-32 px-5 py-4 rounded-2xl border outline-none transition-all text-base resize-none",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-neon-blue" : "bg-white border-slate-200 text-slate-900 focus:border-neon-blue shadow-sm"
                )}
              />
            </div>

            {/* Song/Lyric Input */}
            <div>
              <label className={cn("block mb-3 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Your Song/Lyric Idea (Optional)</label>
              <input 
                type="text"
                value={songIdea}
                onChange={(e) => setSongIdea(e.target.value)}
                placeholder="e.g., 'Running up that hill...' or 'As It Was by Harry Styles'"
                className={cn(
                  "w-full px-5 py-4 rounded-2xl border outline-none transition-all text-base",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-neon-blue" : "bg-white border-slate-200 text-slate-900 focus:border-neon-blue shadow-sm"
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Dropdowns & Radios */}
              <div className="space-y-6">
                <FilterSelect 
                  label="Vibe / Tone"
                  value={vibe}
                  options={['Funny', 'Dramatic', 'Relatable', 'Emotional', 'Chaotic', 'Deep', 'Aesthetic', 'Informational']}
                  onChange={setVibe}
                  theme={theme}
                />

                <div>
                  <label className={cn("block mb-4 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Language</label>
                  <div className="flex gap-6">
                    <button 
                      onClick={() => setLanguage('English')}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        language === 'English' ? "border-neon-blue" : "border-white/20"
                      )}>
                        {language === 'English' && <div className="w-2.5 h-2.5 rounded-full bg-neon-blue" />}
                      </div>
                      <span className={cn("text-sm transition-colors", language === 'English' ? "text-white font-bold" : (theme === 'dark' ? "text-white/40" : "text-slate-500"))}>English</span>
                    </button>
                    <button 
                      onClick={() => setLanguage('Hinglish')}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        language === 'Hinglish' ? "border-neon-blue" : "border-white/20"
                      )}>
                        {language === 'Hinglish' && <div className="w-2.5 h-2.5 rounded-full bg-neon-blue" />}
                      </div>
                      <span className={cn("text-sm transition-colors", language === 'Hinglish' ? "text-white font-bold" : (theme === 'dark' ? "text-white/40" : "text-slate-500"))}>Hinglish</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-6">
                <div className={cn(
                  "p-5 rounded-2xl border flex items-center justify-between",
                  theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div>
                    <p className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Include Emojis</p>
                    <p className={cn("text-[10px] uppercase font-black tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Make it visual</p>
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

                <div className={cn(
                  "p-5 rounded-2xl border flex items-center justify-between",
                  theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div>
                    <p className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Suggest a Song/Lyric</p>
                    <p className={cn("text-[10px] uppercase font-black tracking-widest", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Audio pairing engine</p>
                  </div>
                  <button 
                    onClick={() => setSuggestSong(!suggestSong)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      suggestSong ? "bg-neon-blue" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                      suggestSong ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={generatePOVs}
              disabled={isLoading || !scenario.trim()}
              className="w-full py-5 rounded-2xl bg-neon-blue hover:bg-light-blue text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              )}
              {isLoading ? 'Thinking Relatable Thoughts...' : 'Generate POVs'}
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
              className="space-y-6 mb-32"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-grow bg-white/10" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-neon-blue">Neural Results</span>
                <div className="h-px flex-grow bg-white/10" />
              </div>
              
              {results.map((res, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "glass-card p-8 border transition-all hover:border-light-blue group relative overflow-hidden",
                    theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "bg-white border-slate-200 shadow-xl"
                  )}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue opacity-20 group-hover:opacity-100 transition-all" />
                  
                  <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                    <div className="space-y-4 flex-grow max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Idea {idx + 1}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-light-blue text-[8px] font-black uppercase tracking-widest">{res.mood}</span>
                      </div>
                      <p className={cn("text-2xl font-black font-display tracking-tight leading-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                        "{res.pov_caption}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {res.hashtags.map((tag, i) => (
                          <span key={i} className="text-neon-blue text-xs font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className={cn(
                      "w-full lg:w-72 p-5 rounded-2xl border space-y-3",
                      theme === 'dark' ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-200"
                    )}>
                      <div className="flex items-center gap-2 text-light-blue">
                        <Music className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Suggested Audio</span>
                      </div>
                      <p className={cn("text-sm font-bold leading-relaxed", theme === 'dark' ? "text-white/60" : "text-slate-600")}>
                        {res.suggested_audio}
                      </p>
                      <button 
                        onClick={() => copyToClipboard(res.pov_caption, idx)}
                        className="w-full mt-4 py-2.5 rounded-xl bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedIndex === idx ? 'Copied!' : 'Copy POV'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Sections */}
        <div className="space-y-24 border-t border-white/10 pt-24">
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className={cn("text-5xl font-black font-display tracking-tighter uppercase leading-[0.9]", theme === 'dark' ? "text-white" : "text-slate-900")}>
                Create POV <br />
                <span className="text-gradient">Scenarios</span> That Go Viral.
              </h2>
              <p className={cn("text-lg leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
                POV, or "Point of View," videos have become one of the most powerful formats for storytelling on social media. 
                They invite the viewer into a specific moment, creating a sense of relatability, humor, or drama that is highly engaging. 
                Our AI POV Caption Generator is your creative partner for brainstorming these viral scenarios. 
                It helps you craft the perfect short, eye-catchy hook that makes people stop scrolling and watch.
              </p>
            </div>
            <div className="space-y-6">
              <p className={cn("text-lg leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
                Whether you're aiming for a funny, relatable moment or a dramatic, cinematic feel, 
                our tool provides you with multiple options tailored to your chosen vibe. 
                Plus, with integrated song suggestions, you can perfectly match your visual story to a trending sound, 
                increasing your chances of being discovered. Stop wondering what POV to create next and start generating viral ideas in an instant.
              </p>
            </div>
          </div>

          {/* Section 2: Steps */}
          <div className="space-y-12">
            <h2 className={cn("text-center text-4xl font-black font-display tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              How to Generate Viral POV Captions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard 
                theme={theme}
                number="01"
                title="Describe Your Scenario"
                description="In a few words, explain the situation you want to portray. For example, 'A cat judging its owner' or 'Walking into an exam you didn't study for.'"
              />
              <StepCard 
                theme={theme}
                number="02"
                title="Set the Vibe"
                description="Choose the emotional tone you're aiming for. Do you want it to be 'Funny,' 'Dramatic,' 'Relatable,' or 'Wholesome'? This guides the AI's creative direction."
              />
              <StepCard 
                theme={theme}
                number="03"
                title="Generate Your Ideas"
                description="Click the 'Generate POVs' button, and the AI will deliver 5 unique caption hooks. Each one is designed to be short, impactful, and perfect for the fast-paced environment of TikTok and Reels."
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="pb-20 text-center max-w-4xl mx-auto space-y-10">
            <h2 className={cn("text-5xl font-black font-display tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Unlock Your Inner <span className="text-neon-blue">Storyteller.</span>
            </h2>
            <p className={cn("text-xl leading-relaxed font-medium", theme === 'dark' ? "text-white/60" : "text-slate-500")}>
              The beauty of POV content is its ability to connect with universal human experiences. 
              This tool helps you tap into that power by generating ideas that are both creative and culturally relevant. 
              With options for different languages and the inclusion of trendy emojis and song suggestions, 
              you have everything you need to produce content that feels authentic and timely. 
              Use it to brainstorm your next series, overcome creative blocks, or simply add a new, powerful format to your content arsenal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, description, theme }: { number: string, title: string, description: string, theme: 'light' | 'dark' }) => (
  <div className={cn(
    "p-8 rounded-3xl border transition-all hover:scale-[1.02] flex flex-col",
    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
  )}>
    <span className="text-neon-blue text-5xl font-black font-display italic opacity-20 block mb-6 leading-none">{number}</span>
    <h3 className={cn("text-xl font-black uppercase tracking-tight mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>{title}</h3>
    <p className={cn("text-sm font-medium leading-relaxed flex-grow", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{description}</p>
  </div>
);
