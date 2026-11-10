import React from 'react';
import { MapPin, Calendar, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { DC_NEIGHBORHOODS } from '../data/dcNeighborhoods';
import { NeighborhoodData } from '../types';

interface NeighborhoodStrategyViewProps {
  selectedId: string;
  onSelectNeighborhood: (id: string) => void;
}

export const NeighborhoodStrategyView: React.FC<NeighborhoodStrategyViewProps> = ({
  selectedId,
  onSelectNeighborhood,
}) => {
  const selected =
    DC_NEIGHBORHOODS.find((n) => n.id === selectedId) || DC_NEIGHBORHOODS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Overview Card */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00C805]">
          <MapPin className="w-4 h-4 text-[#00C805]" />
          D.C. Neighborhood & Event Strategy Intelligence
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Hyper-Local Market & Event Strategy
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Washington, D.C. short-term rental performance is intensely driven by legislative calendars, international diplomatic summits, university academic milestones, and seasonal tourism.
        </p>

        {/* Neighborhood Tabs */}
        <div className="flex gap-2 overflow-x-auto pt-4 pb-1">
          {DC_NEIGHBORHOODS.map((n) => (
            <button
              key={n.id}
              onClick={() => onSelectNeighborhood(n.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 ${
                selected.id === n.id
                  ? 'bg-[#00C805] text-black font-extrabold shadow-md'
                  : 'bg-[#0B0E14] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Neighborhood Deep Dive */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#00C805]/10 text-[#00C805] rounded-full border border-[#00C805]/30">
                {selected.ward}
              </span>
              <span className="text-xs text-slate-400">Benchmark Metrics</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {selected.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{selected.vibe}</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
            <div className="p-3 bg-[#0B0E14] rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Typical ADR</span>
              <span className="text-lg font-bold text-[#00C805]">${selected.typicalADR}</span>
            </div>
            <div className="p-3 bg-[#0B0E14] rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Avg Occupancy</span>
              <span className="text-lg font-bold text-white">{selected.typicalOccupancy}%</span>
            </div>
            <div className="p-3 bg-[#0B0E14] rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">12-Mo Lease</span>
              <span className="text-lg font-bold text-white">${selected.benchmarkLongTermRent}/mo</span>
            </div>
          </div>
        </div>

        {/* Primary Guest Segments */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Primary Tenant / Guest Demand Drivers
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selected.demandDrivers.map((driver, idx) => (
              <li
                key={idx}
                className="p-4 bg-[#0B0E14] border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed"
              >
                {driver}
              </li>
            ))}
          </ul>
        </div>

        {/* Seasonal Surges */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#00C805]" />
            Seasonal Demand Cycles & Pricing Multipliers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selected.seasonalSurges.map((surge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-800 bg-[#0B0E14] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white">{surge.season}</span>
                  <span className="font-mono text-[#00C805] bg-[#00C805]/10 px-2 py-0.5 rounded-full text-[11px] border border-[#00C805]/30">
                    {surge.factor}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {surge.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Operational & Pricing Tactics */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#00C805]" />
            Hyper-Local Pricing Tactics
          </h4>
          <div className="space-y-2">
            {selected.eventPricingTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#0B0E14] border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-start gap-3"
              >
                <span className="w-5 h-5 bg-[#00C805] text-black rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
