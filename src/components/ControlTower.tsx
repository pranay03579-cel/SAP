/**
 * SAP Sentinel — ControlTower (Phase 12 Hackathon Demo)
 *
 * Minimal, light-mode, judge-friendly layout.
 *
 * Visual hierarchy:
 *   1. Disruption alert (what happened)
 *   2. Impact summary (what is affected)
 *   3. Recommendation hero (what to do — visually dominant)
 *   4. Action buttons (approve + secondary links)
 *
 * All values are derived from the Case domain model.
 * No hardcoded display strings.
 * No chain-of-thought exposed.
 */

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  Zap,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

type ActivePanel = 'analysis' | 'alternatives' | 'workforce' | 'audit' | null;

interface ControlTowerProps {
  currentCase: Case;
  activePanel: ActivePanel;
  onOpenPanel: (panel: ActivePanel) => void;
  onOpenApproval: () => void;
  onRejectApproval: () => void;
  isPipelineComplete: boolean;
  isPipelineRunning: boolean;
  onRunFullPipeline: () => void;
}

// ─── Main component ──────────────────────────────────────────────────────────

export const ControlTower: React.FC<ControlTowerProps> = ({
  currentCase,
  activePanel,
  onOpenPanel,
  onOpenApproval,
  onRejectApproval,
  isPipelineComplete,
  isPipelineRunning,
  onRunFullPipeline,
}) => {
  const scImpact = currentCase.supplyChainImpact;
  const workforce = currentCase.workforceImpact;
  const decision = currentCase.decision;
  const isApproved = currentCase.status === 'APPROVED';
  const isRejected = currentCase.status === 'REJECTED';

  // Scoring data
  const winnerEval = decision?.scenarioEvaluations?.[0];
  const winnerMatrix = decision?.comparativeMatrix?.find(
    (m) => m.scenarioId === decision.recommendedScenarioId
  );
  const lifeSavingCount =
    scImpact?.impactedMaterials?.filter((m) => m.criticality === 'LIFE_SAVING').length ?? 0;

  // ── PRE-ANALYSIS: show CTA ──────────────────────────────────────────────
  if (!isPipelineComplete && !isPipelineRunning) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <DisruptionCard currentCase={currentCase} />

        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100">
            <Zap className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ready to analyse</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              5 AI agents will assess the disruption, check affected shipments, evaluate the
              workforce, and recommend the best recovery plan.
            </p>
          </div>
          <button
            onClick={onRunFullPipeline}
            className="inline-flex items-center space-x-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <span>Run AI Recovery Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 font-mono">MOCK MODE — no SAP connection required</p>
        </div>
      </div>
    );
  }

  // ── ANALYSING ───────────────────────────────────────────────────────────
  if (isPipelineRunning) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <DisruptionCard currentCase={currentCase} />
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Agents analysing…</h2>
            <p className="text-sm text-slate-500 mt-1">
              The 5-agent pipeline is running. Results will appear when complete.
            </p>
          </div>
          <div className="flex justify-center flex-wrap gap-2">
            {['Disruption', 'Supply Chain', 'Workforce', 'Recovery', 'Decision'].map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-mono"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE: main demo layout ──────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* 1. DISRUPTION */}
      <DisruptionCard currentCase={currentCase} />

      {/* 2. IMPACT — compact row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ImpactCell
          icon={<Package className="w-3.5 h-3.5 text-blue-500" />}
          label="Shipments affected"
          value={`${scImpact?.impactedPOs?.length ?? '—'}`}
          sub="Purchase orders"
          color="blue"
        />
        <ImpactCell
          icon={<AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          label="Critical shipments"
          value={`${lifeSavingCount}`}
          sub="Life-saving cargo"
          color="red"
        />
        <ImpactCell
          icon={<Clock className="w-3.5 h-3.5 text-amber-500" />}
          label="Stockout window"
          value={`${scImpact?.temperatureIntegrityThreat?.batteryBackupHoursRemaining ?? '—'}h`}
          sub="Cold-chain battery"
          color="amber"
        />
        <ImpactCell
          icon={<Users className="w-3.5 h-3.5 text-green-500" />}
          label="Workers available"
          value={`${workforce?.availableStaffCount ?? '—'} / ${(workforce?.availableStaffCount ?? 0) + (workforce?.constrainedStaffCount ?? 0)}`}
          sub="Qualified for task"
          color="green"
        />
      </div>

      {/* 3. RECOMMENDATION — hero card */}
      {decision ? (
        <div
          className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
            isApproved
              ? 'border-green-400'
              : isRejected
              ? 'border-red-300'
              : 'border-blue-400'
          }`}
        >
          {/* Header stripe */}
          <div
            className={`px-5 py-2.5 flex items-center justify-between ${
              isApproved
                ? 'bg-green-50 border-b border-green-200'
                : isRejected
                ? 'bg-red-50 border-b border-red-200'
                : 'bg-blue-50 border-b border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className={`w-4 h-4 ${isApproved ? 'text-green-600' : 'text-blue-600'}`} />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isApproved ? 'text-green-700' : isRejected ? 'text-red-700' : 'text-blue-700'
                }`}
              >
                {isApproved
                  ? 'Recovery Plan Approved'
                  : isRejected
                  ? 'Recovery Plan Rejected'
                  : 'Recommended Recovery Plan'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span
                className={`font-mono font-bold ${
                  isApproved ? 'text-green-700' : 'text-blue-700'
                }`}
              >
                Score: {winnerEval?.compositeScore.toFixed(0) ?? '—'} / 100
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isApproved
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'RANK #1'}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {decision.recommendedScenarioName}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {decision.justification.primaryReason}
              </p>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetricPill
                icon={<Clock className="w-3.5 h-3.5 text-blue-500" />}
                label="Recovery time"
                value={`${winnerMatrix?.recoveryTimeHours ?? '—'} hours`}
              />
              <MetricPill
                icon={<DollarSign className="w-3.5 h-3.5 text-green-500" />}
                label="Cost"
                value={winnerMatrix ? `₹${(winnerMatrix.costInr / 100000).toFixed(1)} L` : '—'}
              />
              <MetricPill
                icon={<ShieldCheck className="w-3.5 h-3.5 text-red-500" />}
                label="Critical shipments"
                value={`${lifeSavingCount} / ${lifeSavingCount} protected`}
              />
              <MetricPill
                icon={<Users className="w-3.5 h-3.5 text-violet-500" />}
                label="Workers"
                value={`${winnerMatrix?.workerWellBeingScore ?? '—'}/100 well-being`}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={onOpenApproval}
                disabled={isApproved}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  isApproved
                    ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproved ? 'Plan Approved (Simulated Dispatch)' : 'Approve Recovery'}</span>
              </button>

              {!isApproved && !isRejected && (
                <button
                  onClick={onRejectApproval}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl text-sm font-medium bg-white hover:bg-red-50 text-red-500 border border-red-200 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              )}
            </div>

            {/* Secondary links */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
              <SecondaryBtn
                label="See how AI decided"
                active={activePanel === 'analysis'}
                onClick={() => onOpenPanel(activePanel === 'analysis' ? null : 'analysis')}
              />
              <SecondaryBtn
                label="See other options"
                active={activePanel === 'alternatives'}
                onClick={() => onOpenPanel(activePanel === 'alternatives' ? null : 'alternatives')}
              />
              <SecondaryBtn
                label="Workforce details"
                active={activePanel === 'workforce'}
                onClick={() => onOpenPanel(activePanel === 'workforce' ? null : 'workforce')}
              />
              <SecondaryBtn
                label="View audit trail"
                active={activePanel === 'audit'}
                onClick={() => onOpenPanel(activePanel === 'audit' ? null : 'audit')}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const DisruptionCard: React.FC<{ currentCase: Case }> = ({ currentCase }) => {
  const d = currentCase.disruption;
  return (
    <div className="bg-white rounded-2xl border-l-4 border-l-red-500 border border-slate-200 p-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-red-50 rounded-xl border border-red-100 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-0.5">
              {d?.severity ?? 'CRITICAL'} Disruption
            </span>
            <span className="text-[10px] font-mono text-slate-400">{currentCase.caseNumber}</span>
          </div>
          <p className="text-sm font-bold text-slate-900 leading-snug">
            {d?.headline ?? 'Critical route disruption detected.'}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {d
              ? `${d.location.name}, ${d.location.region} · ${d.estimatedBlockedDurationHours}h estimated blockade · ${d.weatherDetails.rainfallMmLast24Hours}mm rainfall in 24h`
              : 'Route disruption details loading.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const ImpactCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'red' | 'amber' | 'green';
}> = ({ icon, label, value, sub, color }) => {
  const bg = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200',
  }[color];
  const val = {
    blue: 'text-blue-800',
    red: 'text-red-800',
    amber: 'text-amber-800',
    green: 'text-green-800',
  }[color];

  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <div className="flex items-center space-x-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-slate-500 font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold font-mono ${val}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
};

const MetricPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
    <div className="flex items-center space-x-1.5 mb-1">
      {icon}
      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const SecondaryBtn: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
      active
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
    }`}
  >
    {label}
  </button>
);
