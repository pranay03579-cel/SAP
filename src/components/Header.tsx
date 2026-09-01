import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface HeaderProps {
  currentCase: Case;
  onOpenApproval: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentCase, onOpenApproval }) => {
  const isApproved = currentCase.status === 'APPROVED';
  const disruption = currentCase.disruption;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight">SAP Sentinel</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Control Tower
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">
              Supply-Chain Resilience · Inclusive Workforce
            </p>
          </div>
        </div>

        {/* Disruption status indicator (compact, center) */}
        <div className="hidden md:flex items-center space-x-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
            <span className="font-semibold text-red-700 text-[11px]">
              {disruption?.severity ?? 'CRITICAL'} DISRUPTION
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{disruption?.location?.name ?? 'NH-27 Dima Hasao'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono">{disruption?.estimatedBlockedDurationHours ?? 84}h blocked</span>
          </div>
        </div>

        {/* Primary action */}
        <button
          onClick={onOpenApproval}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex-shrink-0 ${
            isApproved
              ? 'bg-green-50 text-green-700 border border-green-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isApproved ? 'Approved & Locked' : 'Review & Approve'}</span>
        </button>
      </div>
    </header>
  );
};
