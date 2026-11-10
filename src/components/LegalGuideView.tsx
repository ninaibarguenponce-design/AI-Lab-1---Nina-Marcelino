import React from 'react';
import { Scale, ShieldAlert, CheckCircle2, FileText, AlertTriangle, ExternalLink } from 'lucide-react';

export const LegalGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00C805]">
          <Scale className="w-4 h-4 text-[#00C805]" />
          D.C. Law & Business Licensing Guidelines
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          D.C. Short-Term Rental Rules Explained Simply
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Washington, D.C. passed strict short-term rental rules under the <strong>Short-Term Rental Regulation Act of 2018 (D.C. Law 22-307)</strong>. Here is everything homeowners need to know in plain English, administered by the <strong>D.C. Department of Licensing and Consumer Protection</strong>.
        </p>
      </div>

      {/* 4 Core Regulatory Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Primary Residence Mandate */}
        <div className="bg-[#121824] p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-950/60 text-red-400 rounded-xl border border-red-800/60">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              1. Strict Primary Residence Requirement
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Under D.C. law, a short-term rental may <strong>only</strong> be operated in the owner’s primary residence. A primary residence is where you live for at least <strong>183 days (6 months) per calendar year</strong> and claim the D.C. Homestead tax deduction.
          </p>
          <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 leading-relaxed">
            <strong className="text-white block font-bold">Investment Property Ban:</strong>
            Homes where the owner does not live, secondary vacation homes, and investor-owned properties are <strong>completely barred</strong> from Airbnb licenses in D.C. (Homeowners should lease them to 12-month tenants instead).
          </div>
        </div>

        {/* Pillar 2: Two License Endorsement Categories */}
        <div className="bg-[#121824] p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-950/60 text-blue-400 rounded-xl border border-blue-800/60">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              2. Two License Types & The 90-Day Cap
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The city issues two types of endorsements on your business license:
          </p>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-2">
            <li className="pl-3 border-l-2 border-[#00C805]">
              <strong className="text-white">Hosted Rental (Host Present):</strong> You stay home while guests rent a bedroom suite. <strong className="text-[#00C805]">No limit on booking nights (rent all 365 days a year).</strong>
            </li>
            <li className="pl-3 border-l-2 border-amber-500">
              <strong className="text-white">Vacation Rental (Unhosted):</strong> You are away traveling or guests have a private apartment (including an English basement). Strictly capped at <strong className="text-amber-300">90 nights per calendar year</strong>.
            </li>
          </ul>
        </div>

        {/* Pillar 3: English Basements & In-Law Suites */}
        <div className="bg-[#121824] p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-950/60 text-purple-400 rounded-xl border border-purple-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              3. English Basements & In-Law Suites
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            English basements and backyard carriage houses on your primary residence property are legally eligible under Vacation Rental rules:
          </p>
          <ul className="text-xs sm:text-sm text-slate-300 list-disc pl-4 space-y-1">
            <li>Must possess an active Certificate of Occupancy or Department of Buildings record.</li>
            <li>Ceiling heights must be at least 7 feet.</li>
            <li>Requires dedicated emergency exit doors and windows.</li>
            <li>Because guests have exclusive access, the 90-day annual cap applies unless granted an exemption.</li>
          </ul>
        </div>

        {/* Pillar 4: Taxes & Insurance Mandates */}
        <div className="bg-[#121824] p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-950/60 text-[#00C805] rounded-xl border border-emerald-800/60">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              4. 14.95% D.C. Lodging Tax & Host Insurance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Washington, D.C. charges a mandatory <strong>14.95% Lodging Tax</strong> on short-term rentals:
          </p>
          <ul className="text-xs sm:text-sm text-slate-300 list-disc pl-4 space-y-1">
            <li>Platforms like Airbnb and VRBO automatically collect and send the 14.95% tax to the D.C. Tax Office.</li>
            <li>Homeowners must have at least <strong>$500,000 in liability insurance</strong> covering guest hosting.</li>
            <li>In contrast, standard 12-month residential leases have <strong>0% lodging tax</strong>!</li>
          </ul>
        </div>
      </div>

      {/* Step-by-Step Licensing Checklist */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">
          Step-by-Step D.C. Licensing Roadmap
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 bg-[#00C805] text-black font-extrabold rounded-full flex items-center justify-center text-xs">1</span>
              <span>Clean Hands Certificate</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Log in to <strong>MyTax.DC.gov</strong> and generate a Clean Hands Certificate from the D.C. Tax Office showing zero overdue tickets or city taxes.
            </p>
          </div>

          <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 bg-[#00C805] text-black font-extrabold rounded-full flex items-center justify-center text-xs">2</span>
              <span>Life Safety Gear</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Place interconnected smoke detectors in every bedroom, carbon monoxide alarms on every level, and mount an approved fire extinguisher.
            </p>
          </div>

          <div className="p-4 bg-[#0B0E14] rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 bg-[#00C805] text-black font-extrabold rounded-full flex items-center justify-center text-xs">3</span>
              <span>City Business License</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Submit your Basic Business License application online with the D.C. Business Licensing Department ($283.80 fee covering 2 full years).
            </p>
          </div>
        </div>
      </div>

      {/* Enforcement & Penalty Notice */}
      <div className="p-6 bg-[#0B0E14] text-white rounded-3xl border border-amber-800/80 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>City Audit & Platform Matching Enforcement</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Under D.C. law, hosting platforms (Airbnb, VRBO) must share monthly booking data directly with the District government. Listing without a license or listing an investment property triggers civil fines of <strong>$1,000 for the first offense</strong>, <strong>$2,000 for the second</strong>, and <strong>$5,000 for subsequent offenses</strong>, plus platform removal.
        </p>
      </div>
    </div>
  );
};
