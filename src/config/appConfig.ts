/**
 * SAP Sentinel — Application Configuration & Mode Management
 *
 * Reads APP_MODE from the environment (or defaults to 'mock').
 * 
 * IMPORTANT:
 *  - This is the ONLY place that reads environment/config.
 *  - No agent or provider reads APP_MODE directly.
 *  - All consumers receive a resolved AppConfig object.
 *
 * Future SAP integration: Add SAP_* variables here only after
 * official credentials and API documentation are available.
 * Never silently fall back from SAP mode to mock mode.
 */

export type AppMode = 'mock';
// Future modes (not yet implemented — requires official SAP credentials):
// | 'sap-live'

export interface AppConfig {
  mode: AppMode;
  version: string;
  buildTime: string;

  // Display labels shown in Admin UI
  modeLabel: string;
  modeDescription: string;
  sapIntegrationStatus: 'NOT_CONFIGURED';
  // Future: 'CONFIGURED' | 'PARTIALLY_CONFIGURED' | 'AUTH_ERROR'
}

function resolveModeLabel(mode: AppMode): { modeLabel: string; modeDescription: string } {
  switch (mode) {
    case 'mock':
      return {
        modeLabel: 'MOCK MODE',
        modeDescription:
          'Running with deterministic mock providers. No live SAP systems are connected. ' +
          'All data represents a simulated NE India logistics disruption scenario.',
      };
  }
}

function resolveAppMode(): AppMode {
  // Vite exposes import.meta.env in browser. Node uses process.env.
  const raw =
    typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { APP_MODE?: string } })?.env
      ? ((import.meta as unknown as { env?: { APP_MODE?: string } }).env?.APP_MODE ?? 'mock')
      : (typeof process !== 'undefined' ? (process.env['APP_MODE'] ?? 'mock') : 'mock');

  if (raw === 'mock') return 'mock';

  // Any unknown value defaults to mock with a clear console warning (development only)
  console.warn(
    `[SAP Sentinel Config] APP_MODE="${raw}" is not a supported mode. ` +
    `Defaulting to "mock". Supported modes: mock`
  );
  return 'mock';
}

const mode = resolveAppMode();
const { modeLabel, modeDescription } = resolveModeLabel(mode);

export const APP_CONFIG: AppConfig = {
  mode,
  version: '1.0.0',
  buildTime: new Date().toISOString().slice(0, 10),
  modeLabel,
  modeDescription,
  sapIntegrationStatus: 'NOT_CONFIGURED',
};
