export interface DCEvent {
  id: string;
  name: string;
  dates: string;
  monthIndex: number; // 0 for Jan, 11 for Dec
  demandLevel: 'extreme' | 'high' | 'moderate';
  surgeMultiplier: number; // e.g. 1.45 for +45%
  description: string;
  minStayRecommendation: number; // nights
  targetGuestType: string;
  affectedNeighborhoods?: string[]; // IDs of neighborhoods that see extra surge
}

export interface MonthPricingProfile {
  monthIndex: number;
  monthName: string;
  seasonName: string;
  seasonType: 'peak' | 'high' | 'shoulder' | 'low';
  baseMultiplier: number;
  typicalNightsBookedShare: number; // % of annual nights booked in this month
  primaryEvents: DCEvent[];
  hostStrategyTip: string;
  minNightsRule: string;
}

export interface AmenityBoost {
  id: string;
  name: string;
  description: string;
  dollarBoost: number; // $/night
  dcContext: string;
}

export const AMENITY_BOOSTS: AmenityBoost[] = [
  {
    id: 'parking',
    name: 'Dedicated Off-Street Parking',
    description: 'Private driveway, garage space, or reserved parking pad behind rowhome',
    dollarBoost: 30,
    dcContext: 'D.C. residential street parking permits are restrictive and confusing for visitors. Guests pay $30-$45/day in commercial garages, making a free spot a massive differentiator.',
  },
  {
    id: 'metro_proximity',
    name: 'Within 5-Minute Walk to Metro',
    description: 'Less than 3 blocks to a Metrorail station (Red, Orange, Silver, Blue, Green, Yellow)',
    dollarBoost: 20,
    dcContext: 'Tourist families and government contractors frequently choose Metro-adjacent homes over driving into downtown D.C. traffic.',
  },
  {
    id: 'private_patio',
    name: 'Private Outdoor Space or Patio',
    description: 'Enclosed courtyard, English basement lightwell patio, or private deck',
    dollarBoost: 15,
    dcContext: 'Especially in rowhome neighborhoods (Capitol Hill, Shaw, Dupont), private outdoor seating is rare and highly requested in spring and autumn.',
  },
  {
    id: 'dedicated_workspace',
    name: 'Ergonomic Desk & Gigabit Wi-Fi',
    description: 'Standing desk or dedicated monitor setup with fast Wi-Fi (>150 Mbps)',
    dollarBoost: 12,
    dcContext: 'Consultants, political campaign staff, and federal witnesses work remotely between hearings and value quiet, reliable work infrastructure.',
  },
];

