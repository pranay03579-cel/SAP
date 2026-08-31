/**
 * SimpleAgentTimeline — Phase 12
 *
 * A plain-language, hackathon-friendly view of what the 5 agents did.
 * Each agent shows ONE sentence explaining its finding, plus an expandable
 * detail section with structured evidence.
 *
 * Plain language is derived from the Case domain model — NOT from raw
 * agent chain-of-thought or internal reasoning.
 *
 * Governance: No chain-of-thought, private prompts, or internal deliberation exposed.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Package,
  Users,
  Truck,
  Trophy,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Case, AgentExecution } from '../../shared/types/domain';

interface SimpleAgentTimelineProps {
  currentCase: Case;
  onOpenFullDetail: () => void;
}

// ─── Plain-language sentence derivation ─────────────────────────────────────
// These functions read structured Case data and return a single human sentence.
// They do NOT expose reasoning — only the result.

function getDisruptionSentence(currentCase: Case): string {
  const d = currentCase.disruption;
  if (!d) return 'Analysed the disruption event.';
  return `Found that ${d.affectedCorridor} is blocked by a ${d.category.replace(/_/g, ' ').toLowerCase()}. Estimated clearance: ${d.estimatedBlockedDurationHours} hours.`;
}

function getSupplyChainSentence(currentCase: Case): string {
  const sc = currentCase.supplyChainImpact;
  if (!sc) return 'Checked affected shipments and purchase orders.';
  const lifeSaving = sc.impactedMaterials?.filter((m) => m.criticality === 'LIFE_SAVING').length ?? 0;
  return `Identified ${sc.impactedPOs?.length ?? 0} affected shipments worth ₹${(sc.estimatedTotalValueAtRiskInr / 10000000).toFixed(2)} Crore. ${lifeSaving > 0 ? `${lifeSaving} are life-saving.` : ''}`;
}

function getWorkforceSentence(currentCase: Case): string {
  const w = currentCase.workforceImpact;
  if (!w) return 'Assessed workforce availability and constraints.';
  const accommodations = w.accommodationRequirements?.length ?? 0;
  return `Found ${w.availableStaffCount} of ${w.availableStaffCount + w.constrainedStaffCount} workers available. ${accommodations > 0 ? `${accommodations} workers have special requirements that were accommodated.` : 'All workers are within safe working limits.'}`;
}

function getRecoverySentence(currentCase: Case): string {
  const scenarios = currentCase.candidateScenarios;
  if (!scenarios?.length) return 'Generated recovery options using available routes and workforce.';
  return `Created ${scenarios.length} recovery options: air freight, split transport, and road bypass — each checked against workforce and safety constraints.`;
}

function getDecisionSentence(currentCase: Case): string {
  const d = currentCase.decision;
  if (!d) return 'Compared all recovery options and selected the best one.';
  const winner = d.scenarioEvaluations?.[0];
  return `Compared all ${d.scenarioEvaluations?.length ?? 3} options and selected "${d.recommendedScenarioName}" as the best overall plan${winner ? ` (score: ${winner.compositeScore.toFixed(0)}/100)` : ''}.`;
}

// ─── Expandable evidence detail per agent ────────────────────────────────────

function AgentDetail({ execution }: { execution: AgentExecution | undefined }) {
  if (!execution) return null;

  const output = execution.structuredOutput;

  if (output.type === 'Disruption') {
    const d = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="WHAT WE FOUND" value={d.description} />
        <DetailRow label="LOCATION" value={`${d.location.name}, ${d.location.region}`} />
        <DetailRow label="IMPACT" value={`Route blocked for ~${d.estimatedBlockedDurationHours}h. Medical lifeline corridor: ${d.isCriticalLifelineRoute ? 'Yes' : 'No'}.`} />
        <DetailRow label="RAINFALL" value={`${d.weatherDetails.rainfallMmLast24Hours}mm in 24h — ${d.weatherDetails.warningLevel} warning level`} />
      </DetailGrid>
    );
  }

  if (output.type === 'SupplyChainImpact') {
    const sc = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="WHAT WE FOUND" value={`${sc.impactedPOs.length} purchase orders are stranded on the blocked route.`} />
        <DetailRow label="TOTAL VALUE AT RISK" value={`₹${(sc.estimatedTotalValueAtRiskInr / 10000000).toFixed(2)} Crore`} />
        <DetailRow label="STOCKOUT RISK" value={sc.stockoutImminentPlants.length ? `${sc.stockoutImminentPlants.length} hospital(s) face stockout within 28 hours.` : 'No immediate stockout risk.'} />
        <DetailRow label="COLD-CHAIN" value={`Battery backup: ${sc.temperatureIntegrityThreat.batteryBackupHoursRemaining}h remaining for temperature-sensitive shipments.`} />
      </DetailGrid>
    );
  }

  if (output.type === 'WorkforceImpact') {
    const w = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="WHAT WE FOUND" value={`${w.availableStaffCount} workers are ready to support the recovery. ${w.constrainedStaffCount} are on mandatory rest.`} />
        <DetailRow label="SKILL GAPS" value={w.skillGaps.length ? `${w.skillGaps.length} skill gap(s) identified. ${w.trainingRequirements.length} quick training module(s) recommended.` : 'No critical skill gaps found.'} />
        <DetailRow label="ACCOMMODATIONS" value={w.accommodationRequirements.length ? `${w.accommodationRequirements.length} workers have special requirements (ergonomic, language, or sensory) — all accommodated.` : 'No special accommodations required.'} />
        <DetailRow label="OVERALL FEASIBILITY" value={`${w.workforceFeasibilityScore.toFixed(0)} / 100 — workforce can safely support the recovery plan.`} />
      </DetailGrid>
    );
  }

  if (output.type === 'RecoveryScenarios') {
    const scenarios = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="WHAT WE FOUND" value={`${scenarios.length} recovery options were designed using available routes and workforce.`} />
        {scenarios.map((s) => (
          <DetailRow
            key={s.scenarioId}
            label={s.scenarioName.toUpperCase()}
            value={s.summary}
          />
        ))}
      </DetailGrid>
    );
  }

  if (output.type === 'Decision') {
    const dec = output.payload;
    const winner = dec.scenarioEvaluations?.[0];
    return (
      <DetailGrid>
        <DetailRow label="RECOMMENDED PLAN" value={dec.recommendedScenarioName} />
        <DetailRow label="WHY" value={dec.justification.primaryReason} />
        <DetailRow label="SCORE" value={winner ? `${winner.compositeScore.toFixed(1)} / 100 (best of ${dec.scenarioEvaluations.length} options)` : '—'} />
        <DetailRow label="ASSUMPTIONS" value={execution.assumptions.join(' ')} />
      </DetailGrid>
    );
  }

  return null;
}

const DetailGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-3 space-y-2.5 pt-3 border-t border-slate-100">{children}</div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{value}</p>
  </div>
);

// ─── Individual Agent Card ────────────────────────────────────────────────────

const AGENT_CONFIG = [
  {
    key: 'Disruption Agent' as const,
    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
    color: 'border-l-red-400',
    dot: 'bg-red-500',
    label: 'Disruption Agent',
    role: 'Checked what happened and where.',
  },
  {
    key: 'Supply Chain Impact Agent' as const,
    icon: <Package className="w-4 h-4 text-blue-500" />,
    color: 'border-l-blue-400',
    dot: 'bg-blue-500',
    label: 'Supply Chain Agent',
    role: 'Checked which shipments are affected.',
  },
  {
    key: 'Workforce Agent' as const,
    icon: <Users className="w-4 h-4 text-violet-500" />,
    color: 'border-l-violet-400',
    dot: 'bg-violet-500',
    label: 'Workforce Agent',
    role: 'Checked worker availability and constraints.',
  },
  {
    key: 'Recovery Adaptation Agent' as const,
    icon: <Truck className="w-4 h-4 text-amber-500" />,
    color: 'border-l-amber-400',
    dot: 'bg-amber-500',
    label: 'Recovery Agent',
    role: 'Designed the recovery options.',
  },
  {
    key: 'Decision Agent' as const,
    icon: <Trophy className="w-4 h-4 text-green-500" />,
    color: 'border-l-green-400',
    dot: 'bg-green-500',
    label: 'Decision Agent',
    role: 'Compared options and selected the best plan.',
  },
];

type AgentKey =
  | 'Disruption Agent'
  | 'Supply Chain Impact Agent'
  | 'Workforce Agent'
  | 'Recovery Adaptation Agent'
  | 'Decision Agent';

function getAgentSentence(key: AgentKey, currentCase: Case): string {
  switch (key) {
    case 'Disruption Agent': return getDisruptionSentence(currentCase);
    case 'Supply Chain Impact Agent': return getSupplyChainSentence(currentCase);
    case 'Workforce Agent': return getWorkforceSentence(currentCase);
    case 'Recovery Adaptation Agent': return getRecoverySentence(currentCase);
    case 'Decision Agent': return getDecisionSentence(currentCase);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const SimpleAgentTimeline: React.FC<SimpleAgentTimelineProps> = ({
  currentCase,
  onOpenFullDetail,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const ledger = currentCase.agentHistory.historyLedger;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">How the AI reached this decision</h3>
        </div>
        <button
          onClick={onOpenFullDetail}
          className="flex items-center space-x-1.5 text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <span>View full technical detail</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Agent list */}
      <div className="divide-y divide-slate-100">
        {AGENT_CONFIG.map((agent, index) => {
          const execution = ledger.find((e) => e.agentName === agent.key);
          const isCompleted = !!execution;
          const isOpen = expanded === agent.key;
          const sentence = isCompleted ? getAgentSentence(agent.key, currentCase) : null;

          return (
            <div key={agent.key} className={`border-l-4 ${agent.color} transition-colors`}>
              <button
                onClick={() => {
                  if (!isCompleted) return;
                  setExpanded(isOpen ? null : agent.key);
                }}
                disabled={!isCompleted}
                className="w-full px-5 py-4 flex items-start space-x-3 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Step number */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    {agent.icon}
                    <span className="text-xs font-bold text-slate-800">{agent.label}</span>
                    {isCompleted ? (
                      <span className="flex items-center space-x-1 text-[10px] font-semibold text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Pending</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mb-1">{agent.role}</p>
                  {sentence && (
                    <p className="text-sm text-slate-700 leading-snug">{sentence}</p>
                  )}
                </div>

                {/* Expand toggle */}
                {isCompleted && (
                  <div className="flex-shrink-0 mt-1 text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </button>

              {/* Expanded detail */}
              {isOpen && execution && (
                <div className="px-14 pb-5">
                  <AgentDetail execution={execution} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">
          All findings are based on simulated mock data. No real SAP connections were used.
        </p>
      </div>
    </div>
  );
};
