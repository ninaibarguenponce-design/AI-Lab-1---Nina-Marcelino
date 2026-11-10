import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Calendar,
  FileCheck,
  Info,
  Printer,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Home
} from 'lucide-react';
import { NeighborhoodData, PropertyConfig, FinancialInputs } from '../types';

interface LongTermRentalWorkflowProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  neighborhood: NeighborhoodData;
  onUpdateInputs: (updated: Partial<FinancialInputs>) => void;
  onUpdateConfig: (updated: Partial<PropertyConfig>) => void;
  onBackToEvaluator: () => void;
}

export const LongTermRentalWorkflow: React.FC<LongTermRentalWorkflowProps> = ({
  config,
  inputs,
  neighborhood,
  onUpdateInputs,
  onUpdateConfig,
  onBackToEvaluator,
}) => {
  const [usePropertyManager, setUsePropertyManager] = useState<boolean>(
    inputs.longTermPropertyManagementPercent > 0
  );
  const [activeStrategy, setActiveStrategy] = useState<'standard_12mo' | 'mid_term_30day'>('standard_12mo');
  const [completedSteps, setCompletedSteps] = useState<string[]>(['step1']);

  // Dynamic calculations for long-term lease
  const grossMonthlyRent = inputs.longTermMonthlyRent;
  const managementPercent = usePropertyManager ? 8 : 0;
  const managementCost = grossMonthlyRent * (managementPercent / 100);
  const vacancyAllowance = grossMonthlyRent * (inputs.longTermVacancyPercent / 100); // 5% vacancy
  const maintenanceReserve = inputs.longTermMaintenanceReserve; // $100/mo
  const totalMonthlyExpenses = managementCost + vacancyAllowance + maintenanceReserve;
  const netMonthlyProfit = grossMonthlyRent - totalMonthlyExpenses;
  const netAnnualProfit = netMonthlyProfit * 12;

  // Mid-term rental 30+ day alternative projection (~25% premium over standard 12-mo, 10% vacancy)
  const midTermMonthlyRent = Math.round(grossMonthlyRent * 1.25);
  const midTermVacancyAllowance = Math.round(midTermMonthlyRent * 0.10);
  const midTermUtilitiesAndWifi = 250; // Furnished units usually include utilities
  const midTermNetMonthly = midTermMonthlyRent - midTermVacancyAllowance - midTermUtilitiesAndWifi - maintenanceReserve;
  const midTermNetAnnual = midTermNetMonthly * 12;

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((s) => s !== stepId) : [...prev, stepId]
    );
  };

  const formatCurrency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Friendly Hero Banner */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>D.C. Long-Term Rental Workflow</span>
          </div>
          <button
            onClick={onBackToEvaluator}
            className="text-xs text-slate-400 hover:text-white underline self-start sm:self-auto flex items-center gap-1"
          >
            <span>Switch back to Airbnb Evaluator</span>
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Safe, Guaranteed Income with a 12-Month Tenant
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Because Washington, D.C. restricts Airbnb to primary residences, leasing to a standard tenant or a 30-day+ professional is the <strong>100% legal, stress-free path</strong> to earn dependable income from your home in <strong>{neighborhood.name}</strong>.
          </p>
        </div>

        {/* Strategy Switch: Standard 12-Month Lease vs. 30-Day+ Mid-Term Rental */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Choose Your Rental Strategy:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveStrategy('standard_12mo')}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                activeStrategy === 'standard_12mo'
                  ? 'border-[#00C805] bg-[#00C805]/10 ring-2 ring-[#00C805]'
                  : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-bold text-white">1. Standard 12-Month Tenant</span>
                <span className="text-xs font-mono font-bold text-[#00C805]">
                  {formatCurrency(netMonthlyProfit)}/mo
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tenant signs a 1-year residential lease. Tenant pays utilities. Zero guest turnover or cleaning hassle.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveStrategy('mid_term_30day')}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                activeStrategy === 'mid_term_30day'
                  ? 'border-[#00C805] bg-[#00C805]/10 ring-2 ring-[#00C805]'
                  : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-bold text-white">2. 30-Day+ Mid-Term Furnished</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatCurrency(midTermNetMonthly)}/mo
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rent 30+ days to travel nurses & government fellows. 100% legal without an Airbnb license, zero hotel tax!
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* FINANCIAL BREAKDOWN CARD */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {activeStrategy === 'standard_12mo' ? '12-Month Lease Financial Breakdown' : '30-Day+ Furnished Financial Breakdown'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Realistic net profit for a {config.bedrooms === 0 ? 'Studio' : `${config.bedrooms}-bedroom`}, {config.bathrooms}-bathroom home in {neighborhood.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Self-Managed:</span>
            <button
              onClick={() => {
                const nextState = !usePropertyManager;
                setUsePropertyManager(nextState);
                onUpdateInputs({ longTermPropertyManagementPercent: nextState ? 8 : 0 });
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                !usePropertyManager
                  ? 'bg-[#00C805]/20 text-[#00C805] border-[#00C805]/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {!usePropertyManager ? '✓ Yes (Save 8%)' : 'No (8% Manager)'}
            </button>
          </div>
        </div>

        {/* Big Net Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0B0E14] p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Net Monthly Take-Home Profit
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#00C805]">
              {formatCurrency(activeStrategy === 'standard_12mo' ? netMonthlyProfit : midTermNetMonthly)}
              <span className="text-xs font-normal text-slate-400"> / month</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              After setting aside money for vacancy, repairs, and management.
            </p>
          </div>

          <div className="bg-[#0B0E14] p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Projected Annual Net Income
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              {formatCurrency(activeStrategy === 'standard_12mo' ? netAnnualProfit : midTermNetAnnual)}
              <span className="text-xs font-normal text-slate-400"> / year</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Guaranteed by a binding legal lease agreement.
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-[#0B0E14] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/50">
                <th className="py-3 px-4 text-left">Income & Expense Item</th>
                <th className="py-3 px-4 text-right">Monthly Amount</th>
                <th className="py-3 px-4 text-left hidden sm:table-cell">Why It Matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              <tr>
                <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                  <span className="text-[#00C805]">+</span>
                  <span>Gross Monthly Rent</span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#00C805]">
                  +{formatCurrency(activeStrategy === 'standard_12mo' ? grossMonthlyRent : midTermMonthlyRent)}
                </td>
                <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                  Market rate based on neighborhood and bedrooms
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300 flex items-center gap-1.5">
                  <span className="text-red-400">-</span>
                  <span>Vacancy Buffer (5%)</span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-red-400">
                  -{formatCurrency(activeStrategy === 'standard_12mo' ? vacancyAllowance : midTermVacancyAllowance)}
                </td>
                <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                  Accounts for ~18 days between tenant move-outs over the year
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300 flex items-center gap-1.5">
                  <span className="text-red-400">-</span>
                  <span>Maintenance & Repair Reserve</span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-red-400">
                  -{formatCurrency(maintenanceReserve)}
                </td>
                <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                  Saved every month for plumbing, appliance upkeep, or paint
                </td>
              </tr>
              {usePropertyManager && (
                <tr>
                  <td className="py-3 px-4 text-slate-300 flex items-center gap-1.5">
                    <span className="text-red-400">-</span>
                    <span>Property Management Fee (8%)</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-red-400">
                    -{formatCurrency(managementCost)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                    Professional manager handles midnight calls and repair coordination
                  </td>
                </tr>
              )}
              {activeStrategy === 'mid_term_30day' && (
                <tr>
                  <td className="py-3 px-4 text-slate-300 flex items-center gap-1.5">
                    <span className="text-red-400">-</span>
                    <span>Furnished Utilities & High-Speed Wi-Fi</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-red-400">
                    -{formatCurrency(midTermUtilitiesAndWifi)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                    Mid-term traveling tenants expect furnished housing with utilities included
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900/60 font-bold">
                <td className="py-3.5 px-4 text-white">Net Monthly Profit to You</td>
                <td className="py-3.5 px-4 text-right font-mono text-base text-[#00C805]">
                  {formatCurrency(activeStrategy === 'standard_12mo' ? netMonthlyProfit : midTermNetMonthly)}
                </td>
                <td className="py-3.5 px-4 text-slate-300 hidden sm:table-cell">
                  Pure cash flow into your bank account
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PLAIN ENGLISH D.C. LANDLORD ROADMAP */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
            Simple Checklist for Mom
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            How to Safely Rent Your House in D.C. (Step-by-Step)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            We broke down Washington, D.C.'s landlord rules into simple, everyday language. Check them off as you go!
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: D.C. Rental License */}
          <div
            onClick={() => toggleStep('step1')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              completedSteps.includes('step1')
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  completedSteps.includes('step1')
                    ? 'bg-[#00C805] text-black font-bold text-xs'
                    : 'border border-slate-600 text-transparent'
                }`}
              >
                ✓
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    Step 1: Get the D.C. One-Family Rental License
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    2-Year License
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every homeowner renting to a residential tenant gets a <strong>Basic Business License (BBL)</strong> for a "One-Family Rental" from the D.C. Business Licensing Department. It takes about 20 minutes online and requires a Clean Hands certificate from the D.C. Tax Office showing you don't have unpaid city tickets or overdue taxes.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: D.C. Rent Control Rules Made Simple */}
          <div
            onClick={() => toggleStep('step2')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              completedSteps.includes('step2')
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  completedSteps.includes('step2')
                    ? 'bg-[#00C805] text-black font-bold text-xs'
                    : 'border border-slate-600 text-transparent'
                }`}
              >
                ✓
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    Step 2: File Your Rent Control Exemption (4-Unit Rule)
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Good News!
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Under D.C. law, if you own <strong>4 or fewer rental properties</strong> as an individual (not a giant corporation), you are <strong>completely exempt from rent control caps</strong>! You can set your rent at full market rate. You simply file a standard 1-page form ("RAD Form 1") when you get your license.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Security Deposit Limit */}
          <div
            onClick={() => toggleStep('step3')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              completedSteps.includes('step3')
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  completedSteps.includes('step3')
                    ? 'bg-[#00C805] text-black font-bold text-xs'
                    : 'border border-slate-600 text-transparent'
                }`}
              >
                ✓
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    Step 3: Security Deposit Strictly Capped at 1 Month's Rent
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    D.C. Law Mandate
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  D.C. strictly caps the security deposit at a maximum of <strong>one month's rent</strong> (for example, {formatCurrency(grossMonthlyRent)}). You must hold it in an interest-bearing bank account and return it within 45 days after the tenant moves out (or within 30 days provide an itemized list of any damage repairs).
                </p>
              </div>
            </div>
          </div>

          {/* Step 4: Simple Home Safety Check */}
          <div
            onClick={() => toggleStep('step4')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              completedSteps.includes('step4')
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  completedSteps.includes('step4')
                    ? 'bg-[#00C805] text-black font-bold text-xs'
                    : 'border border-slate-600 text-transparent'
                }`}
              >
                ✓
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    Step 4: Life Safety Check (Smoke & Carbon Monoxide Detectors)
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Home Inspection
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Before a tenant moves in, the city checks that you have smoke alarms on every level and in every bedroom, a carbon monoxide detector if you have gas appliances or an attached garage, working window locks, and proper hot water temperature (between 120°F and 125°F).
                </p>
              </div>
            </div>
          </div>

          {/* Step 5: Tenant Opportunity to Purchase Act (TOPA) */}
          <div
            onClick={() => toggleStep('step5')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              completedSteps.includes('step5')
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  completedSteps.includes('step5')
                    ? 'bg-[#00C805] text-black font-bold text-xs'
                    : 'border border-slate-600 text-transparent'
                }`}
              >
                ✓
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    Step 5: Understanding Tenant Purchase Rights (TOPA)
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Future Home Sale
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  In Washington, D.C., when a landlord decides to sell a rental property, the tenant has the right to be notified and given the opportunity to match the purchase price. Single-family homes have a streamlined process that is straightforward to navigate with any D.C. real estate agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-full border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Landlord Checklist</span>
          </button>

          <button
            type="button"
            onClick={onBackToEvaluator}
            className="w-full sm:flex-1 py-4 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-sm rounded-full transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Short-Term Rental Evaluator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
