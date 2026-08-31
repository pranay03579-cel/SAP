/**
 * SimpleScenarioComparison — Phase 12
 *
 * Minimal, light-mode "see other options" panel.
 * Shows all 3 recovery scenarios with key metrics and score.
 * Same design language as SimpleAgentTimeline.
 *
 * Data: currentCase.candidateScenarios + currentCase.decision.scenarioEvaluations
 */

import React, { useState } from 'react';
import {
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  BarChart3,
  Plane,
  Train,
  Truck,
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface SimpleScenarioComparisonProps {
  currentCase: Case;
  onSelectScenarioForApproval: (scenarioId: string) => void;
}

function modalityLabel(m: string): string {
  switch (m) {
    case 'AIR_CHARTER': return 'Air charter';
    case 'RAIL_FREIGHT': return 'Rail freight';
    case 'FEEDER_ROAD':  return 'Road bypass';
    default:             return m.replace(/_/g, ' ').toLowerCase();
  }
}

function ModalityIcon({ modality }: { modality: string }) {
  const cls = 'w-3.5 h-3.5';
  switch (modality) {
    case 'AIR_CHARTER':  return <Plane className={cls} />;
    case 'RAIL_FREIGHT': return <Train className={cls} />;
    default:             return <Truck className={cls} />;
  }
}

export const SimpleScenarioComparison: React.FC<SimpleScenarioComparisonProps> = ({
  currentCase,
  onSelectScenarioForApproval,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const scenarios = currentCase.candidateScenarios ?? [];
  const evaluations = currentCase.decision?.scenarioEvaluations ?? [];
  const matrix = currentCase.decision?.comparativeMatrix ?? [];
  const recommendedId = currentCase.decision?.recommendedScenarioId;

  // Sort: recommended first
  const sorted = [...scenarios].sort((a, b) => {
    const ea = evaluations.find((e) => e.scenarioId === a.scenarioId);
    const eb = evaluations.find((e) => e.scenarioId === b.scenarioId);
    return (ea?.rank ?? 99) - (eb?.rank ?? 99);
  });

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <BarChart3 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Run the AI pipeline first to generate recovery options.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Other recovery options</h3>
        </div>
        <span className="text-xs text-slate-400">See how the other recovery options compare.</span>
      </div>

      {/* Scenario list */}
      <div className="divide-y divide-slate-100">
        {sorted.map((scenario) => {
          const ev = evaluations.find((e) => e.scenarioId === scenario.scenarioId);
          const mx = matrix.find((m) => m.scenarioId === scenario.scenarioId);
          const isRecommended = scenario.scenarioId === recommendedId;
          const isOpen = expanded === scenario.scenarioId;

          return (
            <div
              key={scenario.scenarioId}
              className={`border-l-4 ${isRecommended ? 'border-l-green-400' : 'border-l-slate-200'}`}
            >
              {/* Row button */}
              <button
                onClick={() => setExpanded(isOpen ? null : scenario.scenarioId)}
                className="w-full px-5 py-4 flex items-start space-x-3 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Rank badge */}
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5 ${
                    isRecommended
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {ev?.rank ?? '—'}
                </span>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{scenario.scenarioName}</span>
                    {isRecommended && (
                      <span className="flex items-center space-x-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                        <Star className="w-2.5 h-2.5" />
                        <span>Recommended</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{scenario.summary}</p>

                  {/* Quick metric row */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {mx && (
                      <>
                        <MetricChip icon={<Clock className="w-3 h-3 text-blue-500" />} value={`${mx.recoveryTimeHours}h`} label="recovery" />
                        <MetricChip icon={<DollarSign className="w-3 h-3 text-green-500" />} value={`₹${(mx.costInr / 100000).toFixed(1)}L`} label="cost" />
                        <MetricChip icon={<Users className="w-3 h-3 text-violet-500" />} value={`${mx.workerWellBeingScore}/100`} label="well-being" />
                      </>
                    )}
                    {ev && (
                      <MetricChip
                        icon={<span className="text-[10px] font-bold text-slate-500">⬡</span>}
                        value={`${ev.compositeScore.toFixed(0)}/100`}
                        label="score"
                        highlight={isRecommended}
                      />
                    )}
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex-shrink-0 mt-1 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-14 pb-5 space-y-4">
                  {/* Trade-off grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <DetailCell label="COST" value={`₹${(scenario.tradeOffs.incrementalCostInr / 100000).toFixed(1)}L`} />
                    <DetailCell label="RECOVERY TIME" value={`${scenario.tradeOffs.estimatedRecoveryHours}h`} />
                    <DetailCell label="WORKER WELL-BEING" value={`${scenario.tradeOffs.workerWellBeingScore}/100`} />
                    <DetailCell label="SLA ADHERENCE" value={`${scenario.tradeOffs.slaAdherencePercentage}%`} />
                  </div>

                  {/* Workforce safety */}
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Workforce Safety</span>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          scenario.workforceSafetyAssessment.burnoutRiskCategory === 'LOW'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {scenario.workforceSafetyAssessment.burnoutRiskCategory} burnout risk
                      </span>
                      <span className={`text-xs font-medium ${scenario.workforceSafetyAssessment.allAccommodationsRespected ? 'text-green-700' : 'text-red-600'}`}>
                        {scenario.workforceSafetyAssessment.allAccommodationsRespected ? '✓ All accommodations respected' : '✗ Accommodations breached'}
                      </span>
                    </div>
                  </div>

                  {/* Recovery actions */}
                  {scenario.recoveryOptions.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Actions ({scenario.recoveryOptions.length})</span>
                      <div className="space-y-1.5">
                        {scenario.recoveryOptions.map((opt) => (
                          <div key={opt.optionId} className="flex items-start space-x-2 text-xs text-slate-600">
                            <ModalityIcon modality={opt.modality} />
                            <div>
                              <span className="font-semibold text-slate-800">{opt.name}</span>
                              <span className="text-slate-400 ml-1">· {modalityLabel(opt.modality)}</span>
                              <p className="text-slate-500 text-[11px] mt-0.5">{opt.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {ev && ev.risks.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Risks</span>
                      <div className="space-y-1">
                        {ev.risks.map((r, i) => (
                          <div key={i} className="flex items-start space-x-1.5 text-xs text-amber-700">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => onSelectScenarioForApproval(scenario.scenarioId)}
                    className={`mt-1 flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRecommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRecommended ? 'Approve this plan' : 'Override & select this plan'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">
          Scores computed by weighted multi-criteria engine across {evaluations[0]?.criteria.length ?? 7} criteria — all from mock data.
        </p>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetricChip: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
}> = ({ icon, value, label, highlight }) => (
  <div className={`flex items-center space-x-1 text-[11px] rounded-md px-2 py-0.5 border ${highlight ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
    {icon}
    <span className="font-bold">{value}</span>
    <span className="text-slate-400">{label}</span>
  </div>
);

const DetailCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</span>
    <span className="text-sm font-bold text-slate-800 font-mono">{value}</span>
  </div>
);
