import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2, Shield, Eye, Cpu, Terminal, ArrowRight } from 'lucide-react';
import { PYTHON_ASYNC_SCRIPT, PYTHON_SYNC_SCRIPT, PROFILE_JSON, REQUIREMENTS_TXT, CODEGEN_GUIDE_MD } from '../data/pythonCode';

interface PythonScriptViewerProps {
  onGoToSimulator: () => void;
}

export const PythonScriptViewer: React.FC<PythonScriptViewerProps> = ({ onGoToSimulator }) => {
  const [activeFile, setActiveFile] = useState<'async' | 'sync' | 'profile' | 'requirements' | 'codegen'>('async');
  const [copied, setCopied] = useState(false);

  const fileMap = {
    async: {
      name: 'ats_applier.py',
      lang: 'Python (Async API)',
      content: PYTHON_ASYNC_SCRIPT,
      desc: 'Full production-grade async Playwright script with human-jitter typing, bezier mouse paths, smart selector heuristics, resume file injection, and verification intercept.',
    },
    sync: {
      name: 'ats_applier_sync.py',
      lang: 'Python (Sync API)',
      content: PYTHON_SYNC_SCRIPT,
      desc: 'Lightweight synchronous Playwright implementation for developers who prefer standard procedural execution.',
    },
    profile: {
      name: 'profile.json',
      lang: 'JSON Configuration',
      content: PROFILE_JSON,
      desc: 'Structured applicant data model including contact info, URLs, work authorization, and custom demographic answers.',
    },
    requirements: {
      name: 'requirements.txt',
      lang: 'Pip Dependencies',
      content: REQUIREMENTS_TXT,
      desc: 'Pinned dependencies: playwright>=1.49.1 and playwright-stealth>=1.0.6.',
    },
    codegen: {
      name: 'codegen_guide.md',
      lang: 'Markdown',
      content: CODEGEN_GUIDE_MD,
      desc: 'Comprehensive Playwright Codegen workflow guide, iframe handling tricks, and hidden file input strategies.',
    },
  };

  const current = fileMap[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = current.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header & Blueprint Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Browser Automation Module</span>
              <span aria-hidden="true">·</span>
              <span>Python 3.10+</span>
              <span aria-hidden="true">·</span>
              <span>Playwright Async & Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              ATS Job Application Automation Engine
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Engineered specifically for tech applicant tracking systems (Greenhouse.io, Lever.co, Ashby).
              Operates in visible headful mode with realistic human typing delays, cubic bezier mouse arcs,
              multi-attribute selector fallback, PDF resume injection, and human-in-the-loop verification intercept.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={onGoToSimulator}
              className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Test in Live Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {current.name}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Anti-Bot Mitigation</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Chrome blink flags masked, webdriver overridden, cubic bezier mouse trajectories, and variable keystroke jitter.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Smart Selector Engine</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Multi-tiered heuristic waterfall: checks ID/Name variants, label for-attributes, placeholder regex, and aria-labels.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <FileCode className="w-4 h-4 text-amber-600" />
              <span>Direct File Injection</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Targets native file inputs via Playwright <code className="font-mono text-[11px] bg-slate-200/70 px-1 py-0.5 rounded">set_input_files</code> to bypass tricky hidden dropzone widgets.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Eye className="w-4 h-4 text-rose-600" />
              <span>Verification Intercept</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Human-in-the-loop safety intercept pauses execution before final submit, leaving browser responsive for manual review.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Quickstart Box */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Local Environment Quickstart</span>
          </div>
          <span>Python 3.10+</span>
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 select-all">
              pip install playwright playwright-stealth && playwright install chromium
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText('pip install playwright playwright-stealth && playwright install chromium');
              }}
              className="text-slate-400 hover:text-white text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 ml-3"
            >
              Copy
            </button>
          </div>
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-300 select-all">
              python ats_applier.py --url "https://boards.greenhouse.io/stripe/jobs/4251234" --profile profile.json
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText('python ats_applier.py --url "https://boards.greenhouse.io/stripe/jobs/4251234" --profile profile.json');
              }}
              className="text-slate-400 hover:text-white text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 ml-3"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel with File Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['async', 'sync', 'profile', 'requirements', 'codegen'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveFile(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeFile === key
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {fileMap[key].name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              {current.lang}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* File Description */}
        <div className="px-6 py-2.5 bg-slate-100/50 border-b border-slate-200 text-xs text-slate-600">
          {current.desc}
        </div>

        {/* Code Content Display */}
        <div className="relative bg-slate-950 text-slate-200 p-6 overflow-x-auto max-h-[640px]">
          <pre className="font-mono text-xs leading-relaxed">
            <code>{current.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
