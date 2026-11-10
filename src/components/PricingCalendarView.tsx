import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  DollarSign,
  Info,
  Car,
  Train,
  TreePine,
  Laptop,
  Check,
  ChevronRight,
  ArrowLeft,
  Flame,
  ShieldCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import {
  DC_MONTHLY_PRICING,
  AMENITY_BOOSTS,
  computeBest90NightsStrategy,
  MonthPricingProfile
} from '../data/dcEventsCalendar';
import { PropertyConfig, FinancialInputs, NeighborhoodData } from '../types';

interface PricingCalendarViewProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  neighborhood: NeighborhoodData;
  onUpdateInputs?: (updated: Partial<FinancialInputs>) => void;
  onBackToPrevious: () => void;
}

export const PricingCalendarView: React.FC<PricingCalendarViewProps> = ({
  config,
  inputs,
  neighborhood,
  onUpdateInputs,
  onBackToPrevious,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'best90' | 'boosts'>('calendar');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<'all' | 'peak' | 'high' | 'shoulder' | 'low'>('all');

  // Amenity boost toggles state (pre-populate from config amenities if present)
  const [activeBoosts, setActiveBoosts] = useState<Record<string, boolean>>({
    parking: config.amenities.includes('parking'),
    metro_proximity: true, // Default to true in walkable DC
    private_patio: config.propertyType === 'english_basement' || config.propertyType === 'single_family',
    dedicated_workspace: config.amenities.includes('wifi'),
  });

  const [copiedTip, setCopiedTip] = useState<string | null>(null);

  // Compute total amenity boost dollar addition
  const totalAmenityBoost = useMemo(() => {
    return AMENITY_BOOSTS.reduce((sum, b) => {
      return activeBoosts[b.id] ? sum + b.dollarBoost : sum;
    }, 0);
  }, [activeBoosts]);

  // Base nightly rate from inputs plus active amenity boosts
  const effectiveBaseRate = inputs.averageDailyRate + totalAmenityBoost;

  // Best 90 Nights calculation
  const best90Strategy = useMemo(() => {
    return computeBest90NightsStrategy(effectiveBaseRate);
  }, [effectiveBaseRate]);

  // Filtered months
  const filteredMonths = useMemo(() => {
    if (selectedSeasonFilter === 'all') return DC_MONTHLY_PRICING;
    return DC_MONTHLY_PRICING.filter((m) => m.seasonType === selectedSeasonFilter);
  }, [selectedSeasonFilter]);

  const toggleBoost = (boostId: string) => {
    setActiveBoosts((prev) => ({
      ...prev,
      [boostId]: !prev[boostId],
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTip(id);
    setTimeout(() => setCopiedTip(null), 2500);
  };

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString('en-US')}`;

  // Peak month & lowest month metrics
  const peakMonth = DC_MONTHLY_PRICING.reduce((max, m) =>
    m.baseMultiplier > max.baseMultiplier ? m : max
  );
  const lowMonth = DC_MONTHLY_PRICING.reduce((min, m) =>
    m.baseMultiplier < min.baseMultiplier ? m : min
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={onBackToPrevious}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C805]/10 text-[#00C805] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>When & Why to Charge More</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            12-Month D.C. Event Pricing & Revenue Optimizer
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Washington, D.C. accommodation demand is driven by high-impact federal, political, and cultural calendar cycles. Use this guide to set peak rates for Cherry Blossom, graduations, and legislative sessions, and maximize your earnings.
          </p>
        </div>

        {/* Quick Rate Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="p-3 bg-[#0B0E14] rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Baseline Nightly Rate</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white">
              {formatCurrency(effectiveBaseRate)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {totalAmenityBoost > 0 ? `Includes +$${totalAmenityBoost} amenity boosts` : 'Standard median'}
            </span>
          </div>

          <div className="p-3 bg-emerald-950/20 rounded-2xl border border-emerald-500/30">
            <span className="text-[11px] font-semibold text-emerald-400 block flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>Peak Spring Rate</span>
            </span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white">
              {formatCurrency(effectiveBaseRate * peakMonth.baseMultiplier)}
            </span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">
              {peakMonth.monthName} (+50% Blossom surge)
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Low Season (Recess)</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-slate-300">
              {formatCurrency(effectiveBaseRate * lowMonth.baseMultiplier)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lowMonth.monthName} (-20% discount tip)
            </span>
          </div>

          <div className="p-3 bg-[#0B0E14] rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">D.C. Neighborhood</span>
            <span className="text-sm font-bold text-white truncate block">
              {neighborhood.name.split('/')[0]}
            </span>
            <span className="text-[10px] text-[#00C805] block mt-0.5">
              {config.isHomeDuringStay ? 'Hosted (Unlimited nights)' : 'Unhosted (90-night cap)'}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'calendar'
              ? 'bg-[#00C805] text-black shadow-lg shadow-[#00C805]/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>12-Month Pricing Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('best90')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'best90'
              ? 'bg-[#00C805] text-black shadow-lg shadow-[#00C805]/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Best 90 Nights Strategy</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            +$6k Upside
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('boosts')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'boosts'
              ? 'bg-[#00C805] text-black shadow-lg shadow-[#00C805]/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Metro & Parking Boosts</span>
          {totalAmenityBoost > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              +${totalAmenityBoost}/nt
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: 12-MONTH PRICING CALENDAR */}
      {/* ============================================================ */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          {/* Season Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Filter Season:</span>
            {[
              { id: 'all', label: 'All 12 Months' },
              { id: 'peak', label: 'Peak Surge (Blossom / Commencements)' },
              { id: 'high', label: 'High Demand (Fall Congress / Pride)' },
              { id: 'shoulder', label: 'Shoulder (January / November)' },
              { id: 'low', label: 'Low (August Recess / February)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedSeasonFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedSeasonFilter === f.id
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-[#121824] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid of Month Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMonths.map((m) => {
              const suggestedRate = Math.round(effectiveBaseRate * m.baseMultiplier);
              const percentDiff = Math.round((m.baseMultiplier - 1) * 100);
              const estMonthNights = Math.round(
                (inputs.expectedNightsBooked ?? 156) * m.typicalNightsBookedShare
              );
              const estMonthGross = suggestedRate * estMonthNights;

              const isPeak = m.seasonType === 'peak';
              const isHigh = m.seasonType === 'high';
              const isLow = m.seasonType === 'low';

              return (
                <div
                  key={m.monthIndex}
                  className={`bg-[#121824] rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 hover:border-slate-700 ${
                    isPeak
                      ? 'border-emerald-500/40 bg-gradient-to-b from-[#121824] to-emerald-950/10'
                      : isLow
                      ? 'border-slate-800/80 opacity-90'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{m.monthName}</h3>
                        <span className="text-[11px] text-slate-400">{m.seasonName}</span>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                          percentDiff > 0
                            ? 'bg-[#00C805]/15 text-[#00C805] border border-[#00C805]/30'
                            : percentDiff < 0
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {percentDiff > 0 ? `+${percentDiff}%` : `${percentDiff}%`}
                      </div>
                    </div>

                    {/* Rate Display */}
                    <div className="p-3 bg-[#0B0E14] rounded-2xl border border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Suggested Rate
                        </span>
                        <div className="text-2xl font-mono font-black text-white">
                          {formatCurrency(suggestedRate)}
                          <span className="text-xs text-slate-400 font-sans font-normal"> /night</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Est. Booked
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-bold">
                          ~{estMonthNights} nights ({formatCurrency(estMonthGross)})
                        </span>
                      </div>
                    </div>

                    {/* D.C. Events in this month */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Why to charge more:
                      </span>
                      {m.primaryEvents.map((evt) => (
                        <div key={evt.id} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{evt.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {evt.dates}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {evt.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategy Tip Footer */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-[#00C805] font-bold shrink-0">Tip:</span>
                      <span className="text-[11px] leading-relaxed text-slate-300">{m.hostStrategyTip}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/40 px-2 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="truncate">Rule: {m.minNightsRule}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: BEST 90 NIGHTS STRATEGY (FOR CAPPED HOSTS) */}
      {/* ============================================================ */}
      {activeSubTab === 'best90' && (
        <div className="space-y-6">
          {/* Hero Explainer Card */}
          <div className="bg-gradient-to-r from-emerald-950/30 via-[#121824] to-[#121824] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>D.C. 90-Night Legal Limit Optimizer</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Do Not Waste Your 90 Legal Nights on Low-Season Discounts
            </h2>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              If you host while away, Washington, D.C. strictly caps your vacation rental at <strong>90 nights per calendar year</strong>. If you accept bookings randomly year-round, you burn through your 90-night quota during cheap winter or August lulls.
            </p>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              By concentrating your 90 nights exclusively during D.C.’s 6 peak demand windows, your average nightly rate jumps from <strong>{formatCurrency(effectiveBaseRate)}</strong> to <strong>{formatCurrency(best90Strategy.optimizedAverageRate)}</strong> — putting an extra <strong>{formatCurrency(best90Strategy.revenueUpside)}</strong> in your pocket with zero additional cleaning or tenant wear.
            </p>

            {/* Side-by-side Comparative Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Random 90 Nights (Year-round)</span>
                <div className="text-xl font-mono font-bold text-slate-300">
                  {formatCurrency(best90Strategy.baselineRevenue90)}
                </div>
                <span className="text-[11px] text-slate-400 block font-mono">
                  90 nights × {formatCurrency(effectiveBaseRate)}/nt
                </span>
              </div>

              <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/40 space-y-1">
                <span className="text-xs text-emerald-400 font-bold">Optimized 90 Peak Nights</span>
                <div className="text-xl font-mono font-black text-[#00C805]">
                  {formatCurrency(best90Strategy.optimizedRevenue90)}
                </div>
                <span className="text-[11px] text-emerald-300/80 block font-mono">
                  90 nights × {formatCurrency(best90Strategy.optimizedAverageRate)}/nt
                </span>
              </div>

              <div className="p-4 bg-[#0B0E14] rounded-2xl border border-emerald-500/20 space-y-1 flex flex-col justify-center">
                <span className="text-xs text-slate-400 font-medium">Extra Cash Without Extra Nights</span>
                <div className="text-2xl font-mono font-black text-white">
                  +{formatCurrency(best90Strategy.revenueUpside)}
                </div>
                <span className="text-[11px] text-[#00C805] font-semibold">
                  +{best90Strategy.percentUpside}% gross income increase
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown of the 6 Best Windows */}
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">
                  The 6 High-Yield Calendar Windows (Exact 90 Nights)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep your Airbnb calendar blocked outside these dates to preserve your legal 90-night quota for maximum return.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    best90Strategy.windows
                      .map((w) => `${w.eventName} (${w.timeframe}): ${w.nightsAllocated} nights @ $${w.targetRate}/night`)
                      .join('\n'),
                    'all_windows'
                  )
                }
                className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                {copiedTip === 'all_windows' ? <Check className="w-3.5 h-3.5 text-[#00C805]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTip === 'all_windows' ? 'Copied Strategy!' : 'Copy 90-Night Schedule'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {best90Strategy.windows.map((win, idx) => (
                <div
                  key={win.id}
                  className="p-4 bg-[#0B0E14] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Window #{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{win.eventName}</h4>
                      <span className="text-[11px] font-mono text-[#00C805] font-semibold">
                        +{Math.round((win.surgeMultiplier - 1) * 100)}% Surge
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-medium">
                      Dates: <strong className="text-slate-200">{win.timeframe}</strong>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                      {win.whyThisWindow}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Rate</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {formatCurrency(win.targetRate)}
                        <span className="text-xs text-slate-400 font-normal">/nt</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quota Allocation</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {win.nightsAllocated} nights ({formatCurrency(win.targetRate * win.nightsAllocated)})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer Banner */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-bold text-white">Total Quota Allocated: 90 / 90 Nights</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                Projected Gross: {formatCurrency(best90Strategy.optimizedRevenue90)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: METRO & PARKING AMENITY BOOSTS */}
      {/* ============================================================ */}
      {activeSubTab === 'boosts' && (
        <div className="space-y-6">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
                D.C. Pricing Premium Calculator
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                How Much More Can You Charge for Parking & Metro Access?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                In Washington, D.C., short-term rental guests willingly pay major premiums for verified off-street parking (avoiding $40/day commercial garages and confusing street signs) and easy Metro access. Toggle your home’s features below to calculate your rate boost.
              </p>
            </div>

            {/* Amenity Boost Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AMENITY_BOOSTS.map((boost) => {
                const isSelected = !!activeBoosts[boost.id];

                return (
                  <div
                    key={boost.id}
                    onClick={() => toggleBoost(boost.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[#00C805]/50 bg-[#00C805]/5 ring-1 ring-[#00C805]/30'
                        : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#00C805] text-black font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {boost.id === 'parking' && <Car className="w-4 h-4" />}
                            {boost.id === 'metro_proximity' && <Train className="w-4 h-4" />}
                            {boost.id === 'private_patio' && <TreePine className="w-4 h-4" />}
                            {boost.id === 'dedicated_workspace' && <Laptop className="w-4 h-4" />}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{boost.name}</h3>
                            <span className="text-xs font-mono font-bold text-[#00C805]">
                              +${boost.dollarBoost}/night boost
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-[#00C805] text-black font-bold text-xs' : 'border border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {boost.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic leading-snug">
                      {boost.dcContext}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Impact Calculation Summary */}
            <div className="p-5 bg-[#0B0E14] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs text-slate-400">Total Nightly Amenity Boost</span>
                <div className="text-2xl font-mono font-black text-white">
                  +${totalAmenityBoost}
                  <span className="text-xs text-slate-400 font-normal"> /night</span>
                </div>
                <p className="text-xs text-slate-400">
                  Adds ~<strong>{formatCurrency(totalAmenityBoost * (inputs.expectedNightsBooked ?? 156))}</strong> to your gross annual revenue at typical {inputs.expectedNightsBooked ?? 156} booked nights.
                </p>
              </div>

              {onUpdateInputs && totalAmenityBoost > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateInputs({
                      averageDailyRate: inputs.averageDailyRate + totalAmenityBoost,
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-xs rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply +${totalAmenityBoost} to My Baseline Rate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
