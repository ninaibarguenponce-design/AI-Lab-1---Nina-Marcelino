import { NeighborhoodData } from '../types';

export const DC_NEIGHBORHOODS: NeighborhoodData[] = [
  {
    id: 'capitol_hill',
    name: 'Capitol Hill / Eastern Market',
    ward: 'Ward 6',
    coordinates: { lat: 38.8899, lng: -77.0000 },
    typicalADR: 245,
    typicalOccupancy: 72,
    benchmarkLongTermRent: 2650,
    vibe: 'Historic rowhomes, congressional offices, policy think-tanks, Eastern Market food hall.',
    demandDrivers: [
      'Congressional session travelers, lobbyists, Supreme Court litigators, and diplomatic delegations',
      'High-budget family tourists seeking walkable rowhome character near the National Mall and Library of Congress',
      'Visiting government defense contractors and federal oversight taskforces'
    ],
    seasonalSurges: [
      { season: 'Spring (March - May)', factor: '+30% to +45% ADR', note: 'National Cherry Blossom Festival and peak congressional hearing calendar' },
      { season: 'Fall (September - November)', factor: '+20% to +35% ADR', note: 'Full legislative sessions and autumn policy summits' },
      { season: 'August Recess (August)', factor: '-25% ADR', note: 'Congress adjourns; transition pricing to budget leisure tourists' }
    ],
    eventPricingTips: [
      'State of the Union & Committee hearing weeks: Push nightly ADR to $350+ for 2-3 night minimums.',
      'Congressional summer recess (August): Shift strategy to 7+ night family discounts or intern sub-leases.',
      'Cherry Blossom Festival peak bloom: Enforce a 3-night minimum with non-refundable 20% advance booking premiums.'
    ]
  },
  {
    id: 'dupont_circle',
    name: 'Dupont Circle / Kalorama',
    ward: 'Ward 2',
    coordinates: { lat: 38.9096, lng: -77.0434 },
    typicalADR: 260,
    typicalOccupancy: 74,
    benchmarkLongTermRent: 2800,
    vibe: 'Embassy corridor, cosmopolitan bistros, historic brownstones, and cultural museums.',
    demandDrivers: [
      'International NGO executives, embassy visitors, and World Bank/Brookings scholars',
      'Affluent cultural tourists prioritizing Michelin-rated dining, Phillips Collection, and Metro accessibility',
      'Visiting academics, medical specialists, and LGBTQ+ festival attendees'
    ],
    seasonalSurges: [
      { season: 'Late Spring (May - June)', factor: '+35% ADR', note: 'Capital Pride Festival, embassy garden tours, and European Union open house' },
      { season: 'Autumn (October)', factor: '+25% ADR', note: 'International policy forums and cultural galas' },
      { season: 'Winter (January - February)', factor: '-20% ADR', note: 'Lower leisure influx; rely on embassy consultant bookings' }
    ],
    eventPricingTips: [
      'Capital Pride weekend (June): Set rates 50% above baseline with a strict 3-night minimum stay.',
      'Embassy Passport DC month (May): Highlight walking proximity to Connecticut Ave & Massachusetts Ave embassies.',
      'Midweek international NGO rotations: Package flexible check-in times to secure high-per-diem corporate travelers.'
    ]
  },
  {
    id: 'logan_circle_shaw',
    name: 'Logan Circle / Shaw / 14th St',
    ward: 'Ward 2 & Ward 1',
    coordinates: { lat: 38.9100, lng: -77.0300 },
    typicalADR: 275,
    typicalOccupancy: 76,
    benchmarkLongTermRent: 2950,
    vibe: 'Premier dining corridor, trendy boutiques, Walter E. Washington Convention Center nexus.',
    demandDrivers: [
      'Large-scale medical, tech, and defense association delegates attending Walter E. Washington Convention Center',
      'Modern urban luxury tourists and weekend dining travelers wanting 14th Street lifestyle',
      'Creative agency freelancers and executive corporate relocations'
    ],
    seasonalSurges: [
      { season: 'Spring Convention Run (April - June)', factor: '+40% ADR', note: 'Major back-to-back association conferences at Convention Center' },
      { season: 'Fall Association Circuit (Sept - Nov)', factor: '+30% ADR', note: 'Corporate tradeshows and medical society summits' },
      { season: 'Mid-Winter (January)', factor: '-15% ADR', note: 'Leisure slowdown between major tradeshow dates' }
    ],
    eventPricingTips: [
      'Sync pricing with the Walter E. Washington Convention Center calendar; conference weeks can command $400+/night.',
      'Promote dedicated high-speed workspaces and espresso setups to capture corporate business expense cards.',
      'Weekend dining surges: Keep 2-night minimums (Fri-Sun) to prevent single-night gaps on premium weekends.'
    ]
  },
  {
    id: 'navy_yard_wharf',
    name: 'Navy Yard / The Wharf / SW Waterfront',
    ward: 'Ward 6 & Ward 8',
    coordinates: { lat: 38.8765, lng: -77.0030 },
    typicalADR: 250,
    typicalOccupancy: 71,
    benchmarkLongTermRent: 2750,
    vibe: 'Nationals Park, Audi Field soccer, waterfront marina dining, The Anthem concert hall.',
    demandDrivers: [
      'Sports fans traveling for MLB Washington Nationals home series and D.C. United matches',
      'The Anthem concert attendees and waterfront leisure tourists seeking marina dining',
      'Department of Transportation (DOT) and Navy Yard military defense personnel'
    ],
    seasonalSurges: [
      { season: 'Baseball & Marina Season (April - September)', factor: '+35% ADR', note: '81 home baseball games, waterfront boat tours, outdoor music series' },
      { season: 'Summer Holidays (Memorial Day, July 4th)', factor: '+50% ADR', note: 'National Mall fireworks viewing and riverfront festivities' },
      { season: 'Off-Season Winter (December - February)', factor: '-30% ADR', note: 'Cold riverfront conditions; rely on DOT government contractors' }
    ],
    eventPricingTips: [
      'Nationals vs. NY Mets, Phillies, or Dodgers marquee home stands: Surge nightly rates by $100+.',
      'Fourth of July weekend: Set 3-night minimum with premium pricing targeting waterfront views.',
      'Winter strategy: Offer 14-day to 30-day corporate housing stays to Navy Yard contractors to offset cold months.'
    ]
  },
  {
    id: 'georgetown',
    name: 'Georgetown / Glover Park',
    ward: 'Ward 2',
    coordinates: { lat: 38.9072, lng: -77.0650 },
    typicalADR: 320,
    typicalOccupancy: 70,
    benchmarkLongTermRent: 3400,
    vibe: 'Colonial cobblestone streets, high-fashion M Street shopping, Georgetown University campus.',
    demandDrivers: [
      'Georgetown University parents, alumni, visiting faculty, and medical center specialists',
      'High-net-worth international shoppers and diplomatic VIPs seeking discreet privacy',
      'Luxury leisure travelers seeking historic charm without commercial high-rises'
    ],
    seasonalSurges: [
      { season: 'Commencement (May)', factor: '+75% to +100% ADR', note: 'Georgetown University graduation weekend creates citywide luxury lodging scarcity' },
      { season: 'Fall Move-in & Homecoming (Sept - Oct)', factor: '+45% ADR', note: 'Campus orientation, parents weekend, and autumn regattas' },
      { season: 'Mid-Summer (July - August)', factor: '-10% ADR', note: 'Student absence softened by high-end international shoppers' }
    ],
    eventPricingTips: [
      'Georgetown Commencement weekend: Book out 6–9 months in advance at $600–$800/night with a 4-night minimum.',
      'Furnish with authentic classic design and historic architectural highlights to justify premium $300+ ADR.',
      'Highlight off-street parking if available; parking in Georgetown commands an extra $40–$60/day perceived value.'
    ]
  },
  {
    id: 'foggy_bottom_west_end',
    name: 'Foggy Bottom / West End',
    ward: 'Ward 2',
    coordinates: { lat: 38.9000, lng: -77.0500 },
    typicalADR: 265,
    typicalOccupancy: 73,
    benchmarkLongTermRent: 2850,
    vibe: 'George Washington University, Kennedy Center for the Performing Arts, State Department, IMF.',
    demandDrivers: [
      'International Monetary Fund (IMF) and World Bank headquarters delegates and finance ministers',
      'U.S. Department of State visiting foreign dignitaries and foreign service officers',
      'Kennedy Center theater patrons and GW Hospital visiting medical professionals'
    ],
    seasonalSurges: [
      { season: 'IMF / World Bank Annual Meetings (October)', factor: '+100% ADR', note: 'Massive international summit; hotel rooms routinely sell out across the entire DMV region' },
      { season: 'IMF / World Bank Spring Meetings (April)', factor: '+70% ADR', note: 'Major influx of global central bankers and finance delegations' },
      { season: 'Winter (January)', factor: '-20% ADR', note: 'Lull between diplomatic fiscal quarters' }
    ],
    eventPricingTips: [
      'IMF/World Bank Spring and Annual meeting weeks: Quadruple standard rates or set fixed 5-night executive packages.',
      'Provide international power adapters, multiple workspace stations, and formal iron/garment steamer.',
      'Target long-term per-diem rates for incoming State Department transition staff.'
    ]
  },
  {
    id: 'howard_columbia_heights',
    name: 'Columbia Heights / Howard University / Petworth',
    ward: 'Ward 1 & Ward 4',
    coordinates: { lat: 38.9287, lng: -77.0326 },
    typicalADR: 195,
    typicalOccupancy: 69,
    benchmarkLongTermRent: 2300,
    vibe: 'Vibrant cultural enclave, historic rowhouses, 11th Street culinary corridor, Howard Homecoming.',
    demandDrivers: [
      'Howard University alumni, visiting professors, homecoming attendees, and hospital residents',
      'Budget-conscious leisure tourists seeking authentic DC neighborhood flavor with direct Green Line Metro access',
      'Traveling healthcare workers serving MedStar Washington Hospital Center and Children’s National'
    ],
    seasonalSurges: [
      { season: 'Howard Homecoming (October)', factor: '+65% ADR', note: 'One of D.C.’s biggest cultural alumni events of the year with huge housing demand' },
      { season: 'Spring Tourism (April - June)', factor: '+25% ADR', note: 'Cherry blossom overflow seeking high-value alternatives to downtown hotels' },
      { season: 'Winter (December - January)', factor: '-20% ADR', note: 'Seasonal lull; bridge with 30-day traveling nurse contracts' }
    ],
    eventPricingTips: [
      'Howard Homecoming week: Set minimum stay of 3 nights and raise ADR by 60–75%.',
      'Market English basement apartments directly to visiting medical residents with monthly discount tiers.',
      'Emphasize proximity to the Green/Yellow Line Metro stations (Columbia Heights, Georgia Ave-Petworth).'
    ]
  },
  {
    id: 'noma_h_street',
    name: 'NoMa / H Street Corridor / Union Market',
    ward: 'Ward 6 & Ward 5',
    coordinates: { lat: 38.9003, lng: -76.9950 },
    typicalADR: 215,
    typicalOccupancy: 70,
    benchmarkLongTermRent: 2450,
    vibe: 'Modern tech corridor, Union Market food hub, vibrant H Street streetcar nightlife, Gallaudet.',
    demandDrivers: [
      'Amtrak rail passengers arriving at Union Station seeking immediate walking transit',
      'Gallaudet University visitors, conferences, and ASL-accessible event attendees',
      'Tech workers, federal agency contractors (SEC, ATF, NPR), and foodie tourists exploring Union Market'
    ],
    seasonalSurges: [
      { season: 'H Street Festival (September)', factor: '+40% ADR', note: 'Massive single-day street festival drawing 150,000+ regional visitors' },
      { season: 'Spring Cherry Blossom Season (April)', factor: '+30% ADR', note: 'Spillover from Capitol Hill and downtown hotel shortages' },
      { season: 'Mid-Winter (January)', factor: '-25% ADR', note: 'Quiet period post-holidays' }
    ],
    eventPricingTips: [
      'H Street Festival weekend: Increase rates by 40% with a non-negotiable 2-night minimum.',
      'Union Station proximity: Attract quick 1-night rail commuters by offering self-check-in smart locks and luggage storage.',
      'Highlight proximity to Union Market culinary district for high-spending food and lifestyle travelers.'
    ]
  }
];

