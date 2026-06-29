import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, X, Sparkles, Loader2, AlertCircle, 
  TrendingUp, Clock, Hash, Users, ThumbsUp, 
  Target, BarChart3, AlertTriangle, CheckCircle2, Shield,
  ArrowRight, Image as ImageIcon, Video, Trash2,
  ScanEye, MessageSquareHeart, Binary, Brain, ChevronDown
} from 'lucide-react';
import { safeGenerateContent, SYSTEM_INSTRUCTIONS, cleanJsonString } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';
import { Type } from "@google/genai";
import { extractFramesFromVideo, fileToBase64 } from '../../lib/media-utils';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { FilterSelect } from '../ui/FilterSelect';

interface OptimizationResult {
  sentiment: 'POSITIVE' | 'NEGATIVE';
  sentiment_reason: string;
  caption_score: number;
  suggested_captions: string[];
  popularity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  hashtag_effectiveness: 'POOR' | 'BAD' | 'NOT BAD' | 'GOOD' | 'VERY GOOD';
  posting_time_score: 'OPTIMAL' | 'SUBOPTIMAL';
  content_quality: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
  suggested_hashtags: string[];
  suggested_time: string;
}

export const PostOptimizer = ({ 
  onNavigateHome, 
  onNavigateAnomaly,
  onOptimizationComplete 
}: { 
  onNavigateHome: () => void, 
  onNavigateAnomaly: () => void,
  onOptimizationComplete: (context: {
    image: string | null;
    file: File | null;
    caption: string;
    hashtags: string;
    isVideo: boolean;
  }) => void
}) => {
  const { theme } = useTheme();
  // Input States
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState('');
  const [followers, setFollowers] = useState('');
  const [postType, setPostType] = useState('Reel');
  const [hashtags, setHashtags] = useState('');
  const [postTiming, setPostTiming] = useState('12:00 PM');
  const [videoFilter, setVideoFilter] = useState('none');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // App States
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle countdown for positive sentiment
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onOptimizationComplete({
        image,
        file,
        caption,
        hashtags,
        isVideo
      });
    }
  }, [timeLeft, image, file, caption, hashtags, isVideo, onOptimizationComplete]);

  // Generate thumbnail for filter preview
  useEffect(() => {
    if (!image) {
      setThumbnailUrl(null);
      return;
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.src = image;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0.5; // Capture at 0.5s for a good preview frame
      
      const handleLoaded = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.7));
        }
      };

      video.addEventListener('loadeddata', handleLoaded);
      video.load();
      return () => video.removeEventListener('loadeddata', handleLoaded);
    } else {
      setThumbnailUrl(image);
    }
  }, [image, isVideo]);

  const filters = [
    { id: 'none', name: 'Original', filter: 'none' },
    { id: 'clarendon', name: 'Clarendon', filter: 'contrast(1.2) saturate(1.35)' },
    { id: 'gingham', name: 'Gingham', filter: 'sepia(0.15) contrast(0.9) brightness(1.1)' },
    { id: 'moon', name: 'Moon', filter: 'grayscale(1) contrast(1.1) brightness(1.1)' },
    { id: 'lark', name: 'Lark', filter: 'contrast(0.9) saturate(1.2) brightness(1.1)' },
    { id: 'reyes', name: 'Reyes', filter: 'sepia(0.2) contrast(0.85) brightness(1.1) saturate(0.75)' },
    { id: 'juno', name: 'Juno', filter: 'contrast(1.15) saturate(1.2) sepia(0.1)' },
    { id: 'slumber', name: 'Slumber', filter: 'brightness(1.05) saturate(0.6)' },
    { id: 'aden', name: 'Aden', filter: 'sepia(0.2) brightness(1.15) saturate(0.85)' },
    { id: 'perpetua', name: 'Perpetua', filter: 'contrast(1.1) brightness(1.1) saturate(1.1)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const isVid = selectedFile.type.startsWith('video/');
      setIsVideo(isVid);
      if (isVid) {
        setPostType('Reel');
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const removeMedia = () => {
    setImage(null);
    setFile(null);
    setIsVideo(false);
    setResult(null);
  };

  const runOptimization = async () => {
    if (!image || !file) {
      setError("Please provide an image or video to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Analyze this ${isVideo ? 'video' : 'image'} and strategy.
      User Caption: "${caption}"
      Strategy context: ${followers} followers, ${postType} type, hashtags: ${hashtags}, scheduled for ${postTiming}.
      
      Perform comprehensive strategy optimization and CNN-level visual analysis.`;

      let parts: any[] = [{ text: prompt }];
      
      if (isVideo && file) {
        // For videos, extract key frames to ensure successful analysis within payload limits
        const frames = await extractFramesFromVideo(file, 4);
        frames.forEach((frameBase64, index) => {
          parts.push({
            inlineData: {
              data: frameBase64.split(',')[1],
              mimeType: 'image/jpeg'
            }
          });
        });
      } else if (file) {
        const base64Data = await fileToBase64(file);
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      }

      const { data, error: apiError, errorType } = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          role: 'user',
          parts
        }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.POST_STRATEGIST,
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
      let parsed: OptimizationResult;
      
      try {
        parsed = JSON.parse(parsedData);
        // Default values to prevent UI crashes
        parsed = {
          sentiment: parsed.sentiment ?? 'POSITIVE',
          sentiment_reason: parsed.sentiment_reason ?? '',
          caption_score: parsed.caption_score ?? 0,
          suggested_captions: parsed.suggested_captions ?? [],
          popularity: parsed.popularity ?? 'LOW',
          confidence_score: parsed.confidence_score ?? 0,
          hashtag_effectiveness: parsed.hashtag_effectiveness ?? 'POOR',
          posting_time_score: parsed.posting_time_score ?? 'SUBOPTIMAL',
          content_quality: parsed.content_quality ?? 'LOW',
          recommendations: parsed.recommendations ?? [],
          suggested_hashtags: parsed.suggested_hashtags ?? [],
          suggested_time: parsed.suggested_time ?? 'N/A'
        };
      } catch (e) {
        console.error("JSON Parse Error:", e, "Raw:", parsedData);
        throw new Error("Neural scan response was malformed. Please try again.");
      }
      
      if (parsed.sentiment === 'NEGATIVE') {
        setShowWarning(true);
        // Automatically go back home after showing warning for a few seconds
        setTimeout(() => {
          onNavigateHome();
        }, 5000);
      } else {
        setResult(parsed);
        // Automatically transition to Anomaly Scan after 30 minutes
        // We set timeLeft to 1800 seconds (30 minutes)
        setTimeLeft(1800);
      }
    } catch (err: any) {
      console.error('Optimization error:', err);
      setError(err.message || "Strategic neural scan failed. Our trend modules are currently rebooting.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("pt-32 pb-20 px-6 min-h-screen transition-colors duration-300", theme === 'dark' ? "bg-black" : "bg-white")}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-black uppercase tracking-widest mb-6"
          >
            <Target className="w-3 h-3" />
            Strategic Post Optimizer
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] mb-8 transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
          >
            Maximize Your <br />
            <span className="text-gradient">Viral Trajectory.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn("max-w-xl mx-auto font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}
          >
            Leverage neural sentiment analysis and CNN architectural scanning to perfect your content strategy before you post.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-12">
            {!result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Media Section */}
                <div className="space-y-6">
                  <div className={cn(
                    "relative group aspect-video rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all",
                    theme === 'dark' ? "border-neon-blue/10 bg-neon-blue/[0.02] hover:border-neon-blue/50" : "border-slate-200 bg-slate-50 hover:border-neon-blue/40 shadow-inner"
                  )}>
                    {image ? (
                      <>
                        {isVideo ? (
                          <video 
                            src={image} 
                            className="w-full h-full object-cover transition-all duration-300" 
                            style={{ filter: filters.find(f => f.id === videoFilter)?.filter }}
                            controls 
                          />
                        ) : (
                          <img 
                            src={image} 
                            className="w-full h-full object-cover transition-all duration-300" 
                            style={{ filter: filters.find(f => f.id === videoFilter)?.filter }}
                            alt="Preview" 
                          />
                        )}
                        <button 
                          onClick={removeMedia}
                          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-center cursor-pointer p-12"
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all",
                          theme === 'dark' ? "bg-white/5 group-hover:bg-neon-blue/20" : "bg-white group-hover:bg-neon-blue/10 shadow-sm"
                        )}>
                          <Upload className={cn("w-8 h-8 transition-colors", theme === 'dark' ? "text-white/20 group-hover:text-neon-blue" : "text-slate-300 group-hover:text-neon-blue")} />
                        </div>
                        <p className={cn("font-bold", theme === 'dark' ? "text-white/60" : "text-slate-500")}>Upload Image or Video</p>
                        <p className={cn("text-xs mt-1 uppercase tracking-widest font-black", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Sentiment & CNN Scan</p>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept="image/*,video/*" 
                        />
                      </div>
                    )}
                  </div>

                  {image && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <label className={cn("block text-[10px] font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                          {isVideo ? 'Visual Filters' : 'Editing Presets'}
                        </label>
                        <span className="text-[10px] font-black text-neon-blue uppercase animate-pulse">Preview Ready</span>
                      </div>
                      
                      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x no-scrollbar">
                        {filters.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setVideoFilter(f.id)}
                            className="flex-shrink-0 snap-start relative group"
                          >
                            <div className={cn(
                              "w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all p-0.5",
                              videoFilter === f.id 
                                ? "border-neon-blue scale-105 shadow-[0_0_20px_rgba(0,243,255,0.4)]" 
                                : "border-transparent group-hover:border-white/20"
                            )}>
                              <div className="w-full h-full relative rounded-xl overflow-hidden bg-slate-900">
                                {thumbnailUrl ? (
                                  <motion.img 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={thumbnailUrl} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    style={{ filter: f.filter }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <span className={cn(
                                  "absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase tracking-tight text-center transition-colors px-2 truncate",
                                  videoFilter === f.id ? "text-neon-blue font-black" : "text-white/80"
                                )}>
                                  {f.name}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <label className="block">
                      <span className={cn("text-xs font-black uppercase tracking-widest mb-2 block", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Post Caption</span>
                      <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write your caption here..."
                        className={cn(
                          "w-full h-32 p-4 rounded-2xl border outline-none transition-all text-sm font-medium resize-none shadow-sm",
                          theme === 'dark' ? "bg-white/5 border-white/10 focus:border-neon-blue text-white" : "bg-white border-slate-200 focus:border-neon-blue text-slate-900"
                        )}
                      />
                    </label>
                  </div>
                </div>

                {/* Strategy Section */}
                <div className={cn(
                  "glass-card p-8 space-y-8",
                  theme === 'dark' ? "" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                )}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={cn("block mb-2 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Followers</label>
                      <div className="relative">
                        <Users className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", theme === 'dark' ? "text-white/20" : "text-slate-300")} />
                        <input 
                          type="number"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                          placeholder="e.g. 5000"
                          className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all text-sm shadow-sm",
                            theme === 'dark' ? "bg-white/5 border-white/10 focus:border-neon-blue text-white" : "bg-white border-slate-200 focus:border-neon-blue text-slate-900"
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <FilterSelect 
                        label="Post Type"
                        value={postType}
                        options={['Reel', 'Post', 'Carousel']}
                        onChange={setPostType}
                        theme={theme}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={cn("block mb-2 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Hashtags</label>
                    <div className="relative">
                      <Hash className={cn("absolute left-4 top-4 w-4 h-4", theme === 'dark' ? "text-white/20" : "text-slate-300")} />
                      <textarea 
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        placeholder="#viral #trending..."
                        className={cn(
                          "w-full pl-12 pr-4 py-4 h-24 rounded-xl border outline-none transition-all text-sm resize-none shadow-sm",
                          theme === 'dark' ? "bg-white/5 border-white/10 focus:border-neon-blue text-white" : "bg-white border-slate-200 focus:border-neon-blue text-slate-900"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={cn("block mb-2 text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Post Timing</label>
                    <div className="relative">
                      <Clock className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", theme === 'dark' ? "text-white/20" : "text-slate-300")} />
                      <input 
                        type="text"
                        value={postTiming}
                        onChange={(e) => setPostTiming(e.target.value)}
                        placeholder="e.g. 6:30 PM"
                        className={cn(
                          "w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all text-sm shadow-sm",
                          theme === 'dark' ? "bg-white/5 border-white/10 focus:border-neon-blue text-white" : "bg-white border-slate-200 focus:border-neon-blue text-slate-900"
                        )}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={runOptimization}
                    disabled={isLoading || !image}
                    className="w-full py-4 rounded-2xl bg-neon-blue hover:bg-light-blue text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    )}
                    {isLoading ? 'Processing Strategy...' : 'Optimize Content'}
                  </button>
                  
                  {error && (
                    <p className="text-red-500 text-xs font-bold text-center italic mt-2 animate-bounce">
                      {error}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Result Dashboard */}
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {timeLeft !== null && (
                    <motion.div 
                      className={cn(
                        "md:col-span-4 glass-card p-4 flex items-center justify-between border-neon-blue/30 overflow-hidden relative",
                        theme === 'dark' ? "bg-neon-blue/5" : "bg-neon-blue/10"
                      )}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-neon-blue animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-neon-blue">Neural Security Lock</p>
                          <p className={cn("text-sm font-medium", theme === 'dark' ? "text-white/60" : "text-slate-600")}>
                            Positive patterns confirmed. Deep anomaly scan scheduled automatically.
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black font-display text-neon-blue tabular-nums">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </p>
                        <p className={cn("text-[10px] font-bold uppercase text-white/20", theme === 'dark' ? "" : "text-slate-400")}>Auto-Transitioning</p>
                      </div>
                      {/* Progress bar background */}
                      <div className="absolute bottom-0 left-0 h-1 bg-neon-blue/20 w-full" />
                      <motion.div 
                        className="absolute bottom-0 left-0 h-1 bg-neon-blue"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 1800, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                  <StatCard 
                    theme={theme}
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Popularity Potential"
                    value={result.popularity}
                    color="text-neon-blue"
                    sub={`Confidence: ${result.confidence_score}%`}
                  />
                  <StatCard 
                    theme={theme}
                    icon={<HandsUp className="w-5 h-5" />}
                    label="Caption Strength"
                    value={`${result.caption_score}/100`}
                    color="text-light-blue"
                    sub={result.caption_score > 70 ? 'Excellent Hooks' : 'Needs Optimization'}
                  />
                   <StatCard 
                    theme={theme}
                    icon={<ThumbsUp className="w-5 h-5" />}
                    label="Sentiment Focus"
                    value={result.sentiment}
                    color={result.sentiment === 'POSITIVE' ? 'text-green-500' : 'text-red-500'}
                    sub="CNN Authenticated"
                  />
                  <StatCard 
                    theme={theme}
                    icon={<Target className="w-5 h-5" />}
                    label="Content Quality"
                    value={result.content_quality}
                    color="text-cyan-400"
                    sub="Visual Benchmark"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Strategy Deep Dive */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className={cn(
                      "glass-card p-8",
                      theme === 'dark' ? "" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-neon-blue/20 text-neon-blue">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className={cn("text-xl font-bold font-display uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Growth Recommendations</h3>
                      </div>
                      <div className="grid gap-4">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className={cn(
                            "flex gap-4 p-4 rounded-xl border",
                            theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200 shadow-sm"
                          )}>
                            <ArrowRight className="w-4 h-4 text-neon-blue shrink-0 mt-1" />
                            <p className={cn("text-sm font-medium leading-relaxed", theme === 'dark' ? "text-white/80" : "text-slate-700")}>{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={cn(
                      "glass-card p-8",
                      theme === 'dark' ? "" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-light-blue/20 text-light-blue">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className={cn("text-xl font-bold font-display uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>AI Caption Refinement</h3>
                      </div>
                      <div className="space-y-4">
                        <div className={cn(
                          "p-4 rounded-xl border mb-6",
                          theme === 'dark' ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200 shadow-inner"
                        )}>
                          <p className={cn("text-xs font-black uppercase mb-2 truncate", theme === 'dark' ? "text-white/20" : "text-slate-400")}>Current: {caption || '(No caption provided)'}</p>
                        </div>
                        <div className="grid gap-4">
                          {result.suggested_captions.map((cap, i) => (
                            <div key={i} className={cn(
                              "group relative p-5 rounded-2xl border transition-all cursor-pointer",
                              theme === 'dark' ? "bg-neon-blue/5 border-neon-blue/10 hover:bg-neon-blue/10" : "bg-white border-slate-200 hover:border-neon-blue shadow-sm"
                            )}>
                              <p className={cn("text-sm font-bold line-clamp-2 italic pr-8", theme === 'dark' ? "text-white/90" : "text-slate-800")}>"{cap}"</p>
                              <ThumbsUp className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Sidebar */}
                  <div className="space-y-8">
                    <div className={cn(
                      "glass-card p-8",
                      theme === 'dark' ? "border-neon-blue/20" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                    )}>
                      <div className="flex items-center gap-2 mb-6 text-neon-blue">
                        <Hash className="w-5 h-5" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em]">Viral Hashtags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {result.suggested_hashtags.map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue text-[10px] font-black tracking-tight">{tag}</span>
                        ))}
                      </div>
                      <div className={cn("pt-4 border-t flex items-center justify-between", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
                        <span className={cn("text-[10px] font-bold uppercase", theme === 'dark' ? "text-white/30" : "text-slate-400")}>Effectiveness</span>
                        <span className="text-[10px] font-black text-neon-blue uppercase">{result.hashtag_effectiveness}</span>
                      </div>
                    </div>

                    <div className={cn(
                      "glass-card p-8",
                      theme === 'dark' ? "border-cyan-500/20" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                    )}>
                      <div className="flex items-center gap-2 mb-6 text-cyan-400">
                        <Clock className="w-5 h-5" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em]">Optimal Posting Time</h4>
                      </div>
                      <div className="text-center p-6 rounded-2xl bg-cyan-400/5 mb-6">
                        <p className="text-3xl font-black font-display text-cyan-400 tracking-tighter">{result.suggested_time}</p>
                        <p className="text-[10px] font-bold text-cyan-400/40 uppercase mt-1">Maximum Global Reach</p>
                      </div>
                      <div className={cn("pt-4 border-t flex items-center justify-between", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
                        <span className={cn("text-[10px] font-bold uppercase", theme === 'dark' ? "text-white/30" : "text-slate-400")}>Current Timing</span>
                        <span className={`text-[10px] font-black uppercase ${result.posting_time_score === 'OPTIMAL' ? 'text-green-500' : 'text-red-400'}`}>
                          {result.posting_time_score}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setResult(null)}
                      className={cn(
                        "w-full py-4 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest mb-4",
                        theme === 'dark' ? "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      New Strategy Scan
                    </button>

                    <button 
                      onClick={onNavigateAnomaly}
                      className="w-full py-4 rounded-2xl bg-brand-purple hover:bg-brand-purple/80 text-white font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 group"
                    >
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Run Anomaly Scan
                    </button>
                  </div>
                </div>

                {/* Analysis Engine Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-neon-blue">
                      <ScanEye className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">CNN Analysis</span>
                    </div>
                    <p className={cn("text-xs leading-relaxed font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                      Convolutional Neural Networks scanned visuals for objects, color harmony, and aesthetic scoring.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-brand-pink">
                      <MessageSquareHeart className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sentiment Engine</span>
                    </div>
                    <p className={cn("text-xs leading-relaxed font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                      NLP classifiers processed textual and visual sentiment for emotional resonance.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-brand-purple">
                      <Binary className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Random Forest</span>
                    </div>
                    <p className={cn("text-xs leading-relaxed font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                      Decision trees and random forests calculated popularity potential based on 10k+ viral data points.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <Brain className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Suggestions</span>
                    </div>
                    <p className={cn("text-xs leading-relaxed font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                      Logic-driven feedback engine provided corrective actions for hooks and pacing.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-md w-full glass-card p-10 border-red-500/20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8 border border-red-500/40">
                <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black font-display mb-4 text-red-500 tracking-tight">Access Restricted</h2>
              <p className="text-white/60 mb-8 leading-relaxed font-medium capitalize">
                Our neural sentiment scanner detected potentially negative or harmful patterns in your content. For brand safety, this strategy cannot be optimized.
              </p>
              <button 
                onClick={onNavigateHome}
                className="w-full py-4 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Return to Command Center
              </button>
              <button 
                onClick={() => setShowWarning(false)}
                className="mt-4 text-white/20 text-[10px] font-bold uppercase hover:text-white transition-colors"
              >
                Dismiss & Re-upload
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, sub, theme }: { icon: React.ReactNode, label: string, value: string, color: string, sub: string, theme: 'light' | 'dark' }) => (
  <div className={cn(
    "glass-card p-6 border transform hover:scale-105 transition-transform duration-300",
    theme === 'dark' ? "border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/40"
  )}>
    <div className={cn(
      "p-2 rounded-lg mb-4 inline-block transition-colors",
      theme === 'dark' ? "bg-white/5" : "bg-slate-50",
      color
    )}>
      {icon}
    </div>
    <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-1", theme === 'dark' ? "text-white/20" : "text-slate-400")}>{label}</p>
    <p className={`text-2xl font-black font-display uppercase tracking-tight ${color}`}>{value}</p>
    <p className={cn("text-[10px] font-black uppercase tracking-tighter mt-2", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{sub}</p>
  </div>
);

const HandsUp = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 11v-4a5 5 0 0 1 10 0v4" />
    <path d="M5 9v4a7 7 0 0 0 14 0V9" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);