export const DC_MONTHLY_PRICING: MonthPricingProfile[] = [
  {
    monthIndex: 0,
    monthName: 'January',
    seasonName: 'Winter / Congress Convenes',
    seasonType: 'shoulder',
    baseMultiplier: 1.15,
    typicalNightsBookedShare: 0.07,
    primaryEvents: [
      {
        id: 'congress_convenes',
        name: 'New Congressional Session Convenes',
        dates: 'Jan 3 - Jan 15',
        monthIndex: 0,
        demandLevel: 'high',
        surgeMultiplier: 1.25,
        description: 'Representatives, new staff, political delegations, and lobbyists arrive in D.C. for opening committee assignments.',
        minStayRecommendation: 3,
        targetGuestType: 'Legislative staff, advocates, and journalists',
        affectedNeighborhoods: ['capitol_hill', 'shaw', 'dupont_circle'],
      },
      {
        id: 'march_for_life',
        name: 'National Rallies & Conferences',
        dates: 'Mid-January',
        monthIndex: 0,
        demandLevel: 'moderate',
        surgeMultiplier: 1.15,
        description: 'Annual civic rallies and winter advocacy gatherings bringing tens of thousands of visitors to the Mall.',
        minStayRecommendation: 2,
        targetGuestType: 'Advocacy groups and student organizations',
      },
    ],
    hostStrategyTip: 'Focus on 3+ night bookings for incoming congressional delegations. Avoid 1-night stays.',
    minNightsRule: '2-night minimum on weekends; 3-night minimum during opening legislative week',
  },
  {
    monthIndex: 1,
    monthName: 'February',
    seasonName: 'Winter Low Season',
    seasonType: 'low',
    baseMultiplier: 0.85,
    typicalNightsBookedShare: 0.05,
    primaryEvents: [
      {
        id: 'presidents_day',
        name: "Presidents' Day Long Weekend",
        dates: 'Third weekend in Feb',
        monthIndex: 1,
        demandLevel: 'moderate',
        surgeMultiplier: 1.2,
        description: '3-day weekend tourist influx to Smithsonian museums and presidential monuments.',
        minStayRecommendation: 2,
        targetGuestType: 'Family museum travelers from Mid-Atlantic',
      },
    ],
    hostStrategyTip: 'Offer a 10% discount for stays of 5+ nights to capture visiting fellows, medical researchers, or winter interns.',
    minNightsRule: 'Relax minimum to 2 nights to keep occupancy healthy during cold weather',
  },
  {
    monthIndex: 2,
    monthName: 'March',
    seasonName: 'Spring Awakening & Blossom Preview',
    seasonType: 'high',
    baseMultiplier: 1.35,
    typicalNightsBookedShare: 0.09,
    primaryEvents: [
      {
        id: 'cherry_blossom_opening',
        name: 'National Cherry Blossom Festival Opening',
        dates: 'Late March - Mid April',
        monthIndex: 2,
        demandLevel: 'extreme',
        surgeMultiplier: 1.45,
        description: 'Over 1.5 million tourists visit the Tidal Basin. Hotel rooms across D.C. exceed $400/night.',
        minStayRecommendation: 3,
        targetGuestType: 'Domestic and international tourists, photographers, couples',
        affectedNeighborhoods: ['capitol_hill', 'dupont_circle', 'georgetown', 'navy_yard'],
      },
    ],
    hostStrategyTip: 'Do not discount March dates! Block your calendar until your peak rates are published.',
    minNightsRule: 'Strict 3-night minimum for blossom festival dates',
  },
  {
    monthIndex: 3,
    monthName: 'April',
    seasonName: 'Peak Spring Tourism',
    seasonType: 'peak',
    baseMultiplier: 1.5,
    typicalNightsBookedShare: 0.12,
    primaryEvents: [
      {
        id: 'cherry_blossom_peak',
        name: 'Peak Bloom & Blossom Parade Weekend',
        dates: 'First two weeks of April',
        monthIndex: 3,
        demandLevel: 'extreme',
        surgeMultiplier: 1.6,
        description: 'Highest tourism density of the entire year in Washington, D.C. Short-term rentals sell out weeks ahead.',
        minStayRecommendation: 3,
        targetGuestType: 'Vacationing families and international tourists',
      },
      {
        id: 'imf_spring',
        name: 'IMF / World Bank Spring Meetings',
        dates: 'Mid to late April',
        monthIndex: 3,
        demandLevel: 'high',
        surgeMultiplier: 1.4,
        description: '10,000+ central bankers, finance ministers, and economists convene in downtown D.C.',
        minStayRecommendation: 4,
        targetGuestType: 'Financial executives and international delegates',
        affectedNeighborhoods: ['dupont_circle', 'foggy_bottom', 'georgetown'],
      },
    ],
    hostStrategyTip: 'Set your highest rate of the year. Add a 3-night minimum to ensure full weekend coverage without gap nights.',
    minNightsRule: 'Strict 3-night minimum. Non-refundable cancellation policy recommended',
  },
  {
    monthIndex: 4,
    monthName: 'May',
    seasonName: 'University Graduations & Memorial Day',
    seasonType: 'peak',
    baseMultiplier: 1.45,
    typicalNightsBookedShare: 0.11,
    primaryEvents: [
      {
        id: 'dc_graduations',
        name: 'D.C. University Commencements',
        dates: 'May 8 - May 24 (rolling weekends)',
        monthIndex: 4,
        demandLevel: 'extreme',
        surgeMultiplier: 1.55,
        description: 'Georgetown, GWU, Howard, American, and Catholic University graduations occur back-to-back. Families book large spaces.',
        minStayRecommendation: 3,
        targetGuestType: 'Graduation families, grandparents, multi-generational groups',
      },
      {
        id: 'memorial_day',
        name: 'Memorial Day Weekend & Rolling Thunder',
        dates: 'Late May',
        monthIndex: 4,
        demandLevel: 'high',
        surgeMultiplier: 1.35,
        description: 'National Memorial Day concert, parade, and veteran celebrations drawing major crowds.',
        minStayRecommendation: 3,
        targetGuestType: 'Veterans, patriotic tourists, families',
      },
    ],
    hostStrategyTip: 'Market whole basements or multi-bed units to visiting families attending college commencements.',
    minNightsRule: '3-night minimum on graduation weekends (Thursday-Sunday or Friday-Monday)',
  },
  {
    monthIndex: 5,
    monthName: 'June',
    seasonName: 'Pride & Summer Tourism',
    seasonType: 'high',
    baseMultiplier: 1.3,
    typicalNightsBookedShare: 0.1,
    primaryEvents: [
      {
        id: 'capital_pride',
        name: 'Capital Pride Parade & Festival',
        dates: 'First two weeks of June',
        monthIndex: 5,
        demandLevel: 'high',
        surgeMultiplier: 1.4,
        description: 'Over 600,000 attendees celebrate along 14th Street and Pennsylvania Avenue.',
        minStayRecommendation: 2,
        targetGuestType: 'Pride attendees, cultural tourists',
        affectedNeighborhoods: ['dupont_circle', 'shaw', 'adams_morgan', 'columbia_heights'],
      },
      {
        id: 'smithsonian_folklife',
        name: 'Smithsonian Folklife Festival',
        dates: 'Late June - early July',
        monthIndex: 5,
        demandLevel: 'moderate',
        surgeMultiplier: 1.25,
        description: 'Annual cultural festival on the National Mall with outdoor exhibits and concerts.',
        minStayRecommendation: 2,
        targetGuestType: 'Summer cultural visitors and educators',
      },
    ],
    hostStrategyTip: 'Highlight patio/outdoor space and air conditioning. June is the start of warm D.C. summer.',
    minNightsRule: '2 to 3-night minimum',
  },
  {
    monthIndex: 6,
    monthName: 'July',
    seasonName: 'Independence Day on the Mall',
    seasonType: 'peak',
    baseMultiplier: 1.4,
    typicalNightsBookedShare: 0.1,
    primaryEvents: [
      {
        id: 'fourth_of_july',
        name: 'Fourth of July Fireworks & Parade',
        dates: 'July 2 - July 6',
        monthIndex: 6,
        demandLevel: 'extreme',
        surgeMultiplier: 1.6,
        description: 'National Independence Day Celebration. Fireworks at the Washington Monument attract huge national crowds.',
        minStayRecommendation: 3,
        targetGuestType: 'Patriotic tourists, families with children',
        affectedNeighborhoods: ['capitol_hill', 'navy_yard', 'dupont_circle'],
      },
    ],
    hostStrategyTip: 'Price the Fourth of July week at peak rates with a 3-night minimum. The rest of July sees moderate summer family bookings.',
    minNightsRule: '3-night minimum for Fourth of July; 2-night minimum thereafter',
  },
  {
    monthIndex: 7,
    monthName: 'August',
    seasonName: 'Congressional Recess (Low Season)',
    seasonType: 'low',
    baseMultiplier: 0.8,
    typicalNightsBookedShare: 0.05,
    primaryEvents: [
      {
        id: 'congressional_recess',
        name: 'Congressional Summer Recess',
        dates: 'Full month of August',
        monthIndex: 7,
        demandLevel: 'moderate',
        surgeMultiplier: 0.85,
        description: 'Congress adjourns, policy events pause, and government officials leave D.C. Summer heat reduces leisure foot traffic.',
        minStayRecommendation: 4,
        targetGuestType: 'Budget family tourists, international summer visitors, relocating government staff',
      },
    ],
    hostStrategyTip: 'Lower rates by 15-20% or offer 7-night weekly discounts to fill dates. This is the ideal month for host vacations or maintenance.',
    minNightsRule: 'Allow flexible 2-night stays or incentivize 7-day bookings',
  },
  {
    monthIndex: 8,
    monthName: 'September',
    seasonName: 'Congress Returns & Fall Session',
    seasonType: 'high',
    baseMultiplier: 1.35,
    typicalNightsBookedShare: 0.09,
    primaryEvents: [
      {
        id: 'congress_returns',
        name: 'Legislative Session Resumes',
        dates: 'First Tuesday after Labor Day',
        monthIndex: 8,
        demandLevel: 'high',
        surgeMultiplier: 1.35,
        description: 'Congressional hearings, think-tank forums, and budget negotiations bring policy travelers back to D.C.',
        minStayRecommendation: 3,
        targetGuestType: 'Lobbyists, consultants, corporate policy heads',
        affectedNeighborhoods: ['capitol_hill', 'shaw', 'dupont_circle'],
      },
      {
        id: 'adams_morgan_day',
        name: 'Adams Morgan Day & H Street Festival',
        dates: 'Mid-September weekends',
        monthIndex: 8,
        demandLevel: 'moderate',
        surgeMultiplier: 1.25,
        description: 'Historic neighborhood music and arts street festivals drawing over 100,000 regional visitors.',
        minStayRecommendation: 2,
        targetGuestType: 'Regional weekend travelers, foodies, music fans',
        affectedNeighborhoods: ['adams_morgan', 'h_street', 'shaw'],
      },
    ],
    hostStrategyTip: 'Mid-week bookings (Tuesday-Thursday) command high rates from government contractors and business travelers.',
    minNightsRule: '2-night minimum on weekends; 3-night minimum for mid-week policy summits',
  },
  {
    monthIndex: 9,
    monthName: 'October',
    seasonName: 'Conferences & Marine Corps Marathon',
    seasonType: 'peak',
    baseMultiplier: 1.45,
    typicalNightsBookedShare: 0.11,
    primaryEvents: [
      {
        id: 'imf_annual',
        name: 'IMF / World Bank Annual Meetings',
        dates: 'Mid-October',
        monthIndex: 9,
        demandLevel: 'high',
        surgeMultiplier: 1.45,
        description: 'Massive international delegation of finance ministers and global delegations fill D.C. accommodations.',
        minStayRecommendation: 4,
        targetGuestType: 'International delegates and journalists',
        affectedNeighborhoods: ['dupont_circle', 'georgetown', 'foggy_bottom'],
      },
      {
        id: 'marine_corps_marathon',
        name: 'Marine Corps Marathon (The People’s Marathon)',
        dates: 'Last Sunday in October',
        monthIndex: 9,
        demandLevel: 'extreme',
        surgeMultiplier: 1.5,
        description: 'Over 30,000 runners plus families travel to D.C. for the marathon finishing at the Iwo Jima Memorial.',
        minStayRecommendation: 3,
        targetGuestType: 'Marathon runners, military families, cheering spectators',
      },
    ],
    hostStrategyTip: 'October has the best weather in D.C. and peak autumn foliage. Keep rates firm across every weekend.',
    minNightsRule: 'Strict 3-night minimum on Marathon weekend and IMF week',
  },
  {
    monthIndex: 10,
    monthName: 'November',
    seasonName: 'Autumn Conventions & Thanksgiving',
    seasonType: 'shoulder',
    baseMultiplier: 1.1,
    typicalNightsBookedShare: 0.06,
    primaryEvents: [
      {
        id: 'veterans_day',
        name: 'Veterans Day Ceremonies',
        dates: 'Nov 10 - Nov 13',
        monthIndex: 10,
        demandLevel: 'moderate',
        surgeMultiplier: 1.25,
        description: 'Solemn commemorative ceremonies at Arlington National Cemetery, Vietnam Memorial, and WWII Memorial.',
        minStayRecommendation: 2,
        targetGuestType: 'Veterans and military families',
      },
      {
        id: 'thanksgiving',
        name: 'Thanksgiving Family Reunions',
        dates: 'Late November',
        monthIndex: 10,
        demandLevel: 'high',
        surgeMultiplier: 1.3,
        description: 'Families traveling to visit local relatives in D.C., Maryland, and Northern Virginia.',
        minStayRecommendation: 3,
        targetGuestType: 'Visiting extended family members',
      },
    ],
    hostStrategyTip: 'Price Thanksgiving week as a whole 4-night block. Emphasize fully-stocked kitchens for holiday meals.',
    minNightsRule: '3 to 4-night minimum over Thanksgiving weekend',
  },
  {
    monthIndex: 11,
    monthName: 'December',
    seasonName: 'Holidays & Winter Light Displays',
    seasonType: 'shoulder',
    baseMultiplier: 1.05,
    typicalNightsBookedShare: 0.05,
    primaryEvents: [
      {
        id: 'national_tree',
        name: 'National Christmas Tree & Holiday Market',
        dates: 'Dec 1 - Dec 24',
        monthIndex: 11,
        demandLevel: 'moderate',
        surgeMultiplier: 1.15,
        description: 'Downtown D.C. Holiday Market, National Menorah, and White House tree displays.',
        minStayRecommendation: 2,
        targetGuestType: 'Holiday shoppers and weekend holiday tourists',
      },
      {
        id: 'new_years_eve',
        name: "New Year's Eve Celebrations",
        dates: 'Dec 30 - Jan 2',
        monthIndex: 11,
        demandLevel: 'high',
        surgeMultiplier: 1.35,
        description: 'New Year celebrations, nightlife galas, and inaugural countdowns.',
        minStayRecommendation: 3,
        targetGuestType: 'Young professionals, couples, gala attendees',
      },
    ],
    hostStrategyTip: 'Holiday weeks (Christmas to New Year’s) command strong weekend rates. Early December is slower.',
    minNightsRule: '3-night minimum for New Year’s weekend',
  },
];

