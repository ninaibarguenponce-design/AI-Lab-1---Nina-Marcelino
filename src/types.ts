export type PropertyType =
  | 'single_family'
  | 'english_basement'
  | 'accessory_dwelling_unit'
  | 'hosted_room'
  | 'condo_coop'
  | 'secondary_investment';

export type HostingType = 'hosted' | 'unhosted';

export type Recommendation = 'airbnb' | 'long_term' | 'not_allowed';

export type ComplianceLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface PropertyConfig {
  nickname: string;
  neighborhoodId: string;
  propertyType: PropertyType;
  isPrimaryResidence: boolean; // Lives in home >= 183 days/yr
  isHomeDuringStay: boolean; // Will the owner be home while guests stay?
  bedrooms: number; // 0 for studio, 1, 2, 3, 4+
  bathrooms: number; // 1, 1.5, 2, 2.5, 3+
  squareFeet?: number;
  amenities: string[];
  hasHardshipExemption: boolean;
  hasCleanHandsCertificate: boolean;
  hasSmokeAndCoDetectors: boolean;
  hasFireExtinguisher: boolean;
  hasCertificateOfOccupancy: boolean;
  hoaBylawsPermitSTR: boolean;
  hasStrLiabilityInsurance: boolean;
  hostingType?: HostingType;
}

export interface FinancialInputs {
  averageDailyRate: number; // Nightly price ($)
  occupancyRate: number; // Expected occupancy % (0-100)
  expectedNightsBooked?: number; // Optional direct expected nights/year
  averageStayLength: number; // Nights per stay
  turnoverCleaningCost: number; // Real cost paid per turnover
  cleaningFeeChargedToGuest: number; // Fee collected from guest
  platformFeePercent: number; // Airbnb host fee (typically 3%)
  monthlyUtilities: number; // Electric, gas, water, internet
  monthlySuppliesAndWear: number; // Coffee, linens, toiletries, wear
  monthlyInsuranceAndLicense: number; // Insurance rider + license fee amortization
  
  // Long-Term Lease Baseline
  longTermMonthlyRent: number; // Market 12-month lease rent ($)
  longTermPropertyManagementPercent: number; // 0% if self-managed
  longTermVacancyPercent: number; // Vacancy allowance % (typically 5%)
  longTermMaintenanceReserve: number; // Monthly maintenance allowance ($)
  
  // Legacy alias
  dcTransientTaxPercent?: number;
}

export interface FinancialOutputs {
  recommendation: Recommendation;
  verdictHeadline: string; // "List it on Airbnb." | "Keep a 12-month tenant." | "It's nearly a tie." | "Airbnb is not allowed under D.C. law."
  verdictReason: string;
  isNearTie: boolean; // True if annual difference is <= 5%
  annualProfitDelta: number; // Airbnb net - Long-term net
  monthlyProfitDelta: number;
  
  // Nights & Caps
  expectedNightsPerYear: number;
  dcAllowedNightsPerYear: number; // 365 if home during stay, 90 if away
  bookedNightsPerYear: number; // min(expectedNights, dcAllowedNights)
  actualBookedNights?: number; // alias
  allowedNightCap?: number; // alias
  bookedNightsPerMonth: number;
  isSubjectTo90DayCap: boolean;
  is90NightCapLimiting: boolean; // True if expected nights exceeded 90 while away
  
  // Airbnb Revenue & Deductions
  grossAnnualSTRRevenue: number;
  grossMonthlySTRRevenue: number;
  lodgingTaxPercent: number; // 15.95%
  lodgingTaxAnnual: number; // Paid by guest, collected by Airbnb (NOT deducted from owner)
  lodgingTaxMonthly: number;
  dcTransientTaxAmount: number; // alias for display
  platformFeeAmount: number;
  platformFeeAnnual: number;
  estimatedStaysPerMonth: number;
  estimatedStaysPerYear: number;
  totalCleaningCost: number;
  totalCleaningFeeRecovered: number;
  netTurnoverCost: number;
  annualCleaningCost: number;
  fixedMonthlyExpenses: number;
  annualFixedExpenses: number;
  annualOperatingCosts?: number;
  totalMonthlyExpenses: number;
  netMonthlySTRProfit: number;
  airbnbNetAnnual: number;
  netAnnualSTRProfit?: number; // alias
  annualUncappedSTRProfit?: number;
  annualCappedSTRProfit?: number;
  
  // Long-Term Lease Baseline
  longTermGrossMonthlyRent: number;
  longTermManagementFee: number;
  longTermVacancyAllowance: number;
  longTermMaintenanceReserve: number;
  netMonthlyLongTermProfit: number;
  longTermNetAnnual: number;
  netAnnualLongTermProfit?: number; // alias
  annualLongTermProfit?: number; // alias
  
  // Hosted Upside Scenario (if 90-night limit is why Airbnb loses)
  hostedUpsideNetAnnual?: number;
  hostedUpsideNights?: number;
  hostedUpsideDelta?: number; // Delta against long-term if hosted
  hostedUpsideDifference?: number; // alias
  hostedUpsideAnnualNights?: number; // alias
  
  // Breakeven metrics
  breakevenOccupancyRate: number;
  breakevenNightsNeeded: number;
  isBreakevenFeasible: boolean;
  breakevenExceedsLegalCap: boolean;
}

export interface ComplianceEvaluation {
  status: ComplianceLevel;
  statusLabel: string;
  primaryBlockers: string[];
  mandatoryConditions: string[];
  complianceScore: number;
  licenseCategory: 'Short-Term Rental' | 'Vacation Rental' | 'Not Allowed';
  dlcpLicenseType?: string; // alias
  citations: string[];
}

export interface MarketBenchmark {
  nightlyRate: number;
  typicalNightsBooked: number;
  p25Rate: number;
  p75Rate: number;
  sampleCount: number;
  isCitywideFallback: boolean;
  benchmarkLongTermRent: number;
  neighborhoodName: string;
}

export interface ComparableListing {
  id: string;
  title: string;
  neighborhoodId: string;
  neighborhoodName: string;
  propertyType: PropertyType | string;
  propertyTypeLabel: string;
  bedrooms: number;
  bathrooms: number;
  accommodates: number;
  nightlyPrice: number;
  cleaningFee: number;
  rating: number;
  reviewsCount: number;
  isSuperhost: boolean;
  imageUrl: string;
  amenities: string[];
  distanceMiles: number;
  highlight: string;
  estimatedOccupancy: number;
  dlcpLicenseNumber?: string;
  minimumNights?: number;
  reviewsPerMonth?: number;
  isInsideAirbnbVerified?: boolean;
  listingUrl?: string;
}

export interface NeighborhoodData {
  id: string;
  name: string;
  ward: string;
  coordinates: { lat: number; lng: number };
  typicalADR: number;
  typicalOccupancy: number;
  benchmarkLongTermRent: number;
  vibe: string;
  demandDrivers: string[];
  seasonalSurges: { season: string; factor: string; note: string }[];
  eventPricingTips: string[];
  insideAirbnbMetrics?: any;
}
