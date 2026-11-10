import { IA_AREAS, IA_CITY, IA_SUMMARY } from './insideAirbnb';
import { DC_NEIGHBORHOODS } from './dcNeighborhoods';
import { MarketBenchmark, PropertyType } from '../types';

/**
 * Cleanly look up Inside Airbnb statistical medians and benchmarks.
 * If fewer than 8 listings match the neighborhood + bedroom cohort,
 * falls back to the citywide figure and flags isCitywideFallback: true.
 */
export function getMarketBenchmark(
  neighborhoodId: string,
  propertyType: PropertyType,
  bedrooms: number
): MarketBenchmark {
  const neighborhood = DC_NEIGHBORHOODS.find((n) => n.id === neighborhoodId) || DC_NEIGHBORHOODS[0];
  const areaData = (IA_AREAS as Record<string, any>)[neighborhoodId];

  const clampedBedrooms = String(Math.min(4, Math.max(0, bedrooms)));
  const isPrivate = propertyType === 'hosted_room';

  const defaultCohort = isPrivate
    ? IA_CITY.privateRoom
    : ((IA_CITY.entireByBedrooms as Record<string, any>)[clampedBedrooms] || IA_CITY.entireByBedrooms['1']);

  let cohort: { n: number; median: number; nightsPerYear: number; p25?: number; p75?: number } = defaultCohort;
  let isCitywideFallback = true;

  if (areaData) {
    let localCohort = isPrivate
      ? areaData.privateRoom
      : areaData.entireByBedrooms?.[clampedBedrooms];

    if (localCohort && localCohort.n >= 8) {
      cohort = localCohort;
      isCitywideFallback = false;
    }
  }

  // Benchmark 12-month long-term market rent estimate
  const rentMultipliers: Record<string, number> = {
   '0': 1950,
   '1': 2500,
   '2': 3350,
   '3': 4400,
   '4': 5800,
  };
  const baseRent = isPrivate ? 1250 : (rentMultipliers[clampedBedrooms] || 2500);

  return {
    nightlyRate: cohort.median,
    typicalNightsBooked: cohort.nightsPerYear,
    p25Rate: cohort.p25 || Math.round(cohort.median * 0.85),
    p75Rate: cohort.p75 || Math.round(cohort.median * 1.2),
    sampleCount: cohort.n,
    isCitywideFallback,
    benchmarkLongTermRent: baseRent,
    neighborhoodName: neighborhood.name,
  };
}

export { IA_SUMMARY };
