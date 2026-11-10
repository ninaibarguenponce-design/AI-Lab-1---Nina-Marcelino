import {
  ComplianceEvaluation,
  FinancialInputs,
  FinancialOutputs,
  NeighborhoodData,
  PropertyConfig
} from '../types';

export function evaluateCompliance(config: PropertyConfig): ComplianceEvaluation {
  const primaryBlockers: string[] = [];
  const mandatoryConditions: string[] = [];
  const citations: string[] = [
    'D.C. Official Code § 30-201 (Short-Term Rental Regulation Act of 2018)',
    'D.C. Municipal Regulations Title 17, Chapter 28 (Business Licensing & Consumer Protection)',
    'D.C. Office of Tax and Revenue Transient Accommodations Bulletin'
  ];

  // 1. Primary Residence Rule (Strict D.C. Mandate)
  if (!config.isPrimaryResidence || config.propertyType === 'secondary_investment') {
    primaryBlockers.push(
      'PRIMARY RESIDENCE RESTRICTION: D.C. law restricts short-term rentals strictly to the owner’s primary residence (where you reside at least 6 months / 183 days per year and claim the Homestead tax deduction). D.C. does not grant short-term rental licenses for secondary investment homes, non-owner occupied units, or corporate investor holdings.'
    );
  }

  // 2. Condo / Co-op HOA Bylaws
  if (config.propertyType === 'condo_coop' && !config.hoaBylawsPermitSTR) {
    primaryBlockers.push(
      'CONDOMINIUM BYLAW RESTRICTION: The condominium or homeowner association bylaws prohibit rentals under 6 or 12 months. Operating without association approval triggers building fines and license revocation.'
    );
  }

  // 3. Clean Hands Certificate
  if (!config.hasCleanHandsCertificate) {
    mandatoryConditions.push(
      'Clean Hands Certificate: Must obtain a Clean Hands Certificate from the D.C. Tax Office showing you do not owe more than $100 in overdue taxes or city tickets.'
    );
  }

  // 4. Life Safety Systems
  if (!config.hasSmokeAndCoDetectors || !config.hasFireExtinguisher) {
    mandatoryConditions.push(
      'Life Safety Equipment: Install interconnected smoke alarms in every sleeping room, carbon monoxide detectors on each occupied floor, and an approved, mounted fire extinguisher.'
    );
  }

  // 5. English Basement / In-Law Suite Certificate of Occupancy
  if (
    (config.propertyType === 'english_basement' || config.propertyType === 'accessory_dwelling_unit') &&
    !config.hasCertificateOfOccupancy
  ) {
    mandatoryConditions.push(
      'Certificate of Occupancy: Self-contained English basements and in-law suites must possess a Certificate of Occupancy or Department of Buildings record confirming ceiling height (at least 7 feet) and dedicated emergency exit windows or doors.'
    );
  }

  // 6. Insurance Requirement
  if (!config.hasStrLiabilityInsurance) {
    mandatoryConditions.push(
      'Host Liability Insurance: D.C. requires proof of active liability insurance coverage of at least $500,000 for short-term rental hosting operations.'
    );
  }

  // Determine License Endorsement Type
  let dlcpLicenseType: ComplianceEvaluation['dlcpLicenseType'] = 'Short-Term Rental Endorsement';
  if (primaryBlockers.length > 0) {
    dlcpLicenseType = 'INELIGIBLE (Unlicensed / Illegal)';
  } else if (config.hostingType === 'unhosted' || config.propertyType === 'english_basement' || config.propertyType === 'accessory_dwelling_unit') {
    dlcpLicenseType = 'Vacation Rental Endorsement';
  } else {
    dlcpLicenseType = 'Short-Term Rental Endorsement';
  }

  // Determine Overall Status
  let status: ComplianceEvaluation['status'] = 'GREEN';
  let statusLabel = 'GREEN: Fully Compliant';
  let complianceScore = 100;

  if (primaryBlockers.length > 0) {
    status = 'RED';
    statusLabel = 'RED: Non-Compliant / High Risk';
    complianceScore = 20;
  } else if (mandatoryConditions.length > 0) {
    status = 'YELLOW';
    statusLabel = 'YELLOW: Compliant with Conditions';
    complianceScore = Math.max(40, 100 - mandatoryConditions.length * 15);
  } else {
    status = 'GREEN';
    statusLabel = 'GREEN: Fully Compliant';
    complianceScore = 98;
  }

  return {
    status,
    statusLabel,
    primaryBlockers,
    mandatoryConditions,
    complianceScore,
    dlcpLicenseType,
    citations
  };
}

