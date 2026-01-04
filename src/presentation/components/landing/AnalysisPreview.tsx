'use client';
import { useState } from 'react';

export default function AnalysisPreview() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    { title: 'Visual Hierarchy & Layout', icon: '≡ƒôÉ' },
    { title: 'CTA Placement & Clarity', icon: '≡ƒÄ»' },
    { title: 'Copy Readability & Tone', icon: '≡ƒô¥' },
    { title: 'Visual Distractions & Focus', icon: '≡ƒæÇ' },
    { title: 'Friction Points & Flow', icon: 'ΓÜí' },
  ];

  return (
    <section className="py-24">
      <div className="section-container px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-deep p-6 text-primary-foreground shadow-2xl md:p-12 lg:p-16">
           {/* Background noise/grid pattern could go here */}
           
           <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 items-center">
              <div className="w-full min-w-0">
                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                   We analyze what matters most.
                 </h2>
                 <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
                   {`We don't just look for bugs. We evaluate psychology and visual elements that drive user behavior.`}
                 </p>
                 
                 <div className="space-y-3">
                    {features.map((feature, idx) => (
                       <button
                         key={idx}
                         onClick={() => setActiveTab(idx)}
                         className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${activeTab === idx ? 'bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30 shadow-sm' : 'hover:bg-primary-foreground/10 border border-transparent'}`}
                       >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${activeTab === idx ? 'bg-primary-foreground text-accent' : 'bg-primary-foreground/10 text-primary-foreground'}`}>
                             {feature.icon || idx + 1}
                          </div>
                          <span className="font-medium text-base md:text-lg">{feature.title}</span>
                       </button>
                    ))}
                 </div>
              </div>
              
              <div className="bg-primary-foreground/10 rounded-2xl p-6 border border-primary-foreground/20 backdrop-blur-md shadow-2xl skew-y-1 transform transition-all duration-500 hover:skew-y-0 w-full min-w-0">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Overall Score</div>
                       <div className="text-4xl font-bold text-primary-foreground">78<span className="text-xl text-primary-foreground/80 font-normal">/100</span></div>
                    </div>
                    <div className="h-12 w-12 rounded-full border-4 border-primary-foreground/30 border-t-primary-foreground flex items-center justify-center">
                       <span className="text-xs font-bold">B+</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-status-error/15 border border-status-error/30">
                       <div className="text-xs font-bold text-primary-foreground/80 uppercase mb-1">High Priority</div>
                       <div className="text-sm font-medium text-primary-foreground">Primary CTA lacks contrast against hero background.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-status-warning/15 border border-status-warning/30">
                       <div className="text-xs font-bold text-primary-foreground/80 uppercase mb-1">Medium Priority</div>
                       <div className="text-sm font-medium text-primary-foreground">Value proposition text is too dense for scanning.</div>
                    </div>
                 </div>
                 
                 <button className="w-full mt-6 py-3 rounded-lg bg-primary-foreground text-accent-deep font-bold text-sm hover:bg-primary-foreground/90 transition-colors">
                    Generate Full Report
                 </button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
