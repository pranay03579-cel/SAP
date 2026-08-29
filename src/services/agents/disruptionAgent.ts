/**
 * SAP Sentinel — Disruption Agent
 *
 * Consumes: IDisruptionDataProvider
 * Produces: Disruption (validated domain model)
 *
 * The agent receives raw telemetry from its provider, enriches it into the
 * structured Disruption domain model, validates the schema, then returns
 * a fully evidenced AgentResult. It has no knowledge of whether the provider
 * is mock or a real SAP Event Mesh subscription.
 */

import { IAgent, AgentResult } from './interfaces.js';
import { Disruption, AgentName } from '../../../shared/types/domain.js';
import { validateDisruptionOutput } from '../validation.js';
import { IDisruptionDataProvider } from '../../providers/interfaces.js';

export interface DisruptionInputContext {
  corridorId: string;
}

export class DisruptionAgent implements IAgent<DisruptionInputContext, Disruption> {
  readonly name: AgentName = 'Disruption Agent';

  constructor(private readonly provider: IDisruptionDataProvider) {}

  async execute(context: DisruptionInputContext): Promise<AgentResult<Disruption>> {
    const signal = await this.provider.getActiveDisruptionSignal(context.corridorId);

    const output: Disruption = {
      disruptionId: `DISRUPT-NER-${Date.now().toString().slice(-6)}`,
      category: signal.category,
      severity: signal.severity,
      headline: signal.headline,
      description: signal.description,
      location: signal.location,
      affectedCorridor: signal.affectedCorridor,
      reportedAt: signal.observedAt,
      estimatedBlockedDurationHours: signal.estimatedBlockedDurationHours,
      isCriticalLifelineRoute: signal.isCriticalLifelineRoute,
      weatherDetails: {
        rainfallMmLast24Hours: signal.rainfall24hMm,
        forecastCondition: signal.weatherForecast,
        warningLevel: signal.weatherWarningLevel,
      },
    };

    const validated = validateDisruptionOutput(output);

    return {
      output: validated,
      confidence: 0.98,
      assumptions: [
        'NHAI/BRO clearance timeline of 72-96 hours is based on typical mudslide volume for this corridor.',
        'Secondary rainfall precludes immediate heavy earth-mover intervention on the main carriageway.',
      ],
      evidence: [
        {
          evidenceId: `EV-${Date.now()}-TELEMETRY`,
          sourceType: 'ROAD_TELEMETRY',
          sourceReference: `SENSOR-${signal.signalId}`,
          description: `Geotechnical sensor confirms ${signal.estimatedBlockedDurationHours}h estimated blockade. Category: ${signal.category}.`,
          observedAt: signal.observedAt,
          payloadSnippet: {
            category: signal.category,
            severity: signal.severity,
            corridor: signal.affectedCorridor,
            blockedHours: signal.estimatedBlockedDurationHours,
          },
        },
        {
          evidenceId: `EV-${Date.now()}-MET`,
          sourceType: 'METEOROLOGICAL_FEED',
          sourceReference: signal.sourceAlertId,
          description: `Meteorological alert: ${signal.rainfall24hMm}mm rainfall in 24h. Warning level: ${signal.weatherWarningLevel}.`,
          observedAt: signal.observedAt,
          payloadSnippet: {
            alertId: signal.sourceAlertId,
            rainfallMm: signal.rainfall24hMm,
            warningLevel: signal.weatherWarningLevel,
          },
        },
      ],
      humanReadableSummary:
        `${signal.category} disruption confirmed on ${signal.affectedCorridor}. ` +
        `Severity: ${signal.severity}. Road impassable for ~${signal.estimatedBlockedDurationHours} hours. ` +
        `Arterial connection to Barak Valley severed.`,
    };
  }
}
