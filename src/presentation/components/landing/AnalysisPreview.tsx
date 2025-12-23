'use client';
import { useState } from 'react';

export default function AnalysisPreview() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    { title: 'Visual Hierarchy & Layout', icon: '📐' },
    { title: 'CTA Placement & Clarity', icon: '🎯' },
    { title: 'Copy Readability & Tone', icon: '📝' },
    { title: 'Visual Distractions & Focus', icon: '👀' },
    { title: 'Friction Points & Flow', icon: '⚡' },
  ];

  return (
    <section className="py-24">
      <div className="section-container">
        <div className="rounded-3xl bg-orange-600 bg-[linear-gradient(110deg,#ea580c,#d97706)] p-8 md:p-12 lg:p-16 text-white shadow-2xl overflow-hidden relative">
           {/* Background noise/grid pattern could go here */}
           
           <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
              <div>
                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                   We analyze what matters most.
                 </h2>
                 <p className="text-orange-100 text-lg mb-8 max-w-lg">
                   {`Our AI doesn't just look for bugs. It evaluates the psychology and visual elements that drive user behavior.`}
                 </p>
                 
                 <div className="space-y-3">
                    {features.map((feature, idx) => (
                       <button
                         key={idx}
                         onClick={() => setActiveTab(idx)}
                         className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${activeTab === idx ? 'bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm' : 'hover:bg-white/10 border border-transparent'}`}
                       >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${activeTab === idx ? 'bg-white text-orange-600' : 'bg-white/10 text-white'}`}>
                             {feature.icon || idx + 1}
                          </div>
                          <span className="font-medium text-base md:text-lg">{feature.title}</span>
                       </button>
                    ))}
                 </div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-md shadow-2xl skew-y-1 transform transition-all duration-500 hover:skew-y-0">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <div className="text-xs font-semibold uppercase tracking-wider text-orange-100">Overall Score</div>
                       <div className="text-4xl font-bold text-white">78<span className="text-xl text-orange-100 font-normal">/100</span></div>
                    </div>
                    <div className="h-12 w-12 rounded-full border-4 border-orange-300 border-t-white flex items-center justify-center">
                       <span className="text-xs font-bold">B+</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-400/30">
                       <div className="text-xs font-bold text-orange-100 uppercase mb-1">High Priority</div>
                       <div className="text-sm font-medium text-white">Primary CTA lacks contrast against hero background.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-400/30">
                       <div className="text-xs font-bold text-yellow-100 uppercase mb-1">Medium Priority</div>
                       <div className="text-sm font-medium text-white">Value proposition text is too dense for scanning.</div>
                    </div>
                 </div>
                 
                 <button className="w-full mt-6 py-3 rounded-lg bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 transition-colors">
                    Generate Full Report
                 </button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
