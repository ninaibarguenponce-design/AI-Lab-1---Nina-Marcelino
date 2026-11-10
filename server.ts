import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ADVISOR_SYSTEM_INSTRUCTION = `You are the DC Short-Term Rental (STR) Viability & Compliance Advisor, an authoritative business decision-support expert assisting Washington, D.C. homeowners in evaluating whether to list their property on Airbnb versus traditional 12-month leasing.

OPERATIONAL DIRECTIVES & LOCAL LAWS:
1. REGULATORY COMPLIANCE (D.C. Department of Licensing and Consumer Protection - DLCP):
   - Primary Residence Rule: D.C. law strictly restricts STRs to the owner's primary residence (where the owner resides at least 183 days per year, D.C. Code § 30-201).
   - Investment / Secondary Properties: If an owner indicates the property is NOT their primary residence, flag an IMMEDIATE RED LIGHT / HIGH RISK penalty (D.C. does not grant standard STR licenses for secondary investment properties).
   - Basement / Accessory Dwelling Units (ADUs): If renting an English basement or ADU in a primary residence, note that it falls under D.C. "Vacation Rental" rules and requires proper licensing, inspections, smoke/CO detector certifications, and Certificate of Occupancy.
   - 90-Day Unhosted Cap: Vacation Rental endorsements without owner present are capped at 90 days/calendar year in D.C. unless granted a hardship exemption (e.g., military deployment or temporary out-of-area job relocation).

2. FINANCIAL & TAX FORMULAS:
   - D.C. Transient Occupancy Tax: Explicitly apply a 14.95% tax rate on gross short-term rental revenue.
   - Platform & Operating Costs: Deduct 3% standard platform fee, estimated turnover/cleaning costs ($120–$180 per stay), and monthly utility overhead.
   - Long-Term Lease Baseline: Compare net Airbnb income against the user's alternative long-term monthly rental estimate.
   - Required Breakeven Occupancy: Calculate the minimum occupancy rate (%) required for short-term net revenue to match the net revenue of a 12-month tenant.

RESPONSE FORMAT MANDATE:
Always format your response using clean Markdown with the following exact 4 sections:

1. 🚦 Regulatory Compliance & License Status
   - Direct Status: [GREEN: Fully Compliant | YELLOW: Compliant with Conditions | RED: Non-Compliant / High Risk]
   - Bulleted explanation referencing specific D.C. DLCP rules (Primary residence criteria, licensing steps, inspections).

2. 📊 Financial Comparison: Airbnb vs. Long-Term Lease
   - Display a breakdown including:
     • Projected Monthly Gross Revenue (based on ADR and selected occupancy rate)
     • Mandatory D.C. Transient Occupancy Tax (-14.95%)
     • Platform, Cleaning, & Utility Expenses
     • Net Monthly Airbnb Profit
     • Net Monthly Long-Term Lease Profit (Alternative)
     • Breakeven Occupancy Rate (Min % needed to beat a long-term tenant)

3. 📍 Neighborhood & Event Strategy
   - Provide 2–3 hyper-local pricing recommendations based on the specific D.C. neighborhood (e.g., Capitol Hill business travel, Dupont Circle tourism, Howard/GWU graduation surges).

4. 💡 Strategic Recommendation & Action Plan
   - A 2-sentence bottom-line verdict advising the homeowner whether to proceed with Airbnb, stick to long-term leasing, or adjust their strategy.

TONAL & LANGUAGE GUIDELINES:
Maintain an objective, analytical, and professional tone.
CRITICAL TERMINOLOGY MANDATE: Refrain from using convoluted abbreviations so that any homeowner (including non-tech-savvy users) can easily understand.
- Use "Short-Term Rental" or "Airbnb" instead of "STR"
- Use "Nightly Price" or "Nightly Rate" instead of "ADR"
- Use "D.C. Business Licensing Department" instead of bare "DLCP"
- Use "Certificate of Occupancy" instead of "C of O"
- Use "D.C. Tax Office" instead of "OTR"
- Use "Basement or In-Law Suite" instead of "ADU"
- Use "Basic Business License" instead of "BBL"
Prioritize legal accuracy and financial realism over encouraging Airbnb listing creation. If the user's setup violates D.C. law, state it clearly upfront.`;

async function generateWithFallback(prompt: string, systemInstruction: string): Promise<string> {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction },
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        // If 503 or 429, wait briefly and retry
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('All model candidates unavailable');
}

