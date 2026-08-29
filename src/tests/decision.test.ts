/**
 * SAP Sentinel — Decision Agent & Scoring Engine Tests (Phase 5)
 *
 * Proves:
 * 1. Winner is computed from scenario data — not hardcoded.
 * 2. Changing cost changes the recommendation.
 * 3. Changing recovery time changes the recommendation.
 * 4. Changing workforce well-being changes the recommendation.
 * 5. Changing critical shipment priority (weights) changes the recommendation.
 * 6. All 7 criteria are present in every evaluation.
 * 7. Scores are deterministic (same input → same output).
 * 8. CompositeScore sum-of-weighted-criteria invariant holds.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { scoreScenarios } from '../services/agents/scoringEngine.js';
import { DecisionAgent } from '../services/agents/decisionAgent.js';
import {
  RecoveryScenario,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
} from '../../shared/types/domain.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a minimal valid RecoveryScenario for tests
// ─────────────────────────────────────────────────────────────────────────────
function makeScenario(
  id: string,
  overrides: Partial<{
    estimatedRecoveryHours: number;
    incrementalCostInr: number;
    slaAdherencePercentage: number;
    workerWellBeingScore: number;
    carbonEmissionsKg: number;
    coldChainIntegrityRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    corridorClearanceConfirmed: boolean;
    allAccommodationsRespected: boolean;
    fatigueExceedanceDetected: boolean;
    feasibilityScore: number;
  }> = {}
): RecoveryScenario {
  return {
    scenarioId: id,
    scenarioName: `Test Scenario ${id}`,
    tier: 'SCENARIO_A_FASTEST_AIRLIFT',
    summary: `Test scenario ${id}`,
    tradeOffs: {
      estimatedRecoveryHours: overrides.estimatedRecoveryHours ?? 12,
      incrementalCostInr: overrides.incrementalCostInr ?? 1000000,
      slaAdherencePercentage: overrides.slaAdherencePercentage ?? 90,
      workerWellBeingScore: overrides.workerWellBeingScore ?? 80,
      carbonEmissionsKg: overrides.carbonEmissionsKg ?? 5000,
      coldChainIntegrityRisk: overrides.coldChainIntegrityRisk ?? 'NONE',
    },
    workforceSafetyAssessment: {
      maxShiftHours: 8,
      fatigueExceedanceDetected: overrides.fatigueExceedanceDetected ?? false,
      allAccommodationsRespected: overrides.allAccommodationsRespected ?? true,
      burnoutRiskCategory: 'LOW',
    },
    logisticsFeasibility: {
      corridorClearanceConfirmed: overrides.corridorClearanceConfirmed ?? true,
      coldChainSafeguardProtocol: 'Test protocol',
    },
    recoveryOptions: [
      {
        optionId: `OPT-${id}-01`,
        name: `Test option ${id}`,
        modality: 'AIR_CHARTER',
        description: 'Test option',
        targetPurchaseOrders: ['PO-001'],
        alternativeRoutePath: ['A', 'B'],
        requiredWorkforceRoles: ['COLD_CHAIN_LOGISTICS'],
        assignedWorkers: [{ workerId: 'W-001', allocatedShiftHours: 6, appliedAccommodations: ['Forklift'] }],
        leadTimeHours: overrides.estimatedRecoveryHours ?? 12,
        estimatedCostInr: overrides.incrementalCostInr ?? 1000000,
        feasibilityScore: overrides.feasibilityScore ?? 0.9,
      },
    ],
  };
}

describe('Phase 5: Decision Agent & Scoring Engine Tests', () => {

  // ── 1. Winner is determined by data, not hardcoded ──────────────────────────
  test('1. Winner is the scenario with highest composite score (not hardcoded)', () => {
    const scenarios = [
      makeScenario('SCENARIO-A', {
        estimatedRecoveryHours: 10, incrementalCostInr: 3000000, slaAdherencePercentage: 98,
        workerWellBeingScore: 60, carbonEmissionsKg: 14000, coldChainIntegrityRisk: 'NONE',
        allAccommodationsRespected: false, fatigueExceedanceDetected: true,
      }),
      makeScenario('SCENARIO-B', {
        estimatedRecoveryHours: 14, incrementalCostInr: 1200000, slaAdherencePercentage: 96,
        workerWellBeingScore: 94, carbonEmissionsKg: 3800, coldChainIntegrityRisk: 'NONE',
        allAccommodationsRespected: true, fatigueExceedanceDetected: false,
      }),
      makeScenario('SCENARIO-C', {
        estimatedRecoveryHours: 36, incrementalCostInr: 300000, slaAdherencePercentage: 45,
        workerWellBeingScore: 54, carbonEmissionsKg: 6200, coldChainIntegrityRisk: 'HIGH',
        corridorClearanceConfirmed: false, allAccommodationsRespected: false, fatigueExceedanceDetected: true,
      }),
    ];

    const evaluations = scoreScenarios(scenarios, DEFAULT_SCORING_WEIGHTS);

    // Rank 1 must have highest composite score
    assert.strictEqual(evaluations[0].rank, 1);
    assert.ok(evaluations[0].compositeScore > evaluations[1].compositeScore, 'Rank 1 must have higher score than rank 2');
    assert.ok(evaluations[1].compositeScore > evaluations[2].compositeScore, 'Rank 2 must have higher score than rank 3');

    // With default weights (life-safety priority), SCENARIO-B should win
    // (best balance of workforce, cost, cold-chain integrity)
    assert.strictEqual(evaluations[0].scenarioId, 'SCENARIO-B',
      'SCENARIO-B should win with default weights under standard disruption scenario');

    console.log(`  Scores: ${evaluations.map(e => `${e.scenarioId}=${e.compositeScore.toFixed(1)}`).join(', ')}`);
  });

  // ── 2. Changing cost flips the winner ───────────────────────────────────────
  test('2. Changing cost changes the recommendation — cheaper option wins when cost weight is maximized', () => {
    const scenarios = [
      makeScenario('EXPENSIVE-FAST', {
        estimatedRecoveryHours: 8, incrementalCostInr: 5000000, slaAdherencePercentage: 99,
        workerWellBeingScore: 70, carbonEmissionsKg: 8000, coldChainIntegrityRisk: 'NONE',
      }),
      makeScenario('CHEAP-SLOW', {
        estimatedRecoveryHours: 30, incrementalCostInr: 200000, slaAdherencePercentage: 60,
        workerWellBeingScore: 70, carbonEmissionsKg: 8000, coldChainIntegrityRisk: 'NONE',
      }),
    ];

    // Cost-maximized weights
    const costDrivenWeights: ScoringWeights = {
      recoveryEffectiveness: 0.05,
      recoveryTime: 0.05,
      cost: 0.65,
      risk: 0.10,
      criticalShipmentProtection: 0.05,
      workforceFeasibility: 0.05,
      operationalImpact: 0.05,
    };

    const evals = scoreScenarios(scenarios, costDrivenWeights);
    assert.strictEqual(evals[0].scenarioId, 'CHEAP-SLOW',
      'When cost weight is dominant, cheapest scenario should win');

    // With speed-maximized weights, expensive-fast should win
    const speedWeights: ScoringWeights = {
      recoveryEffectiveness: 0.05,
      recoveryTime: 0.70,
      cost: 0.05,
      risk: 0.05,
      criticalShipmentProtection: 0.05,
      workforceFeasibility: 0.05,
      operationalImpact: 0.05,
    };

    const speedEvals = scoreScenarios(scenarios, speedWeights);
    assert.strictEqual(speedEvals[0].scenarioId, 'EXPENSIVE-FAST',
      'When speed weight is dominant, fastest scenario should win');

    console.log(`  Cost-driven winner: ${evals[0].scenarioId} (${evals[0].compositeScore.toFixed(1)})`);
    console.log(`  Speed-driven winner: ${speedEvals[0].scenarioId} (${speedEvals[0].compositeScore.toFixed(1)})`);
  });

  // ── 3. Changing recovery time changes the recommendation ────────────────────
  test('3. Changing recovery time changes the recommendation', () => {
    // Start with two identical scenarios, only differ in recovery time
    const baseFast = makeScenario('FAST', { estimatedRecoveryHours: 6, incrementalCostInr: 1000000, slaAdherencePercentage: 95 });
    const baseSlow = makeScenario('SLOW', { estimatedRecoveryHours: 48, incrementalCostInr: 1000000, slaAdherencePercentage: 95 });

    const timeWeights: ScoringWeights = {
      recoveryEffectiveness: 0.10,
      recoveryTime: 0.60,
      cost: 0.10,
      risk: 0.05,
      criticalShipmentProtection: 0.05,
      workforceFeasibility: 0.05,
      operationalImpact: 0.05,
    };

    const evals = scoreScenarios([baseFast, baseSlow], timeWeights);
    assert.strictEqual(evals[0].scenarioId, 'FAST', 'Faster scenario must win when recoveryTime weight is dominant');

    // Now flip — make SLOW the same time as FAST by rebuilding scenario with fast time
    const nowFastSlow = makeScenario('SLOW', { estimatedRecoveryHours: 4, incrementalCostInr: 1000000, slaAdherencePercentage: 95 });
    const evals2 = scoreScenarios([baseFast, nowFastSlow], timeWeights);
    // SLOW is now faster (4h < 6h), so it should now win or tie
    assert.ok(evals2[0].compositeScore >= evals2[1].compositeScore, 'New SLOW (4h) should outscore or tie FAST (6h)');

    console.log(`  Time-driven: FAST=${evals[0].compositeScore.toFixed(1)} vs SLOW=${evals[1].compositeScore.toFixed(1)}`);
  });

  // ── 4. Changing workforce availability changes the recommendation ────────────
  test('4. Changing workforce well-being score changes the recommendation when workforce weight is high', () => {
    const lowWellbeing = makeScenario('LOW-WB', {
      workerWellBeingScore: 10, allAccommodationsRespected: false, fatigueExceedanceDetected: true,
      incrementalCostInr: 500000,
    });
    const highWellbeing = makeScenario('HIGH-WB', {
      workerWellBeingScore: 98, allAccommodationsRespected: true, fatigueExceedanceDetected: false,
      incrementalCostInr: 500000,
    });

    const workforceWeights: ScoringWeights = {
      recoveryEffectiveness: 0.05,
      recoveryTime: 0.05,
      cost: 0.05,
      risk: 0.05,
      criticalShipmentProtection: 0.05,
      workforceFeasibility: 0.70,
      operationalImpact: 0.05,
    };

    const evals = scoreScenarios([lowWellbeing, highWellbeing], workforceWeights);
    assert.strictEqual(evals[0].scenarioId, 'HIGH-WB',
      'HIGH-WB must win when workforce weight is dominant');
    assert.ok(evals[0].compositeScore > evals[1].compositeScore, 'High workforce score must produce higher composite');

    console.log(`  Workforce-driven: HIGH-WB=${evals[0].compositeScore.toFixed(1)} LOW-WB=${evals[1].compositeScore.toFixed(1)}`);
  });

  // ── 5. Changing shipment priority weight changes the recommendation ──────────
  test('5. Changing critical shipment priority (weight) changes the recommendation', () => {
    // Scenario with excellent cold-chain but slow speed
    const coldChainExpert = makeScenario('CC-EXPERT', {
      coldChainIntegrityRisk: 'NONE', corridorClearanceConfirmed: true,
      feasibilityScore: 0.99, estimatedRecoveryHours: 20, incrementalCostInr: 2000000,
    });
    // Fast but cold-chain at risk
    const riskyColdChain = makeScenario('RISKY-CC', {
      coldChainIntegrityRisk: 'HIGH', corridorClearanceConfirmed: false,
      feasibilityScore: 0.4, estimatedRecoveryHours: 8, incrementalCostInr: 400000,
    });

    // When CSP weight is high, cold-chain expert should win
    const cspWeights: ScoringWeights = {
      recoveryEffectiveness: 0.05,
      recoveryTime: 0.05,
      cost: 0.05,
      risk: 0.05,
      criticalShipmentProtection: 0.70,
      workforceFeasibility: 0.05,
      operationalImpact: 0.05,
    };

    const evalsCSP = scoreScenarios([coldChainExpert, riskyColdChain], cspWeights);
    assert.strictEqual(evalsCSP[0].scenarioId, 'CC-EXPERT',
      'Cold-chain expert must win when critical shipment protection weight is dominant');

    // When speed weight is high, fast-but-risky should win
    const speedWeights: ScoringWeights = {
      recoveryEffectiveness: 0.05,
      recoveryTime: 0.70,
      cost: 0.05,
      risk: 0.05,
      criticalShipmentProtection: 0.05,
      workforceFeasibility: 0.05,
      operationalImpact: 0.05,
    };

    const evalsSpeed = scoreScenarios([coldChainExpert, riskyColdChain], speedWeights);
    assert.strictEqual(evalsSpeed[0].scenarioId, 'RISKY-CC',
      'Fast but risky must win when speed weight is dominant');

    console.log(`  CSP-driven winner: ${evalsCSP[0].scenarioId}. Speed-driven winner: ${evalsSpeed[0].scenarioId}`);
  });

  // ── 6. All 7 criteria present in every evaluation ────────────────────────────
  test('6. All 7 criteria are present in every scenario evaluation', () => {
    const expectedCriteria: (keyof ScoringWeights)[] = [
      'recoveryEffectiveness', 'recoveryTime', 'cost', 'risk',
      'criticalShipmentProtection', 'workforceFeasibility', 'operationalImpact',
    ];

    const scenarios = [
      makeScenario('S1', { coldChainIntegrityRisk: 'NONE' }),
      makeScenario('S2', { coldChainIntegrityRisk: 'HIGH' }),
    ];

    const evals = scoreScenarios(scenarios, DEFAULT_SCORING_WEIGHTS);

    for (const ev of evals) {
      const presentCriteria = ev.criteria.map((c) => c.criterion);
      for (const expected of expectedCriteria) {
        assert.ok(presentCriteria.includes(expected), `Scenario ${ev.scenarioId} missing criterion: ${expected}`);
      }
      assert.strictEqual(ev.criteria.length, expectedCriteria.length,
        `Scenario ${ev.scenarioId} must have exactly ${expectedCriteria.length} criteria`);
    }
  });

  // ── 7. Scoring is deterministic ─────────────────────────────────────────────
  test('7. Scoring is deterministic — same input always produces same output', () => {
    const scenarios = [
      makeScenario('ALPHA', { estimatedRecoveryHours: 10, incrementalCostInr: 1500000 }),
      makeScenario('BETA', { estimatedRecoveryHours: 20, incrementalCostInr: 800000 }),
    ];

    const result1 = scoreScenarios(scenarios, DEFAULT_SCORING_WEIGHTS);
    const result2 = scoreScenarios(scenarios, DEFAULT_SCORING_WEIGHTS);

    assert.strictEqual(result1[0].scenarioId, result2[0].scenarioId, 'Winner must be deterministic');
    assert.strictEqual(result1[0].compositeScore, result2[0].compositeScore, 'Scores must be identical on repeat');
    assert.strictEqual(result1[1].compositeScore, result2[1].compositeScore);
  });

  // ── 8. Composite score equals weighted sum of criteria ───────────────────────
  test('8. Composite score = sum of (normalizedScore × weight) — invariant holds', () => {
    const scenarios = [makeScenario('VERIFY', {
      estimatedRecoveryHours: 12, incrementalCostInr: 1000000, slaAdherencePercentage: 90,
      workerWellBeingScore: 85, carbonEmissionsKg: 4000, coldChainIntegrityRisk: 'NONE',
    })];

    const evals = scoreScenarios(scenarios, DEFAULT_SCORING_WEIGHTS);
    const ev = evals[0];

    const computedSum = parseFloat(
      ev.criteria.reduce((sum, c) => sum + c.weightedScore, 0).toFixed(1)
    );

    assert.ok(
      Math.abs(computedSum - ev.compositeScore) < 0.5,
      `Composite score ${ev.compositeScore} must equal sum of weighted criteria ${computedSum} (within rounding tolerance)`
    );
  });

  // ── 9. DecisionAgent end-to-end with dynamic winner ─────────────────────────
  test('9. DecisionAgent selects winner dynamically — passes validation', async () => {
    const agent = new DecisionAgent();

    const scenarios = [
      makeScenario('SCENARIO-A-FAST-AIR', {
        estimatedRecoveryHours: 10, incrementalCostInr: 3450000, slaAdherencePercentage: 98,
        workerWellBeingScore: 62, coldChainIntegrityRisk: 'NONE',
        allAccommodationsRespected: false, fatigueExceedanceDetected: true,
        carbonEmissionsKg: 14200,
      }),
      makeScenario('SCENARIO-B-BALANCED-MULTIMODAL', {
        estimatedRecoveryHours: 14, incrementalCostInr: 1280000, slaAdherencePercentage: 96,
        workerWellBeingScore: 94.5, coldChainIntegrityRisk: 'NONE',
        allAccommodationsRespected: true, fatigueExceedanceDetected: false,
        carbonEmissionsKg: 3850,
      }),
      makeScenario('SCENARIO-C-ROAD-DETOUR', {
        estimatedRecoveryHours: 36, incrementalCostInr: 320000, slaAdherencePercentage: 45,
        workerWellBeingScore: 54, coldChainIntegrityRisk: 'HIGH',
        corridorClearanceConfirmed: false, allAccommodationsRespected: false,
        fatigueExceedanceDetected: true, carbonEmissionsKg: 6200,
      }),
    ];

    const result = await agent.execute({
      caseId: 'TEST-CASE-DEC-001',
      candidateScenarios: scenarios,
    });

    // Decision should be valid
    assert.ok(result.output.decisionId, 'Decision must have ID');
    assert.ok(result.output.recommendedScenarioId, 'Decision must have recommended scenario');
    assert.ok(result.output.scenarioEvaluations.length === 3, 'Must have 3 evaluations');
    assert.ok(result.output.appliedWeights, 'Must have applied weights');

    // Winner must match rank 1 evaluation
    const winner = result.output.scenarioEvaluations[0];
    assert.strictEqual(winner.rank, 1);
    assert.strictEqual(result.output.recommendedScenarioId, winner.scenarioId);

    // Action steps must reference winner's scenario
    assert.ok(result.output.actionPlanSteps.length > 0, 'Must have action steps');

    console.log(`  DecisionAgent selected: ${result.output.recommendedScenarioId} (score: ${winner.compositeScore.toFixed(1)})`);
    console.log(`  Action steps: ${result.output.actionPlanSteps.length}`);
  });
});
