import { ComparableListing } from '../types';
import { IA_COMPS, IA_SUMMARY, IA_AREAS, IA_CITY } from './insideAirbnb';

/**
 * Real Inside Airbnb Washington, D.C. Verified Dataset
 * 2026-09-19 Snapshot
 */
export const INSIDE_AIRBNB_DC_SUMMARY = IA_SUMMARY;

export const DC_COMPARABLE_LISTINGS: ComparableListing[] = IA_COMPS;

/**
 * Helper to retrieve real Inside Airbnb comparable listings for a neighborhood and bedroom count.
 */
export function getCompsForProperty(
  neighborhoodId: string,
  bedrooms: number
): {
  comps: ComparableListing[];
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgOccupancy: number;
} {
  let matched = DC_COMPARABLE_LISTINGS.filter(
    (c) => c.neighborhoodId === neighborhoodId && c.bedrooms === bedrooms
  );

  // If not enough listings in exact bedroom count, broaden to all in neighborhood
  if (matched.length === 0) {
    matched = DC_COMPARABLE_LISTINGS.filter((c) => c.neighborhoodId === neighborhoodId);
  }

  // If still empty (e.g. unknown neighborhood), return all comps
  if (matched.length === 0) {
    matched = DC_COMPARABLE_LISTINGS;
  }

  const prices = matched.map((c) => c.nightlyPrice).sort((a, b) => a - b);
  const medianPrice = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 225;
  const minPrice = prices.length > 0 ? prices[0] : 150;
  const maxPrice = prices.length > 0 ? prices[prices.length - 1] : 450;
  const avgOccupancy =
    matched.length > 0
      ? Math.round(matched.reduce((acc, c) => acc + (c.estimatedOccupancy || 70), 0) / matched.length)
      : 70;

  return {
    comps: matched,
    medianPrice,
    minPrice,
    maxPrice,
    avgOccupancy,
  };
}
