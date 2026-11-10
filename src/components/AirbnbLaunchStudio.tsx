import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Camera,
  Layers,
  Code2,
  Key,
  Globe,
  Database,
  Building2,
  Info,
  Calendar,
  FileText,
  UserCheck,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { ComplianceEvaluation, FinancialInputs, NeighborhoodData, PropertyConfig } from '../types';

interface AirbnbLaunchStudioProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  compliance: ComplianceEvaluation;
  neighborhood: NeighborhoodData;
  onNavigateToComps?: () => void;
  onSwitchToLongTerm?: () => void;
  onBackToEvaluator?: () => void;
  onBackToReport?: () => void;
  onStartAgain?: () => void;
}

export const AirbnbLaunchStudio: React.FC<AirbnbLaunchStudioProps> = ({
  config,
  inputs,
  compliance,
  neighborhood,
  onNavigateToComps,
  onSwitchToLongTerm,
  onBackToEvaluator,
  onBackToReport,
  onStartAgain,
}) => {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'api_integrations'>('onboarding');
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const isRedLight = compliance.status === 'RED';

  // Generate customized, high-converting listing title
  const generateTitle = () => {
    const hood = neighborhood.name.split('/')[0];
    const roomType =
      config.propertyType === 'english_basement'
        ? 'English Basement Suite'
        : config.propertyType === 'hosted_room'
        ? 'Private Bedroom Suite'
        : config.bedrooms === 0
        ? 'Sunlit Studio Loft'
        : `${config.bedrooms}-Bed Rowhome Retreat`;

    const perks: string[] = [];
    if (config.amenities.includes('parking')) perks.push('Free Dedicated Parking');
    if (config.amenities.includes('patio')) perks.push('Private Patio');
    if (config.amenities.includes('pool')) perks.push('Pool Access');
    if (config.amenities.includes('washer_dryer')) perks.push('W/D');

    const perkString = perks.slice(0, 2).join(' & ');
    return `${hood} ${roomType}${perkString ? ` w/ ${perkString}` : ' near Metro'}`;
  };

  // Generate customized listing description
  const generateDescription = () => {
    const hood = neighborhood.name;
    const bedText = config.bedrooms === 0 ? 'studio' : `${config.bedrooms}-bedroom`;
    const amenitiesText = config.amenities
      .map((a) => {
        if (a === 'parking') return 'dedicated off-street parking space';
        if (a === 'washer_dryer') return 'in-unit washer and dryer';
        if (a === 'patio') return 'private outdoor patio';
        if (a === 'pool') return 'swimming pool access';
        if (a === 'ac') return 'central air conditioning';
        if (a === 'wifi') return 'high-speed Wi-Fi';
        return a;
      })
      .join(', ');

    return `Welcome to your private Washington, D.C. getaway located in historic ${hood}!

This beautifully maintained ${bedText}, ${config.bathrooms}-bath space is designed for discerning travelers, visiting professionals, and vacationing families.

HIGHLIGHTS:
• Location: Walk to top local dining, Metro stations, and iconic D.C. landmarks.
• Key Amenities: Enjoy ${amenitiesText || 'central AC and high-speed Wi-Fi'}.
• Dedicated Workspace: Fast Wi-Fi and comfortable seating for remote work.
• Full Privacy & Self Check-in: Keyless keypad entry for seamless 24/7 arrival.

REGULATORY COMPLIANCE:
Fully registered with the D.C. Department of Licensing and Consumer Protection under official short-term rental license regulations. Smoke and carbon monoxide detectors installed on premises.`;
  };

  const listingTitle = generateTitle();
  const listingDescription = generateDescription();

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(listingTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyDesc = () => {
    navigator.clipboard.writeText(listingDescription);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        {(onBackToReport || onBackToEvaluator) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {onBackToReport && (
              <button
                type="button"
                onClick={onBackToReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00C805]/15 hover:bg-[#00C805]/25 text-[#00C805] text-xs font-bold transition-all border border-[#00C805]/30 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#00C805]" />
                <span>← Back to Step 4: Decision Report</span>
              </button>
            )}
            {onBackToEvaluator && (
              <button
                type="button"
                onClick={onBackToEvaluator}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-xs"
              >
                <span>← Back to Step 3: Verdict</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C805]/10 text-[#00C805] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Airbnb Onboarding & Launch Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Get Started on Airbnb with Legal Compliance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Step-by-step guidance to create your host account, generate listing copy, input your mandatory D.C. license number, and explore potential API integrations.
            </p>
          </div>

          {/* Sub-tab toggle */}
          <div className="flex items-center bg-[#0B0E14] p-1 rounded-full border border-slate-800 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === 'onboarding'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Host Onboarding Guide
            </button>
            <button
              onClick={() => setActiveTab('api_integrations')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === 'api_integrations'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Airbnb API Architecture
            </button>
          </div>
        </div>
      </div>

      {/* COMPLIANCE WARNING IF RED LIGHT */}
      {isRedLight && (
        <div className="p-6 bg-red-950/40 border border-red-800/80 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>CRITICAL COMPLIANCE NOTICE FOR THIS PROPERTY</span>
          </div>
          <p className="text-xs sm:text-sm text-red-200 leading-relaxed">
            Your property is marked as an investment property or non-primary residence. Washington, D.C. law strictly limits short-term rentals to the owner's primary home. Listing without an approved D.C. license risks city fines of $1,000 to $5,000.
          </p>
          {onSwitchToLongTerm && (
            <button
              type="button"
              onClick={onSwitchToLongTerm}
              className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-full transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>Switch to Safe D.C. Long-Term Rental Workflow</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 1: HOST ONBOARDING GUIDE */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          {/* Step 1: Sign in / Create Account */}
          <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#00C805] text-black font-black text-lg flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Sign In & Create Your Listing on Airbnb
                  </h2>
                  <a
                    href="https://www.airbnb.com/host/homes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00C805] hover:bg-[#00b004] text-black font-extrabold text-xs rounded-full transition-all shadow-md self-start sm:self-auto"
                  >
                    <span>Open Airbnb Host Onboarding</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Visit the official Airbnb Host portal. If you already have an Airbnb traveler account, sign in with the same credentials. Airbnb will guide you through setting your location ({neighborhood.name}) and room count ({config.bedrooms === 0 ? 'Studio' : `${config.bedrooms} Bedroom`}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 bg-[#0B0E14] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Identity Verification:</span>
                <p className="text-slate-200">
                  Have your driver’s license or passport ready. Airbnb verifies all hosts before publishing.
                </p>
              </div>
              <div className="p-3.5 bg-[#0B0E14] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Payout Method:</span>
                <p className="text-slate-200">
                  Link your checking account or routing number for direct deposit within 24 hours of guest check-in.
                </p>
              </div>
              <div className="p-3.5 bg-[#0B0E14] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">D.C. Tax Exemption:</span>
                <p className="text-slate-200">
                  Airbnb automatically collects and remits the 14.95% D.C. lodging tax for you!
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: D.C. License Input Field (Critical) */}
          <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black font-black text-lg flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1 flex-1">
                <h2 className="text-lg font-bold text-white">
                  Enter Your Mandatory D.C. License Number into Airbnb
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  D.C. law requires every Airbnb listing to display its D.C. Business License number on the public listing page. Airbnb provides a dedicated regulatory field.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#0B0E14] rounded-2xl border border-amber-500/30 space-y-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Where to paste in Airbnb:
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                Airbnb Host Dashboard → Select Listing → Listing Details → Regulations / Local Laws → "Registration / License Number"
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your <strong>Basic Business License (BBL)</strong> number here. If you are waiting on your final inspection, Airbnb allows you to enter "Pending" for a limited grace period while the city processes your application.
              </p>
            </div>
          </div>

          {/* Step 3: Ready-to-Copy Listing Title & Description */}
          <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white font-black text-lg flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Optimized Listing Title & Description
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    Ready to Copy
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We pre-generated a high-converting listing title and description customized for your home and key amenities.
                </p>
              </div>
            </div>

            {/* Title Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  Recommended Listing Title (Max 50 Characters)
                </label>
                <button
                  onClick={handleCopyTitle}
                  className="text-xs font-bold text-[#00C805] hover:underline flex items-center gap-1"
                >
                  {copiedTitle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTitle ? 'Copied to Clipboard!' : 'Copy Title'}</span>
                </button>
              </div>
              <div className="p-3.5 bg-[#0B0E14] rounded-xl border border-slate-800 font-bold text-sm text-white">
                {listingTitle}
              </div>
            </div>

            {/* Description Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  Listing Description
                </label>
                <button
                  onClick={handleCopyDesc}
                  className="text-xs font-bold text-[#00C805] hover:underline flex items-center gap-1"
                >
                  {copiedDesc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDesc ? 'Copied to Clipboard!' : 'Copy Description'}</span>
                </button>
              </div>
              <div className="p-4 bg-[#0B0E14] rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans max-h-56 overflow-y-auto">
                {listingDescription}
              </div>
            </div>
          </div>

          {/* Step 4: Photo & Readiness Checklist */}
          <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white font-black text-lg flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-1 flex-1">
                <h2 className="text-lg font-bold text-white">
                  Photography & In-Home Readiness Checklist
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Before publishing, complete these standard quality checks:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              {[
                { title: 'Take 20+ High-Resolution Photos', desc: 'Shoot during daytime in horizontal orientation. Highlight the dedicated parking spot if you have one!' },
                { title: 'Laminate Emergency Card on Exit Door', desc: 'D.C. law requires a 24/7 host emergency phone number and fire escape path on the inside of the door.' },
                { title: 'Set Up Keyless Self Check-In', desc: 'Install a smart lock keypad (Schlage, August, Yale) for contact-free 3:00 PM check-in.' },
                { title: 'Speed Test Your Wi-Fi', desc: 'Run a speed test inside the Airbnb app so the verified speed badge appears on your profile.' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-[#0B0E14] rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#00C805]" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom link to compare comps */}
            {onNavigateToComps && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onNavigateToComps}
                  className="text-xs font-bold text-[#00C805] hover:underline flex items-center gap-1"
                >
                  <span>Check Nearby D.C. Airbnb Competitor Rates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AIRBNB API INTEGRATIONS & ARCHITECTURE */}
      {activeTab === 'api_integrations' && (
        <div className="space-y-6">
          <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Code2 className="w-3.5 h-3.5" />
                <span>Airbnb Partner Platform API</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                How Airbnb API Integrations Work
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Airbnb provides an enterprise REST API and Webhook suite known as the <strong>Airbnb Partner Platform</strong> for Property Management Software (PMS), Channel Managers, and Smart Pricing engines.
              </p>
            </div>

            {/* 4 Core API Endpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Database className="w-4 h-4 text-[#00C805]" />
                  <span>Listings & Content API</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Programmatically creates and updates listing details, room configurations, photo galleries, amenity checkboxes, and local regulatory license numbers.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  PUT /v2/listings/&#123;id&#125;/permit_number
                </div>
              </div>

              <div className="p-5 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Pricing & Availability API</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Syncs dynamic calendar availability and nightly prices in real-time. Powers tools like PriceLabs, Wheelhouse, and Beyond to surge prices during cherry blossom festival dates.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  POST /v2/calendar_operations
                </div>
              </div>

              <div className="p-5 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Reservations & Messaging API</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Retrieves booking metadata, guest count, payout breakdowns, and sends automated arrival messages with smart lock door codes.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  GET /v2/reservations?status=accepted
                </div>
              </div>

              <div className="p-5 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Event Webhooks</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time push notifications sent when a guest books, cancels, or leaves a 5-star review, triggering cleaner scheduling automatically.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  Webhook: reservation.created
                </div>
              </div>
            </div>

            {/* How to Connect Without Enterprise Approval: iCal 2-Way Sync */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-[#0B0E14] to-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#00C805]" />
                <span>Zero-Code Integration for Homeowners: iCal Calendar Sync</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you are a solo homeowner and don't need enterprise software, Airbnb includes built-in <strong>iCal calendar sync</strong>. You can export your Airbnb calendar link into Google Calendar or VRBO to automatically prevent double-bookings with zero API keys or programming required!
              </p>
            </div>

            {/* Official Airbnb Developer Links */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Official Airbnb Developer Portal & Partner Requirements:
              </div>
              <a
                href="https://www.airbnb.com/partner"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-full border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>Visit Airbnb Partner Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* End of Flow: Start Again Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#121824] via-[#161F2E] to-[#121824] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C805]/10 text-[#00C805] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flow Completed · Step 5 of 5</span>
          </div>
          <h3 className="text-lg font-black text-white mt-1">
            Evaluate Another D.C. Property?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Clear all entered options and return to Step 1 to test another neighborhood, basement in-law suite, or condo.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-center flex-wrap">
          {onBackToReport && (
            <button
              type="button"
              onClick={onBackToReport}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-full border border-slate-700 transition-colors"
            >
              ← Back to Report
            </button>
          )}
          {onStartAgain && (
            <button
              type="button"
              onClick={onStartAgain}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-[#00C805] hover:from-emerald-400 hover:to-[#00b004] text-black font-black text-xs sm:text-sm rounded-full transition-all shadow-xl hover:shadow-[#00C805]/20 flex items-center justify-center gap-2 transform active:scale-98"
            >
              <RotateCcw className="w-4 h-4 stroke-3" />
              <span>Start Again (Clear All & Step 1)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
