import React, { useState } from 'react';
import { Instagram, Youtube, Twitter, Facebook, Mail, MapPin } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';

interface ContentItem {
  title: string;
  content: React.ReactNode;
}

const CONTENT_MAP: Record<string, ContentItem> = {
  'Trend Forecast': {
    title: 'Trend Forecast',
    content: (
      <div className="space-y-4">
        <p>Our advanced AI models analyze millions of data points across social platforms to predict what will go viral next.</p>
        <p>Stay ahead of the curve with real-time insights into emerging sounds, topics, and visual styles before they hit the mainstream.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Real-time trend alerts</li>
          <li>Saturated market analysis</li>
          <li>Platform-specific growth signals</li>
        </ul>
      </div>
    )
  },
  'Post Optimizer': {
    title: 'Post Optimizer',
    content: (
      <div className="space-y-4">
        <p>Maximize your reach with AI-powered content analysis. Our engine provides specific feedback on your hooks, captions, and timing.</p>
        <p>We use historical performance data to predict how your specific audience will react to different content styles.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Hook strength analysis</li>
          <li>A/B testing suggestions</li>
          <li>Optimal posting schedules</li>
        </ul>
      </div>
    )
  },
  'Repurpose Engine': {
    title: 'Repurpose Engine',
    content: (
      <div className="space-y-4">
        <p>One video, infinite possibilities. Automatically transform your long-form content into platform-specific short-form clips.</p>
        <p>Our engine identifies the most engaging moments in your footage and crops them perfectly for vertical viewing.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Smart AI cropping</li>
          <li>Auto-captioning in multiple languages</li>
          <li>Keyword-based highlight detection</li>
        </ul>
      </div>
    )
  },
  'Pricing': {
    title: 'Pricing Plans',
    content: (
      <div className="space-y-4">
        <p>We offer flexible plans designed for every stage of your creative journey.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <h5 className="font-bold mb-1">Starter</h5>
            <p className="text-xs opacity-60 mb-2">For growing creators</p>
            <p className="font-bold text-lg text-neon-blue">$29/mo</p>
          </div>
          <div className="p-4 rounded-xl border border-neon-blue/20 bg-neon-blue/5">
            <h5 className="font-bold mb-1">Pro</h5>
            <p className="text-xs opacity-60 mb-2">For professional creators</p>
            <p className="font-bold text-lg text-neon-blue">$79/mo</p>
          </div>
        </div>
      </div>
    )
  },
  'About Us': {
    title: 'About Us',
    content: (
      <div className="space-y-4">
        <p>Before It Trends (BIT) is dedicated to empowering creators with the data intelligence they need to succeed.</p>
        <p>Founded by a team of social media strategists and AI engineers, we believe that data should be accessible to everyone, not just large corporations.</p>
        <p>Located in the heart of Coimbatore at CIET, we are building the future of the creator economy.</p>
      </div>
    )
  },
  'Creators Journal': {
    title: 'Creators Journal',
    content: (
      <div className="space-y-4">
        <p>Stay informed with the latest strategies, interviews, and case studies from top creators.</p>
        <p>The Creators Journal is your go-to resource for mastering the art and science of content creation in the 21st century.</p>
      </div>
    )
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-4">
        <p>Your privacy is paramount. We handle your data with extreme care and transparency.</p>
        <p>Our policy outlines how we protect and use information to improve your experience while ensuring you maintain complete control over your social data.</p>
        <p>We never sell your data to third parties. Period.</p>
      </div>
    )
  },
  'Terms of Service': {
    title: 'Terms of Service',
    content: (
      <div className="space-y-4">
        <p>By using Before It Trends, you agree to our terms of service.</p>
        <p>We provide a safe, ethical environment for data-driven creativity. Our terms ensure fair usage and protect the intellectual property of our global community of creators.</p>
      </div>
    )
  }
};

export const Footer = () => {
  const { theme } = useTheme();
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const openModal = (key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveContent(key);
  };

  return (
    <footer className={cn(
      "py-20 px-6 border-t transition-colors duration-300",
      theme === 'dark' ? "border-white/5 bg-black" : "border-slate-200 bg-white"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold font-display italic tracking-tighter mb-6 block">
              <span className="text-neon-blue">Before</span>
              <span className={cn(theme === 'dark' ? "text-white" : "text-slate-900")}>It</span>
              <span className="text-light-blue">Trends</span>
            </span>
            <p className={cn("text-lg max-w-sm mb-8 font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
              The intelligence behind every viral post. 
              Predicting engagement before it happens.
            </p>
            <div className="flex gap-4">
              <SocialLink 
                href="https://www.instagram.com/before_it_trends_?igsh=emJ1N2ZuM2N6ZnJ0" 
                icon={<Instagram className="w-5 h-5" />} 
                theme={theme} 
              />
              <SocialLink 
                href="https://www.youtube.com/@BeforeItTrends-c2c" 
                icon={<Youtube className="w-5 h-5" />} 
                theme={theme} 
              />
              <SocialLink 
                href="https://x.com/BeforeItTrendss" 
                icon={<Twitter className="w-5 h-5" />} 
                theme={theme} 
              />
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} theme={theme} />
            </div>
          </div>

          <div>
            <h4 className={cn("font-bold mb-6 uppercase tracking-widest text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Product</h4>
            <ul className={cn("space-y-4 font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
              <li><a href="#" onClick={openModal('Trend Forecast')} className="hover:text-neon-blue transition-colors">Trend Forecast</a></li>
              <li><a href="#" onClick={openModal('Post Optimizer')} className="hover:text-neon-blue transition-colors">Post Optimizer</a></li>
              <li><a href="#" onClick={openModal('Repurpose Engine')} className="hover:text-neon-blue transition-colors">Repurpose Engine</a></li>
              <li><a href="#" onClick={openModal('Pricing')} className="hover:text-neon-blue transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className={cn("font-bold mb-6 uppercase tracking-widest text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Company</h4>
            <ul className={cn("space-y-4 font-medium", theme === 'dark' ? "text-white/40" : "text-slate-500")}>
              <li><a href="#" onClick={openModal('About Us')} className="hover:text-neon-blue transition-colors">About Us</a></li>
              <li><a href="#" onClick={openModal('Creators Journal')} className="hover:text-neon-blue transition-colors">Creators Journal</a></li>
              <li><a href="#" onClick={openModal('Privacy Policy')} className="hover:text-neon-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={openModal('Terms of Service')} className="hover:text-neon-blue transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className={cn(
          "pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-widest",
          theme === 'dark' ? "border-white/5 text-white/20" : "border-slate-200 text-slate-400"
        )}>
          <p>© {new Date().getFullYear()} Before It Trends. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> CIET , Coimbatore</span>
            <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> beforeittrends@gmail.com</span>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={!!activeContent} 
        onClose={() => setActiveContent(null)}
        title={activeContent ? CONTENT_MAP[activeContent].title : ''}
      >
        {activeContent && CONTENT_MAP[activeContent].content}
      </Modal>
    </footer>
  );
};


const SocialLink = ({ icon, theme, href }: { icon: React.ReactNode, theme: 'light' | 'dark', href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className={cn(
      "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
      theme === 'dark' 
        ? "border-white/10 text-white/40 hover:text-neon-blue hover:border-neon-blue hover:bg-neon-blue/5" 
        : "border-slate-200 text-slate-400 hover:text-neon-blue hover:border-neon-blue hover:bg-neon-blue/5 shadow-sm"
    )}
  >
    {icon}
  </a>
);
