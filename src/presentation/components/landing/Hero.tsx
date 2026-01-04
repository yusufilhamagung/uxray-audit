'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiResponse } from '@/shared/types/api';

export default function Hero() {
  const router = useRouter();
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [file, setFile] = useState<File | null>(null);
  const [heroUrl, setHeroUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) return;
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('page_type', 'Landing'); // Default
        
        const res = await fetch('/api/audit', { method: 'POST', body: formData });
        const data = (await res.json()) as ApiResponse<{ audit_id: string }>;
        
        if (!res.ok) throw new Error(data?.message || 'Gagal memproses audit.');
        
        if (data.data?.audit_id) {
            router.push(`/audit?id=${data.data.audit_id}`);
        }
    } catch (e) {
        console.error('Audit failed', e);
        alert('Gagal memproses audit. Silakan coba lagi.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pb-24 lg:pb-32">
      <div className="section-container flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="space-y-8 text-center max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
            Audited 24k+ sites
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your website looks <span className="text-primary">fine</span>.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent-deep bg-clip-text text-transparent">
              {`But why isn't it converting?`}
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {`Analyze your website's UX instantly. Get actionable insights and clear improvement steps in under 2 minutes. No consultants, no progress bars (actually, maybe some).`}
          </p>
          
          <div className="flex flex-col items-center gap-4 w-full">
             {/* Mode Toggles */}
             <div className="bg-surface-2 p-1 rounded-lg inline-flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                <button 
                   onClick={() => setMode('url')}
                   className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'url' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} w-full sm:w-auto`}
                >
                  Website URL
                </button>
                <button 
                  onClick={() => setMode('upload')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'upload' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} w-full sm:w-auto`}
                >
                  Upload Screenshot
                </button>
             </div>

             {/* URL Input Mode */}
             {mode === 'url' && (
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-lg mx-auto">
                  <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-subtle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. yoursite.com" 
                        value={heroUrl}
                        onChange={(e) => setHeroUrl(e.target.value)}
                        className="w-full rounded-full border border-input-border bg-input py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-subtle focus:border-ring focus:ring-2 focus:ring-ring/20"
                      />
                  </div>
                  <Link href={{ pathname: '/audit', query: { url: heroUrl } }} className="btn-primary w-full sm:w-auto text-center whitespace-nowrap">
                    Audit Now
                  </Link>
                </div>
             )}

             {/* Upload Input Mode */}
             {mode === 'upload' && (
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-lg mx-auto">
                  <div className="relative w-full">
                     <label className="flex flex-col items-center justify-center w-full h-[50px] border-2 border-input-border border-dashed rounded-full cursor-pointer bg-surface-2 hover:bg-surface-3 transition-colors overflow-hidden relative">
                        {file ? (
                          <div className="flex items-center gap-2 text-sm text-foreground px-4">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             <span className="truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                              <span className="hidden sm:inline">Click to upload or drag & drop</span>
                              <span className="sm:hidden">Tap to upload</span>
                          </div>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
                     </label>
                  </div>
                  <button 
                    disabled={!file || loading}
                    className="btn-primary w-full sm:w-auto text-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAnalyzeClick}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Screenshot'}
                  </button>
                </div>
             )}
          </div>
          
           <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                No signup required
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Free sample report
              </span>
           </div>
        </div>
      </div>
    </section>
  );
}

