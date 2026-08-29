import React from 'react';
import { 
  CheckCircle2
} from 'lucide-react';
import { Case, AgentExecution } from '../../shared/types/domain';

interface AuditLedgerViewProps {
  currentCase: Case;
  onSelectExecution: (execution: AgentExecution) => void;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({
  currentCase,
  onSelectExecution,
}) => {
  const history = currentCase.agentHistory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-sap-accent rounded border border-blue-500/30">
              TAMPER-EVIDENT STATE LEDGER
            </span>
            <span className="text-xs font-mono text-sap-muted">Case: {history.caseId}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Immutable Agent Execution & Evidence Audit Log
          </h2>
          <p className="text-xs text-sap-muted mt-1">
            Strict append-only event store recording every specialized agent calculation, input hash, confidence score, and justification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-lg bg-sap-dark border border-sap-border text-xs text-slate-300">
            Total Entries: <strong className="text-white font-mono">{history.totalExecutions}</strong>
          </span>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sap-dark/80 text-sap-muted border-b border-sap-border uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Index</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Evidence Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sap-border/60">
              {history.historyLedger.map((exec, idx) => (
                <tr
                  key={exec.executionId}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => onSelectExecution(exec)}
                >
                  <td className="py-3.5 px-4 font-mono text-sap-muted">0{idx + 1}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {new Date(exec.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {exec.agentName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sap-cyan text-[11px]">
                    {exec.executionId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      {(exec.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {exec.evidence.length} items
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 font-semibold text-[11px] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{exec.executionStatus}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-sap-border transition-colors">
                      View Payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
