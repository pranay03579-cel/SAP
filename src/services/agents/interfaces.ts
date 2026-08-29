/**
 * SAP Sentinel — Multi-Agent Interface Contracts
 * Architecture Invariant: Clean abstract interfaces for all 5 specialized recovery agents.
 */

import {
  AgentName,
  EvidenceItem,
} from '../../../shared/types/domain.js';

export interface AgentResult<T> {
  output: T;
  confidence: number;
  assumptions: string[];
  evidence: EvidenceItem[];
  humanReadableSummary: string;
}

export interface IAgent<TContext, TOutput> {
  readonly name: AgentName;
  execute(context: TContext): Promise<AgentResult<TOutput>>;
}

export interface AgentProgressUpdate {
  agentName: AgentName;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  stepIndex: number;
  totalSteps: number;
  message: string;
  timestamp: string;
}
