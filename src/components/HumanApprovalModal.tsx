import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  UserCheck, 
  Loader2,
  Send
} from 'lucide-react';
import { Case, ApprovalStatus } from '../../shared/types/domain';

interface HumanApprovalModalProps {
  currentCase: Case;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApproval: (status: ApprovalStatus, notes: string) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  currentCase,
  isOpen,
  onClose,
  onConfirmApproval,
}) => {
  const [reviewNotes, setReviewNotes] = useState(
    currentCase.approval?.reviewNotes || 'Approved. Prioritize cold-chain insulin flight delivery to Silchar Civil Hospital and confirm ergonomic lift accommodations for ground crew.'
  );
  const [budgetOverride, setBudgetOverride] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<ApprovalStatus | null>(null);

  if (!isOpen) return null;

  const handleApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess('APPROVED');
      setTimeout(() => {
        onConfirmApproval('APPROVED', reviewNotes);
        onClose();
      }, 1200);
    }, 1000);
  };

  const handleReject = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess('REJECTED');
      setTimeout(() => {
        onConfirmApproval('REJECTED', reviewNotes);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-sap-card border border-sap-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sap-border flex items-center justify-between bg-sap-dark/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-sap-accent rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Human-in-the-Loop (HITL) Governance Review</h3>
              <p className="text-xs text-sap-muted">Executive Authorization & Simulated Dispatch Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {submitSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {submitSuccess === 'APPROVED' ? 'Recovery Plan Approved (Simulated Dispatch)!' : 'Recovery Plan Rejected & Flagged for Re-planning'}
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {submitSuccess === 'APPROVED'
                  ? 'Simulated dispatch prepared: PO routing mapped for SAP S/4HANA and inclusive shift roster prepared for SAP SuccessFactors.'
                  : 'Case status updated. Agents notified to re-evaluate alternative road & rail scenarios.'}
              </p>
            </div>
          ) : (
            <>
              {/* Approver Profile */}
              <div className="bg-sap-dark/80 p-4 rounded-xl border border-sap-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-sap-border flex items-center justify-center text-sap-accent">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      {currentCase.approval?.approverUser.name || 'Dr. Ananya Mehta'}
                    </span>
                    <span className="text-sap-muted text-[11px]">
                      {currentCase.approval?.approverUser.role || 'Regional Disaster Response & Supply Chain Director'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-500/20 text-sap-accent font-semibold text-[11px] border border-blue-500/30">
                  Level 4 Authority
                </span>
              </div>

              {/* Scenario Confirmation Summary */}
              {(() => {
                const recId = currentCase.decision?.recommendedScenarioId;
                const selectedScenario = recId
                  ? currentCase.candidateScenarios?.find((s) => s.scenarioId === recId)
                  : undefined;
                const costLakhs = selectedScenario
                  ? (selectedScenario.tradeOffs.incrementalCostInr / 100000).toFixed(2)
                  : '—';
                const recoveryHrs = selectedScenario?.tradeOffs.estimatedRecoveryHours ?? '—';
                const wellBeing = selectedScenario?.tradeOffs.workerWellBeingScore ?? '—';

                return (
              <div className="bg-sap-dark/60 p-4 rounded-xl border border-sap-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sap-muted uppercase tracking-wider">Target Recovery Plan</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {currentCase.decision?.recommendedScenarioName || 'No Scenario Selected'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 bg-sap-dark rounded-lg border border-sap-border">
                    <span className="text-[10px] text-sap-muted block">Cost Commitment</span>
                    <span className="font-bold text-white font-mono">₹{costLakhs} Lakhs</span>
                  </div>
                  <div className="p-2 bg-sap-dark rounded-lg border border-sap-border">
                    <span className="text-[10px] text-sap-muted block">Recovery Time</span>
                    <span className="font-bold text-emerald-400 font-mono">{recoveryHrs}h</span>
                  </div>
                  <div className="p-2 bg-sap-dark rounded-lg border border-sap-border">
                    <span className="text-[10px] text-sap-muted block">Workforce Health</span>
                    <span className="font-bold text-emerald-400 font-mono">{wellBeing} / 100</span>
                  </div>
                </div>

                {/* Downstream SAP Dispatch Actions List */}
                <div className="pt-2 border-t border-sap-border/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">
                    Simulated SAP Dispatch Execution (Target Integration Points):
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between bg-sap-dark/90 p-2 rounded-lg border border-sap-border/40">
                      <span className="text-slate-300">1. Re-route Medical POs to Air Charter</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-sap-accent border border-blue-500/30">
                        SAP_S4HANA
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-sap-dark/90 p-2 rounded-lg border border-sap-border/40">
                      <span className="text-slate-300">2. Lock Inclusive Roster & Ergonomic Limits</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        SAP_SUCCESSFACTORS
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-sap-dark/90 p-2 rounded-lg border border-sap-border/40">
                      <span className="text-slate-300">3. Reserve Priority Rail Freight Slot</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        SAP_LBN_FREIGHT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
                );
              })()}

              {/* Reviewer Notes Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Executive Review & Audit Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-sap-dark border border-sap-border focus:border-sap-accent rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sap-accent"
                  placeholder="Enter executive reasoning, operational constraints, or special authorizations..."
                ></textarea>
              </div>

              {/* Budget Override Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="budgetOverride"
                  checked={budgetOverride}
                  onChange={(e) => setBudgetOverride(e.target.checked)}
                  className="rounded bg-sap-dark border-sap-border text-sap-accent focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="budgetOverride" className="text-xs text-slate-300 cursor-pointer">
                  Authorize emergency contingency freight budget allocation (₹12,80,000 INR)
                </label>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Buttons */}
        {!submitSuccess && (
          <div className="px-6 py-4 border-t border-sap-border bg-sap-dark/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReject}
                className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject & Request Revision</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Committing to SAP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Authorize Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
