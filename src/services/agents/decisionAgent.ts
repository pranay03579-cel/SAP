/**
 * SAP Sentinel — Decision Agent (Phase 5)
 *
 * Consumes: All five upstream agent outputs (via context)
 * Produces: Decision with transparent, algorithmic scenario evaluation
 *
 * Architecture Invariants:
 * - The recommended scenario is COMPUTED, never hardcoded.
 * - Changing input data (costs, recovery times, workforce) changes the recommendation.
 * - No chain-of-thought is exposed; only structured business explanations.
 * - Scoring weights are configurable and auditable.
 *
 * Future extension: Accept custom ScoringWeights from the operator via the
 * HITL approval panel to allow weight overrides based on business priorities.
 */

import { IAgent, AgentResult } from './interfaces.js';
import {
  Decision,
  RecoveryScenario,
  AgentName,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  ScenarioEvaluation,
} from '../../../shared/types/domain.js';
import { validateDecisionOutput } from '../validation.js';
import { scoreScenarios } from './scoringEngine.js';

export interface DecisionInputContext {
  caseId: string;
  candidateScenarios: RecoveryScenario[];
  /** Optional: override default scoring weights for scenario-specific priorities */
  scoringWeights?: ScoringWeights;
}

export class DecisionAgent implements IAgent<DecisionInputContext, Decision> {
  readonly name: AgentName = 'Decision Agent';

