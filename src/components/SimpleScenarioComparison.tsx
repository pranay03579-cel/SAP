/**
 * SimpleScenarioComparison (Hard Flat Business Operations Design)
 *
 * Minimal, light-mode "see other options" panel.
 * Flat cards, rounded-md, clean table-like rows, zero gradients.
 */

import React, { useState } from 'react';
import {
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
      <div className="bg-white rounded-md border border-slate-200 p-6 text-center">
        <BarChart3 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Run the AI recovery analysis first to generate options.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Other recovery options</h3>
        </div>
        <span className="text-xs text-slate-500">Compare recovery time, cost and workforce safety.</span>
      </div>

      {/* Scenario list */}
      <div className="divide-y divide-slate-100">
        {sorted.map((scenario) => {
          const ev = evaluations.find((e) => e.scenarioId === scenario.scenarioId);
          const mx = matrix.find((m) => m.scenarioId === scenario.scenarioId);
          const isRecommended = scenario.scenarioId === recommendedId;
          const isOpen = expanded === scenario.scenarioId;

          return (
            <div key={scenario.scenarioId}>
              {/* Row button */}
              <button
                onClick={() => setExpanded(isOpen ? null : scenario.scenarioId)}
                className="w-full px-4 py-3 flex items-start space-x-3 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Rank badge */}
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5 ${
                    isRecommended
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ev?.rank ?? '—'}
                </span>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900">{scenario.scenarioName}</span>
                    {isRecommended && (
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{scenario.summary}</p>

                  {/* Quick metric row */}
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {mx && (
                      <>
                        <MetricChip icon={<Clock className="w-3 h-3 text-slate-500" />} value={`${mx.recoveryTimeHours}h`} label="recovery" />
                        <MetricChip icon={<DollarSign className="w-3 h-3 text-slate-500" />} value={`₹${(mx.costInr / 100000).toFixed(1)}L`} label="cost" />
                        <MetricChip icon={<Users className="w-3 h-3 text-slate-500" />} value={`${mx.workerWellBeingScore}/100`} label="workforce" />
                      </>
                    )}
                    {ev && (
                      <span className="inline-flex items-center text-[10px] font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        Score: {ev.compositeScore.toFixed(0)}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand toggle */}
                <div className="flex-shrink-0 mt-1 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-12 pb-3.5 bg-slate-50 border-t border-slate-100 space-y-3 pt-2.5">
                  {/* Trade-off summary */}
                  {ev && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Trade-off evaluation
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">{ev.tradeOffSummary}</p>
                    </div>
                  )}

                  {/* Action components */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Tactical Transport Actions ({scenario.recoveryOptions.length})
                    </span>
                    <div className="space-y-1.5">
                      {scenario.recoveryOptions.map((opt) => (
                        <div
                          key={opt.optionId}
                          className="flex items-start space-x-2 p-2 bg-white rounded border border-slate-200 text-xs"
                        >
                          <div className="text-slate-500 mt-0.5">
                            <ModalityIcon modality={opt.modality} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800">{opt.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">{modalityLabel(opt.modality)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                            <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-600">
                              <span>Lead time: <strong className="text-slate-800">{opt.leadTimeHours}h</strong></span>
                              <span>Cost: <strong className="text-slate-800">₹{(opt.estimatedCostInr / 100000).toFixed(2)}L</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risks */}
                  {ev && ev.risks.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Identified Risks
                      </span>
                      <ul className="space-y-0.5">
                        {ev.risks.map((r, i) => (
                          <li key={i} className="flex items-start space-x-1.5 text-xs text-slate-600">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Select for approval CTA */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {isRecommended
                        ? 'This is the AI-recommended option.'
                        : 'You can override and approve this alternative plan.'}
                    </span>
                    <button
                      onClick={() => onSelectScenarioForApproval(scenario.scenarioId)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isRecommended
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRecommended ? 'Approve This Plan' : 'Select for Approval'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">
          All options evaluated across 7 weighted decision criteria.
        </p>
      </div>
    </div>
  );
};

const MetricChip: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <span className="inline-flex items-center space-x-1 text-[11px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
    {icon}
    <strong className="font-mono font-semibold text-slate-900">{value}</strong>
    <span className="text-slate-500">{label}</span>
  </span>
);
