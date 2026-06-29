import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, X, Bot, User, Loader2, 
  Sparkles, AlertCircle, Maximize2, Minimize2, 
  Mic, MicOff, Volume2, VolumeX, Info, RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { safeGenerateContent, SYSTEM_INSTRUCTIONS } from '../../lib/gemini';
import { ERROR_MESSAGES } from '../../lib/api-errors';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev.length > 0 ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError("Microphone access blocked. Click the lock icon in your address bar to allow access.");
        } else if (event.error === 'no-speech') {
          setMicError("No speech detected. Please try again.");
        } else {
          setMicError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const toggleVoiceTyping = async () => {
    setMicError(null);
    if (!recognitionRef.current) {
      setMicError("Voice typing not supported in this browser. Use Chrome for best experience.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.error("Mic permission denied:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicError("Mic access denied. Please enable it in browser settings (click the lock icon in address bar) and try again.");
        } else {
          setMicError("Could not access microphone. Please check your connection and settings.");
        }
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string, index: number) => {
    if (!synthRef.current) return;

    if (isSpeaking === index) {
      synthRef.current.cancel();
      setIsSpeaking(null);
      return;
    }

    synthRef.current.cancel();
    const cleanText = text.replace(/[*#_]/g, ''); // Remove markdown characters
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    synthRef.current.speak(utterance);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { data, error, errorType } = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.GROWTH_STRATEGIST,
          temperature: 0.8,
        }
      });

      if (error) {
        const friendlyMessage = errorType ? ERROR_MESSAGES[errorType] : "I'm having a technical glitch. Let me try that again.";
        setMessages((prev) => [...prev, { role: 'model', text: friendlyMessage }]);
      } else {
        setMessages((prev) => [...prev, { role: 'model', text: data || "I couldn't generate a strategy right now." }]);
      }
    } catch (err) {
      console.error('Chat Component Error:', err);
      setMessages((prev) => [...prev, { role: 'model', text: "Systems are currently unstable. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-brand-purple text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-pink rounded-full border-2 border-black" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isMaximized ? 'calc(100vw - 64px)' : '400px',
              height: isMaximized ? 'calc(100vh - 120px)' : '600px',
              maxWidth: isMaximized ? '1200px' : '400px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-8 right-8 z-50 glass-card flex flex-col overflow-hidden border-brand-purple/20 shadow-2xl transition-all duration-300 ease-in-out",
              !isMaximized && "w-[90vw] md:w-[400px]"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-purple/20 text-brand-purple">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">BeforeItTrends AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Online Growth Guard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white hidden md:block"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <Sparkles className="w-12 h-12 mb-4 text-brand-purple" />
                  <p className="text-sm font-medium">Hello creator! Ready to drop some viral content? Ask me anything about trending topics or platform strategies.</p>
                </div>
              )}
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: message.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2 rounded-lg h-fit ${message.role === 'user' ? 'bg-brand-purple/20 text-brand-purple' : 'bg-white/10 text-white'}`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      {message.role === 'model' && (
                        <button
                          onClick={() => speakText(message.text, i)}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            isSpeaking === i ? "bg-neon-blue/20 text-neon-blue" : "text-white/20 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {isSpeaking === i ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user' 
                        ? 'bg-brand-purple text-white shadow-lg' 
                        : 'bg-white/5 border border-white/10 text-white/80'
                    }`}>
                      {message.text.replace(/\*/g, '')}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="p-2 rounded-lg bg-white/10 text-white h-fit">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                      <span className="text-xs font-mono text-white/40">analyzing trends...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
              <AnimatePresence>
                {micError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-grow">
                        <p className="text-[11px] text-red-200 font-medium leading-relaxed">
                          {micError}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button 
                            onClick={toggleVoiceTyping}
                            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Try Again
                          </button>
                          <div className="w-px h-2 bg-red-500/20" />
                          <button 
                            onClick={() => setMicError(null)}
                            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask about your next viral post..."}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-20 text-sm text-white outline-none focus:border-brand-purple transition-all placeholder:text-white/20",
                    isListening && "border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleVoiceTyping}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      isListening ? "text-neon-blue bg-neon-blue/10 animate-pulse" : "text-white/20 hover:text-white"
                    )}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 text-brand-purple hover:text-brand-pink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
              <p className="mt-2 text-[10px] text-center text-white/20 font-medium">
                BeforeItTrends AI can make mistakes. Triple check viral predictions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