  async execute(context: DecisionInputContext): Promise<AgentResult<Decision>> {
    const { caseId, candidateScenarios, scoringWeights = DEFAULT_SCORING_WEIGHTS } = context;

    if (candidateScenarios.length === 0) {
      throw new Error('DecisionAgent requires at least one candidate scenario');
    }

    // ── Step 1: Score all scenarios via the multi-criteria engine ───────────
    const evaluations: ScenarioEvaluation[] = scoreScenarios(candidateScenarios, scoringWeights);

    // ── Step 2: Winner is rank 1 (highest composite score) ─────────────────
    const winner = evaluations[0];
    const winnerScenario = candidateScenarios.find((s) => s.scenarioId === winner.scenarioId)!;

    // ── Step 3: Build structured justification from winner's criteria ────────
    const recoveryEffScore = winner.criteria.find((c) => c.criterion === 'recoveryEffectiveness');
    const timeScore = winner.criteria.find((c) => c.criterion === 'recoveryTime');
    const costScore = winner.criteria.find((c) => c.criterion === 'cost');
    const wfScore = winner.criteria.find((c) => c.criterion === 'workforceFeasibility');

    const runnerUp = evaluations[1];
    const costDiffLakhs = runnerUp
      ? Math.abs(winnerScenario.tradeOffs.incrementalCostInr - (candidateScenarios.find((s) => s.scenarioId === runnerUp.scenarioId)?.tradeOffs.incrementalCostInr ?? 0)) / 100000
      : 0;

    const primaryReason =
      `${winner.scenarioName} achieves the highest composite score of ${winner.compositeScore.toFixed(1)}/100 ` +
      `across ${evaluations[0].criteria.length} evaluation criteria. ` +
      (runnerUp
        ? `It outperforms the next alternative (${runnerUp.scenarioName}, score: ${runnerUp.compositeScore.toFixed(1)}) ` +
          `by ${(winner.compositeScore - runnerUp.compositeScore).toFixed(1)} points.`
        : '');

    const clinicalEval =
      `SLA adherence: ${winnerScenario.tradeOffs.slaAdherencePercentage}% — ` +
      (recoveryEffScore ? `recovery effectiveness score: ${recoveryEffScore.normalizedScore.toFixed(0)}/100. ` : '') +
      `Recovery time of ${winnerScenario.tradeOffs.estimatedRecoveryHours} hours ` +
      (timeScore ? `scores ${timeScore.normalizedScore.toFixed(0)}/100 on speed. ` : '') +
      `Cold-chain integrity risk: ${winnerScenario.tradeOffs.coldChainIntegrityRisk}.`;

    const workforceEval =
      `Worker well-being: ${winnerScenario.tradeOffs.workerWellBeingScore}/100. ` +
      (wfScore ? `Workforce feasibility score: ${wfScore.normalizedScore.toFixed(0)}/100. ` : '') +
      `All inclusive accommodations respected: ${winnerScenario.workforceSafetyAssessment.allAccommodationsRespected ? 'Yes' : 'No'}. ` +
      `Fatigue limits exceeded: ${winnerScenario.workforceSafetyAssessment.fatigueExceedanceDetected ? 'Yes — risk identified' : 'No'}.`;

    const costRationale =
      `Incremental cost: ₹${(winnerScenario.tradeOffs.incrementalCostInr / 100000).toFixed(1)} Lakhs ` +
      (costScore ? `(cost efficiency score: ${costScore.normalizedScore.toFixed(0)}/100). ` : '') +
      (runnerUp && costDiffLakhs > 0
        ? `₹${costDiffLakhs.toFixed(1)}L difference vs next alternative. `
        : '') +
      `Carbon footprint: ${winnerScenario.tradeOffs.carbonEmissionsKg.toLocaleString()} kg CO₂.`;

    // ── Step 4: Build backward-compatible comparative matrix ─────────────────
    const comparativeMatrix = evaluations.map((ev) => {
      const scenario = candidateScenarios.find((s) => s.scenarioId === ev.scenarioId)!;
      return {
        scenarioId: ev.scenarioId,
        rank: ev.rank,
        compositeScore: ev.compositeScore,
        costInr: scenario.tradeOffs.incrementalCostInr,
        recoveryTimeHours: scenario.tradeOffs.estimatedRecoveryHours,
        workerWellBeingScore: scenario.tradeOffs.workerWellBeingScore,
        esgCarbonKg: scenario.tradeOffs.carbonEmissionsKg,
      };
    });

    // ── Step 5: Build action plan from winning scenario's recovery options ────
    const actionPlanSteps = winnerScenario.recoveryOptions.flatMap((opt, optIdx) =>
      [
        {
          stepNumber: optIdx * 2 + 1,
          title: `Activate: ${opt.name}`,
          actionOwner: 'Logistics Dispatch Lead',
          targetSapSystem: 'SAP_S4HANA' as const,
          payloadAction: `Route ${opt.targetPurchaseOrders.join(', ')} via ${opt.modality}. Path: ${opt.alternativeRoutePath.join(' → ')}`,
        },
        ...(opt.assignedWorkers.length > 0
          ? [{
              stepNumber: optIdx * 2 + 2,
              title: `Commit Workforce Roster for ${opt.name}`,
              actionOwner: 'HR / Plant Operations Supervisor',
              targetSapSystem: 'SAP_SUCCESSFACTORS' as const,
              payloadAction: `Assign workers: ${opt.assignedWorkers.map((w) => w.workerId).join(', ')} with accommodations: ${opt.assignedWorkers.flatMap((w) => w.appliedAccommodations).join('; ')}`,
            }]
          : []),
      ]
    );

    // Ensure at least one action step
    if (actionPlanSteps.length === 0) {
      actionPlanSteps.push({
        stepNumber: 1,
        title: `Execute ${winnerScenario.scenarioName}`,
        actionOwner: 'Operations Controller',
        targetSapSystem: 'SAP_S4HANA' as const,
        payloadAction: `Activate recovery plan ${winnerScenario.scenarioId}`,
      });
    }

    const output: Decision = {
      decisionId: `DEC-NER-${Date.now().toString().slice(-6)}`,
      caseId,
      recommendedScenarioId: winner.scenarioId,
      recommendedScenarioName: winner.scenarioName,
      scenarioEvaluations: evaluations,
      appliedWeights: scoringWeights,
      justification: {
        primaryReason,
        clinicalAndFoodUrgencyEvaluation: clinicalEval,
        workforceInclusionAndSafetyEvaluation: workforceEval,
        costVsLifeSavingTradeOffRationale: costRationale,
      },
      comparativeMatrix,
      actionPlanSteps: actionPlanSteps.map((s, i) => ({ ...s, stepNumber: i + 1 })),
    };

    const validated = validateDecisionOutput(output, candidateScenarios);

    return {
      output: validated,
      confidence: parseFloat((0.85 + (winner.compositeScore - (runnerUp?.compositeScore ?? 0)) / 200).toFixed(2)),
      assumptions: [
        `Scoring weights applied: ${Object.entries(scoringWeights).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
        `Composite score is deterministic and reproducible from the scenario data above.`,
        `Winner selection is based purely on computed scores — no scenario is hardcoded as the recommendation.`,
        `All candidate scenarios were generated by the Recovery Adaptation Agent from verified transport capacity data.`,
      ],
      evidence: [
        {
          evidenceId: `EV-SCORE-${Date.now()}`,
          sourceType: 'SAP_S4HANA' as const,
          sourceReference: 'MULTI-CRITERIA-SCORING-ENGINE-v2',
          description: `7-criterion weighted scoring engine evaluated ${candidateScenarios.length} scenarios. Winner: ${winner.scenarioId} with composite score ${winner.compositeScore.toFixed(1)}/100.`,
          observedAt: new Date().toISOString(),
          payloadSnippet: {
            winner: winner.scenarioId,
            compositeScore: winner.compositeScore,
            criteriaCount: winner.criteria.length,
            appliedWeights: scoringWeights,
          },
        },
        ...evaluations.map((ev) => ({
          evidenceId: `EV-EVAL-${ev.scenarioId}-${Date.now()}`,
          sourceType: 'SAP_S4HANA' as const,
          sourceReference: ev.scenarioId,
          description: `Scenario evaluation: ${ev.scenarioName}. Composite: ${ev.compositeScore.toFixed(1)}/100. Rank: ${ev.rank}.`,
          observedAt: new Date().toISOString(),
          payloadSnippet: {
            scenarioId: ev.scenarioId,
            rank: ev.rank,
            compositeScore: ev.compositeScore,
            risks: ev.risks,
          },
        })),
      ],
      humanReadableSummary:
        `Recommended ${winner.scenarioName} (composite score: ${winner.compositeScore.toFixed(1)}/100, rank #1 of ${evaluations.length}). ` +
        winner.tradeOffSummary,
    };
  }
}
