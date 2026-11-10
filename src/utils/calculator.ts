import {
  ComplianceEvaluation,
  FinancialInputs,
  FinancialOutputs,
  PropertyConfig,
  Recommendation
} from '../types';
import {
  DC_LODGING_TAX_PERCENT,
  VACATION_RENTAL_NIGHT_CAP,
  MIN_LIABILITY_INSURANCE,
  LICENSE_FEE,
  LICENSE_TERM_YEARS,
  DAYS_IN_MONTH,
  SOURCES
} from '../data/dcRules';

/**
 * Evaluates compliance strictly against D.C. law.
 * Shows requirements as an actionable to-do list rather than assuming prior completion.
 */
export function evaluateCompliance(config: PropertyConfig): ComplianceEvaluation {
  const primaryBlockers: string[] = [];
  const mandatoryConditions: string[] = [];
  const citations: string[] = [
    'D.C. Official Code § 30-201 (Short-Term Rental Regulation Act)',
    'D.C. Municipal Regulations Title 17, Chapter 28',
    'D.C. Office of Tax and Revenue Notice 2023-01'
  ];

  // 1. Primary Residence Rule
  if (!config.isPrimaryResidence || config.propertyType === 'secondary_investment') {
    primaryBlockers.push(
      'D.C. law permits short-term rentals strictly in the home you occupy as your primary residence (at least 183 days per year). Secondary investment properties are not eligible for short-term rental licenses.'
    );
  }

  // 2. Condominium / HOA Bylaws
  if (config.propertyType === 'condo_coop' && !config.hoaBylawsPermitSTR) {
    primaryBlockers.push(
      'Your condo or HOA bylaws prohibit rentals under 12 months. Building rules must permit short-term hosting before applying.'
    );
  }

  // 3. To-Do Checklist for every host
  mandatoryConditions.push(
    `Obtain a 2-year D.C. Basic Business License ($${LICENSE_FEE} for ${LICENSE_TERM_YEARS} years)`
  );
  mandatoryConditions.push(
    'Request a Clean Hands Certificate from MyTax.DC.gov confirming no delinquent city debt'
  );
  mandatoryConditions.push(
    `Secure at least $${MIN_LIABILITY_INSURANCE.toLocaleString()} in liability insurance coverage`
  );
  mandatoryConditions.push(
    'Install interconnected smoke alarms, carbon monoxide detectors on each level, and a fire extinguisher'
  );

  if (config.propertyType === 'english_basement' || config.propertyType === 'accessory_dwelling_unit') {
    mandatoryConditions.push(
      'Confirm your basement or in-law suite has a valid Certificate of Occupancy with 7-foot ceilings and emergency egress'
    );
  }

  // Determine license category:
  // Home during stays = "Short-Term Rental" (no annual night limit)
  // Away during stays = "Vacation Rental" (strict 90-night limit)
  let licenseCategory: ComplianceEvaluation['licenseCategory'] = 'Short-Term Rental';
  if (primaryBlockers.length > 0) {
    licenseCategory = 'Not Allowed';
  } else if (!config.isHomeDuringStay) {
    licenseCategory = 'Vacation Rental';
  } else {
    licenseCategory = 'Short-Term Rental';
  }

  let status: ComplianceEvaluation['status'] = 'GREEN';
  let statusLabel = 'Eligible to License';
  let complianceScore = 100;

  if (primaryBlockers.length > 0) {
    status = 'RED';
    statusLabel = 'Not Allowed under D.C. Law';
    complianceScore = 0;
  } else if (!config.isHomeDuringStay) {
    status = 'YELLOW';
    statusLabel = 'Allowed as Vacation Rental (90-Night Limit)';
    complianceScore = 80;
  } else {
    status = 'GREEN';
    statusLabel = 'Allowed as Short-Term Rental (No Night Limit)';
    complianceScore = 100;
  }

  return {
    status,
    statusLabel,
    primaryBlockers,
    mandatoryConditions,
    complianceScore,
    licenseCategory,
    dlcpLicenseType: licenseCategory,
    citations
  };
}

/**
 * Single authoritative financial calculator.
 * Computes booked nights as min(expected, dcAllowed).
 * Outputs single `recommendation` consumed identically across every screen and report.
 */
