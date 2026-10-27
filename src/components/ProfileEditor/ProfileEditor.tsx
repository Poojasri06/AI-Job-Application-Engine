import React, { useState } from 'react';
import { User, Copy, Check, Download, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { defaultProfile, UserProfile } from '../../data/defaultProfile';

export const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [copied, setCopied] = useState(false);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');

  const jsonString = JSON.stringify(profile, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addCustomAnswer = () => {
    if (!newCustomKey) return;
    setProfile({
      ...profile,
      custom_answers: {
        ...profile.custom_answers,
        [newCustomKey.toLowerCase().replace(/\s+/g, '_')]: newCustomVal,
      },
    });
    setNewCustomKey('');
    setNewCustomVal('');
  };

  const removeCustomAnswer = (key: string) => {
    const updated = { ...profile.custom_answers };
    delete updated[key];
    setProfile({ ...profile, custom_answers: updated });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Candidate Data Payload</span>
              <span aria-hidden="true">·</span>
              <span>profile.json Configurator</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Applicant Profile & Config Manager
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Configure personal information, portfolio links, and custom employer question answers consumed directly by the Playwright ingestion pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download profile.json</span>
            </button>
          </div>
        </div>

        {/* Form and JSON Preview Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Core Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Resume File Path */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Resume Local Storage Path
              </h3>
              <div className="space-y-1 text-xs">
                <label className="block font-semibold text-slate-700">
                  Local PDF Path (relative to Python script or absolute):
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={profile.resume_path}
                      onChange={(e) => setProfile({ ...profile, resume_path: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Passed to <code className="font-mono text-slate-700">page.locator("input[type='file']").set_input_files(path)</code>.
                </p>
              </div>
            </div>

            {/* Web & Social URLs */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Profiles & Portfolio Links
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={profile.github_url}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    value={profile.portfolio_url}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Custom Question Answers */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Custom Question Answers & Demographic Rules
              </h3>

              <div className="space-y-2">
                {Object.entries(profile.custom_answers).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="space-y-0.5 max-w-md">
                      <span className="font-mono font-semibold text-slate-900 block truncate">
                        {key}
                      </span>
                      <span className="text-slate-600 truncate block">{val}</span>
                    </div>
                    <button
                      onClick={() => removeCustomAnswer(key)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Remove answer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Question Row */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="font-semibold text-slate-800">Add Custom Question Matcher:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Question keyword (e.g. sponsorship)"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Answer value (e.g. No)"
                    value={newCustomVal}
                    onChange={(e) => setNewCustomVal(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <button
                  onClick={addCustomAnswer}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md text-[11px] cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Attach Question Mapping</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live JSON Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800 flex flex-col h-[680px]">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono font-semibold">profile.json (Live Serialized)</span>
              <span className="text-[11px] text-emerald-400 font-mono">Valid JSON</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
                <code>{jsonString}</code>
              </pre>
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400">
              Saved automatically to memory. Click "Download profile.json" to save to your local engine directory.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
