import React from 'react';
import {
  X,
  Search,
  Check,
  Star,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  Car,
  Home,
  Info
} from 'lucide-react';
import { ComparableListing, FinancialInputs, NeighborhoodData, PropertyConfig } from '../types';
import { DC_COMPARABLE_LISTINGS, getCompsForProperty, INSIDE_AIRBNB_DC_SUMMARY } from '../data/comparableListings';

export type DrawerContentType =
  | 'comps'
  | 'residency_rule'
  | 'tax_breakdown'
  | 'neighborhood_intel'
  | 'fine_tune'
  | null;

interface VerticalInfoDrawerProps {
  isOpen: boolean;
  contentType: DrawerContentType;
  onClose: () => void;
  config: PropertyConfig;
  inputs: FinancialInputs;
  neighborhood: NeighborhoodData;
  onUpdateInputs: (updated: Partial<FinancialInputs>) => void;
  onNavigateToFullComps?: () => void;
}

export const VerticalInfoDrawer: React.FC<VerticalInfoDrawerProps> = ({
  isOpen,
  contentType,
  onClose,
  config,
  inputs,
  neighborhood,
  onUpdateInputs,
  onNavigateToFullComps,
}) => {
  if (!isOpen || !contentType) return null;

  const { comps, medianPrice, minPrice, maxPrice, avgOccupancy } = getCompsForProperty(
    config.neighborhoodId,
    config.bedrooms
  );

  const formatCurrency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dark backdrop blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Vertical Pop-up Sheet (Bottom Sheet on Mobile, Centered Modal Sheet on Desktop) */}
      <div className="relative w-full sm:max-w-2xl bg-[#121824] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-300">
        {/* Mobile Pull Indicator Bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#0B0E14] shrink-0">
          <div className="flex items-center gap-2.5">
            {contentType === 'comps' && (
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            )}
            {contentType === 'residency_rule' && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
            {contentType === 'tax_breakdown' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            )}
            {contentType === 'neighborhood_intel' && (
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            )}

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {contentType === 'comps' && `Nearby Airbnb Comps (${neighborhood.name.split('/')[0]})`}
                {contentType === 'residency_rule' && 'D.C. Primary Residence Rule Explained'}
                {contentType === 'tax_breakdown' && '14.95% D.C. Tax & Cost Breakdown'}
                {contentType === 'neighborhood_intel' && `${neighborhood.name.split('/')[0]} Event Pricing`}
              </h3>
              <p className="text-xs text-slate-400">
                {contentType === 'comps' && `Showing realistic local rates for a ${config.bedrooms === 0 ? 'Studio' : `${config.bedrooms}-bedroom`}`}
                {contentType === 'residency_rule' && 'Statutory Mandate: D.C. Official Code § 30-201'}
                {contentType === 'tax_breakdown' && 'Transparent formula used for your decision report'}
                {contentType === 'neighborhood_intel' && 'Local peak seasons and demand drivers'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200">
          {/* CONTENT 1: COMPS QUICK VIEW */}
          {contentType === 'comps' && (
            <div className="space-y-4">
              {/* Range Banner */}
              <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Neighborhood Range
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
                    <span className="text-xs font-normal text-slate-400"> / night</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Median Rate
                  </span>
                  <div className="text-xl font-bold font-mono text-[#00C805] mt-0.5">
                    {formatCurrency(medianPrice)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateInputs({ averageDailyRate: medianPrice });
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-xs rounded-xl transition-all shadow-sm shrink-0"
                >
                  Use ${medianPrice}
                </button>
              </div>

              {/* Comp Cards */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select a Comp to Adopt Its Nightly Price:
                </div>

                {comps.slice(0, 4).map((listing) => {
                  const isCurrent = inputs.averageDailyRate === listing.nightlyPrice;
                  return (
                    <div
                      key={listing.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isCurrent
                          ? 'border-[#00C805] bg-[#00C805]/10'
                          : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-900"
                        loading="lazy"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">
                            {listing.title}
                          </span>
                          {listing.isSuperhost && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold shrink-0">
                              ★ Superhost
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-current" />
                            {listing.rating}
                          </span>
                          <span>•</span>
                          <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}</span>
                          <span>•</span>
                          <span>{listing.bathrooms} Bath</span>
                        </div>

                        {listing.dlcpLicenseNumber && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>{listing.dlcpLicenseNumber}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 truncate">
                          {listing.highlight}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold font-mono text-[#00C805]">
                          ${listing.nightlyPrice}
                          <span className="text-[10px] font-normal text-slate-400">/nt</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateInputs({ averageDailyRate: listing.nightlyPrice });
                            onClose();
                          }}
                          className={`mt-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#00C805] text-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isCurrent ? 'Selected' : 'Use Rate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col items-center gap-1.5 text-center">
                {onNavigateToFullComps && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToFullComps();
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                  >
                    <span>Open full screen Comps Explorer & Filters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={INSIDE_AIRBNB_DC_SUMMARY.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-slate-300 inline-flex items-center gap-1"
                >
                  <span>Data verified via Inside Airbnb Washington, D.C.</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              </div>
            </div>
          )}

          {/* CONTENT 2: RESIDENCY RULE DEEP DIVE */}
          {contentType === 'residency_rule' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>The 183-Day Mandate</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Under <strong>D.C. Official Code § 30-201</strong> (Short-Term Rental Regulation Act), you may only list a home on Airbnb if you live in it as your permanent primary home for at least 183 days a year.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                  How D.C. Verifies This:
                </h5>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00C805] font-bold">1.</span>
                    <span><strong>Homestead Tax Deduction:</strong> The city checks if your property has an active Homestead deduction on record with the D.C. Tax Office.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00C805] font-bold">2.</span>
                    <span><strong>Platform Data Matching:</strong> Airbnb and VRBO are required by law to send host addresses and booking records to the D.C. government every month.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00C805] font-bold">3.</span>
                    <span><strong>Penalties:</strong> Listing an investment property triggers fines of $1,000 to $5,000 and permanent de-listing.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-white block">Safe Legal Alternative:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If this is an investment property or second home, you can legally lease it to a <strong>12-month tenant</strong> or a <strong>30-day+ traveling professional</strong> with zero Airbnb license restrictions!
                </p>
              </div>
            </div>
          )}

          {/* CONTENT 3: TAX & EXPENSE MATH BREAKDOWN */}
          {contentType === 'tax_breakdown' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block uppercase tracking-wider">
                  14.95% D.C. Hotel & Lodging Tax Formula:
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  In Washington, D.C., short-term stays are taxed at 14.95% (8.95% general lodging tax + 6.00% convention center tax).
                </p>
                <div className="text-xs font-mono text-emerald-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  Tax = Gross Nightly Revenue × 14.95%
                </div>
                <p className="text-xs text-slate-400">
                  Airbnb automatically collects this tax from guests and remits it to the D.C. Tax Office on your behalf.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                  Other Formula Deductions:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
                    <strong className="text-white block">Airbnb Host Fee:</strong>
                    <span className="text-slate-400">3.0% of nightly rate</span>
                  </div>
                  <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
                    <strong className="text-white block">Cleaning Turnovers:</strong>
                    <span className="text-slate-400">${inputs.turnoverCleaningCost} per guest stay</span>
                  </div>
                  <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
                    <strong className="text-white block">Host Utilities:</strong>
                    <span className="text-slate-400">${inputs.monthlyUtilities}/month (paid by host)</span>
                  </div>
                  <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800">
                    <strong className="text-white block">Breakeven Occupancy:</strong>
                    <span className="text-slate-400">Min % nights to match 12-mo tenant</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT 4: NEIGHBORHOOD INTEL */}
          {contentType === 'neighborhood_intel' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-[#00C805] uppercase tracking-wider block">
                  {neighborhood.name} Local Vibe
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {neighborhood.vibe}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                  Seasonal Pricing Surges:
                </h5>
                <div className="space-y-2 text-xs">
                  {neighborhood.seasonalSurges.map((surge, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{surge.season}</span>
                        <span className="text-[#00C805] font-mono">{surge.factor}</span>
                      </div>
                      <p className="text-slate-400">{surge.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Bar with Easy Go-Back Button */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0B0E14] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-xs sm:text-sm rounded-full transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Done · Return to Evaluator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
