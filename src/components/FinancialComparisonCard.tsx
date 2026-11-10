import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Percent,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { FinancialInputs, FinancialOutputs, PropertyConfig } from '../types';

interface FinancialComparisonCardProps {
  financials: FinancialOutputs;
  inputs: FinancialInputs;
  config: PropertyConfig;
  onGoToReport: () => void;
}

export const FinancialComparisonCard: React.FC<FinancialComparisonCardProps> = ({
  financials,
  inputs,
  config,
  onGoToReport,
}) => {
  const formatCurrency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  const isSTRWinning = financials.monthlyProfitDelta > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Summary Banner */}
      <div className={`p-5 border-b ${isSTRWinning ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Decision Support Comparison
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${
                isSTRWinning ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-white'
              }`}>
                {isSTRWinning ? 'Airbnb STR Outperforms' : 'Long-Term Lease Outperforms'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Monthly Net Advantage: {isSTRWinning ? '+' : ''}{formatCurrency(financials.monthlyProfitDelta)}/mo
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Annual Projected Net Variance: {financials.annualProfitDelta >= 0 ? '+' : ''}{formatCurrency(financials.annualProfitDelta)}/year
              {financials.isSubjectTo90DayCap && ' (factoring D.C. 90-day unhosted cap)'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToReport}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-colors shadow-xs flex items-center gap-1.5"
            >
              View Full 4-Part Analysis
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Column 1: Short-Term Rental (Airbnb) */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Option A: Short-Term Rental
              </span>
              <h4 className="text-base font-bold text-slate-900">
                Airbnb / STR Operation
              </h4>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 bg-slate-100 rounded text-slate-700">
              {inputs.occupancyRate}% Occ @ ${inputs.averageDailyRate}/nt
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500">Net Monthly STR Cashflow</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatCurrency(financials.netMonthlySTRProfit)}
              <span className="text-xs font-normal text-slate-500"> / month</span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              Annualized: {formatCurrency(financials.annualUncappedSTRProfit)}
              {financials.isSubjectTo90DayCap && (
                <span className="text-amber-800 font-semibold block text-[11px] mt-0.5">
                  ⚠️ Capped at 90 days/yr by D.C. law: {formatCurrency(financials.annualCappedSTRProfit)}/yr
                </span>
              )}
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-sans">Projected Monthly Gross Revenue</span>
              <span className="font-bold text-slate-900">{formatCurrency(financials.grossMonthlySTRRevenue)}</span>
            </div>

            <div className="flex items-center justify-between text-red-700 bg-red-50/60 px-2 py-1 rounded">
              <span className="font-sans flex items-center gap-1">
                D.C. Transient Occupancy Tax (-14.95%)
                <span title="D.C. OTR mandatory accommodations tax" className="cursor-help">ℹ️</span>
              </span>
              <span>-{formatCurrency(financials.dcTransientTaxAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">Platform Host Processing Fee (-3.0%)</span>
              <span>-{formatCurrency(financials.platformFeeAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">
                Turnover Cleaning Cost ({financials.estimatedStaysPerMonth.toFixed(1)} stays)
              </span>
              <span>-{formatCurrency(financials.totalCleaningCost)}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-sans">Guest Cleaning Fees Collected</span>
              <span>+{formatCurrency(financials.totalCleaningFeeRecovered)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">Monthly Utility Overhead (Electric/Gas/Wi-Fi)</span>
              <span>-{formatCurrency(inputs.monthlyUtilities)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">Supplies, Linens & Maintenance Reserve</span>
              <span>-{formatCurrency(inputs.monthlySuppliesAndWear)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">STR Insurance Rider & DLCP Licensing</span>
              <span>-{formatCurrency(inputs.monthlyInsuranceAndLicense)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-900 font-bold">
              <span className="font-sans">Total Monthly Operating Expenses</span>
              <span>-{formatCurrency(financials.totalMonthlyExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Long-Term Lease Alternative */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Option B: Baseline Alternative
              </span>
              <h4 className="text-base font-bold text-slate-900">
                12-Month Residential Tenant
              </h4>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 bg-slate-100 rounded text-slate-700">
              Standard D.C. Lease
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500">Net Monthly Long-Term Cashflow</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatCurrency(financials.netMonthlyLongTermProfit)}
              <span className="text-xs font-normal text-slate-500"> / month</span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              Annualized: {formatCurrency(financials.annualLongTermProfit)}/yr (Zero 90-day cap)
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-sans">Contract Monthly Rent</span>
              <span className="font-bold text-slate-900">{formatCurrency(financials.longTermGrossMonthlyRent)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">D.C. Transient Occupancy Tax</span>
              <span className="text-slate-400">$0.00 (N/A)</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">Property Management ({inputs.longTermPropertyManagementPercent}%)</span>
              <span>-{formatCurrency(financials.longTermManagementFee)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">Vacancy Reserve ({inputs.longTermVacancyPercent}%)</span>
              <span>-{formatCurrency(financials.longTermVacancyAllowance)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-sans">Monthly Maintenance Reserve</span>
              <span>-{formatCurrency(financials.longTermMaintenanceReserve)}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-sans">Utilities & Wi-Fi Expense</span>
              <span>$0.00 (Tenant Paid)</span>
            </div>

            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-sans">Guest Turnover / Linen Service</span>
              <span>$0.00 (Zero Turnovers)</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-900 font-bold">
              <span className="font-sans">Net Retained Rental Income</span>
              <span>{formatCurrency(financials.netMonthlyLongTermProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakeven Occupancy Banner */}
      <div className="p-5 bg-slate-900 text-white border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Required Breakeven Occupancy Threshold
              </span>
            </div>
            <div className="text-lg font-bold">
              {financials.isBreakevenFeasible ? (
                <span>
                  Minimum Occupancy Required:{' '}
                  <span className="text-emerald-400 font-mono text-xl">
                    {financials.breakevenOccupancyRate}%
                  </span>{' '}
                  <span className="text-xs font-normal text-slate-300">
                    ({financials.breakevenNightsNeeded} booked nights / month)
                  </span>
                </span>
              ) : (
                <span className="text-red-400">
                  Unachievable at current ADR & expense baseline
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              This is the exact occupancy rate needed for short-term net income to equal your long-term lease baseline ({formatCurrency(financials.netMonthlyLongTermProfit)}/mo).
            </p>
          </div>

          <div className="shrink-0 text-right">
            {financials.breakevenExceedsLegalCap ? (
              <div className="p-2.5 bg-red-950/80 border border-red-700 rounded-lg text-left max-w-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  Statutory 90-Day Cap Breach
                </div>
                <p className="text-[11px] text-red-200 mt-0.5">
                  Breakeven requires {financials.breakevenNightsNeeded} nights/mo ({Math.round(financials.breakevenNightsNeeded * 12)} nights/yr), exceeding D.C.’s 90-day unhosted annual limit (~24.7% occupancy).
                </p>
              </div>
            ) : inputs.occupancyRate >= financials.breakevenOccupancyRate ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                Target is {(inputs.occupancyRate - financials.breakevenOccupancyRate).toFixed(1)}% above breakeven
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Target is {(financials.breakevenOccupancyRate - inputs.occupancyRate).toFixed(1)}% below breakeven
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
