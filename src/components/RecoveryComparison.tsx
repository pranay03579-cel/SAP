/**
 * RecoveryComparison — Phase 5 Enhanced UI
 *
 * Shows the full transparent score breakdown per scenario per criterion.
 * Scores are sourced directly from Decision.scenarioEvaluations — not hardcoded.
 * The recommended scenario is highlighted based on the computed rank, not a fixed ID.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Clock,
  DollarSign,
  HeartHandshake,
  Leaf,
  AlertTriangle,
  ShieldCheck,
  Plane,
  Train,
  Truck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Info,
  Package,
} from 'lucide-react';
import { Case, RecoveryScenario, ScenarioEvaluation } from '../../shared/types/domain';

interface RecoveryComparisonProps {
  currentCase: Case;
  onSelectScenarioForApproval: (scenarioId: string) => void;
}

const CRITERION_ICONS: Record<string, React.ReactNode> = {
  recoveryEffectiveness: <ShieldCheck className="w-3 h-3" />,
  recoveryTime: <Clock className="w-3 h-3" />,
  cost: <DollarSign className="w-3 h-3" />,
  risk: <AlertTriangle className="w-3 h-3" />,
  criticalShipmentProtection: <Package className="w-3 h-3" />,
  workforceFeasibility: <HeartHandshake className="w-3 h-3" />,
  operationalImpact: <Leaf className="w-3 h-3" />,
};

const CRITERION_COLORS: Record<string, string> = {
  recoveryEffectiveness: 'text-blue-400',
  recoveryTime: 'text-yellow-400',
  cost: 'text-emerald-400',
  risk: 'text-red-400',
  criticalShipmentProtection: 'text-purple-400',
  workforceFeasibility: 'text-pink-400',
  operationalImpact: 'text-teal-400',
};

function getModalityIcon(modality: string) {
  switch (modality) {
    case 'AIR_CHARTER': return <Plane className="w-3.5 h-3.5 text-blue-400" />;
    case 'RAIL_FREIGHT': return <Train className="w-3.5 h-3.5 text-yellow-400" />;
    case 'FEEDER_ROAD': return <Truck className="w-3.5 h-3.5 text-slate-400" />;
    default: return <Truck className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-300 w-8 text-right">{value.toFixed(0)}</span>
    </div>
  );
}

function barColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export const RecoveryComparison: React.FC<RecoveryComparisonProps> = ({
  currentCase,
  onSelectScenarioForApproval,
}) => {
  const scenarios = currentCase.candidateScenarios || [];
  const decision = currentCase.decision;
  const evaluations: ScenarioEvaluation[] = decision?.scenarioEvaluations ?? [];
  const recommendedId = decision?.recommendedScenarioId;
  const topScore = evaluations[0]?.compositeScore ?? null;

  const [expandedScenario, setExpandedScenario] = useState<string | null>(recommendedId ?? null);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown'>('overview');

  const getEvaluation = (scenarioId: string): ScenarioEvaluation | undefined =>
    evaluations.find((e) => e.scenarioId === scenarioId);

  if (scenarios.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-sap-muted">
        <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Recovery scenarios not yet generated. Run the multi-agent pipeline first.</p>
      </div>
    );
  }

  // Sort scenarios to match evaluation order (rank 1 first)
  const sortedScenarios = [...scenarios].sort((a, b) => {
    const ea = getEvaluation(a.scenarioId);
    const eb = getEvaluation(b.scenarioId);
    return (ea?.rank ?? 99) - (eb?.rank ?? 99);
  });

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
              MULTI-CRITERIA SCENARIO ANALYSIS
            </span>
            <span className="text-xs font-mono text-sap-muted">
              {evaluations[0]?.criteria.length ?? 7} criteria · {scenarios.length} scenarios evaluated
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Recovery Strategy Simulation & Transparent Score Breakdown
          </h2>
          <p className="text-xs text-sap-muted mt-1">
            Winner determined by weighted multi-criteria engine. Changing scenario data or weights changes the recommendation.
          </p>
        </div>

        {topScore !== null && (
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-sap-dark border border-sap-border text-slate-300">
              Top Score: <strong className="text-emerald-400 font-mono">{topScore.toFixed(1)} / 100</strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 bg-sap-dark/60 rounded-xl p-1 border border-sap-border w-fit">
        {(['overview', 'breakdown'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-sap-accent text-white shadow-md'
                : 'text-sap-muted hover:text-white'
            }`}
          >
            {tab === 'overview' ? '📋 Overview' : '📊 Score Breakdown'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {sortedScenarios.map((scenario: RecoveryScenario) => {
            const ev = getEvaluation(scenario.scenarioId);
            const isRecommended = scenario.scenarioId === recommendedId;
            const isExpanded = expandedScenario === scenario.scenarioId;

            return (
              <div
                key={scenario.scenarioId}
                className={`bg-slate-900 rounded-md flex flex-col transition-all relative overflow-hidden ${
                  isRecommended
                    ? 'border-2 border-emerald-500 bg-slate-900'
                    : 'border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Rank ribbon */}
                {ev && (
                  <div className={`px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider ${
                    isRecommended
                      ? 'bg-emerald-600 text-white'
                      : ev.rank === 2 ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isRecommended && <Sparkles className="w-3.5 h-3.5" />}
                    <span>
                      {isRecommended ? 'AI Recommended · Rank #1' : `Rank #${ev.rank}`}
                    </span>
                    <span className="font-mono">· {ev.compositeScore.toFixed(1)}/100</span>
                  </div>
                )}

                <div className="p-5 space-y-4 flex-1">
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-slate-400">{scenario.scenarioId}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">{scenario.scenarioName}</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">{scenario.summary}</p>
                  </div>

                  {/* Composite score bar */}
                  {ev && (
                    <div className="bg-slate-800 rounded-md p-3 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composite Score</span>
                        <span className={`text-sm font-bold font-mono ${isRecommended ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {ev.compositeScore.toFixed(1)} / 100
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isRecommended ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${ev.compositeScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Trade-off grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-sap-dark/80 p-2.5 rounded-lg border border-sap-border/60">
                      <span className="text-[10px] text-sap-muted block">Incremental Cost</span>
                      <span className="text-sm font-bold text-white font-mono">
                        ₹{(scenario.tradeOffs.incrementalCostInr / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="bg-sap-dark/80 p-2.5 rounded-lg border border-sap-border/60">
                      <span className="text-[10px] text-sap-muted block">Recovery Time</span>
                      <span className="text-sm font-bold text-yellow-400 font-mono">
                        {scenario.tradeOffs.estimatedRecoveryHours}h
                      </span>
                    </div>
                    <div className="bg-sap-dark/80 p-2.5 rounded-lg border border-sap-border/60">
                      <span className="text-[10px] text-sap-muted block">Worker Well-Being</span>
                      <span className={`text-sm font-bold font-mono ${scenario.tradeOffs.workerWellBeingScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {scenario.tradeOffs.workerWellBeingScore}/100
                      </span>
                    </div>
                    <div className="bg-sap-dark/80 p-2.5 rounded-lg border border-sap-border/60">
                      <span className="text-[10px] text-sap-muted block">SLA Adherence</span>
                      <span className={`text-sm font-bold font-mono ${scenario.tradeOffs.slaAdherencePercentage >= 90 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {scenario.tradeOffs.slaAdherencePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Workforce safety */}
                  <div className="bg-sap-dark/60 p-3 rounded-xl border border-sap-border text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                        Workforce Safety
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scenario.workforceSafetyAssessment.burnoutRiskCategory === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {scenario.workforceSafetyAssessment.burnoutRiskCategory} BURNOUT
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-sap-muted">Accommodations:</span>
                      <span className={scenario.workforceSafetyAssessment.allAccommodationsRespected ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {scenario.workforceSafetyAssessment.allAccommodationsRespected ? '✓ Fully Respected' : '✗ Breached'}
                      </span>
                    </div>
                  </div>

                  {/* Risks (expandable) */}
                  {ev && (
                    <div>
                      <button
                        onClick={() => setExpandedScenario(isExpanded ? null : scenario.scenarioId)}
                        className="flex items-center gap-1.5 text-[11px] text-sap-muted hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? 'Hide' : 'Show'} risks & expected impact
                      </button>
                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          <div className="space-y-1">
                            {ev.risks.map((r, i) => (
                              <div key={i} className="flex gap-1.5 text-[11px] text-amber-300">
                                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-2.5 bg-sap-dark/80 rounded-lg border border-sap-border/60">
                            <span className="text-[10px] font-bold text-sap-muted uppercase block mb-1">Expected Impact</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{ev.expectedImpact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recovery actions */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-sap-muted uppercase tracking-wider block">
                      Tactical Actions ({scenario.recoveryOptions.length})
                    </span>
                    {scenario.recoveryOptions.map((opt) => (
                      <div key={opt.optionId} className="p-2.5 bg-sap-dark/90 rounded-lg border border-sap-border/60 text-xs">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          {getModalityIcon(opt.modality)}
                          <span>{opt.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 pt-0 border-t border-sap-border/60 mt-2">
                  <button
                    onClick={() => onSelectScenarioForApproval(scenario.scenarioId)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isRecommended
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-sap-border'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isRecommended ? 'Approve Recommended Plan' : `Override & Select ${ev?.rank === 2 ? '#2' : '#3'}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Score Breakdown Tab ── */}
      {activeTab === 'breakdown' && (
        <div className="space-y-4">
          {/* Weights legend */}
          {decision?.appliedWeights && (
            <div className="glass-panel p-4 rounded-xl border border-sap-border/60">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-sap-accent" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Applied Scoring Weights</span>
                <span className="text-[10px] text-sap-muted font-mono">(sum = 1.0)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(decision.appliedWeights).map(([key, val]) => (
                  <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-sap-dark/80 rounded-lg border border-sap-border text-[11px]">
                    <span className={CRITERION_COLORS[key]}>{CRITERION_ICONS[key]}</span>
                    <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-mono font-bold text-white">{(val * 100).toFixed(0)}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Per-scenario breakdown table */}
          {evaluations.map((ev) => {
            const isRecommended = ev.scenarioId === recommendedId;
            return (
              <div
                key={ev.scenarioId}
                className={`glass-panel rounded-2xl overflow-hidden border ${
                  isRecommended ? 'border-emerald-500/60' : 'border-sap-border/60'
                }`}
              >
                {/* Scenario header */}
                <div className={`px-5 py-3 flex items-center justify-between ${isRecommended ? 'bg-emerald-950/30' : 'bg-sap-dark/60'}`}>
                  <div className="flex items-center gap-3">
                    {isRecommended && <Sparkles className="w-4 h-4 text-emerald-400" />}
                    <div>
                      <span className="text-xs font-bold text-white">{ev.scenarioName}</span>
                      <span className="text-[10px] text-sap-muted block">Rank #{ev.rank}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold font-mono ${isRecommended ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {ev.compositeScore.toFixed(1)}
                    </span>
                    <span className="text-sap-muted text-xs block">/100 composite</span>
                  </div>
                </div>

                {/* Criteria table */}
                <div className="divide-y divide-sap-border/40">
                  {ev.criteria.map((c) => (
                    <div key={c.criterion} className="px-5 py-3 grid grid-cols-12 gap-3 items-center text-xs">
                      <div className="col-span-3 flex items-center gap-2">
                        <span className={CRITERION_COLORS[c.criterion]}>{CRITERION_ICONS[c.criterion]}</span>
                        <span className="text-slate-200 font-medium text-[11px]">{c.label}</span>
                      </div>
                      <div className="col-span-2 text-sap-muted font-mono text-[10px]">{c.rawValue}</div>
                      <div className="col-span-4">
                        <ScoreBar value={c.normalizedScore} color={barColor(c.normalizedScore)} />
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-[10px] font-mono text-slate-400">{(c.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-mono font-bold text-white text-[11px]">+{c.weightedScore.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trade-off summary */}
                <div className="px-5 py-3 bg-sap-dark/40 border-t border-sap-border/60">
                  <div className="flex items-start gap-2 text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-sap-muted" />
                    <span>{ev.tradeOffSummary}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
