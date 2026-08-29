/**
 * SAP Sentinel — Runtime Domain Model Validation & Integrity Guards
 * Enforces strong invariants and protects the Blackboard against invalid agent outputs.
 */

import { 
  Disruption, 
  SupplyChainImpact, 
  WorkforceImpact, 
  RecoveryScenario, 
  Decision 
} from '../../shared/types/domain.js';

export class ValidationError extends Error {
  constructor(public agentName: string, message: string) {
    super(`[SchemaValidation: ${agentName}] ${message}`);
    this.name = 'ValidationError';
  }
}

export function validateDisruptionOutput(output: unknown): Disruption {
  if (!output || typeof output !== 'object') {
    throw new ValidationError('Disruption Agent', 'Output must be a non-null object');
  }
  const d = output as Partial<Disruption>;
  if (!d.disruptionId || typeof d.disruptionId !== 'string') {
    throw new ValidationError('Disruption Agent', 'Missing or invalid disruptionId');
  }
  if (!d.category || !['LANDSLIDE', 'FLASH_FLOOD', 'EXTREME_WEATHER', 'ROAD_COLLAPSE', 'PORT_STRIKE', 'SUPPLIER_INSOLVENCY', 'QUALITY_DEFECT'].includes(d.category)) {
    throw new ValidationError('Disruption Agent', `Invalid disruption category: ${d.category}`);
  }
  if (!d.severity || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(d.severity)) {
    throw new ValidationError('Disruption Agent', `Invalid severity level: ${d.severity}`);
  }
  if (!d.location || typeof d.location.latitude !== 'number' || typeof d.location.longitude !== 'number') {
    throw new ValidationError('Disruption Agent', 'Missing or invalid location geo coordinates');
  }
  if (typeof d.estimatedBlockedDurationHours !== 'number' || d.estimatedBlockedDurationHours <= 0) {
    throw new ValidationError('Disruption Agent', 'estimatedBlockedDurationHours must be a positive number');
  }
  return output as Disruption;
}

export function validateSupplyChainImpactOutput(output: unknown): SupplyChainImpact {
  if (!output || typeof output !== 'object') {
    throw new ValidationError('Supply Chain Impact Agent', 'Output must be a non-null object');
  }
  const s = output as Partial<SupplyChainImpact>;
  if (!s.impactId || typeof s.impactId !== 'string') {
    throw new ValidationError('Supply Chain Impact Agent', 'Missing or invalid impactId');
  }
  if (!Array.isArray(s.impactedPOs) || s.impactedPOs.length === 0) {
    throw new ValidationError('Supply Chain Impact Agent', 'impactedPOs must be a non-empty array');
  }
  if (!Array.isArray(s.impactedMaterials) || s.impactedMaterials.length === 0) {
    throw new ValidationError('Supply Chain Impact Agent', 'impactedMaterials must be a non-empty array');
  }
  if (typeof s.estimatedTotalValueAtRiskInr !== 'number' || s.estimatedTotalValueAtRiskInr < 0) {
    throw new ValidationError('Supply Chain Impact Agent', 'estimatedTotalValueAtRiskInr must be a non-negative number');
  }
  return output as SupplyChainImpact;
}

export function validateWorkforceImpactOutput(output: unknown): WorkforceImpact {
  if (!output || typeof output !== 'object') {
    throw new ValidationError('Workforce Agent', 'Output must be a non-null object');
  }
  const w = output as Partial<WorkforceImpact>;
  if (!w.workforceImpactId || typeof w.workforceImpactId !== 'string') {
    throw new ValidationError('Workforce Agent', 'Missing or invalid workforceImpactId');
  }
  if (typeof w.availableStaffCount !== 'number' || w.availableStaffCount < 0) {
    throw new ValidationError('Workforce Agent', 'availableStaffCount must be a non-negative integer');
  }
  if (!Array.isArray(w.workerProfiles) || w.workerProfiles.length === 0) {
    throw new ValidationError('Workforce Agent', 'workerProfiles must be a non-empty array');
  }
  if (typeof w.workforceWellBeingIndex !== 'number' || w.workforceWellBeingIndex < 0 || w.workforceWellBeingIndex > 100) {
    throw new ValidationError('Workforce Agent', 'workforceWellBeingIndex must be a float between 0 and 100');
  }
  // Phase 7 validations
  if (!Array.isArray(w.requiredWorkers)) {
    throw new ValidationError('Workforce Agent', 'requiredWorkers must be an array');
  }
  if (!Array.isArray(w.availableQualifiedWorkers)) {
    throw new ValidationError('Workforce Agent', 'availableQualifiedWorkers must be an array');
  }
  if (!Array.isArray(w.skillGaps)) {
    throw new ValidationError('Workforce Agent', 'skillGaps must be an array');
  }
  if (!Array.isArray(w.possibleRedeployments)) {
    throw new ValidationError('Workforce Agent', 'possibleRedeployments must be an array');
  }
  if (!Array.isArray(w.trainingRequirements)) {
    throw new ValidationError('Workforce Agent', 'trainingRequirements must be an array');
  }
  if (!Array.isArray(w.workloadRisks)) {
    throw new ValidationError('Workforce Agent', 'workloadRisks must be an array');
  }
  if (typeof w.workforceFeasibilityScore !== 'number' || w.workforceFeasibilityScore < 0 || w.workforceFeasibilityScore > 100) {
    throw new ValidationError('Workforce Agent', 'workforceFeasibilityScore must be a number between 0 and 100');
  }
  return output as WorkforceImpact;
}