export function calculateFinancials(
  inputs: FinancialInputs,
  config: PropertyConfig
): FinancialOutputs {
  const DAYS_IN_MONTH = 30.4;
  const occupancyDecimal = Math.max(0, Math.min(100, inputs.occupancyRate)) / 100;
  const bookedNightsPerMonth = DAYS_IN_MONTH * occupancyDecimal;
  
  // Gross STR Revenue (ADR * Nights)
  const grossMonthlySTRRevenue = inputs.averageDailyRate * bookedNightsPerMonth;
  
  // Mandatory D.C. Transient Occupancy Tax (14.95%)
  const dcTransientTaxAmount = grossMonthlySTRRevenue * (inputs.dcTransientTaxPercent / 100);
  
  // Platform Host Fee (3% standard)
  const platformFeeAmount = grossMonthlySTRRevenue * (inputs.platformFeePercent / 100);
  
  // Stays & Turnovers
  const stayLength = Math.max(1, inputs.averageStayLength);
  const estimatedStaysPerMonth = bookedNightsPerMonth / stayLength;
  const totalCleaningCost = estimatedStaysPerMonth * inputs.turnoverCleaningCost;
  const totalCleaningFeeRecovered = estimatedStaysPerMonth * inputs.cleaningFeeChargedToGuest;
  const netTurnoverCost = Math.max(0, totalCleaningCost - totalCleaningFeeRecovered);
  
  // Fixed monthly expenses
  const fixedMonthlyExpenses =
    inputs.monthlyUtilities +
    inputs.monthlySuppliesAndWear +
    inputs.monthlyInsuranceAndLicense;
  
  const totalMonthlyExpenses = platformFeeAmount + netTurnoverCost + fixedMonthlyExpenses;
  
  // Net Monthly STR Profit
  const netMonthlySTRProfit = grossMonthlySTRRevenue - totalMonthlyExpenses;
  
  // Annual Uncapped
  const annualUncappedSTRProfit = netMonthlySTRProfit * 12;
  
  // 90-Day Vacation Rental Statutory Cap Check
  // D.C. Vacation Rental Endorsement limits unhosted stays to 90 days per calendar year
  const isSubjectTo90DayCap =
    config.hostingType === 'unhosted' && !config.hasHardshipExemption;
  
  let annualCappedSTRProfit = annualUncappedSTRProfit;
  if (isSubjectTo90DayCap) {
    const maxNightsPerYear = 90;
    const effectiveYearlyNights = Math.min(bookedNightsPerMonth * 12, maxNightsPerYear);
    const yearlyGrossRevenue = effectiveYearlyNights * inputs.averageDailyRate;
    const yearlyPlatformFee = yearlyGrossRevenue * (inputs.platformFeePercent / 100);
    const yearlyStays = effectiveYearlyNights / stayLength;
    const yearlyCleaningCost = yearlyStays * inputs.turnoverCleaningCost;
    const yearlyCleaningRecovered = yearlyStays * inputs.cleaningFeeChargedToGuest;
    const yearlyNetTurnover = Math.max(0, yearlyCleaningCost - yearlyCleaningRecovered);
    const yearlyFixedExpenses = fixedMonthlyExpenses * 12;
    
    annualCappedSTRProfit = yearlyGrossRevenue - yearlyPlatformFee - yearlyNetTurnover - yearlyFixedExpenses;
  }
  
  // Long-Term Lease Baseline
  const longTermGrossMonthlyRent = inputs.longTermMonthlyRent;
  const longTermManagementFee =
    longTermGrossMonthlyRent * (inputs.longTermPropertyManagementPercent / 100);
  const longTermVacancyAllowance =
    longTermGrossMonthlyRent * (inputs.longTermVacancyPercent / 100);
  const longTermMaintenanceReserve = inputs.longTermMaintenanceReserve;
  
  const netMonthlyLongTermProfit =
    longTermGrossMonthlyRent -
    longTermManagementFee -
    longTermVacancyAllowance -
    longTermMaintenanceReserve;
  
  const annualLongTermProfit = netMonthlyLongTermProfit * 12;
  
  // Profit Deltas
  const monthlyProfitDelta = netMonthlySTRProfit - netMonthlyLongTermProfit;
  const annualProfitDelta =
    (isSubjectTo90DayCap ? annualCappedSTRProfit : annualUncappedSTRProfit) - annualLongTermProfit;
  
  // Required Breakeven Occupancy Formula
  // Net STR(N) = N * [ADR * (1 - platformFee%) - (netTurnoverPerStay / stayLength)] - fixedMonthlyExpenses
  // Solve for N where Net STR(N) = netMonthlyLongTermProfit:
  const netCleaningPerStay = Math.max(0, inputs.turnoverCleaningCost - inputs.cleaningFeeChargedToGuest);
  const netCleaningPerNight = netCleaningPerStay / stayLength;
  const netRevenuePerNight = inputs.averageDailyRate * (1 - inputs.platformFeePercent / 100) - netCleaningPerNight;
  
  let breakevenNightsNeeded = 0;
  let breakevenOccupancyRate = 0;
  let isBreakevenFeasible = true;
  
  if (netRevenuePerNight <= 0) {
    isBreakevenFeasible = false;
    breakevenOccupancyRate = 999;
    breakevenNightsNeeded = 999;
  } else {
    breakevenNightsNeeded = (netMonthlyLongTermProfit + fixedMonthlyExpenses) / netRevenuePerNight;
    breakevenOccupancyRate = (breakevenNightsNeeded / DAYS_IN_MONTH) * 100;
    
    if (breakevenOccupancyRate > 100 || breakevenOccupancyRate < 0) {
      isBreakevenFeasible = false;
    }
  }
  
  // For unhosted vacation rentals, check if breakeven exceeds the 90-day annual cap (~24.7% occupancy)
  const maxUnhostedMonthlyNights = 90 / 12; // 7.5 nights/month = 24.67% occupancy
  const breakevenExceedsLegalCap =
    isSubjectTo90DayCap && breakevenNightsNeeded > maxUnhostedMonthlyNights;

  return {
    bookedNightsPerMonth,
    grossMonthlySTRRevenue,
    dcTransientTaxAmount,
    platformFeeAmount,
    estimatedStaysPerMonth,
    totalCleaningCost,
    totalCleaningFeeRecovered,
    netTurnoverCost,
    fixedMonthlyExpenses,
    totalMonthlyExpenses,
    netMonthlySTRProfit,
    annualUncappedSTRProfit,
    annualCappedSTRProfit,
    isSubjectTo90DayCap,
    longTermGrossMonthlyRent,
    longTermManagementFee,
    longTermVacancyAllowance,
    longTermMaintenanceReserve,
    netMonthlyLongTermProfit,
    annualLongTermProfit,
    monthlyProfitDelta,
    annualProfitDelta,
    breakevenOccupancyRate: Math.round(breakevenOccupancyRate * 10) / 10,
    breakevenNightsNeeded: Math.round(breakevenNightsNeeded * 10) / 10,
    isBreakevenFeasible,
    breakevenExceedsLegalCap
  };
}

