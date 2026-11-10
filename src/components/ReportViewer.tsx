import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { ComplianceEvaluation, FinancialInputs, FinancialOutputs, NeighborhoodData, PropertyConfig } from '../types';
import { generateDeterministicReport } from '../utils/calculator';

interface ReportViewerProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  financials: FinancialOutputs;
  compliance: ComplianceEvaluation;
  neighborhood: NeighborhoodData;
  onBackToVerdict?: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  config,
  inputs,
  financials,
  compliance,
  neighborhood,
  onBackToVerdict,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  // Deterministic baseline report
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
    <div className="bg-[#121824] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-w-4xl mx-auto">
      {onBackToVerdict && (
        <div className="px-6 sm:px-8 pt-6 bg-[#0B0E14] border-b border-slate-850">
          <button
            type="button"
            onClick={onBackToVerdict}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#00C805]" />
            <span>← Back to Verdict / Evaluator</span>
          </button>
        </div>
      )}

      {/* Report Header Bar */}
      <div className="p-6 sm:p-8 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0E14]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
              Official Decision Output
            </span>
            <span className="text-xs text-slate-400 font-mono">
              D.C. Law 22-307
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            D.C. Short-Term Rental Viability & Compliance Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Property: <strong className="text-white">{config.nickname || 'Subject Property'}</strong> · {neighborhood.name} ({neighborhood.ward}) · {config.bedrooms === 0 ? 'Studio' : `${config.bedrooms} Bed`}, {config.bathrooms} Bath
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setShowRawMarkdown(!showRawMarkdown)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#121824] border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"
          >
            {showRawMarkdown ? 'Read Beautiful View' : 'Raw Text View'}
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#121824] border border-slate-700 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00C805]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#121824] border border-slate-700 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleEnrichWithAI}
            disabled={isAiLoading}
            className="px-4 py-2 text-xs font-black text-black bg-[#00C805] hover:bg-[#00b004] rounded-full transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {isAiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-black" />
            )}
            {isAiLoading ? 'Analyzing...' : aiReport ? 'Re-enrich' : 'Enrich with Gemini AI'}
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-4 bg-amber-950/60 border-b border-amber-800/80 text-xs sm:text-sm text-amber-200 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {aiReport && (
        <div className="p-3 bg-[#00C805]/15 border-b border-[#00C805]/30 text-xs sm:text-sm text-[#00C805] flex items-center justify-between px-6 font-semibold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00C805] shrink-0" />
            <span>Report enriched with Gemini Flash legal & hyper-local D.C. insights.</span>
          </div>
          <button
            onClick={() => setAiReport(null)}
            className="text-xs text-slate-300 underline hover:text-white ml-2"
          >
            Revert to Statutory Baseline
          </button>
        </div>
      )}

      {/* Report Content Body - High Contrast & Effortless Legibility */}
      <div className="p-6 sm:p-10 bg-[#0E131D]">
        {showRawMarkdown ? (
          <div className="font-mono text-xs sm:text-sm bg-[#0B0E14] text-slate-100 p-6 rounded-2xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-700">
            {activeReport}
          </div>
        ) : (
          <article className="max-w-none text-slate-100">
            <MarkdownRenderer content={activeReport} />
          </article>
        )}
      </div>

      {/* Footer Legal Disclaimer */}
      <div className="p-5 bg-[#0B0E14] border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
        <p>
          <strong className="text-slate-300">Statutory Notice:</strong> This report provides business decision guidance based on D.C. Law 22-307 (Short-Term Rental Regulation Act), D.C. Municipal Regulations Title 17, and D.C. Office of Tax and Revenue policies. Homeowners should verify final license approval with the D.C. Department of Licensing and Consumer Protection at dlcp.dc.gov.
        </p>
      </div>
    </div>
  );
};

