import { useState } from 'react';
import { MOCK_DISRUPTION_CASE } from '../shared/mock/disruptionCase';
import { Case, AgentExecution, Approval, ApprovalStatus } from '../shared/types/domain';
import { pipelineOrchestrator } from './services/orchestrator';

// ── Core layout ──────────────────────────────────────────────────────────────
import { Header } from './components/Header';

// ── Primary view ─────────────────────────────────────────────────────────────
import { ControlTower } from './components/ControlTower';

// ── Secondary detail panels ────────────────────────────────────────────
import { SimpleAgentTimeline } from './components/SimpleAgentTimeline';
import { SimpleScenarioComparison } from './components/SimpleScenarioComparison';
import { SimpleWorkforceView } from './components/SimpleWorkforceView';
import { SimpleAuditView } from './components/SimpleAuditView';

// ── Modals ────────────────────────────────────────────────────────────────────
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { AgentDetailPanel } from './components/AgentDetailPanel';

// ── Panel type ────────────────────────────────────────────────────────────────
type ActivePanel = 'analysis' | 'alternatives' | 'workforce' | 'audit' | null;

export default function App() {
  // ── Case & pipeline state ──────────────────────────────────────────────────
  const [currentCase, setCurrentCase] = useState<Case>(MOCK_DISRUPTION_CASE);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [selectedExecution, setSelectedExecution] = useState<AgentExecution | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState<boolean>(false);

  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [pipelineToast, setPipelineToast] = useState<{
    message: string;
    type: 'info' | 'success' | 'error';
  } | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const isPipelineComplete = !!currentCase.decision;

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setPipelineToast({ message, type });
    setTimeout(() => setPipelineToast(null), 4000);
  };

  // ── Pipeline handlers (logic unchanged) ────────────────────────────────────
  const handleRunFullPipeline = async () => {
    setIsPipelineRunning(true);
    showToast('Starting autonomous 5-agent recovery pipeline…', 'info');
    try {
      const resultCase = await pipelineOrchestrator.executePipeline(
        currentCase,
        { stepDelayMs: 400 },
        (_update, updatedCase) => {
          setCurrentCase({ ...updatedCase });
        }
      );
      setCurrentCase(resultCase);
      showToast('Multi-Agent Analysis Completed! Decision ready for review.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // ── Scenario selection for approval ───────────────────────────────────────
  const handleSelectScenarioForApproval = (scenarioId: string) => {
    if (currentCase.decision) {
      const scenario = currentCase.candidateScenarios?.find((s) => s.scenarioId === scenarioId);
      if (scenario) {
        setCurrentCase((prev) => ({
          ...prev,
          decision: prev.decision
            ? {
                ...prev.decision,
                recommendedScenarioId: scenario.scenarioId,
                recommendedScenarioName: scenario.scenarioName,
              }
            : undefined,
        }));
      }
    }
    setIsApprovalOpen(true);
  };

  // ── Approval helpers ───────────────────────────────────────────────────────
  const buildApproval = (prev: Case, status: ApprovalStatus, notes: string): Approval => {
    if (prev.approval) {
      return { ...prev.approval, status, reviewNotes: notes, approvedAt: new Date().toISOString() };
    }
    return {
      approvalId: `APP-${prev.caseId}-${Date.now()}`,
      caseId: prev.caseId,
      decisionId: prev.decision?.decisionId ?? 'UNKNOWN',
      selectedScenarioId: prev.decision?.recommendedScenarioId ?? 'UNKNOWN',
      status,
      approverUser: {
        userId: 'DEMO-USER',
        name: 'Dr. Ananya Mehta',
        role: 'Regional Disaster Response & Supply Chain Director',
        department: 'Northeast Logistics & Humanitarian Operations',
      },
      reviewNotes: notes,
      approvedAt: new Date().toISOString(),
      appliedOverrides: { budgetApprovalGranted: true },
    };
  };

  const handleConfirmApproval = (status: ApprovalStatus, notes: string) => {
    setCurrentCase((prev) => ({
      ...prev,
      status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      approval: buildApproval(prev, status, notes),
    }));
  };

  const handleQuickReject = () => {
    setCurrentCase((prev) => ({
      ...prev,
      status: 'REJECTED',
      approval: buildApproval(
        prev,
        'REJECTED',
        'Rejected by operator. Requires alternative highway or rail bypass.'
      ),
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">

      {/* Simplified Header — Very top of page */}
      <Header currentCase={currentCase} onOpenApproval={() => setIsApprovalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 py-4 space-y-3">

        {/* Toast Notification */}
        {pipelineToast && (
          <div
            className={`max-w-2xl mx-auto p-2.5 rounded-md text-xs font-medium flex items-center justify-between border ${
              pipelineToast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : pipelineToast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <span>{pipelineToast.message}</span>
            <button
              onClick={() => setPipelineToast(null)}
              className="text-xs opacity-60 hover:opacity-100 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Approval / Rejection Status Banner */}
        {currentCase.status === 'APPROVED' && (
          <div className="max-w-2xl mx-auto p-2.5 rounded-md bg-green-50 border border-green-200 flex items-center justify-between text-xs text-green-800">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
              <span className="font-bold uppercase tracking-wider">Recovery Plan Approved</span>
              <span className="text-green-700">— Simulated dispatch confirmed (MOCK MODE)</span>
            </div>
            <span className="font-mono text-green-700 font-semibold text-[10px]">SIMULATED_DISPATCH_CONFIRMED</span>
          </div>
        )}

        {currentCase.status === 'REJECTED' && (
          <div className="max-w-2xl mx-auto p-2.5 rounded-md bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-red-600 flex-shrink-0" />
              <span className="font-bold uppercase tracking-wider">Recovery Plan Rejected</span>
              <span>— Awaiting operator review.</span>
            </div>
            <button
              onClick={() => setIsApprovalOpen(true)}
              className="px-2.5 py-1 bg-white hover:bg-red-50 rounded border border-red-300 font-semibold text-[11px] text-red-700 transition-colors"
            >
              Re-open Review
            </button>
          </div>
        )}

        {/* ── PRIMARY VIEW: Control Tower ──────────────────────────────── */}
        <ControlTower
          currentCase={currentCase}
          activePanel={activePanel}
          onOpenPanel={setActivePanel}
          onOpenApproval={() => setIsApprovalOpen(true)}
          onRejectApproval={handleQuickReject}
          isPipelineComplete={isPipelineComplete}
          isPipelineRunning={isPipelineRunning}
          onRunFullPipeline={handleRunFullPipeline}
        />

        {/* ── SECONDARY DETAIL PANELS (Progressive Disclosure) ─────────── */}

        {/* Panel: How AI Decided — Simple Agent Timeline (primary) */}
        {activePanel === 'analysis' && (
          <div className="max-w-2xl mx-auto space-y-1.5">
            <BackButton onClick={() => setActivePanel(null)} />
            <SimpleAgentTimeline currentCase={currentCase} />
          </div>
        )}

        {/* Panel: See Other Options — Scenario Comparison */}
        {activePanel === 'alternatives' && (
          <div className="max-w-2xl mx-auto space-y-1.5">
            <BackButton onClick={() => setActivePanel(null)} />
            <SimpleScenarioComparison
              currentCase={currentCase}
              onSelectScenarioForApproval={handleSelectScenarioForApproval}
            />
          </div>
        )}

        {/* Panel: Workforce Details */}
        {activePanel === 'workforce' && (
          <div className="max-w-2xl mx-auto space-y-1.5">
            <BackButton onClick={() => setActivePanel(null)} />
            <SimpleWorkforceView currentCase={currentCase} />
          </div>
        )}

        {/* Panel: Decision history (Audit Trail) */}
        {activePanel === 'audit' && (
          <div className="max-w-2xl mx-auto space-y-1.5">
            <BackButton onClick={() => setActivePanel(null)} />
            <SimpleAuditView
              currentCase={currentCase}
              onSelectExecution={(exec) => setSelectedExecution(exec)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-3 bg-white text-xs text-slate-500 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SAP Sentinel · SAP HackFest 2026 · Chandigarh University</span>
          <span className="font-mono text-[10px]">Track 1: Supply Chains · Track 2: Inclusive Workforce</span>
        </div>
      </footer>

      {/* Agent Detail Inspector Modal */}
      <AgentDetailPanel
        execution={selectedExecution}
        onClose={() => setSelectedExecution(null)}
      />

      {/* Human-in-the-Loop Approval Modal */}
      <HumanApprovalModal
        currentCase={currentCase}
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        onConfirmApproval={handleConfirmApproval}
      />
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors py-0.5 px-0.5"
  >
    <span>← Back to Control Tower</span>
  </button>
);
