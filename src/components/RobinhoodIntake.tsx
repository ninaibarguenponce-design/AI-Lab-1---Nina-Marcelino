import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building,
  Home,
  DoorOpen,
  DollarSign,
  Calendar,
  Sparkles,
  MapPin,
  ChevronRight,
  Check,
  Building2,
  Waves,
  Car,
  Shirt,
  Trees,
  Snowflake,
  Wifi,
  Maximize2,
  Search,
  ExternalLink,
  Info,
  HelpCircle
} from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';
import { PropertyConfig, FinancialInputs, PropertyType } from '../types';
import { DC_NEIGHBORHOODS } from '../data/dcNeighborhoods';
import { getCompsForProperty } from '../data/comparableListings';
import { VerticalInfoDrawer, DrawerContentType } from './VerticalInfoDrawer';

interface RobinhoodIntakeProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  onUpdateConfig: (updated: Partial<PropertyConfig>) => void;
  onUpdateInputs: (updated: Partial<FinancialInputs>) => void;
  onComplete: () => void;
  onLaunchLongTermWorkflow?: () => void;
  onOpenComps?: () => void;
  currentStep?: 1 | 2 | 3 | 4;
  onStepChange?: (step: 1 | 2 | 3 | 4) => void;
}

export const RobinhoodIntake: React.FC<RobinhoodIntakeProps> = ({
  config,
  inputs,
  onUpdateConfig,
  onUpdateInputs,
  onComplete,
  onLaunchLongTermWorkflow,
  onOpenComps,
  currentStep = 1,
  onStepChange,
}) => {
  const [localStep, setLocalStep] = useState<1 | 2 | 3 | 4>(currentStep);
  const [drawerType, setDrawerType] = useState<DrawerContentType>(null);

  const step = currentStep ?? localStep;
  const setStep = (newStep: 1 | 2 | 3 | 4) => {
    setLocalStep(newStep);
    if (onStepChange) {
      onStepChange(newStep);
    }
  };

  const selectedNeighborhood =
    DC_NEIGHBORHOODS.find((n) => n.id === config.neighborhoodId) ||
    DC_NEIGHBORHOODS[0];

  // Helper to dynamically adjust baseline rates when property specifications change
  const recalculateSuggestedRates = (
    neighborhoodId: string,
    bedrooms: number,
    amenitiesList: string[]
  ) => {
    const n = DC_NEIGHBORHOODS.find((item) => item.id === neighborhoodId) || DC_NEIGHBORHOODS[0];
    
    // Bedroom multiplier
    let multiplier = 1.0;
    if (bedrooms === 0) multiplier = 0.8;
    else if (bedrooms === 1) multiplier = 1.0;
    else if (bedrooms === 2) multiplier = 1.35;
    else if (bedrooms === 3) multiplier = 1.75;
    else if (bedrooms >= 4) multiplier = 2.2;

    const hasParking = amenitiesList.includes('parking');
    const hasPool = amenitiesList.includes('pool');

    const adrBonus = (hasParking ? 30 : 0) + (hasPool ? 35 : 0);
    const rentBonus = (hasParking ? 225 : 0) + (hasPool ? 150 : 0);

    const calculatedADR = Math.round(n.typicalADR * multiplier + adrBonus);
    const calculatedRent = Math.round(n.benchmarkLongTermRent * multiplier + rentBonus);

    onUpdateInputs({
      averageDailyRate: calculatedADR,
      occupancyRate: n.typicalOccupancy,
      longTermMonthlyRent: calculatedRent,
    });
  };

  const handleSelectNeighborhood = (id: string) => {
    onUpdateConfig({ neighborhoodId: id });
    recalculateSuggestedRates(id, config.bedrooms ?? 1, config.amenities ?? []);
  };

  const handleSelectPropertyType = (type: PropertyType) => {
    const hostingType = type === 'hosted_room' ? 'hosted' : 'unhosted';
    onUpdateConfig({
      propertyType: type,
      hostingType,
    });
  };

  const handleSetBedrooms = (count: number) => {
    onUpdateConfig({ bedrooms: count });
    recalculateSuggestedRates(config.neighborhoodId, count, config.amenities ?? []);
  };

  const handleSetBathrooms = (count: number) => {
    onUpdateConfig({ bathrooms: count });
  };

  const toggleAmenity = (amenityKey: string) => {
    const current = config.amenities || [];
    const next = current.includes(amenityKey)
      ? current.filter((a) => a !== amenityKey)
      : [...current, amenityKey];
    onUpdateConfig({ amenities: next });
    recalculateSuggestedRates(config.neighborhoodId, config.bedrooms ?? 1, next);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Progress Stepper */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C805]/10 text-[#00C805] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick 60-Second Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Can I Airbnb My D.C. Home?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Find out if your property complies with D.C. law and whether you'll make more money than with a regular tenant.
        </p>

        {/* Step Progress Bar with tap-to-navigate */}
        <div className="pt-3 flex items-center justify-center gap-2">
          {[
            { s: 1, name: 'Location' },
            { s: 2, name: 'Residency' },
            { s: 3, name: 'Details' },
            { s: 4, name: 'Financials' },
          ].map((item) => (
            <button
              key={item.s}
              type="button"
              onClick={() => setStep(item.s as 1 | 2 | 3 | 4)}
              className="flex items-center gap-1 group py-1"
              title={`Jump to Step ${item.s}: ${item.name}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  item.s === step
                    ? 'w-10 bg-[#00C805]'
                    : item.s < step
                    ? 'w-6 bg-emerald-500/60'
                    : 'w-6 bg-slate-800'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: NEIGHBORHOOD / LOCATION */}
      {step === 1 && (
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
                Step 1 of 4 · Location
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Where is your home located?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Select your D.C. neighborhood on the map or tap a button below.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDrawerType('neighborhood_intel')}
              className="px-3 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Info className="w-3.5 h-3.5 text-[#00C805]" />
              <span className="hidden sm:inline">Event Calendar</span>
            </button>
          </div>

          {/* Google Map View */}
          <GoogleMapView
            selectedNeighborhoodId={config.neighborhoodId}
            onSelectNeighborhood={handleSelectNeighborhood}
          />

          {/* Quick 1-Tap Neighborhood Chips */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2.5">
              Popular D.C. Areas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DC_NEIGHBORHOODS.map((n) => {
                const isSelected = n.id === config.neighborhoodId;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleSelectNeighborhood(n.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'border-[#00C805] bg-[#00C805]/10 text-white font-bold ring-1 ring-[#00C805]'
                        : 'border-slate-800 bg-[#0B0E14] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate">{n.name.split('/')[0]}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      ~${n.typicalADR}/night
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-sm rounded-full transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continue to Step 2: Residency Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRIMARY RESIDENCE (THE CRITICAL DC LAW) */}
      {step === 2 && (
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
                Step 2 of 4 · Residency Check
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Do you live here as your main home?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                D.C. law requires all short-term rentals to be in the owner's primary home.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDrawerType('residency_rule')}
              className="px-3 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Why does D.C. require this?"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Why this rule?</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card A: Yes (Primary) */}
            <button
              type="button"
              onClick={() => onUpdateConfig({ isPrimaryResidence: true })}
              className={`p-5 rounded-2xl border text-left transition-all relative ${
                config.isPrimaryResidence
                  ? 'border-[#00C805] bg-[#00C805]/10 ring-2 ring-[#00C805]'
                  : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
              }`}
            >
              {config.isPrimaryResidence && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00C805] text-black flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
              )}
              <div className="text-3xl mb-3">🏡</div>
              <h3 className="text-base font-bold text-white">
                Yes, this is my main home
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                I live here for at least 6 months (183 days) a year and claim the D.C. Homestead tax deduction.
              </p>
              <div className="mt-3 text-[11px] text-[#00C805] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Legally Eligible for D.C. License</span>
              </div>
            </button>

            {/* Card B: No (Investment) */}
            <button
              type="button"
              onClick={() => onUpdateConfig({ isPrimaryResidence: false })}
              className={`p-5 rounded-2xl border text-left transition-all relative ${
                !config.isPrimaryResidence
                  ? 'border-red-500 bg-red-950/20 ring-2 ring-red-500'
                  : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
              }`}
            >
              {!config.isPrimaryResidence && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">
                  ✕
                </div>
              )}
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-base font-bold text-white">
                No, it's an investment property
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                I live somewhere else. I bought this as a second home or long-term rental property.
              </p>
              <div className="mt-3 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Does not qualify for short-term rental</span>
              </div>
            </button>
          </div>

          {/* IMMEDIATE PROMPT FOR LONG-TERM RENTAL WORKFLOW IF INVESTMENT PROPERTY */}
          {!config.isPrimaryResidence && (
            <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-[#121824] to-emerald-950/30 border border-emerald-500/50 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Property does not qualify for Airbnb in D.C. — But don't worry!
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Under D.C. law, only primary residences qualify for short-term rental licenses. However, you can earn guaranteed, steady income with a <strong>12-Month Lease</strong> or a <strong>30-Day+ Furnished Rental</strong> (travel nurses, government contractors) with zero Airbnb license required!
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                {onLaunchLongTermWorkflow && (
                  <button
                    type="button"
                    onClick={onLaunchLongTermWorkflow}
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Launch Long-Term Rental Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors text-center"
                >
                  Continue Intake to Compare Numbers
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons: Explicit Go-Back */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-full border border-slate-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>← Back to Step 1 (Location)</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-4 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-sm rounded-full transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continue to Step 3: Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PROPERTY DETAILS, ROOMS, BATHS, AMENITIES */}
      {step === 3 && (
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
                Step 3 of 4 · Property Details
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Tell us about your home & rooms
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Rooms, bathrooms, and amenities help us accurately estimate your rental rates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Step 2</span>
            </button>
          </div>

          {/* Dwelling Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">
              What type of space is this?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  type: 'english_basement' as PropertyType,
                  title: 'English Basement / In-Law Suite',
                  description: 'Separate entrance basement apartment in your rowhome.',
                  icon: '🚪',
                },
                {
                  type: 'single_family' as PropertyType,
                  title: 'Entire House / Rowhome',
                  description: 'The whole house rented while you are away.',
                  icon: '🏠',
                },
                {
                  type: 'hosted_room' as PropertyType,
                  title: 'Spare Bedroom Suite',
                  description: 'You stay home upstairs while the guest rents a room.',
                  icon: '🛏️',
                },
                {
                  type: 'condo_coop' as PropertyType,
                  title: 'Condo / Apartment',
                  description: 'A unit in a managed condominium building.',
                  icon: '🏢',
                },
              ].map((item) => {
                const isSelected = config.propertyType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSelectPropertyType(item.type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#00C805] bg-[#00C805]/10 ring-1 ring-[#00C805]'
                        : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bedrooms & Bathrooms Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Bedrooms */}
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white block">
                Bedrooms
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Studio', value: 0 },
                  { label: '1 Bed', value: 1 },
                  { label: '2 Beds', value: 2 },
                  { label: '3 Beds', value: 3 },
                  { label: '4+ Beds', value: 4 },
                ].map((item) => {
                  const isSelected = config.bedrooms === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSetBedrooms(item.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#00C805] text-black shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white block">
                Bathrooms
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '1 Bath', value: 1 },
                  { label: '1.5 Baths', value: 1.5 },
                  { label: '2 Baths', value: 2 },
                  { label: '2.5 Baths', value: 2.5 },
                  { label: '3+ Baths', value: 3 },
                ].map((item) => {
                  const isSelected = config.bathrooms === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSetBathrooms(item.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#00C805] text-black shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Amenities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">
                Key Amenities
              </label>
              <span className="text-[11px] text-slate-400">Tap all that apply</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  key: 'parking',
                  label: 'Dedicated Parking',
                  sub: '+$225/mo in D.C.',
                  icon: Car,
                },
                {
                  key: 'pool',
                  label: 'Swimming Pool / Hot Tub',
                  sub: 'Luxury demand',
                  icon: Waves,
                },
                {
                  key: 'washer_dryer',
                  label: 'In-Unit Washer & Dryer',
                  sub: 'Top guest request',
                  icon: Shirt,
                },
                {
                  key: 'patio',
                  label: 'Private Patio / Backyard',
                  sub: 'Outdoor space',
                  icon: Trees,
                },
                {
                  key: 'ac',
                  label: 'Central Air Conditioning',
                  sub: 'Must-have in D.C. summer',
                  icon: Snowflake,
                },
                {
                  key: 'wifi',
                  label: 'Fast Wi-Fi',
                  sub: 'Work from home',
                  icon: Wifi,
                },
              ].map((item) => {
                const isSelected = (config.amenities || []).includes(item.key);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#00C805] bg-[#00C805]/15 text-white font-bold ring-1 ring-[#00C805]'
                        : 'border-slate-800 bg-[#0B0E14] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className={`w-4 h-4 ${
                          isSelected ? 'text-[#00C805]' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-xs font-semibold truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 pl-6">
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional: Square Footage */}
          <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Square Footage (Optional)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Approximate size of the living area
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="200"
                  max="6000"
                  step="50"
                  placeholder="e.g. 750"
                  value={config.squareFeet || ''}
                  onChange={(e) =>
                    onUpdateConfig({
                      squareFeet: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-24 px-3 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-[#00C805]"
                />
                <span className="text-xs text-slate-400">sq ft</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons: Explicit Go-Back */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-3.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-full border border-slate-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>← Back to Step 2: Residency</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 py-4 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-sm rounded-full transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continue to Step 4: Financials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FINANCIAL ESTIMATES */}
      {step === 4 && (
        <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C805]">
                Step 4 of 4 · Simple Financials
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Let's check the numbers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                We tailored realistic rates for your{' '}
                <strong>
                  {config.bedrooms === 0 ? 'Studio' : `${config.bedrooms}-bedroom`} in{' '}
                  {selectedNeighborhood.name}
                </strong>
                . You can adjust the sliders or keep our estimates!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDrawerType('tax_breakdown')}
              className="px-3 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="How is this calculated?"
            >
              <Info className="w-3.5 h-3.5 text-[#00C805]" />
              <span className="hidden sm:inline">Tax Formula</span>
            </button>
          </div>

          {/* Live Airbnb Comps Radar Banner - Direct Vertical Drawer Trigger */}
          {(() => {
            const compData = getCompsForProperty(config.neighborhoodId, config.bedrooms);
            return (
              <div className="p-4 bg-gradient-to-r from-blue-950/40 via-[#0B0E14] to-emerald-950/20 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                    <Search className="w-3.5 h-3.5" />
                    <span>Airbnb Comps in {selectedNeighborhood.name.split('/')[0]}:</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Similar {config.bedrooms === 0 ? 'studios' : `${config.bedrooms}-beds`} charge{' '}
                    <strong className="text-white">${compData.minPrice} – ${compData.maxPrice}</strong> (Median:{' '}
                    <strong className="text-[#00C805]">${compData.medianPrice}/night</strong>)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateInputs({ averageDailyRate: compData.medianPrice })}
                    className="px-3 py-1.5 bg-[#00C805]/15 hover:bg-[#00C805]/25 border border-[#00C805]/40 text-[#00C805] font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                  >
                    Use ${compData.medianPrice} Comp
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerType('comps')}
                    className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold text-xs rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                    title="View nearby Airbnb comps in pop-up without losing place"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>View Comps Popup</span>
                  </button>
                  {onOpenComps && (
                    <button
                      type="button"
                      onClick={onOpenComps}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
                      title="Open full page comps with back button"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          <div className="space-y-5">
            {/* Input 1: Nightly Price */}
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white">
                    Nightly Airbnb Rate
                  </label>
                  <p className="text-[11px] text-slate-400">
                    What guests pay per night
                  </p>
                </div>
                <div className="text-xl font-mono font-bold text-[#00C805]">
                  ${inputs.averageDailyRate}
                  <span className="text-xs text-slate-500 font-normal"> / night</span>
                </div>
              </div>
              <input
                type="range"
                min="80"
                max="750"
                step="5"
                value={inputs.averageDailyRate}
                onChange={(e) =>
                  onUpdateInputs({ averageDailyRate: Number(e.target.value) })
                }
                className="w-full accent-[#00C805] cursor-pointer"
              />
            </div>

            {/* Input 2: Nights Booked per Month */}
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white">
                    How many nights booked each month?
                  </label>
                  <p className="text-[11px] text-slate-400">
                    ~{inputs.occupancyRate}% of the month
                  </p>
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {Math.round(30.4 * (inputs.occupancyRate / 100))}
                  <span className="text-xs text-slate-500 font-normal"> nights</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={inputs.occupancyRate}
                onChange={(e) =>
                  onUpdateInputs({ occupancyRate: Number(e.target.value) })
                }
                className="w-full accent-[#00C805] cursor-pointer"
              />
            </div>

            {/* Input 3: Regular 12-Month Tenant Rent */}
            <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white">
                    Alternative: 12-Month Regular Tenant
                  </label>
                  <p className="text-[11px] text-slate-400">
                    What a normal yearly tenant would pay you
                  </p>
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  ${inputs.longTermMonthlyRent}
                  <span className="text-xs text-slate-500 font-normal"> / month</span>
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max="7000"
                step="50"
                value={inputs.longTermMonthlyRent}
                onChange={(e) =>
                  onUpdateInputs({ longTermMonthlyRent: Number(e.target.value) })
                }
                className="w-full accent-[#00C805] cursor-pointer"
              />
            </div>
          </div>

          {/* Navigation Buttons: Explicit Go-Back */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-3.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-full border border-slate-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>← Back to Step 3 (Details)</span>
            </button>

            <button
              type="button"
              onClick={onComplete}
              className="flex-1 py-4 bg-[#00C805] hover:bg-[#00b004] text-black font-black text-base rounded-full transition-all shadow-xl hover:shadow-[#00C805]/20 flex items-center justify-center gap-2 transform active:scale-98"
            >
              <span>See My Verdict & Profit</span>
              <ArrowRight className="w-5 h-5 stroke-3" />
            </button>
          </div>
        </div>
      )}

      {/* Vertical Info Pop-up Drawer (Delivery-App Style) */}
      <VerticalInfoDrawer
        isOpen={drawerType !== null}
        contentType={drawerType}
        onClose={() => setDrawerType(null)}
        config={config}
        inputs={inputs}
        neighborhood={selectedNeighborhood}
        onUpdateInputs={onUpdateInputs}
        onNavigateToFullComps={onOpenComps}
      />
    </div>
  );
};
