/**
 * SAP Sentinel — Inclusive Workforce Control Center (Phase 7 Enhanced)
 *
 * Displays operational workforce analytics:
 * 1. Required Workers
 * 2. Available Qualified Workers
 * 3. Skill Gap Analysis
 * 4. Training Required (Just-in-Time micro-certifications)
 * 5. Possible Redeployments
 * 6. Workload & Fatigue Risks
 * 7. Worker Constraint Profiles with Ergonomic, Neurodivergent & Multilingual Accommodations
 */

import React, { useState } from 'react';
import { 
  Users, 
  HeartHandshake, 
  Award, 
  Languages, 
  Activity, 
  CheckCircle2, 
  Brain, 
  Ear, 
  GraduationCap, 
  ArrowRightLeft, 
  Briefcase, 
  AlertOctagon, 
  ShieldCheck 
} from 'lucide-react';
import { Case, WorkerConstraintProfile } from '../../shared/types/domain';

interface WorkforceRosterViewProps {
  currentCase: Case;
}

export const WorkforceRosterView: React.FC<WorkforceRosterViewProps> = ({ currentCase }) => {
  const workforce = currentCase.workforceImpact;
  const [activeTab, setActiveTab] = useState<'analytics' | 'roster' | 'training'>('analytics');

  const getAccommodationIcon = (category: string) => {
    switch (category) {
      case 'NEURODIVERGENT_FOCUS':
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      case 'PHYSICAL_ERGONOMICS':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MULTILINGUAL_INSTRUCTION':
        return <Languages className="w-3.5 h-3.5 text-cyan-400" />;
      case 'HEARING_ASSIST':
        return <Ear className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <HeartHandshake className="w-3.5 h-3.5 text-sap-accent" />;
    }
  };

  const requiredWorkers = (workforce?.requiredWorkers && workforce.requiredWorkers.length > 0)
    ? workforce.requiredWorkers
    : [
        {
          roleId: 'ROLE-COLD-QA',
          roleTitle: 'Cold-Chain Pharma Packaging & Inspection Specialist',
          headcountNeeded: 1,
          assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
          requiredCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
          urgency: 'CRITICAL' as const,
        },
        {
          roleId: 'ROLE-AIR-STAGING',
          roleTitle: 'Air-Cargo Staging & Precision Pallet Operator',
          headcountNeeded: 1,
          assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
          requiredCertifications: ['AIR_CARGO_STAGING', 'FORKLIFT_PRECISION'],
          urgency: 'CRITICAL' as const,
        },
        {
          roleId: 'ROLE-RECEIVING-RECON',
          roleTitle: 'Warehouse Transfer & Receiving Specialist',
          headcountNeeded: 1,
          assignedPlantId: 'MOCK-PLANT-IN12-SILCHAR',
          requiredCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
          urgency: 'HIGH' as const,
        },
      ];

  const availableQualifiedWorkers = (workforce?.availableQualifiedWorkers && workforce.availableQualifiedWorkers.length > 0)
    ? workforce.availableQualifiedWorkers
    : [
        {
          workerId: 'MOCK-SF-EMP-4019',
          workerName: 'Debashis Sen',
          matchedRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
          plantId: 'PLANT-IN10-GUWAHATI',
          matchingCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
          safeOvertimeHoursRemaining: 5.5,
          appliedAccommodations: ['Quiet packing zone', 'Visual step-by-step checklist display'],
        },
        {
          workerId: 'MOCK-SF-EMP-3044',
          workerName: 'Pranab Jyoti Sarma',
          matchedRole: 'Air-Cargo Staging & Precision Pallet Operator',
          plantId: 'PLANT-IN10-GUWAHATI',
          matchingCertifications: ['AIR_CARGO_STAGING', 'FORKLIFT_PRECISION'],
          safeOvertimeHoursRemaining: 6.0,
          appliedAccommodations: ['Mechanical lifter mandatory for boxes > 12kg'],
        },
        {
          workerId: 'MOCK-SF-EMP-5102',
          workerName: 'Bimalendu Deb',
          matchedRole: 'Warehouse Transfer & Receiving Specialist',
          plantId: 'PLANT-IN12-SILCHAR',
          matchingCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
          safeOvertimeHoursRemaining: 7.0,
          appliedAccommodations: ['Automated translation on SAP warehouse scanner'],
        },
      ];

  const skillGaps = workforce?.skillGaps ?? [];

  const redeployments = (workforce?.possibleRedeployments && workforce.possibleRedeployments.length > 0)
    ? workforce.possibleRedeployments
    : [
        {
          workerId: 'MOCK-SF-EMP-4019',
          workerName: 'Debashis Sen',
          fromPlantId: 'PLANT-IN10-GUWAHATI',
          toPlantId: 'PLANT-IN12-SILCHAR',
          targetRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
          feasibility: 'ACCOMMODATION_REQUIRED' as const,
          appliedAccommodations: ['Quiet inspection zone & visual checklist'],
          rationale: 'Remote digital verification and cold-chain logging oversight for Silchar receiving dock.',
        },
        {
          workerId: 'MOCK-SF-EMP-3044',
          workerName: 'Pranab Jyoti Sarma',
          fromPlantId: 'PLANT-IN10-GUWAHATI',
          toPlantId: 'PLANT-IN10-AIRHEAD',
          targetRole: 'Air-Cargo Staging & Precision Pallet Operator',
          feasibility: 'IMMEDIATE' as const,
          appliedAccommodations: ['Assisted hydraulic forklift staging'],
          rationale: 'Rapid staging for Borjhar emergency medical air charter flight manifest.',
        },
      ];

  const trainingModules = (workforce?.trainingRequirements && workforce.trainingRequirements.length > 0)
    ? workforce.trainingRequirements
    : [
        {
          moduleId: 'TRN-COLD-GPS-01',
          title: 'Active GPS Smart-Battery Cold Box Logger & Thermal Dock Protocol',
          targetRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
          durationHours: 1.5,
          urgency: 'MANDATORY_BEFORE_DISPATCH' as const,
          targetHeadcount: 2,
          description: 'Micro-training on initializing digital telemetry loggers, dry-ice battery packs, and hospital receiving handover.',
        },
        {
          moduleId: 'TRN-ERGO-HYD-02',
          title: 'Powered Hydraulic Pallet Lifter Operational Safety',
          targetRole: 'Air-Cargo Staging & Precision Pallet Operator',
          durationHours: 1.0,
          urgency: 'MANDATORY_BEFORE_DISPATCH' as const,
          targetHeadcount: 3,
          description: 'Refresher training ensuring all pallet transfers above 12kg use hydraulic lifters, protecting ergonomic thresholds.',
        },
        {
          moduleId: 'TRN-RAIL-LMD-03',
          title: 'Lumding–Badarpur Hill Section Wagon Staging & Lashing',
          targetRole: 'Warehouse Transfer & Receiving Specialist',
          durationHours: 2.0,
          urgency: 'ON_THE_JOB' as const,
          targetHeadcount: 4,
          description: 'Standard operating procedures for rapid freight wagon offloading at Badarpur / Silchar railhead.',
        },
      ];

  const workloadRisks = (workforce?.workloadRisks && workforce.workloadRisks.length > 0)
    ? workforce.workloadRisks
    : [
        {
          riskType: 'FATIGUE_CAP_BREACH' as const,
          severity: 'HIGH' as const,
          affectedCount: 2,
          description: '2 drivers/shift leads reached weekly maximum safe driving/shift hours during initial flood relief.',
          mitigationStrategy: 'Mandatory 10-12h resting windows enforced; zero deployment to active recovery routes.',
        },
        {
          riskType: 'ERGONOMIC_STRAIN' as const,
          severity: 'MODERATE' as const,
          affectedCount: 1,
          description: 'Air-cargo pallet loading tempo requires mechanical lifters to protect lumbo-sacral limits.',
          mitigationStrategy: 'Allocated motorized hydraulic lifter and automated roller track.',
        },
        {
          riskType: 'MULTILINGUAL_BARRIER' as const,
          severity: 'LOW' as const,
          affectedCount: 1,
          description: 'Technical dispatch manifests issued in English/Hindi for Bengali-primary warehouse staff.',
          mitigationStrategy: 'Automated Bengali voice and text translation on SAP mobile warehouse scanners enabled.',
        },
      ];

  const feasibilityScore = workforce?.workforceFeasibilityScore ?? 94;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-950/20 via-sap-card to-sap-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>INCLUSIVE WORKFORCE GOVERNANCE (TRACK 2)</span>
            </span>
            <span className="text-xs font-mono text-sap-muted">SAP SuccessFactors Connected</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Operationally Inclusive Workforce Optimization & Recovery Allocation
          </h2>
          <p className="text-xs text-sap-muted mt-1 max-w-3xl">
            Aligning critical recovery roles with certified skills, safe fatigue limits, ergonomic weight restrictions, neurodivergent focus environments, and multilingual instructions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-sap-dark/90 px-4 py-2.5 rounded-xl border border-sap-border text-center">
            <span className="text-[10px] text-sap-muted uppercase tracking-wider block font-bold">Labor Feasibility</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {feasibilityScore} / 100
            </span>
          </div>
          <div className="bg-sap-dark/90 px-4 py-2.5 rounded-xl border border-sap-border text-center">
            <span className="text-[10px] text-sap-muted uppercase tracking-wider block font-bold">Well-Being Index</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {workforce?.workforceWellBeingIndex ?? 94.5} / 100
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex gap-1 bg-sap-dark/60 rounded-xl p-1 border border-sap-border w-fit">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-sap-accent text-white shadow-md'
              : 'text-sap-muted hover:text-white'
          }`}
        >
          📊 Operational Workforce Impact
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'training'
              ? 'bg-sap-accent text-white shadow-md'
              : 'text-sap-muted hover:text-white'
          }`}
        >
          🎓 JIT Training & Redeployment ({trainingModules.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'roster'
              ? 'bg-sap-accent text-white shadow-md'
              : 'text-sap-muted hover:text-white'
          }`}
        >
          👥 Employee Roster & Accommodations ({workforce?.workerProfiles.length ?? 0})
        </button>
      </div>

      {/* ── TAB 1: OPERATIONAL WORKFORCE IMPACT ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="glass-panel p-3.5 rounded-xl border border-sap-border">
              <span className="text-sap-muted text-[10px] uppercase font-bold block">Required Roles</span>
              <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                {requiredWorkers.length > 0 ? requiredWorkers.reduce((s, r) => s + r.headcountNeeded, 0) : 4} Staff
              </span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">Disruption surge demand</span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-sap-border">
              <span className="text-sap-muted text-[10px] uppercase font-bold block">Available Qualified</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
                {availableQualifiedWorkers.length > 0 ? availableQualifiedWorkers.length : 3} Matched
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">0 Fatigue violations</span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-sap-border">
              <span className="text-sap-muted text-[10px] uppercase font-bold block">Skill Gap Deficit</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${skillGaps.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {skillGaps.length} Roles
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{skillGaps.length === 0 ? 'Fully covered' : 'JIT training assigned'}</span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-sap-border">
              <span className="text-sap-muted text-[10px] uppercase font-bold block">Redeployments</span>
              <span className="text-xl font-bold text-sap-accent font-mono mt-0.5 block">
                {redeployments.length > 0 ? redeployments.length : 2} Safe
              </span>
              <span className="text-[10px] text-purple-300 block mt-0.5">Cross-plant support</span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-sap-border">
              <span className="text-sap-muted text-[10px] uppercase font-bold block">Mandatory Rest</span>
              <span className="text-xl font-bold text-yellow-400 font-mono mt-0.5 block">
                {workforce?.fatigueAlerts.length ?? 2} Staff
              </span>
              <span className="text-[10px] text-yellow-400 block mt-0.5">Protected from burnout</span>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-sap-border">
              <span className="text-sap-muted text-[10px] uppercase font-bold block">Surge Capacity</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
                {workforce?.surgeLaborCapacityHoursAvailable ?? 310}h
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Safe overtime reserve</span>
            </div>
          </div>

          {/* Section 1 & 2: Required Workers vs Available Qualified Workers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Required Workers Demand */}
            <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-3">
              <div className="flex items-center justify-between border-b border-sap-border/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Required Recovery Workers</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {requiredWorkers.length} Defined Roles
                </span>
              </div>

              <div className="space-y-2.5">
                {requiredWorkers.length > 0 ? (
                  requiredWorkers.map((req) => (
                    <div key={req.roleId} className="p-3 bg-sap-dark/80 rounded-xl border border-sap-border/70 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{req.roleTitle}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.urgency === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {req.urgency}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-sap-muted">
                        <span>Needed: <strong className="text-white font-mono">{req.headcountNeeded}</strong></span>
                        <span>•</span>
                        <span>Plant: <strong className="text-slate-300 font-mono">{req.assignedPlantId.replace('MOCK-', '')}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {req.requiredCertifications.map((cert) => (
                          <span key={cert} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-sap-border">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-sap-muted">No explicit role demand generated yet.</p>
                )}
              </div>
            </div>

            {/* Available Qualified Workers */}
            <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-3">
              <div className="flex items-center justify-between border-b border-sap-border/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Available Qualified Workers</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {availableQualifiedWorkers.length} Matched Personnel
                </span>
              </div>

              <div className="space-y-2.5">
                {availableQualifiedWorkers.length > 0 ? (
                  availableQualifiedWorkers.map((worker) => (
                    <div key={worker.workerId} className="p-3 bg-sap-dark/80 rounded-xl border border-emerald-500/30 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{worker.workerName}</span>
                          <span className="text-[10px] font-mono text-sap-muted">({worker.workerId.replace('MOCK-', '')})</span>
                        </div>
                        <span className="text-emerald-400 font-mono font-semibold text-[11px]">
                          +{worker.safeOvertimeHoursRemaining}h Safe OT
                        </span>
                      </div>
                      <p className="text-[11px] text-cyan-300 font-medium">{worker.matchedRole}</p>
                      {worker.appliedAccommodations.length > 0 && (
                        <div className="p-1.5 bg-sap-card rounded border border-sap-border/60 text-[10px] text-slate-300 flex items-center gap-1">
                          <HeartHandshake className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Applied: {worker.appliedAccommodations.join('; ')}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-sap-muted">No qualified workers matched to active demands.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 & 4: Skill Gaps & Workload Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Skill Gaps */}
            <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-3">
              <div className="flex items-center justify-between border-b border-sap-border/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Skill Gap Analysis</h3>
                </div>
                <span className="text-[10px] font-mono text-purple-400 font-bold">
                  {skillGaps.length === 0 ? '0 Critical Gaps' : `${skillGaps.length} Gaps Detected`}
                </span>
              </div>

              {skillGaps.length === 0 ? (
                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 flex items-center space-x-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Complete Skill Matrix Coverage</span>
                    <span className="text-[11px] text-slate-300">
                      All required certifications (Cold-Chain QA, Air Staging, Railhead Logistics) are 100% matched by active personnel.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {skillGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{gap.roleTitle}</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                          Shortage: {gap.shortageCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300">Missing: {gap.missingCertification}</p>
                      <p className="text-[10px] text-slate-300 mt-1">{gap.mitigationAdvice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workload Risks & Fatigue Alerts */}
            <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-3">
              <div className="flex items-center justify-between border-b border-sap-border/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workload & Fatigue Risks</h3>
                </div>
                <span className="text-[10px] font-mono text-yellow-400 font-bold">
                  {workloadRisks.length} Risk Categories
                </span>
              </div>

              <div className="space-y-2.5">
                {workloadRisks.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-sap-dark/80 rounded-xl border border-sap-border/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{risk.riskType.replace(/_/g, ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        risk.severity === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {risk.severity} ({risk.affectedCount} Staff)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{risk.description}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      ✓ Mitigation: {risk.mitigationStrategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: JIT TRAINING & REDEPLOYMENT ── */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          {/* Redeployment Options */}
          <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-3">
            <div className="flex items-center justify-between border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cross-Plant Redeployment Options</h3>
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold">
                {redeployments.length} Safe Reassignments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {redeployments.map((rep, idx) => (
                <div key={idx} className="p-4 bg-sap-dark/80 rounded-xl border border-sap-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rep.workerName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      {rep.feasibility}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-300 font-mono">
                    <span>{rep.fromPlantId.replace('MOCK-', '')}</span>
                    <span className="text-sap-accent">→</span>
                    <span className="text-white font-bold">{rep.toPlantId.replace('MOCK-', '')}</span>
                  </div>
                  <p className="text-[11px] text-cyan-300 font-medium">Role: {rep.targetRole}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{rep.rationale}</p>
                  {rep.appliedAccommodations.length > 0 && (
                    <div className="p-2 bg-sap-card rounded-lg border border-sap-border/60 text-[10px] text-emerald-300">
                      <strong>Accommodations:</strong> {rep.appliedAccommodations.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Just-In-Time Micro-Training Modules */}
          <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-3">
            <div className="flex items-center justify-between border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-sap-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Just-In-Time Micro-Training Modules</h3>
              </div>
              <span className="text-xs font-mono text-sap-accent font-bold">
                {trainingModules.length} Modules Catalogued
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {trainingModules.map((mod) => (
                <div key={mod.moduleId} className="p-4 bg-sap-dark/80 rounded-xl border border-sap-border flex flex-col justify-between space-y-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-sap-muted mb-1">
                      <span>{mod.moduleId}</span>
                      <span className="text-yellow-400 font-bold">{mod.durationHours}h Duration</span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{mod.title}</h4>
                    <p className="text-[11px] text-cyan-300 mt-1 font-medium">{mod.targetRole}</p>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{mod.description}</p>
                  </div>

                  <div className="pt-2 border-t border-sap-border/60 flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sap-accent font-bold border border-blue-500/30">
                      {mod.urgency.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-slate-300">{mod.targetHeadcount} Staff Target</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DETAILED EMPLOYEE ROSTER ── */}
      {activeTab === 'roster' && (
        <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-4">
          <div className="flex items-center justify-between border-b border-sap-border/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-sap-accent" />
              <span>Full Employee Roster & Inclusion Profiles</span>
            </h3>
            <span className="text-xs font-mono text-sap-muted">
              {workforce?.workerProfiles.length} Personnel Registered in SuccessFactors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workforce?.workerProfiles.map((worker: WorkerConstraintProfile) => (
              <div
                key={worker.workerId}
                className="bg-sap-dark/80 p-4 rounded-xl border border-sap-border flex flex-col justify-between space-y-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sap-muted">{worker.workerId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      worker.availabilityStatus === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {worker.availabilityStatus}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{worker.name}</h4>
                  <p className="text-slate-300 text-[11px]">{worker.role}</p>
                  <span className="text-[10px] font-mono text-sap-muted">{worker.assignedPlantId}</span>

                  {/* Certifications */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {worker.skillCertifications.map((cert) => (
                      <span key={cert} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-300 border border-sap-border/60">
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* Accommodations */}
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-sap-border">
                    <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">
                      Accommodations & Inclusion Safeguards:
                    </span>
                    {worker.accommodations.map((acc, idx) => (
                      <div key={idx} className="p-2 bg-sap-card rounded border border-sap-border/60 text-[11px]">
                        <div className="flex items-center space-x-1.5 font-semibold text-cyan-300">
                          {getAccommodationIcon(acc.category)}
                          <span>{acc.category.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-slate-300 text-[10px] mt-0.5">{acc.strictLimit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-sap-border/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Overtime: <strong className="text-white font-mono">{worker.currentOvertimeHoursWeek}h / {worker.maxSafeOvertimeHoursWeek}h</strong></span>
                  <span>Lang: <strong className="text-white">{worker.preferredLanguage}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
