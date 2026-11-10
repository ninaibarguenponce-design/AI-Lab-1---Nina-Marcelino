import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sliders,
  FileText,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Search,
  Sparkles
} from 'lucide-react';
import { ComplianceEvaluation, FinancialInputs, FinancialOutputs, NeighborhoodData, PropertyConfig } from '../types';

import { Building2 } from 'lucide-react';

interface RobinhoodVerdictProps {
  financials: FinancialOutputs;
  inputs: FinancialInputs;
  config: PropertyConfig;
  compliance: ComplianceEvaluation;
  neighborhood: NeighborhoodData;
  onOpenReport: () => void;
  onOpenTweakModal: () => void;
  onRestart: () => void;
  onOpenLongTermWorkflow?: () => void;
  onNavigateToComps?: () => void;
  onNavigateToLaunch?: () => void;
}

export const RobinhoodVerdict: React.FC<RobinhoodVerdictProps> = ({
  financials,
  inputs,
  config,
  compliance,
  neighborhood,
  onOpenReport,
  onOpenTweakModal,
  onRestart,
  onOpenLongTermWorkflow,
  onNavigateToComps,
  onNavigateToLaunch,
}) => {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');

  const isAirbnbWinning = financials.monthlyProfitDelta > 0;
  const isRedLight = compliance.status === 'RED';

  const formatCurrency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  const displayedDelta =
    period === 'monthly'
      ? financials.monthlyProfitDelta
      : financials.annualProfitDelta;

  const displayedSTRNet =
    period === 'monthly'
      ? financials.netMonthlySTRProfit
      : financials.isSubjectTo90DayCap
      ? financials.annualCappedSTRProfit
      : financials.annualUncappedSTRProfit;

  const displayedLongTermNet =
    period === 'monthly'
      ? financials.netMonthlyLongTermProfit
      : financials.annualLongTermProfit;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ROBINHOOD HERO FINANCIAL CARD */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Soft Background Accent Glow */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none ${
            isRedLight
              ? 'bg-red-500'
              : isAirbnbWinning
              ? 'bg-[#00C805]'
              : 'bg-blue-500'
          }`}
        />

        {/* Top Header Badge & Period Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isRedLight
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : compliance.status === 'YELLOW'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-[#00C805]/20 text-[#00C805] border border-[#00C805]/30'
              }`}
            >
              {isRedLight ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>RED LIGHT: Not Allowed in D.C.</span>
                </>
              ) : compliance.status === 'YELLOW' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>YELLOW LIGHT: Compliant with Checklist</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>GREEN LIGHT: Fully Legal to List</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400">
              {neighborhood.name.split('/')[0]}
            </span>
          </div>

          {/* Robinhood Period Switch */}
          <div className="flex items-center p-1 bg-[#0B0E14] rounded-full border border-slate-800 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 rounded-full transition-all ${
                period === 'monthly'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={`px-3 py-1 rounded-full transition-all ${
                period === 'annual'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Big Robinhood Metric Display */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isRedLight
              ? 'Estimated Long-Term Safe Income'
              : isAirbnbWinning
              ? 'Extra Money in Your Pocket with Airbnb'
              : 'Extra Money with a Regular 12-Month Tenant'}
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <div
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isRedLight
                  ? 'text-white'
                  : isAirbnbWinning
                  ? 'text-[#00C805]'
                  : 'text-slate-200'
              }`}
            >
              {isRedLight
                ? formatCurrency(displayedLongTermNet)
                : `${isAirbnbWinning ? '+' : ''}${formatCurrency(displayedDelta)}`}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-medium">
              / {period === 'monthly' ? 'month' : 'year'}
            </div>
          </div>

          <p className="text-xs text-slate-400 pt-1">
            {isRedLight
              ? 'Because D.C. law prohibits STRs on secondary investment properties, a regular tenant is your legally safe option.'
              : isAirbnbWinning
              ? `Airbnb brings you ${formatCurrency(displayedSTRNet)}/${period === 'monthly' ? 'mo' : 'yr'} vs ${formatCurrency(displayedLongTermNet)}/${period === 'monthly' ? 'mo' : 'yr'} with a regular tenant.`
              : `A regular 12-month tenant makes you ${formatCurrency(displayedLongTermNet)}/${period === 'monthly' ? 'mo' : 'yr'} with zero turnover labor or utility bills.`}
          </p>
        </div>

        {/* 2 Comparison Pill Boxes */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-[#0B0E14] rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">
              Airbnb Net Profit
            </span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {formatCurrency(displayedSTRNet)}
              <span className="text-xs font-normal text-slate-400">/{period === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              After cleaning, utilities & 14.95% D.C. tax
            </span>
          </div>

          <div className="p-3.5 bg-[#0B0E14] rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">
              12-Month Tenant Net
            </span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {formatCurrency(displayedLongTermNet)}
              <span className="text-xs font-normal text-slate-400">/{period === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Guaranteed rent, tenant pays utilities
            </span>
          </div>
        </div>
      </div>

      {/* 3 HIGH-IMPACT QUALITY CARDS (MOM-FRIENDLY & NOT EXTENSE) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: The Breakeven Number */}
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-[#00C805]/10 text-[#00C805] flex items-center justify-center text-xs font-bold font-mono">
            🎯
          </div>
          <h3 className="text-sm font-bold text-white">
            Breakeven Nights
          </h3>
          <div className="text-2xl font-black font-mono text-[#00C805]">
            {financials.isBreakevenFeasible ? (
              <span>{Math.ceil(financials.breakevenNightsNeeded)} nights</span>
            ) : (
              <span className="text-red-400 text-lg">Unfeasible</span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {financials.isBreakevenFeasible
              ? `You only need to rent ${Math.ceil(financials.breakevenNightsNeeded)} nights a month (${financials.breakevenOccupancyRate}%) to equal a full-time tenant.`
              : 'At this price, expenses are too high. Increase your nightly price to break even.'}
          </p>
        </div>

        {/* Card 2: D.C. Legal Status */}
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
            ⚖️
          </div>
          <h3 className="text-sm font-bold text-white">
            D.C. License Rule
          </h3>
          <div className="text-sm font-bold text-slate-200">
            {config.propertyType === 'hosted_room' ? (
              <span className="text-[#00C805]">No 90-Day Cap!</span>
            ) : config.isPrimaryResidence ? (
              <span className="text-amber-300">90-Day Annual Cap</span>
            ) : (
              <span className="text-red-400">Strictly Prohibited</span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {config.propertyType === 'hosted_room'
              ? 'Because you sleep in the house during stays, D.C. allows you to rent all 365 days a year.'
              : config.isPrimaryResidence
              ? 'Because guests have the whole space to themselves, D.C. caps bookings at 90 nights a year.'
              : 'D.C. only grants Airbnb licenses for homes where the owner lives 183+ days a year.'}
          </p>
        </div>

        {/* Card 3: What You Need to Do */}
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold font-mono">
            📋
          </div>
          <h3 className="text-sm font-bold text-white">
            Checklist to List
          </h3>
          <ul className="text-xs text-slate-300 space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="text-[#00C805]">✓</span>
              <span>Clean Hands Tax Certificate</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#00C805]">✓</span>
              <span>Smoke & carbon monoxide detectors</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#00C805]">✓</span>
              <span>D.C. Business License</span>
            </li>
          </ul>
          <p className="text-[11px] text-slate-400 pt-1">
            Airbnb collects the 14.95% D.C. lodging tax automatically!
          </p>
        </div>
      </div>

      {/* Special Callout if Property does not qualify or if Long-Term is superior */}
      {(isRedLight || !isAirbnbWinning) && onOpenLongTermWorkflow && (
        <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-[#121824] to-emerald-950/20 border border-emerald-500/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {isRedLight
                  ? 'Ready to rent legally to a 12-Month Tenant?'
                  : 'A 12-Month Tenant makes more money with zero turnover work'}
              </h4>
              <p className="text-xs text-slate-300">
                Explore our plain-English D.C. Landlord Roadmap and cash flow calculator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLongTermWorkflow}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Open Long-Term Rental Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* QUICK AIRBNB TOOLS: COMPS & LAUNCH STUDIO */}
      {!isRedLight && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onNavigateToComps && (
            <button
              type="button"
              onClick={onNavigateToComps}
              className="p-4 bg-[#121824] hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    Explore Airbnb Comps Nearby
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    See photos, rates & ratings of local listings
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          )}

          {onNavigateToLaunch && (
            <button
              type="button"
              onClick={onNavigateToLaunch}
              className="p-4 bg-[#121824] hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00C805]/10 text-[#00C805] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00C805] transition-colors">
                    Start on Airbnb & Copy Listing Copy
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Host onboarding, D.C. license guide & API info
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      )}

      {/* ACTION BUTTONS (MOM-FRIENDLY & CLEAN) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenReport}
          className="w-full sm:flex-1 py-4 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-sm rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Continue to Step 4: Statutory Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenTweakModal}
          className="w-full sm:w-auto px-6 py-4 bg-[#121824] hover:bg-slate-800 text-white font-semibold text-xs rounded-full border border-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <Sliders className="w-4 h-4 text-slate-400" />
          <span>Adjust Numbers</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-5 py-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-semibold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};
