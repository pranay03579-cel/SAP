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
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-green-50 border-green-200 text-green-800'
        }
      `}
    >
      {/* Solid indicator dot */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isMock ? 'bg-amber-600' : 'bg-green-600'
        }`}
      />

      {/* Mode label */}
      <span
        className={`
          font-bold tracking-wider uppercase px-1.5 py-0.5 rounded text-[10px]
          ${isMock
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-green-100 text-green-800 border border-green-300'
          }
        `}
      >
        {info.modeLabel}
      </span>

      {/* SAP Integration status */}
      <span className="text-slate-600">
        SAP INTEGRATION:{' '}
        <span
          className={`font-semibold ${
            info.sapIntegrationStatus === 'NOT_CONFIGURED'
              ? 'text-amber-700'
              : 'text-green-700'
          }`}
        >
          {info.sapIntegrationStatus.replace(/_/g, ' ')}
        </span>
      </span>

      <span className="text-slate-300 mx-1">|</span>

      {/* Short description */}
      <span className="text-slate-500 truncate hidden sm:block">{info.modeDescription}</span>
    </div>
  );
};