export function validateRecoveryScenariosOutput(output: unknown): RecoveryScenario[] {
  if (!Array.isArray(output) || output.length === 0) {
    throw new ValidationError('Recovery Adaptation Agent', 'Output must be a non-empty array of RecoveryScenario');
  }
  for (const s of output) {
    if (!s.scenarioId || !s.scenarioName || !s.tier) {
      throw new ValidationError('Recovery Adaptation Agent', 'Each scenario must have scenarioId, scenarioName, and tier');
    }
    if (!s.tradeOffs || typeof s.tradeOffs.incrementalCostInr !== 'number' || typeof s.tradeOffs.estimatedRecoveryHours !== 'number') {
      throw new ValidationError('Recovery Adaptation Agent', `Scenario ${s.scenarioId} has missing or invalid tradeOffs`);
    }
    if (!s.workforceSafetyAssessment || typeof s.workforceSafetyAssessment.allAccommodationsRespected !== 'boolean') {
      throw new ValidationError('Recovery Adaptation Agent', `Scenario ${s.scenarioId} has missing workforce safety assessment`);
    }
  }
  return output as RecoveryScenario[];
}

export function validateDecisionOutput(output: unknown, availableScenarios?: RecoveryScenario[]): Decision {
  if (!output || typeof output !== 'object') {
    throw new ValidationError('Decision Agent', 'Output must be a non-null object');
  }
  const dec = output as Partial<Decision>;
  if (!dec.decisionId || !dec.recommendedScenarioId) {
    throw new ValidationError('Decision Agent', 'decisionId and recommendedScenarioId are required');
  }
  if (availableScenarios && availableScenarios.length > 0) {
    const validScenario = availableScenarios.some(s => s.scenarioId === dec.recommendedScenarioId);
    if (!validScenario) {
      throw new ValidationError('Decision Agent', `Recommended scenario ${dec.recommendedScenarioId} does not exist in candidate scenarios`);
    }
  }
  if (!dec.justification || !dec.justification.primaryReason) {
    throw new ValidationError('Decision Agent', 'Decision must include structured justification');
  }
  if (!Array.isArray(dec.actionPlanSteps) || dec.actionPlanSteps.length === 0) {
    throw new ValidationError('Decision Agent', 'Decision must include at least one actionPlanStep');
  }
  // Phase 5: validate scoring fields
  if (!Array.isArray(dec.scenarioEvaluations) || dec.scenarioEvaluations.length === 0) {
    throw new ValidationError('Decision Agent', 'Decision must include scenarioEvaluations from the scoring engine');
  }
  for (const ev of dec.scenarioEvaluations) {
    if (!ev.scenarioId || typeof ev.compositeScore !== 'number' || !Array.isArray(ev.criteria)) {
      throw new ValidationError('Decision Agent', `Invalid scenarioEvaluation for ${ev.scenarioId}: missing compositeScore or criteria`);
    }
    if (ev.criteria.length === 0) {
      throw new ValidationError('Decision Agent', `Scenario ${ev.scenarioId} has empty criteria array`);
    }
    if (!Array.isArray(ev.risks) || ev.risks.length === 0) {
      throw new ValidationError('Decision Agent', `Scenario ${ev.scenarioId} must list at least one risk`);
    }
  }
  if (!dec.appliedWeights || typeof dec.appliedWeights !== 'object') {
    throw new ValidationError('Decision Agent', 'Decision must include appliedWeights used by the scoring engine');
  }
  return output as Decision;
}

