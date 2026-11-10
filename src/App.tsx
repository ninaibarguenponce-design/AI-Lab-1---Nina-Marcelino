import React, { useState, useMemo } from 'react';
import { Header, AppTab } from './components/Header';
import { RobinhoodIntake } from './components/RobinhoodIntake';
import { RobinhoodVerdict } from './components/RobinhoodVerdict';
import { LongTermRentalWorkflow } from './components/LongTermRentalWorkflow';
import { AirbnbCompsExplorer } from './components/AirbnbCompsExplorer';
import { AirbnbLaunchStudio } from './components/AirbnbLaunchStudio';
import { PropertyForm } from './components/PropertyForm';
import { ReportViewer } from './components/ReportViewer';
import { SensitivityMatrix } from './components/SensitivityMatrix';
import { LegalGuideView } from './components/LegalGuideView';
import { AskAdvisorChat } from './components/AskAdvisorChat';
import { NeighborhoodStrategyView } from './components/NeighborhoodStrategyView';

import { FinancialInputs, PropertyConfig } from './types';
import { DC_NEIGHBORHOODS, PRESET_SCENARIOS } from './data/dcNeighborhoods';
import { calculateFinancials, evaluateCompliance } from './utils/calculator';
import { X, Sliders, ChevronDown, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('evaluator');

  // Fast intake completion state: false starts user directly in pizza-speed wizard
  const [intakeCompleted, setIntakeCompleted] = useState<boolean>(false);
  const [intakeStep, setIntakeStep] = useState<1 | 2 | 3 | 4>(1);
  const [showAdvancedTweaks, setShowAdvancedTweaks] = useState<boolean>(false);

  // Initial State: Default to Capitol Hill 1-bedroom
  const [config, setConfig] = useState<PropertyConfig>({
    nickname: 'Capitol Hill English Basement',
    neighborhoodId: 'capitol_hill',
    propertyType: 'english_basement',
    isPrimaryResidence: true,
    hostingType: 'unhosted',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 750,
    amenities: ['parking', 'washer_dryer', 'ac', 'wifi'],
    hasHardshipExemption: false,
    hasCleanHandsCertificate: true,
    hasSmokeAndCoDetectors: true,
    hasFireExtinguisher: true,
    hasCertificateOfOccupancy: true,
    hoaBylawsPermitSTR: true,
    hasStrLiabilityInsurance: true,
  });

  const [inputs, setInputs] = useState<FinancialInputs>({
    averageDailyRate: 245,
    occupancyRate: 70,
    averageStayLength: 3.2,
    turnoverCleaningCost: 150,
    cleaningFeeChargedToGuest: 130,
    platformFeePercent: 3.0,
    dcTransientTaxPercent: 14.95,
    monthlyUtilities: 240,
    monthlySuppliesAndWear: 120,
    monthlyInsuranceAndLicense: 85,
    longTermMonthlyRent: 2650,
    longTermPropertyManagementPercent: 0,
    longTermVacancyPercent: 5,
    longTermMaintenanceReserve: 100,
  });

  // Calculate compliance & financials synchronously
  const compliance = useMemo(() => evaluateCompliance(config), [config]);
  const financials = useMemo(() => calculateFinancials(inputs, config), [inputs, config]);
  const currentNeighborhood = useMemo(
    () => DC_NEIGHBORHOODS.find((n) => n.id === config.neighborhoodId) || DC_NEIGHBORHOODS[0],
    [config.neighborhoodId]
  );

  const handleUpdateConfig = (updated: Partial<PropertyConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateInputs = (updated: Partial<FinancialInputs>) => {
    setInputs((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyPreset = (index: number) => {
    const preset = PRESET_SCENARIOS[index];
    if (!preset) return;

    setConfig({
      nickname: preset.name,
      neighborhoodId: preset.neighborhoodId,
      propertyType: preset.propertyType,
      isPrimaryResidence: preset.isPrimaryResidence,
      hostingType: preset.hostingType,
      bedrooms: preset.bedrooms ?? 1,
      bathrooms: preset.bathrooms ?? 1,
      squareFeet: preset.squareFeet ?? 750,
      amenities: preset.amenities ?? ['parking', 'washer_dryer', 'ac', 'wifi'],
      hasHardshipExemption: preset.hasHardshipExemption,
      hasCleanHandsCertificate: preset.hasCleanHandsCertificate,
      hasSmokeAndCoDetectors: preset.hasSmokeAndCoDetectors,
      hasFireExtinguisher: preset.hasFireExtinguisher,
      hasCertificateOfOccupancy: preset.hasCertificateOfOccupancy,
      hoaBylawsPermitSTR: preset.hoaBylawsPermitSTR,
      hasStrLiabilityInsurance: preset.hasStrLiabilityInsurance,
    });

    setInputs((prev) => ({
      ...prev,
      averageDailyRate: preset.adr,
      occupancyRate: preset.occupancy,
      longTermMonthlyRent: preset.longTermRent,
    }));
  };

  // Direct return to Step 4 of the intake wizard (preserves all inputs)
  const handleBackToStep4 = () => {
    setActiveTab('evaluator');
    setIntakeCompleted(false);
    setIntakeStep(4);
  };

  // Global header back action
  const handleHeaderBack = () => {
    if (activeTab === 'comps') {
      if (intakeCompleted) {
        setActiveTab('evaluator');
      } else {
        handleBackToStep4();
      }
    } else if (
      activeTab === 'report' ||
      activeTab === 'launch' ||
      activeTab === 'long_term_workflow' ||
      activeTab === 'sensitivity' ||
      activeTab === 'compliance_guide' ||
      activeTab === 'consultation'
    ) {
      setActiveTab('evaluator');
    } else if (activeTab === 'evaluator') {
      if (intakeCompleted) {
        // From verdict back to Step 4 financials
        setIntakeCompleted(false);
        setIntakeStep(4);
      } else if (intakeStep > 1) {
        setIntakeStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const canGoBack = activeTab !== 'evaluator' || intakeCompleted || intakeStep > 1;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans selection:bg-[#00C805] selection:text-black">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        onGenerateReport={() => setActiveTab('report')}
        intakeStep={intakeStep}
        intakeCompleted={intakeCompleted}
        canGoBack={canGoBack}
        onBackToPreviousStep={handleHeaderBack}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Evaluator Workspace */}
        {activeTab === 'evaluator' && (
          <div className="space-y-8">
            {!intakeCompleted ? (
              /* Robinhood Fast Intake Wizard */
              <RobinhoodIntake
                config={config}
                inputs={inputs}
                currentStep={intakeStep}
                onStepChange={setIntakeStep}
                onUpdateConfig={handleUpdateConfig}
                onUpdateInputs={handleUpdateInputs}
                onComplete={() => setIntakeCompleted(true)}
                onLaunchLongTermWorkflow={() => setActiveTab('long_term_workflow')}
                onOpenComps={() => setActiveTab('comps')}
              />
            ) : (
              /* Robinhood High-Impact Verdict View */
              <div className="space-y-6">
                <RobinhoodVerdict
                  financials={financials}
                  inputs={inputs}
                  config={config}
                  compliance={compliance}
                  neighborhood={currentNeighborhood}
                  onOpenReport={() => setActiveTab('report')}
                  onOpenTweakModal={() => setShowAdvancedTweaks(!showAdvancedTweaks)}
                  onRestart={() => setIntakeCompleted(false)}
                  onOpenLongTermWorkflow={() => setActiveTab('long_term_workflow')}
                  onNavigateToComps={() => setActiveTab('comps')}
                  onNavigateToLaunch={() => setActiveTab('launch')}
                />

                {/* Advanced Parameter Tuning Drawer */}
                {showAdvancedTweaks && (
                  <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-w-3xl mx-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#00C805]" />
                        <h3 className="text-base font-bold text-white">
                          Fine-Tune Financial & Operating Numbers
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAdvancedTweaks(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">Nightly Airbnb Rate ($/night)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={inputs.averageDailyRate}
                            onChange={(e) => handleUpdateInputs({ averageDailyRate: Number(e.target.value) || 0 })}
                            className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">Estimated Occupancy (%)</label>
                        <input
                          type="number"
                          value={inputs.occupancyRate}
                          onChange={(e) => handleUpdateInputs({ occupancyRate: Number(e.target.value) || 0 })}
                          className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">Cleaning Cost per Stay ($)</label>
                        <input
                          type="number"
                          value={inputs.turnoverCleaningCost}
                          onChange={(e) => handleUpdateInputs({ turnoverCleaningCost: Number(e.target.value) || 0 })}
                          className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">Monthly Utilities ($)</label>
                        <input
                          type="number"
                          value={inputs.monthlyUtilities}
                          onChange={(e) => handleUpdateInputs({ monthlyUtilities: Number(e.target.value) || 0 })}
                          className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">12-Month Tenant Rent ($/month)</label>
                        <input
                          type="number"
                          value={inputs.longTermMonthlyRent}
                          onChange={(e) => handleUpdateInputs({ longTermMonthlyRent: Number(e.target.value) || 0 })}
                          className="w-full bg-[#0B0E14] border border-slate-700 text-white rounded-xl px-3 py-2 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">D.C. Lodging Tax</label>
                        <input
                          type="text"
                          disabled
                          value="14.95% (Collected for D.C. Tax Office)"
                          className="w-full bg-[#0B0E14] border border-slate-800 text-slate-400 rounded-xl px-3 py-2 font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setShowAdvancedTweaks(false)}
                        className="px-6 py-2.5 bg-[#00C805] text-black font-extrabold text-xs rounded-full hover:bg-[#00b004] transition-colors"
                      >
                        Apply & Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Decision Report (Strict 4-Part Mandate) */}
        {activeTab === 'report' && (
          <ReportViewer
            config={config}
            inputs={inputs}
            financials={financials}
            compliance={compliance}
            neighborhood={currentNeighborhood}
            onBackToVerdict={() => setActiveTab('evaluator')}
          />
        )}

        {/* Tab: Live Airbnb Comps & Competition Radar */}
        {activeTab === 'comps' && (
          <AirbnbCompsExplorer
            config={config}
            inputs={inputs}
            neighborhood={currentNeighborhood}
            onUpdateInputs={handleUpdateInputs}
            onNavigateToLaunch={() => setActiveTab('launch')}
            onBackToStep4={handleBackToStep4}
          />
        )}

        {/* Tab: Airbnb Host Onboarding & Launch Studio */}
        {activeTab === 'launch' && (
          <AirbnbLaunchStudio
            config={config}
            inputs={inputs}
            compliance={compliance}
            neighborhood={currentNeighborhood}
            onNavigateToComps={() => setActiveTab('comps')}
            onSwitchToLongTerm={() => setActiveTab('long_term_workflow')}
            onBackToEvaluator={() => setActiveTab('evaluator')}
          />
        )}

        {/* Tab: Dedicated Long-Term Rental Workflow */}
        {activeTab === 'long_term_workflow' && (
          <LongTermRentalWorkflow
            config={config}
            inputs={inputs}
            neighborhood={currentNeighborhood}
            onUpdateInputs={handleUpdateInputs}
            onUpdateConfig={handleUpdateConfig}
            onBackToEvaluator={() => setActiveTab('evaluator')}
          />
        )}

        {/* Tab 3: Sensitivity Matrix */}
        {activeTab === 'sensitivity' && (
          <div className="space-y-8">
            <SensitivityMatrix
              inputs={inputs}
              config={config}
              currentOutputs={financials}
            />
            <NeighborhoodStrategyView
              selectedId={config.neighborhoodId}
              onSelectNeighborhood={(id) => handleUpdateConfig({ neighborhoodId: id })}
            />
          </div>
        )}

        {/* Tab 4: Legal Guide (D.C. Short-Term Rental Act) */}
        {activeTab === 'compliance_guide' && <LegalGuideView />}

        {/* Tab 5: Consultation Chat (Gemini 3.8 Flash) */}
        {activeTab === 'consultation' && (
          <AskAdvisorChat
            config={config}
            financials={financials}
            neighborhood={currentNeighborhood}
          />
        )}
      </main>

      {/* Clean, quiet footer */}
      <footer className="bg-[#0B0E14] border-t border-slate-800 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">D.C. Rental Viability & Compliance Advisor</span>
            <span>·</span>
            <span className="text-[#00C805]">D.C. Business Licensing Law 22-307</span>
          </div>
          <div>
            Built for Washington, D.C. Homeowners · Objective Decision Support
          </div>
        </div>
      </footer>
    </div>
  );
}