export const PRESET_SCENARIOS = [
  {
    name: 'Capitol Hill English Basement (Compliant)',
    description: 'Owner-occupied rowhome with legal English basement in-law suite rented unhosted under Vacation Rental rules.',
    neighborhoodId: 'capitol_hill',
    propertyType: 'english_basement' as const,
    isPrimaryResidence: true,
    hostingType: 'unhosted' as const,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 750,
    amenities: ['parking', 'washer_dryer', 'ac', 'wifi', 'patio'],
    hasHardshipExemption: false,
    hasCleanHandsCertificate: true,
    hasSmokeAndCoDetectors: true,
    hasFireExtinguisher: true,
    hasCertificateOfOccupancy: true,
    hoaBylawsPermitSTR: true,
    hasStrLiabilityInsurance: true,
    adr: 235,
    occupancy: 74,
    longTermRent: 2350
  },
  {
    name: 'Dupont Circle Primary Rowhome (Compliant with 90-day Cap)',
    description: 'Homeowner rents primary residence during travel (Vacation Rental endorsement subject to 90-day cap).',
    neighborhoodId: 'dupont_circle',
    propertyType: 'single_family' as const,
    isPrimaryResidence: true,
    hostingType: 'unhosted' as const,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 2100,
    amenities: ['parking', 'washer_dryer', 'ac', 'wifi', 'patio', 'pool'],
    hasHardshipExemption: false,
    hasCleanHandsCertificate: true,
    hasSmokeAndCoDetectors: true,
    hasFireExtinguisher: true,
    hasCertificateOfOccupancy: true,
    hoaBylawsPermitSTR: true,
    hasStrLiabilityInsurance: true,
    adr: 310,
    occupancy: 68,
    longTermRent: 3600
  },
  {
    name: 'Navy Yard Investor Condo (NON-COMPLIANT RED LIGHT)',
    description: 'Secondary investment condo purchased for rental income. Direct violation of D.C. Short-Term Rental primary residence mandate.',
    neighborhoodId: 'navy_yard_wharf',
    propertyType: 'secondary_investment' as const,
    isPrimaryResidence: false,
    hostingType: 'unhosted' as const,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 980,
    amenities: ['washer_dryer', 'ac', 'wifi', 'pool', 'parking'],
    hasHardshipExemption: false,
    hasCleanHandsCertificate: false,
    hasSmokeAndCoDetectors: true,
    hasFireExtinguisher: true,
    hasCertificateOfOccupancy: false,
    hoaBylawsPermitSTR: false,
    hasStrLiabilityInsurance: false,
    adr: 250,
    occupancy: 75,
    longTermRent: 2700
  },
  {
    name: 'Shaw Hosted Guest Suite (Compliant - No 90-Day Cap)',
    description: 'Homeowner rents a private bedroom suite while remaining in residence. Qualifies for Short-Term Rental endorsement with zero 90-day cap.',
    neighborhoodId: 'logan_circle_shaw',
    propertyType: 'hosted_room' as const,
    isPrimaryResidence: true,
    hostingType: 'hosted' as const,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 420,
    amenities: ['washer_dryer', 'ac', 'wifi'],
    hasHardshipExemption: false,
    hasCleanHandsCertificate: true,
    hasSmokeAndCoDetectors: true,
    hasFireExtinguisher: true,
    hasCertificateOfOccupancy: true,
    hoaBylawsPermitSTR: true,
    hasStrLiabilityInsurance: true,
    adr: 175,
    occupancy: 78,
    longTermRent: 1500
  }
];
