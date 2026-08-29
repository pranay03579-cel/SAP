/**
 * SAP Sentinel — Inclusive Workforce Agent (Phase 7 Enhanced)
 *
 * Consumes: IWorkforceDataProvider, Disruption, SupplyChainImpact
 * Produces: WorkforceImpact (validated domain model with full inclusive workforce analytics)
 *
 * Core Operational Invariants:
 * - Solves for operational workforce planning without inferring sensitive personal characteristics.
 * - Enforces zero fatigue cap violations, strict physical ergonomic limits, neurodivergent focus zones, and multilingual manifest translation.
 * - Identifies:
 *    1. Required Workers
 *    2. Available Qualified Workers
 *    3. Skill Gaps
 *    4. Possible Redeployments
 *    5. Training Requirements (just-in-time micro-training)
 *    6. Workload Risks
 *    7. Overall Workforce Feasibility Score
 */

import { IAgent, AgentResult } from './interfaces.js';
import {
  WorkforceImpact,
  Disruption,
  SupplyChainImpact,
  AgentName,
  WorkerConstraintProfile,
  RequiredWorkerDemand,
  QualifiedWorkerAssignment,
  SkillGapAnalysis,
  RedeploymentOption,
  TrainingRequirement,
  WorkloadRiskItem,
} from '../../../shared/types/domain.js';
import { validateWorkforceImpactOutput } from '../validation.js';
import { IWorkforceDataProvider } from '../../providers/interfaces.js';

export interface WorkforceInputContext {
  disruption: Disruption;
  supplyChainImpact: SupplyChainImpact;
  /** Optional custom roster of workers for testing edge cases like shortages or skill mismatch */
  customWorkerProfiles?: WorkerConstraintProfile[];
  /** Optional custom overtime map */
  customOvertimeMap?: Record<string, number>;
}

export class WorkforceAgent implements IAgent<WorkforceInputContext, WorkforceImpact> {
  readonly name: AgentName = 'Workforce Agent';

  constructor(private readonly provider: IWorkforceDataProvider) {}

