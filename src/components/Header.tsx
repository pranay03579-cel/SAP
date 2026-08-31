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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <ShieldAlert className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">SAP Sentinel</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Control Tower
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              Supply-Chain Resilience · Inclusive Workforce
            </p>
          </div>
        </div>

        {/* Live disruption pulse (compact, center) */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="font-semibold text-red-600 uppercase tracking-wide text-[10px]">
              {disruption?.severity ?? 'CRITICAL'} DISRUPTION
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span>{disruption?.location?.name ?? 'NH-27 Dima Hasao'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="font-mono">{disruption?.estimatedBlockedDurationHours ?? 84}h blocked</span>
          </div>
        </div>

        {/* Primary action */}
        <button
          onClick={onOpenApproval}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all flex-shrink-0 ${
            isApproved
              ? 'bg-green-50 text-green-700 border border-green-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isApproved ? 'Approved & Locked' : 'Review & Approve'}</span>
        </button>
      </div>
    </header>
  );
};
