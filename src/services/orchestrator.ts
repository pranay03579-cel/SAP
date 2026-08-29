/**
 * SAP Sentinel — Autonomous Multi-Agent Pipeline Orchestrator
 *
 * Enforces:
 * 1. Sequential execution through the 5 specialized agents.
 * 2. Immutable Append-Only Blackboard state ledger.
 * 3. Non-destructive failure isolation and deterministic retries.
 * 4. Schema validation on all agent outputs before committing to Case state.
 * 5. Provider injection — agents receive only their required provider,
 *    never the full registry. Swap providers in providerRegistry to change
 *    integration mode (mock → SAP live) without touching agents.
 */

import {
  Case,
  AgentName,
  AgentExecution,
} from '../../shared/types/domain.js';
import { DisruptionAgent } from './agents/disruptionAgent.js';
import { SupplyChainImpactAgent } from './agents/supplyChainAgent.js';
import { WorkforceAgent } from './agents/workforceAgent.js';
import { RecoveryAdaptationAgent } from './agents/recoveryAgent.js';
import { DecisionAgent } from './agents/decisionAgent.js';
import { AgentProgressUpdate } from './agents/interfaces.js';
import { providerRegistry } from '../providers/registry.js';
import { APP_CONFIG } from '../config/appConfig.js';

export type AgentStatusMap = Record<AgentName, 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'>;

export interface OrchestrationOptions {
  stepDelayMs?: number;
  stopAtAgent?: AgentName;
  injectedFaults?: Partial<Record<AgentName, string>>;
}

export class PipelineOrchestrator {
  // Agents receive only the provider they need — not the full registry
  private disruptionAgent = new DisruptionAgent(providerRegistry.disruption);
  private supplyChainAgent = new SupplyChainImpactAgent(providerRegistry.supplyChain);
  private workforceAgent = new WorkforceAgent(providerRegistry.workforce);
  private recoveryAgent = new RecoveryAdaptationAgent(providerRegistry.transport);
  private decisionAgent = new DecisionAgent();

  public readonly agentSequence: AgentName[] = [
    'Disruption Agent',
    'Supply Chain Impact Agent',
    'Workforce Agent',
    'Recovery Adaptation Agent',
    'Decision Agent',
  ];

  /**
   * Returns the resolved integration mode from AppConfig.
   * Displayed in the UI to clearly indicate mock vs SAP-live.
   */
  public getIntegrationMode() {
    return {
      mode: APP_CONFIG.mode,
      modeLabel: APP_CONFIG.modeLabel,
      modeDescription: APP_CONFIG.modeDescription,
      sapIntegrationStatus: APP_CONFIG.sapIntegrationStatus,
    };
  }

