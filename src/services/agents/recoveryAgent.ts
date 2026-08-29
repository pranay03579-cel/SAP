/**
 * SAP Sentinel — Recovery Adaptation Agent
 *
 * Consumes: ITransportCapacityProvider
 * Produces: RecoveryScenario[] (validated domain model)
 *
 * Queries the provider for available transport modalities, then constructs
 * concrete recovery scenarios by combining transport options with workforce
 * assignments. Has no knowledge of whether the provider is mock or a live
 * SAP Logistics Business Network / SAP TM endpoint.
 */

import { IAgent, AgentResult } from './interfaces.js';
import {
  RecoveryScenario,
  Disruption,
  SupplyChainImpact,
  WorkforceImpact,
  AgentName,
  WorkerConstraintProfile,
  ImpactedPurchaseOrder,
} from '../../../shared/types/domain.js';
import { validateRecoveryScenariosOutput } from '../validation.js';
import { ITransportCapacityProvider } from '../../providers/interfaces.js';

export interface RecoveryInputContext {
  disruption: Disruption;
  supplyChainImpact: SupplyChainImpact;
  workforceImpact: WorkforceImpact;
}

export class RecoveryAdaptationAgent implements IAgent<RecoveryInputContext, RecoveryScenario[]> {
  readonly name: AgentName = 'Recovery Adaptation Agent';

  constructor(private readonly provider: ITransportCapacityProvider) {}

