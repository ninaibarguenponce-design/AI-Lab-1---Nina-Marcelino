import React from 'react';
import {
  Building2,
  DollarSign,
  Shield,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { FinancialInputs, PropertyConfig, PropertyType, HostingType } from '../types';
import { DC_NEIGHBORHOODS, PRESET_SCENARIOS } from '../data/dcNeighborhoods';

interface PropertyFormProps {
  config: PropertyConfig;
  inputs: FinancialInputs;
  onUpdateConfig: (updated: Partial<PropertyConfig>) => void;
  onUpdateInputs: (updated: Partial<FinancialInputs>) => void;
  onApplyPreset: (presetIndex: number) => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  config,
  inputs,
  onUpdateConfig,
  onUpdateInputs,
  onApplyPreset,
}) => {
  const selectedNeighborhood = DC_NEIGHBORHOODS.find((n) => n.id === config.neighborhoodId) || DC_NEIGHBORHOODS[0];

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    const neighborhood = DC_NEIGHBORHOODS.find((n) => n.id === neighborhoodId);
    onUpdateConfig({ neighborhoodId });
    if (neighborhood) {
      // Auto-suggest market benchmarks for that neighborhood
      onUpdateInputs({
        averageDailyRate: neighborhood.typicalADR,
        occupancyRate: neighborhood.typicalOccupancy,
        longTermMonthlyRent: neighborhood.benchmarkLongTermRent,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick D.C. Presets
          </span>
          <span className="text-xs text-slate-400">
            Click to simulate standard D.C. housing profiles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onApplyPreset(idx)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                {preset.name}
              </div>
              <div className="text-slate-500 line-clamp-1 mt-0.5">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Legal Status & Residency */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. D.C. Residency & Legal Structure (DLCP Verification)
          </h3>
        </div>

        {/* Primary Residence Switch - CRITICAL LEGAL REQUIREMENT */}
        <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  Is this property your bona fide Primary Residence?
                </span>
                <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-mono">
                  D.C. Code § 30-201
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                The owner must reside in the property for at least <strong>183 days per calendar year</strong> and qualify for the D.C. Homestead Deduction. Investment properties are strictly prohibited.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onUpdateConfig({ isPrimaryResidence: true })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  config.isPrimaryResidence
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Yes (Primary Residence)
              </button>
              <button
                type="button"
                onClick={() => onUpdateConfig({ isPrimaryResidence: false })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  !config.isPrimaryResidence
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                No (Secondary / Investment)
              </button>
            </div>
          </div>

          {!config.isPrimaryResidence && (
            <div className="mt-3 p-3 bg-red-100/80 border border-red-300 rounded-md text-xs text-red-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>D.C. LEGAL BARRIER:</strong> Under D.C. Law 22-307, the Department of Licensing and Consumer Protection (DLCP) will NOT issue a Short-Term Rental license for secondary or investment properties. Attempting to list will subject you to automated data-matching audits and civil fines of $1,000–$5,000.
              </div>
            </div>
          )}
        </div>

        {/* Property Type and Hosting Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property Architecture / Dwelling Type
            </label>
            <select
              value={config.propertyType}
              onChange={(e) => onUpdateConfig({ propertyType: e.target.value as PropertyType })}
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="single_family">Single Family Home / Entire Rowhouse</option>
              <option value="english_basement">English Basement Apartment (Separate Entrance)</option>
              <option value="accessory_dwelling_unit">Accessory Dwelling Unit (ADU / Carriage House)</option>
              <option value="hosted_room">Private Bedroom Suite inside Primary Home</option>
              <option value="condo_coop">Condominium / Co-Op Apartment Unit</option>
              <option value="secondary_investment">Secondary Investment Property (Non-Resident)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {config.propertyType === 'english_basement' && 'English basements fall under Vacation Rental rules and require Certificate of Occupancy.'}
              {config.propertyType === 'condo_coop' && 'Condo boards frequently enforce 6-month or 12-month minimum lease bylaws.'}
              {config.propertyType === 'hosted_room' && 'Hosted rooms qualify for Short-Term Rental endorsement with NO 90-day annual cap.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hosting Mode (Presence during Stays)
            </label>
            <select
              value={config.hostingType}
              onChange={(e) => onUpdateConfig({ hostingType: e.target.value as HostingType })}
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="unhosted">Unhosted / Vacation Rental (Owner absent / 90-day cap)</option>
              <option value="hosted">Hosted (Owner present on premises / No 90-day cap)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {config.hostingType === 'unhosted'
                ? '⚠️ D.C. statutory cap applies: Maximum 90 nights/year for unhosted units.'
                : '✓ Exempt from 90-day cap: Can operate 365 days/year with owner on premises.'}
            </p>
          </div>
        </div>

        {/* Safety & Prerequisite Checklist */}
        <div className="pt-2">
          <span className="block text-xs font-semibold text-slate-700 mb-2">
            DLCP Mandatory Safety & Compliance Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasCleanHandsCertificate}
                onChange={(e) => onUpdateConfig({ hasCleanHandsCertificate: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-800">D.C. OTR Clean Hands Certificate (No fines &gt;$100)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasSmokeAndCoDetectors}
                onChange={(e) => onUpdateConfig({ hasSmokeAndCoDetectors: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-800">Smoke alarms in each bedroom & CO on each floor</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasFireExtinguisher}
                onChange={(e) => onUpdateConfig({ hasFireExtinguisher: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-800">Mounted 2A:10B:C Fire Extinguisher</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasCertificateOfOccupancy}
                onChange={(e) => onUpdateConfig({ hasCertificateOfOccupancy: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-800">Certificate of Occupancy (ADU / Basement)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasStrLiabilityInsurance}
                onChange={(e) => onUpdateConfig({ hasStrLiabilityInsurance: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-800">$500,000+ Commercial STR Liability Insurance</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hoaBylawsPermitSTR}
                onChange={(e) => onUpdateConfig({ hoaBylawsPermitSTR: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-800">HOA / Condo Bylaws Permit STRs (&lt;30 days)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: D.C. Neighborhood & Market Benchmarks */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            2. D.C. Neighborhood Selection & Market Baseline
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select D.C. Neighborhood / Ward
            </label>
            <select
              value={config.neighborhoodId}
              onChange={(e) => handleNeighborhoodChange(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {DC_NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.ward}) — Typ. ADR ${n.typicalADR} / Occ {n.typicalOccupancy}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property Label / Nickname
            </label>
            <input
              type="text"
              value={config.nickname}
              onChange={(e) => onUpdateConfig({ nickname: e.target.value })}
              placeholder="e.g. 4th St Rowhouse Basement"
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Neighborhood Quick Info Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>{selectedNeighborhood.name} Market Character</span>
            <span className="text-slate-500 font-normal">Ward: {selectedNeighborhood.ward}</span>
          </div>
          <p className="text-slate-600">{selectedNeighborhood.vibe}</p>
          <div className="flex items-center gap-4 text-slate-700 pt-1 font-mono">
            <span>Market ADR: <strong>${selectedNeighborhood.typicalADR}</strong></span>
            <span>Avg Occ: <strong>{selectedNeighborhood.typicalOccupancy}%</strong></span>
            <span>Benchmark 12-Mo Rent: <strong>${selectedNeighborhood.benchmarkLongTermRent}/mo</strong></span>
          </div>
        </div>
      </div>

      {/* Section 3: Financial Parameters (Airbnb STR) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <DollarSign className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            3. Short-Term Rental Operating & Financial Parameters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Average Daily Rate (ADR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="50"
                max="2000"
                step="5"
                value={inputs.averageDailyRate}
                onChange={(e) => onUpdateInputs({ averageDailyRate: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">Nightly rate before taxes</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Projected Occupancy Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={inputs.occupancyRate}
                onChange={(e) => onUpdateInputs({ occupancyRate: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
            </div>
            <span className="text-[11px] text-slate-400">
              ~{(30.4 * (inputs.occupancyRate / 100)).toFixed(1)} booked nights/mo
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Average Length of Stay (Nights)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              step="0.5"
              value={inputs.averageStayLength}
              onChange={(e) => onUpdateInputs({ averageStayLength: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <span className="text-[11px] text-slate-400">Drives turnover cleaning frequency</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cleaning Cost Paid to Cleaner ($/Stay)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="0"
                max="500"
                step="5"
                value={inputs.turnoverCleaningCost}
                onChange={(e) => onUpdateInputs({ turnoverCleaningCost: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">Typical D.C. turnover: $120–$180</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cleaning Fee Charged to Guest ($/Stay)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="0"
                max="500"
                step="5"
                value={inputs.cleaningFeeChargedToGuest}
                onChange={(e) => onUpdateInputs({ cleaningFeeChargedToGuest: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">Offset collected directly from guest</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              D.C. Transient Occupancy Tax
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="14.95%"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-600 cursor-not-allowed"
              />
            </div>
            <span className="text-[11px] text-slate-400">Fixed statutory rate (OTR mandate)</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Monthly Utility Overhead ($/mo)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="0"
                max="1000"
                step="10"
                value={inputs.monthlyUtilities}
                onChange={(e) => onUpdateInputs({ monthlyUtilities: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">Electric, gas, water, gigabit Wi-Fi</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Monthly Consumables & Wear ($/mo)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="0"
                max="600"
                step="10"
                value={inputs.monthlySuppliesAndWear}
                onChange={(e) => onUpdateInputs({ monthlySuppliesAndWear: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">Coffee, soaps, linens, repair buffer</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Monthly Insurance & BBL Fee ($/mo)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="0"
                max="500"
                step="5"
                value={inputs.monthlyInsuranceAndLicense}
                onChange={(e) => onUpdateInputs({ monthlyInsuranceAndLicense: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">$500k STR rider + DLCP biennial fee</span>
          </div>
        </div>
      </div>

      {/* Section 4: Long-Term Rental Baseline (The Alternative) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            4. Long-Term Lease Baseline (12-Month Tenant Alternative)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Estimated Monthly Market Rent
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="500"
                max="10000"
                step="50"
                value={inputs.longTermMonthlyRent}
                onChange={(e) => onUpdateInputs({ longTermMonthlyRent: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">12-month standard residential lease</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Property Management Fee (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="25"
                step="1"
                value={inputs.longTermPropertyManagementPercent}
                onChange={(e) => onUpdateInputs({ longTermPropertyManagementPercent: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
            </div>
            <span className="text-[11px] text-slate-400">0% if self-managed, 8–10% if managed</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Expected Annual Vacancy (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                step="1"
                value={inputs.longTermVacancyPercent}
                onChange={(e) => onUpdateInputs({ longTermVacancyPercent: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
            </div>
            <span className="text-[11px] text-slate-400">5% standard (~18 days/yr transition)</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Monthly Maintenance Reserve ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min="0"
                max="500"
                step="10"
                value={inputs.longTermMaintenanceReserve}
                onChange={(e) => onUpdateInputs({ longTermMaintenanceReserve: Number(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-[11px] text-slate-400">HVAC, appliance, plumbing buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