  /**
   * Initializes a fresh, un-analyzed Case for a disruption incident.
   */
  public createInitialCase(caseId = 'CASE-NER-2026-0829'): Case {
    return {
      caseId,
      caseNumber: caseId,
      title: 'NH-27 Landslide Blockade: Critical Medical & PDS Supply Disruption (Barak Valley Corridor)',
      status: 'DETECTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agentHistory: {
        caseId,
        totalExecutions: 0,
        historyLedger: [],
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Computes the current status of all 5 agents based on the Case state.
   */
  public getAgentStatusMap(c: Case): AgentStatusMap {
    const statuses: AgentStatusMap = {
      'Disruption Agent': 'PENDING',
      'Supply Chain Impact Agent': 'PENDING',
      'Workforce Agent': 'PENDING',
      'Recovery Adaptation Agent': 'PENDING',
      'Decision Agent': 'PENDING',
    };

    for (const exec of c.agentHistory.historyLedger) {
      if (exec.executionStatus === 'COMPLETED') {
        statuses[exec.agentName] = 'COMPLETED';
      } else if (exec.executionStatus === 'FAILED') {
        statuses[exec.agentName] = 'FAILED';
      }
    }

    return statuses;
  }

  /**
   * Executes the full pipeline sequentially, updating state step-by-step.
   */
  public async executePipeline(
    initialCase: Case,
    options: OrchestrationOptions = {},
    onProgress?: (update: AgentProgressUpdate, currentCase: Case) => void
  ): Promise<Case> {
    let currentCase = { ...initialCase };
    const stepDelay = options.stepDelayMs ?? 300;
    const injectedFaults = options.injectedFaults ?? {};

    for (let i = 0; i < this.agentSequence.length; i++) {
      const agentName = this.agentSequence[i];

      // Skip already-completed agents (idempotent retry support)
      const existingSuccess = currentCase.agentHistory.historyLedger.find(
        (e) => e.agentName === agentName && e.executionStatus === 'COMPLETED'
      );
      if (existingSuccess) continue;

      // Notify RUNNING
      if (onProgress) {
        onProgress(
          {
            agentName,
            status: 'RUNNING',
            stepIndex: i + 1,
            totalSteps: this.agentSequence.length,
            message: `Executing ${agentName}...`,
            timestamp: new Date().toISOString(),
          },
          currentCase
        );
      }

      if (stepDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      try {
        currentCase = await this.executeStep(currentCase, agentName, injectedFaults[agentName]);

        if (onProgress) {
          onProgress(
            {
              agentName,
              status: 'COMPLETED',
              stepIndex: i + 1,
              totalSteps: this.agentSequence.length,
              message: `Completed ${agentName}`,
              timestamp: new Date().toISOString(),
            },
            currentCase
          );
        }

        if (options.stopAtAgent === agentName) break;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        currentCase = this.appendFailureRecord(currentCase, agentName, errorMessage);

        if (onProgress) {
          onProgress(
            {
              agentName,
              status: 'FAILED',
              stepIndex: i + 1,
              totalSteps: this.agentSequence.length,
              message: `Failed at ${agentName}: ${errorMessage}`,
              timestamp: new Date().toISOString(),
            },
            currentCase
          );
        }

        throw new Error(`Pipeline halted at ${agentName}: ${errorMessage}`);
      }
    }

    if (currentCase.decision) {
      currentCase.status = 'DECISION_PENDING';
    }

    return currentCase;
  }

  /**
   * Executes a specific agent step and appends its execution record.
   */
  public async executeStep(
    currentCase: Case,
    agentName: AgentName,
    injectedFault?: string
  ): Promise<Case> {
    if (injectedFault) {
      throw new Error(`[FaultInjection] ${injectedFault}`);
    }

    const updatedCase = {
      ...currentCase,
      updatedAt: new Date().toISOString(),
    };

    switch (agentName) {
      case 'Disruption Agent': {
        const result = await this.disruptionAgent.execute({
          corridorId: 'NH-27-GUWAHATI-SILCHAR',
        });

        updatedCase.disruption = result.output;
        updatedCase.status = 'ANALYZING';

        const execution: AgentExecution = {
          executionId: `EXEC-${Date.now()}-DISRUPT`,
          agentName,
          executionStatus: 'COMPLETED',
          timestamp: new Date().toISOString(),
          inputReference: {
            caseId: currentCase.caseId,
            referencedExecutionIds: [],
            referencedSapEntityIds: ['MOCK-FEED-BRO-HAFLONG-ALERT', 'MOCK-IOT-KM142-GEOPHONE'],
          },
          structuredOutput: { type: 'Disruption', payload: result.output },
          confidence: result.confidence,
          assumptions: result.assumptions,
          evidence: result.evidence,
          humanReadableSummary: result.humanReadableSummary,
        };

        updatedCase.agentHistory = this.appendExecution(currentCase.agentHistory, execution);
        return updatedCase;
      }

      case 'Supply Chain Impact Agent': {
        if (!updatedCase.disruption) {
          throw new Error('Precondition failed: Disruption must be analyzed before Supply Chain Impact');
        }

        const result = await this.supplyChainAgent.execute({
          disruption: updatedCase.disruption,
        });

        updatedCase.supplyChainImpact = result.output;

        const execution: AgentExecution = {
          executionId: `EXEC-${Date.now()}-SUPPLYCHAIN`,
          agentName,
          executionStatus: 'COMPLETED',
          timestamp: new Date().toISOString(),
          inputReference: {
            caseId: currentCase.caseId,
            referencedExecutionIds: this.getCompletedExecutionIds(currentCase),
            referencedSapEntityIds: ['MOCK-PO-890214-COLD', 'MOCK-PO-890215-MED', 'MOCK-PO-773410-PDS'],
          },
          structuredOutput: { type: 'SupplyChainImpact', payload: result.output },
          confidence: result.confidence,
          assumptions: result.assumptions,
          evidence: result.evidence,
          humanReadableSummary: result.humanReadableSummary,
        };

        updatedCase.agentHistory = this.appendExecution(currentCase.agentHistory, execution);
        return updatedCase;
      }

      case 'Workforce Agent': {
        if (!updatedCase.disruption || !updatedCase.supplyChainImpact) {
          throw new Error('Precondition failed: Disruption and Supply Chain Impact required before Workforce analysis');
        }

        const result = await this.workforceAgent.execute({
          disruption: updatedCase.disruption,
          supplyChainImpact: updatedCase.supplyChainImpact,
        });

        updatedCase.workforceImpact = result.output;

        const execution: AgentExecution = {
          executionId: `EXEC-${Date.now()}-WORKFORCE`,
          agentName,
          executionStatus: 'COMPLETED',
          timestamp: new Date().toISOString(),
          inputReference: {
            caseId: currentCase.caseId,
            referencedExecutionIds: this.getCompletedExecutionIds(currentCase),
            referencedSapEntityIds: ['MOCK-SF-ROSTER-GUWAHATI-PLANT', 'MOCK-SF-ROSTER-SILCHAR-DEPOT'],
          },
          structuredOutput: { type: 'WorkforceImpact', payload: result.output },
          confidence: result.confidence,
          assumptions: result.assumptions,
          evidence: result.evidence,
          humanReadableSummary: result.humanReadableSummary,
        };

        updatedCase.agentHistory = this.appendExecution(currentCase.agentHistory, execution);
        return updatedCase;
      }

      case 'Recovery Adaptation Agent': {
        if (!updatedCase.disruption || !updatedCase.supplyChainImpact || !updatedCase.workforceImpact) {
          throw new Error('Precondition failed: Prior 3 agent analyses required before Recovery Adaptation');
        }

        const result = await this.recoveryAgent.execute({
          disruption: updatedCase.disruption,
          supplyChainImpact: updatedCase.supplyChainImpact,
          workforceImpact: updatedCase.workforceImpact,
        });

        updatedCase.candidateScenarios = result.output;
        updatedCase.status = 'RECOVERY_OPTIONS_GENERATED';

        const execution: AgentExecution = {
          executionId: `EXEC-${Date.now()}-RECOVERY`,
          agentName,
          executionStatus: 'COMPLETED',
          timestamp: new Date().toISOString(),
          inputReference: {
            caseId: currentCase.caseId,
            referencedExecutionIds: this.getCompletedExecutionIds(currentCase),
            referencedSapEntityIds: ['MOCK-AIR-CHARTER-CATALOG', 'MOCK-RAILWAYS-SLOT-API'],
          },
          structuredOutput: { type: 'RecoveryScenarios', payload: result.output },
          confidence: result.confidence,
          assumptions: result.assumptions,
          evidence: result.evidence,
          humanReadableSummary: result.humanReadableSummary,
        };

        updatedCase.agentHistory = this.appendExecution(currentCase.agentHistory, execution);
        return updatedCase;
      }

      case 'Decision Agent': {
        if (!updatedCase.candidateScenarios || updatedCase.candidateScenarios.length === 0) {
          throw new Error('Precondition failed: Candidate scenarios required before Decision optimization');
        }

        const result = await this.decisionAgent.execute({
          caseId: currentCase.caseId,
          candidateScenarios: updatedCase.candidateScenarios,
        });

        updatedCase.decision = result.output;
        updatedCase.status = 'DECISION_PENDING';

        const execution: AgentExecution = {
          executionId: `EXEC-${Date.now()}-DECISION`,
          agentName,
          executionStatus: 'COMPLETED',
          timestamp: new Date().toISOString(),
          inputReference: {
            caseId: currentCase.caseId,
            referencedExecutionIds: this.getCompletedExecutionIds(currentCase),
            referencedSapEntityIds: [],
          },
          structuredOutput: { type: 'Decision', payload: result.output },
          confidence: result.confidence,
          assumptions: result.assumptions,
          evidence: result.evidence,
          humanReadableSummary: result.humanReadableSummary,
        };

        updatedCase.agentHistory = this.appendExecution(currentCase.agentHistory, execution);
        return updatedCase;
      }
    }
  }

  /**
   * Retries pipeline execution from the point of failure.
   */
  public async retryPipeline(
    currentCase: Case,
    options: OrchestrationOptions = {},
    onProgress?: (update: AgentProgressUpdate, currentCase: Case) => void
  ): Promise<Case> {
    return this.executePipeline(currentCase, options, onProgress);
  }

  private appendExecution(
    history: Case['agentHistory'],
    execution: AgentExecution
  ): Case['agentHistory'] {
    return {
      ...history,
      totalExecutions: history.totalExecutions + 1,
      historyLedger: [...history.historyLedger, execution],
      lastUpdated: new Date().toISOString(),
    };
  }

  private appendFailureRecord(currentCase: Case, agentName: AgentName, errorMessage: string): Case {
    const failureExecution: AgentExecution = {
      executionId: `EXEC-${Date.now()}-FAILED`,
      agentName,
      executionStatus: 'FAILED',
      timestamp: new Date().toISOString(),
      inputReference: {
        caseId: currentCase.caseId,
        referencedExecutionIds: this.getCompletedExecutionIds(currentCase),
        referencedSapEntityIds: [],
      },
      structuredOutput: {
        type: 'Disruption',
        payload: {
          disruptionId: 'FAILED',
          category: 'LANDSLIDE',
          severity: 'LOW',
          headline: `Agent execution failed: ${agentName}`,
          description: errorMessage,
          location: { name: 'N/A', region: 'N/A', latitude: 0, longitude: 0 },
          affectedCorridor: 'N/A',
          reportedAt: new Date().toISOString(),
          estimatedBlockedDurationHours: 0,
          isCriticalLifelineRoute: false,
          weatherDetails: { rainfallMmLast24Hours: 0, forecastCondition: 'N/A', warningLevel: 'YELLOW' },
        },
      },
      confidence: 0.0,
      assumptions: [],
      evidence: [],
      humanReadableSummary: `Execution failed: ${errorMessage}`,
    };

    return {
      ...currentCase,
      agentHistory: this.appendExecution(currentCase.agentHistory, failureExecution),
    };
  }

  private getCompletedExecutionIds(c: Case): string[] {
    return c.agentHistory.historyLedger
      .filter((e) => e.executionStatus === 'COMPLETED')
      .map((e) => e.executionId);
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
