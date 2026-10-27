import React, { useState } from 'react';
import { Compass, Terminal, Copy, Check, Shield, FileCode, Layers, MousePointer2, AlertCircle } from 'lucide-react';

export const CodegenGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commands = [
    {
      title: '1. Standard Codegen Launch (Headful Supervised)',
      desc: 'Opens the target application page in a Chromium browser alongside the Playwright Inspector UI. Every click and keystroke is recorded into Python code.',
      cmd: 'playwright codegen https://boards.greenhouse.io/stripe/jobs/4251234',
    },
    {
      title: '2. Emulate Realistic Desktop Viewport & Modern User-Agent',
      desc: 'Prevents mobile-layout shifts and avoids headless bot detection flags by spoofing standard desktop dimensions and Chrome user agent.',
      cmd: 'playwright codegen --viewport-size=1440,900 --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" https://jobs.lever.co/netflix/98f12a/apply',
    },
    {
      title: '3. Record Directly to Python Target Script',
      desc: 'Saves your recorded interactions directly into a clean Python file that can be inspected and integrated into your Smart Selector engine.',
      cmd: 'playwright codegen -o lever_recorded_flow.py https://jobs.lever.co/netflix/98f12a/apply',
    },
    {
      title: '4. Record With Persisted Storage State (Stay Logged In)',
      desc: 'Saves cookies and localStorage (e.g. for Workday or LinkedIn portals requiring pre-authenticated login sessions).',
      cmd: 'playwright codegen --save-storage=auth.json https://myworkdayjobs.com/...',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
          <span>Selector Engineering Manual</span>
          <span aria-hidden="true">·</span>
          <span>Reverse Engineering ATS DOMs</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Playwright Codegen Mastery & Tricky Selector Extraction
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          <code className="font-mono text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">playwright codegen</code> is the industry-standard tool for extracting tricky selectors, diagnosing shadow DOMs, and inspecting hidden dropzones when expanding your engine to new ATS platforms.
        </p>
      </div>

      {/* Commands Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Essential Codegen Terminal Commands
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {commands.map((c, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{c.title}</span>
                <span className="text-[11px] text-slate-500 font-mono">bash / zsh</span>
              </div>
              <p className="text-xs text-slate-600">{c.desc}</p>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                <span className="select-all pr-4">{c.cmd}</span>
                <button
                  onClick={() => copyCommand(c.cmd, idx)}
                  className="px-2.5 py-1 text-[11px] font-sans font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Senior Engineer Pro-Tips */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            Senior Automation Engineer Tactics: Navigating Complex ATS DOMs
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Common edge cases encountered when automating Greenhouse, Lever, and Workday forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edge Case 1: Hidden File Inputs */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>1. The Hidden File Dropzone Trap</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Greenhouse and Lever render stylized "Attach Resume" buttons that trigger native OS file pickers. If your Playwright script clicks this button, the script will freeze waiting for the OS dialog.
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-rose-400"># ❌ DON'T click the styled button</div>
              <div>await page.click("button:has-text('Attach')")</div>
              <div className="text-emerald-400 pt-1"># ✅ DO use set_input_files directly</div>
              <div>await page.locator("input[type='file']").set_input_files("resume.pdf")</div>
            </div>
          </div>

          {/* Edge Case 2: Embedded Iframes */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>2. Embedded Career Portal Iframes</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a company embeds Greenhouse into their primary marketing domain (e.g., <code className="font-mono text-slate-800">company.com/careers</code>), the form resides inside an <code className="font-mono text-slate-800">&lt;iframe id="grnhse_iframe"&gt;</code>.
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-emerald-400"># Use Playwright's FrameLocator</div>
              <div>frame = page.frame_locator("#grnhse_iframe")</div>
              <div>await frame.locator("#first_name").type("Alex")</div>
              <div>await frame.locator("#email").type("alex@example.com")</div>
            </div>
          </div>

          {/* Edge Case 3: Searchable Comboboxes */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <MousePointer2 className="w-4 h-4 text-amber-600" />
              <span>3. React-Select & Select2 Comboboxes</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Work location or nationality dropdowns frequently use custom React select components where native <code className="font-mono text-slate-800">select_option()</code> fails.
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-emerald-400"># Focus, type, and press enter</div>
              <div>await page.locator(".select__control").click()</div>
              <div>await page.keyboard.type("United States", delay=40)</div>
              <div>await page.keyboard.press("Enter")</div>
            </div>
          </div>

          {/* Edge Case 4: Anti-Bot Bypasses */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>4. Anti-Bot Mitigations & Turnstile</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Avoid immediate flags by removing <code className="font-mono text-slate-800">navigator.webdriver</code> and launching Chromium with <code className="font-mono text-slate-800">--disable-blink-features=AutomationControlled</code>. Keep the window headful so you can solve any occasional CAPTCHA manually.
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-emerald-400"># Launch with stealth flags</div>
              <div>browser = await p.chromium.launch(</div>
              <div className="pl-4">headless=False,</div>
              <div className="pl-4">args=["--disable-blink-features=AutomationControlled"]</div>
              <div>)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
