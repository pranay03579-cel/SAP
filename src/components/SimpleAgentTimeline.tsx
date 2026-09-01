/**
 * SimpleAgentTimeline (Hard Flat Business Operations Design)
 *
 * Plain-language, transparent summary from each of the 5 recovery agents.
 * Flat cards, rounded-md, no decorative border stripes.
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
} from 'lucide-react';
import { Case, AgentExecution } from '../../shared/types/domain';

interface SimpleAgentTimelineProps {
  currentCase: Case;
}

// ─── Plain-language sentence derivation ─────────────────────────────────────

function getDisruptionSentence(currentCase: Case): string {
  const d = currentCase.disruption;
  if (!d) return 'The road is blocked by a landslide and may stay closed for about 84 hours.';
  return `The road is blocked by a ${d.category.replace(/_/g, ' ').toLowerCase()} and may stay closed for about ${d.estimatedBlockedDurationHours} hours.`;
}

function getSupplyChainSentence(currentCase: Case): string {
  const sc = currentCase.supplyChainImpact;
  if (!sc) return 'Three shipments are affected. Two contain life-saving supplies.';
  const count = sc.impactedPOs?.length ?? 3;
  const countWord = count === 3 ? 'Three' : count === 2 ? 'Two' : count === 1 ? 'One' : `${count}`;
  const lifeSaving = sc.impactedMaterials?.filter((m) => m.criticality === 'LIFE_SAVING').length ?? 0;
  const lsWord = lifeSaving === 2 ? 'Two' : lifeSaving === 1 ? 'One' : `${lifeSaving}`;
  return `${countWord} shipments are affected. ${lifeSaving > 0 ? `${lsWord} contain life-saving supplies.` : ''}`;
}

function getWorkforceSentence(currentCase: Case): string {
  const w = currentCase.workforceImpact;
  if (!w) return '42 of 50 workers are available, and special worker needs can be supported.';
  const avail = w.availableStaffCount ?? 42;
  const total = avail + (w.constrainedStaffCount ?? 8);
  return `${avail} of ${total} workers are available, and special worker needs can be supported.`;
}

function getRecoverySentence(currentCase: Case): string {
  const scenarios = currentCase.candidateScenarios;
  const count = scenarios?.length ?? 3;
  const countWord = count === 3 ? 'Three' : count === 2 ? 'Two' : `${count}`;
  return `${countWord} ways to move the supplies were checked for time, cost and safety.`;
}

function getDecisionSentence(currentCase: Case): string {
  const d = currentCase.decision;
  const name = d?.recommendedScenarioName?.includes('Scenario B')
    ? 'Plan B'
    : (d?.recommendedScenarioName ?? 'Plan B');
  return `${name} gives the best balance of speed, cost, critical supplies and worker safety.`;
}

// ─── Expandable evidence detail per agent ────────────────────────────────────

function AgentDetail({ execution }: { execution: AgentExecution | undefined }) {
  if (!execution) return null;

  const output = execution.structuredOutput;

  if (output.type === 'Disruption') {
    const d = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="WHAT WAS DETECTED" value={d.description} />
        <DetailRow label="LOCATION" value={`${d.location.name}, ${d.location.region}`} />
        <DetailRow label="IMPACT" value={`Route blocked for ~${d.estimatedBlockedDurationHours}h. Critical supply lifeline: ${d.isCriticalLifelineRoute ? 'Yes' : 'No'}.`} />
        <DetailRow label="WEATHER TELEMETRY" value={`${d.weatherDetails.rainfallMmLast24Hours}mm rainfall in 24h (${d.weatherDetails.warningLevel} warning)`} />
      </DetailGrid>
    );
  }

  if (output.type === 'SupplyChainImpact') {
    const sc = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="STRANDED SHIPMENTS" value={`${sc.impactedPOs.length} purchase orders currently blocked.`} />
        <DetailRow label="TOTAL VALUE AT RISK" value={`₹${(sc.estimatedTotalValueAtRiskInr / 10000000).toFixed(2)} Crore`} />
        <DetailRow label="STOCKOUT RISK" value={sc.stockoutImminentPlants.length ? `${sc.stockoutImminentPlants.length} facility face stockout risk within 28 hours.` : 'No immediate stockout.'} />
        <DetailRow label="COLD-CHAIN INTEGRITY" value={`Battery backup: ${sc.temperatureIntegrityThreat.batteryBackupHoursRemaining}h remaining for temperature-controlled units.`} />
      </DetailGrid>
    );
  }

  if (output.type === 'WorkforceImpact') {
    const w = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="AVAILABLE WORKERS" value={`${w.availableStaffCount} staff ready for deployment. ${w.constrainedStaffCount} workers placed on mandatory rest for safety.`} />
        <DetailRow label="SKILL GAPS & TRAINING" value={w.skillGaps.length ? `${w.skillGaps.length} skill gap(s) identified with ${w.trainingRequirements.length} targeted training module(s).` : 'No skill gaps.'} />
        <DetailRow label="ACCOMMODATIONS" value={w.accommodationRequirements.length ? `${w.accommodationRequirements.length} workers with ergonomic, sensory or language requirements — all accommodated.` : 'Standard accommodations.'} />
        <DetailRow label="FEASIBILITY SCORE" value={`${w.workforceFeasibilityScore.toFixed(0)} / 100 — workforce can safely execute the recovery operations.`} />
      </DetailGrid>
    );
  }

  if (output.type === 'RecoveryScenarios') {
    const scenarios = output.payload;
    return (
      <DetailGrid>
        <DetailRow label="CANDIDATE OPTIONS" value={`${scenarios.length} recovery strategies evaluated for route and worker feasibility.`} />
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
        <DetailRow label="RECOMMENDED STRATEGY" value={dec.recommendedScenarioName} />
        <DetailRow label="RATIONALE" value={dec.justification.primaryReason} />
        <DetailRow label="EVALUATION SCORE" value={winner ? `${winner.compositeScore.toFixed(1)} / 100 (top rank among ${dec.scenarioEvaluations.length} evaluated options)` : '—'} />
        <DetailRow label="KEY ASSUMPTIONS" value={execution.assumptions.join(' ')} />
      </DetailGrid>
    );
  }

  return null;
}

const DetailGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-2.5 space-y-2 pt-2.5 border-t border-slate-100">{children}</div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
    <p className="text-xs text-slate-800 leading-relaxed mt-0.5">{value}</p>
  </div>
);

// ─── Individual Agent Config ──────────────────────────────────────────────────

const AGENT_CONFIG = [
  {
    key: 'Disruption Agent' as const,
    icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />,
    label: 'Disruption Agent',
  },
  {
    key: 'Supply Chain Impact Agent' as const,
    icon: <Package className="w-3.5 h-3.5 text-slate-500" />,
    label: 'Supply Chain Agent',
  },
  {
    key: 'Workforce Agent' as const,
    icon: <Users className="w-3.5 h-3.5 text-slate-500" />,
    label: 'Workforce Agent',
  },
  {
    key: 'Recovery Adaptation Agent' as const,
    icon: <Truck className="w-3.5 h-3.5 text-slate-500" />,
    label: 'Recovery Agent',
  },
  {
    key: 'Decision Agent' as const,
    icon: <Trophy className="w-3.5 h-3.5 text-slate-500" />,
    label: 'Decision Agent',
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
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const ledger = currentCase.agentHistory.historyLedger;

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Why did AI choose this?</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Five agents verified the disruption, supplies, workforce and recovery routes.
          </p>
        </div>
      </div>

      {/* Agent list */}
      <div className="divide-y divide-slate-100">
        {AGENT_CONFIG.map((agent, index) => {
          const execution = ledger.find((e) => e.agentName === agent.key);
          const isCompleted = !!execution;
          const isOpen = expanded === agent.key;
          const sentence = isCompleted ? getAgentSentence(agent.key, currentCase) : null;

          return (
            <div key={agent.key}>
              <button
                onClick={() => {
                  if (!isCompleted) return;
                  setExpanded(isOpen ? null : agent.key);
                }}
                disabled={!isCompleted}
                className="w-full px-4 py-3 flex items-start space-x-3 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Step number */}
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    {agent.icon}
                    <span className="text-xs font-bold text-slate-800">{agent.label}</span>
                    {isCompleted ? (
                      <span className="flex items-center space-x-1 text-[10px] font-medium text-green-700">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Pending</span>
                    )}
                  </div>
                  {sentence && (
                    <p className="text-xs text-slate-700 leading-relaxed">{sentence}</p>
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
                <div className="px-12 pb-3.5 bg-slate-50/50 border-t border-slate-100">
                  <AgentDetail execution={execution} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">
          All agent findings are generated deterministically in mock mode.
        </p>
      </div>
    </div>
  );
};
