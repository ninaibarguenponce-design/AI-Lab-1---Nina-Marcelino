import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
  ComplianceEvaluation,
  FinancialInputs,
  FinancialOutputs,
  NeighborhoodData,
  PropertyConfig
} from '../types';
import { generateDeterministicReport } from '../utils/calculator';
import { INSIDE_AIRBNB_DC_SUMMARY } from '../data/comparableListings';

interface ReportViewerProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  financials: FinancialOutputs;
  compliance: ComplianceEvaluation;
  neighborhood: NeighborhoodData;
  onBackToVerdict?: () => void;
  onContinueToNextSteps?: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  config,
  inputs,
  financials,
  compliance,
  neighborhood,
  onBackToVerdict,
  onContinueToNextSteps,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const deterministicReport = generateDeterministicReport(
    config,
    inputs,
    financials,
    compliance,
    neighborhood
  );

  const activeReport = aiReport || deterministicReport;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEnrichWithAI = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/advisor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyConfig: config,
          financialInputs: inputs,
          financialOutputs: financials,
          neighborhood,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error generating advisory report');
      }

      const data = await response.json();
      if (data.reportMarkdown) {
        setAiReport(data.reportMarkdown);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Unable to enrich report with Gemini at this time. Using verified statutory report.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-[#121824] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-w-4xl mx-auto space-y-6">
      {/* Report Header Bar */}
      <div className="p-6 sm:p-8 border-b border-slate-700/80 bg-[#0B0E14] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00C805]/20 border border-[#00C805]/40 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#00C805]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
                Stage 3 · Full Report
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                D.C. Decision & Compliance Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              disabled={isAiLoading}
              onClick={handleEnrichWithAI}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00C805] hover:from-emerald-500 hover:to-[#00D805] text-xs font-black text-black transition-all flex items-center gap-1.5 shadow-md shadow-[#00C805]/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Analyzing...' : 'Enrich with AI'}</span>
            </button>
          </div>
        </div>

        {aiError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            {aiError}
          </div>
        )}
      </div>

      {/* Main Formatted Markdown Content */}
      <div className="p-6 sm:p-8 space-y-6 text-slate-200 leading-relaxed text-sm">
        <div className="prose prose-invert max-w-none space-y-4">
          {activeReport.split('\n\n').map((block, idx) => {
            if (block.startsWith('# ')) {
              return (
                <h1 key={idx} className="text-2xl font-black text-white border-b border-slate-800 pb-3">
                  {block.replace('# ', '')}
                </h1>
              );
            }
            if (block.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-lg font-bold text-white text-[#00C805] pt-4">
                  {block.replace('## ', '')}
                </h2>
              );
            }
            if (block.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-base font-bold text-white pt-2">
                  {block.replace('### ', '')}
                </h3>
              );
            }
            if (block.startsWith('> ')) {
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border-l-4 border-[#00C805] text-slate-300">
                  {block.replace('> ', '')}
                </div>
              );
            }
            if (block.startsWith('|')) {
              // Simple markdown table parser
              const rows = block.trim().split('\n');
              return (
                <div key={idx} className="overflow-x-auto my-4 rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <tbody>
                      {rows.map((row, rIdx) => {
                        if (row.includes('---')) return null;
                        const cols = row.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
                        const isHead = rIdx === 0;
                        return (
                          <tr key={rIdx} className={isHead ? 'bg-slate-900 border-b border-slate-800 font-bold text-white' : 'border-b border-slate-800/50 hover:bg-slate-900/40'}>
                            {cols.map((col, cIdx) => (
                              <td key={cIdx} className="p-3">
                                {col.trim()}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }
            return (
              <p key={idx} className="text-slate-300">
                {block}
              </p>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons: Back and Continue */}
      <div className="p-6 sm:p-8 border-t border-slate-800 bg-[#0B0E14] flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToVerdict}
          className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onContinueToNextSteps}
          className="px-7 py-3 rounded-full bg-[#00C805] hover:bg-[#00B004] text-black font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#00C805]/20 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
