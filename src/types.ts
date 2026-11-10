export type PropertyType =
  | 'single_family'
  | 'english_basement'
  | 'accessory_dwelling_unit'
  | 'hosted_room'
  | 'condo_coop'
  | 'secondary_investment';

export type HostingType =
  | 'hosted' // Host is on premises (Short-Term Rental Endorsement, no 90-day cap)
  | 'unhosted'; // Host is absent (Vacation Rental Endorsement, strict 90-day annual cap)

export type ComplianceLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface PropertyConfig {
  nickname: string;
  neighborhoodId: string;
  propertyType: PropertyType;
  isPrimaryResidence: boolean; // Resides >= 183 days/yr
  hostingType: HostingType;
  bedrooms: number; // 0 for studio, 1, 2, 3, 4+
  bathrooms: number; // 1, 1.5, 2, 2.5, 3+
  squareFeet?: number; // Optional square footage
  amenities: string[]; // ['parking', 'pool', 'patio', 'washer_dryer', 'ac', 'wifi']
  hasHardshipExemption: boolean; // Temporary relocation exemption
  hasCleanHandsCertificate: boolean; // D.C. Tax Office status
  hasSmokeAndCoDetectors: boolean; // Required on all levels & bedrooms
  hasFireExtinguisher: boolean; // 2A:10B:C rated
  hasCertificateOfOccupancy: boolean; // For Basement or Backyard apartment
  hoaBylawsPermitSTR: boolean; // If condo/co-op
  hasStrLiabilityInsurance: boolean; // Minimum $500,000 policy
}

export interface FinancialInputs {
  averageDailyRate: number; // ADR ($/night)
  occupancyRate: number; // Target/projected occupancy % (e.g. 68)
  averageStayLength: number; // Average nights per stay (e.g. 3.2)
  turnoverCleaningCost: number; // Paid to cleaners per stay (e.g. $150)
  cleaningFeeChargedToGuest: number; // Charged on platform (e.g. $130)
  platformFeePercent: number; // 3% standard host fee
  dcTransientTaxPercent: number; // 14.95% DC Transient Occupancy Tax
  monthlyUtilities: number; // Electric, gas, water, gigabit Wi-Fi ($)
  monthlySuppliesAndWear: number; // Consumables, coffee, toiletries, linens ($)
  monthlyInsuranceAndLicense: number; // $500k STR insurance rider + DLCP BBL fee amortization ($)
  
  // Long-Term Lease Baseline
  longTermMonthlyRent: number; // Market 12-month lease rate ($)
  longTermPropertyManagementPercent: number; // 0% if self-managed, 8-10% if managed
  longTermVacancyPercent: number; // Typically 5% vacancy allowance
  longTermMaintenanceReserve: number; // Typically $100-$150/mo
}

export interface FinancialOutputs {
  bookedNightsPerMonth: number;
  grossMonthlySTRRevenue: number;
  dcTransientTaxAmount: number;
  platformFeeAmount: number;
  estimatedStaysPerMonth: number;
  totalCleaningCost: number;
  totalCleaningFeeRecovered: number;
  netTurnoverCost: number;
  fixedMonthlyExpenses: number;
  totalMonthlyExpenses: number;
  netMonthlySTRProfit: number;
  
  // Annual Projections
  annualUncappedSTRProfit: number;
  annualCappedSTRProfit: number; // Capped at 90 days for unhosted vacation rentals
  isSubjectTo90DayCap: boolean;
  
  // Long-Term Lease
  longTermGrossMonthlyRent: number;
  longTermManagementFee: number;
  longTermVacancyAllowance: number;
  longTermMaintenanceReserve: number;
  netMonthlyLongTermProfit: number;
  annualLongTermProfit: number;
  
  // Delta & Breakeven
  monthlyProfitDelta: number; // STR Net - Long Term Net
  annualProfitDelta: number;
  breakevenOccupancyRate: number; // % needed to match long-term
  breakevenNightsNeeded: number; // Nights per month needed
  isBreakevenFeasible: boolean; // Whether breakeven <= 100% and within legal caps
  breakevenExceedsLegalCap: boolean;
}

export interface ComplianceEvaluation {
  status: ComplianceLevel;
  statusLabel: string;
  primaryBlockers: string[];
  mandatoryConditions: string[];
  complianceScore: number; // 0 - 100
  dlcpLicenseType: 'Short-Term Rental Endorsement' | 'Vacation Rental Endorsement' | 'INELIGIBLE (Unlicensed / Illegal)';
  citations: string[];
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
}

export interface ComparableListing {
  id: string;
  title: string;
  neighborhoodId: string;
  neighborhoodName: string;
  propertyType: PropertyType;
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
}

