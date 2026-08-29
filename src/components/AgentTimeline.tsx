/**
 * SAP Sentinel — Agent Analysis Timeline (Phase 6 Enhanced)
 * 
 * Provides a fully transparent audit trail for all 5 recovery agents:
 * 1. Disruption Agent
 * 2. Supply Chain Impact Agent
 * 3. Workforce Agent
 * 4. Recovery Adaptation Agent
 * 5. Decision Agent
 * 
 * Strict Governance Invariant:
 * - NO chain-of-thought, private model reasoning, hidden prompts, or internal deliberation.
 * - Only structured enterprise business findings, evidence, assumptions, trade-offs, and scores.
 * - Sourced directly from immutable agent history ledger and Case aggregate root.
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Eye, 
  BrainCircuit,
  Database,
  Users,
  Compass,
  Award,
  Play,
  RotateCcw,
  AlertOctagon,
  RefreshCw,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Maximize2,
  Minimize2,
  Check,
  Copy
} from 'lucide-react';
import { Case, AgentExecution, AgentName } from '../../shared/types/domain';
import { AgentStatusMap } from '../services/orchestrator';
import { DecisionTrace } from './DecisionTrace';

interface AgentTimelineProps {
  currentCase: Case;
  agentStatuses: AgentStatusMap;
  isPipelineRunning: boolean;
  onSelectExecution: (execution: AgentExecution) => void;
  onRunFullPipeline: () => void;
  onRunSingleStep: () => void;
  onSimulateFault: (agentName: AgentName) => void;
  onRetryPipeline: () => void;
  onResetCase: () => void;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  currentCase,
  agentStatuses,
  isPipelineRunning,
  onSelectExecution,
  onRunFullPipeline,
  onRunSingleStep,
  onSimulateFault,
  onRetryPipeline,
  onResetCase,
}) => {
  const executions = currentCase.agentHistory.historyLedger;
  const agentOrder: AgentName[] = [
    'Disruption Agent',
    'Supply Chain Impact Agent',
    'Workforce Agent',
    'Recovery Adaptation Agent',
    'Decision Agent',
  ];

  // Expanded state map for inline collapsible agent cards (default: Decision Agent expanded, or all expanded if completed)
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({
    'Disruption Agent': false,
    'Supply Chain Impact Agent': false,
    'Workforce Agent': false,
    'Recovery Adaptation Agent': false,
    'Decision Agent': true,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleAgent = (agentName: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentName]: !prev[agentName],
    }));
  };

  const expandAll = () => {
    setExpandedAgents({
      'Disruption Agent': true,
      'Supply Chain Impact Agent': true,
      'Workforce Agent': true,
      'Recovery Adaptation Agent': true,
      'Decision Agent': true,
    });
  };

  const collapseAll = () => {
    setExpandedAgents({
      'Disruption Agent': false,
      'Supply Chain Impact Agent': false,
      'Workforce Agent': false,
      'Recovery Adaptation Agent': false,
      'Decision Agent': false,
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasFailedAgent = Object.values(agentStatuses).includes('FAILED');
  const allCompleted = Object.values(agentStatuses).every((s) => s === 'COMPLETED');

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Disruption Agent':
        return <BrainCircuit className="w-5 h-5 text-red-400" />;
      case 'Supply Chain Impact Agent':
        return <Database className="w-5 h-5 text-cyan-400" />;
      case 'Workforce Agent':
        return <Users className="w-5 h-5 text-emerald-400" />;
      case 'Recovery Adaptation Agent':
        return <Compass className="w-5 h-5 text-amber-400" />;
      case 'Decision Agent':
        return <Award className="w-5 h-5 text-purple-400" />;
      default:
        return <Layers className="w-5 h-5 text-sap-accent" />;
    }
  };

  const getStatusBadge = (status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED', confidence?: number) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-sap-accent border border-blue-500/40 flex items-center space-x-1.5 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>RUNNING</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>COMPLETED {confidence !== undefined ? `(${(confidence * 100).toFixed(0)}%)` : ''}</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-sap-muted border border-sap-border">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Visual Decision Trace Flow (Disruption → SC → Workforce → Recovery → Evaluation → Recommendation) */}
      <DecisionTrace
        currentCase={currentCase}
        onSelectAgent={(name) => {
          setExpandedAgents((prev) => ({ ...prev, [name]: true }));
          const element = document.getElementById(`agent-card-${name.replace(/\s+/g, '-').toLowerCase()}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      {/* 2. Interactive Pipeline Controls & Header */}
      <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-sap-accent rounded border border-blue-500/30">
                SEQUENTIAL AGENT ANALYSIS TRAIL
              </span>
              <span className="text-xs font-mono text-sap-muted">
                {executions.length} / 5 Executions Logged in State Ledger
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Multi-Agent Findings, Evidence & Decision Contribution
            </h2>
            <p className="text-xs text-sap-muted mt-1">
              Inspect structured contributions from each autonomous agent. No chain-of-thought is exposed.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-sap-dark/80 p-1 rounded-xl border border-sap-border mr-1">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Expand All Agents"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Collapse All Agents"
              >
                <Minimize2 className="w-3 h-3" />
                <span>Collapse All</span>
              </button>
            </div>

            {hasFailedAgent ? (
              <button
                onClick={onRetryPipeline}
                disabled={isPipelineRunning}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPipelineRunning ? 'animate-spin' : ''}`} />
                <span>Retry Failed Step</span>
              </button>
            ) : (
              <button
                onClick={onRunFullPipeline}
                disabled={isPipelineRunning || allCompleted}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-1.5 ${
                  allCompleted
                    ? 'bg-slate-800 text-sap-muted border border-sap-border cursor-not-allowed'
                    : 'bg-gradient-to-r from-sap-accent to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isPipelineRunning ? 'animate-spin' : ''}`} />
                <span>{isPipelineRunning ? 'Orchestrating...' : allCompleted ? 'Pipeline Completed' : 'Run Full Analysis'}</span>
              </button>
            )}

            <button
              onClick={onRunSingleStep}
              disabled={isPipelineRunning || allCompleted}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-sap-border transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sap-cyan" />
              <span>Step-by-Step</span>
            </button>

            <button
              onClick={() => onSimulateFault('Workforce Agent')}
              disabled={isPipelineRunning}
              className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-medium border border-red-500/30 transition-colors flex items-center space-x-1.5"
              title="Inject simulated fault to test failure isolation"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Inject Fault</span>
            </button>

            <button
              onClick={onResetCase}
              disabled={isPipelineRunning}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-sap-border transition-colors"
              title="Reset Case State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Step Progress Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-sap-border/60 text-xs">
          {agentOrder.map((name, idx) => {
            const status = agentStatuses[name];
            return (
              <div
                key={name}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  status === 'COMPLETED'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : status === 'RUNNING'
                    ? 'bg-blue-950/40 border-sap-accent text-sap-accent animate-pulse'
                    : status === 'FAILED'
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-sap-dark/60 border-sap-border text-sap-muted'
                }`}
              >
                <div className="text-[10px] font-mono text-sap-muted">0{idx + 1}</div>
                <div className="font-bold truncate text-[11px] mt-0.5">{name.replace(' Agent', '')}</div>
                <div className="text-[10px] mt-1 font-semibold uppercase">{status}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Sequential Agent Cards with In-Place Accordion Expansion */}
      <div className="space-y-4">
        {agentOrder.map((agentName, index) => {
          const status = agentStatuses[agentName];
          const exec = [...executions].reverse().find((e) => e.agentName === agentName);
          const isExpanded = expandedAgents[agentName] ?? false;
          const cardId = `agent-card-${agentName.replace(/\s+/g, '-').toLowerCase()}`;

          return (
            <div
              key={agentName}
              id={cardId}
              className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
                status === 'FAILED'
                  ? 'border-red-500/60 bg-red-950/10'
                  : status === 'RUNNING'
                  ? 'border-sap-accent shadow-xl shadow-blue-500/10'
                  : status === 'COMPLETED'
                  ? 'border-sap-border hover:border-slate-500'
                  : 'border-sap-border/60 opacity-75'
              }`}
            >
              {/* Card Header (Clickable to expand/collapse) */}
              <div
                onClick={() => toggleAgent(agentName)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-sap-dark/60 hover:bg-sap-dark/90 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-mono font-bold flex items-center justify-center text-xs flex-shrink-0 border border-sap-border">
                    0{index + 1}
                  </div>
                  <div className="p-2 bg-sap-dark rounded-xl border border-sap-border">
                    {getAgentIcon(agentName)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{agentName}</h3>
                      {exec && (
                        <span className="text-xs font-mono text-sap-muted hidden md:inline">
                          ({exec.executionId})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-sap-muted mt-0.5">
                      {exec ? (
                        <>
                          <span className="font-mono text-slate-300">
                            {new Date(exec.timestamp).toLocaleTimeString()}
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">{exec.evidence.length} Evidence Items</span>
                          <span>•</span>
                          <span className="text-slate-300">{exec.assumptions.length} Assumptions</span>
                        </>
                      ) : (
                        <span>Awaiting execution in sequence</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {getStatusBadge(status, exec?.confidence)}
                  
                  {exec && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExecution(exec);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-sap-border text-xs flex items-center gap-1"
                      title="Open Deep Inspector Modal"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Inspect</span>
                    </button>
                  )}

                  <div className="p-1 text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* 1-Line Summary Bar */}
              <div className="px-5 py-3 border-t border-sap-border/50 bg-sap-card/40 flex items-center justify-between text-xs">
                <p className={`leading-relaxed ${status === 'FAILED' ? 'text-red-300' : 'text-slate-200'}`}>
                  {exec ? exec.humanReadableSummary : 'Agent has not executed. Outputs will be derived from prior pipeline stages.'}
                </p>
              </div>

              {/* Expanded Detailed Business Breakdown */}
              {isExpanded && exec && (
                <div className="p-5 border-t border-sap-border/60 bg-sap-dark/40 space-y-5 animate-in fade-in">
                  {/* Confidence & Inputs Ribbon */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Confidence */}
                    <div className="p-3 bg-sap-dark/80 rounded-xl border border-sap-border space-y-1.5">
                      <span className="text-[10px] text-sap-muted uppercase tracking-wider block font-bold">
                        Confidence Rating
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${exec.confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          {(exec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Verified against domain constraints & telemetry feeds
                      </span>
                    </div>

                    {/* Inputs Used */}
                    <div className="p-3 bg-sap-dark/80 rounded-xl border border-sap-border space-y-1 md:col-span-2">
                      <span className="text-[10px] text-sap-muted uppercase tracking-wider block font-bold">
                        Inputs Ingested & System References
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sap-accent font-mono text-[10px] border border-blue-500/30">
                          Case: {exec.inputReference.caseId}
                        </span>
                        {exec.inputReference.referencedExecutionIds.map((refId) => (
                          <span key={refId} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                            Upstream: {refId}
                          </span>
                        ))}
                        {exec.inputReference.referencedSapEntityIds.map((sapId) => (
                          <span key={sapId} className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[10px] border border-sap-border">
                            Entity: {sapId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1. Key Findings Structured Block (Agent-Specific) */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sap-muted block">
                      Key Structured Findings
                    </span>

                    {/* Disruption Agent Findings */}
                    {agentName === 'Disruption Agent' && currentCase.disruption && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Category</span>
                          <span className="font-bold text-red-400">{currentCase.disruption.category}</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Severity</span>
                          <span className="font-bold text-red-400">{currentCase.disruption.severity}</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Blocked Duration</span>
                          <span className="font-bold text-yellow-400 font-mono">{currentCase.disruption.estimatedBlockedDurationHours} Hours</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Monsoon Warning</span>
                          <span className="font-bold text-red-400">{currentCase.disruption.weatherDetails.warningLevel} ALERT</span>
                        </div>
                      </div>
                    )}

                    {/* Supply Chain Impact Agent Findings */}
                    {agentName === 'Supply Chain Impact Agent' && currentCase.supplyChainImpact && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Value at Risk</span>
                          <span className="font-bold text-white font-mono">
                            ₹{(currentCase.supplyChainImpact.estimatedTotalValueAtRiskInr / 10000000).toFixed(2)} Cr
                          </span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Stranded POs</span>
                          <span className="font-bold text-cyan-400 font-mono">
                            {currentCase.supplyChainImpact.impactedPOs.length} Orders
                          </span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Silchar Stockout</span>
                          <span className="font-bold text-red-400 font-mono">In ~28 Hours</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Cold Chain Thermal Guard</span>
                          <span className="font-bold text-amber-400 font-mono">
                            {currentCase.supplyChainImpact.temperatureIntegrityThreat.batteryBackupHoursRemaining}h Reserve
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Workforce Agent Findings */}
                    {agentName === 'Workforce Agent' && currentCase.workforceImpact && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Available Staff</span>
                          <span className="font-bold text-emerald-400 font-mono">{currentCase.workforceImpact.availableStaffCount} Workers</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Surge Capacity</span>
                          <span className="font-bold text-white font-mono">{currentCase.workforceImpact.surgeLaborCapacityHoursAvailable} Hours</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Well-Being Index</span>
                          <span className="font-bold text-emerald-400 font-mono">{currentCase.workforceImpact.workforceWellBeingIndex}/100</span>
                        </div>
                        <div className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border">
                          <span className="text-[10px] text-sap-muted block">Fatigue Rest Mandates</span>
                          <span className="font-bold text-amber-400 font-mono">{currentCase.workforceImpact.fatigueAlerts.length} Staff</span>
                        </div>
                      </div>
                    )}

                    {/* Recovery Adaptation Agent Findings */}
                    {agentName === 'Recovery Adaptation Agent' && currentCase.candidateScenarios && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {currentCase.candidateScenarios.map((sc) => (
                          <div key={sc.scenarioId} className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border space-y-1">
                            <div className="flex justify-between">
                              <span className="font-bold text-white">{sc.scenarioId}</span>
                              <span className="text-yellow-400 font-mono">{sc.tradeOffs.estimatedRecoveryHours}h</span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{sc.scenarioName}</p>
                            <div className="flex justify-between text-[10px] text-sap-muted pt-1 border-t border-sap-border/40">
                              <span>Cost: ₹{(sc.tradeOffs.incrementalCostInr / 100000).toFixed(1)}L</span>
                              <span>Well-Being: {sc.tradeOffs.workerWellBeingScore}/100</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Decision Agent Special Expanded Analysis */}
                    {agentName === 'Decision Agent' && currentCase.decision && (
                      <div className="space-y-4 pt-1">
                        {/* 1. Scenarios Considered & Score Breakdown */}
                        <div className="p-3.5 bg-sap-dark/90 rounded-xl border border-sap-border space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                              <span>Multi-Criteria Score Breakdown & Alternatives Considered</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              Winner: {currentCase.decision.recommendedScenarioId}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(currentCase.decision.scenarioEvaluations ?? []).map((ev) => (
                              <div
                                key={ev.scenarioId}
                                className={`p-3 rounded-lg border text-xs ${
                                  ev.scenarioId === currentCase.decision?.recommendedScenarioId
                                    ? 'bg-emerald-950/30 border-emerald-500/50'
                                    : 'bg-slate-900/60 border-sap-border'
                                }`}
                              >
                                <div className="flex items-center justify-between font-semibold text-white mb-1.5">
                                  <span>{ev.scenarioName} (Rank #{ev.rank})</span>
                                  <span className="font-mono text-emerald-400 font-bold">{ev.compositeScore.toFixed(1)} / 100</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-300 font-mono">
                                  {ev.criteria.slice(0, 4).map((c) => (
                                    <div key={c.criterion} className="p-1 bg-sap-dark rounded border border-sap-border/40">
                                      <span className="text-sap-muted block truncate">{c.label}</span>
                                      <span className="text-white font-bold">{c.rawValue} ({c.normalizedScore.toFixed(0)}/100)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Trade-Off Profile Comparison & Constraints */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-sap-dark/90 rounded-xl border border-sap-border space-y-1.5">
                            <span className="text-[10px] text-sap-muted uppercase tracking-wider font-bold block">
                              Operational Constraints Evaluated
                            </span>
                            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                              <li>Hospital clinical stockout deadline: 28 hours (Insulin)</li>
                              <li>Worker shift cap: maximum 8 hours (zero fatigue violation)</li>
                              <li>Cold-chain GPS thermal integrity: continuous battery logging</li>
                              <li>Inclusive accommodations: 100% full ergonomic & multilingual compliance</li>
                            </ul>
                          </div>

                          <div className="p-3 bg-sap-dark/90 rounded-xl border border-sap-border space-y-1.5">
                            <span className="text-[10px] text-sap-muted uppercase tracking-wider font-bold block">
                              Expected Impact of Winning Recommendation
                            </span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {currentCase.decision.justification.costVsLifeSavingTradeOffRationale}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Evidence Registry (Specific to Agent) */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sap-muted block">
                      Evidence Registry ({exec.evidence.length})
                    </span>
                    <div className="space-y-2">
                      {exec.evidence.map((ev) => (
                        <div key={ev.evidenceId} className="p-3 bg-sap-dark/90 rounded-xl border border-sap-border text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sap-accent text-[10px] font-bold border border-blue-500/30">
                                {ev.sourceType}
                              </span>
                              <span className="font-mono font-bold text-white">{ev.sourceReference}</span>
                            </div>
                            <span className="text-sap-muted font-mono text-[10px]">
                              {new Date(ev.observedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{ev.description}</p>
                          <div className="p-2 bg-sap-dark rounded border border-sap-border/40 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                            {JSON.stringify(ev.payloadSnippet)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Assumptions (Specific to Agent) */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sap-muted block">
                      Preconditions & Assumptions ({exec.assumptions.length})
                    </span>
                    <div className="space-y-1.5">
                      {exec.assumptions.map((assump, idx) => (
                        <div key={idx} className="p-2.5 bg-sap-dark/80 rounded-lg border border-sap-border flex items-start space-x-2 text-xs">
                          <span className="font-mono text-sap-gold font-bold">{idx + 1}.</span>
                          <span className="text-slate-300 text-[11px]">{assump}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Structured Output Inspector Link */}
                  <div className="p-3 bg-sap-dark/80 rounded-xl border border-sap-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Structured Domain Payload</span>
                      <span className="text-[11px] text-sap-muted">Model: {exec.structuredOutput.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(exec.executionId, JSON.stringify(exec.structuredOutput.payload, null, 2))}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-sap-border text-[11px] flex items-center gap-1"
                      >
                        {copiedId === exec.executionId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === exec.executionId ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                      <button
                        onClick={() => onSelectExecution(exec)}
                        className="px-3 py-1 bg-sap-accent/20 hover:bg-sap-accent/30 text-sap-accent border border-sap-accent/40 rounded font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Payload</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
