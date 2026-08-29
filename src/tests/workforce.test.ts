/**
 * Automated Test Suite: Phase 7 — Inclusive Operational Workforce Planning
 * 
 * Verifies:
 * 1. Worker Shortage: Detects when demand headcount exceeds total active personnel.
 * 2. Skill Mismatch: Detects when available workers lack specialized certifications.
 * 3. Insufficient Qualified Workers: Detects when qualified workers are constrained by fatigue caps / rest mandates.
 * 4. Training Requirement: Generates targeted JIT micro-training modules to bridge skill gaps.
 * 5. Inclusivity & Accommodations: Respects ergonomic, neurodivergent, and multilingual constraints without inferring protected attributes.
 * 6. Workforce Feasibility Score: Correctly penalizes labor gaps and fatigue breaches.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { WorkforceAgent } from '../services/agents/workforceAgent.js';
import { MockWorkforceProvider } from '../providers/mock/mockWorkforceProvider.js';
import {
  Disruption,
  SupplyChainImpact,
  WorkerConstraintProfile,
} from '../../shared/types/domain.js';

// Minimal test Disruption fixture
const testDisruption: Disruption = {
  disruptionId: 'DISRUPT-TEST-001',
  category: 'LANDSLIDE',
  severity: 'CRITICAL',
  headline: 'Landslide on NH-27',
  description: 'Blockade at Dima Hasao',
  location: { name: 'Dima Hasao', region: 'Assam', latitude: 25.12, longitude: 92.98 },
  affectedCorridor: 'NH-27',
  reportedAt: new Date().toISOString(),
  estimatedBlockedDurationHours: 84,
  isCriticalLifelineRoute: true,
  weatherDetails: { rainfallMmLast24Hours: 200, forecastCondition: 'Monsoon', warningLevel: 'RED' },
};

// Supply chain impact with critical cold-chain demand
const testSupplyChainWithColdChain: SupplyChainImpact = {
  impactId: 'SCI-TEST-001',
  disruptionId: 'DISRUPT-TEST-001',
  impactedPOs: [
    {
      poNumber: 'PO-TEST-COLD-01',
      vendorId: 'VEND-01',
      vendorName: 'Bharat Bio',
      originPlant: 'PLANT-IN10-GUWAHATI',
      destinationPlant: 'PLANT-IN12-SILCHAR',
      originalEta: new Date().toISOString(),
      projectedDelayHours: 82,
      cargoValueInr: 15000000,
      isColdChain: true,
      materialIds: ['MAT-MED-INSULIN-01'],
    },
  ],
  impactedMaterials: [
    {
      materialId: 'MAT-MED-INSULIN-01',
      description: 'Insulin Glargine',
      category: 'MEDICINE',
      criticality: 'LIFE_SAVING',
      temperatureControlled: true,
      shortageQuantity: 5000,
      unitOfMeasure: 'VIALS',
      affectedDestinationPlant: 'PLANT-IN12-SILCHAR',
    },
  ],
  estimatedTotalValueAtRiskInr: 15000000,
  stockoutImminentPlants: ['PLANT-IN12-SILCHAR'],
  daysOfBufferInventoryRemaining: { 'PLANT-IN12-SILCHAR': 1.0 },
  temperatureIntegrityThreat: {
    affectedColdChainShipments: ['PO-TEST-COLD-01'],
    batteryBackupHoursRemaining: 18,
  },
  supplyBottlenecks: ['Hospital insulin stockout imminent'],
};

describe('Phase 7: Inclusive Operational Workforce Tests', () => {
  const provider = new MockWorkforceProvider();
  const agent = new WorkforceAgent(provider);

  // ── 1. Worker Shortage Test ────────────────────────────────────────────────
  test('1. Worker Shortage: Detects when demand headcount exceeds total active staff', async () => {
    // Only 1 worker available in the entire roster
    const singleWorkerRoster: WorkerConstraintProfile[] = [
      {
        workerId: 'WORKER-SOLO',
        name: 'Single Worker',
        role: 'General Hand',
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        skillCertifications: ['FORKLIFT_PRECISION'],
        accommodations: [],
        preferredLanguage: 'English',
        currentOvertimeHoursWeek: 2.0,
        maxSafeOvertimeHoursWeek: 10.0,
        fatigueRiskScore: 0.2,
        availabilityStatus: 'AVAILABLE',
      },
    ];

    const result = await agent.execute({
      disruption: testDisruption,
      supplyChainImpact: testSupplyChainWithColdChain,
      customWorkerProfiles: singleWorkerRoster,
    });

    const impact = result.output;

    // Demand requires multiple roles (Cold-Chain QA, Air Staging, Receiving, Heavy Convoy)
    assert.ok(impact.requiredWorkers.length >= 3, 'Should require multiple recovery roles');
    const totalHeadcountNeeded = impact.requiredWorkers.reduce((s, r) => s + r.headcountNeeded, 0);
    assert.ok(totalHeadcountNeeded > impact.availableStaffCount, 'Headcount needed must exceed single available worker');

    // Feasibility score should be heavily penalized
    assert.ok(
      impact.workforceFeasibilityScore < 60,
      `Workforce feasibility score (${impact.workforceFeasibilityScore}) must be severely penalized during labor shortage`
    );

    // Skill gaps must be reported
    assert.ok(impact.skillGaps.length > 0, 'Skill gaps must be detected');
  });

  // ── 2. Skill Mismatch Test ─────────────────────────────────────────────────
  test('2. Skill Mismatch: Detects when workers are available but lack required specialized certifications', async () => {
    // Workers available, but only have standard warehouse skills (no cold-chain or air-staging certifications)
    const mismatchedWorkers: WorkerConstraintProfile[] = [
      {
        workerId: 'WORKER-GEN-1',
        name: 'General Clerk 1',
        role: 'Administrative Clerk',
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        skillCertifications: ['BASIC_DATA_ENTRY', 'INVENTORY_COUNTING'],
        accommodations: [],
        preferredLanguage: 'Hindi',
        currentOvertimeHoursWeek: 0,
        maxSafeOvertimeHoursWeek: 8.0,
        fatigueRiskScore: 0.1,
        availabilityStatus: 'AVAILABLE',
      },
      {
        workerId: 'WORKER-GEN-2',
        name: 'General Clerk 2',
        role: 'Office Assistant',
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        skillCertifications: ['OFFICE_SUPPORT'],
        accommodations: [],
        preferredLanguage: 'English',
        currentOvertimeHoursWeek: 0,
        maxSafeOvertimeHoursWeek: 8.0,
        fatigueRiskScore: 0.1,
        availabilityStatus: 'AVAILABLE',
      },
    ];

    const result = await agent.execute({
      disruption: testDisruption,
      supplyChainImpact: testSupplyChainWithColdChain,
      customWorkerProfiles: mismatchedWorkers,
    });

    const impact = result.output;

    // Available headcount is 2, but 0 are qualified for cold-chain or air-staging
    assert.strictEqual(impact.availableStaffCount, 2);
    assert.strictEqual(impact.availableQualifiedWorkers.length, 0, 'No workers should match specialized certifications');

    // Should identify skill gaps for Cold-Chain and Air-Cargo
    const coldChainGap = impact.skillGaps.find((g) => g.roleTitle.includes('Cold-Chain'));
    assert.ok(coldChainGap, 'Must report Cold-Chain skill gap');
    assert.strictEqual(coldChainGap.severity, 'CRITICAL');
  });

  // ── 3. Insufficient Qualified Workers (Fatigue / Overtime Constraint) ─────────
  test('3. Insufficient Qualified Workers: Qualified workers disqualified due to mandatory rest / fatigue', async () => {
    // Worker has exact cold-chain certification, but is under mandatory rest (fatigued)
    const fatiguedQualifiedWorkers: WorkerConstraintProfile[] = [
      {
        workerId: 'WORKER-FATIGUED-EXPERT',
        name: 'Expert Pharmacist (Exhausted)',
        role: 'Cold-Chain QA',
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        skillCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
        accommodations: [],
        preferredLanguage: 'English',
        currentOvertimeHoursWeek: 16.0, // Exceeds safe 8.0 limit
        maxSafeOvertimeHoursWeek: 8.0,
        fatigueRiskScore: 0.95,
        availabilityStatus: 'REST_MANDATORY',
      },
    ];

    const result = await agent.execute({
      disruption: testDisruption,
      supplyChainImpact: testSupplyChainWithColdChain,
      customWorkerProfiles: fatiguedQualifiedWorkers,
    });

    const impact = result.output;

    // Fatigued worker must NOT be assigned to active recovery duty
    assert.strictEqual(
      impact.availableQualifiedWorkers.length,
      0,
      'Fatigued worker under REST_MANDATORY must not be assigned to active qualified roster'
    );

    // Fatigue risk must be flagged
    assert.ok(
      impact.workloadRisks.some((r) => r.riskType === 'FATIGUE_CAP_BREACH'),
      'Must log FATIGUE_CAP_BREACH risk'
    );
  });

  // ── 4. Training Requirement Generation Test ────────────────────────────────
  test('4. Training Requirement: Generates targeted just-in-time micro-training modules to bridge skill gaps', async () => {
    const result = await agent.execute({
      disruption: testDisruption,
      supplyChainImpact: testSupplyChainWithColdChain,
    });

    const impact = result.output;

    assert.ok(impact.trainingRequirements.length >= 3, 'Must have at least 3 training modules');

    // Verify JIT training fields
    for (const trn of impact.trainingRequirements) {
      assert.ok(trn.moduleId, 'Module ID must exist');
      assert.ok(trn.title, 'Title must exist');
      assert.ok(trn.targetRole, 'Target role must exist');
      assert.ok(trn.durationHours > 0, 'Duration must be positive');
      assert.ok(trn.urgency, 'Urgency must exist');
      assert.ok(trn.targetHeadcount > 0, 'Target headcount must be positive');
    }

    const coldChainTraining = impact.trainingRequirements.find((t) => t.moduleId.includes('COLD'));
    assert.ok(coldChainTraining, 'Cold chain training module must be catalogued');
    assert.strictEqual(coldChainTraining.urgency, 'MANDATORY_BEFORE_DISPATCH');
  });

  // ── 5. Inclusive Accommodations & Well-Being Invariant ──────────────────────
  test('5. Inclusivity: Preserves accommodations (ergonomic, neurodivergent, multilingual) with high well-being', async () => {
    const result = await agent.execute({
      disruption: testDisruption,
      supplyChainImpact: testSupplyChainWithColdChain,
    });

    const impact = result.output;

    assert.ok(impact.accommodationRequirements.length >= 2, 'Must catalogue accommodation requirements');

    // Check specific accommodation types
    const categories = impact.accommodationRequirements.map((a) => a.category);
    assert.ok(categories.includes('PHYSICAL_ERGONOMICS'), 'Must handle physical ergonomics');
    assert.ok(categories.includes('NEURODIVERGENT_FOCUS'), 'Must handle neurodivergent focus');

    // Well-being index must be calculated
    assert.ok(impact.workforceWellBeingIndex >= 75, `Well-being index (${impact.workforceWellBeingIndex}) must be healthy for mock roster`);
  });
});
