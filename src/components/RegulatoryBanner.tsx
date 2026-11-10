import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Scale, ExternalLink } from 'lucide-react';
import { ComplianceEvaluation, PropertyConfig } from '../types';

interface RegulatoryBannerProps {
  compliance: ComplianceEvaluation;
  config: PropertyConfig;
  onOpenLegalGuide: () => void;
}

export const RegulatoryBanner: React.FC<RegulatoryBannerProps> = ({
  compliance,
  config,
  onOpenLegalGuide,
}) => {
  const getBannerStyles = () => {
    switch (compliance.status) {
      case 'RED':
        return {
          wrapper: 'bg-red-50 border-red-300 text-red-950',
          badge: 'bg-red-700 text-white',
          icon: <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />,
          titleColor: 'text-red-900',
        };
      case 'YELLOW':
        return {
          wrapper: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          titleColor: 'text-amber-900',
        };
      case 'GREEN':
      default:
        return {
          wrapper: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-700 text-white',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />,
          titleColor: 'text-emerald-900',
        };
    }
  };

  const style = getBannerStyles();

  return (
    <div className={`p-5 rounded-xl border ${style.wrapper} mb-6 transition-all shadow-xs`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/10">
        <div className="flex items-center gap-3">
          {style.icon}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${style.badge}`}>
                {compliance.statusLabel}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                DLCP Classification: <strong className="text-slate-900">{compliance.dlcpLicenseType}</strong>
              </span>
            </div>
            <h2 className={`text-base font-bold mt-1 ${style.titleColor}`}>
              D.C. Short-Term Rental Regulation Act (D.C. Law 22-307)
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenLegalGuide}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 underline underline-offset-2 shrink-0 self-start sm:self-auto"
        >
          <Scale className="w-3.5 h-3.5" />
          Review DLCP Statutory Rules
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="mt-3 text-xs sm:text-sm space-y-2">
        {compliance.status === 'RED' && (
          <div className="space-y-1.5">
            <p className="font-semibold text-red-900">
              Immediate High Risk Penalties Detected:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-red-800">
              {compliance.primaryBlockers.map((blocker, idx) => (
                <li key={idx} className="leading-relaxed">
                  {blocker}
                </li>
              ))}
            </ul>
            <p className="text-xs text-red-700 pt-1">
              <strong>Enforcement Note:</strong> Operating an unpermitted STR in D.C. triggers fines starting at $1,000 for the first offense up to $5,000, plus platform revocation.
            </p>
          </div>
        )}

        {compliance.status === 'YELLOW' && (
          <div className="space-y-1.5">
            <p className="font-semibold text-amber-900">
              Compliant with Conditions — Mandatory Prerequisites Before Listing:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              {compliance.mandatoryConditions.map((cond, idx) => (
                <li key={idx} className="leading-relaxed">
                  {cond}
                </li>
              ))}
            </ul>
          </div>
        )}

        {compliance.status === 'GREEN' && (
          <div className="space-y-1 text-emerald-900">
            <p className="leading-relaxed">
              Your property structure meets primary residence mandates under D.C. Code § 30-201 and satisfies all baseline life safety hardware requirements.
            </p>
            {config.hostingType === 'unhosted' ? (
              <p className="text-xs text-emerald-800 font-medium">
                ⚠️ Notice: As an unhosted Vacation Rental endorsement, D.C. law strictly caps bookings at <strong>90 cumulative days per calendar year</strong>.
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-medium">
                ✓ Full Short-Term Rental endorsement: Because host is present during stays, this property is <strong>exempt from the 90-day annual cap</strong>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
