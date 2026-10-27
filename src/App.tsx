import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { PythonScriptViewer } from './components/PythonScriptViewer';
import { LiveAtsSimulator } from './components/Simulator/LiveAtsSimulator';
import { SelectorPlayground } from './components/SelectorTester/SelectorPlayground';
import { ProfileEditor } from './components/ProfileEditor';
import { CodegenGuide } from './components/CodegenGuide/CodegenGuide';
import { PYTHON_ASYNC_SCRIPT, PROFILE_JSON, REQUIREMENTS_TXT, CODEGEN_GUIDE_MD, PYTHON_SYNC_SCRIPT } from './data/pythonCode';

export default function App() {
  const [activeTab, setActiveTab] = useState<'script' | 'simulator' | 'selector' | 'profile' | 'codegen'>('script');

  const handleDownloadAll = () => {
    // Download primary files as a package
    const downloadFile = (filename: string, content: string) => {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    downloadFile('ats_applier.py', PYTHON_ASYNC_SCRIPT);
    setTimeout(() => downloadFile('profile.json', PROFILE_JSON), 250);
    setTimeout(() => downloadFile('requirements.txt', REQUIREMENTS_TXT), 500);
    setTimeout(() => downloadFile('ats_applier_sync.py', PYTHON_SYNC_SCRIPT), 750);
    setTimeout(() => downloadFile('codegen_guide.md', CODEGEN_GUIDE_MD), 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Strict Top Bar Contract Header */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadAll={handleDownloadAll}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'script' && (
          <PythonScriptViewer onGoToSimulator={() => setActiveTab('simulator')} />
        )}

        {activeTab === 'simulator' && <LiveAtsSimulator />}

        {activeTab === 'selector' && <SelectorPlayground />}

        {activeTab === 'profile' && <ProfileEditor />}

        {activeTab === 'codegen' && <CodegenGuide />}
      </main>

      {/* Clean Footer (No fake telemetry tickers or AI slop) */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AutoApply Playwright Engine</span>
            <span aria-hidden="true">·</span>
            <span>Targeting Greenhouse.io & Lever.co</span>
            <span aria-hidden="true">·</span>
            <span>Python 3.10+</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('script')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Python Script
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Live Simulator
            </button>
            <button
              onClick={() => setActiveTab('codegen')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Codegen Cheat Sheet
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