// API route to generate an AI-enriched compliance & financial report
app.post('/api/advisor/generate', async (req, res) => {
  try {
    const { propertyConfig, financialInputs, financialOutputs, neighborhood } = req.body;

    if (!propertyConfig || !financialInputs) {
      return res.status(400).json({ error: 'Missing required configuration data' });
    }

    const prompt = `Analyze this Washington, D.C. property and generate your complete, formal 4-section advisory report based on D.C. law and local market conditions:

PROPERTY PROFILE:
- Property Nickname: ${propertyConfig.nickname || 'Subject Property'}
- Neighborhood: ${neighborhood?.name || 'Washington, D.C.'} (${neighborhood?.ward || 'District of Columbia'})
- Property Type: ${propertyConfig.propertyType}
- Owner Primary Residence (183+ days/year): ${propertyConfig.isPrimaryResidence ? 'YES' : 'NO - Secondary / Investment Property'}
- Hosting Style: ${propertyConfig.hostingType === 'hosted' ? 'Hosted (Owner present in home)' : 'Unhosted (Owner absent / exclusive guest access)'}
- Hardship Exemption Eligible: ${propertyConfig.hasHardshipExemption ? 'YES' : 'NO'}
- Clean Hands Certificate: ${propertyConfig.hasCleanHandsCertificate ? 'Verified' : 'Pending / Not Obtained'}
- Smoke & CO Alarms Verified: ${propertyConfig.hasSmokeAndCoDetectors ? 'YES' : 'NO'}
- Fire Extinguisher (2A:10B:C): ${propertyConfig.hasFireExtinguisher ? 'YES' : 'NO'}
- Certificate of Occupancy (C of O / ADU): ${propertyConfig.hasCertificateOfOccupancy ? 'YES' : 'NO'}
- HOA / Condo Bylaws Permit STR: ${propertyConfig.hoaBylawsPermitSTR ? 'YES' : 'NO / Unverified'}
- Commercial STR Liability Insurance ($500k+): ${propertyConfig.hasStrLiabilityInsurance ? 'YES' : 'NO'}

FINANCIAL PARAMETERS:
- Average Daily Rate (ADR): $${financialInputs.averageDailyRate}/night
- Projected Occupancy Rate: ${financialInputs.occupancyRate}%
- Average Stay Length: ${financialInputs.averageStayLength} nights
- Turnover / Cleaning Cost per Stay: $${financialInputs.turnoverCleaningCost}
- Cleaning Fee Charged to Guest: $${financialInputs.cleaningFeeChargedToGuest}
- Platform Host Fee: ${financialInputs.platformFeePercent}%
- D.C. Transient Occupancy Tax: ${financialInputs.dcTransientTaxPercent}%
- Monthly Utilities: $${financialInputs.monthlyUtilities}
- Monthly Supplies & Wear: $${financialInputs.monthlySuppliesAndWear}
- Monthly Insurance & Licensing: $${financialInputs.monthlyInsuranceAndLicense}

LONG-TERM LEASE BASELINE:
- Long-Term Contract Rent: $${financialInputs.longTermMonthlyRent}/month
- Long-Term Property Management Fee: ${financialInputs.longTermPropertyManagementPercent}%
- Vacancy Reserve: ${financialInputs.longTermVacancyPercent}%
- Maintenance Reserve: $${financialInputs.longTermMaintenanceReserve}/month

COMPUTED METRICS:
- Projected Monthly Gross STR Revenue: $${Math.round(financialOutputs.grossMonthlySTRRevenue)}
- D.C. Transient Occupancy Tax (-14.95%): -$${Math.round(financialOutputs.dcTransientTaxAmount)}
- Platform Host Fee (3%): -$${Math.round(financialOutputs.platformFeeAmount)}
- Net Monthly Cleaning Turnover: -$${Math.round(financialOutputs.netTurnoverCost)}
- Monthly Fixed Expenses: -$${Math.round(financialOutputs.fixedMonthlyExpenses)}
- Net Monthly STR Profit: $${Math.round(financialOutputs.netMonthlySTRProfit)}
- Net Monthly Long-Term Lease Profit: $${Math.round(financialOutputs.netMonthlyLongTermProfit)}
- Required Breakeven Occupancy Rate: ${financialOutputs.breakevenOccupancyRate}% (${financialOutputs.breakevenNightsNeeded} nights/month)
- Breakeven Achievable: ${financialOutputs.isBreakevenFeasible ? 'YES' : 'NO (Unfeasible at current ADR)'}
- Subject to 90-Day D.C. Annual Cap: ${financialOutputs.isSubjectTo90DayCap ? 'YES (Annual max 90 unhosted nights)' : 'NO (Hosted STR endorsement)'}

Generate your comprehensive decision-support report in clean Markdown using the mandatory 4 sections:
1. 🚦 Regulatory Compliance & License Status
2. 📊 Financial Comparison: Airbnb vs. Long-Term Lease
3. 📍 Neighborhood & Event Strategy
4. 💡 Strategic Recommendation & Action Plan`;

    const reportMarkdown = await generateWithFallback(prompt, ADVISOR_SYSTEM_INSTRUCTION);
    return res.json({ reportMarkdown });
  } catch (error: any) {
    console.error('Error generating AI advisor report:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate advisory report from Gemini',
    });
  }
});

// API route for interactive homeowner compliance & market consultation
app.post('/api/advisor/chat', async (req, res) => {
  try {
    const { question, propertyConfig, financialOutputs, neighborhood } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question parameter' });
    }

    const contextPrompt = `Context regarding the user's Washington, D.C. property:
- Neighborhood: ${neighborhood?.name || 'Washington, D.C.'}
- Property Type: ${propertyConfig?.propertyType || 'Residential'}
- Primary Residence: ${propertyConfig?.isPrimaryResidence ? 'Yes (>=183 days/yr)' : 'No (Secondary/Investment)'}
- Hosting Type: ${propertyConfig?.hostingType === 'hosted' ? 'Hosted (No 90-day cap)' : 'Unhosted (90-day annual cap)'}
- Breakeven Occupancy: ${financialOutputs?.breakevenOccupancyRate ?? 'N/A'}%
- Net STR Monthly Profit: $${Math.round(financialOutputs?.netMonthlySTRProfit ?? 0)}
- Net Long-Term Monthly Profit: $${Math.round(financialOutputs?.netMonthlyLongTermProfit ?? 0)}

Homeowner question: "${question}"

Provide a concise, highly specific, legally accurate answer grounded in D.C. DLCP regulations, Title 30 Chapter 2, DCMR, and D.C. market dynamics. If the user asks about an illegal strategy (like hiding an investment property, evading the 14.95% transient tax, or ignoring HOA bans), warn them directly about enforcement mechanisms and penalties.`;

    const answer = await generateWithFallback(contextPrompt, ADVISOR_SYSTEM_INSTRUCTION);
    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in advisor consultation:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process consultation question',
    });
  }
});

// Mount Vite or serve static files
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`DC STR Advisor server listening on http://0.0.0.0:${port}`);
});
