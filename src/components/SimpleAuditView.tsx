/**
 * SimpleAuditView (Hard Flat Business Operations Design)
 *
 * Minimal, light-mode audit trail panel ("Decision history").
 * Flat cards, rounded-md, clean neutral rows.
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

export const SimpleAuditView: React.FC<SimpleAuditViewProps> = ({
  currentCase,
  onSelectExecution,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const ledger = currentCase.agentHistory.historyLedger;

  if (ledger.length === 0) {
    return (
      <div className="bg-white rounded-md border border-slate-200 p-6 text-center">
        <Shield className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400">No agent executions recorded yet. Run the AI recovery analysis first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Decision history</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of all agent actions.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono">
          <Lock className="w-3 h-3" />
          <span>TAMPER-EVIDENT LEDGER</span>
        </div>
      </div>

      {/* Ledger rows */}
      <div className="divide-y divide-slate-100">
        {ledger.map((exec, idx) => {
          const isOpen = expanded === exec.executionId;

          return (
            <div key={exec.executionId}>
              <button
                onClick={() => setExpanded(isOpen ? null : exec.executionId)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                {/* Index + Name */}
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{exec.agentName}</span>
                </div>

                {/* Status + Toggle */}
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-[11px] font-medium text-green-700">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span>Completed</span>
                  </span>
                  <div className="text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-12 pb-3.5 pt-1.5 space-y-2.5 border-t border-slate-100 bg-slate-50/50">

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {(exec.confidence * 100).toFixed(0)}% confidence
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatTs(exec.timestamp)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {exec.executionId}
                    </span>
                  </div>

                  {/* Summary */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Execution Summary</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{exec.humanReadableSummary}</p>
                  </div>

                  {/* Assumptions */}
                  {exec.assumptions.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Assumptions made</span>
                      <ul className="space-y-0.5">
                        {exec.assumptions.map((a, i) => (
                          <li key={i} className="flex items-start space-x-1.5 text-xs text-slate-600">
                            <span className="text-slate-400 font-mono mt-0.5">·</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence */}
                  {exec.evidence.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Evidence ({exec.evidence.length} items)
                      </span>
                      <div className="space-y-1">
                        {exec.evidence.slice(0, 4).map((e, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs">
                            <span className="flex-shrink-0 w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-slate-700">{e.description}</span>
                          </div>
                        ))}
                        {exec.evidence.length > 4 && (
                          <p className="text-[11px] text-slate-400 pl-5">
                            +{exec.evidence.length - 4} more items. Click below to inspect raw payload.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full payload link */}
                  <div className="pt-0.5">
                    <button
                      onClick={() => onSelectExecution(exec)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 transition-colors"
                    >
                      View complete structured payload →
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
          Case ID: <span className="font-mono">{currentCase.agentHistory.caseId}</span> · {currentCase.agentHistory.totalExecutions} total executions recorded in ledger
        </p>
      </div>
    </div>
  );
};
