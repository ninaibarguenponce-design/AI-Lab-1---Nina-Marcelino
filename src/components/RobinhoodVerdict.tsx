import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sliders,
  FileText,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Calendar,
  Sparkles,
  Info,
  ShieldCheck,
  Home
} from 'lucide-react';
import {
  ComplianceEvaluation,
  FinancialInputs,
  FinancialOutputs,
  NeighborhoodData,
  PropertyConfig
} from '../types';
import { DC_LODGING_TAX_PERCENT, VACATION_RENTAL_NIGHT_CAP } from '../data/dcRules';

interface RobinhoodVerdictProps {
  financials: FinancialOutputs;
  inputs: FinancialInputs;
  config: PropertyConfig;
  compliance: ComplianceEvaluation;
  neighborhood: NeighborhoodData;
  onOpenReport: () => void;
  onOpenTweakModal?: () => void;
  onRestart: () => void;
  onEditHome: () => void;
  onBackToPrevious?: () => void;
  onNavigateToNextSteps?: () => void;
  onOpenPricingCalendar?: () => void;
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
  onEditHome,
  onBackToPrevious,
  onNavigateToNextSteps,
  onOpenPricingCalendar,
}) => {
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual');

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString('en-US')}`;

  const isAirbnbWinning = financials.annualProfitDelta > 0 && !financials.isNearTie;
  const isNotAllowed = financials.recommendation === 'not_allowed';
  const isNearTie = financials.isNearTie;

  const displayedAirbnb = period === 'annual' ? financials.airbnbNetAnnual : financials.netMonthlySTRProfit;
  const displayedLongTerm = period === 'annual' ? financials.longTermNetAnnual : financials.netMonthlyLongTermProfit;
  const displayedDelta = period === 'annual' ? financials.annualProfitDelta : financials.monthlyProfitDelta;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls: Saved Home Status, Edit My Home, Start Over */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0E14] border border-slate-800/80 px-5 py-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#00C805]"></span>
          <span>
            {config.nickname || `${neighborhood.name.split('/')[0]} Home`} ·{' '}
            <strong className="text-white">{config.isHomeDuringStay ? 'Owner on-site' : 'Owner away'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditHome}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00C805]" />
            <span>Edit my home</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Start over</span>
          </button>
        </div>
      </div>

      {/* HERO DECISION CARD */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Soft Background Accent Glow */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none ${
            isNotAllowed
              ? 'bg-red-500'
              : isAirbnbWinning
              ? 'bg-[#00C805]'
              : isNearTie
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}
        />

        {/* Period Switcher (Annual by default) */}
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isNotAllowed
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isNearTie
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : isAirbnbWinning
                ? 'bg-[#00C805]/20 text-[#00C805] border border-[#00C805]/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {isNotAllowed ? 'Not Allowed' : isNearTie ? 'Nearly a Tie' : isAirbnbWinning ? 'Airbnb Wins' : '12-Month Lease Wins'}
          </span>

          {!isNotAllowed && (
            <div className="flex items-center bg-slate-900 p-1 rounded-full border border-slate-800">
              <button
                type="button"
                onClick={() => setPeriod('annual')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  period === 'annual'
                    ? 'bg-[#00C805] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
              </button>
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  period === 'monthly'
                    ? 'bg-[#00C805] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
          )}
        </div>

        {/* 1. Open with one plain sentence */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {financials.verdictHeadline}
          </h1>

          {/* 2. Annual dollar difference */}
          {!isNotAllowed && (
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl sm:text-5xl font-mono font-black text-[#00C805]">
                {formatCurrency(Math.abs(displayedDelta))}
              </span>
              <span className="text-sm sm:text-base text-slate-300 font-semibold">
                {period === 'annual' ? '/ year' : '/ month'}{' '}
                {isNearTie
                  ? 'difference between options'
                  : isAirbnbWinning
                  ? 'more with Airbnb'
                  : 'more with a 12-month tenant'}
              </span>
            </div>
          )}

          {/* 3. One sentence explaining why */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            {financials.verdictReason}
          </p>
        </div>

        {/* If 90-night limit is what causes Airbnb to lose: Show what owner would earn by being home during stays */}
        {financials.hostedUpsideNetAnnual !== undefined && financials.isSubjectTo90DayCap && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs sm:text-sm text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Info className="w-4 h-4" />
              <span>What if you were home while guests stay?</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              D.C.'s 90-night limit only applies when you are away from the property. If you live on-site (for example, living upstairs while renting the English basement), D.C. permits year-round hosting. At {financials.hostedUpsideNights} booked nights, you would earn about{' '}
              <strong className="text-[#00C805]">{formatCurrency(financials.hostedUpsideNetAnnual)} per year</strong>
              {financials.hostedUpsideDelta !== undefined && financials.hostedUpsideDelta >= -1500
                ? ' — making it nearly a tie with a 12-month tenant.'
                : ' — significantly closing the gap.'}
            </p>
          </div>
        )}

        {/* Side-by-Side Financial Comparison */}
        {!isNotAllowed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Airbnb Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isAirbnbWinning || isNearTie
                  ? 'bg-slate-900/90 border-[#00C805]/40 ring-1 ring-[#00C805]/20'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C805]"></span>
                  <span>Airbnb (Short-Term)</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {financials.bookedNightsPerYear} nights/yr
                </span>
              </div>

              <div className="py-4 space-y-1">
                <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {formatCurrency(displayedAirbnb)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  What you keep after fees, cleaning, and utilities
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <div className="flex justify-between">
                  <span>Gross nightly revenue:</span>
                  <span className="text-slate-200">
                    {formatCurrency(period === 'annual' ? financials.grossAnnualSTRRevenue : financials.grossMonthlySTRRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Airbnb host fee (3%):</span>
                  <span className="text-slate-300">
                    -{formatCurrency(period === 'annual' ? financials.platformFeeAnnual : financials.platformFeeAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Net turnover & cleaning:</span>
                  <span className="text-slate-300">
                    -{formatCurrency(period === 'annual' ? financials.annualCleaningCost : financials.netTurnoverCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Utilities & fixed costs:</span>
                  <span className="text-slate-300">
                    -{formatCurrency(period === 'annual' ? financials.annualFixedExpenses : financials.fixedMonthlyExpenses)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-400 pt-1 border-t border-slate-800">
                  <span>D.C. Lodging Tax ({DC_LODGING_TAX_PERCENT}%):</span>
                  <span>Paid by guest</span>
                </div>
              </div>
            </div>

            {/* 12-Month Tenant Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                !isAirbnbWinning && !isNearTie
                  ? 'bg-slate-900/90 border-blue-500/40 ring-1 ring-blue-500/20'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>12-Month Tenant</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Guaranteed lease</span>
              </div>

              <div className="py-4 space-y-1">
                <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {formatCurrency(displayedLongTerm)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  What you keep after vacancy & maintenance
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <div className="flex justify-between">
                  <span>Contract monthly rent:</span>
                  <span className="text-slate-200">
                    {formatCurrency(inputs.longTermMonthlyRent)}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vacancy reserve (5%):</span>
                  <span className="text-slate-300">
                    -{formatCurrency((inputs.longTermMonthlyRent * 0.05) * (period === 'annual' ? 12 : 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance reserve:</span>
                  <span className="text-slate-300">
                    -{formatCurrency(inputs.longTermMaintenanceReserve * (period === 'annual' ? 12 : 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Utilities paid by:</span>
                  <span className="text-slate-200">Tenant</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Host turnover labor:</span>
                  <span className="text-slate-300">0 hours</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature 2: When and why to charge more callout */}
        {onOpenPricingCalendar && !isNotAllowed && (
          <div className="p-4 bg-gradient-to-r from-emerald-950/20 via-[#121824] to-[#121824] rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-slate-300">
                Want to charge more? Explore <strong className="text-white">D.C. Cherry Blossom, Graduation & Marathon surge dates</strong>
                {!config.isHomeDuringStay ? ' and optimize your Best 90 Nights.' : '.'}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenPricingCalendar}
              className="px-4 py-2 rounded-full bg-[#00C805]/15 hover:bg-[#00C805]/25 text-[#00C805] font-bold text-xs border border-[#00C805]/40 transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
            >
              <span>View Pricing Calendar →</span>
            </button>
          </div>
        )}

        {/* Action Buttons: Back and Continue */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <button
            type="button"
            onClick={onBackToPrevious}
            className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="px-7 py-3 rounded-full bg-[#00C805] hover:bg-[#00B004] text-black font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#00C805]/20 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