export function calculateFinancials(
  inputs: FinancialInputs,
  config: PropertyConfig
): FinancialOutputs {
  // 1. Determine D.C. Legal Cap based purely on whether owner is home during stays
  const isSubjectTo90DayCap = !config.isHomeDuringStay;
  const dcAllowedNightsPerYear = isSubjectTo90DayCap ? VACATION_RENTAL_NIGHT_CAP : 365;

  // 2. Expected nights from user occupancy % or explicit input
  const expectedNightsPerYear = Math.max(
    0,
    Math.round(inputs.expectedNightsBooked ?? (365 * (Math.max(0, Math.min(100, inputs.occupancyRate)) / 100)))
  );

  // 3. Booked nights is strictly the smaller of what the owner expects and what D.C. allows
  const bookedNightsPerYear = Math.min(expectedNightsPerYear, dcAllowedNightsPerYear);
  const bookedNightsPerMonth = bookedNightsPerYear / 12;
  const is90NightCapLimiting = isSubjectTo90DayCap && expectedNightsPerYear > VACATION_RENTAL_NIGHT_CAP;

  // 4. Gross Airbnb Revenue
  const grossAnnualSTRRevenue = inputs.averageDailyRate * bookedNightsPerYear;
  const grossMonthlySTRRevenue = grossAnnualSTRRevenue / 12;

  // 5. Lodging Tax (15.95%) — Paid by guest on top of rate and remitted by Airbnb; NEVER subtracted from owner income
  const lodgingTaxAnnual = grossAnnualSTRRevenue * (DC_LODGING_TAX_PERCENT / 100);
  const lodgingTaxMonthly = lodgingTaxAnnual / 12;

  // 6. Platform Host Fee (3% standard host fee deducted by Airbnb)
  const platformFeeAnnual = grossAnnualSTRRevenue * (inputs.platformFeePercent / 100);
  const platformFeeAmount = platformFeeAnnual / 12;

  // 7. Cleaning & Turnovers
  const stayLength = Math.max(1, inputs.averageStayLength);
  const estimatedStaysPerYear = bookedNightsPerYear > 0 ? Math.max(1, bookedNightsPerYear / stayLength) : 0;
  const estimatedStaysPerMonth = estimatedStaysPerYear / 12;
  const totalCleaningCost = estimatedStaysPerMonth * inputs.turnoverCleaningCost;
  const totalCleaningFeeRecovered = estimatedStaysPerMonth * inputs.cleaningFeeChargedToGuest;
  const netTurnoverCost = Math.max(0, totalCleaningCost - totalCleaningFeeRecovered);
  const annualCleaningCost = netTurnoverCost * 12;

  // 8. Fixed Expenses
  const fixedMonthlyExpenses =
    inputs.monthlyUtilities +
    inputs.monthlySuppliesAndWear +
    inputs.monthlyInsuranceAndLicense;
  const annualFixedExpenses = fixedMonthlyExpenses * 12;

  // Total deductions from host
  const totalAnnualExpenses = platformFeeAnnual + annualCleaningCost + annualFixedExpenses;
  const totalMonthlyExpenses = totalAnnualExpenses / 12;

  // 9. Net Airbnb Profit
  const airbnbNetAnnual = Math.round(grossAnnualSTRRevenue - totalAnnualExpenses);
  const netMonthlySTRProfit = Math.round(airbnbNetAnnual / 12);

  // 10. Long-Term Lease Alternative
  const longTermGrossMonthlyRent = inputs.longTermMonthlyRent;
  const longTermManagementFee = longTermGrossMonthlyRent * (inputs.longTermPropertyManagementPercent / 100);
  const longTermVacancyAllowance = longTermGrossMonthlyRent * (inputs.longTermVacancyPercent / 100);
  const longTermMaintenanceReserve = inputs.longTermMaintenanceReserve;
  const netMonthlyLongTermProfit = Math.round(
    longTermGrossMonthlyRent - longTermManagementFee - longTermVacancyAllowance - longTermMaintenanceReserve
  );
  const longTermNetAnnual = netMonthlyLongTermProfit * 12;

  // 11. Delta & Recommendation
  const annualProfitDelta = airbnbNetAnnual - longTermNetAnnual;
  const monthlyProfitDelta = Math.round(annualProfitDelta / 12);

  // Near-tie definition: within 5% of the larger amount (or of long-term baseline)
  const maxBenchmark = Math.max(1, Math.max(Math.abs(airbnbNetAnnual), Math.abs(longTermNetAnnual)));
  const percentDifference = Math.abs(annualProfitDelta) / maxBenchmark;
  const isNearTie = percentDifference <= 0.05;

  let recommendation: Recommendation = 'long_term';
  let verdictHeadline = '';
  let verdictReason = '';

  if (!config.isPrimaryResidence || config.propertyType === 'secondary_investment') {
    recommendation = 'not_allowed';
    verdictHeadline = 'Airbnb is not allowed under D.C. law.';
    verdictReason =
      'D.C. only licenses short-term rentals in your primary home. Keep a 12-month tenant or offer a 30+ day furnished rental.';
  } else if (isNearTie) {
    recommendation = 'airbnb';
    verdictHeadline = "It's nearly a tie.";
    const leadOption = airbnbNetAnnual >= longTermNetAnnual ? 'Airbnb edges ahead' : 'A 12-month tenant edges ahead';
    verdictReason = `${leadOption} by $${Math.abs(annualProfitDelta).toLocaleString()} per year, so your decision comes down to personal flexibility versus guaranteed rent.`;
  } else if (annualProfitDelta > 0) {
    recommendation = 'airbnb';
    verdictHeadline = 'List it on Airbnb.';
    verdictReason = `Because you are home during guest stays, you can host year-round to earn an estimated $${annualProfitDelta.toLocaleString()} more per year than a 12-month lease.`;
  } else {
    recommendation = 'long_term';
    verdictHeadline = 'Keep a 12-month tenant.';
    if (is90NightCapLimiting) {
      verdictReason = "D.C.'s 90-night vacation rental limit caps your earnings below what a 12-month tenant pays.";
    } else {
      verdictReason = `A 12-month tenant yields $${Math.abs(annualProfitDelta).toLocaleString()} more per year with lower turnover expenses and guaranteed monthly rent.`;
    }
  }

  // 12. Hosted Upside Scenario
  // If being away with the 90-night cap is why Airbnb loses, compute what the owner would earn if they were home
  let hostedUpsideNetAnnual: number | undefined;
  let hostedUpsideNights: number | undefined;
  let hostedUpsideDelta: number | undefined;

  if (isSubjectTo90DayCap && recommendation === 'long_term') {
    const hostedNights = Math.min(expectedNightsPerYear, 365);
    const hostedGross = inputs.averageDailyRate * hostedNights;
    const hostedPlatformFee = hostedGross * (inputs.platformFeePercent / 100);
    const hostedStays = hostedNights / stayLength;
    const hostedCleaningNet = hostedStays * Math.max(0, inputs.turnoverCleaningCost - inputs.cleaningFeeChargedToGuest);
    const hostedNetAnnual = Math.round(hostedGross - hostedPlatformFee - hostedCleaningNet - annualFixedExpenses);

    hostedUpsideNetAnnual = hostedNetAnnual;
    hostedUpsideNights = hostedNights;
    hostedUpsideDelta = hostedNetAnnual - longTermNetAnnual;
  }

  // 13. Breakeven occupancy calculation
  // Find occupancy % needed to match long-term net:
  // netSTR = (ADR * nights) - (ADR * nights * 0.03) - ((nights/stayLength) * netClean) - fixedExpenses = longTermNetAnnual
  // nights * (ADR * 0.97 - netClean/stayLength) = longTermNetAnnual + fixedExpenses
  const netContributionPerNight = inputs.averageDailyRate * (1 - inputs.platformFeePercent / 100) -
    Math.max(0, inputs.turnoverCleaningCost - inputs.cleaningFeeChargedToGuest) / stayLength;
  
  let breakevenNightsAnnual = 0;
  if (netContributionPerNight > 0) {
    breakevenNightsAnnual = Math.ceil((longTermNetAnnual + annualFixedExpenses) / netContributionPerNight);
  }
  const breakevenOccupancyRate = Math.min(100, Math.max(0, Math.round((breakevenNightsAnnual / 365) * 100)));
  const breakevenNightsNeeded = Math.round(breakevenNightsAnnual / 12);
  const breakevenExceedsLegalCap = isSubjectTo90DayCap && breakevenNightsAnnual > VACATION_RENTAL_NIGHT_CAP;
  const isBreakevenFeasible = netContributionPerNight > 0 && breakevenNightsAnnual <= dcAllowedNightsPerYear;

  return {
    recommendation,
    verdictHeadline,
    verdictReason,
    isNearTie,
    annualProfitDelta,
    monthlyProfitDelta,

    expectedNightsPerYear,
    dcAllowedNightsPerYear,
    bookedNightsPerYear,
    bookedNightsPerMonth,
    isSubjectTo90DayCap,
    is90NightCapLimiting,

    grossAnnualSTRRevenue,
    grossMonthlySTRRevenue,
    lodgingTaxPercent: DC_LODGING_TAX_PERCENT,
    lodgingTaxAnnual,
    lodgingTaxMonthly,
    platformFeeAmount,
    platformFeeAnnual,
    estimatedStaysPerMonth,
    estimatedStaysPerYear,
    totalCleaningCost,
    totalCleaningFeeRecovered,
    netTurnoverCost,
    annualCleaningCost,
    fixedMonthlyExpenses,
    annualFixedExpenses,
    totalMonthlyExpenses,
    netMonthlySTRProfit,
    airbnbNetAnnual,

    longTermGrossMonthlyRent,
    longTermManagementFee,
    longTermVacancyAllowance,
    longTermMaintenanceReserve,
    netMonthlyLongTermProfit,
    longTermNetAnnual,
    netAnnualLongTermProfit: longTermNetAnnual,
    annualLongTermProfit: longTermNetAnnual,

    // Aliases for tax and nights
    dcTransientTaxAmount: lodgingTaxAnnual,
    actualBookedNights: bookedNightsPerYear,
    allowedNightCap: dcAllowedNightsPerYear,
    annualOperatingCosts: totalAnnualExpenses,
    netAnnualSTRProfit: airbnbNetAnnual,
    annualUncappedSTRProfit: hostedUpsideNetAnnual ?? airbnbNetAnnual,
    annualCappedSTRProfit: isSubjectTo90DayCap ? airbnbNetAnnual : Math.round(airbnbNetAnnual * (90 / Math.max(1, bookedNightsPerYear))),

    hostedUpsideNetAnnual,
    hostedUpsideNights,
    hostedUpsideDelta,
    hostedUpsideDifference: hostedUpsideDelta,
    hostedUpsideAnnualNights: hostedUpsideNights,

    breakevenOccupancyRate,
    breakevenNightsNeeded,
    isBreakevenFeasible,
    breakevenExceedsLegalCap,
  };
}

