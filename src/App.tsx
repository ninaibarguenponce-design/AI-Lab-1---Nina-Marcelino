import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header, AppTab } from './components/Header';
import { RobinhoodIntake } from './components/RobinhoodIntake';
import { RobinhoodVerdict } from './components/RobinhoodVerdict';
import { LongTermRentalWorkflow } from './components/LongTermRentalWorkflow';
import { AirbnbCompsExplorer } from './components/AirbnbCompsExplorer';
import { AirbnbLaunchStudio } from './components/AirbnbLaunchStudio';
import { ReportViewer } from './components/ReportViewer';
import { LegalGuideView } from './components/LegalGuideView';
import { AskAdvisorChat } from './components/AskAdvisorChat';
import { PricingCalendarView } from './components/PricingCalendarView';

import { FinancialInputs, PropertyConfig } from './types';
import { DC_NEIGHBORHOODS } from './data/dcNeighborhoods';
import { getMarketBenchmark } from './data/marketData';
import { calculateFinancials, evaluateCompliance } from './utils/calculator';
import { Check, Bookmark, Sparkles, Building2, Rocket } from 'lucide-react';

const STORAGE_KEY = 'dc_rental_advisor_home_v1';

const DEFAULT_CONFIG: PropertyConfig = {
  nickname: 'Capitol Hill English Basement',
  neighborhoodId: 'capitol_hill',
  propertyType: 'english_basement',
  isPrimaryResidence: true,
  isHomeDuringStay: true, // Default basements to owner home (no 90-night limit)
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
};

const DEFAULT_BENCHMARK = getMarketBenchmark('capitol_hill', 'english_basement', 1);

const DEFAULT_INPUTS: FinancialInputs = {
  averageDailyRate: DEFAULT_BENCHMARK.nightlyRate, // $219
  occupancyRate: Math.min(100, Math.round((DEFAULT_BENCHMARK.typicalNightsBooked / 365) * 100)),
  expectedNightsBooked: DEFAULT_BENCHMARK.typicalNightsBooked, // 156
  averageStayLength: 3.2,
  turnoverCleaningCost: 150,
  cleaningFeeChargedToGuest: 130,
  platformFeePercent: 3.0,
  monthlyUtilities: 240,
  monthlySuppliesAndWear: 120,
  monthlyInsuranceAndLicense: 85,
  longTermMonthlyRent: DEFAULT_BENCHMARK.benchmarkLongTermRent, // $2,650
  longTermPropertyManagementPercent: 0,
  longTermVacancyPercent: 5,
  longTermMaintenanceReserve: 100,
};

interface StoredHomeState {
  config: PropertyConfig;
  inputs: FinancialInputs;
  intakeCompleted: boolean;
  maxUnlockedStage: number;
  lastSaved: string;
}

