import React from 'react';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';

const steps = [
  {
    number: '01',
    title: 'Select Platform & Niche',
    description: 'Choose which platform you want to target and the specific niche you operate in.'
  },
  {
    number: '02',
    title: 'AI Forecasts Trends',
    description: 'Our proprietary AI analyzes real-time data to forecast upcoming viral trends.'
  },
  {
    number: '03',
    title: 'Create & Go Viral',
    description: 'Use our AI-generated ideas and scripts to create high-impact content that gets noticed.'
  }
];

export const Workflow = () => {
  const { theme } = useTheme();

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className={cn("text-4xl md:text-6xl font-black font-display mb-6 tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
            Virality Simplified in 3 Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="relative group">
              <div className={cn(
                "text-[120px] font-black font-display absolute -top-16 -left-8 transition-all",
                theme === 'dark' ? "text-white/[0.03] group-hover:text-neon-blue/10" : "text-black/[0.03] group-hover:text-neon-blue/10"
              )}>
                {step.number}
              </div>
              <div className="relative z-10">
                <h3 className={cn("text-2xl font-bold mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>{step.title}</h3>
                <p className={cn("text-lg leading-relaxed", theme === 'dark' ? "text-white/40" : "text-slate-500")}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
