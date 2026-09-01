import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  DollarSign, 
  HeartHandshake, 
  Zap 
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface FinalDecisionPanelProps {
  currentCase: Case;
  onNavigateTab: (tab: string) => void;
  onOpenApproval: () => void;
  onRejectApproval: () => void;
}

export const FinalDecisionPanel: React.FC<FinalDecisionPanelProps> = ({
  currentCase,
  onNavigateTab,
  onOpenApproval,
  onRejectApproval,
}) => {
  const decision = currentCase.decision;
  const isApproved = currentCase.status === 'APPROVED';
  const isRejected = currentCase.status === 'REJECTED';

  if (!decision) return null;

  return (
    <div className="bg-slate-900 rounded-md p-6 border border-slate-800 space-y-6">
      {/* 1. Header Banner with Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>OPTIMIZED DECISION RECOMMENDATION</span>
            </span>
            <span className="text-xs font-mono text-slate-400">{decision.decisionId}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {decision.recommendedScenarioName}
          </h2>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('agents')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <span>View Analysis</span>
          </button>

          <button
            onClick={() => onNavigateTab('scenarios')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <span>Compare Scenarios</span>
          </button>

          <button
            onClick={onRejectApproval}
            className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
              isRejected
                ? 'bg-red-600/30 text-red-300 border-red-500'
                : 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <button
            onClick={onOpenApproval}
            className={`px-5 py-2 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isApproved
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproved ? 'Approved & Committed' : 'Approve Recovery'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Executive Summary Cards — data sourced from scoring engine */}
      {(() => {
        const winnerEval = decision.scenarioEvaluations?.[0];
        const winnerMatrix = decision.comparativeMatrix?.find(m => m.scenarioId === decision.recommendedScenarioId);
        const runnerUpMatrix = decision.comparativeMatrix?.find(m => m.rank === 2);
        const costDiff = winnerMatrix && runnerUpMatrix
          ? Math.abs(runnerUpMatrix.costInr - winnerMatrix.costInr) / 100000
          : null;
        const riskCriterion = winnerEval?.criteria.find(c => c.criterion === 'risk');
        const riskLabel = riskCriterion
          ? riskCriterion.normalizedScore >= 80 ? 'LOW RISK' : riskCriterion.normalizedScore >= 50 ? 'MODERATE' : 'HIGH RISK'
          : '—';
        const riskColor = riskCriterion?.normalizedScore && riskCriterion.normalizedScore >= 80 ? 'text-emerald-400' : 'text-amber-400';

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-sap-dark/80 p-3 rounded-xl border border-sap-border">
              <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Composite Score</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {winnerEval?.compositeScore.toFixed(1) ?? '—'} / 100
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Rank #{winnerEval?.rank ?? 1}</span>
            </div>

            <div className="bg-sap-dark/80 p-3 rounded-xl border border-sap-border">
              <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Recovery Time</span>
              <span className="text-xl font-bold text-white font-mono">
                {winnerMatrix?.recoveryTimeHours ?? '—'} Hours
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Fastest feasible option</span>
            </div>

            <div className="bg-sap-dark/80 p-3 rounded-xl border border-sap-border">
              <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Incremental Cost</span>
              <span className="text-xl font-bold text-white font-mono">
                ₹{winnerMatrix ? (winnerMatrix.costInr / 100000).toFixed(1) : '—'} L
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                {costDiff !== null ? `₹${costDiff.toFixed(1)}L vs alt.` : 'Scored vs alternatives'}
              </span>
            </div>

            <div className="bg-sap-dark/80 p-3 rounded-xl border border-sap-border">
              <span className="text-[10px] text-sap-muted uppercase tracking-wider block">SLA Adherence</span>
              <span className="text-xl font-bold text-sap-cyan font-mono">
                {decision.scenarioEvaluations?.[0]?.criteria.find(c => c.criterion === 'recoveryEffectiveness')?.rawValue ?? '—'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Recovery effectiveness</span>
            </div>

            <div className="bg-sap-dark/80 p-3 rounded-xl border border-sap-border">
              <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Worker Well-Being</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {winnerMatrix?.workerWellBeingScore ?? '—'} / 100
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {winnerEval?.criteria.find(c => c.criterion === 'workforceFeasibility')
                  ? 'Accommodations scored' : 'Inclusive assessment'}
              </span>
            </div>

            <div className="bg-sap-dark/80 p-3 rounded-xl border border-sap-border">
              <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Risk Profile</span>
              <span className={`text-xl font-bold font-mono ${riskColor}`}>{riskLabel}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{riskCriterion?.rawValue ?? 'Operational risk'}</span>
            </div>
          </div>
        );
      })()}

      {/* 3. Detailed Multi-Objective Justification */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sap-muted">
          Structured Decision Justification (Why It Is Best)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-sap-dark/70 p-4 rounded-xl border border-sap-border space-y-1.5">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-sap-accent" />
              <span>Clinical & Food Urgency</span>
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {decision.justification.clinicalAndFoodUrgencyEvaluation}
            </p>
          </div>

          <div className="bg-sap-dark/70 p-4 rounded-xl border border-sap-border space-y-1.5">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <HeartHandshake className="w-4 h-4 text-sap-emerald" />
              <span>Workforce Inclusion & Safety</span>
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {decision.justification.workforceInclusionAndSafetyEvaluation}
            </p>
          </div>

          <div className="bg-sap-dark/70 p-4 rounded-xl border border-sap-border space-y-1.5">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-sap-gold" />
              <span>Cost vs. Life-Saving Trade-off</span>
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {decision.justification.costVsLifeSavingTradeOffRationale}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Action Plan Steps (Ready to commit to SAP) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sap-muted flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-sap-accent" />
            <span>Target Execution Steps (Pre-Wired for SAP Dispatch)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {decision.actionPlanSteps.length} Automated Actions Pending Governance
          </span>
        </div>

        <div className="space-y-2">
          {decision.actionPlanSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3 bg-sap-dark/80 rounded-xl border border-sap-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-start sm:items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-sap-accent font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {step.stepNumber}
                </span>
                <div>
                  <span className="font-bold text-white block">{step.title}</span>
                  <span className="text-[11px] text-slate-300 font-mono">{step.payloadAction}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sap-accent text-[10px] font-mono font-semibold border border-blue-500/30">
                  {step.targetSapSystem}
                </span>
                <span className="text-[11px] text-sap-muted">Owner: {step.actionOwner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
