import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

const posts = [
  {
    title: "How to Hack the TikTok Algorithm in 2026",
    excerpt: "The logic behind short-form virality is changing. Here is what you need to know about the new engagement metrics.",
    date: "March 15, 2026",
    readTime: "5 min read",
    category: "Algorithm",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000",
    pythonCode: "import scrapy\n\nclass TikTokSpider(scrapy.Spider):\n    name = 'tiktok'\n    start_urls = ['https://www.tiktok.com/trending']\n\n    def parse(self, response):\n        for trend in response.css('.trend-item'):\n            yield {\n                'topic': trend.css('h2::text').get(),\n                'reach': trend.css('.stats::text').get()\n            }"
  },
  {
    title: "10 Viral Hooks That Work for Any Niche",
    excerpt: "Stop scrolling! We analyzed the first 3 seconds of 1,000 viral videos to find the ultimate hooks for your content.",
    date: "March 12, 2026",
    readTime: "8 min read",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000",
    pythonCode: "hooks = [\n    'You will not believe...', \n    'Stop scrolling if...', \n    'The secret to...'\n]\n\ndef generate_hook_website(hook):\n    return f'<h1>{hook}</h1><p>Viral strategy inside.</p>'\n\nprint([generate_hook_website(h) for h in hooks])"
  },
  {
    title: "AI & The Future of Content Creation",
    excerpt: "Creators who use AI will replace creators who don't. A deep dive into the tools shaping the next creator economy.",
    date: "March 10, 2026",
    readTime: "6 min read",
    category: "AI Tools",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
    pythonCode: "import google.generativeai as genai\n\ngenai.configure(api_key='YOUR_API_KEY')\nmodel = genai.GenerativeModel('gemini-1.5-pro')\n\nresponse = model.generate_content('Create a viral thread about AI')\nprint(response.text)"
  }
];

export const Blog = () => {
  const [showCode, setShowCode] = React.useState<string | null>(null);
  const { theme } = useTheme();

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="text-balance">
            <h2 className={cn("text-4xl md:text-6xl font-black font-display mb-6 tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Level Up Your <span className="text-gradient">Creator Intelligence</span>
            </h2>
            <p className={cn("text-lg md:text-xl max-w-xl font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
              Expert insights, algorithm updates, and viral strategies delivered weekly.
            </p>
          </div>
          <button className={cn(
            "px-8 py-4 rounded-full border transition-all font-bold group flex items-center gap-2",
            theme === 'dark' ? "border-white/10 hover:border-white/20 hover:bg-white/5 text-white" : "border-slate-200 hover:border-neon-blue hover:bg-slate-50 text-slate-900"
          )}>
            View All Posts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.title} className={cn(
              "flex flex-col glass-card border-white/5 transition-all group overflow-hidden",
              theme === 'dark' ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-white hover:shadow-xl hover:shadow-slate-200/50"
            )}>
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Code Overlay Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-white">
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-brand-purple/50 bg-black/20 p-1 rounded">
                    {'<img src="' + post.image.substring(0, 10) + '..." />'}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[8px] font-mono text-brand-pink/50 bg-black/20 p-1 rounded">
                    {'python_module.py [OK]'}
                  </div>
                </div>

                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                  {post.category}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className={cn("flex items-center gap-4 text-xs font-medium mb-4", theme === 'dark' ? "text-white/40" : "text-slate-400")}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>
                <h3 className={cn("text-2xl font-bold mb-4 transition-colors leading-tight", theme === 'dark' ? "text-white group-hover:text-brand-purple" : "text-slate-900 group-hover:text-neon-blue")}>
                  {post.title}
                </h3>
                <p className={cn("text-sm leading-relaxed mb-6 flex-grow", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
                  {post.excerpt}
                </p>
                
                {showCode === post.title ? (
                  <div className="mb-6 p-4 rounded-xl bg-black border border-white/10 font-mono text-[10px] text-green-400 overflow-x-auto whitespace-pre">
                    {post.pythonCode}
                  </div>
                ) : null}

                <div className="flex items-center justify-between mt-auto">
                  <button className={cn("flex items-center gap-2 font-bold text-sm group/link", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setShowCode(showCode === post.title ? null : post.title)}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-purple hover:text-brand-pink transition-colors"
                  >
                    {showCode === post.title ? '[ Hide Code ]' : '[ View Python Code ]'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