  async execute(context: RecoveryInputContext): Promise<AgentResult<RecoveryScenario[]>> {
    const { supplyChainImpact, workforceImpact } = context;

    const allPONumbers = supplyChainImpact.impactedPOs.map((po: ImpactedPurchaseOrder) => po.poNumber);
    const coldChainPOs = supplyChainImpact.impactedPOs
      .filter((po: ImpactedPurchaseOrder) => po.isColdChain)
      .map((po: ImpactedPurchaseOrder) => po.poNumber);
    const nonColdPOs = supplyChainImpact.impactedPOs
      .filter((po: ImpactedPurchaseOrder) => !po.isColdChain)
      .map((po: ImpactedPurchaseOrder) => po.poNumber);

    const transportOptions = await this.provider.getAvailableTransportOptions(
      'MOCK-PLANT-IN10-GUWAHATI',
      ['MOCK-PLANT-IN12-SILCHAR', 'MOCK-PLANT-IN14-AGARTALA']
    );

    const airOption = transportOptions.find((t) => t.modality === 'AIR_CHARTER');
    const railOption = transportOptions.find((t) => t.modality === 'RAIL_FREIGHT');
    const roadOption = transportOptions.find((t) => t.modality === 'FEEDER_ROAD');

    const availableWorkers = workforceImpact.workerProfiles;

    const scenarios: RecoveryScenario[] = [
      // ─── Scenario A: Full Emergency Airlift ───────────────────────────────
      {
        scenarioId: 'SCENARIO-A-FAST-AIR',
        scenarioName: 'Scenario A: Emergency Air Charter & Direct Military Helipad Drop',
        tier: 'SCENARIO_A_FASTEST_AIRLIFT',
        summary: `Airlift all ${allPONumbers.length} impacted POs (Medicines + PDS Food) via charter from ${airOption?.routePath[0] ?? 'Borjhar (GAU)'} to ${airOption?.routePath[airOption.routePath.length - 1] ?? 'Kumbhirgram (IXS)'}.`,
        tradeOffs: {
          estimatedRecoveryHours: airOption?.leadTimeHours ?? 10,
          incrementalCostInr: Math.round((airOption?.costPerTonneInr ?? 385000) * 12),
          slaAdherencePercentage: 98,
          workerWellBeingScore: 62.0,
          carbonEmissionsKg: 14200,
          coldChainIntegrityRisk: 'NONE',
        },
        workforceSafetyAssessment: {
          maxShiftHours: 14,
          fatigueExceedanceDetected: true,
          allAccommodationsRespected: false,
          burnoutRiskCategory: 'HIGH',
        },
        logisticsFeasibility: {
          corridorClearanceConfirmed: airOption?.availableNow ?? true,
          coldChainSafeguardProtocol: 'Continuous active compressor dry-ice units',
        },
        recoveryOptions: [
          {
            optionId: `OPT-AIR-01-${airOption?.modalityId ?? 'AIR'}`,
            name: `Pharma & Food Air Freight Charter (${airOption?.routeName ?? 'GAU→IXS'})`,
            modality: 'AIR_CHARTER',
            description: `Chartered turbo-prop flight carrying up to 12 tonnes combined pharma and nutrition kits. ${(airOption?.capacityConstraints ?? []).join('. ')}`,
            targetPurchaseOrders: allPONumbers,
            alternativeRoutePath: airOption?.routePath ?? [],
            requiredWorkforceRoles: ['AIR_CARGO_STAGING', 'COLD_CHAIN_LOGISTICS'],
            assignedWorkers: availableWorkers
              .filter((w: WorkerConstraintProfile) => w.skillCertifications.includes('AIR_CARGO_STAGING') || w.skillCertifications.includes('COLD_CHAIN_LOGISTICS'))
              .map((w: WorkerConstraintProfile) => ({
                workerId: w.workerId,
                allocatedShiftHours: 8,
                appliedAccommodations: w.accommodations.map((a: { strictLimit: string }) => a.strictLimit),
              })),
            leadTimeHours: airOption?.leadTimeHours ?? 10,
            estimatedCostInr: Math.round((airOption?.costPerTonneInr ?? 385000) * 12),
            feasibilityScore: 0.82,
          },
        ],
      },

      // ─── Scenario B: Precision Multimodal Split ───────────────────────────
      {
        scenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
        scenarioName: 'Scenario B: Precision Multimodal Split (Life-Saving Air Charter + Feeder Rail/Road for Food)',
        tier: 'SCENARIO_B_BALANCED_INCLUSIVE_MULTIMODAL',
        summary: `Split recovery: High-priority cold-chain oncology & insulin airlifted (${airOption?.leadTimeHours ?? 8}h). Heavy PDS food rerouted via ${railOption?.routeName ?? 'Lumding-Badarpur Rail'} with inclusive day-shift handling.`,
        tradeOffs: {
          estimatedRecoveryHours: Math.max(airOption?.leadTimeHours ?? 8, railOption?.leadTimeHours ?? 14),
          incrementalCostInr:
            Math.round((airOption?.costPerTonneInr ?? 385000) * 2.2) +
            Math.round((railOption?.costPerTonneInr ?? 12300) * 35),
          slaAdherencePercentage: 96,
          workerWellBeingScore: 94.5,
          carbonEmissionsKg: 3850,
          coldChainIntegrityRisk: 'NONE',
        },
        workforceSafetyAssessment: {
          maxShiftHours: 8,
          fatigueExceedanceDetected: false,
          allAccommodationsRespected: true,
          burnoutRiskCategory: 'LOW',
        },
        logisticsFeasibility: {
          corridorClearanceConfirmed: (airOption?.availableNow ?? true) && (railOption?.availableNow ?? true),
          coldChainSafeguardProtocol: 'Active smart-battery cold-box logger with Silchar Hospital receiving dock ready',
        },
        recoveryOptions: [
          {
            optionId: `OPT-AIR-MED-01-${airOption?.modalityId ?? 'AIR'}`,
            name: `Precision Cold-Chain Medical Airlift (${airOption?.routeName ?? 'GAU→IXS'})`,
            modality: 'AIR_CHARTER',
            description: 'Light dedicated aircraft carrying 2.2 tonnes of temperature-sensitive insulin and chemotherapeutic drugs.',
            targetPurchaseOrders: coldChainPOs,
            alternativeRoutePath: airOption?.routePath ?? [],
            requiredWorkforceRoles: ['COLD_CHAIN_LOGISTICS', 'PRECISION_PHARMA_QA'],
            assignedWorkers: availableWorkers
              .filter((w: WorkerConstraintProfile) => w.skillCertifications.some((s: string) => ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA', 'AIR_CARGO_STAGING'].includes(s)))
              .map((w: WorkerConstraintProfile) => ({
                workerId: w.workerId,
                allocatedShiftHours: 6,
                appliedAccommodations: w.accommodations.map((a: { strictLimit: string }) => a.strictLimit),
              })),
            leadTimeHours: airOption?.leadTimeHours ?? 8,
            estimatedCostInr: Math.round((airOption?.costPerTonneInr ?? 385000) * 2.2),
            feasibilityScore: 0.96,
          },
          {
            optionId: `OPT-RAIL-FOOD-02-${railOption?.modalityId ?? 'RAIL'}`,
            name: `Emergency Priority Rail Freight (${railOption?.routeName ?? 'Lumding-Badarpur'})`,
            modality: 'RAIL_FREIGHT',
            description: 'Dedicated 2-wagon rake for 35 tonnes PDS emergency grain. ' + (railOption?.capacityConstraints ?? []).join('. '),
            targetPurchaseOrders: nonColdPOs,
            alternativeRoutePath: railOption?.routePath ?? [],
            requiredWorkforceRoles: ['WAREHOUSE_TRANSFER', 'RECEIVING_SPECIALIST'],
            assignedWorkers: availableWorkers
              .filter((w: WorkerConstraintProfile) => w.skillCertifications.some((s: string) => ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'].includes(s)))
              .map((w: WorkerConstraintProfile) => ({
                workerId: w.workerId,
                allocatedShiftHours: 7,
                appliedAccommodations: w.accommodations.map((a: { strictLimit: string }) => a.strictLimit),
              })),
            leadTimeHours: railOption?.leadTimeHours ?? 14,
            estimatedCostInr: Math.round((railOption?.costPerTonneInr ?? 12300) * 35),
            feasibilityScore: 0.92,
          },
        ],
      },

      // ─── Scenario C: Road Feeder Detour ──────────────────────────────────
      {
        scenarioId: 'SCENARIO-C-ROAD-DETOUR',
        scenarioName: `Scenario C: ${roadOption?.routeName ?? 'Meghalaya Hill Feeder Highway Bypass'}`,
        tier: 'SCENARIO_C_LOW_COST_ROAD_FEEDER',
        summary: `Convoys rerouted via ${roadOption?.routePath?.join(' → ') ?? 'NH-06 hill bypass'}. Low direct cost, high risk of 36h delay and cold-chain battery depletion. ${(roadOption?.capacityConstraints ?? []).join('. ')}`,
        tradeOffs: {
          estimatedRecoveryHours: roadOption?.leadTimeHours ?? 36,
          incrementalCostInr: Math.round((roadOption?.costPerTonneInr ?? 9100) * 47),
          slaAdherencePercentage: 45,
          workerWellBeingScore: 54.0,
          carbonEmissionsKg: 6200,
          coldChainIntegrityRisk: 'HIGH',
        },
        workforceSafetyAssessment: {
          maxShiftHours: 16,
          fatigueExceedanceDetected: true,
          allAccommodationsRespected: false,
          burnoutRiskCategory: 'HIGH',
        },
        logisticsFeasibility: {
          corridorClearanceConfirmed: roadOption?.availableNow ?? false,
          coldChainSafeguardProtocol: (roadOption?.capacityConstraints ?? []).find((c) => c.toLowerCase().includes('cold')) ?? 'Cold-chain recharge stations unavailable',
        },
        recoveryOptions: [
          {
            optionId: `OPT-ROAD-BYPASS-01-${roadOption?.modalityId ?? 'ROAD'}`,
            name: `NH-06 Heavy Convoy Detour via ${roadOption?.routePath?.[1] ?? 'Shillong/Jowai'}`,
            modality: 'FEEDER_ROAD',
            description: 'Truck convoy diversion over steep single-lane mountain passes. ' + (roadOption?.capacityConstraints ?? []).join('. '),
            targetPurchaseOrders: allPONumbers,
            alternativeRoutePath: roadOption?.routePath ?? [],
            requiredWorkforceRoles: ['HEAVY_CONVOY_DRIVER'],
            assignedWorkers: [],
            leadTimeHours: roadOption?.leadTimeHours ?? 36,
            estimatedCostInr: Math.round((roadOption?.costPerTonneInr ?? 9100) * 47),
            feasibilityScore: 0.48,
          },
        ],
      },
    ];

    const validated = validateRecoveryScenariosOutput(scenarios);

    return {
      output: validated,
      confidence: 0.95,
      assumptions: [
        `${airOption?.routePath?.[0] ?? 'Borjhar Airport (GAU)'} and ${airOption?.routePath?.[airOption.routePath.length - 1] ?? 'Kumbhirgram Airport (IXS)'} remain operational for daylight turboprop flights.`,
        railOption ? `${railOption.routeName} is open with priority freight capacity.` : 'Rail alternative not confirmed available.',
      ],
      evidence: transportOptions.map((opt) => ({
        evidenceId: `EV-TRN-${opt.modalityId}-${Date.now()}`,
        sourceType: 'ROAD_TELEMETRY' as const,
        sourceReference: opt.modalityId,
        description: `Transport option: ${opt.routeName}. Available: ${opt.availableNow}. Slots: ${opt.availableSlots}. Lead time: ${opt.leadTimeHours}h. Cold chain: ${opt.coldChainCapable}.`,
        observedAt: new Date().toISOString(),
        payloadSnippet: {
          modality: opt.modality,
          availableNow: opt.availableNow,
          slots: opt.availableSlots,
          leadTimeHours: opt.leadTimeHours,
          costPerTonneInr: opt.costPerTonneInr,
          coldChain: opt.coldChainCapable,
        },
      })),
      humanReadableSummary:
        `Generated ${scenarios.length} distinct end-to-end recovery scenarios from ${transportOptions.length} transport options. ` +
        `Scenario A (Full Emergency Airlift), Scenario B (Multimodal Precision Split), Scenario C (Feeder Road Bypass).`,
    };
  }
}