export default function App() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [previousTab, setPreviousTab] = useState<AppTab>('home');
  const [intakeCompleted, setIntakeCompleted] = useState<boolean>(false);
  const [intakeStep, setIntakeStep] = useState<1 | 2 | 3>(1);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState<number>(1);
  const [nextStepsSubView, setNextStepsSubView] = useState<'recommended' | 'alternative'>('recommended');
  
  // Local storage save feedback
  const [hasSavedProfile, setHasSavedProfile] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Initialize Config & Inputs
  const [config, setConfig] = useState<PropertyConfig>(DEFAULT_CONFIG);
  const [inputs, setInputs] = useState<FinancialInputs>(DEFAULT_INPUTS);

  // FEATURE 1: Load saved home on initial mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: StoredHomeState = JSON.parse(raw);
        if (saved && saved.config && saved.inputs) {
          setConfig(saved.config);
          setInputs(saved.inputs);
          if (saved.intakeCompleted) {
            setIntakeCompleted(true);
            setActiveTab('verdict');
            setMaxUnlockedStage(Math.max(saved.maxUnlockedStage || 2, 2));
            setHasSavedProfile(true);
            setSaveNotification('Your saved home was restored from this device.');
            setTimeout(() => setSaveNotification(null), 4000);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved home profile from localStorage:', e);
    }
  }, []);

  // FEATURE 1: Persist updates to localStorage
  const persistState = useCallback(
    (cfg: PropertyConfig, inps: FinancialInputs, completed: boolean, unlocked: number) => {
      try {
        const stateToSave: StoredHomeState = {
          config: cfg,
          inputs: inps,
          intakeCompleted: completed,
          maxUnlockedStage: unlocked,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        setHasSavedProfile(true);
      } catch (e) {
        console.warn('Failed to persist home profile:', e);
      }
    },
    []
  );

  // Recalculate synchronously
  const compliance = useMemo(() => evaluateCompliance(config), [config]);
  const financials = useMemo(() => calculateFinancials(inputs, config), [inputs, config]);
  const currentNeighborhood = useMemo(
    () => DC_NEIGHBORHOODS.find((n) => n.id === config.neighborhoodId) || DC_NEIGHBORHOODS[0],
    [config.neighborhoodId]
  );

  const handleUpdateConfig = (updated: Partial<PropertyConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      persistState(next, inputs, intakeCompleted, maxUnlockedStage);
      return next;
    });
  };

  const handleUpdateInputs = (updated: Partial<FinancialInputs>) => {
    setInputs((prev) => {
      const next = { ...prev, ...updated };
      persistState(config, next, intakeCompleted, maxUnlockedStage);
      return next;
    });
  };

  // Intake completion handler
  const handleIntakeComplete = () => {
    setIntakeCompleted(true);
    const newUnlocked = Math.max(maxUnlockedStage, 2);
    setMaxUnlockedStage(newUnlocked);
    setActiveTab('verdict');
    persistState(config, inputs, true, newUnlocked);
    setSaveNotification('Home profile saved to this device.');
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // Navigation tab switcher with progress gate
  const handleSelectTab = (targetTab: AppTab) => {
    let targetStage = 1;
    if (targetTab === 'home') targetStage = 1;
    else if (targetTab === 'verdict' || targetTab === 'comps') targetStage = 2;
    else if (targetTab === 'report') targetStage = 3;
    else if (targetTab === 'next_steps' || targetTab === 'pricing_calendar' || targetTab === 'long_term_workflow') targetStage = 4;

    // Check if target is unlocked (auxiliary tabs like compliance_guide & consultation are always accessible)
    const isAuxiliary = targetTab === 'compliance_guide' || targetTab === 'consultation' || targetTab === 'pricing_calendar';
    if (!isAuxiliary && targetStage > maxUnlockedStage) {
      return; // Disallow jumping ahead
    }

    setPreviousTab(activeTab);
    setActiveTab(targetTab);
  };

  // FEATURE 1: "Start over" clears localStorage and resets state to fresh defaults
  const handleStartOver = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
    setConfig(DEFAULT_CONFIG);
    setInputs(DEFAULT_INPUTS);
    setIntakeStep(1);
    setIntakeCompleted(false);
    setMaxUnlockedStage(1);
    setActiveTab('home');
    setHasSavedProfile(false);
    setSaveNotification('Cleared saved profile. Starting fresh.');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // FEATURE 1: "Edit my home" returns to Step 3 of intake with all numbers intact
  const handleEditHome = () => {
    setIntakeStep(3);
    setActiveTab('home');
  };

  // Unified Back button logic: every Back returns to previous screen, never to the start
  const handleBackToPrevious = () => {
    if (activeTab === 'comps') {
      setActiveTab(previousTab === 'comps' ? 'verdict' : previousTab);
    } else if (activeTab === 'pricing_calendar') {
      setActiveTab(previousTab === 'pricing_calendar' ? 'verdict' : previousTab);
    } else if (activeTab === 'compliance_guide' || activeTab === 'consultation') {
      setActiveTab(previousTab || (intakeCompleted ? 'verdict' : 'home'));
    } else if (activeTab === 'next_steps') {
      setActiveTab('report');
    } else if (activeTab === 'report') {
      setActiveTab('verdict');
    } else if (activeTab === 'verdict') {
      setIntakeStep(3);
      setActiveTab('home');
    } else if (activeTab === 'home') {
      if (intakeStep > 1) {
        setIntakeStep((prev) => (prev - 1) as 1 | 2 | 3);
      }
    }
  };

  const canGoBack =
    activeTab !== 'home' || (activeTab === 'home' && intakeStep > 1);

  // Determine which workflow to feature in Next Steps based on unified recommendation
  const isAirbnbFlowRecommended =
    financials.recommendation === 'airbnb' || financials.isNearTie;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans selection:bg-[#00C805] selection:text-black">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Floating Save Notification Banner */}
      {saveNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162234] border border-[#00C805]/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Bookmark className="w-4 h-4 text-[#00C805]" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Header with 4 Progress Markers */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        intakeStep={intakeStep}
        intakeCompleted={intakeCompleted}
        maxUnlockedStage={maxUnlockedStage}
        canGoBack={canGoBack}
        onBackToPreviousStep={handleBackToPrevious}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STAGE 1: Your Home (Intake Wizard) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <RobinhoodIntake
              config={config}
              inputs={inputs}
              currentStep={intakeStep}
              onStepChange={setIntakeStep}
              onUpdateConfig={handleUpdateConfig}
              onUpdateInputs={handleUpdateInputs}
              onComplete={handleIntakeComplete}
            />
          </div>
        )}

        {/* STAGE 2: Your Answer (Deterministic Verdict) */}
        {activeTab === 'verdict' && (
          <div className="space-y-6">
            {/* Saved Profile Notice & Quick Actions */}
            {hasSavedProfile && (
              <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-[#00C805]" />
                  <span>
                    Saved profile:{' '}
                    <strong className="text-white">{config.nickname || 'My Home'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleEditHome}
                    className="text-slate-300 hover:text-white underline font-medium cursor-pointer"
                  >
                    Edit my home
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="text-slate-400 hover:text-red-400 font-medium cursor-pointer"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

            <RobinhoodVerdict
              financials={financials}
              inputs={inputs}
              config={config}
              compliance={compliance}
              neighborhood={currentNeighborhood}
              onOpenReport={() => {
                setMaxUnlockedStage((prev) => Math.max(prev, 3));
                setActiveTab('report');
              }}
              onRestart={handleStartOver}
              onEditHome={handleEditHome}
              onBackToPrevious={() => {
                setIntakeStep(3);
                setActiveTab('home');
              }}
              onNavigateToNextSteps={() => {
                setMaxUnlockedStage((prev) => Math.max(prev, 4));
                setActiveTab('next_steps');
              }}
              onOpenPricingCalendar={() => {
                setPreviousTab('verdict');
                setActiveTab('pricing_calendar');
              }}
            />
          </div>
        )}

        {/* STAGE 3: Full Report */}
        {activeTab === 'report' && (
          <ReportViewer
            config={config}
            inputs={inputs}
            financials={financials}
            compliance={compliance}
            neighborhood={currentNeighborhood}
            onBackToVerdict={() => setActiveTab('verdict')}
            onContinueToNextSteps={() => {
              setMaxUnlockedStage(4);
              setActiveTab('next_steps');
            }}
          />
        )}

        {/* STAGE 4: Next Steps (Action Plan) */}
        {activeTab === 'next_steps' && (
          <div className="space-y-6">
            {/* View Switcher: allows homeowner to see both paths */}
            <div className="max-w-5xl mx-auto flex items-center justify-between p-3 bg-[#121824] border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Viewing Next Steps for:</span>
                <span className="font-bold text-white">
                  {nextStepsSubView === 'recommended'
                    ? isAirbnbFlowRecommended
                      ? 'Airbnb Launch Plan (Recommended)'
                      : '12-Month Lease Plan (Recommended)'
                    : isAirbnbFlowRecommended
                    ? '12-Month Lease Plan (Alternative)'
                    : 'Airbnb Launch Plan (Alternative)'}
                </span>
              </div>

              {/* Toggle to view alternative */}
              {config.isPrimaryResidence && (
                <button
                  type="button"
                  onClick={() =>
                    setNextStepsSubView((prev) =>
                      prev === 'recommended' ? 'alternative' : 'recommended'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {nextStepsSubView === 'recommended'
                      ? isAirbnbFlowRecommended
                        ? 'View 12-Month Lease Guide'
                        : 'View Airbnb Launch Guide'
                      : 'Back to Recommended Plan'}
                  </span>
                </button>
              )}
            </div>

            {/* Render appropriate next steps workflow */}
            {(nextStepsSubView === 'recommended' ? isAirbnbFlowRecommended : !isAirbnbFlowRecommended) ? (
              <AirbnbLaunchStudio
                config={config}
                inputs={inputs}
                compliance={compliance}
                neighborhood={currentNeighborhood}
                onNavigateToComps={() => {
                  setPreviousTab('next_steps');
                  setActiveTab('comps');
                }}
                onSwitchToLongTerm={() => setNextStepsSubView('alternative')}
                onBackToEvaluator={() => setActiveTab('verdict')}
                onBackToReport={() => setActiveTab('report')}
                onStartAgain={handleStartOver}
                onOpenPricingCalendar={() => {
                  setPreviousTab('next_steps');
                  setActiveTab('pricing_calendar');
                }}
              />
            ) : (
              <LongTermRentalWorkflow
                config={config}
                inputs={inputs}
                neighborhood={currentNeighborhood}
                onUpdateInputs={handleUpdateInputs}
                onUpdateConfig={handleUpdateConfig}
                onBackToEvaluator={() => setActiveTab('verdict')}
                onBackToReport={() => setActiveTab('report')}
                onStartAgain={handleStartOver}
              />
            )}
          </div>
        )}

        {/* FEATURE 2: 12-Month Event Pricing Calendar, Best 90 Nights & Amenity Boosts */}
        {activeTab === 'pricing_calendar' && (
          <PricingCalendarView
            config={config}
            inputs={inputs}
            neighborhood={currentNeighborhood}
            onUpdateInputs={handleUpdateInputs}
            onBackToPrevious={handleBackToPrevious}
          />
        )}

        {/* AUXILIARY VIEW: Real Inside Airbnb Comps */}
        {activeTab === 'comps' && (
          <AirbnbCompsExplorer
            config={config}
            inputs={inputs}
            neighborhood={currentNeighborhood}
            onUpdateInputs={handleUpdateInputs}
            onNavigateToLaunch={() => setActiveTab('next_steps')}
            onBack={() => setActiveTab(previousTab === 'comps' ? 'verdict' : previousTab)}
          />
        )}

        {/* AUXILIARY VIEW: D.C. Law & Legal Guide */}
        {activeTab === 'compliance_guide' && <LegalGuideView />}

        {/* AUXILIARY VIEW: Ask Advisor Chat */}
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
            <span className="font-bold text-slate-300">D.C. Rental Advisor</span>
            <span>·</span>
            <span className="text-[#00C805]">Washington, D.C. Short-Term Rental Act</span>
          </div>
          <div>
            Objective Decision Support · Grounded in Inside Airbnb Data & D.C. Law
          </div>
        </div>
      </footer>
    </div>
  );
}
