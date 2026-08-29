/**
 * SAP Sentinel — Mock Transport Capacity Provider
 *
 * Provides simulated alternative transport options for the Recovery
 * Adaptation Agent when the primary NH-27 road corridor is blocked.
 *
 * Future SAP integration point:
 *   Replace with SapTransportProvider implementing the same interface, backed by:
 *     - SAP Logistics Business Network (LBN) Freight Collaboration API
 *     - SAP Transportation Management (TM) via OData v4 or REST
 *   Authentication via SAP BTP Destination Service (OAuth2 Client Credentials).
 *
 * DATA NOTE: Transport slot IDs, cost figures, and availability are all
 * simulated for demonstration purposes. No real transport systems are queried.
 */

import { ITransportCapacityProvider, RawTransportCapacity } from '../interfaces.js';

const MOCK_TRANSPORT_OPTIONS: RawTransportCapacity[] = [
  {
    modalityId: 'MOCK-TRN-AIR-GAU-IXS-01',
    modality: 'AIR_CHARTER',
    routeName: 'Borjhar (GAU) → Kumbhirgram (IXS) Air Charter [MOCK]',
    routePath: ['Borjhar Airport (Guwahati)', 'Kumbhirgram Airport (Silchar)'],
    availableNow: true,
    availableSlots: 2,
    leadTimeHours: 8,
    costPerTonneInr: 385000,
    coldChainCapable: true,
    capacityConstraints: ['Max 12 tonnes per flight', 'Daylight operations only'],
  },
  {
    modalityId: 'MOCK-TRN-RAIL-LMD-BPB-01',
    modality: 'RAIL_FREIGHT',
    routeName: 'Lumding – Badarpur BG Hill Section (Indian Railways) [MOCK]',
    routePath: ['Guwahati Goods Yard', 'Lumding Rail Junction', 'Badarpur Railhead', 'Silchar FCI Depot'],
    availableNow: true,
    availableSlots: 4,
    leadTimeHours: 14,
    costPerTonneInr: 12300,
    coldChainCapable: false,
    capacityConstraints: ['Priority booking required', 'Gradient speed restrictions (hill section)'],
  },
  {
    modalityId: 'MOCK-TRN-ROAD-NH06-DETOUR-01',
    modality: 'FEEDER_ROAD',
    routeName: 'NH-06 Meghalaya Hill Feeder Bypass (Shillong–Jowai–Ratacherra) [MOCK]',
    routePath: ['Guwahati', 'Shillong Bypass', 'Jowai', 'Ratacherra', 'Silchar'],
    availableNow: false,
    availableSlots: 0,
    leadTimeHours: 36,
    costPerTonneInr: 9100,
    coldChainCapable: false,
    capacityConstraints: [
      'Corridor clearance unconfirmed',
      'No cold-chain battery recharge stations on NH-06',
      'Single-lane mountain passes — high driver fatigue risk',
    ],
  },
];

export class MockTransportCapacityProvider implements ITransportCapacityProvider {
  async getAvailableTransportOptions(
    _originPlantId: string,
    _destinationPlantIds: string[]
  ): Promise<RawTransportCapacity[]> {
    return MOCK_TRANSPORT_OPTIONS;
  }
}
