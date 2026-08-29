/**
 * Automated Test Suite: Phase 6 — Transparent Agent Trail & Decision Trace
 * 
 * Verifies:
 * 1. Zero raw chain-of-thought exposure in any agent execution payload.
 * 2. Complete auditable trace lineage (each execution references upstream executions/entities).
 * 3. All 5 agents provide structured findings, evidence, assumptions, confidence, and inputs.
 * 4. Decision Agent outputs scenarios considered, score breakdown, constraints, trade-offs, and impact.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PipelineOrchestrator } from '../services/orchestrator.js';

describe('Phase 6: Transparent Agent Trail & Decision Trace Tests', () => {
  const orchestrator = new PipelineOrchestrator();

  test('1. Full 5-Agent Trail contains all required audit fields with valid data', async () => {
    const initialCase = orchestrator.createInitialCase('TEST-CASE-TRAIL-001');
    const finalCase = await orchestrator.executePipeline(initialCase, { stepDelayMs: 5 });

    const ledger = finalCase.agentHistory.historyLedger;
    assert.strictEqual(ledger.length, 5, 'Must contain 5 execution records');

    const expectedAgents = [
      'Disruption Agent',
      'Supply Chain Impact Agent',
      'Workforce Agent',
      'Recovery Adaptation Agent',
      'Decision Agent',
    ];

    for (let i = 0; i < ledger.length; i++) {
      const exec = ledger[i];
      assert.strictEqual(exec.agentName, expectedAgents[i]);
      assert.strictEqual(exec.executionStatus, 'COMPLETED');
      assert.ok(exec.timestamp, 'Timestamp must be present');
      assert.ok(exec.humanReadableSummary && exec.humanReadableSummary.length > 20, 'Summary must be substantive');
      assert.ok(exec.confidence >= 0.0 && exec.confidence <= 1.0, 'Confidence must be between 0.0 and 1.0');
      assert.ok(exec.evidence.length > 0, 'Must have at least one evidence item');
      assert.ok(exec.assumptions.length > 0, 'Must have at least one assumption');
      assert.ok(exec.inputReference, 'Input reference must be present');
      assert.ok(exec.inputReference.caseId, 'Case ID must be referenced');
      assert.ok(exec.structuredOutput, 'Structured output must be present');
      assert.ok(exec.structuredOutput.payload, 'Structured payload must be populated');
    }
  });

  test('2. Zero Private Chain-of-Thought / Internal Deliberation Exposure', async () => {
    const initialCase = orchestrator.createInitialCase('TEST-CASE-TRAIL-COT');
    const finalCase = await orchestrator.executePipeline(initialCase, { stepDelayMs: 5 });

    const forbiddenSubstrings = [
      'thought:',
      'thinking:',
      '<thought>',
      'chain_of_thought',
      'private reasoning',
      'internal prompt',
      'system prompt',
      'hidden deliberation',
    ];

    const jsonString = JSON.stringify(finalCase.agentHistory.historyLedger).toLowerCase();

    for (const forbidden of forbiddenSubstrings) {
      assert.strictEqual(
        jsonString.includes(forbidden),
        false,
        `Audit trail must not contain raw internal deliberation token: "${forbidden}"`
      );
    }
  });

  test('3. Decision Trace Lineage connects all upstream steps sequentially', async () => {
    const initialCase = orchestrator.createInitialCase('TEST-CASE-LINEAGE');
    const finalCase = await orchestrator.executePipeline(initialCase, { stepDelayMs: 5 });

    const ledger = finalCase.agentHistory.historyLedger;

    // Disruption Agent (step 1) has no preceding executions
    assert.strictEqual(ledger[0].inputReference.referencedExecutionIds.length, 0);

    // Supply Chain Impact Agent (step 2) references step 1
    assert.strictEqual(ledger[1].inputReference.referencedExecutionIds.length, 1);
    assert.strictEqual(ledger[1].inputReference.referencedExecutionIds[0], ledger[0].executionId);

    // Workforce Agent (step 3) references step 1 & 2
    assert.strictEqual(ledger[2].inputReference.referencedExecutionIds.length, 2);

    // Recovery Adaptation Agent (step 4) references prior 3 steps
    assert.strictEqual(ledger[3].inputReference.referencedExecutionIds.length, 3);

    // Decision Agent (step 5) references all 4 prior steps
    assert.strictEqual(ledger[4].inputReference.referencedExecutionIds.length, 4);
    assert.deepStrictEqual(
      ledger[4].inputReference.referencedExecutionIds,
      [ledger[0].executionId, ledger[1].executionId, ledger[2].executionId, ledger[3].executionId]
    );
  });

  test('4. Decision Agent structured output contains comprehensive business trade-offs and score breakdown', async () => {
    const initialCase = orchestrator.createInitialCase('TEST-CASE-DECISION-TRAIL');
    const finalCase = await orchestrator.executePipeline(initialCase, { stepDelayMs: 5 });

    const decisionExec = finalCase.agentHistory.historyLedger.find((e) => e.agentName === 'Decision Agent')!;
    assert.strictEqual(decisionExec.structuredOutput.type, 'Decision');

    const decisionPayload = decisionExec.structuredOutput.payload as any;

    // Scenarios considered
    assert.ok(decisionPayload.scenarioEvaluations, 'Must have scenario evaluations');
    assert.strictEqual(decisionPayload.scenarioEvaluations.length, 3, 'Must evaluate 3 candidate scenarios');

    // Score breakdown on winner
    const winnerEval = decisionPayload.scenarioEvaluations[0];
    assert.strictEqual(winnerEval.rank, 1);
    assert.ok(winnerEval.compositeScore > 0, 'Composite score must be positive');
    assert.strictEqual(winnerEval.criteria.length, 7, 'Must have 7 evaluation criteria');

    // Trade-offs & Justification
    assert.ok(decisionPayload.justification.primaryReason, 'Must have primary reason');
    assert.ok(decisionPayload.justification.clinicalAndFoodUrgencyEvaluation, 'Must have clinical evaluation');
    assert.ok(decisionPayload.justification.workforceInclusionAndSafetyEvaluation, 'Must have workforce evaluation');
    assert.ok(decisionPayload.justification.costVsLifeSavingTradeOffRationale, 'Must have cost vs life saving rationale');

    // Action plan steps
    assert.ok(decisionPayload.actionPlanSteps.length > 0, 'Must have action plan steps');
    for (const step of decisionPayload.actionPlanSteps) {
      assert.ok(step.stepNumber > 0);
      assert.ok(step.title);
      assert.ok(step.targetSapSystem);
      assert.ok(step.payloadAction);
    }
  });
});
