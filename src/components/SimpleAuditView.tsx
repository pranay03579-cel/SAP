/**
 * SimpleAuditView — Phase 12
 *
 * Minimal, light-mode audit trail panel.
 * Same design language as SimpleAgentTimeline.
 *
 * Shows each agent execution as a row with:
 *   - agent name + timestamp
 *   - confidence score
 *   - evidence count
 *   - expandable: assumptions + evidence items
 *
 * No raw chain-of-thought exposed.
 */

import React, { useState } from 'react';
import {
  Shield,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Case, AgentExecution } from '../../shared/types/domain';

interface SimpleAuditViewProps {
  currentCase: Case;
  onSelectExecution: (execution: AgentExecution) => void;
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

function confidenceColor(c: number): string {
  if (c >= 0.9) return 'bg-green-50 text-green-700 border-green-200';
  if (c >= 0.75) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export const SimpleAuditView: React.FC<SimpleAuditViewProps> = ({
  currentCase,
  onSelectExecution,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const ledger = currentCase.agentHistory.historyLedger;

  if (ledger.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <Shield className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No agent executions recorded yet. Run the AI pipeline first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Audit trail</h3>
          <span className="text-xs text-slate-400">— {ledger.length} entries</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
          <Lock className="w-3 h-3" />
          <span>APPEND-ONLY · TAMPER-EVIDENT</span>
        </div>
      </div>

      {/* Ledger rows */}
      <div className="divide-y divide-slate-100">
        {ledger.map((exec, idx) => {
          const isOpen = expanded === exec.executionId;

          return (
            <div key={exec.executionId} className="border-l-4 border-l-slate-200">
              <button
                onClick={() => setExpanded(isOpen ? null : exec.executionId)}
                className="w-full px-5 py-4 flex items-start space-x-3 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Index */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>

                {/* Main */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{exec.agentName}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${confidenceColor(exec.confidence)}`}>
                      {(exec.confidence * 100).toFixed(0)}% confidence
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] text-green-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{exec.executionStatus}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{formatTs(exec.timestamp)}</p>
                  <p className="text-xs text-slate-600 mt-1">{exec.humanReadableSummary}</p>
                </div>

                {/* Toggle */}
                <div className="flex-shrink-0 mt-1 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-14 pb-5 space-y-4">

                  {/* Execution ID */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Execution ID</span>
                    <p className="text-[11px] font-mono text-slate-500 break-all">{exec.executionId}</p>
                  </div>

                  {/* Assumptions */}
                  {exec.assumptions.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Assumptions made</span>
                      <ul className="space-y-1">
                        {exec.assumptions.map((a, i) => (
                          <li key={i} className="flex items-start space-x-1.5 text-xs text-slate-600">
                            <span className="text-slate-300 font-mono mt-0.5">·</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence */}
                  {exec.evidence.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Evidence ({exec.evidence.length} items)
                      </span>
                      <div className="space-y-1.5">
                        {exec.evidence.slice(0, 4).map((e, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs">
                            <span className="flex-shrink-0 w-4 h-4 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[9px] font-bold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-slate-600">{e.description}</span>
                          </div>
                        ))}
                        {exec.evidence.length > 4 && (
                          <p className="text-[11px] text-slate-400 pl-6">
                            +{exec.evidence.length - 4} more items. Click "View full payload" for complete record.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full payload link */}
                  <button
                    onClick={() => onSelectExecution(exec)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 transition-colors"
                  >
                    View complete structured payload →
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
          Case ID: <span className="font-mono">{currentCase.agentHistory.caseId}</span> · {currentCase.agentHistory.totalExecutions} total executions recorded
        </p>
      </div>
    </div>
  );
};
