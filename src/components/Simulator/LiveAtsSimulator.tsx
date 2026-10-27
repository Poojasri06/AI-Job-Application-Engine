import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Terminal, 
  Eye, 
  ShieldCheck, 
  MousePointer2, 
  Check, 
  Building2, 
  Globe, 
  Send
} from 'lucide-react';
import { defaultProfile, UserProfile } from '../../data/defaultProfile';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'stealth' | 'intercept';
  message: string;
}

export const LiveAtsSimulator: React.FC = () => {
  const [atsPlatform, setAtsPlatform] = useState<'greenhouse' | 'lever'>('greenhouse');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    currentCompany: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    customWhy: '',
    workAuth: '',
  });

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  
  // Automation execution state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [interceptActive, setInterceptActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Visual simulated cursor position
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 100,
    y: 100,
    visible: false,
  });

  // Highlighted field during automation
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);

  // References for bounding boxes
  const formRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs((prev) => [...prev, { id: Math.random().toString(), timestamp: timeStr, type, message }]);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phone: '',
      currentCompany: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      customWhy: '',
      workAuth: '',
    });
    setResumeUploaded(false);
    setResumeFileName('');
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setInterceptActive(false);
    setSubmitted(false);
    setActiveHighlightField(null);
    setCursorPos((prev) => ({ ...prev, visible: false }));
    setLogs([]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Type text character by character into a field
  const typeFieldAnimated = async (
    fieldKey: keyof typeof formData,
    targetValue: string,
    elementSelector: string
  ) => {
    setActiveHighlightField(fieldKey);
    // Find element on screen to move cursor to
    const el = document.querySelector(elementSelector) as HTMLElement | null;
    if (el && formRef.current) {
      const formRect = formRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setCursorPos({
        x: elRect.left - formRect.left + elRect.width / 2,
        y: elRect.top - formRect.top + elRect.height / 2,
        visible: true,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    await sleep(250);

    // Character by character simulation
    let currentText = '';
    for (let i = 0; i < targetValue.length; i++) {
      currentText += targetValue[i];
      setFormData((prev) => ({ ...prev, [fieldKey]: currentText }));
      // Human keystroke delay (40ms - 90ms)
      await sleep(35 + Math.floor(Math.random() * 50));
    }

    await sleep(200);
    setActiveHighlightField(null);
  };

  const runAutomation = async () => {
    if (isRunning) return;
    resetForm();
    setIsRunning(true);
    setInterceptActive(false);
    setSubmitted(false);

    addLog('info', 'Starting Playwright headful Chromium engine (args: --disable-blink-features=AutomationControlled)...');
    await sleep(400);

    addLog('stealth', 'Injected stealth scripts: navigator.webdriver masked, runtime mocks active.');
    await sleep(300);

    addLog('info', `Navigated to target ATS: https://jobs.${atsPlatform === 'greenhouse' ? 'greenhouse.io/stripe' : 'lever.co/netflix'}/apply`);
    await sleep(500);

    if (atsPlatform === 'greenhouse') {
      // Step 1: First Name
      addLog('info', 'Scanning for first_name: Matched #first_name via Strategy 1 (Attribute match: 100%)');
      await typeFieldAnimated('firstName', profile.first_name, '#first_name');
      addLog('success', `Injected 'first_name' -> '${profile.first_name}' (organic typing cadence)`);

      // Step 2: Last Name
      addLog('info', 'Scanning for last_name: Matched #last_name via Strategy 1 (Attribute match: 100%)');
      await typeFieldAnimated('lastName', profile.last_name, '#last_name');
      addLog('success', `Injected 'last_name' -> '${profile.last_name}'`);

      // Step 3: Email
      addLog('info', 'Scanning for email: Matched input[name="email"] via Strategy 1');
      await typeFieldAnimated('email', profile.email, '#email');
      addLog('success', `Injected 'email' -> '${profile.email}'`);

      // Step 4: Phone
      addLog('info', 'Scanning for phone: Matched input[name="phone"] via Strategy 2 (get_by_label)');
      await typeFieldAnimated('phone', profile.phone, '#phone');
      addLog('success', `Injected 'phone' -> '${profile.phone}'`);

      // Step 5: Resume Upload
      addLog('info', 'Locating file input: Matched input[type="file"][name*="resume"]');
      const resumeEl = document.querySelector('#resume_upload_input') as HTMLElement | null;
      if (resumeEl && formRef.current) {
        const formRect = formRef.current.getBoundingClientRect();
        const elRect = resumeEl.getBoundingClientRect();
        setCursorPos({
          x: elRect.left - formRect.left + elRect.width / 2,
          y: elRect.top - formRect.top + elRect.height / 2,
          visible: true,
        });
      }
      await sleep(450);
      setResumeUploaded(true);
      setResumeFileName('Alex_Chen_Resume_2026.pdf');
      addLog('success', 'Attached resume via page.set_input_files: "Alex_Chen_Resume_2026.pdf" (248 KB)');
      await sleep(400);

      // Step 6: LinkedIn
      addLog('info', 'Scanning for linkedin_url: Matched input[name*="linkedin"]');
      await typeFieldAnimated('linkedinUrl', profile.linkedin_url, '#linkedin_url');
      addLog('success', `Injected 'linkedin_url' -> '${profile.linkedin_url}'`);

      // Step 7: GitHub
      addLog('info', 'Scanning for github_url: Matched input[id*="github"]');
      await typeFieldAnimated('githubUrl', profile.github_url, '#github_url');
      addLog('success', `Injected 'github_url' -> '${profile.github_url}'`);

      // Step 8: Custom Question - Fallback demonstration
      addLog('warn', 'Fallback Triggered: Custom prompt "Why our infrastructure team?" could not be resolved with 100% confidence. Marked for manual supervisor review.');
      await sleep(400);

    } else {
      // Lever Platform Flow
      addLog('info', 'Scanning for full_name: Matched input[name="name"] via Strategy 1 (Lever standard)');
      await typeFieldAnimated('fullName', profile.full_name, '#lever_name');
      addLog('success', `Injected 'full_name' -> '${profile.full_name}'`);

      addLog('info', 'Scanning for email: Matched input[name="email"]');
      await typeFieldAnimated('email', profile.email, '#lever_email');
      addLog('success', `Injected 'email' -> '${profile.email}'`);

      addLog('info', 'Scanning for phone: Matched input[name="phone"]');
      await typeFieldAnimated('phone', profile.phone, '#lever_phone');
      addLog('success', `Injected 'phone' -> '${profile.phone}'`);

      addLog('info', 'Scanning for current_company: Matched input[name="org"]');
      await typeFieldAnimated('currentCompany', profile.current_company, '#lever_org');
      addLog('success', `Injected 'current_company' -> '${profile.current_company}'`);

      // Resume
      addLog('info', 'Locating file input: Matched input[name="resume"]');
      await sleep(450);
      setResumeUploaded(true);
      setResumeFileName('Alex_Chen_Resume_2026.pdf');
      addLog('success', 'Attached resume file: "Alex_Chen_Resume_2026.pdf"');
      await sleep(350);

      // URLs
      addLog('info', 'Scanning for LinkedIn: Matched input[name="urls[LinkedIn]"]');
      await typeFieldAnimated('linkedinUrl', profile.linkedin_url, '#lever_linkedin');
      addLog('success', `Injected 'urls[LinkedIn]'`);

      addLog('info', 'Scanning for GitHub: Matched input[name="urls[GitHub]"]');
      await typeFieldAnimated('githubUrl', profile.github_url, '#lever_github');
      addLog('success', `Injected 'urls[GitHub]'`);
    }

    // Scroll down to submit area
    addLog('intercept', 'Verification Intercept: All fields populated. Halting execution prior to Submit button.');
    setCursorPos((prev) => ({ ...prev, visible: false }));
    setIsRunning(false);
    setInterceptActive(true);
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Interactive Testbench</span>
            <span aria-hidden="true">·</span>
            <span>DOM Injection & Selector Heuristics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Live ATS Form Automation Simulator
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => {
                setAtsPlatform('greenhouse');
                resetForm();
              }}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
                atsPlatform === 'greenhouse'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Greenhouse.io
            </button>
            <button
              onClick={() => {
                setAtsPlatform('lever');
                resetForm();
              }}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
                atsPlatform === 'lever'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lever.co
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={runAutomation}
            disabled={isRunning}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
              isRunning
                ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executing Playwright Flow...' : 'Run Automation'}</span>
          </button>

          <button
            onClick={resetForm}
            disabled={isRunning}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {/* Main Split View: Simulator (Left) + Execution Telemetry Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Authentic ATS Form Replica (7 cols) */}
        <div
          ref={formRef}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative"
        >
          {/* Simulated Browser Chrome Bar */}
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                https://{atsPlatform === 'greenhouse' ? 'boards.greenhouse.io/stripe/jobs/4251234' : 'jobs.lever.co/netflix/98f12a/apply'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Headful 1440x900</span>
            </div>
          </div>

          {/* Virtual Simulated Mouse Cursor */}
          {cursorPos.visible && (
            <div
              className="absolute pointer-events-none transition-all duration-150 ease-out z-40 text-slate-900"
              style={{
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: 'translate(-2px, -2px)',
              }}
            >
              <MousePointer2 className="w-5 h-5 fill-slate-900 text-white drop-shadow-md" />
              <span className="text-[10px] font-mono bg-slate-900 text-white px-1 rounded absolute left-4 top-1 shadow-sm whitespace-nowrap">
                playwright cursor
              </span>
            </div>
          )}

          {/* ATS Job Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{atsPlatform === 'greenhouse' ? 'Stripe Engineering' : 'Netflix Core Infrastructure'}</span>
              <span aria-hidden="true">·</span>
              <Globe className="w-3.5 h-3.5" />
              <span>San Francisco, CA / Remote</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Staff Infrastructure & Automation Engineer
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Apply for this position below. Standard fields are automatically evaluated by the Smart Selector Engine.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5 text-sm">
            {atsPlatform === 'greenhouse' ? (
              /* GREENHOUSE FORM LAYOUT */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="first_name" className="text-xs font-semibold text-slate-700">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">id="first_name"</span>
                    </div>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First name"
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'firstName'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.firstName
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="last_name" className="text-xs font-semibold text-slate-700">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">id="last_name"</span>
                    </div>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last name"
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'lastName'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.lastName
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">id="email"</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      activeHighlightField === 'email'
                        ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                        : formData.email
                        ? 'border-slate-300 bg-slate-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">id="phone"</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      activeHighlightField === 'phone'
                        ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                        : formData.phone
                        ? 'border-slate-300 bg-slate-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  />
                </div>

                {/* Resume Upload Dropzone */}
                <div className="space-y-1.5" id="resume_upload_input">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Resume/CV <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">input[type="file"][name*="resume"]</span>
                  </div>

                  {resumeUploaded ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="text-xs font-bold text-emerald-950">{resumeFileName}</div>
                          <div className="text-[11px] text-emerald-700">248 KB · Attached via set_input_files</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Attached
                      </span>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <div className="text-xs font-medium text-slate-700">
                        Drop resume PDF here or target file input
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Supports PDF, DOCX (Max 10MB)</div>
                    </div>
                  )}
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="linkedin_url" className="text-xs font-semibold text-slate-700">
                        LinkedIn Profile
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">name*="linkedin"</span>
                    </div>
                    <input
                      id="linkedin_url"
                      name="job_application[answers_attributes][0][text_value]"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'linkedinUrl'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.linkedinUrl
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="github_url" className="text-xs font-semibold text-slate-700">
                        GitHub Profile
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">id*="github"</span>
                    </div>
                    <input
                      id="github_url"
                      name="job_application[answers_attributes][1][text_value]"
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'githubUrl'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.githubUrl
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Custom Greenhouse Question */}
                <div className="space-y-1 p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Custom Question: Why our infrastructure team?</span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-700">Manual review</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.customWhy}
                    onChange={(e) => setFormData({ ...formData, customWhy: e.target.value })}
                    placeholder="Explain your interest in our distributed systems..."
                    className="w-full px-3 py-2 text-xs border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="text-[11px] text-amber-800">
                    Engine detected an unmapped custom field. Flagged in console for human supervisor review.
                  </div>
                </div>
              </>
            ) : (
              /* LEVER FORM LAYOUT */
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="lever_name" className="text-xs font-semibold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">name="name"</span>
                  </div>
                  <input
                    id="lever_name"
                    name="name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="First and last name"
                    className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      activeHighlightField === 'fullName'
                        ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                        : formData.fullName
                        ? 'border-slate-300 bg-slate-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="lever_email" className="text-xs font-semibold text-slate-700">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">name="email"</span>
                    </div>
                    <input
                      id="lever_email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'email'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.email
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="lever_phone" className="text-xs font-semibold text-slate-700">
                        Phone <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">name="phone"</span>
                    </div>
                    <input
                      id="lever_phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'phone'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.phone
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Current Company */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="lever_org" className="text-xs font-semibold text-slate-700">
                      Current Company
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">name="org"</span>
                  </div>
                  <input
                    id="lever_org"
                    name="org"
                    type="text"
                    value={formData.currentCompany}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    placeholder="Current company"
                    className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      activeHighlightField === 'currentCompany'
                        ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                        : formData.currentCompany
                        ? 'border-slate-300 bg-slate-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  />
                </div>

                {/* Lever Resume */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Resume/CV <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">name="resume"</span>
                  </div>
                  {resumeUploaded ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="text-xs font-bold text-emerald-950">{resumeFileName}</div>
                          <div className="text-[11px] text-emerald-700">248 KB · Attached</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Attached
                      </span>
                    </div>
                  ) : (
                    <div className="border border-slate-300 rounded-lg p-3 text-xs text-slate-600 bg-slate-50">
                      Attach Resume / CV (.pdf, .doc)
                    </div>
                  )}
                </div>

                {/* Lever URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="lever_linkedin" className="text-xs font-semibold text-slate-700">
                        LinkedIn URL
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">name="urls[LinkedIn]"</span>
                    </div>
                    <input
                      id="lever_linkedin"
                      name="urls[LinkedIn]"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'linkedinUrl'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.linkedinUrl
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="lever_github" className="text-xs font-semibold text-slate-700">
                        GitHub URL
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">name="urls[GitHub]"</span>
                    </div>
                    <input
                      id="lever_github"
                      name="urls[GitHub]"
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className={`w-full px-3 py-2 text-xs border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        activeHighlightField === 'githubUrl'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30'
                          : formData.githubUrl
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* VERIFICATION INTERCEPT MODAL / BANNER */}
            {interceptActive && !submitted && (
              <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Verification Intercept Active</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">playwright paused</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The automation engine has successfully populated all mapped fields and attached the resume PDF.
                  The browser execution has halted right before the submit button so you can supervise, inspect, and manually click Submit.
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Form ready for submission
                  </span>
                  <button
                    onClick={() => {
                      setSubmitted(true);
                      addLog('success', 'Human supervisor clicked [Submit Application]. Application successfully transmitted.');
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submitted Success Confirmation */}
            {submitted && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">
                  Application Successfully Submitted!
                </h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Your supervisor verification was recorded. In the Python script, pressing [Enter] in the terminal now cleanly closes the headful browser session.
                </p>
              </div>
            )}

            {/* Default Inactive Submit Button */}
            {!interceptActive && !submitted && (
              <div className="pt-2">
                <button
                  disabled
                  className="w-full py-2.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed border border-slate-200"
                >
                  Submit Application (Automated intercept will pause here)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Execution Telemetry & Playwright Log Stream (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col h-[680px]">
          {/* Terminal Title Bar */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Playwright Live Telemetry</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              {logs.length} events
            </span>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 text-slate-300 bg-slate-950/90"
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2 p-6">
                <Terminal className="w-8 h-8 stroke-1" />
                <div className="text-xs">Engine Idle</div>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Click <span className="text-emerald-400 font-semibold">"Run Automation"</span> to watch the Smart Selector Engine, human typing jitter, and verification intercept stream live logs.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="leading-relaxed flex items-start gap-2 text-[11px]">
                  <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                  {log.type === 'info' && (
                    <span className="text-slate-300">
                      <span className="text-slate-400 font-semibold">[INFO]</span> {log.message}
                    </span>
                  )}
                  {log.type === 'stealth' && (
                    <span className="text-cyan-400">
                      <span className="font-semibold">[STEALTH]</span> {log.message}
                    </span>
                  )}
                  {log.type === 'success' && (
                    <span className="text-emerald-400">
                      <span className="font-semibold">[OK]</span> {log.message}
                    </span>
                  )}
                  {log.type === 'warn' && (
                    <span className="text-amber-400">
                      <span className="font-semibold">[FALLBACK]</span> {log.message}
                    </span>
                  )}
                  {log.type === 'intercept' && (
                    <span className="text-rose-400 font-semibold">
                      <span>[INTERCEPT]</span> {log.message}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Terminal Bottom Status Bar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div>
              Status:{' '}
              {isRunning ? (
                <span className="text-emerald-400 font-semibold">Injecting Fields...</span>
              ) : interceptActive && !submitted ? (
                <span className="text-rose-400 font-semibold">Verification Pause</span>
              ) : submitted ? (
                <span className="text-emerald-400 font-semibold">Submitted</span>
              ) : (
                <span className="text-slate-500">Ready</span>
              )}
            </div>
            <div>Mode: Headful (Chromium)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
