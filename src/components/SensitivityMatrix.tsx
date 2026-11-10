import React from 'react';
import { Compass, Info, AlertTriangle } from 'lucide-react';
import { FinancialInputs, FinancialOutputs, PropertyConfig } from '../types';
import { calculateFinancials } from '../utils/calculator';

interface SensitivityMatrixProps {
  inputs: FinancialInputs;
  config: PropertyConfig;
  currentOutputs: FinancialOutputs;
}

export const SensitivityMatrix: React.FC<SensitivityMatrixProps> = ({
  inputs,
  config,
  currentOutputs,
}) => {
  // Generate ADR variations: -20%, -10%, current, +10%, +20%, +30%
  const baseADR = inputs.averageDailyRate;
  const adrMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
  const adrList = adrMultipliers.map((m) => Math.round(baseADR * m));

  // Occupancy variations: 50%, 60%, 70%, 75%, 80%, 85%
  const occupancyList = [50, 60, 70, 75, 80, 85];

  const formatCurrency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  return (
    <div className="bg-[#121824] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
      <div className="p-6 border-b border-slate-800 bg-[#0B0E14]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#00C805]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
            Market Stress Testing
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mt-1">
          Sensitivity Matrix: Nightly Price vs. Occupancy Rate
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Shows Net Monthly Profit Difference: <strong className="text-[#00C805]">Green = Airbnb beats long-term lease</strong>; <strong className="text-slate-400">Gray = Long-term tenant wins</strong>.
        </p>
      </div>

      {config.hostingType === 'unhosted' && (
        <div className="p-3 bg-amber-950/40 border-b border-amber-800/80 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>D.C. 90-Day Annual Cap Context:</strong> For unhosted homes, any monthly occupancy above <strong>24.7%</strong> (7.5 nights/month) is only sustainable on a seasonal basis because D.C. caps unhosted rentals at 90 days per calendar year.
          </div>
        </div>
      )}

      <div className="p-5 overflow-x-auto">
        <table className="min-w-full text-xs font-mono border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 text-left font-sans font-bold text-slate-300 border-b border-r border-slate-800 bg-[#0B0E14]">
                Nightly Price \ Occupancy
              </th>
              {occupancyList.map((occ) => (
                <th
                  key={occ}
                  className={`p-2.5 text-center font-bold border-b border-slate-800 ${
                    Math.abs(inputs.occupancyRate - occ) <= 2
                      ? 'bg-[#00C805] text-black font-extrabold'
                      : 'bg-[#0B0E14] text-slate-300'
                  }`}
                >
                  {occ}% Occ
                  <div className="text-[10px] font-normal opacity-80">
                    {(30.4 * (occ / 100)).toFixed(1)} nts/mo
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adrList.map((adr) => {
              const isCurrentADR = adr === baseADR;
              return (
                <tr key={adr} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td
                    className={`p-2.5 font-bold border-r border-slate-800 ${
                      isCurrentADR
                        ? 'bg-[#00C805] text-black font-sans'
                        : 'bg-[#0B0E14] text-white font-sans'
                    }`}
                  >
                    ${adr}/night
                    {isCurrentADR && (
                      <span className="block text-[10px] font-normal opacity-90">
                        (Current Baseline)
                      </span>
                    )}
                  </td>

                  {occupancyList.map((occ) => {
                    const testInputs: FinancialInputs = {
                      ...inputs,
                      averageDailyRate: adr,
                      occupancyRate: occ,
                    };
                    const result = calculateFinancials(testInputs, config);
                    const delta = result.monthlyProfitDelta;
                    const isWinning = delta > 0;
                    const isCurrentCell = isCurrentADR && Math.abs(inputs.occupancyRate - occ) <= 2;

                    return (
                      <td
                        key={occ}
                        className={`p-2.5 text-center transition-colors ${
                          isCurrentCell ? 'ring-2 ring-[#00C805] ring-inset font-black' : ''
                        } ${
                          isWinning
                            ? 'bg-[#00C805]/15 text-[#00C805]'
                            : 'bg-[#0B0E14]/40 text-slate-500'
                        }`}
                      >
                        <div className="font-bold">
                          {isWinning ? '+' : ''}
                          {formatCurrency(delta)}
                        </div>
                        <div className="text-[10px] opacity-75">
                          STR: {formatCurrency(result.netMonthlySTRProfit)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#0B0E14] border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Fixed long-term baseline net income: <strong className="text-white">{formatCurrency(currentOutputs.netMonthlyLongTermProfit)}/mo</strong> (${inputs.longTermMonthlyRent} gross less mgmt, vacancy & maintenance).
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#00C805]/30 border border-[#00C805] rounded-xs"></span>
            Airbnb Beats Long-Term
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 bg-slate-800 border border-slate-700 rounded-xs"></span>
            Long-Term Beats Airbnb
          </span>
        </div>
      </div>
    </div>
  );
};