export function generateDeterministicReport(
  config: PropertyConfig,
  inputs: FinancialInputs,
  financials: FinancialOutputs,
  compliance: ComplianceEvaluation,
  neighborhood: NeighborhoodData
): string {
  const currency = (val: number) =>
    `$${Math.round(val).toLocaleString('en-US')}`;

  const percent = (val: number) => `${val.toFixed(1)}%`;

  // Section 1: Regulatory Compliance & License Status
  let section1 = `### 1. 🚦 Regulatory Compliance & License Status\n\n`;
  section1 += `**Direct Status:** [${compliance.statusLabel}]\n\n`;

  if (compliance.status === 'RED') {
    section1 += `**CRITICAL LEGAL BLOCKERS (D.C. Business Licensing Department Rules):**\n`;
    for (const blocker of compliance.primaryBlockers) {
      section1 += `- **Violation:** ${blocker}\n`;
    }
    section1 += `- **Statutory Penalty:** Operating an unlicensed short-term rental in Washington, D.C. carries city fines starting at $1,000 for the first offense, escalating up to $5,000 per violation, and platform removal under D.C. Law 22-307.\n`;
  } else {
    section1 += `**D.C. Licensing & Regulatory Profile:**\n`;
    section1 += `- **Assigned License Classification:** **${compliance.dlcpLicenseType}** issued by the D.C. Business Licensing Department.\n`;
    section1 += `- **Primary Residence Verification:** Verified as owner's primary home (meeting the mandatory 183-day annual residence requirement under D.C. Code § 30-201).\n`;
    
    if (config.hostingType === 'unhosted') {
      section1 += `- **90-Day Annual Cap Restriction:** Because you are renting the whole home while away (unhosted Vacation Rental), D.C. law strictly limits bookings to a cumulative **90 days per calendar year** unless granted a temporary hardship relocation exemption by the city.\n`;
    } else {
      section1 += `- **Hosted Exemption (No 90-Day Cap):** Because you remain present in the house during guest stays, this property qualifies for a full Short-Term Rental endorsement with **zero 90-day booking cap** (you can rent all 365 days a year).\n`;
    }

    if (config.propertyType === 'english_basement' || config.propertyType === 'accessory_dwelling_unit') {
      section1 += `- **English Basement / In-Law Suite Rules:** Rented under D.C. Vacation Rental provisions. Requires a verified Certificate of Occupancy, independent entrance, minimum 7-foot ceiling height, and accessible safety shutoffs.\n`;
    }

    if (compliance.mandatoryConditions.length > 0) {
      section1 += `\n**Mandatory Steps Required Prior to Listing:**\n`;
      for (const cond of compliance.mandatoryConditions) {
        section1 += `- ${cond}\n`;
      }
    } else {
      section1 += `- **Readiness:** All baseline safety hardware (smoke/carbon monoxide detectors, fire extinguisher) and Clean Hands tax certificates are satisfied.\n`;
    }
  }

  // Section 2: Financial Comparison
  let section2 = `\n### 2. 📊 Financial Comparison: Airbnb vs. Long-Term Lease\n\n`;
  section2 += `| Financial Metric | Short-Term Rental (Airbnb) | Long-Term Lease (12-Month Tenant) | Net Difference |\n`;
  section2 += `| :--- | :--- | :--- | :--- |\n`;
  section2 += `| **Projected Monthly Gross Revenue** | ${currency(financials.grossMonthlySTRRevenue)} (${percent(inputs.occupancyRate)} occupancy @ ${currency(inputs.averageDailyRate)} nightly price) | ${currency(financials.longTermGrossMonthlyRent)} (Contract Rent) | ${financials.grossMonthlySTRRevenue >= financials.longTermGrossMonthlyRent ? '+' : ''}${currency(financials.grossMonthlySTRRevenue - financials.longTermGrossMonthlyRent)} |\n`;
  section2 += `| **Mandatory D.C. Hotel & Lodging Tax (-14.95%)** | -${currency(financials.dcTransientTaxAmount)} (Collected & remitted to D.C. Tax Office) | $0.00 (Zero tax for standard leases) | -${currency(financials.dcTransientTaxAmount)} |\n`;
  section2 += `| **Platform & Host Service Fees (3.0%)** | -${currency(financials.platformFeeAmount)} | $0.00 | -${currency(financials.platformFeeAmount)} |\n`;
  section2 += `| **Turnover & Cleaning Costs (Net)** | -${currency(financials.netTurnoverCost)} (${financials.estimatedStaysPerMonth.toFixed(1)} guest stays/month) | $0.00 (Tenant maintains home) | -${currency(financials.netTurnoverCost)} |\n`;
  section2 += `| **Monthly Operating Overhead (Utilities, Wi-Fi, Ins.)** | -${currency(financials.fixedMonthlyExpenses)} (Paid by owner) | -${currency(financials.longTermManagementFee + financials.longTermVacancyAllowance + financials.longTermMaintenanceReserve)} (Vacancy buffer + maintenance reserve) | -${currency(financials.fixedMonthlyExpenses - (financials.longTermManagementFee + financials.longTermVacancyAllowance + financials.longTermMaintenanceReserve))} |\n`;
  section2 += `| **Net Monthly Profit** | **${currency(financials.netMonthlySTRProfit)}** | **${currency(financials.netMonthlyLongTermProfit)}** | **${financials.monthlyProfitDelta >= 0 ? '+' : ''}${currency(financials.monthlyProfitDelta)}/month** |\n`;
  section2 += `| **Annual Net Income** | **${currency(financials.annualUncappedSTRProfit)}** ${financials.isSubjectTo90DayCap ? `*(${currency(financials.annualCappedSTRProfit)} under D.C. 90-day cap)*` : ''} | **${currency(financials.annualLongTermProfit)}** | **${financials.annualProfitDelta >= 0 ? '+' : ''}${currency(financials.annualProfitDelta)}/year** |\n\n`;

  section2 += `**Breakeven Analysis:**\n`;
  if (!financials.isBreakevenFeasible) {
    section2 += `- **Required Breakeven Occupancy:** **UNACHIEVABLE AT CURRENT NIGHTLY PRICE**. Monthly operating costs exceed profit margins. You must raise your nightly price above ${currency(inputs.turnoverCleaningCost / inputs.averageStayLength + 50)} to break even.\n`;
  } else {
    section2 += `- **Required Breakeven Occupancy:** **${percent(financials.breakevenOccupancyRate)}** (${financials.breakevenNightsNeeded} nights booked per month) to match the guaranteed profit of a 12-month tenant (${currency(financials.netMonthlyLongTermProfit)}/month).\n`;
    
    if (financials.breakevenExceedsLegalCap) {
      section2 += `- ⚠️ **ANNUAL 90-DAY CAP WARNING:** Because this unhosted home is capped by D.C. law at 90 nights a year (~24.7% maximum allowable annual occupancy), the required breakeven occupancy of ${percent(financials.breakevenOccupancyRate)} **cannot be legally maintained on a 12-month basis** without an official relocation hardship exemption from the city.\n`;
    } else {
      section2 += `- **Target Comparison:** Your selected occupancy rate of ${percent(inputs.occupancyRate)} is ${inputs.occupancyRate >= financials.breakevenOccupancyRate ? 'ABOVE' : 'BELOW'} your breakeven point by ${percent(Math.abs(inputs.occupancyRate - financials.breakevenOccupancyRate))}.\n`;
    }
  }

  // Section 3: Neighborhood & Event Strategy
  let section3 = `\n### 3. 📍 Neighborhood & Event Strategy: ${neighborhood.name} (${neighborhood.ward})\n\n`;
  section3 += `**Local Market Positioning:** ${neighborhood.vibe}\n\n`;
  section3 += `**Key Demand Drivers:**\n`;
  for (const driver of neighborhood.demandDrivers) {
    section3 += `- ${driver}\n`;
  }
  section3 += `\n**Seasonal Price Adjustments:**\n`;
  for (const surge of neighborhood.seasonalSurges) {
    section3 += `- **${surge.season}:** ${surge.factor} — *${surge.note}*\n`;
  }
  section3 += `\n**Neighborhood Tips for Higher Earnings:**\n`;
  for (const tip of neighborhood.eventPricingTips) {
    section3 += `- ${tip}\n`;
  }

  // Section 4: Strategic Recommendation & Action Plan
  let section4 = `\n### 4. 💡 Strategic Recommendation & Action Plan\n\n`;
  
  if (compliance.status === 'RED') {
    section4 += `**Bottom-Line Verdict:** **DO NOT PROCEED WITH AIRBNB LISTING.** Your property does not qualify as an owner-occupied primary home under D.C. law, which risks city fines of $1,000 to $5,000; you should safely lease to a 12-month residential tenant instead.\n\n`;
    section4 += `**Next Steps:**\n`;
    section4 += `1. **Execute 12-Month Lease:** Rent the home on the standard residential market to secure steady monthly income of approximately ${currency(financials.longTermGrossMonthlyRent)}/month.\n`;
    section4 += `2. **Avoid Unlicensed Listings:** Do not attempt off-platform or unpermitted short-term rentals; D.C. automatically matches city tax records with platform booking data.\n`;
    section4 += `3. **Explore 30-Day+ Furnished Rentals:** If you prefer flexibility, renting for 30 consecutive days or longer to traveling professionals is 100% legal without a short-term rental license.\n`;
  } else if (financials.isSubjectTo90DayCap && financials.breakevenExceedsLegalCap) {
    section4 += `**Bottom-Line Verdict:** **STICK WITH A LONG-TERM LEASE OR 30-DAY+ FURNISHED MODEL.** While legally eligible, D.C.'s 90-day unhosted booking cap limits your yearly Airbnb net profit to ${currency(financials.annualCappedSTRProfit)}, which is lower than the guaranteed ${currency(financials.annualLongTermProfit)} from a full-time tenant.\n\n`;
    section4 += `**Recommended Action Steps:**\n`;
    section4 += `1. **Consider 30-Day+ Mid-Term Rentals:** Stays of 30 days or longer are exempt from D.C.'s 90-day cap and short-term lodging tax, letting you host traveling medical staff, government fellows, or university researchers.\n`;
    section4 += `2. **Apply for a Hardship Exemption:** If you are temporarily relocating due to an employer assignment or military deployment, you can request an extended 180-day unhosted allowance from the city.\n`;
    section4 += `3. **Host-on-Premises Option:** If you live on the premises and only rent a bedroom suite, you can switch to a 'Hosted' license and remove the 90-day limit entirely.\n`;
  } else if (financials.netMonthlySTRProfit > financials.netMonthlyLongTermProfit) {
    section4 += `**Bottom-Line Verdict:** **PROCEED WITH AIRBNB LISTING.** Renting your home in ${neighborhood.name} generates approximately ${currency(financials.monthlyProfitDelta)}/month (${currency(financials.annualProfitDelta)}/year) more profit than a regular tenant, once you complete basic city licensing and home safety setup.\n\n`;
    section4 += `**Step-by-Step Action Plan:**\n`;
    section4 += `1. **Clean Hands Tax Certificate:** Request your free Clean Hands Certificate online at MyTax.DC.gov.\n`;
    section4 += `2. **D.C. Business License:** Apply for your Basic Business License with a **${compliance.dlcpLicenseType}** endorsement ($283.80 biennial fee) through the D.C. Business Licensing Department.\n`;
    section4 += `3. **Safety Equipment:** Place interconnected smoke detectors in every bedroom, carbon monoxide alarms on each level, and mount an approved fire extinguisher.\n`;
    section4 += `4. **Host Liability Insurance:** Confirm that your homeowner policy or commercial hosting rider provides at least $500,000 in liability protection.\n`;
    section4 += `5. **Seasonal Pricing:** Set rate increases during peak periods like ${neighborhood.seasonalSurges[0]?.season}.\n`;
  } else {
    section4 += `**Bottom-Line Verdict:** **CHOOSE A 12-MONTH RESIDENTIAL LEASE.** At your current estimated nightly price and cleaning costs, a regular yearly tenant delivers ${currency(Math.abs(financials.monthlyProfitDelta))}/month more profit with zero turnover work, no guest messaging, and tenant-paid utilities.\n\n`;
    section4 += `**Recommended Next Steps:**\n`;
    section4 += `1. **Market for a 1-Year Lease:** List the property at ${currency(financials.longTermGrossMonthlyRent)}/month for a dependable 12-month tenant.\n`;
    section4 += `2. **Save on Utility Bills:** With a regular lease, the tenant pays electric, gas, and water bills instead of you covering them.\n`;
    section4 += `3. **Re-evaluate If Prices Rise:** If nightly rates in ${neighborhood.name} increase above ${currency(inputs.averageDailyRate * 1.3)}/night, you can re-run this evaluator.\n`;
  }

  return section1 + section2 + section3 + section4;
}
