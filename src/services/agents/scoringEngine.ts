/**
 * SAP Sentinel — Multi-Criteria Decision Scoring Engine
 *
 * Implements deterministic, transparent, weighted scoring across 7 evaluation criteria.
 *
 * Architecture Invariant:
 *   The winner is ALWAYS computed from scenario data. No scenario is hardcoded as the winner.
 *   Changing weights (ScoringWeights) or scenario data changes the recommendation.
 *
 * Scoring Design:
 *   - Each criterion is normalized to a 0–100 scale (higher = better always).
 *   - Criteria where lower raw values are better (cost, recovery time, carbon) are inverted.
 *   - Normalization uses min-max across the candidate pool — scores are relative to each other.
 *   - Composite score = Σ (normalizedScore × weight) × 100
 *
 * No chain-of-thought is exposed. Rationales are structured business statements.
 */

import {
  RecoveryScenario,
  ScoringWeights,
  ScoreCriterion,
  ScenarioEvaluation,
  DEFAULT_SCORING_WEIGHTS,
} from '../../../shared/types/domain.js';

// ─────────────────────────────────────────────────────────────────────────────
// Normalization helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Normalize a value where HIGHER raw value = BETTER score */
function normalizeHigherIsBetter(value: number, min: number, max: number): number {
  if (max === min) return 75; // All tied → neutral score
  return Math.round(((value - min) / (max - min)) * 100 * 10) / 10;
}

/** Normalize a value where LOWER raw value = BETTER score (inverted) */
function normalizeLowerIsBetter(value: number, min: number, max: number): number {
  if (max === min) return 75;
  return Math.round(((max - value) / (max - min)) * 100 * 10) / 10;
}

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

