/**
 * Automated Test Suite: SAP Sentinel Multi-Agent Pipeline & Governance
 * 
 * Verifies:
 * 1. Successful 5-agent pipeline execution in sequence
 * 2. Non-destructive agent failure handling
 * 3. Deterministic retry from failed step
 * 4. Runtime schema validation
 * 5. Protection against invalid agent output
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PipelineOrchestrator } from '../services/orchestrator.js';
import { 
  validateDisruptionOutput, 
  validateSupplyChainImpactOutput, 
  validateDecisionOutput,
  ValidationError
} from '../services/validation.js';
import { Case } from '../../shared/types/domain.js';

describe('SAP Sentinel Multi-Agent Pipeline Test Suite', () => {
  const orchestrator = new PipelineOrchestrator();

  test('1. Successful Pipeline Execution: Runs all 5 agents sequentially', async () => {
    const initialCase = orchestrator.createInitialCase('TEST-CASE-001');
    assert.strictEqual(initialCase.status, 'DETECTED');
    assert.strictEqual(initialCase.agentHistory.totalExecutions, 0);

    const executedSteps: string[] = [];

    const finalCase = await orchestrator.executePipeline(
      initialCase,
      { stepDelayMs: 10 },
      (update) => {
        if (update.status === 'COMPLETED') {
          executedSteps.push(update.agentName);
        }
      }
    );

    // Verify all 5 steps executed in correct sequence
    assert.deepStrictEqual(executedSteps, [
      'Disruption Agent',
      'Supply Chain Impact Agent',
      'Workforce Agent',
      'Recovery Adaptation Agent',
      'Decision Agent',
    ]);

    // Verify Case status & sections populated
    assert.strictEqual(finalCase.status, 'DECISION_PENDING');
    assert.ok(finalCase.disruption, 'Disruption section should be populated');
    assert.ok(finalCase.supplyChainImpact, 'SupplyChainImpact section should be populated');
    assert.ok(finalCase.workforceImpact, 'WorkforceImpact section should be populated');
    assert.ok(finalCase.candidateScenarios && finalCase.candidateScenarios.length === 3, '3 candidate scenarios should be generated');
    assert.ok(finalCase.decision, 'Decision section should be populated');

    // Verify append-only history ledger
    assert.strictEqual(finalCase.agentHistory.totalExecutions, 5);
    assert.strictEqual(finalCase.agentHistory.historyLedger.length, 5);
    for (const exec of finalCase.agentHistory.historyLedger) {
      assert.strictEqual(exec.executionStatus, 'COMPLETED');
      assert.ok(exec.confidence >= 0.9, 'Confidence should be high');
      assert.ok(exec.evidence.length > 0, 'Evidence must be attached');
      assert.ok(exec.assumptions.length > 0, 'Assumptions must be stated');
    }
  });

  test('2. Agent Failure Handling: Non-destructive failure isolation', async () => {
    const initialCase = orchestrator.createInitialCase('TEST-CASE-FAIL-002');

    let errorCaught = false;
    let partialCase: Case | null = null;

    try {
      await orchestrator.executePipeline(
        initialCase,
        {
          stepDelayMs: 5,
          injectedFaults: {
            'Workforce Agent': 'Simulated SuccessFactors adapter network timeout',
          },
        },
        (update, currentCase) => {
          if (update.status === 'FAILED') {
            partialCase = currentCase;
          }
        }
      );
    } catch (err: unknown) {
      errorCaught = true;
      assert.ok(err instanceof Error && err.message.includes('Workforce Agent'));
    }

    assert.strictEqual(errorCaught, true, 'Pipeline must throw error on agent failure');
    assert.ok(partialCase, 'Partial case must be captured');

    // Verify prior steps were NOT corrupted
    const pc = partialCase as unknown as Case;
    assert.ok(pc.disruption, 'Disruption Agent output must remain intact');
    assert.ok(pc.supplyChainImpact, 'Supply Chain Impact output must remain intact');
    assert.strictEqual(pc.workforceImpact, undefined, 'Failed agent section must not contain corrupted data');

    // Verify failure record appended to ledger
    const ledger = pc.agentHistory.historyLedger;
    assert.strictEqual(ledger.length, 3); // 2 success + 1 failure
    assert.strictEqual(ledger[0].executionStatus, 'COMPLETED');
    assert.strictEqual(ledger[1].executionStatus, 'COMPLETED');
    assert.strictEqual(ledger[2].executionStatus, 'FAILED');
    assert.strictEqual(ledger[2].agentName, 'Workforce Agent');
  });

  test('3. Pipeline Retry: Resumes from failed step without re-executing completed ones', async () => {
    // Start with a failed partial case at step 3
    const initialCase = orchestrator.createInitialCase('TEST-CASE-RETRY-003');
    let failedCase: Case;

    try {
      await orchestrator.executePipeline(
        initialCase,
        {
          stepDelayMs: 5,
          injectedFaults: { 'Workforce Agent': 'Transient Error' },
        }
      );
      assert.fail('Should have failed');
    } catch {
      // Create a case with completed steps 1 & 2
      const step1 = await orchestrator.executeStep(initialCase, 'Disruption Agent');
      failedCase = await orchestrator.executeStep(step1, 'Supply Chain Impact Agent');
    }

    const reExecutedSteps: string[] = [];

    // Retry without fault injection
    const recoveredCase = await orchestrator.retryPipeline(
      failedCase,
      { stepDelayMs: 5 },
      (update) => {
        if (update.status === 'RUNNING') {
          reExecutedSteps.push(update.agentName);
        }
      }
    );

    // Verify it only ran steps 3, 4, 5
    assert.deepStrictEqual(reExecutedSteps, [
      'Workforce Agent',
      'Recovery Adaptation Agent',
      'Decision Agent',
    ]);

    assert.strictEqual(recoveredCase.status, 'DECISION_PENDING');
    assert.ok(recoveredCase.decision, 'Decision must be present after retry');
  });

  test('4. Runtime Schema Validation: Validates strict domain constraints', () => {
    // Valid Disruption
    const validDisruption = {
      disruptionId: 'DISRUPT-001',
      category: 'LANDSLIDE',
      severity: 'CRITICAL',
      headline: 'Mudslide on NH-27',
      description: 'Severe blockage',
      location: { name: 'Dima Hasao', region: 'Assam', latitude: 25.12, longitude: 92.98 },
      affectedCorridor: 'NH-27',
      reportedAt: new Date().toISOString(),
      estimatedBlockedDurationHours: 84,
      isCriticalLifelineRoute: true,
      weatherDetails: { rainfallMmLast24Hours: 240, forecastCondition: 'Monsoon', warningLevel: 'RED' },
    };
    assert.doesNotThrow(() => validateDisruptionOutput(validDisruption));

    // Invalid Category
    assert.throws(
      () => validateDisruptionOutput({ ...validDisruption, category: 'INVALID_CATEGORY' }),
      ValidationError
    );

    // Invalid Severity
    assert.throws(
      () => validateDisruptionOutput({ ...validDisruption, severity: 'SUPER_CRITICAL' }),
      ValidationError
    );
  });

  test('5. Protection against Invalid Agent Output: Rejects corrupted payloads', () => {
    // Invalid Supply Chain Impact (empty POs)
    assert.throws(
      () => validateSupplyChainImpactOutput({
        impactId: 'SCI-01',
        impactedPOs: [],
        impactedMaterials: [],
        estimatedTotalValueAtRiskInr: -500,
      }),
      ValidationError
    );

    // Invalid Decision (recommends non-existent scenario)
    assert.throws(
      () => validateDecisionOutput(
        {
          decisionId: 'DEC-01',
          recommendedScenarioId: 'NON_EXISTENT_SCENARIO_Z',
          justification: { primaryReason: 'None' },
          actionPlanSteps: [{ stepNumber: 1, title: 'Step 1' }],
        },
        [
          { scenarioId: 'SCENARIO-A', scenarioName: 'A', tier: 'SCENARIO_A_FASTEST_AIRLIFT', summary: '', recoveryOptions: [], tradeOffs: { estimatedRecoveryHours: 1, incrementalCostInr: 1, slaAdherencePercentage: 1, workerWellBeingScore: 1, carbonEmissionsKg: 1, coldChainIntegrityRisk: 'NONE' }, workforceSafetyAssessment: { maxShiftHours: 8, fatigueExceedanceDetected: false, allAccommodationsRespected: true, burnoutRiskCategory: 'LOW' }, logisticsFeasibility: { corridorClearanceConfirmed: true, coldChainSafeguardProtocol: '' } },
        ]
      ),
      ValidationError
    );
  });
});
