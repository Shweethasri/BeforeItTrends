import React from 'react';
import { Hero } from './Hero';
import { TrendsMarquee } from './TrendsMarquee';
import { Features } from './Features';
import { TechStack } from './TechStack';
import { Workflow } from './Workflow';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

export const LandingPage = ({ onStart, onPageChange }: { onStart: () => void, onPageChange: (page: string) => void }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex flex-col w-full transition-colors duration-300", theme === 'dark' ? "bg-black" : "bg-white")}>
      <Hero onStart={onStart} />
      <TrendsMarquee />
      <Features onPageChange={onPageChange} />
      <TechStack />
      <Workflow />
    </div>
  );
};
