import { useState, useEffect } from 'react';
import { MOCK_DISRUPTION_CASE } from '../shared/mock/disruptionCase';
import { Case, AgentExecution, Approval, ApprovalStatus, AgentName } from '../shared/types/domain';
import { pipelineOrchestrator, AgentStatusMap } from './services/orchestrator';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DisruptionDetails } from './components/DisruptionDetails';
import { AgentTimeline } from './components/AgentTimeline';
import { AgentDetailPanel } from './components/AgentDetailPanel';
import { RecoveryComparison } from './components/RecoveryComparison';
import { FinalDecisionPanel } from './components/FinalDecisionPanel';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { WorkforceRosterView } from './components/WorkforceRosterView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { IntegrationModeBanner } from './components/IntegrationModeBanner';

export default function App() {
  const integrationMode = pipelineOrchestrator.getIntegrationMode();
  const [currentCase, setCurrentCase] = useState<Case>(MOCK_DISRUPTION_CASE);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedExecution, setSelectedExecution] = useState<AgentExecution | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState<boolean>(false);
  const [isWorkforceOpen, setIsWorkforceOpen] = useState<boolean>(false);

  // Orchestrator State
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusMap>(() =>
    pipelineOrchestrator.getAgentStatusMap(MOCK_DISRUPTION_CASE)
  );
  const [pipelineToast, setPipelineToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Sync statuses whenever case changes
  useEffect(() => {
    setAgentStatuses(pipelineOrchestrator.getAgentStatusMap(currentCase));
  }, [currentCase]);

  // Show temporary toast
  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setPipelineToast({ message, type });
    setTimeout(() => setPipelineToast(null), 4000);
  };

  // Run Full Pipeline
  const handleRunFullPipeline = async () => {
    setIsPipelineRunning(true);
    showToast('Starting autonomous 5-agent recovery pipeline...', 'info');

    try {
      const resultCase = await pipelineOrchestrator.executePipeline(
        currentCase,
        { stepDelayMs: 400 },
        (update, updatedCase) => {
          setAgentStatuses((prev) => ({
            ...prev,
            [update.agentName]: update.status,
          }));
          setCurrentCase({ ...updatedCase });
        }
      );
      setCurrentCase(resultCase);
      showToast('Multi-Agent Analysis Completed Successfully! Decision ready for review.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, 'error');
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Run Next Pending Step
  const handleRunSingleStep = async () => {
    const nextAgent = pipelineOrchestrator.agentSequence.find(
      (name) => agentStatuses[name] === 'PENDING' || agentStatuses[name] === 'FAILED'
    );
    if (!nextAgent) {
      showToast('All agents have already completed.', 'info');
      return;
    }

    setIsPipelineRunning(true);
    setAgentStatuses((prev) => ({ ...prev, [nextAgent]: 'RUNNING' }));

    try {
      const updated = await pipelineOrchestrator.executeStep(currentCase, nextAgent);
      setCurrentCase(updated);
      setAgentStatuses((prev) => ({ ...prev, [nextAgent]: 'COMPLETED' }));
      showToast(`Step "${nextAgent}" completed successfully.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAgentStatuses((prev) => ({ ...prev, [nextAgent]: 'FAILED' }));
      showToast(`Step failed: ${msg}`, 'error');
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Simulate Fault Injection
  const handleSimulateFault = async (agentName: AgentName) => {
    setIsPipelineRunning(true);
    showToast(`Injecting chaos fault into ${agentName}...`, 'info');

    try {
      await pipelineOrchestrator.executePipeline(
        currentCase,
        {
          stepDelayMs: 200,
          injectedFaults: {
            [agentName]: 'Simulated SAP SuccessFactors timeout — worker roster locked',
          },
        },
        (update, updatedCase) => {
          setAgentStatuses((prev) => ({
            ...prev,
            [update.agentName]: update.status,
          }));
          setCurrentCase({ ...updatedCase });
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Handled Fault: ${msg}`, 'error');
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Retry Pipeline
  const handleRetryPipeline = async () => {
    setIsPipelineRunning(true);
    showToast('Retrying pipeline from point of failure...', 'info');

    try {
      const resultCase = await pipelineOrchestrator.retryPipeline(
        currentCase,
        { stepDelayMs: 400 },
        (update, updatedCase) => {
          setAgentStatuses((prev) => ({
            ...prev,
            [update.agentName]: update.status,
          }));
          setCurrentCase({ ...updatedCase });
        }
      );
      setCurrentCase(resultCase);
      showToast('Pipeline recovered and completed successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Retry failed: ${msg}`, 'error');
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Reset Case State
  const handleResetCase = () => {
    const freshCase = pipelineOrchestrator.createInitialCase();
    setCurrentCase(freshCase);
    setAgentStatuses({
      'Disruption Agent': 'PENDING',
      'Supply Chain Impact Agent': 'PENDING',
      'Workforce Agent': 'PENDING',
      'Recovery Adaptation Agent': 'PENDING',
      'Decision Agent': 'PENDING',
    });
    showToast('Case reset to initial un-analyzed state.', 'info');
  };

  // Agent Selection Helper
  const handleSelectAgentByName = (agentName: string) => {
    const found = currentCase.agentHistory.historyLedger.find(
      (exec) => exec.agentName === agentName
    );
    if (found) {
      setSelectedExecution(found);
    } else {
      setActiveTab('agents');
    }
  };

  // Scenario Selection for Approval
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

  // Build a fresh Approval record if none exists yet (e.g. after Reset → Run Pipeline)
  const buildApproval = (prev: Case, status: ApprovalStatus, notes: string): Approval => {
    if (prev.approval) {
      return {
        ...prev.approval,
        status,
        reviewNotes: notes,
        approvedAt: new Date().toISOString(),
      };
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

  // Confirm Approval / Rejection
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
      approval: buildApproval(prev, 'REJECTED', 'Rejected by operator. Requires alternative highway or rail bypass.'),
    }));
  };

  return (
    <div className="min-h-screen bg-sap-dark text-slate-100 flex flex-col selection:bg-sap-accent selection:text-white">
      {/* Integration Mode Banner — always visible */}
      <IntegrationModeBanner info={integrationMode} />

      {/* Top Header */}
      <Header
        currentCase={currentCase}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsWorkforceOpen(false);
        }}
        onOpenApproval={() => setIsApprovalOpen(true)}
        onOpenWorkforce={() => setIsWorkforceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Notification Banner */}
        {pipelineToast && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in ${
              pipelineToast.type === 'error'
                ? 'bg-red-950/80 border border-red-500 text-red-200 shadow-red-500/20'
                : pipelineToast.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200 shadow-emerald-500/20'
                : 'bg-blue-950/80 border border-sap-accent text-blue-200 shadow-blue-500/20'
            }`}
          >
            <span>{pipelineToast.message}</span>
            <button
              onClick={() => setPipelineToast(null)}
              className="text-xs opacity-70 hover:opacity-100 ml-4 font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status Notification if Approved or Rejected */}
        {currentCase.status === 'APPROVED' && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold uppercase tracking-wider">
                Recovery Plan Approved & Dispatched
              </span>
              <span>— SAP S/4HANA PO routes updated; SAP SuccessFactors workforce roster locked.</span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold">
              Status: SAP_DISPATCH_CONFIRMED
            </span>
          </div>
        )}

        {currentCase.status === 'REJECTED' && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-between text-xs text-red-300 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
              <span className="font-bold uppercase tracking-wider">
                Recovery Plan Rejected by Operator
              </span>
              <span>— Action plan halted. Multi-agent engine awaiting revised constraints.</span>
            </div>
            <button
              onClick={() => setIsApprovalOpen(true)}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/40 font-semibold text-[11px]"
            >
              Re-open Governance
            </button>
          </div>
        )}

        {/* View Switcher */}
        {isWorkforceOpen ? (
          <WorkforceRosterView currentCase={currentCase} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <ExecutiveDashboard
                  currentCase={currentCase}
                  onNavigateTab={setActiveTab}
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  onSelectAgent={handleSelectAgentByName}
                />
                {currentCase.decision && (
                  <FinalDecisionPanel
                    currentCase={currentCase}
                    onNavigateTab={setActiveTab}
                    onOpenApproval={() => setIsApprovalOpen(true)}
                    onRejectApproval={handleQuickReject}
                  />
                )}
              </div>
            )}

            {activeTab === 'disruption' && (
              <DisruptionDetails currentCase={currentCase} />
            )}

            {activeTab === 'agents' && (
              <AgentTimeline
                currentCase={currentCase}
                agentStatuses={agentStatuses}
                isPipelineRunning={isPipelineRunning}
                onSelectExecution={(exec) => setSelectedExecution(exec)}
                onRunFullPipeline={handleRunFullPipeline}
                onRunSingleStep={handleRunSingleStep}
                onSimulateFault={handleSimulateFault}
                onRetryPipeline={handleRetryPipeline}
                onResetCase={handleResetCase}
              />
            )}

            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                <RecoveryComparison
                  currentCase={currentCase}
                  onSelectScenarioForApproval={handleSelectScenarioForApproval}
                />
                {currentCase.decision && (
                  <FinalDecisionPanel
                    currentCase={currentCase}
                    onNavigateTab={setActiveTab}
                    onOpenApproval={() => setIsApprovalOpen(true)}
                    onRejectApproval={handleQuickReject}
                  />
                )}
              </div>
            )}

            {activeTab === 'workforce' && (
              <WorkforceRosterView currentCase={currentCase} />
            )}

            {activeTab === 'audit' && (
              <AuditLedgerView
                currentCase={currentCase}
                onSelectExecution={(exec) => setSelectedExecution(exec)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-sap-border/60 py-4 bg-sap-card/60 text-xs text-sap-muted text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SAP Sentinel Control Tower · SAP HackFest 2026 (North Region — Chandigarh University)</span>
          <span className="font-mono text-[11px]">Track 1: Resilient Supply Chains × Track 2: Inclusive Workforce</span>
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
