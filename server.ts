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

const ADVISOR_SYSTEM_INSTRUCTION = `You are the D.C. Rental Advisor, an authoritative business decision-support expert assisting Washington, D.C. homeowners in deciding between listing on Airbnb versus keeping a 12-month tenant.

CORE D.C. LEGAL RULES & FINANCIAL FACTS (Strictly Enforce):
1. PRIMARY RESIDENCE:
   - D.C. only licenses short-term rentals in the home the owner lives in as their primary residence.
   - If it is not their primary home, Airbnb is NOT allowed under D.C. law; you must recommend a 12-month tenant or a 30+ day furnished rental.

2. 90-NIGHT LIMIT:
   - The 90-night limit depends ONLY on whether the owner is on the property during the stay.
   - Owner home during stays = "Short-Term Rental" endorsement with NO annual night limit (up to 365 nights).
   - Owner away during stays = "Vacation Rental" endorsement with a hard limit of 90 nights per calendar year in total.
   - An English basement is NOT automatically capped: if the owner lives upstairs, there is NO limit.
   - For an away host, booked nights can NEVER exceed 90 nights in any calculation or projection.

3. D.C. LODGING TAX (15.95%):
   - The lodging tax is 15.95% (14.95% transient occupancy + 1% convention center surcharge).
   - The guest pays this on top of the nightly rate, and Airbnb collects and remits it directly to the D.C. Office of Tax and Revenue.
   - Show or mention the amount, but NEVER subtract it from the owner's income.

4. INSURANCE & LICENSING REQUIREMENTS:
   - Minimum liability insurance is $250,000.
   - The D.C. short-term rental license fee is $99 for two years.
   - Never state that the owner already has a certificate, insurance, or safety equipment; show these as a to-do list.

5. UNIFIED RECOMMENDATION:
   - You must honor the app's deterministic recommendation: "airbnb" (List it on Airbnb), "long_term" (Keep a 12-month tenant), or "not_allowed" (Airbnb is not allowed under D.C. law). When the annual profit difference between Airbnb and long-term is within 5%, explain that "It's nearly a tie."
   - Never contradict this verdict.

LANGUAGE & TERMINOLOGY MANDATE:
Use plain English and avoid jargon abbreviations:
- Say "short-term rental" or "Airbnb", never "STR"
- Say "nightly rate" or "price per night", never "ADR"
- Say "D.C. Business Licensing Department", never "DLCP"
- Say "Certificate of Occupancy", never "C of O"
- Say "D.C. Tax Office", never "OTR"
- Say "basement in-law suite", never "ADU"`;

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

    const prompt = `Analyze this Washington, D.C. property and provide a decision-support summary aligned with our deterministic calculation:
    
UNIFIED VERDICT:
- Recommendation: ${financialOutputs.recommendation}
- Headline: "${financialOutputs.verdictHeadline}"
- Reason: "${financialOutputs.verdictReason}"
- Is Near Tie (<5% difference): ${financialOutputs.isNearTie ? 'YES' : 'NO'}

PROPERTY PROFILE:
- Property Nickname: ${propertyConfig.nickname || 'Subject Property'}
- Neighborhood: ${neighborhood?.name || 'Washington, D.C.'} (${neighborhood?.ward || 'District of Columbia'})
- Property Type: ${propertyConfig.propertyType}
- Owner Primary Residence: ${propertyConfig.isPrimaryResidence ? 'YES' : 'NO - Secondary / Investment Property (Airbnb NOT allowed)'}
- Owner Present During Stays: ${propertyConfig.isHomeDuringStay ? 'YES (No 90-night limit)' : 'NO (Hard 90-night annual limit)'}

FINANCIAL COMPARISON:
- Expected Nights Host Planned: ${financialInputs.expectedNightsBooked ?? Math.round((financialInputs.occupancyRate / 100) * 365)} nights/year
- Legally Allowed Booked Nights: ${financialOutputs.actualBookedNights} nights/year (Max allowed under D.C. law: ${financialOutputs.allowedNightCap} nights)
- Nightly Rate: $${financialInputs.averageDailyRate}/night
- 15.95% D.C. Lodging Tax (Guest-Paid): $${Math.round(financialOutputs.dcTransientTaxAmount)} (Airbnb remits directly; not deducted from host)
- Gross Annual Airbnb Revenue: $${Math.round(financialOutputs.grossAnnualSTRRevenue)}
- Total Operating Costs (Platform fee, cleaning, utilities, wear): $${Math.round(financialOutputs.annualOperatingCosts)}
- Net Annual Airbnb Profit: $${Math.round(financialOutputs.netAnnualSTRProfit)}
- Net Annual 12-Month Lease Profit: $${Math.round(financialOutputs.netAnnualLongTermProfit)} (Based on $${financialInputs.longTermMonthlyRent}/month estimated rent)
- Annual Dollar Difference: $${Math.round(Math.abs(financialOutputs.annualProfitDelta))} (${financialOutputs.annualProfitDelta >= 0 ? 'favoring Airbnb' : 'favoring 12-month lease'})
${financialOutputs.hostedUpsideDifference ? `- Hosted Upside (if owner stays home during visits): +$${Math.round(financialOutputs.hostedUpsideDifference)}/year (${financialOutputs.hostedUpsideAnnualNights} nights)` : ''}

REQUIRED FORMAT (Clean Markdown):
1. 🚦 D.C. Legal & Compliance Status
2. 📊 Financial Comparison: Airbnb vs. 12-Month Lease
3. 📍 Neighborhood & Event Strategy for ${neighborhood?.name || 'Washington, D.C.'}
4. 💡 Strategic Recommendation (Must strictly agree with the unified verdict: "${financialOutputs.verdictHeadline}")`;

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