/**
 * Generates an authoritative markdown report adhering to all D.C. statutory rules.
 * The numbers and recommendation strictly match the verdict card.
 */
export function generateDeterministicReport(
  config: PropertyConfig,
  inputs: FinancialInputs,
  financials: FinancialOutputs,
  compliance: ComplianceEvaluation,
  neighborhood: { name: string; ward: string }
): string {
  const isSubjectTo90DayCap = !config.isHomeDuringStay;

  let report = `# D.C. Rental Advisor: Decision & Compliance Report\n`;
  report += `**Property:** ${config.nickname || 'Subject Property'} (${neighborhood.name}, ${neighborhood.ward})\n`;
  report += `**Primary Residence:** ${config.isPrimaryResidence ? 'Yes (≥183 days/year)' : 'No (Secondary / Investment)'}\n`;
  report += `**Hosting Presence:** ${config.isHomeDuringStay ? 'Owner on-site while guests stay (Short-Term Rental)' : 'Owner away while guests stay (Vacation Rental)'}\n`;
  report += `**Legal Night Limit:** ${isSubjectTo90DayCap ? `Strictly capped at ${VACATION_RENTAL_NIGHT_CAP} nights per calendar year` : 'No annual night limit (year-round hosting allowed)'}\n\n`;

  report += `---\n\n`;

  // SECTION 1: VERDICT & RECOMMENDATION
  report += `## 1. 💡 Recommendation\n\n`;
  report += `### **${financials.verdictHeadline}**\n\n`;
  if (financials.recommendation !== 'not_allowed') {
    report += `**Annual Difference:** ${financials.annualProfitDelta >= 0 ? '+' : '-'}$${Math.abs(Math.round(financials.annualProfitDelta)).toLocaleString()} per year\n\n`;
  }
  report += `${financials.verdictReason}\n\n`;

  if (financials.hostedUpsideNetAnnual !== undefined && isSubjectTo90DayCap) {
    report += `> **On-Site Hosting Alternative:** If you live on-site during stays (e.g., residing upstairs while renting the basement unit), D.C. removes the 90-night cap. At ${financials.hostedUpsideNights} booked nights, you would earn approximately **$${financials.hostedUpsideNetAnnual.toLocaleString()}/year**.\n\n`;
  }

  report += `---\n\n`;

  // SECTION 2: FINANCIAL COMPARISON
  report += `## 2. 📊 Financial Comparison\n\n`;
  report += `| Financial Metric | Airbnb (Short-Term) | 12-Month Lease Tenant |\n`;
  report += `| :--- | :--- | :--- |\n`;
  report += `| **Annual Booked Nights** | **${financials.bookedNightsPerYear} nights** (${Math.round(financials.bookedNightsPerMonth)} nights/mo) | Full 365 Days |\n`;
  report += `| **Nightly Rate / Rent** | $${inputs.averageDailyRate} / night | $${inputs.longTermMonthlyRent.toLocaleString()} / month |\n`;
  report += `| **Gross Annual Revenue** | $${Math.round(financials.grossAnnualSTRRevenue).toLocaleString()} | $${(inputs.longTermMonthlyRent * 12).toLocaleString()} |\n`;
  report += `| **D.C. Lodging Tax (${DC_LODGING_TAX_PERCENT}%)** | $${Math.round(financials.lodgingTaxAnnual).toLocaleString()} *(Paid by guest)* | $0 (N/A) |\n`;
  report += `| **Platform Host Fee (3%)** | -$${Math.round(financials.platformFeeAnnual).toLocaleString()} | $0 (N/A) |\n`;
  report += `| **Turnover & Cleaning Costs** | -$${Math.round(financials.annualCleaningCost).toLocaleString()} | $0 (Tenant cleans) |\n`;
  report += `| **Utilities & Operating Supplies** | -$${Math.round(financials.annualFixedExpenses).toLocaleString()} | $0 (Tenant pays utilities) |\n`;
  report += `| **Vacancy & Maintenance Reserve** | Included above | -$${Math.round(financials.longTermVacancyAllowance * 12 + financials.longTermMaintenanceReserve * 12).toLocaleString()} |\n`;
  report += `| **Annual Net Earnings (What You Keep)** | **$${financials.airbnbNetAnnual.toLocaleString()}** | **$${financials.longTermNetAnnual.toLocaleString()}** |\n`;
  report += `| **Monthly Average** | **$${financials.netMonthlySTRProfit.toLocaleString()} / mo** | **$${financials.netMonthlyLongTermProfit.toLocaleString()} / mo** |\n\n`;

  report += `*Note: In Washington, D.C., the ${DC_LODGING_TAX_PERCENT}% lodging tax is added to the guest's checkout invoice and remitted directly by Airbnb to the D.C. Office of Tax and Revenue. It is never deducted from host earnings.*\n\n`;

  report += `---\n\n`;

  // SECTION 3: D.C. LICENSING TO-DO LIST
  report += `## 3. 🚦 D.C. Licensing & Compliance To-Do List\n\n`;
  report += `Before listing on Airbnb, every D.C. homeowner must complete the following mandatory steps:\n\n`;
  compliance.mandatoryConditions.forEach((item, index) => {
    report += `${index + 1}. [ ] **${item}**\n`;
  });
  report += `\n`;

  if (compliance.primaryBlockers.length > 0) {
    report += `### ⚠️ Legal Disqualifications:\n`;
    compliance.primaryBlockers.forEach((blocker) => {
      report += `- **${blocker}**\n`;
    });
    report += `\n`;
  }

  report += `---\n\n`;

  // SECTION 4: STATUTORY SOURCES
  report += `## 4. 📚 Statutory Citations\n\n`;
  report += `- **D.C. Department of Licensing and Consumer Protection:** [dlcp.dc.gov](${SOURCES.licensing})\n`;
  report += `- **D.C. Office of Tax and Revenue (Notice 2023-01):** [otr.cfo.dc.gov](${SOURCES.tax})\n`;
  report += `- **Inside Airbnb Washington, D.C. Open Data:** [insideairbnb.com](${SOURCES.data})\n`;

  return report;
}

export {
  DC_LODGING_TAX_PERCENT,
  VACATION_RENTAL_NIGHT_CAP,
  MIN_LIABILITY_INSURANCE,
  LICENSE_FEE,
  LICENSE_TERM_YEARS,
  DAYS_IN_MONTH,
  SOURCES
};

