/**
 * Domain Model Validation Script
 * Verifies that the Case and Agent History conform to the strict TypeScript definitions.
 */

import { MOCK_DISRUPTION_CASE } from './mock/disruptionCase.js';
import { Case, AgentExecution, RecoveryScenario } from './types/domain.js';

export function validateCase(c: Case): boolean {
  console.log(`[VALIDATION] Validating Case: ${c.caseId} - "${c.title}"`);
  console.log(`[STATUS] Status: ${c.status}`);

  if (!c.disruption) {
    throw new Error('Disruption data is missing from case!');
  }
  console.log(`[AGENT 1: DISRUPTION] Location: ${c.disruption.location.name} | Category: ${c.disruption.category} | Severity: ${c.disruption.severity}`);

  if (!c.supplyChainImpact) {
    throw new Error('SupplyChainImpact is missing from case!');
  }
  console.log(`[AGENT 2: SUPPLY CHAIN] Impacted Value: INR ${c.supplyChainImpact.estimatedTotalValueAtRiskInr} | Affected POs: ${c.supplyChainImpact.impactedPOs.length}`);

  if (!c.workforceImpact) {
    throw new Error('WorkforceImpact is missing from case!');
  }
  console.log(`[AGENT 3: WORKFORCE] Available Staff: ${c.workforceImpact.availableStaffCount} | Accommodations: ${c.workforceImpact.accommodationRequirements.length}`);

  if (!c.candidateScenarios || c.candidateScenarios.length === 0) {
    throw new Error('RecoveryScenarios are missing from case!');
  }
  console.log(`[AGENT 4: RECOVERY] Scenarios Generated: ${c.candidateScenarios.length}`);
  c.candidateScenarios.forEach((s: RecoveryScenario, idx: number) => {
    console.log(`   -> Scenario ${idx + 1}: ${s.scenarioName} [Cost: INR ${s.tradeOffs.incrementalCostInr}, Well-Being: ${s.tradeOffs.workerWellBeingScore}/100, Hours: ${s.tradeOffs.estimatedRecoveryHours}h]`);
  });

  if (!c.decision) {
    throw new Error('Decision is missing from case!');
  }
  console.log(`[AGENT 5: DECISION] Recommended: ${c.decision.recommendedScenarioName}`);
  console.log(`   -> Justification: ${c.decision.justification.primaryReason}`);

  if (!c.agentHistory || c.agentHistory.historyLedger.length === 0) {
    throw new Error('AgentHistory ledger is missing or empty!');
  }
  console.log(`[AUDIT LEDGER] Total Immutable Executions Recorded: ${c.agentHistory.historyLedger.length}`);
  c.agentHistory.historyLedger.forEach((exec: AgentExecution) => {
    console.log(`   [${exec.timestamp}] ${exec.agentName} -> Status: ${exec.executionStatus} (Confidence: ${(exec.confidence * 100).toFixed(0)}%)`);
  });

  if (!c.approval) {
    throw new Error('Approval state is missing from case!');
  }
  console.log(`[GOVERNANCE/HITL] Approval Status: ${c.approval.status} | Approver: ${c.approval.approverUser.name} (${c.approval.approverUser.role})`);

  return true;
}

// Execute validation
const isValid = validateCase(MOCK_DISRUPTION_CASE);
console.log(`\n🎉 Domain Model & Case Validation SUCCESSFUL: ${isValid}`);