// ─────────────────────────────────────────────────────────────────────────────
// Cold chain risk → numeric (higher risk = lower score)
// ─────────────────────────────────────────────────────────────────────────────
function coldChainRiskScore(risk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'): number {
  return { NONE: 100, LOW: 75, MEDIUM: 40, HIGH: 10 }[risk];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main scoring function
// ─────────────────────────────────────────────────────────────────────────────

export function scoreScenarios(
  scenarios: RecoveryScenario[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): ScenarioEvaluation[] {
  if (scenarios.length === 0) return [];

  // Extract raw values for each criterion across all scenarios
  const slaValues = scenarios.map((s) => s.tradeOffs.slaAdherencePercentage);
  const timeValues = scenarios.map((s) => s.tradeOffs.estimatedRecoveryHours);
  const costValues = scenarios.map((s) => s.tradeOffs.incrementalCostInr);
  const wellBeingValues = scenarios.map((s) => s.tradeOffs.workerWellBeingScore);
  const carbonValues = scenarios.map((s) => s.tradeOffs.carbonEmissionsKg);

  const minSla = Math.min(...slaValues), maxSla = Math.max(...slaValues);
  const minTime = Math.min(...timeValues), maxTime = Math.max(...timeValues);
  const minCost = Math.min(...costValues), maxCost = Math.max(...costValues);
  const minWell = Math.min(...wellBeingValues), maxWell = Math.max(...wellBeingValues);
  const minCarbon = Math.min(...carbonValues), maxCarbon = Math.max(...carbonValues);

  const evaluations: ScenarioEvaluation[] = scenarios.map((s) => {
    const to = s.tradeOffs;
    const wsa = s.workforceSafetyAssessment;
    const lf = s.logisticsFeasibility;

    // ── 1. Recovery Effectiveness ── SLA adherence (higher is better)
    const slaScore = normalizeHigherIsBetter(to.slaAdherencePercentage, minSla, maxSla);
    const criterion1: ScoreCriterion = {
      criterion: 'recoveryEffectiveness',
      label: 'Recovery Effectiveness',
      rawValue: `${to.slaAdherencePercentage}% SLA`,
      normalizedScore: clamp(slaScore),
      weight: weights.recoveryEffectiveness,
      weightedScore: clamp(slaScore) * weights.recoveryEffectiveness,
      rationale: `Scenario achieves ${to.slaAdherencePercentage}% SLA adherence. Higher SLA means more shipments delivered on time.`,
    };

    // ── 2. Recovery Time ── lower hours = better
    const timeScore = normalizeLowerIsBetter(to.estimatedRecoveryHours, minTime, maxTime);
    const criterion2: ScoreCriterion = {
      criterion: 'recoveryTime',
      label: 'Recovery Time',
      rawValue: `${to.estimatedRecoveryHours} hours`,
      normalizedScore: clamp(timeScore),
      weight: weights.recoveryTime,
      weightedScore: clamp(timeScore) * weights.recoveryTime,
      rationale: `Recovers operations in ${to.estimatedRecoveryHours} hours. Faster recovery prevents extended stockouts and SLA penalties.`,
    };

    // ── 3. Cost ── lower cost = better
    const costScore = normalizeLowerIsBetter(to.incrementalCostInr, minCost, maxCost);
    const costLakhs = (to.incrementalCostInr / 100000).toFixed(1);
    const criterion3: ScoreCriterion = {
      criterion: 'cost',
      label: 'Incremental Cost',
      rawValue: `₹${costLakhs} Lakhs`,
      normalizedScore: clamp(costScore),
      weight: weights.cost,
      weightedScore: clamp(costScore) * weights.cost,
      rationale: `Incremental logistics cost of ₹${costLakhs}L. Relative to alternatives, ${costScore >= 70 ? 'cost-efficient' : 'premium cost'}.`,
    };

    // ── 4. Risk ── cold chain integrity + corridor clearance
    const coldChain = coldChainRiskScore(to.coldChainIntegrityRisk);
    const clearance = lf.corridorClearanceConfirmed ? 100 : 30;
    const riskScore = (coldChain * 0.65 + clearance * 0.35);
    const criterion4: ScoreCriterion = {
      criterion: 'risk',
      label: 'Operational Risk',
      rawValue: `Cold-chain: ${to.coldChainIntegrityRisk} | Corridor: ${lf.corridorClearanceConfirmed ? 'Confirmed' : 'Unconfirmed'}`,
      normalizedScore: clamp(riskScore),
      weight: weights.risk,
      weightedScore: clamp(riskScore) * weights.risk,
      rationale: `Cold-chain risk is ${to.coldChainIntegrityRisk.toLowerCase()}. Corridor clearance is ${lf.corridorClearanceConfirmed ? 'confirmed' : 'unconfirmed — high execution risk'}.`,
    };

    // ── 5. Critical Shipment Protection ── cold-chain worker assignment + feasibility
    const hasColdChainWorker = s.recoveryOptions.some((opt) =>
      opt.assignedWorkers.length > 0 &&
      (opt.modality === 'AIR_CHARTER' || opt.modality === 'RAIL_FREIGHT')
    );
    const avgFeasibility = s.recoveryOptions.length > 0
      ? s.recoveryOptions.reduce((sum, o) => sum + o.feasibilityScore, 0) / s.recoveryOptions.length
      : 0.5;
    const cspScore = clamp(
      (avgFeasibility * 100 * 0.6) +
      (to.coldChainIntegrityRisk === 'NONE' ? 40 : to.coldChainIntegrityRisk === 'LOW' ? 25 : 5)
    );
    const criterion5: ScoreCriterion = {
      criterion: 'criticalShipmentProtection',
      label: 'Critical Shipment Protection',
      rawValue: `Feasibility: ${(avgFeasibility * 100).toFixed(0)}% | Cold-chain: ${to.coldChainIntegrityRisk}`,
      normalizedScore: cspScore,
      weight: weights.criticalShipmentProtection,
      weightedScore: cspScore * weights.criticalShipmentProtection,
      rationale: `Average option feasibility: ${(avgFeasibility * 100).toFixed(0)}%. ${hasColdChainWorker ? 'Qualified workers assigned for cold-chain handling.' : 'Cold-chain worker assignment not confirmed.'}`,
    };

    // ── 6. Workforce Feasibility ── well-being + accommodation compliance
    const wellScore = normalizeHigherIsBetter(to.workerWellBeingScore, minWell, maxWell);
    const accBonus = wsa.allAccommodationsRespected ? 15 : -20;
    const fatigueBonus = wsa.fatigueExceedanceDetected ? -15 : 10;
    const wfScore = clamp(wellScore + accBonus + fatigueBonus);
    const criterion6: ScoreCriterion = {
      criterion: 'workforceFeasibility',
      label: 'Workforce Feasibility',
      rawValue: `Well-being: ${to.workerWellBeingScore}/100 | Accommodations: ${wsa.allAccommodationsRespected ? 'Respected' : 'Breached'}`,
      normalizedScore: wfScore,
      weight: weights.workforceFeasibility,
      weightedScore: wfScore * weights.workforceFeasibility,
      rationale: `Worker well-being: ${to.workerWellBeingScore}/100. ${wsa.allAccommodationsRespected ? 'All inclusive accommodations are met.' : 'Ergonomic/neurodivergent accommodations are not fully respected.'} ${wsa.fatigueExceedanceDetected ? 'Fatigue limits exceeded.' : 'No fatigue exceedance.'}`,
    };

    // ── 7. Operational Impact ── ESG carbon (lower = better)
    const carbonScore = normalizeLowerIsBetter(to.carbonEmissionsKg, minCarbon, maxCarbon);
    const criterion7: ScoreCriterion = {
      criterion: 'operationalImpact',
      label: 'ESG / Carbon Footprint',
      rawValue: `${to.carbonEmissionsKg.toLocaleString()} kg CO₂`,
      normalizedScore: clamp(carbonScore),
      weight: weights.operationalImpact,
      weightedScore: clamp(carbonScore) * weights.operationalImpact,
      rationale: `Estimated ${to.carbonEmissionsKg.toLocaleString()} kg CO₂ emissions. ${carbonScore >= 70 ? 'Lower carbon footprint — ESG-preferred.' : 'Higher carbon due to air transport.'}`,
    };

    const criteria = [criterion1, criterion2, criterion3, criterion4, criterion5, criterion6, criterion7];
    const compositeScore = parseFloat(
      criteria.reduce((sum, c) => sum + c.weightedScore, 0).toFixed(1)
    );

    // Generate structured risks (no chain-of-thought)
    const risks: string[] = [];
    if (to.coldChainIntegrityRisk !== 'NONE') {
      risks.push(`Cold-chain integrity risk: ${to.coldChainIntegrityRisk}. Temperature-sensitive cargo may be compromised.`);
    }
    if (!lf.corridorClearanceConfirmed) {
      risks.push(`Logistics corridor clearance is unconfirmed. Convoy may face secondary blockage.`);
    }
    if (wsa.fatigueExceedanceDetected) {
      risks.push(`Worker fatigue limits exceeded (${wsa.maxShiftHours}h shifts). Risk of errors and secondary incidents.`);
    }
    if (!wsa.allAccommodationsRespected) {
      risks.push(`Inclusive workforce accommodations not fully respected. Risk of workplace safety breach.`);
    }
    if (to.estimatedRecoveryHours > 24) {
      risks.push(`Recovery time of ${to.estimatedRecoveryHours}h may exceed stockout deadline for critical medical supplies.`);
    }
    if (risks.length === 0) {
      risks.push('No critical execution risks identified. Standard monitoring protocols apply.');
    }

    const expectedImpact = `Estimated recovery in ${to.estimatedRecoveryHours} hours at ₹${(to.incrementalCostInr / 100000).toFixed(1)}L incremental cost. `
      + `SLA compliance: ${to.slaAdherencePercentage}%. `
      + `Worker well-being maintained at ${to.workerWellBeingScore}/100. `
      + `Carbon footprint: ${to.carbonEmissionsKg.toLocaleString()} kg CO₂.`;

    const tradeOffSummary = buildTradeOffSummary(s, compositeScore);

    return {
      scenarioId: s.scenarioId,
      scenarioName: s.scenarioName,
      compositeScore,
      rank: 0, // Assigned after sort
      criteria,
      tradeOffSummary,
      risks,
      expectedImpact,
      approvalRequired: true, // All recovery actions require HITL approval
    };
  });

  // Sort by compositeScore descending, assign ranks
  evaluations.sort((a, b) => b.compositeScore - a.compositeScore);
  evaluations.forEach((e, i) => {
    e.rank = i + 1;
  });

  return evaluations;
}

function buildTradeOffSummary(scenario: RecoveryScenario, score: number): string {
  const to = scenario.tradeOffs;
  const wsa = scenario.workforceSafetyAssessment;

  const speedLabel = to.estimatedRecoveryHours <= 10 ? 'fastest' : to.estimatedRecoveryHours <= 16 ? 'balanced' : 'slower';
  const costLabel = to.incrementalCostInr <= 500000 ? 'lowest cost' : to.incrementalCostInr <= 2000000 ? 'moderate cost' : 'premium cost';
  const inclusionLabel = wsa.allAccommodationsRespected && !wsa.fatigueExceedanceDetected ? 'fully inclusive' : 'partial accommodation compliance';

  return `Composite score: ${score.toFixed(1)}/100. `
    + `This is the ${speedLabel} option at ${costLabel} (₹${(to.incrementalCostInr / 100000).toFixed(1)}L). `
    + `Workforce approach is ${inclusionLabel}. `
    + `Cold-chain risk: ${to.coldChainIntegrityRisk}. `
    + `SLA adherence: ${to.slaAdherencePercentage}%.`;
}