/**
 * Optimizes the best 90 nights of the year for unhosted hosts subject to D.C.'s 90-night cap.
 * Concentrates bookings during the highest-rate demand spikes to maximize gross earnings within legal limits.
 */
export interface Best90NightWindow {
  id: string;
  eventName: string;
  timeframe: string;
  nightsAllocated: number;
  surgeMultiplier: number;
  whyThisWindow: string;
  targetRate: number;
}

export function computeBest90NightsStrategy(baselineRate: number): {
  windows: Best90NightWindow[];
  totalNights: number;
  optimizedAverageRate: number;
  baselineRevenue90: number;
  optimizedRevenue90: number;
  revenueUpside: number;
  percentUpside: number;
} {
  const windows: Best90NightWindow[] = [
    {
      id: 'cherry_blossom',
      eventName: 'National Cherry Blossom Festival',
      timeframe: 'March 22 – April 11 (3 peak weekends + mid-weeks)',
      nightsAllocated: 20,
      surgeMultiplier: 1.55,
      whyThisWindow: 'D.C. hotels hit 95%+ occupancy; tourists happily pay premium rates for rowhomes near Metro.',
      targetRate: Math.round(baselineRate * 1.55),
    },
    {
      id: 'commencements',
      eventName: 'D.C. University Graduations',
      timeframe: 'May 8 – May 24 (GWU, Georgetown, Howard, American)',
      nightsAllocated: 15,
      surgeMultiplier: 1.5,
      whyThisWindow: 'Visiting parents and grandparents seek comfortable homes with multiple bedrooms and kitchens.',
      targetRate: Math.round(baselineRate * 1.5),
    },
    {
      id: 'fourth_of_july',
      eventName: 'Fourth of July Independence Celebration',
      timeframe: 'July 1 – July 8 (Full holiday week)',
      nightsAllocated: 7,
      surgeMultiplier: 1.6,
      whyThisWindow: 'Iconic national celebrations on the National Mall create peak patriotic travel demand.',
      targetRate: Math.round(baselineRate * 1.6),
    },
    {
      id: 'fall_session_imf',
      eventName: 'Fall Congressional Return & IMF Meetings',
      timeframe: 'September 15 – October 15 (Mid-week summits)',
      nightsAllocated: 24,
      surgeMultiplier: 1.4,
      whyThisWindow: 'Corporate policy summits, think-tank conferences, and international finance delegations.',
      targetRate: Math.round(baselineRate * 1.4),
    },
    {
      id: 'marine_marathon',
      eventName: 'Marine Corps Marathon Weekend',
      timeframe: 'Late October (Thursday – Monday)',
      nightsAllocated: 5,
      surgeMultiplier: 1.5,
      whyThisWindow: '30,000+ marathon runners and their support families travel to D.C.',
      targetRate: Math.round(baselineRate * 1.5),
    },
    {
      id: 'thanksgiving_new_years',
      eventName: 'Holiday Reunions & New Year’s Eve',
      timeframe: 'Thanksgiving (5 nights) + New Year’s (5 nights) + March Preview (9 nights)',
      nightsAllocated: 19,
      surgeMultiplier: 1.3,
      whyThisWindow: 'Visiting family reunions and holiday party travel when suburban hotel alternatives are inconvenient.',
      targetRate: Math.round(baselineRate * 1.3),
    },
  ];

  const totalNights = windows.reduce((sum, w) => sum + w.nightsAllocated, 0); // 90 nights exact
  const baselineRevenue90 = baselineRate * totalNights;
  const optimizedRevenue90 = windows.reduce((sum, w) => sum + w.targetRate * w.nightsAllocated, 0);
  const revenueUpside = optimizedRevenue90 - baselineRevenue90;
  const optimizedAverageRate = Math.round(optimizedRevenue90 / totalNights);
  const percentUpside = Math.round((revenueUpside / baselineRevenue90) * 100);

  return {
    windows,
    totalNights,
    optimizedAverageRate,
    baselineRevenue90,
    optimizedRevenue90,
    revenueUpside,
    percentUpside,
  };
}
