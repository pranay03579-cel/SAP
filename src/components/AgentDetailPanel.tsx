import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  Layers, 
  Copy, 
  Check 
} from 'lucide-react';
import { AgentExecution } from '../../shared/types/domain';

interface AgentDetailPanelProps {
  execution: AgentExecution | null;
  onClose: () => void;
}

export const AgentDetailPanel: React.FC<AgentDetailPanelProps> = ({ execution, onClose }) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'evidence' | 'assumptions' | 'raw'>('structured');
  const [copied, setCopied] = useState(false);

  if (!execution) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(execution, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">{execution.agentName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                  {execution.executionStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{execution.executionId} · {new Date(execution.timestamp).toUTCString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyJson}
              className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-xs flex items-center space-x-1"
              title="Copy Execution Payload"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Confidence & Summary Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Confidence Rating:</span>
            <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden inline-block align-middle">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${execution.confidence * 100}%` }}
              ></div>
            </div>
            <span className="font-bold text-green-700 font-mono">
              {(execution.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-600">
            <span>Evidence Items: <strong className="text-slate-900">{execution.evidence.length}</strong></span>
            <span>Assumptions: <strong className="text-slate-900">{execution.assumptions.length}</strong></span>
          </div>
        </div>

        {/* Inspector Navigation Tabs */}
        <div className="px-6 border-b border-slate-100 bg-white">
          <div className="flex space-x-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('structured')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'structured'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Structured Findings
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'evidence'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Evidence Registry ({execution.evidence.length})
            </button>
            <button
              onClick={() => setActiveTab('assumptions')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'assumptions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Assumptions ({execution.assumptions.length})
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-1 ${
                activeTab === 'raw'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw JSON Ledger</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-white">
          {activeTab === 'structured' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Executive Finding Summary
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {execution.humanReadableSummary}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  Output Model Type: {execution.structuredOutput.type}
                </span>
                <pre className="p-3 bg-white rounded-lg text-slate-800 font-mono text-[11px] overflow-x-auto border border-slate-200">
                  {JSON.stringify(execution.structuredOutput.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              {execution.evidence.map((item) => (
                <div
                  key={item.evidenceId}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        {item.sourceType}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{item.sourceReference}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(item.observedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700">{item.description}</p>
                  <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
                    {JSON.stringify(item.payloadSnippet, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'assumptions' && (
            <div className="space-y-2">
              {execution.assumptions.map((assump, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs"
                >
                  <span className="font-mono text-amber-600 font-bold">{idx + 1}.</span>
                  <p className="text-slate-800">{assump}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <pre className="p-4 bg-slate-50 rounded-xl text-slate-800 font-mono text-xs overflow-x-auto border border-slate-200 leading-relaxed">
              {JSON.stringify(execution, null, 2)}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Append-Only Ledger Reference: <code className="text-slate-700 font-mono">{execution.inputReference.caseId}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
