# D.C. Rental Advisor: Decision Logic Alignment & Host Dashboard

A unified business decision-support tool and ongoing hosting dashboard for Washington, D.C. homeowners choosing between listing on Airbnb and leasing to a 12-month tenant. This plan eliminates internal contradictions, enforces strict D.C. municipal rules, anchors market estimates to real Inside Airbnb benchmarks, and adds an ongoing host workspace.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Data Sources Notice**: You indicated you will paste `dcRules.ts` and `insideAirbnb.ts`. When proceeding to execution, we will integrate your exact files into `src/data/dcRules.ts` and `src/data/insideAirbnb.ts`. All calculator formulas, comps views, and baseline estimators will import exclusively from these two modules.
>
> **Confirmed Execution Sequence**: Per your choice, we will execute the **Core Logic Corrections & Feature 1 (Save My Home)** first, compile and verify, then pause for your testing before moving to Features 2 through 5.

- **Confirmed Decision 1**: Core rules and limits will be imported strictly from `dcRules.ts` (15.95% transient tax paid by guest, 90-night limit for unhosted stays, $250k insurance minimum, $99 2-year license fee).
- **Confirmed Decision 2**: Single authoritative `recommendation` status (`'airbnb' | 'long_term' | 'not_allowed'`) computed centrally in `calculator.ts` and consumed identically across the Verdict screen, Full Report, and AI Advisor.
- **Confirmed Decision 3**: Phased rollout — Phase 1 delivers all logic fixes, simplified 4-stage navigation, real comps integration, and Feature 1 ("Save My Home" with browser persistence). We will pause for testing prior to building Feature 2.

---

## 1. Overview & Core Concept

### What It Does
1. **Single Source of Truth**: Resolves all contradictory advice between the verdict card and the full report. The annual and monthly numbers account for D.C.'s 90-night annual cap whenever the owner is away during guest stays.
2. **Simplified 4-Stage Flow**: Replaces fragmented sub-steps with four clear progress markers: **Your home**, **Your answer**, **Full report**, and **Next steps**.
3. **No-Jargon Realism**: Eliminates abbreviations (`STR`, `ADR`, `DLCP`), formats pre-requisites as an actionable to-do list rather than assumed credentials, and displays authentic Inside Airbnb comp listings without stock photos or fake licenses.
4. **Post-Decision Host Workspace ("My listing")**: Unlocks ongoing value for hosts with saved home parameters, 12-month event pricing calendar, bank-style Profit & Loss tracking, local service directory, and license renewal reminders.

### Target Persona
Washington, D.C. homeowners (especially English basement and condo owners) who are deciding whether short-term hosting is financially viable under D.C. law, and who need practical, trustworthy monthly guidance if they decide to host.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Stage 1: Your Home (Streamlined Intake)
- **Primary Residence Gate**: Direct question on whether the property is the owner's primary home. If "No", immediately flag that D.C. law prohibits short-term rentals and recommend a 12-month lease or 30+ day medium-term rental.
- **Occupancy & Hosting Style**: Specific question: *"Will you be home while guests stay?"*
  - Default for English basements and spare bedrooms: **Home** (no 90-night annual cap under D.C. "Short-Term Rental" classification).
  - Default for whole houses / standalone apartments: **Away** (strict 90-night annual cap under D.C. "Vacation Rental" classification).
- **Data-Driven Suggested Rates**: Automatically populate nightly rate and booked nights from `insideAirbnb.ts` (median rate and typical booked nights for that neighborhood, room type, and bedroom count). If <8 listings exist in the neighborhood cohort, fallback to citywide median and explicitly note this.
- **Clear Estimate Labels**: 12-month long-term rent is clearly marked as an estimate with an invitation for the homeowner to replace it with their own figure.

#### Stage 2: Your Answer (Unified Verdict)
- **Opening Statement**: Plain single headline:
  - `"List it on Airbnb."` (when Airbnb net income exceeds long-term by >5%)
  - `"Keep a 12-month tenant."` (when long-term lease net income exceeds Airbnb by >5%)
  - `"It's nearly a tie."` (when the two options are within 5% of each other)
  - `"Airbnb is not allowed under D.C. law."` (if not a primary residence)
