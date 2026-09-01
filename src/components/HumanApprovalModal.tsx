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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Human-in-the-Loop (HITL) Governance Review</h3>
              <p className="text-[11px] text-slate-500">Executive Authorization & Simulated Dispatch Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs bg-white">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 border border-green-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {submitSuccess === 'APPROVED' ? 'Recovery Plan Approved (Simulated Dispatch)' : 'Recovery Plan Rejected'}
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {submitSuccess === 'APPROVED'
                  ? 'Simulated dispatch prepared: PO routing mapped for SAP S/4HANA and inclusive shift roster prepared for SAP SuccessFactors.'
                  : 'Case status updated to REJECTED. Operators can re-open review or re-evaluate alternative scenarios.'}
              </p>
            </div>
          ) : (
            <>
              {/* Approver Profile */}
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      {currentCase.approval?.approverUser.name || 'Dr. Ananya Mehta'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {currentCase.approval?.approverUser.role || 'Regional Disaster Response & Supply Chain Director'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[10px] border border-blue-200">
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
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Recovery Plan</span>
                      <span className="text-slate-900 font-bold font-mono text-xs">
                        {currentCase.decision?.recommendedScenarioName || 'No Scenario Selected'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Cost</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">₹{costLakhs} L</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Recovery</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">{recoveryHrs}h</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Workforce</span>
                        <span className="font-bold text-green-700 font-mono text-xs">{wellBeing} / 100</span>
                      </div>
                    </div>

                    {/* Downstream SAP Dispatch Actions List */}
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Simulated SAP Target Integration Points:
                      </span>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-slate-700">1. Re-route Medical POs to Air Charter</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                            SAP_S4HANA
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-slate-700">2. Lock Inclusive Roster & Ergonomic Limits</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                            SAP_SUCCESSFACTORS
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-slate-700">3. Reserve Priority Rail Freight Slot</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                            SAP_LBN_FREIGHT
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Reviewer Notes Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Executive Review & Audit Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-md p-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter reasoning or special authorizations..."
                ></textarea>
              </div>

              {/* Budget Override Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="budgetOverride"
                  checked={budgetOverride}
                  onChange={(e) => setBudgetOverride(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="budgetOverride" className="text-xs text-slate-700 cursor-pointer">
                  Authorize emergency contingency freight budget allocation (₹12,80,000 INR)
                </label>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Buttons */}
        {!submitSuccess && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReject}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Logging Simulated Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Simulated Dispatch</span>
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
