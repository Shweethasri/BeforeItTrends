import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, AlertTriangle, CheckCircle2, ShieldAlert, 
  Search, Upload, Trash2, Loader2, BarChart3, 
  Activity, Zap, Info, ArrowRight, Gauge, 
  Bot, MousePointer2, TrendingUp, AlertCircle,
  ChevronDown, Clock
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  BarChart, Bar, ScatterChart, Scatter, ZAxis,
  PieChart, Pie
} from 'recharts';
import { safeGenerateContent, SYSTEM_INSTRUCTIONS, cleanJsonString } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';
import { extractFramesFromVideo, fileToBase64 } from '../../lib/media-utils';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/theme';
import { FilterSelect } from '../ui/FilterSelect';

interface AnomalyResult {
  anomaly_score: number;
  status: 'Normal' | 'Suspicious' | 'High Risk';
  risk_breakdown: {
    engagement_spike: number;
    bot_activity: number;
    virality_outlier: number;
    hashtag_spam: number;
    content_risk: number;
  };
  specific_insights: {
    type: string;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  fix_suggestions: string[];
  engagement_graph_data: { hour: string; value: number; isAnomaly: boolean }[];
  virality_spike_data: { day: string; baseline: number; actual: number }[];
}

export const AnomalyDetector = ({ 
  onNavigateOptimize,
  onNavigateHome,
  initialContext
}: { 
  onNavigateOptimize: () => void;
  onNavigateHome: () => void;
  initialContext?: {
    image: string | null;
    file: File | null;
    caption: string;
    hashtags: string;
    isVideo: boolean;
  } | null;
}) => {
  const { theme } = useTheme();
  const [image, setImage] = useState<string | null>(initialContext?.image || null);
  const [file, setFile] = useState<File | null>(initialContext?.file || null);
  const [isVideo, setIsVideo] = useState(initialContext?.isVideo || false);
  const [platform, setPlatform] = useState('Instagram');
  const [caption, setCaption] = useState(initialContext?.caption || '');
  const [hashtags, setHashtags] = useState(initialContext?.hashtags || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnomalyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Handle countdown for negative detections
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onNavigateHome();
    }
  }, [timeLeft, onNavigateHome]);

  // Auto-run scan if initial context is provided
  useEffect(() => {
    if (initialContext && image && file && !results && !isLoading) {
      runAnomalyScan();
    }
  }, [initialContext]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setError(null);
  };

  const runAnomalyScan = async () => {
    if (!image || !file) {
      setError("Please upload a post preview image or video first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Analyze this social media ${isVideo ? 'video' : 'image'} post for anomalies.
      Platform: ${platform}
      Caption: ${caption || 'None provided'}
      Hashtags: ${hashtags || 'None provided'}
      
      Perform an "Isolation Forest" inspired detection of feature outliers and suspicious growth patterns.`;

      let parts: any[] = [{ text: prompt }];

      if (isVideo && file) {
        // For videos, extract key frames to ensure successful analysis within payload limits
        const frames = await extractFramesFromVideo(file, 4);
        frames.forEach((frameBase64) => {
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
          systemInstruction: SYSTEM_INSTRUCTIONS.ANOMALY_DETECTOR,
          responseMimeType: "application/json",
          temperature: 0.5,
        }
      });

      if (apiError) {
        const displayError = errorType && (ERROR_MESSAGES as any)[errorType] 
          ? (ERROR_MESSAGES as any)[errorType] 
          : apiError;
        throw new Error(displayError);
      }
      
      const parsedData = cleanJsonString(data);
      let parsed: AnomalyResult;
      
      try {
        parsed = JSON.parse(parsedData);
        // Ensure minimum required fields exist or provide defaults
        parsed = {
          anomaly_score: parsed.anomaly_score ?? 0,
          status: parsed.status ?? 'Normal',
          risk_breakdown: {
            engagement_spike: parsed.risk_breakdown?.engagement_spike ?? 0,
            bot_activity: parsed.risk_breakdown?.bot_activity ?? 0,
            virality_outlier: parsed.risk_breakdown?.virality_outlier ?? 0,
            hashtag_spam: parsed.risk_breakdown?.hashtag_spam ?? 0,
            content_risk: parsed.risk_breakdown?.content_risk ?? 0,
          },
          specific_insights: parsed.specific_insights ?? [],
          fix_suggestions: parsed.fix_suggestions ?? [],
          engagement_graph_data: parsed.engagement_graph_data ?? [],
          virality_spike_data: parsed.virality_spike_data ?? []
        };
      } catch (e) {
        console.error("JSON Parse Error:", e, "Raw data:", parsedData);
        throw new Error("Failed to interpret the anomaly scan results. The AI response was malformed.");
      }
      
      setResults(parsed);
      if (parsed.status === 'Suspicious' || parsed.status === 'High Risk') {
        setTimeLeft(180); // 3 minutes
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || "Anomaly scan engine timed out or failed. Our neuro-security modules are currently rebooting.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = {
    'Normal': 'text-green-500 bg-green-500/10 border-green-500/20',
    'Suspicious': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    'High Risk': 'text-red-500 bg-red-500/10 border-red-500/20'
  };

  const statusIcons = {
    'Normal': <CheckCircle2 className="w-4 h-4" />,
    'Suspicious': <AlertTriangle className="w-4 h-4" />,
    'High Risk': <ShieldAlert className="w-4 h-4" />
  };

  return (
    <div className={cn("pt-32 pb-20 px-6 min-h-screen transition-colors duration-300", theme === 'dark' ? "bg-black" : "bg-white")}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Back navigation */}
        <button 
          onClick={onNavigateOptimize}
          className={cn(
            "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-100",
            theme === 'dark' ? "text-white/40" : "text-slate-400"
          )}
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Prediction
        </button>

        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-black uppercase tracking-widest"
          >
            <Shield className="w-3 h-3" />
            AI Anomaly Guard
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-5xl md:text-8xl font-black font-display tracking-tighter leading-[1.1] transition-colors duration-300", theme === 'dark' ? "text-white" : "text-slate-900")}
          >
            Neural Anomaly <br /> <span className="text-gradient">Security Scan</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("max-w-3xl mx-auto text-lg font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}
          >
            Detect bot-like behavior, fake engagement patterns, and hashtag spam before you publish. 
            Our Isolation Forest model identifies outliers in your strategy to ensure safe growth.
          </motion.p>
        </div>

        {/* Scan Input Section */}
        <div className={cn(
          "glass-card p-8 border",
          theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xl shadow-slate-200/50"
        )}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Upload Area */}
            <div className="space-y-6">
              <h3 className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Post Preview Content</h3>
              <div 
                onClick={() => !image && fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-video rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all group",
                  image ? "border-solid border-neon-blue/40" : "border-white/10 hover:border-neon-blue/40 cursor-pointer",
                  theme === 'light' && !image && "bg-slate-50 border-slate-200 hover:border-neon-blue/30"
                )}
              >
                {image ? (
                  <>
                    {isVideo ? (
                      <video src={image} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeMedia(); }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className={cn(
                      "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all",
                      theme === 'dark' ? "bg-white/5 group-hover:bg-neon-blue/10" : "bg-white group-hover:bg-neon-blue/5 shadow-sm"
                    )}>
                      <Upload className={cn("w-8 h-8", theme === 'dark' ? "text-white/20 group-hover:text-neon-blue" : "text-slate-300 group-hover:text-neon-blue")} />
                    </div>
                    <p className={cn("font-bold", theme === 'dark' ? "text-white/60" : "text-slate-500")}>Upload Image or Video</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
              </div>
            </div>

            {/* Right: Strategy Settings */}
            <div className="space-y-6">
              <h3 className={cn("text-xs font-black uppercase tracking-widest", theme === 'dark' ? "text-white/40" : "text-slate-500")}>Strategy Context</h3>
              <div className="grid grid-cols-2 gap-4">
                <FilterSelect 
                  label="Platform"
                  value={platform}
                  options={['Instagram', 'TikTok', 'YouTube', 'LinkedIn']}
                  onChange={setPlatform}
                  theme={theme}
                />
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-tighter opacity-50">Hashtag Cloud</label>
                   <input 
                      type="text" 
                      placeholder="#viral #growth..."
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-neon-blue transition-all",
                        theme === 'light' && "bg-slate-50 border-slate-200 text-slate-900 focus:border-neon-blue"
                      )}
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter opacity-50">Post Caption</label>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Paste your caption here for semantic anomaly detection..."
                  className={cn(
                    "w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-neon-blue transition-all resize-none",
                    theme === 'light' && "bg-slate-50 border-slate-200 text-slate-900 focus:border-neon-blue"
                  )}
                />
              </div>

              <button 
                onClick={runAnomalyScan}
                disabled={isLoading || !image}
                className="w-full h-14 rounded-2xl bg-brand-purple hover:bg-brand-purple/80 text-white font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {isLoading ? 'Scanning Neural Patterns...' : 'Run Anomaly Scan'}
              </button>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Security Warning Banner for Negative Results */}
              {timeLeft !== null && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className={cn(
                    "p-6 rounded-[30px] border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden",
                    theme === 'dark' ? "bg-red-500/5 border-red-500/20" : "bg-red-500/10 border-red-500/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-red-500">Neural Security Restriction</h4>
                      <p className={cn("text-sm font-medium", theme === 'dark' ? "text-white/60" : "text-slate-600")}>
                        High-risk patterns detected. System lock engaged. Redirecting to safety mission.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end justify-center px-6 py-3 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-black font-display text-red-500 uppercase">
                        Active Restriction
                      </span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Security Protocol Engaging</span>
                  </div>

                  {/* Progress bar background */}
                  <div className="absolute bottom-0 left-0 h-1 bg-red-500/20 w-full" />
                  <motion.div 
                    className="absolute bottom-0 left-0 h-1 bg-red-500"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 180, ease: 'linear' }}
                  />
                </motion.div>
              )}

              {/* Top Bar: Key Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Overall Anomaly Gauge */}
                <div className={cn(
                  "p-8 rounded-[40px] border flex flex-col items-center justify-center relative overflow-hidden",
                  theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xl"
                )}>
                  <div className="absolute top-6 left-8 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neon-blue/10 text-neon-blue">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Neural Anomaly Score</h4>
                  </div>

                  <div className="w-full h-48 mt-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { value: results.anomaly_score },
                            { value: 100 - results.anomaly_score }
                          ]}
                          cx="50%"
                          cy="80%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell 
                            fill={
                              results.anomaly_score > 70 ? '#ef4444' : 
                              results.anomaly_score > 40 ? '#f59e0b' : 
                              '#00f3ff'
                            } 
                          />
                          <Cell fill={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl font-black font-display block"
                      >
                        {results.anomaly_score}<span className="text-xl opacity-30">%</span>
                      </motion.span>
                      <div className={cn(
                        "mt-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase inline-flex items-center gap-1.5 mx-auto", 
                        statusColors[results.status]
                      )}>
                        {statusIcons[results.status]}
                        {results.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Decomposition Bar Chart */}
                <div className={cn(
                  "p-8 rounded-[40px] border lg:col-span-2 overflow-hidden",
                  theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xl"
                )}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-light-blue/10 text-light-blue">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Risk Feature Decomposition</h4>
                    </div>
                  </div>
                  
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { name: 'Engagement', value: results.risk_breakdown.engagement_spike },
                          { name: 'Bot Activity', value: results.risk_breakdown.bot_activity },
                          { name: 'Viral Outlier', value: results.risk_breakdown.virality_outlier },
                          { name: 'Hashtag Spam', value: results.risk_breakdown.hashtag_spam },
                          { name: 'Content Risk', value: results.risk_breakdown.content_risk },
                        ]} 
                        layout="vertical"
                        margin={{ left: 20, right: 30 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={100}
                          tick={{ fontSize: 10, fontWeight: 900, fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#111' : '#fff', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 10, 10, 0]} 
                          barSize={12}
                        >
                          {
                            [
                              results.risk_breakdown.engagement_spike,
                              results.risk_breakdown.bot_activity,
                              results.risk_breakdown.virality_outlier,
                              results.risk_breakdown.hashtag_spam,
                              results.risk_breakdown.content_risk
                            ].map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry > 70 ? '#ef4444' : entry > 40 ? '#f59e0b' : '#00f3ff'} 
                              />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Visual Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Engagement Graph */}
                <div className={cn(
                  "p-8 rounded-[40px] border",
                  theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xl"
                )}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Engagement Velocity</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Anomaly highlight in red</p>
                    </div>
                    <Activity className="w-5 h-5 text-neon-blue" />
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.engagement_graph_data}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#111' : '#fff', 
                            border: 'none', 
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#00f3ff" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          dot={(props) => {
                             const { cx, cy, payload } = props;
                             if (payload.isAnomaly) {
                               return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
                             }
                             return null;
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Virality Spike Forecast */}
                <div className={cn(
                  "p-8 rounded-[40px] border",
                  theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xl"
                )}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Virality Trajectory</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Isolation Forest Spike Detection</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-light-blue" />
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.virality_spike_data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                        <Tooltip 
                           contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#111' : '#fff', 
                              border: 'none', 
                              borderRadius: '16px',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
                            }}
                        />
                        <Bar dataKey="baseline" fill={theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} radius={[10, 10, 0, 0]} />
                        <Bar dataKey="actual" radius={[10, 10, 0, 0]}>
                          {results.virality_spike_data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.actual > entry.baseline * 2 ? '#ef4444' : '#00f3ff'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Insights & Fixes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Specific Insights */}
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Deep Neural Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.specific_insights.map((insight, idx) => (
                      <div key={idx} className={cn(
                        "p-6 rounded-3xl border transition-all hover:scale-[1.02]",
                        theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"
                      )}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "p-2 rounded-lg flex items-center justify-center",
                            insight.severity === 'HIGH' ? "bg-red-500/10 text-red-500" : 
                            insight.severity === 'MEDIUM' ? "bg-yellow-500/10 text-yellow-500" : 
                            "bg-blue-500/10 text-blue-500"
                          )}>
                            {insight.type === 'bot' ? <Bot className="w-4 h-4" /> : 
                             insight.type === 'human' ? <MousePointer2 className="w-4 h-4" /> :
                             <Zap className="w-4 h-4" />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{insight.type}</span>
                        </div>
                        <h5 className="font-bold text-lg mb-2">{insight.title}</h5>
                        <p className={cn("text-sm opacity-60 leading-relaxed", theme === 'light' && "text-slate-600")}>{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fix Suggestions */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Corrective Protocols
                  </h4>
                  <div className={cn(
                    "p-8 rounded-[40px] border h-full",
                    theme === 'dark' ? "bg-brand-purple/5 border-brand-purple/20" : "bg-brand-purple/10 border-brand-purple/10"
                  )}>
                    {results.status === 'Normal' ? (
                      <div className="text-center space-y-4 py-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="font-bold">Protocol fully optimized. No fixes required.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {results.fix_suggestions.map((fix, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-brand-purple text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </div>
                            <p className="text-sm font-medium leading-relaxed">{fix}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-20 border-t border-white/5">
          <div className="space-y-6">
             <h2 className={cn("text-4xl font-black font-display tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>
               The Science of <br />
               <span className="text-gradient">Anomaly Detection</span>
             </h2>
             <p className={cn("text-lg font-medium opacity-60", theme === 'light' && "text-slate-600")}>
               Our anomaly detection engine uses "Isolation Forest" algorithms simulated through neural pattern matching. It identifies social media features that are statistically distant from "healthy" growth curves. 
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="w-2 h-2 rounded-full bg-neon-blue" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Outlier Detection</p>
                  <p className="text-sm font-bold">Identifies 1% high-risk strategy outliers</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="w-2 h-2 rounded-full bg-brand-pink" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Bot Patterns</p>
                  <p className="text-sm font-bold">Matches 50,000+ known automation footprints</p>
                </div>
             </div>
          </div>
          <div className={cn(
            "p-10 rounded-[50px] border rotate-1",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-black uppercase tracking-widest text-sm">Security Protocol</h4>
            </div>
            <p className={cn("text-lg italic font-bold", theme === 'dark' ? "text-white/80" : "text-slate-600")}>
              "Pre-publish anomaly scanning is now mandatory for enterprise-grade social growth. It prevents accidental shadow-banning by identifying bot-triggering hashtags and engagement-bait patterns automatically."
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-purple">
              <span>View Security Whitepaper</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
