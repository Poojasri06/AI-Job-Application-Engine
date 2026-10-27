import React from 'react';
import { Terminal, Download, Code2, Play, Sliders, User, Compass } from 'lucide-react';

interface TopNavProps {
  activeTab: 'script' | 'simulator' | 'selector' | 'profile' | 'codegen';
  setActiveTab: (tab: 'script' | 'simulator' | 'selector' | 'profile' | 'codegen') => void;
  onDownloadAll: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, onDownloadAll }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              AutoApply Playwright
            </span>
          </div>

          {/* Zone 2: Navigation Links (Single-line, unboxed) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('script')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'script' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 py-5 -mb-px' : ''
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Python Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'simulator' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 py-5 -mb-px' : ''
              }`}
            >
              <Play className="w-4 h-4" />
              <span>ATS Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('selector')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'selector' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 py-5 -mb-px' : ''
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Selector Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'profile' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 py-5 -mb-px' : ''
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Config</span>
            </button>

            <button
              onClick={() => setActiveTab('codegen')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'codegen' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 py-5 -mb-px' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Codegen Guide</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onDownloadAll}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-sm active:translate-y-px"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Suite</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
