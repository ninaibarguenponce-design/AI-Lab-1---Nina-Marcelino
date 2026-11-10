import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Building,
  DoorOpen,
  DollarSign,
  Calendar,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  Building2,
  MapPin
} from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';
import { PropertyConfig, FinancialInputs, PropertyType } from '../types';
import { DC_NEIGHBORHOODS } from '../data/dcNeighborhoods';
import { getMarketBenchmark } from '../data/marketData';
import { VACATION_RENTAL_NIGHT_CAP, DC_LODGING_TAX_PERCENT } from '../data/dcRules';

interface RobinhoodIntakeProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  onUpdateConfig: (updated: Partial<PropertyConfig>) => void;
  onUpdateInputs: (updated: Partial<FinancialInputs>) => void;
  onComplete: () => void;
  currentStep?: 1 | 2 | 3;
  onStepChange?: (step: 1 | 2 | 3) => void;
}

export const RobinhoodIntake: React.FC<RobinhoodIntakeProps> = ({
  config,
  inputs,
  onUpdateConfig,
  onUpdateInputs,
  onComplete,
  currentStep = 1,
  onStepChange,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(currentStep);

  const goToStep = (newStep: 1 | 2 | 3) => {
    setStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  const selectedNeighborhood =
    DC_NEIGHBORHOODS.find((n) => n.id === config.neighborhoodId) || DC_NEIGHBORHOODS[0];

  // Look up real Inside Airbnb statistical medians for this property cohort
  const marketBenchmark = getMarketBenchmark(
    config.neighborhoodId,
    config.propertyType,
    config.bedrooms
  );

  // Sync market medians when neighborhood, property type, or bedrooms change
  const applyMarketDefaults = (
    neighborhoodId: string,
    propertyType: PropertyType,
    bedrooms: number
  ) => {
    const benchmark = getMarketBenchmark(neighborhoodId, propertyType, bedrooms);
    onUpdateInputs({
      averageDailyRate: benchmark.nightlyRate,
      expectedNightsBooked: benchmark.typicalNightsBooked,
      occupancyRate: Math.min(100, Math.round((benchmark.typicalNightsBooked / 365) * 100)),
      longTermMonthlyRent: benchmark.benchmarkLongTermRent,
    });
  };

  const handleSelectPropertyType = (type: PropertyType) => {
    // Default basements and spare bedrooms to "home", whole houses to "away"
    let defaultHomeDuringStay = config.isHomeDuringStay;
    if (type === 'english_basement' || type === 'accessory_dwelling_unit' || type === 'hosted_room') {
      defaultHomeDuringStay = true;
    } else if (type === 'single_family') {
      defaultHomeDuringStay = false;
    }

    onUpdateConfig({ propertyType: type, isHomeDuringStay: defaultHomeDuringStay });
    applyMarketDefaults(config.neighborhoodId, type, config.bedrooms);
  };

  const handleSelectNeighborhood = (neighborhoodId: string) => {
    onUpdateConfig({ neighborhoodId });
    applyMarketDefaults(neighborhoodId, config.propertyType, config.bedrooms);
  };

  const handleSelectBedrooms = (bedrooms: number) => {
    onUpdateConfig({ bedrooms });
    applyMarketDefaults(config.neighborhoodId, config.propertyType, bedrooms);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Container Card */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold text-[#00C805] uppercase tracking-wider">
              Step {step} of 3
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {step === 1 && 'Tell us about your home'}
              {step === 2 && 'Review market prices & demand'}
              {step === 3 && 'Operating costs & turnover'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Washington, D.C. Data
          </span>
        </div>

        {/* ================= STEP 1: YOUR HOME ================= */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Primary Residence Gate */}
            <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-5 space-y-3">
              <label className="text-sm font-bold text-white block">
                Do you live in this home as your primary residence?
              </label>
              <p className="text-xs text-slate-400 leading-relaxed">
                D.C. law requires hosts to live in the home for at least 183 days per year. Short-term rental licenses are never granted for second homes or investment properties.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ isPrimaryResidence: true })}
                  className={`p-3.5 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    config.isPrimaryResidence
                      ? 'bg-[#00C805]/15 border-[#00C805] text-white ring-1 ring-[#00C805]/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Yes, I live here</span>
                    {config.isPrimaryResidence && <Check className="w-4 h-4 text-[#00C805]" />}
                  </div>
                  <div className="text-[11px] font-normal text-slate-400 mt-1">
                    At least 183 days / year
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateConfig({ isPrimaryResidence: false })}
                  className={`p-3.5 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    !config.isPrimaryResidence
                      ? 'bg-red-500/15 border-red-500 text-white ring-1 ring-red-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>No, secondary or investment</span>
                    {!config.isPrimaryResidence && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="text-[11px] font-normal text-slate-400 mt-1">
                    Not eligible for Airbnb in D.C.
                  </div>
                </button>
              </div>

              {!config.isPrimaryResidence && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
                  <strong>Important D.C. Rule:</strong> Because this is not your primary residence, D.C. will not issue an Airbnb license. You can continue to see the 12-month tenant returns or explore 30+ day furnished rentals.
                </div>
              )}
            </div>

            {/* Neighborhood Selector & Interactive Map */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white flex items-center justify-between">
                <span>Neighborhood</span>
                <span className="text-xs font-normal text-slate-400">
                  {selectedNeighborhood.ward}
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DC_NEIGHBORHOODS.map((n) => {
                  const isSelected = n.id === config.neighborhoodId;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleSelectNeighborhood(n.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00C805]/15 border-[#00C805] text-white ring-1 ring-[#00C805]/40 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs truncate">{n.name.split('/')[0]}</div>
                      <div className="text-[10px] text-slate-400">{n.ward}</div>
                    </button>
                  );
                })}
              </div>

              {/* Map embed */}
              <GoogleMapView
                selectedNeighborhoodId={config.neighborhoodId}
                onSelectNeighborhood={handleSelectNeighborhood}
              />
            </div>

            {/* Property Layout */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white block">
                What type of space will you rent?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'english_basement' as PropertyType,
                    label: 'English Basement / In-Law Suite',
                    desc: 'Self-contained basement unit with private entrance',
                    icon: DoorOpen,
                  },
                  {
                    id: 'single_family' as PropertyType,
                    label: 'Entire Single-Family House',
                    desc: 'Whole detached home or historic rowhouse',
                    icon: Home,
                  },
                  {
                    id: 'condo_coop' as PropertyType,
                    label: 'Condominium or Co-op',
                    desc: 'Apartment unit in a multi-unit building',
                    icon: Building,
                  },
                  {
                    id: 'hosted_room' as PropertyType,
                    label: 'Private Bedroom in Your Home',
                    desc: 'Spare bedroom with shared or private bath',
                    icon: Building2,
                  },
                ].map((item) => {
                  const isSelected = config.propertyType === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPropertyType(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00C805]/15 border-[#00C805] text-white ring-1 ring-[#00C805]/40'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-[#00C805]' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crucial D.C. Question: Will you be home while guests stay? */}
            <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-5 space-y-3">
              <label className="text-sm font-bold text-white block">
                Will you be home while guests stay?
              </label>
              <p className="text-xs text-slate-400 leading-relaxed">
                Under D.C. law, this determines whether you receive an unlimited <strong>Short-Term Rental</strong> license (when on-site) or a <strong>Vacation Rental</strong> license capped at 90 nights per calendar year (when away).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ isHomeDuringStay: true })}
                  className={`p-3.5 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    config.isHomeDuringStay
                      ? 'bg-[#00C805]/15 border-[#00C805] text-white ring-1 ring-[#00C805]/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Yes, I will be home</span>
                    {config.isHomeDuringStay && <Check className="w-4 h-4 text-[#00C805]" />}
                  </div>
                  <div className="text-xs font-normal text-slate-300 mt-1">
                    No 90-night limit
                  </div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                    For example, living upstairs while guests stay in the basement
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateConfig({ isHomeDuringStay: false })}
                  className={`p-3.5 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    !config.isHomeDuringStay
                      ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>No, I will be away</span>
                    {!config.isHomeDuringStay && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-xs font-normal text-amber-300 mt-1">
                    Strict 90-night annual limit
                  </div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                    D.C. caps vacation rentals without owner on-site to 90 nights/year
                  </div>
                </button>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Bedrooms</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { val: 0, label: 'Studio' },
                    { val: 1, label: '1 Bed' },
                    { val: 2, label: '2 Beds' },
                    { val: 3, label: '3 Beds' },
                    { val: 4, label: '4+ Beds' },
                  ].map((b) => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => handleSelectBedrooms(b.val)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        config.bedrooms === b.val
                          ? 'bg-[#00C805] text-black border-[#00C805]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Bathrooms</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 1.5, 2, 3].map((bath) => (
                    <button
                      key={bath}
                      type="button"
                      onClick={() => onUpdateConfig({ bathrooms: bath })}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        config.bathrooms === bath
                          ? 'bg-[#00C805] text-black border-[#00C805]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {bath} Bath{bath > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-6 py-3 rounded-full bg-[#00C805] hover:bg-[#00B004] text-black font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#00C805]/20 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MARKET NUMBERS ================= */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Real Data Provenance Callout */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00C805]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inside Airbnb Real Market Benchmark</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {marketBenchmark.isCitywideFallback ? (
                  <>
                    Suggested figures are based on the <strong>citywide D.C. median</strong> because fewer than 8 comparable listings match this exact cohort in {marketBenchmark.neighborhoodName}.
                  </>
                ) : (
                  <>
                    Suggested figures are based on the statistical median of <strong>{marketBenchmark.sampleCount} real listings</strong> in {marketBenchmark.neighborhoodName} from the September 2026 Inside Airbnb snapshot.
                  </>
                )}
              </p>
            </div>

            {/* Nightly Price & Booked Nights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nightly Price */}
              <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Nightly Price (Nightly Rate)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={inputs.averageDailyRate}
                    onChange={(e) =>
                      onUpdateInputs({ averageDailyRate: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-[#00C805]"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Median for this cohort: ${marketBenchmark.nightlyRate} (range: ${marketBenchmark.p25Rate} - ${marketBenchmark.p75Rate})
                </div>
              </div>

              {/* Booked Nights / Year */}
              <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Expected Booked Nights per Year
                </label>
                <input
                  type="number"
                  value={inputs.expectedNightsBooked ?? Math.round(365 * (inputs.occupancyRate / 100))}
                  onChange={(e) => {
                    const nights = Math.max(1, Math.min(365, Number(e.target.value)));
                    onUpdateInputs({
                      expectedNightsBooked: nights,
                      occupancyRate: Math.round((nights / 365) * 100),
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-[#00C805]"
                />
                <div className="text-[11px] text-slate-400">
                  {config.isHomeDuringStay ? (
                    <>Typical for this cohort: {marketBenchmark.typicalNightsBooked} nights/year (no D.C. cap)</>
                  ) : (
                    <span className="text-amber-300 font-semibold">
                      You are away: D.C. legally limits your booked nights to {VACATION_RENTAL_NIGHT_CAP} nights/year.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 12-Month Lease Comparison Baseline */}
            <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-5 space-y-2.5">
              <label className="text-sm font-bold text-white flex items-center justify-between">
                <span>12-Month Lease Rent (Monthly)</span>
                <span className="text-xs font-normal text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Estimate — please replace with your number
                </span>
              </label>
              <p className="text-xs text-slate-400">
                This is what a standard year-round tenant would pay. We estimate this based on current market averages, but you should adjust it to match your home.
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  value={inputs.longTermMonthlyRent}
                  onChange={(e) =>
                    onUpdateInputs({ longTermMonthlyRent: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-[#00C805]"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="px-6 py-3 rounded-full bg-[#00C805] hover:bg-[#00B004] text-black font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#00C805]/20 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: COSTS & TURNOVER ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-xs text-slate-400">
              Short-term hosting carries cleaning and turnover costs that 12-month tenants do not require. Adjust these defaults to fit your home:
            </p>

            {/* Cleaning & Turnover Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Cleaner Cost per Turnover
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={inputs.turnoverCleaningCost}
                    onChange={(e) =>
                      onUpdateInputs({ turnoverCleaningCost: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-[#00C805]"
                  />
                </div>
                <div className="text-[11px] text-slate-400">What you pay the cleaners per stay</div>
              </div>

              <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Cleaning Fee Charged to Guest
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={inputs.cleaningFeeChargedToGuest}
                    onChange={(e) =>
                      onUpdateInputs({ cleaningFeeChargedToGuest: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-[#00C805]"
                  />
                </div>
                <div className="text-[11px] text-slate-400">Offset collected from guest</div>
              </div>
            </div>

            {/* Monthly Operating Costs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Monthly Utilities</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={inputs.monthlyUtilities}
                    onChange={(e) =>
                      onUpdateInputs({ monthlyUtilities: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00C805]"
                  />
                </div>
                <div className="text-[10px] text-slate-400">Power, water, high-speed WiFi</div>
              </div>

              <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Monthly Supplies & Wear</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={inputs.monthlySuppliesAndWear}
                    onChange={(e) =>
                      onUpdateInputs({ monthlySuppliesAndWear: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00C805]"
                  />
                </div>
                <div className="text-[10px] text-slate-400">Coffee, linens, toiletries</div>
              </div>

              <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Insurance & License</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={inputs.monthlyInsuranceAndLicense}
                    onChange={(e) =>
                      onUpdateInputs({ monthlyInsuranceAndLicense: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00C805]"
                  />
                </div>
                <div className="text-[10px] text-slate-400">D.C. $99 license + insurance rider</div>
              </div>
            </div>

            {/* D.C. Lodging Tax Clear Statement */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <strong>D.C. Lodging Tax ({DC_LODGING_TAX_PERCENT}%):</strong> This tax is paid by your guest on top of your nightly rate. Airbnb collects and remits it directly to the D.C. Tax Office. It is never subtracted from your earnings.
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="px-7 py-3 rounded-full bg-[#00C805] hover:bg-[#00B004] text-black font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#00C805]/20 cursor-pointer"
              >
                <span>See your answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
