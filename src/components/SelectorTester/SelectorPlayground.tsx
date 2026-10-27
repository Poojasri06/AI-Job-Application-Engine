import React, { useState } from 'react';
import { Sliders, Search, CheckCircle2, AlertTriangle, Cpu, Plus, Code, ArrowRight } from 'lucide-react';
import { ATS_SELECTOR_RULES, FieldSelectorRule } from '../../data/atsSelectorMap';

export const SelectorPlayground: React.FC = () => {
  const [rules, setRules] = useState<FieldSelectorRule[]>(ATS_SELECTOR_RULES);
  const [testHtmlInput, setTestHtmlInput] = useState<string>(
    '<input type="text" id="candidate_first_name" name="first-name" placeholder="Given Name" autocomplete="given-name" />'
  );
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>('first_name');

  // Custom rule creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleKey, setNewRuleKey] = useState('');
  const [newRuleLabel, setNewRuleLabel] = useState('');
  const [newRuleAttrs, setNewRuleAttrs] = useState('');

  // Diagnostic evaluator for test HTML
  const evaluateInputAgainstRules = () => {
    // Parse attributes from the test HTML string using regex
    const idMatch = testHtmlInput.match(/id=["']([^"']+)["']/i)?.[1] || '';
    const nameMatch = testHtmlInput.match(/name=["']([^"']+)["']/i)?.[1] || '';
    const placeholderMatch = testHtmlInput.match(/placeholder=["']([^"']+)["']/i)?.[1] || '';
    const ariaLabelMatch = testHtmlInput.match(/aria-label=["']([^"']+)["']/i)?.[1] || '';
    const autocompleteMatch = testHtmlInput.match(/autocomplete=["']([^"']+)["']/i)?.[1] || '';

    const results = rules.map((rule) => {
      let score = 0;
      const matchedStrategies: string[] = [];

      // Check ID
      if (idMatch && rule.patterns.ids.some((id) => idMatch.toLowerCase().includes(id.toLowerCase()))) {
        score = Math.max(score, 100);
        matchedStrategies.push(`Strategy 1: ID attribute '${idMatch}' matched pattern`);
      }

      // Check Name
      if (nameMatch && rule.patterns.names.some((name) => nameMatch.toLowerCase().includes(name.toLowerCase()))) {
        score = Math.max(score, 95);
        matchedStrategies.push(`Strategy 1: Name attribute '${nameMatch}' matched pattern`);
      }

      // Check Labels/Placeholders
      if (placeholderMatch && rule.patterns.placeholders.some((ph) => placeholderMatch.toLowerCase().includes(ph.toLowerCase()))) {
        score = Math.max(score, 85);
        matchedStrategies.push(`Strategy 3: Placeholder '${placeholderMatch}' matched`);
      }

      // Check Aria-Label
      if (ariaLabelMatch && rule.patterns.ariaLabels.some((al) => ariaLabelMatch.toLowerCase().includes(al.toLowerCase()))) {
        score = Math.max(score, 80);
        matchedStrategies.push(`Strategy 3B: Aria-label '${ariaLabelMatch}' matched`);
      }

      // Check Autocomplete
      if (autocompleteMatch && rule.patterns.autocomplete.some((ac) => autocompleteMatch.toLowerCase().includes(ac.toLowerCase()))) {
        score = Math.max(score, 75);
        matchedStrategies.push(`Strategy 4: Autocomplete '${autocompleteMatch}' matched`);
      }

      return {
        rule,
        score,
        matchedStrategies,
        isMatch: score >= 75,
      };
    });

    return results.sort((a, b) => b.score - a.score);
  };

  const evaluationResults = evaluateInputAgainstRules();
  const topMatch = evaluationResults[0]?.score >= 70 ? evaluationResults[0] : null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleKey || !newRuleLabel) return;

    const attrList = newRuleAttrs.split(',').map((s) => s.trim()).filter(Boolean);
    const newRule: FieldSelectorRule = {
      key: newRuleKey.toLowerCase().replace(/\s+/g, '_'),
      label: newRuleLabel,
      required: false,
      type: 'text',
      patterns: {
        ids: attrList,
        names: attrList,
        placeholders: [newRuleLabel],
        labels: [newRuleLabel],
        ariaLabels: [newRuleLabel],
        autocomplete: [],
      },
      greenhouseDefault: `input[name*='${newRuleKey}']`,
      leverDefault: `input[name*='${newRuleKey}']`,
    };

    setRules([...rules, newRule]);
    setNewRuleKey('');
    setNewRuleLabel('');
    setNewRuleAttrs('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Heuristic Rule Engine</span>
              <span aria-hidden="true">·</span>
              <span>Scoring Waterfall & Fallback Diagnostics</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Smart Selector Diagnostics & Tester
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Inspect how the Python Smart Selector Engine ranks attributes, test custom HTML snippets, and configure new field heuristics for custom ATS application questions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Field Rule</span>
          </button>
        </div>

        {/* Live Input Sandbox Tester */}
        <div className="pt-6 space-y-4">
          <label className="block text-xs font-bold text-slate-800">
            Test HTML Input Element (Paste any ATS markup to evaluate confidence):
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={testHtmlInput}
              onChange={(e) => setTestHtmlInput(e.target.value)}
              className="w-full font-mono text-xs p-3 bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder='<input id="first-name" name="candidate[first_name]" placeholder="First Name" />'
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Try presets:</span>
            <button
              onClick={() =>
                setTestHtmlInput(
                  '<input type="text" id="first_name" name="first_name" placeholder="First Name" autocomplete="given-name" />'
                )
              }
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer text-[11px] font-mono"
            >
              Greenhouse #first_name
            </button>
            <button
              onClick={() =>
                setTestHtmlInput(
                  '<input type="text" name="name" placeholder="Full name" autocomplete="name" />'
                )
              }
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer text-[11px] font-mono"
            >
              Lever name="name"
            </button>
            <button
              onClick={() =>
                setTestHtmlInput(
                  '<input type="file" id="resume_file" name="job_application[resume]" data-qa="resume-upload" />'
                )
              }
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer text-[11px] font-mono"
            >
              Resume File Input
            </button>
            <button
              onClick={() =>
                setTestHtmlInput(
                  '<input type="url" name="urls[LinkedIn]" placeholder="https://linkedin.com/in/..." />'
                )
              }
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer text-[11px] font-mono"
            >
              Lever URLs[LinkedIn]
            </button>
            <button
              onClick={() =>
                setTestHtmlInput(
                  '<textarea id="why_stripe" name="custom_question_491" placeholder="Why are you applying?"></textarea>'
                )
              }
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md transition-colors cursor-pointer text-[11px] font-mono"
            >
              Unmapped Custom Field (Fallback)
            </button>
          </div>

          {/* Test Evaluation Result Callout */}
          <div className="pt-2">
            {topMatch ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">
                      Resolved Target Field: <span className="font-mono">{topMatch.rule.label} ({topMatch.rule.key})</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {topMatch.score}% Confidence
                  </span>
                </div>
                <div className="space-y-1 text-xs text-emerald-800">
                  {topMatch.matchedStrategies.map((strat, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-mono text-[11px]">
                      <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{strat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Heuristic Fallback Triggered (&lt;70% Confidence)</span>
                </div>
                <p className="text-xs text-amber-800">
                  No standard heuristic rule matched this element with high confidence. The Python engine will log a colored warning to stdout and flag this field for manual supervisor input prior to submit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              Active ATS Field Heuristic Rules ({rules.length})
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated sequentially by <code className="font-mono text-[11px]">SmartSelectorEngine.find_field_locator()</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Field Key</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Attribute Synonyms (ID / Name)</th>
                <th className="py-3 px-4">Label & Placeholder Heuristics</th>
                <th className="py-3 px-4">Greenhouse Default</th>
                <th className="py-3 px-4">Lever Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rules.map((r) => (
                <tr key={r.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {r.key}
                    {r.required && <span className="text-rose-500 ml-1">*</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                    {r.patterns.names.slice(0, 3).join(', ')}
                    {r.patterns.names.length > 3 && '...'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {r.patterns.labels.slice(0, 2).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-indigo-700">
                    {r.greenhouseDefault}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-emerald-700">
                    {r.leverDefault}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Add Custom Field Heuristic</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Identifier Key:</label>
                <input
                  type="text"
                  placeholder="e.g. salary_expectation or work_authorization"
                  value={newRuleKey}
                  onChange={(e) => setNewRuleKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Label Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Desired Salary"
                  value={newRuleLabel}
                  onChange={(e) => setNewRuleLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attribute Substrings (comma separated):
                </label>
                <input
                  type="text"
                  placeholder="salary, compensation, desired_salary, expectation"
                  value={newRuleAttrs}
                  onChange={(e) => setNewRuleAttrs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
