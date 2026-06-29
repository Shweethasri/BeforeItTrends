import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/home/LandingPage';
import { PostOptimizer } from './components/optimizer/PostOptimizer';
import { TrendingDashboard } from './components/trending/TrendingDashboard';
import { CaptionGenerator } from './components/captions/CaptionGenerator';
import { POVGenerator } from './components/pov/POVGenerator';
import { BioGenerator } from './components/bio/BioGenerator';
import { TemplateLibrary } from './components/library/TemplateLibrary';
import { AnomalyDetector } from './components/anomaly/AnomalyDetector';
import { ChatBot } from './components/chat/ChatBot';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [initialCaptionContext, setInitialCaptionContext] = useState('');
  const [optimizerContext, setOptimizerContext] = useState<{
    image: string | null;
    file: File | null;
    caption: string;
    hashtags: string;
    isVideo: boolean;
  } | null>(null);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const navigateToCaptions = (context: string) => {
    setInitialCaptionContext(context);
    setCurrentPage('captions');
  };

  const handleOptimizationComplete = (context: {
    image: string | null;
    file: File | null;
    caption: string;
    hashtags: string;
    isVideo: boolean;
  }) => {
    setOptimizerContext(context);
    setCurrentPage('anomaly');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-purple/30">
      <Navbar 
        currentPage={currentPage} 
        onPageChange={(page) => {
          setCurrentPage(page);
          if (page !== 'captions') setInitialCaptionContext('');
          if (page !== 'anomaly' && page !== 'post-optimizer') setOptimizerContext(null);
        }} 
      />
      
      <main className="flex-grow">
        {currentPage === 'home' && (
          <LandingPage onStart={() => setCurrentPage('post-optimizer')} onPageChange={setCurrentPage} />
        )}
        {currentPage === 'post-optimizer' && (
          <PostOptimizer 
            onNavigateHome={() => setCurrentPage('home')} 
            onNavigateAnomaly={() => setCurrentPage('anomaly')}
            onOptimizationComplete={handleOptimizationComplete}
          />
        )}
        {currentPage === 'trending' && (
          <TrendingDashboard onAction={navigateToCaptions} />
        )}
        {currentPage === 'captions' && (
          <CaptionGenerator initialContext={initialCaptionContext} />
        )}
        {currentPage === 'pov' && (
          <POVGenerator />
        )}
        {currentPage === 'bio' && (
          <BioGenerator />
        )}
        {currentPage === 'library' && (
          <TemplateLibrary />
        )}
        {currentPage === 'anomaly' && (
          <AnomalyDetector 
            onNavigateOptimize={() => setCurrentPage('post-optimizer')} 
            onNavigateHome={() => setCurrentPage('home')}
            initialContext={optimizerContext}
          />
        )}
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
}
