/**
 * SAP Sentinel — Mock Disruption Data Provider
 *
 * Scenario: Landslide & Flash-Flood on NH-27 (Guwahati-Silchar Corridor),
 * North Eastern India. Monsoon season disruption severing the arterial lifeline
 * to Barak Valley hospitals and food depots.
 *
 * This provider is the ONLY implementation of IDisruptionDataProvider currently.
 * A future SapDisruptionProvider will implement the same interface using
 * SAP Event Mesh or a BTP integration flow — zero agent changes required.
 *
 * DATA NOTE: This data is clearly fictional/simulated. It does not represent
 * live SAP system data and is not connected to any external service.
 */

import { IDisruptionDataProvider, RawDisruptionSignal } from '../interfaces.js';

export class MockDisruptionProvider implements IDisruptionDataProvider {
  async getActiveDisruptionSignal(_corridorId: string): Promise<RawDisruptionSignal> {
    return {
      signalId: 'MOCK-SIG-NH27-2026-0829',
      category: 'LANDSLIDE',
      severity: 'CRITICAL',
      headline: 'Major Landslide & Highway Collapse at Dima Hasao section of NH-27',
      description:
        'Continuous torrential rainfall triggered a 180-meter mudslide and roadbed ' +
        'collapse near Jatinga/Haflong on NH-27. Highway is completely impassable for ' +
        'heavy commercial vehicles. Border Roads Organisation (BRO) restoration estimated at 72-96 hours.',
      location: {
        name: 'NH-27 Milepost KM-142 (Jatinga Ridge, Dima Hasao)',
        region: 'North Eastern Region, Assam, India',
        latitude: 25.1235,
        longitude: 92.9854,
        altitudeMeters: 620,
      },
      affectedCorridor: 'NH-27 Guwahati to Silchar / Agartala Arterial Lifeline',
      estimatedBlockedDurationHours: 84,
      isCriticalLifelineRoute: true,
      rainfall24hMm: 245.8,
      weatherForecast: 'Severe Monsoon Inundation with Continued Red Alert',
      weatherWarningLevel: 'RED',
      sourceAlertId: 'IMD-ASSAM-DIMA-HASAO-MOCK',
      observedAt: new Date().toISOString(),
    };
  }
}