// High-contrast, crystal-clear section renderer designed for maximum readability
function MarkdownRenderer({ content }: { content: string }) {
  const sections = content.split(/(?=###\s+\d\.)/g);

  return (
    <div className="space-y-8">
      {sections.map((section, idx) => {
        const lines = section.trim().split('\n');
        const header = lines[0]?.replace(/^###\s+/, '');
        const bodyLines = lines.slice(1);

        // Detect tables
        const tableLines: string[] = [];
        const nonTableBlocks: Array<{ type: 'text' | 'table'; content: string[] }> = [];
        let inTable = false;

        for (const line of bodyLines) {
          if (line.trim().startsWith('|')) {
            inTable = true;
            tableLines.push(line);
          } else {
            if (inTable) {
              nonTableBlocks.push({ type: 'table', content: [...tableLines] });
              tableLines.length = 0;
              inTable = false;
            }
            if (line.trim()) {
              if (nonTableBlocks.length > 0 && nonTableBlocks[nonTableBlocks.length - 1].type === 'text') {
                nonTableBlocks[nonTableBlocks.length - 1].content.push(line);
              } else {
                nonTableBlocks.push({ type: 'text', content: [line] });
              }
            }
          }
        }
        if (tableLines.length > 0) {
          nonTableBlocks.push({ type: 'table', content: [...tableLines] });
        }

        return (
          <section
            key={idx}
            className="bg-[#121824] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg"
          >
            {header && (
              <h2 className="text-lg sm:text-xl font-black text-white border-b border-slate-700 pb-3 flex items-center gap-2">
                {header}
              </h2>
            )}

            {nonTableBlocks.map((block, bIdx) => {
              if (block.type === 'table') {
                return <SimpleTable key={bIdx} lines={block.content} />;
              }

              return (
                <div key={bIdx} className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-100">
                  {block.content.map((line, lIdx) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('- ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 pl-1">
                          <span className="text-[#00C805] font-bold shrink-0 mt-0.5">•</span>
                          <span
                            className="text-slate-100"
                            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(2)) }}
                          />
                        </div>
                      );
                    }
                    if (/^\d+\.\s+/.test(trimmed)) {
                      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 pl-1">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                            {match?.[1]}
                          </span>
                          <span
                            className="text-slate-100 flex-1"
                            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(match?.[2] || '') }}
                          />
                        </div>
                      );
                    }
                    return (
                      <p
                        key={lIdx}
                        className="text-slate-100 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

function SimpleTable({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;

  const headerCells = lines[0]
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean);

  const dataRows = lines.slice(2).map((row) =>
    row
      .split('|')
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1 || arr.length === 1)
  );

  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-slate-700 shadow-md">
      <table className="min-w-full divide-y divide-slate-700 text-xs sm:text-sm">
        <thead className="bg-[#0B0E14]">
          <tr>
            {headerCells.map((head, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left font-black text-white whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(head) }}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/80 bg-[#161D2B]">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-800/60 transition-colors">
              {row.map((cell, cIdx) => {
                const isDifferenceCol = cIdx === 3;
                const isPositive = cell.includes('+');
                const isNegative = cell.includes('-') && !cell.includes('--');
                return (
                  <td
                    key={cIdx}
                    className={`px-4 py-3.5 text-slate-100 ${
                      cIdx === 0
                        ? 'font-bold text-white font-sans'
                        : isDifferenceCol
                        ? isPositive
                          ? 'font-mono font-bold text-[#00C805]'
                          : isNegative
                          ? 'font-mono font-bold text-red-400'
                          : 'font-mono text-slate-300'
                        : 'font-mono text-slate-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-emerald-300 font-mono border border-slate-700">$1</code>')
    .replace(
      /\[GREEN: Fully Compliant\]/g,
      '<span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black rounded-full text-xs shadow-xs">✓ GREEN: Fully Compliant</span>'
    )
    .replace(
      /\[YELLOW: Compliant with Conditions\]/g,
      '<span class="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 font-black rounded-full text-xs shadow-xs">⚠️ YELLOW: Compliant with Conditions</span>'
    )
    .replace(
      /\[RED: Non-Compliant \/ High Risk\]/g,
      '<span class="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/50 font-black rounded-full text-xs shadow-xs">✕ RED: Non-Compliant / High Risk</span>'
    );
}