- **Dollar Delta**: Prominent annual difference (e.g. `+$1,240/year with Airbnb` or `+$3,850/year with a 12-month tenant`).
- **One-Sentence Explanatory Reason**: Clear root cause (e.g., *"Because you are on-site, you can host year-round to out-earn a traditional lease."* or *"D.C.'s 90-night vacation rental limit caps your earnings below what a 12-month tenant pays."*).
- **Hosting Alternative Callout**: If the 90-night cap causes Airbnb to lose, display an interactive toggle showing what the owner would earn if they were home during stays.
- **Action Buttons**: Plain language `Continue` and `Back` navigation.

#### Stage 3: Full Report
- Matches the Verdict screen's recommendation and numerical totals to the exact dollar.
- Separates guest-paid lodging tax (15.95%) from owner deductions.
- Checklist displays licensing requirements as an uncompleted **To-Do List** ($99 Basic Business License, $250k liability insurance, Clean Hands certificate, smoke/CO alarms).

#### Stage 4: Next Steps & "My Listing" Area
- For homeowners proceeding with Airbnb, unlocks the **My Listing** persistent workspace:
  - **Feature 1**: LocalStorage auto-save with "Edit my home" and "Start over" controls.
  - **Features 2–5** (in subsequent phases): Pricing calendar, P&L, service directory, and paperwork countdown.

### Navigation Hierarchy
- Top bar displays 4 discrete progress nodes:
  `[ 1. Your home ] ─── [ 2. Your answer ] ─── [ 3. Full report ] ─── [ 4. Next steps ]`
- Users can click back to any completed stage. Jump-ahead is disabled.
- Every "Back" button returns exactly to the preceding step, preserving all user inputs.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Booked Nights Calculation Rule
- **Approach**: Booked nights per year is calculated as `min(expectedNights, dcAllowedNights)`.
  - When `isHomeDuringStay === true`: `dcAllowedNights = 365`.
  - When `isHomeDuringStay === false`: `dcAllowedNights = 90`.
- **Why**: Eliminates misleading revenue figures that project 200+ nights of revenue for unhosted properties that D.C. legally limits to 90 nights.

### Decision 2: Lodging Tax Treatment (15.95%)
- **Approach**: In D.C., the 14.95% + 1% convention surcharge (15.95% total) is charged to the guest on top of the nightly rate and remitted directly by Airbnb. It is displayed in revenue breakdowns as *"Paid by your guest, not by you"* and is **never** deducted from the owner's net payout.
- **Why**: Previous calculations deducted 14.95% from the host's gross earnings, artificially depressing projected Airbnb income.

### Decision 3: Single Recommendation Engine
- **Approach**: A single function in `calculator.ts` outputs:
  ```ts
  recommendation: 'airbnb' | 'long_term' | 'not_allowed'
  isNearTie: boolean // true if difference <= 5%
  annualDifference: number
  airbnbNetAnnual: number
  longTermNetAnnual: number
  ```
  The Verdict screen, the Report viewer, and the AI Advisor server route will all ingest this identical structure.

---

## 4. Technical Architecture & System Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                          D.C. Rental Advisor                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴────────────────────────┐
          ▼                                                  ▼
┌───────────────────────┐                          ┌───────────────────────┐
│     dcRules.ts        │                          │   insideAirbnb.ts     │
│  - 15.95% Lodging Tax │                          │  - Neighborhood Stats │
│  - 90-night limit     │                          │  - Bedroom Medians    │
│  - $250k Insurance    │                          │  - 146 Real Listings  │
│  - $99 License / 2yr  │                          │  - Typical Nights     │
└──────────┬────────────┘                          └───────────┬───────────┘
           │                                                   │
           └────────────────────────┬──────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        calculator.ts (Engine)                          │
