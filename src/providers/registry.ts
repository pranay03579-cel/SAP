/**
 * SAP Sentinel — Provider Registry
 *
 * Central registry that resolves the correct provider implementation
 * based on APP_MODE from AppConfig.
 *
 * HOW TO ADD A REAL SAP PROVIDER (when credentials become available):
 * ─────────────────────────────────────────────────────────────────────
 * 1. Create a new file: src/providers/sap/sapS4HanaSupplyChainProvider.ts
 *    Implement the ISupplyChainDataProvider interface.
 *
 * 2. Add 'sap-live' to AppMode in src/config/appConfig.ts
 *    and handle it in resolveAppMode().
 *
 * 3. In the registry below, add a case for 'sap-live' returning
 *    the real SAP provider instances.
 *
 * 4. No agent code changes needed. Only this registry changes.
 *
 * IMPORTANT: The registry MUST NOT silently fall back to mock when
 * mode is 'sap-live'. Throw an explicit ConfigurationError if any
 * required SAP credential is missing.
 */

import { APP_CONFIG, AppMode } from '../config/appConfig.js';
import {
  IDisruptionDataProvider,
  ISupplyChainDataProvider,
  IWorkforceDataProvider,
  ITransportCapacityProvider,
} from './interfaces.js';
import { MockDisruptionProvider } from './mock/mockDisruptionProvider.js';
import { MockSupplyChainProvider } from './mock/mockSupplyChainProvider.js';
import { MockWorkforceProvider } from './mock/mockWorkforceProvider.js';
import { MockTransportCapacityProvider } from './mock/mockTransportProvider.js';

export interface ProviderRegistry {
  disruption: IDisruptionDataProvider;
  supplyChain: ISupplyChainDataProvider;
  workforce: IWorkforceDataProvider;
  transport: ITransportCapacityProvider;
}

function buildRegistry(mode: AppMode): ProviderRegistry {
  switch (mode) {
    case 'mock':
      return {
        disruption: new MockDisruptionProvider(),
        supplyChain: new MockSupplyChainProvider(),
        workforce: new MockWorkforceProvider(),
        transport: new MockTransportCapacityProvider(),
      };

    // Future SAP-live case — DO NOT implement until official credentials available:
    // case 'sap-live':
    //   validateSapCredentials();  // throws ConfigurationError if any variable missing
    //   return {
    //     disruption: new SapEventMeshDisruptionProvider(sapEventMeshConfig),
    //     supplyChain: new SapS4HanaSupplyChainProvider(sapBtpDestinationConfig),
    //     workforce: new SapSuccessFactorsWorkforceProvider(sapSuccessFactorsConfig),
    //     transport: new SapLbnTransportProvider(sapLbnConfig),
    //   };
  }
}

export const providerRegistry: ProviderRegistry = buildRegistry(APP_CONFIG.mode);