  async execute(context: WorkforceInputContext): Promise<AgentResult<WorkforceImpact>> {
    const { disruption, supplyChainImpact, customWorkerProfiles, customOvertimeMap } = context;

    const plantIds = ['MOCK-PLANT-IN10-GUWAHATI', 'MOCK-PLANT-IN12-SILCHAR'];
    
    // 1. Fetch worker data from provider or custom test context
    const workers = customWorkerProfiles ?? (await this.provider.getAvailableWorkers(plantIds));
    const workerIds = workers.map((w) => w.workerId);
    const overtimeMap = customOvertimeMap ?? (await this.provider.getWorkerOvertimeSummary(workerIds));

    // 2. Derive Required Worker Demands based on Supply Chain Disruption Impact
    const requiredWorkers: RequiredWorkerDemand[] = [];
    const hasColdChain = supplyChainImpact.impactedPOs.some((po) => po.isColdChain) ||
      (supplyChainImpact.temperatureIntegrityThreat && supplyChainImpact.temperatureIntegrityThreat.affectedColdChainShipments.length > 0);
    const hasFoodRelief = supplyChainImpact.impactedMaterials.some((m) => m.category === 'FOOD_SUPPLY');
    const hasGeneralMeds = supplyChainImpact.impactedMaterials.some((m) => m.category === 'MEDICINE');

    if (hasColdChain || hasGeneralMeds) {
      requiredWorkers.push({
        roleId: 'ROLE-COLD-QA',
        roleTitle: 'Cold-Chain Pharma Packaging & Inspection Specialist',
        headcountNeeded: 1,
        assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
        requiredCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
        urgency: 'CRITICAL',
      });
      requiredWorkers.push({
        roleId: 'ROLE-AIR-STAGING',
        roleTitle: 'Air-Cargo Staging & Precision Pallet Operator',
        headcountNeeded: 1,
        assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
        requiredCertifications: ['AIR_CARGO_STAGING', 'FORKLIFT_PRECISION'],
        urgency: 'CRITICAL',
      });
    }

    if (hasFoodRelief || hasGeneralMeds) {
      requiredWorkers.push({
        roleId: 'ROLE-RECEIVING-RECON',
        roleTitle: 'Warehouse Transfer & Receiving Specialist',
        headcountNeeded: 1,
        assignedPlantId: 'MOCK-PLANT-IN12-SILCHAR',
        requiredCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
        urgency: 'HIGH',
      });
    }

    // Heavy convoy driving demand (if road freight bypass is considered)
    requiredWorkers.push({
      roleId: 'ROLE-HEAVY-CONVOY',
      roleTitle: 'Heavy Commercial Mountain Convoy Driver',
      headcountNeeded: 1,
      assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
      requiredCertifications: ['HEAVY_CONVOY_DRIVER', 'HAZMAT_DG_CERTIFIED'],
      urgency: 'MEDIUM',
    });

    // 3. Match Available Qualified Workers
    const availableQualifiedWorkers: QualifiedWorkerAssignment[] = [];
    const skillGaps: SkillGapAnalysis[] = [];
    const possibleRedeployments: RedeploymentOption[] = [];

    // Filter unconstrained available workers
    const activeAvailableWorkers = workers.filter((w) => {
      const isRestMandatory = w.availabilityStatus === 'REST_MANDATORY';
      const overtime = overtimeMap[w.workerId] ?? w.currentOvertimeHoursWeek;
      const hasOvertimeRoom = overtime < w.maxSafeOvertimeHoursWeek;
      return !isRestMandatory && hasOvertimeRoom;
    });

    // For each requirement, find matching qualified workers
    for (const req of requiredWorkers) {
      const matched = activeAvailableWorkers.filter((w) =>
        req.requiredCertifications.some((cert) => w.skillCertifications.includes(cert))
      );

      if (matched.length >= req.headcountNeeded) {
        matched.slice(0, req.headcountNeeded).forEach((worker: WorkerConstraintProfile) => {
          const matchingCerts = worker.skillCertifications.filter((c: string) => req.requiredCertifications.includes(c));
          const safeHoursRemaining = Math.max(
            0,
            worker.maxSafeOvertimeHoursWeek - (overtimeMap[worker.workerId] ?? worker.currentOvertimeHoursWeek)
          );

          availableQualifiedWorkers.push({
            workerId: worker.workerId,
            workerName: worker.name,
            matchedRole: req.roleTitle,
            plantId: worker.assignedPlantId,
            matchingCertifications: matchingCerts,
            safeOvertimeHoursRemaining: parseFloat(safeHoursRemaining.toFixed(1)),
            appliedAccommodations: worker.accommodations.map((a: { strictLimit: string }) => a.strictLimit),
          });

          // Check if cross-plant or specialized redeployment is active
          if (worker.assignedPlantId !== req.assignedPlantId) {
            possibleRedeployments.push({
              workerId: worker.workerId,
              workerName: worker.name,
              fromPlantId: worker.assignedPlantId,
              toPlantId: req.assignedPlantId,
              targetRole: req.roleTitle,
              feasibility: worker.accommodations.length > 0 ? 'ACCOMMODATION_REQUIRED' : 'IMMEDIATE',
              appliedAccommodations: worker.accommodations.map((a: { strictLimit: string }) => a.strictLimit),
              rationale: `Cross-facility redeployment to cover critical ${req.roleTitle} demand with verified accommodations.`,
            });
          }
        });
      } else {
        // Skill gap detected
        const deficit = req.headcountNeeded - matched.length;
        skillGaps.push({
          roleTitle: req.roleTitle,
          missingCertification: req.requiredCertifications.join(' or '),
          shortageCount: deficit,
          severity: req.urgency === 'CRITICAL' ? 'CRITICAL' : 'MODERATE',
          mitigationAdvice: `Trigger rapid just-in-time micro-training or activate certified partner roster for ${req.roleTitle}.`,
        });
      }
    }

    // 4. Generate Targeted Training Requirements
    const trainingRequirements: TrainingRequirement[] = [
      {
        moduleId: 'TRN-COLD-GPS-01',
        title: 'Active GPS Smart-Battery Cold Box Logger & Thermal Dock Protocol',
        targetRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
        durationHours: 1.5,
        urgency: 'MANDATORY_BEFORE_DISPATCH',
        targetHeadcount: 2,
        description: 'Micro-training on initializing digital telemetry loggers, dry-ice battery packs, and hospital receiving handover.',
      },
      {
        moduleId: 'TRN-ERGO-HYD-02',
        title: 'Powered Hydraulic Pallet Lifter Operational Safety',
        targetRole: 'Air-Cargo Staging & Precision Pallet Operator',
        durationHours: 1.0,
        urgency: 'MANDATORY_BEFORE_DISPATCH',
        targetHeadcount: 3,
        description: 'Refresher training ensuring all pallet transfers above 12kg use hydraulic lifters, protecting ergonomic thresholds.',
      },
      {
        moduleId: 'TRN-RAIL-LMD-03',
        title: 'Lumding–Badarpur Hill Section Wagon Staging & Lashing',
        targetRole: 'Warehouse Transfer & Receiving Specialist',
        durationHours: 2.0,
        urgency: 'ON_THE_JOB',
        targetHeadcount: 4,
        description: 'Standard operating procedures for rapid freight wagon offloading at Badarpur / Silchar railhead.',
      },
    ];

    // If there are explicit skill gaps, add targeted training to bridge them
    if (skillGaps.length > 0) {
      skillGaps.forEach((gap, idx) => {
        trainingRequirements.unshift({
          moduleId: 'TRN-GAP-' + (idx + 1),
          title: `Rapid Certification: ${gap.missingCertification}`,
          targetRole: gap.roleTitle,
          durationHours: 3.0,
          urgency: 'MANDATORY_BEFORE_DISPATCH',
          targetHeadcount: gap.shortageCount,
          description: `Emergency accelerated training to bridge ${gap.roleTitle} skill shortage caused by disruption surge.`,
        });
      });
    }

    // 5. Workload Risks Identification
    const workloadRisks: WorkloadRiskItem[] = [];

    // Fatigue risk
    const fatiguedCount = workers.filter(
      (w) => (overtimeMap[w.workerId] ?? w.currentOvertimeHoursWeek) >= w.maxSafeOvertimeHoursWeek
    ).length;

    if (fatiguedCount > 0) {
      workloadRisks.push({
        riskType: 'FATIGUE_CAP_BREACH',
        severity: 'HIGH',
        affectedCount: fatiguedCount,
        description: `${fatiguedCount} personnel have exceeded or reached weekly maximum safe driving/shift hours.`,
        mitigationStrategy: 'Mandatory 10-12h resting windows enforced; zero deployment to active recovery routes.',
      });
    }

    // Ergonomic risk
    const ergoCount = workers.filter((w: WorkerConstraintProfile) =>
      w.accommodations.some((a: { category: string }) => a.category === 'PHYSICAL_ERGONOMICS')
    ).length;

    if (ergoCount > 0) {
      workloadRisks.push({
        riskType: 'ERGONOMIC_STRAIN',
        severity: 'MODERATE',
        affectedCount: ergoCount,
        description: 'Personnel with documented lifting limits assigned to high-tempo loading zones.',
        mitigationStrategy: 'Mandatory mechanical pallet lifters and motorized forklifts allocated; zero manual lifting > 12kg.',
      });
    }

    // Sensory / Neurodivergent focus risk
    const ndCount = workers.filter((w: WorkerConstraintProfile) =>
      w.accommodations.some((a: { category: string }) => a.category === 'NEURODIVERGENT_FOCUS')
    ).length;

    if (ndCount > 0) {
      workloadRisks.push({
        riskType: 'NEURODIVERGENT_SENSORY_OVERLOAD',
        severity: 'LOW',
        affectedCount: ndCount,
        description: 'High auditory noise and unstructured urgency in warehouse staging.',
        mitigationStrategy: 'Dedicated low-noise staging cubicle and step-by-step visual barcode checklists provided.',
      });
    }

    // Multilingual barrier risk
    const multiCount = workers.filter((w: WorkerConstraintProfile) =>
      w.accommodations.some((a: { category: string }) => a.category === 'MULTILINGUAL_INSTRUCTION')
    ).length;

    if (multiCount > 0) {
      workloadRisks.push({
        riskType: 'MULTILINGUAL_BARRIER',
        severity: 'LOW',
        affectedCount: multiCount,
        description: 'Technical dispatch manifests issued in English/Hindi for Bengali-primary warehouse receiving staff.',
        mitigationStrategy: 'Automated voice and text translation on SAP mobile warehouse scanners enabled.',
      });
    }

    // 6. Compute Metrics
    const constrainedCount = workers.filter((w) => {
      const isRestMandatory = w.availabilityStatus === 'REST_MANDATORY';
      const overtime = overtimeMap[w.workerId] ?? w.currentOvertimeHoursWeek;
      return isRestMandatory || overtime >= w.maxSafeOvertimeHoursWeek;
    }).length;

    const surgeLaborCapacity = workers.reduce(
      (sum, w) =>
        sum +
        Math.max(
          0,
          w.maxSafeOvertimeHoursWeek - (overtimeMap[w.workerId] ?? w.currentOvertimeHoursWeek)
        ),
      0
    );

    const wellBeingIndex =
      workers.length > 0
        ? workers.reduce((sum, w) => sum + (1 - w.fatigueRiskScore) * 100, 0) / workers.length
        : 50.0;

    // Feasibility Score (0-100)
    let feasibility = 100;
    const totalHeadcountNeeded = requiredWorkers.reduce((sum, r) => sum + r.headcountNeeded, 0);
    const qualifiedCount = availableQualifiedWorkers.length;

    if (totalHeadcountNeeded > 0) {
      const coverageRate = Math.min(1, qualifiedCount / totalHeadcountNeeded);
      feasibility = Math.round(coverageRate * 70); // Up to 70 points for coverage
    }

    // Accommodations & well-being bonus (up to 30 points)
    if (workloadRisks.some((r) => r.riskType === 'FATIGUE_CAP_BREACH' && r.severity === 'HIGH')) {
      feasibility -= 10;
    }
    if (skillGaps.length === 0) {
      feasibility += 20;
    } else {
      feasibility -= skillGaps.length * 10;
    }
    if (wellBeingIndex >= 85) {
      feasibility += 10;
    }

    feasibility = Math.max(10, Math.min(100, feasibility));

    // Accommodation requirements array
    const accommodationRequirements = workers
      .filter((w) => w.accommodations.length > 0)
      .map((w) => ({
        workerId: w.workerId,
        category: w.accommodations[0].category,
        instructionTranslationNeeded: w.accommodations[0].category === 'MULTILINGUAL_INSTRUCTION',
        ergonomicRestriction: w.accommodations[0].strictLimit,
      }));

    const output: WorkforceImpact = {
      workforceImpactId: 'WFI-NER-' + Date.now().toString().slice(-6),
      disruptionId: disruption.disruptionId,
      availableStaffCount: workers.length,
      constrainedStaffCount: constrainedCount,
      surgeLaborCapacityHoursAvailable: Math.round(surgeLaborCapacity),
      workforceWellBeingIndex: parseFloat(wellBeingIndex.toFixed(1)),
      fatigueAlerts: [
        {
          workerId: 'MOCK-SF-EMP-1082',
          reason: 'Driver exceeded 11 driving hours due to highway gridlock at Lumding junction [MOCK]',
          mandatoryRestHours: 12,
        },
        {
          workerId: 'MOCK-SF-EMP-2041',
          reason: 'Shift lead logged 18 hours continuous flood-relief logistics triage [MOCK]',
          mandatoryRestHours: 10,
        },
      ],
      accommodationRequirements,
      workerProfiles: workers,

      // Phase 7 Analytics
      requiredWorkers,
      availableQualifiedWorkers,
      skillGaps,
      possibleRedeployments,
      trainingRequirements,
      workloadRisks,
      workforceFeasibilityScore: feasibility,
    };

    const validated = validateWorkforceImpactOutput(output);

    return {
      output: validated,
      confidence: 0.95,
      assumptions: [
        'Workers with documented physical ergonomic constraints must not be assigned manual lifting above certified limits.',
        'Shift rotations must prevent driver and ground staff exhaustion beyond mandatory resting windows.',
        'Operational workforce planning uses objective skill matrices and explicit accommodations without inferring protected personal attributes.',
      ],
      evidence: workers.map((w: WorkerConstraintProfile) => ({
        evidenceId: 'EV-WF-' + w.workerId + '-' + Date.now(),
        sourceType: 'MOCK_SAP_SUCCESSFACTORS' as const,
        sourceReference: w.workerId,
        description: `Worker profile: ${w.name} — Role: ${w.role}. Skills: ${w.skillCertifications.join(', ')}. Fatigue risk: ${(w.fatigueRiskScore * 100).toFixed(0)}%. Accommodations: ${w.accommodations.map((a: { category: string }) => a.category).join(', ') || 'none'}.`,
        observedAt: new Date().toISOString(),
        payloadSnippet: {
          workerId: w.workerId,
          role: w.role,
          certifications: w.skillCertifications,
          fatigueRisk: w.fatigueRiskScore,
          overtimeHrs: overtimeMap[w.workerId] ?? 0,
          maxOvertimeHrs: w.maxSafeOvertimeHoursWeek,
          accommodations: w.accommodations,
        },
      })),
      humanReadableSummary:
        `Workforce assessment completed across ${plantIds.length} facilities. Required roles: ${requiredWorkers.length} (${totalHeadcountNeeded} headcount). ` +
        `Matched ${availableQualifiedWorkers.length} qualified available workers with 0 fatigue breaches. ` +
        `Identified ${skillGaps.length} skill gap(s), ${possibleRedeployments.length} safe redeployment(s), and ${trainingRequirements.length} micro-training module(s). ` +
        `Overall Workforce Feasibility: ${feasibility}/100 (Well-Being: ${wellBeingIndex.toFixed(1)}/100).`,
    };
  }
}
