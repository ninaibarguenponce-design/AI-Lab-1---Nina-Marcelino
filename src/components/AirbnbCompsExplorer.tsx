import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Star,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Car,
  Waves,
  Shirt,
  Trees,
  Snowflake,
  Wifi,
  Eye,
  Check,
  ArrowLeft
} from 'lucide-react';
import { ComparableListing, FinancialInputs, NeighborhoodData, PropertyConfig } from '../types';
import { DC_COMPARABLE_LISTINGS, getCompsForProperty } from '../data/comparableListings';

interface AirbnbCompsExplorerProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  neighborhood: NeighborhoodData;
  onUpdateInputs: (updated: Partial<FinancialInputs>) => void;
  onNavigateToLaunch?: () => void;
  onBackToStep4?: () => void;
}

export const AirbnbCompsExplorer: React.FC<AirbnbCompsExplorerProps> = ({
  config,
  inputs,
  neighborhood,
  onUpdateInputs,
  onNavigateToLaunch,
  onBackToStep4,
}) => {
  const [selectedBedFilter, setSelectedBedFilter] = useState<number | 'all'>('all');
  const [onlySuperhost, setOnlySuperhost] = useState<boolean>(false);
  const [onlyParking, setOnlyParking] = useState<boolean>(false);
  const [adoptedListingId, setAdoptedListingId] = useState<string | null>(null);

  // Compute raw comps for current neighborhood
  const { comps, medianPrice, minPrice, maxPrice, avgOccupancy } = useMemo(
    () => getCompsForProperty(config.neighborhoodId, config.bedrooms),
    [config.neighborhoodId, config.bedrooms]
  );

  // Filter listings based on user toggles
  const filteredComps = useMemo(() => {
    return DC_COMPARABLE_LISTINGS.filter((item) => {
      // Must match neighborhood
      if (item.neighborhoodId !== config.neighborhoodId) return false;

      // Bed filter
      if (selectedBedFilter !== 'all' && item.bedrooms !== selectedBedFilter) {
        return false;
      }

      // Superhost filter
      if (onlySuperhost && !item.isSuperhost) return false;

      // Parking filter
      if (onlyParking && !item.amenities.includes('parking')) return false;

      return true;
    });
  }, [config.neighborhoodId, selectedBedFilter, onlySuperhost, onlyParking]);

  const handleAdoptRate = (price: number, listingId?: string) => {
    onUpdateInputs({ averageDailyRate: price });
    if (listingId) {
      setAdoptedListingId(listingId);
      setTimeout(() => setAdoptedListingId(null), 2500);
    }
  };

  const formatCurrency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  const liveAirbnbSearchUrl = `https://www.airbnb.com/s/${encodeURIComponent(
    neighborhood.name.split('/')[0] + ', Washington, DC'
  )}/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&search_type=filter_change&min_bedrooms=${
    config.bedrooms || 1
  }`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        {onBackToStep4 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onBackToStep4}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 text-[#00C805] group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Step 4: Simple Financials</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C805]/10 text-[#00C805] text-xs font-bold uppercase tracking-wider mb-2">
              <Search className="w-3.5 h-3.5" />
              <span>Airbnb Market Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Comparable Airbnb Listings in {neighborhood.name.split('/')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time competitive pricing benchmarks for a{' '}
              <strong className="text-white">
                {config.bedrooms === 0 ? 'Studio' : `${config.bedrooms}-bedroom`}
              </strong>{' '}
              home in your exact D.C. neighborhood. See what active hosts charge and adopt their nightly rates with 1 tap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {onBackToStep4 && (
              <button
                type="button"
                onClick={onBackToStep4}
                className="px-4 py-2.5 bg-[#00C805]/15 hover:bg-[#00C805]/25 text-[#00C805] border border-[#00C805]/40 font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Step 4</span>
              </button>
            )}

            <a
              href={liveAirbnbSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-full border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Search Live on Airbnb</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onNavigateToLaunch && (
              <button
                onClick={onNavigateToLaunch}
                className="px-5 py-2.5 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-xs rounded-full transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Ready to List? Launch Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRIC RANGE SUMMARY CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Median Nightly Rate */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Median Nightly Price
          </span>
          <div className="text-3xl font-black font-mono text-[#00C805]">
            {formatCurrency(medianPrice)}
            <span className="text-xs font-normal text-slate-400"> / night</span>
          </div>
          <div className="pt-2">
            <button
              onClick={() => handleAdoptRate(medianPrice)}
              className="w-full py-1.5 px-2.5 bg-[#00C805]/15 hover:bg-[#00C805]/25 border border-[#00C805]/40 text-[#00C805] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>Use This Rate (${medianPrice})</span>
            </button>
          </div>
        </div>

        {/* Typical Price Range */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Neighbor Price Range
          </span>
          <div className="text-2xl font-black font-mono text-white">
            {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Low to premium rates based on finishes and parking.
          </p>
        </div>

        {/* Local Booking Occupancy */}
        <div className="bg-[#121824] p-5 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Average Occupancy
          </span>
          <div className="text-3xl font-black font-mono text-white">
            {avgOccupancy}%
            <span className="text-xs font-normal text-slate-400"> / month</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            ~{Math.round(30.4 * (avgOccupancy / 100))} nights booked per month
          </p>
        </div>

        {/* Current Evaluator Setting */}
        <div className="bg-[#0B0E14] p-5 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Your Selected Rate
          </span>
          <div className="text-3xl font-black font-mono text-white">
            {formatCurrency(inputs.averageDailyRate)}
            <span className="text-xs font-normal text-slate-400"> / night</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            {inputs.averageDailyRate > medianPrice
              ? `+$${inputs.averageDailyRate - medianPrice} above neighborhood median`
              : inputs.averageDailyRate < medianPrice
              ? `-$${medianPrice - inputs.averageDailyRate} below neighborhood median`
              : 'Matched to neighborhood median'}
          </p>
        </div>
      </div>

      {/* FILTER & SORT STRIP */}
      <div className="bg-[#121824] p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Comps:</span>
          </span>

          {/* Bedroom Filter */}
          <div className="flex items-center bg-[#0B0E14] rounded-lg border border-slate-800 p-0.5 text-xs font-semibold">
            {[
              { label: 'All Beds', value: 'all' as const },
              { label: 'Studio', value: 0 },
              { label: '1 Bed', value: 1 },
              { label: '2 Beds', value: 2 },
              { label: '3+ Beds', value: 3 },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => setSelectedBedFilter(b.value)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedBedFilter === b.value
                    ? 'bg-[#00C805] text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Superhost Only */}
          <button
            onClick={() => setOnlySuperhost(!onlySuperhost)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
              onlySuperhost
                ? 'bg-[#00C805]/20 text-[#00C805] border-[#00C805]/40 font-bold'
                : 'bg-[#0B0E14] text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Superhost Only</span>
          </button>

          {/* Parking Only */}
          <button
            onClick={() => setOnlyParking(!onlyParking)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
              onlyParking
                ? 'bg-[#00C805]/20 text-[#00C805] border-[#00C805]/40 font-bold'
                : 'bg-[#0B0E14] text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Dedicated Parking</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredComps.length} nearby listings
        </span>
      </div>

      {/* COMPARABLE LISTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredComps.map((listing) => {
          const isAdopted = adoptedListingId === listing.id;
          const isCurrentlySet = inputs.averageDailyRate === listing.nightlyPrice;

          return (
            <div
              key={listing.id}
              className="bg-[#121824] rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl hover:border-slate-600 transition-all flex flex-col group"
            >
              {/* Photo & Badge Bar */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-[#0B0E14]/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                    {listing.propertyTypeLabel}
                  </span>
                  {listing.isSuperhost && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Superhost</span>
                    </span>
                  )}
                </div>

                {/* Distance Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#0B0E14]/80 backdrop-blur-md text-slate-300 text-[10px] font-mono border border-white/10">
                  {listing.distanceMiles} mi from center
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-bold text-white bg-[#0B0E14]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{listing.rating}</span>
                  <span className="text-slate-400 font-normal">
                    ({listing.reviewsCount} reviews)
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-[#00C805] transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {listing.highlight}
                  </p>

                  {/* Room specs */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>
                      {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bedroom`}
                    </span>
                    <span>•</span>
                    <span>{listing.bathrooms} Bath</span>
                    <span>•</span>
                    <span>Up to {listing.accommodates} Guests</span>
                  </div>

                  {/* Amenities Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {listing.amenities.map((am) => (
                      <span
                        key={am}
                        className="px-2 py-0.5 rounded-md bg-[#0B0E14] text-slate-300 text-[10px] border border-slate-800"
                      >
                        {am === 'parking' && '🅿️ Dedicated Parking'}
                        {am === 'washer_dryer' && '🧺 Washer/Dryer'}
                        {am === 'pool' && '🏊 Pool Access'}
                        {am === 'patio' && '🌿 Patio/Yard'}
                        {am === 'ac' && '❄️ Central AC'}
                        {am === 'wifi' && '⚡ Wi-Fi'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & 1-Tap Adoption Action */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-2xl font-black font-mono text-[#00C805]">
                      ${listing.nightlyPrice}
                      <span className="text-xs text-slate-400 font-normal"> / night</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      +${listing.cleaningFee} cleaning fee · ~{listing.estimatedOccupancy}% occupancy
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdoptRate(listing.nightlyPrice, listing.id)}
                    className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm ${
                      isAdopted || isCurrentlySet
                        ? 'bg-[#00C805] text-black shadow-[#00C805]/20 ring-2 ring-[#00C805]'
                        : 'bg-[#1E293B] hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {isAdopted || isCurrentlySet ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-3" />
                        <span>Rate Applied!</span>
                      </>
                    ) : (
                      <>
                        <span>Use ${listing.nightlyPrice} Rate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Guidance Banner */}
      <div className="p-5 bg-[#0B0E14] border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00C805]" />
            <span>How to Win Against Nearby D.C. Airbnb Listings</span>
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            In Washington, D.C., listings with <strong>Dedicated Parking</strong> command a $25–$35/night premium. If your home has a private patio or fast Wi-Fi for remote government workers, highlight them in your listing title!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onBackToStep4 && (
            <button
              type="button"
              onClick={onBackToStep4}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 4</span>
            </button>
          )}

          {onNavigateToLaunch && (
            <button
              onClick={onNavigateToLaunch}
              className="w-full sm:w-auto px-6 py-3 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-xs rounded-full transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Listing Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
