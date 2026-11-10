import React from 'react';
import {
  FileText,
  Building2,
  Scale,
  MessageSquare,
  Check,
  ArrowLeft,
  Home,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Calendar
} from 'lucide-react';

export type AppTab =
  | 'home'
  | 'verdict'
  | 'report'
  | 'next_steps'
  | 'pricing_calendar'
  | 'comps'
  | 'long_term_workflow'
  | 'compliance_guide'
  | 'consultation';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  intakeStep?: 1 | 2 | 3;
  intakeCompleted?: boolean;
  maxUnlockedStage?: number; // 1: Home, 2: Answer, 3: Report, 4: Next steps
  onBackToPreviousStep?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  intakeStep = 1,
  intakeCompleted = false,
  maxUnlockedStage = 1,
  onBackToPreviousStep,
  canGoBack = false,
}) => {
  // Map current tab to stage number (1 to 4)
  let currentStage = 1;
  if (activeTab === 'home') currentStage = 1;
  else if (activeTab === 'verdict' || activeTab === 'comps') currentStage = 2;
  else if (activeTab === 'report') currentStage = 3;
  else if (activeTab === 'next_steps' || activeTab === 'pricing_calendar' || activeTab === 'long_term_workflow') currentStage = 4;

  const highestUnlocked = Math.max(currentStage, maxUnlockedStage, intakeCompleted ? 2 : 1);

  const stages = [
    {
      stage: 1,
      id: 'home' as AppTab,
      label: 'Your home',
      sublabel: !intakeCompleted ? `Step ${intakeStep} of 3` : 'Saved',
    },
    {
      stage: 2,
      id: 'verdict' as AppTab,
      label: 'Your answer',
      sublabel: 'Comparison',
    },
    {
      stage: 3,
      id: 'report' as AppTab,
      label: 'Full report',
      sublabel: 'D.C. breakdown',
    },
    {
      stage: 4,
      id: 'next_steps' as AppTab,
      label: 'Next steps',
      sublabel: 'Action plan',
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
                className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                title="Back to previous screen"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectTab(intakeCompleted ? 'verdict' : 'home')}
              className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 whitespace-nowrap text-left cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C805] animate-pulse"></span>
              <span>D.C. Rental Advisor</span>
            </button>
            <span className="text-xs text-slate-400 hidden xl:inline">
              Airbnb vs. 12-Month Lease
            </span>
          </div>

          {/* Quick auxiliary links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('pricing_calendar')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap hidden md:flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'pricing_calendar'
                  ? 'bg-[#00C805]/20 text-[#00C805] border-[#00C805]/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Event Pricing</span>
            </button>

            <button
              onClick={() => onSelectTab('compliance_guide')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap hidden sm:flex items-center gap-1.5 border cursor-pointer ${
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
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
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

        {/* Row 2: Four Progress Markers */}
        <div className="py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[500px] sm:min-w-0">
            {stages.map((step, idx) => {
              const isLast = idx === stages.length - 1;
              const isCurrent = currentStage === step.stage;
              const isUnlocked = step.stage <= highestUnlocked;
              const isCompleted = step.stage < currentStage || (step.stage === 1 && intakeCompleted && currentStage !== 1);

              return (
                <React.Fragment key={step.stage}>
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) {
                        onSelectTab(step.id);
                      }
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl transition-all text-left group ${
                      !isUnlocked
                        ? 'opacity-40 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-[#00C805]/10 ring-1 ring-[#00C805]/50 cursor-pointer'
                        : 'hover:bg-slate-800/40 cursor-pointer'
                    }`}
                  >
                    {/* Circle badge */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-[#00C805] text-black ring-4 ring-[#00C805]/20'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isUnlocked
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="w-3.5 h-3.5 stroke-3 text-emerald-400" />
                      ) : (
                        step.stage
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="leading-tight">
                      <div
                        className={`text-xs font-extrabold whitespace-nowrap transition-colors ${
                          isCurrent
                            ? 'text-white'
                            : isUnlocked
                            ? 'text-slate-200 group-hover:text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {step.sublabel}
                      </div>
                    </div>
                  </button>

                  {/* Connecting Bar */}
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-colors hidden sm:block ${
                        step.stage < highestUnlocked ? 'bg-emerald-500/40' : 'bg-slate-800'
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
