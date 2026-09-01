/**
 * SAP Sentinel — ControlTower (Hard Flat Business Operations Layout)
 *
 * Flat, crisp, solid-color enterprise dashboard.
 * Zero gradients, zero decorative shadows, zero glowing accents.
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
  ChevronRight,
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
      <div className="max-w-2xl mx-auto space-y-3">
        <DisruptionCard currentCase={currentCase} />

        <div className="bg-white rounded-md border border-slate-200 p-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-blue-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Ready to analyse disruption</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              5 specialized agents will evaluate route conditions, calculate shipment risk, check workforce capacity, and propose recovery scenarios.
            </p>
          </div>
          <button
            onClick={onRunFullPipeline}
            className="inline-flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <span>Run AI Recovery Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 font-mono">MOCK MODE — local simulation</p>
        </div>
      </div>
    );
  }

  // ── ANALYSING ───────────────────────────────────────────────────────────
  if (isPipelineRunning) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        <DisruptionCard currentCase={currentCase} />
        <div className="bg-white rounded-md border border-slate-200 p-6 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Multi-Agent Pipeline Running…</h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating routes, purchase orders, and workforce profiles.
            </p>
          </div>
          <div className="flex justify-center flex-wrap gap-1.5 pt-1">
            {['Disruption', 'Supply Chain', 'Workforce', 'Recovery', 'Decision'].map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Reason text formatting (truncated to approx 120 chars)
  const reasonText = decision?.justification?.primaryReason ?? '';
  const displayReason =
    reasonText.length > 120 ? reasonText.slice(0, 117).trimEnd() + '…' : reasonText;

  // ── COMPLETE: main demo layout ──────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-3">

      {/* 1. DISRUPTION */}
      <DisruptionCard currentCase={currentCase} />

      {/* 2. IMPACT — compact row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ImpactCell
          icon={<Package className="w-3.5 h-3.5 text-slate-500" />}
          label="Shipments affected"
          value={`${scImpact?.impactedPOs?.length ?? '—'}`}
          sub="Purchase orders"
        />
        <ImpactCell
          icon={<AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
          label="Critical shipments"
          value={`${lifeSavingCount}`}
          sub="Life-saving cargo"
          highlight="danger"
        />
        <ImpactCell
          icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
          label="Stockout window"
          value={`${scImpact?.temperatureIntegrityThreat?.batteryBackupHoursRemaining ?? '—'}h`}
          sub="Cold-chain battery"
          highlight="warning"
        />
        <ImpactCell
          icon={<Users className="w-3.5 h-3.5 text-green-600" />}
          label="Workers available"
          value={`${workforce?.availableStaffCount ?? '—'} / ${(workforce?.availableStaffCount ?? 0) + (workforce?.constrainedStaffCount ?? 0)}`}
          sub="Qualified staff"
          highlight="success"
        />
      </div>

      {/* 3. RECOMMENDATION — hero card */}
      {decision ? (
        <div
          className={`bg-white rounded-md border overflow-hidden ${
            isApproved
              ? 'border-green-300'
              : isRejected
              ? 'border-red-300'
              : 'border-slate-300'
          }`}
        >
          {/* Header stripe */}
          <div
            className={`px-4 py-2 flex items-center justify-between border-b ${
              isApproved
                ? 'bg-green-50 border-green-200'
                : isRejected
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Star className={`w-3.5 h-3.5 ${isApproved ? 'text-green-700' : 'text-blue-600'}`} />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isApproved ? 'text-green-800' : isRejected ? 'text-red-800' : 'text-slate-800'
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
              <span className="font-mono font-semibold text-slate-700">
                Score: {winnerEval?.compositeScore.toFixed(0) ?? '—'} / 100
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                  isApproved
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : isRejected
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'RANK #1'}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="p-4 space-y-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {decision.recommendedScenarioName}
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {displayReason}
              </p>
            </div>

            {/* Key metrics — exactly 3 outcomes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MetricPill
                icon={<Clock className="w-3.5 h-3.5 text-slate-500" />}
                label="Recovery time"
                value={`${winnerMatrix?.recoveryTimeHours ?? '—'} hours`}
              />
              <MetricPill
                icon={<DollarSign className="w-3.5 h-3.5 text-slate-500" />}
                label="Cost"
                value={winnerMatrix ? `₹${(winnerMatrix.costInr / 100000).toFixed(1)} L` : '—'}
              />
              <MetricPill
                icon={<ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                label="Critical shipments"
                value={`${lifeSavingCount} / ${lifeSavingCount} protected`}
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
              <button
                onClick={onOpenApproval}
                disabled={isApproved}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-md text-xs font-semibold transition-colors ${
                  isApproved
                    ? 'bg-green-100 text-green-800 border border-green-300 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isApproved ? 'Plan Approved (Simulated Dispatch)' : 'Approve Recovery'}</span>
              </button>

              {!isApproved && !isRejected && (
                <button
                  onClick={onRejectApproval}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-md text-xs font-medium bg-white hover:bg-red-50 text-red-700 border border-red-200 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}
            </div>

            {/* Secondary Action Hierarchy */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              {/* Primary Secondary Action */}
              <button
                onClick={() => onOpenPanel(activePanel === 'analysis' ? null : 'analysis')}
                className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-between border transition-colors ${
                  activePanel === 'analysis'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-blue-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>Why did AI choose this?</span>
                  <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">— 5 agents verified supplies, routes & workers</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600 text-xs font-medium">
                  <span>{activePanel === 'analysis' ? 'Hide explanation' : 'See explanation'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Tertiary Actions */}
              <div className="flex items-center justify-center space-x-3 text-xs text-slate-500">
                <button
                  onClick={() => onOpenPanel(activePanel === 'alternatives' ? null : 'alternatives')}
                  className={`hover:text-slate-900 transition-colors ${
                    activePanel === 'alternatives' ? 'font-bold text-blue-600 underline underline-offset-4' : 'hover:underline'
                  }`}
                >
                  See other options
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onOpenPanel(activePanel === 'workforce' ? null : 'workforce')}
                  className={`hover:text-slate-900 transition-colors ${
                    activePanel === 'workforce' ? 'font-bold text-blue-600 underline underline-offset-4' : 'hover:underline'
                  }`}
                >
                  Workforce
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onOpenPanel(activePanel === 'audit' ? null : 'audit')}
                  className={`hover:text-slate-900 transition-colors ${
                    activePanel === 'audit' ? 'font-bold text-blue-600 underline underline-offset-4' : 'hover:underline'
                  }`}
                >
                  Decision history
                </button>
              </div>
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
    <div className="bg-white rounded-md border border-slate-200 border-l-4 border-l-red-600 p-3.5">
      <div className="flex items-start space-x-3">
        <div className="p-1.5 bg-red-50 rounded border border-red-200 text-red-600 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 rounded px-1 py-0.5">
              {d?.severity ?? 'CRITICAL'} Disruption
            </span>
            <span className="text-[10px] font-mono text-slate-400">{currentCase.caseNumber}</span>
          </div>
          <p className="text-sm font-bold text-slate-900 leading-snug">
            {d?.headline ?? 'Critical route disruption detected.'}
          </p>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
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
  highlight?: 'danger' | 'warning' | 'success';
}> = ({ icon, label, value, sub, highlight }) => {
  const valColor = highlight === 'danger'
    ? 'text-red-700'
    : highlight === 'warning'
    ? 'text-amber-700'
    : highlight === 'success'
    ? 'text-green-700'
    : 'text-slate-900';

  return (
    <div className="bg-white rounded-md border border-slate-200 p-2.5">
      <div className="flex items-center space-x-1 mb-0.5">
        {icon}
        <span className="text-[10px] text-slate-500 font-medium">{label}</span>
      </div>
      <p className={`text-base font-bold font-mono ${valColor}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
};

const MetricPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="bg-slate-50 rounded border border-slate-200 p-2">
    <div className="flex items-center space-x-1 mb-0.5">
      {icon}
      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-xs font-bold text-slate-900">{value}</p>
  </div>
);