│  - Computes: bookedNights = min(userNights, dcAllowedNights)           │
│  - Evaluates: 'airbnb' | 'long_term' | 'not_allowed'                   │
│  - Identifies: <=5% Near Tie threshold                                 │
│  - Computes unhosted vs. hosted upside scenario                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Stage 1: Home   │      │ Stage 2: Verdict │      │ Stage 3: Report  │
│  - Primary check │      │ - Single verdict │      │ - Real breakdown │
│  - Home vs. Away │      │ - Dollar diff    │      │ - No-deduct tax  │
│  - Medians auto  │      │ - Root-cause why │      │ - To-do checklist│
└──────────────────┘      └──────────────────┘      └──────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Stage 4: Next Steps                              │
│       ┌────────────────────────────────────────────────────────┐       │
│       │               "My Listing" Persistent Hub              │       │
│       │  - Feature 1: Save My Home (Local storage persistence) │       │
│       │  - Feature 2: 12-Month Pricing Calendar & Events       │       │
│       │  - Feature 3: Bank-Style Profit & Loss (Plan vs Actual)│       │
│       │  - Feature 4: Host Help Directory (Google Maps Search) │       │
│       │  - Feature 5: License & Paperwork Tracker & Check-in   │       │
│       └────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    server.ts (/api/advisor/*)                          │
│  - Reads identical calculator recommendation & numbers                 │
│  - Enforces 90-night and 15.95% rules without hallucination            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phased Implementation Sequence

### Phase 1 (Immediate Target): Core Logic Alignment & Feature 1
1. **Data Files Integration**:
   - Establish `src/data/dcRules.ts` and `src/data/insideAirbnb.ts`.
   - Purge deprecated constants and mock comp generators.
2. **Calculator Overhaul (`src/utils/calculator.ts`)**:
   - Implement `recommendation` calculation with near-tie detection.
   - Enforce 90-night rule strictly on unhosted stays; 365 nights for hosted stays.
   - Correct lodging tax to 15.95% paid by guest.
3. **Stage 1 (Intake Flow)**:
   - Add "Will you be home while guests stay?" question.
   - Default basements and spare rooms to "home", whole homes to "away".
   - Autopopulate median nightly rate and typical nights from `insideAirbnb.ts`.
4. **Stage 2 (Verdict Screen)**:
   - Single clear opening sentence ("List it on Airbnb." / "Keep a 12-month tenant." / "It's nearly a tie." / "Airbnb is not allowed").
   - Annual dollar difference and concise root-cause rationale.
   - Show hosted upside comparison if 90-night limit caused Airbnb to lose.
5. **Stage 3 & Navigation**:
   - 4-step progress header (Your home, Your answer, Full report, Next steps).
   - Real comp listings from `insideAirbnb.ts` (no stock photos or fake numbers).
   - Clean English terminology (no abbreviations).
6. **Feature 1: Save My Home**:
   - Persist user configuration in browser `localStorage`.
   - Returning hosts land directly on their personalized dashboard with "Edit my home" and "Start over" buttons.
7. **Verification & Pause**:
   - Verify Capitol Hill 1-bed basement (owner home vs. owner away test cases).
   - Compile, lint, and pause for user testing.

### Implementation Progress
- [x] **Phase 1**: Core logic alignment & Feature 1 (Save My Home persistence via localStorage, zero-contradiction verdicts, 15.95% guest tax, 90-night unhosted cap, real Inside Airbnb medians and comps).
- [x] **Phase 2**: Feature 2 — When & Why to Charge More (12-Month Event Pricing Calendar, Best 90 Nights Strategy optimizer for capped hosts with +$6,000 upside, and Metro/Parking amenity boost calculator).
- [ ] **Phase 3**: Feature 3 — Bank-style Profit & Loss statement (Plan vs Actual, cleaning breakdown, 12-month bar chart with tenant income line).
- [ ] **Phase 4**: Feature 4 — Host Help Directory with Google Maps neighborhood query integration.
- [ ] **Phase 5**: Feature 5 — Paperwork & license renewal countdown tracker, monthly check-in, and AI Advisor sync.
