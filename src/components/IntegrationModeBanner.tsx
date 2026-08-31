/**
 * IntegrationModeBanner
 *
 * Displays the current data integration mode prominently in the UI.
 * Ensures the operator always knows whether the system is running with
 * mock/simulated data or a live SAP system.
 *
 * This component reads from the orchestrator's resolved AppConfig — it never
 * reads environment variables directly. It renders differently depending on mode:
 *
 *  MOCK MODE   → amber warning bar (clearly simulated, no real SAP data)
 *  SAP LIVE    → green status bar  (connected to real SAP systems)
 *  AUTH ERROR  → red error bar     (SAP configured but credential failure)
 */

import React from 'react';

export interface IntegrationModeInfo {
  mode: string;
  modeLabel: string;
  modeDescription: string;
  sapIntegrationStatus: string;
}

interface IntegrationModeBannerProps {
  info: IntegrationModeInfo;
}

export const IntegrationModeBanner: React.FC<IntegrationModeBannerProps> = ({ info }) => {
  const isMock = info.mode === 'mock';

  return (
    <div
      role="status"
      aria-label={`Integration mode: ${info.modeLabel}`}
      className={`
        w-full px-4 py-1.5 flex items-center gap-3 text-[11px] font-mono
        border-b
        ${isMock
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-green-50 border-green-200 text-green-700'
        }
      `}
    >
      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span
          className={`
            animate-ping absolute inline-flex h-full w-full rounded-full opacity-60
            ${isMock ? 'bg-amber-400' : 'bg-green-400'}
          `}
        />
        <span
          className={`
            relative inline-flex rounded-full h-2 w-2
            ${isMock ? 'bg-amber-500' : 'bg-green-500'}
          `}
        />
      </span>

      {/* Mode label */}
      <span
        className={`
          font-bold tracking-widest uppercase px-2 py-0.5 rounded text-[10px]
          ${isMock
            ? 'bg-amber-100 text-amber-700 border border-amber-300'
            : 'bg-green-100 text-green-700 border border-green-300'
          }
        `}
      >
        {info.modeLabel}
      </span>

      {/* SAP Integration status */}
      <span className="opacity-80">
        SAP INTEGRATION:{' '}
        <span
          className={`font-semibold ${
            info.sapIntegrationStatus === 'NOT_CONFIGURED'
              ? 'text-amber-600'
              : 'text-green-600'
          }`}
        >
          {info.sapIntegrationStatus.replace(/_/g, ' ')}
        </span>
      </span>

      <span className="opacity-40 mx-1">|</span>

      {/* Short description */}
      <span className="opacity-60 truncate hidden sm:block">{info.modeDescription}</span>
    </div>
  );
};
