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
        w-full px-4 py-2 flex items-center gap-3 text-xs font-mono
        border-b
        ${isMock
          ? 'bg-amber-950/60 border-amber-700/50 text-amber-300'
          : 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
        }
      `}
    >
      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span
          className={`
            animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
            ${isMock ? 'bg-amber-400' : 'bg-emerald-400'}
          `}
        />
        <span
          className={`
            relative inline-flex rounded-full h-2 w-2
            ${isMock ? 'bg-amber-500' : 'bg-emerald-500'}
          `}
        />
      </span>

      {/* Mode label */}
      <span
        className={`
          font-bold tracking-widest uppercase px-2 py-0.5 rounded text-xs
          ${isMock
            ? 'bg-amber-500/20 text-amber-300 border border-amber-600/40'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/40'
          }
        `}
      >
        {info.modeLabel}
      </span>

      {/* SAP Integration status */}
      <span className="opacity-70">
        SAP INTEGRATION:{' '}
        <span
          className={`font-semibold ${
            info.sapIntegrationStatus === 'NOT_CONFIGURED'
              ? 'text-amber-400'
              : 'text-emerald-400'
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
