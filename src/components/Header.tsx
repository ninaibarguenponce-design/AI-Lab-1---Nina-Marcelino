import React from 'react';
import {
  FileText,
  Calculator,
  Compass,
  Scale,
  MessageSquare,
  Building2,
  Search,
  Sparkles,
  Check,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export type AppTab =
  | 'evaluator'
  | 'comps'
  | 'launch'
  | 'report'
  | 'long_term_workflow'
  | 'sensitivity'
  | 'compliance_guide'
  | 'consultation';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onGenerateReport: () => void;
  intakeStep?: 1 | 2 | 3 | 4;
  intakeCompleted?: boolean;
  onBackToPreviousStep?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onGenerateReport,
  intakeStep = 1,
  intakeCompleted = false,
  onBackToPreviousStep,
  canGoBack = false,
}) => {
  // Determine Delivery-App Stage (1 to 5)
  // Stage 1: Property Setup (Intake)
  // Stage 2: Market Comps
  // Stage 3: Decision & Verdict
  // Stage 4: 4-Part Report
  // Stage 5: Next Steps (Launch or Long-Term Plan)
  let currentStageNumber = 1;
  if (activeTab === 'evaluator' && !intakeCompleted) currentStageNumber = 1;
  else if (activeTab === 'comps') currentStageNumber = 2;
  else if (activeTab === 'evaluator' && intakeCompleted) currentStageNumber = 3;
  else if (activeTab === 'report') currentStageNumber = 4;
  else if (activeTab === 'launch' || activeTab === 'long_term_workflow') currentStageNumber = 5;

  const deliverySteps = [
    {
      stage: 1,
      id: 'evaluator',
      label: '1. Setup',
      sublabel: !intakeCompleted ? `Step ${intakeStep}/4` : 'Completed',
      action: () => onSelectTab('evaluator'),
      isCurrent: currentStageNumber === 1,
      isCompleted: intakeCompleted || currentStageNumber > 1,
    },
    {
      stage: 2,
      id: 'comps',
      label: '2. Comps',
      sublabel: 'Local Rates',
      action: () => onSelectTab('comps'),
      isCurrent: currentStageNumber === 2,
      isCompleted: currentStageNumber > 2,
    },
    {
      stage: 3,
      id: 'verdict',
      label: '3. Verdict',
      sublabel: 'Cash Comparison',
      action: () => {
        onSelectTab('evaluator');
      },
      isCurrent: currentStageNumber === 3,
      isCompleted: currentStageNumber > 3,
    },
    {
      stage: 4,
      id: 'report',
      label: '4. Report',
      sublabel: 'D.C. Statutory',
      action: () => onSelectTab('report'),
      isCurrent: currentStageNumber === 4,
      isCompleted: currentStageNumber > 4,
    },
    {
      stage: 5,
      id: 'launch',
      label: '5. Launch',
      sublabel: 'Next Steps',
      action: () => onSelectTab('launch'),
      isCurrent: currentStageNumber === 5,
      isCompleted: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14] border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Brand & Top Utilities */}
        <div className="flex items-center justify-between gap-4 h-14 border-b border-slate-850">
          <div className="flex items-center gap-3">
            {canGoBack && onBackToPreviousStep && (
              <button
                type="button"
                onClick={onBackToPreviousStep}
                className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                title="Go back to previous step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Go Back</span>
              </button>
            )}

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('evaluator');
              }}
              className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 whitespace-nowrap"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C805] animate-pulse"></span>
              <span>D.C. Rental Advisor</span>
            </a>
            <span className="text-xs text-slate-400 hidden xl:inline">
              Airbnb vs. 12-Month Lease
            </span>
          </div>

          {/* Quick auxiliary links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('long_term_workflow')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
                activeTab === 'long_term_workflow'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>12-Month Plan</span>
            </button>

            <button
              onClick={() => onSelectTab('compliance_guide')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap hidden sm:flex items-center gap-1.5 border ${
                activeTab === 'compliance_guide'
                  ? 'bg-[#00C805]/20 text-[#00C805] border-[#00C805]/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>D.C. Rules</span>
            </button>

            <button
              onClick={() => onSelectTab('consultation')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap hidden md:flex items-center gap-1.5 border ${
                activeTab === 'consultation'
                  ? 'bg-[#00C805]/20 text-[#00C805] border-[#00C805]/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Advisor</span>
            </button>
          </div>
        </div>

        {/* Row 2: Delivery-App Style Flow Stepper (The Progress Marker) */}
        <div className="py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[560px] sm:min-w-0">
            {deliverySteps.map((step, idx) => {
              const isLast = idx === deliverySteps.length - 1;

              return (
                <React.Fragment key={step.stage}>
                  <button
                    type="button"
                    onClick={step.action}
                    className={`flex items-center gap-2 p-1.5 rounded-xl transition-all text-left group ${
                      step.isCurrent
                        ? 'bg-[#00C805]/10 ring-1 ring-[#00C805]/50'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Numbered / Checkmark Circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        step.isCurrent
                          ? 'bg-[#00C805] text-black ring-4 ring-[#00C805]/20'
                          : step.isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {step.isCompleted && !step.isCurrent ? (
                        <Check className="w-3.5 h-3.5 stroke-3 text-emerald-400" />
                      ) : (
                        step.stage
                      )}
                    </div>

                    {/* Step Label & Subtitle */}
                    <div className="leading-tight">
                      <div
                        className={`text-xs font-extrabold whitespace-nowrap transition-colors ${
                          step.isCurrent
                            ? 'text-white'
                            : step.isCompleted
                            ? 'text-slate-200'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {step.sublabel}
                      </div>
                    </div>
                  </button>

                  {/* Connecting Line Between Stages */}
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-colors hidden sm:block ${
                        step.isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
