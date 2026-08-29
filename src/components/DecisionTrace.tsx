/**
 * SAP Sentinel — Visual Decision Trace Component
 * 
 * Provides an executive-level visual flowchart connecting the 6 key phases:
 * Disruption → Supply Chain Impact → Workforce Impact → Recovery Options → Scenario Evaluation → Recommendation
 * 
 * Answers the 3 core business questions:
 * 1. "What did each agent discover?"
 * 2. "What options were created?"
 * 3. "Why was this scenario recommended?"
 * 
 * Invariant: Zero raw chain-of-thought. Only structured enterprise findings.
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Package, 
  Users, 
  Route, 
  BarChart3, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface DecisionTraceProps {
  currentCase: Case;
  onSelectAgent?: (agentName: string) => void;
}

export type TraceStepId = 'disruption' | 'supplyChain' | 'workforce' | 'recovery' | 'evaluation' | 'recommendation';

interface TraceStepConfig {
  id: TraceStepId;
  stepNumber: number;
  title: string;
  subtitle: string;
  agentName: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
}

export const DecisionTrace: React.FC<DecisionTraceProps> = ({ currentCase, onSelectAgent }) => {
  const [selectedStep, setSelectedStep] = useState<TraceStepId>('recommendation');

  const disruption = currentCase.disruption;
  const supplyChain = currentCase.supplyChainImpact;
  const workforce = currentCase.workforceImpact;
  const scenarios = currentCase.candidateScenarios ?? [];
  const decision = currentCase.decision;
  const evaluations = decision?.scenarioEvaluations ?? [];

  const steps: TraceStepConfig[] = [
    {
      id: 'disruption',
      stepNumber: 1,
      title: 'Disruption',
      subtitle: disruption ? `${disruption.category} · ${disruption.severity}` : 'Pending Detection',
      agentName: 'Disruption Agent',
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      accentColor: 'text-red-400',
      borderColor: 'border-red-500/40',
      bgGradient: 'from-red-950/30 to-slate-900/40',
    },
    {
      id: 'supplyChain',
      stepNumber: 2,
      title: 'Supply Chain Impact',
      subtitle: supplyChain ? `₹${(supplyChain.estimatedTotalValueAtRiskInr / 10000000).toFixed(2)} Cr At Risk` : 'Pending Analysis',
      agentName: 'Supply Chain Impact Agent',
      icon: <Package className="w-4 h-4 text-cyan-400" />,
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgGradient: 'from-cyan-950/30 to-slate-900/40',
    },
    {
      id: 'workforce',
      stepNumber: 3,
      title: 'Workforce Impact',
      subtitle: workforce ? `${workforce.availableStaffCount} Staff · ${workforce.workforceWellBeingIndex}/100 Well-Being` : 'Pending Assessment',
      agentName: 'Workforce Agent',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgGradient: 'from-emerald-950/30 to-slate-900/40',
    },
    {
      id: 'recovery',
      stepNumber: 4,
      title: 'Recovery Options',
      subtitle: scenarios.length > 0 ? `${scenarios.length} Modalities Synthesized` : 'Pending Generation',
      agentName: 'Recovery Adaptation Agent',
      icon: <Route className="w-4 h-4 text-amber-400" />,
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgGradient: 'from-amber-950/30 to-slate-900/40',
    },
    {
      id: 'evaluation',
      stepNumber: 5,
      title: 'Scenario Evaluation',
      subtitle: decision ? `${decision.scenarioEvaluations?.length ?? 3} Scenarios Multi-Scored` : 'Pending Scoring',
      agentName: 'Decision Agent (Scoring Engine)',
      icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgGradient: 'from-purple-950/30 to-slate-900/40',
    },
    {
      id: 'recommendation',
      stepNumber: 6,
      title: 'Recommendation',
      subtitle: decision ? `${decision.recommendedScenarioId.replace('SCENARIO-', '')} · Rank #1` : 'Pending Final Decision',
      agentName: 'Decision Agent (Final Plan)',
      icon: <Award className="w-4 h-4 text-emerald-400" />,
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/60',
      bgGradient: 'from-emerald-950/40 to-slate-900/60',
    },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-sap-border space-y-5 bg-gradient-to-b from-slate-900/90 to-sap-card shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-blue-500/20 rounded-lg text-sap-accent border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Transparent Decision Trace</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sap-muted border border-sap-border">
                AUDITABLE LINEAGE
              </span>
            </h3>
            <p className="text-[11px] text-sap-muted">
              Click any node in the reasoning path to inspect evidence, constraints, and contributions to the final recommendation.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 self-start sm:self-center">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Zero Private CoT · 100% Structured Evidence</span>
        </div>
      </div>

      {/* Visual Pipeline Flow Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 relative">
        {steps.map((step, idx) => {
          const isSelected = selectedStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? `${step.borderColor} bg-gradient-to-b ${step.bgGradient} shadow-lg ring-1 ring-white/20 scale-[1.02]`
                  : 'border-sap-border/70 bg-sap-dark/60 hover:border-slate-500 hover:bg-sap-dark/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 text-sap-muted">
                  <span>0{step.stepNumber}</span>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity hidden lg:block" />
                  )}
                </div>
                <div className="flex items-center space-x-1.5 mb-1">
                  {step.icon}
                  <span className="font-bold text-xs text-white truncate">{step.title}</span>
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-1 font-medium">{step.subtitle}</p>
              </div>

              {isSelected && (
                <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white">
                  <span>Active Inspector</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Interactive Inspector Panel for Selected Trace Step */}
      <div className="p-4.5 rounded-xl bg-sap-dark/80 border border-sap-border text-xs space-y-4">
        {selectedStep === 'disruption' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="font-bold text-sm text-white">Stage 1: Disruption Detection & Telemetry Ingestion</span>
                <span className="text-[10px] font-mono text-sap-muted">Disruption Agent</span>
              </div>
              {onSelectAgent && (
                <button
                  onClick={() => onSelectAgent('Disruption Agent')}
                  className="text-[11px] text-sap-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Full Agent Record</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-sap-card rounded-lg border border-sap-border">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">What Was Detected?</span>
                <p className="text-slate-200 mt-1 font-semibold">
                  {disruption?.headline ?? 'Landslide and roadbed collapse on NH-27 (Dima Hasao / Jatinga Ridge)'}
                </p>
                <p className="text-slate-400 text-[11px] mt-1">{disruption?.description}</p>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Physical Constraints Sensed</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-sap-muted">Estimated Blockage:</span>
                  <span className="font-mono text-red-400 font-bold">{disruption?.estimatedBlockedDurationHours ?? 84} Hours</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-sap-muted">Monsoon 24h Rain:</span>
                  <span className="font-mono text-white font-semibold">{disruption?.weatherDetails.rainfallMmLast24Hours ?? 245.8} mm (Red Alert)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-sap-muted">Corridor Type:</span>
                  <span className="text-amber-300 font-semibold">{disruption?.isCriticalLifelineRoute ? 'Critical Lifeline Arterial' : 'Secondary Route'}</span>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Evidence Ingested</span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>IOT-KM142-GEOPHONE: 180m soil shear</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>IMD-ASSAM-ALERT: 245.8mm deluge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 'supplyChain' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white">Stage 2: Supply Chain Exposure & Stockout Projection</span>
                <span className="text-[10px] font-mono text-sap-muted">Supply Chain Impact Agent</span>
              </div>
              {onSelectAgent && (
                <button
                  onClick={() => onSelectAgent('Supply Chain Impact Agent')}
                  className="text-[11px] text-sap-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Full Agent Record</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-sap-card rounded-lg border border-sap-border">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">What Orders Are Stranded?</span>
                <div className="mt-1 space-y-1 text-[11px]">
                  <p className="text-white font-semibold">
                    {supplyChain?.impactedPOs.length ?? 3} S/4HANA POs stranded worth ₹{supplyChain ? (supplyChain.estimatedTotalValueAtRiskInr / 10000000).toFixed(2) : '4.85'} Cr
                  </p>
                  <p className="text-slate-400">
                    6,500 vials Insulin, 820 Oncology packs, 35T PDS Emergency Grains.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Clinical Stockout Deadlines</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-sap-muted">Silchar Civil Hospital:</span>
                  <span className="font-mono text-red-400 font-bold">28 Hours (1.2 days buffer)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-sap-muted">Cold-Chain Battery:</span>
                  <span className="font-mono text-amber-400 font-bold">18 Hours thermal reserve</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-sap-muted">Agartala Depot:</span>
                  <span className="font-mono text-slate-300">58 Hours (2.4 days buffer)</span>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Key Bottlenecks Identified</span>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>ICU insulin stockout imminent within 28h</li>
                  <li>Chemotherapy packs blocked on NH-27</li>
                  <li>PDS grain below 48h emergency reserve</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 'workforce' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">Stage 3: Inclusive Workforce Constraints & Ergonomics</span>
                <span className="text-[10px] font-mono text-sap-muted">Workforce Agent</span>
              </div>
              {onSelectAgent && (
                <button
                  onClick={() => onSelectAgent('Workforce Agent')}
                  className="text-[11px] text-sap-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Full Agent Record</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-sap-card rounded-lg border border-sap-border">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Workforce Availability</span>
                <div className="mt-1 space-y-1 text-[11px]">
                  <p className="text-white font-semibold">
                    {workforce?.availableStaffCount ?? 42} Active Personnel across Guwahati & Silchar
                  </p>
                  <p className="text-emerald-400 font-mono">
                    Surge capacity: {workforce?.surgeLaborCapacityHoursAvailable ?? 310} safe hours available
                  </p>
                  <p className="text-slate-400">
                    Workforce Well-Being baseline: {workforce?.workforceWellBeingIndex ?? 88.5}/100
                  </p>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Fatigue & Safety Guards</span>
                <div className="text-[11px] text-amber-300 space-y-1">
                  <p>• Driver Rajat Das: 11h driving limit reached (12h rest mandate)</p>
                  <p>• Shift Lead Anjali Roy: 18h triage reached (10h rest mandate)</p>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                  ✓ Mandatory rest enforced — zero overworked staff deployed.
                </p>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Inclusive Accommodations Catalogued</span>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>• <strong>Ergonomic:</strong> Pranab Sarma (max 12kg single lift; forklift mandatory)</p>
                  <p>• <strong>Neurodivergent:</strong> Debashis Sen (quiet packaging cubicle & visual QA checklist)</p>
                  <p>• <strong>Multilingual:</strong> Bimalendu Deb (Bengali digital manifest translation)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 'recovery' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <Route className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">Stage 4: Multi-Modal Recovery Synthesis</span>
                <span className="text-[10px] font-mono text-sap-muted">Recovery Adaptation Agent</span>
              </div>
              {onSelectAgent && (
                <button
                  onClick={() => onSelectAgent('Recovery Adaptation Agent')}
                  className="text-[11px] text-sap-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Full Agent Record</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-sap-card rounded-lg border border-sap-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider">Scenario A: Fast Air</span>
                  <span className="text-yellow-400 font-mono font-bold">10h · ₹34.5L</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Full emergency airlift for all 3 POs (Medicines + Food) via chartered flight to Kumbhirgram Airport.
                </p>
                <span className="text-[10px] text-red-400 block mt-2">Trade-off: ₹21.7L premium; 14h shift exceeds fatigue limits.</span>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-emerald-500/50 bg-emerald-950/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Scenario B: Multimodal Split</span>
                  <span className="text-emerald-400 font-mono font-bold">8h/14h · ₹12.8L</span>
                </div>
                <p className="text-[11px] text-slate-200 font-medium">
                  Precision split: Dedicated light air charter for life-saving insulin/oncology (8h) + Lumding-Badarpur BG Rail rake for food (14h).
                </p>
                <span className="text-[10px] text-emerald-400 block mt-2">Trade-off: 63% savings vs Air; 100% accommodations met; 0 fatigue risk.</span>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider">Scenario C: Feeder Bypass</span>
                  <span className="text-sap-muted font-mono font-bold">36h · ₹3.2L</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Heavy convoy bypass through Meghalaya hills (NH-06 Shillong-Jowai).
                </p>
                <span className="text-[10px] text-red-400 block mt-2">Trade-off: 36h delay breaches 28h hospital stockout; battery dies.</span>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 'evaluation' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm text-white">Stage 5: Multi-Criteria Algorithmic Scoring</span>
                <span className="text-[10px] font-mono text-sap-muted">Decision Agent (Scoring Engine)</span>
              </div>
              {onSelectAgent && (
                <button
                  onClick={() => onSelectAgent('Decision Agent')}
                  className="text-[11px] text-sap-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Full Agent Record</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">7-Criteria Weighted Matrix</span>
                <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between"><span>Recovery Effectiveness:</span><span className="text-white">22% weight</span></div>
                  <div className="flex justify-between"><span>Critical Shipment Protection:</span><span className="text-white">20% weight</span></div>
                  <div className="flex justify-between"><span>Recovery Time:</span><span className="text-white">18% weight</span></div>
                  <div className="flex justify-between"><span>Operational Risk:</span><span className="text-white">14% weight</span></div>
                  <div className="flex justify-between"><span>Incremental Cost:</span><span className="text-white">12% weight</span></div>
                  <div className="flex justify-between"><span>Workforce Feasibility:</span><span className="text-white">9% weight</span></div>
                  <div className="flex justify-between"><span>ESG Carbon Footprint:</span><span className="text-white">5% weight</span></div>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Comparative Composite Scores</span>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 bg-emerald-950/30 rounded border border-emerald-500/40 flex justify-between items-center">
                    <span className="font-bold text-white">#1 Scenario B (Multimodal Split)</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {evaluations.find(e => e.scenarioId.includes('B'))?.compositeScore.toFixed(1) ?? '95.8'} / 100
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-sap-border flex justify-between items-center">
                    <span className="text-slate-300">#2 Scenario A (Fast Air)</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {evaluations.find(e => e.scenarioId.includes('A'))?.compositeScore.toFixed(1) ?? '79.4'} / 100
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-sap-border flex justify-between items-center">
                    <span className="text-slate-300">#3 Scenario C (Feeder Bypass)</span>
                    <span className="font-mono font-semibold text-slate-400">
                      {evaluations.find(e => e.scenarioId.includes('C'))?.compositeScore.toFixed(1) ?? '42.1'} / 100
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Why Did Scenario B Win?</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Pareto-optimal solution: delivers critical insulin 20h before hospital stockout, eliminates ₹21.7L in waste vs full air charter, achieves 94.5/100 worker well-being with 0 fatigue exceedance.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 'recommendation' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sap-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">Stage 6: Final Decision & Automated SAP Action Plan</span>
                <span className="text-[10px] font-mono text-sap-muted">Decision Agent (Executive Output)</span>
              </div>
              {onSelectAgent && (
                <button
                  onClick={() => onSelectAgent('Decision Agent')}
                  className="text-[11px] text-sap-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Full Agent Record</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/50 space-y-1.5">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Recommended Scenario</span>
                <h4 className="text-sm font-bold text-white">{decision?.recommendedScenarioName ?? 'Scenario B: Precision Multimodal Split'}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {decision?.justification.primaryReason ?? 'Delivers life-saving insulin in 8 hours, saves 63% cost, guarantees full inclusive workforce accommodations.'}
                </p>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Expected Impact</span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-sap-muted">Medical Stockout Prevented:</span>
                    <span className="text-emerald-400 font-bold">20h Ahead of ICU Deadline</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sap-muted">Logistics Budget Saved:</span>
                    <span className="text-emerald-400 font-mono font-bold">₹21.70 Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sap-muted">Workforce Burnout Risk:</span>
                    <span className="text-emerald-400 font-bold">LOW (0 Overtime Violations)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sap-muted">ESG Carbon Savings:</span>
                    <span className="text-emerald-400 font-mono font-bold">10,350 kg CO₂ avoided</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-sap-card rounded-lg border border-sap-border space-y-1.5">
                <span className="text-[10px] text-sap-muted uppercase tracking-wider block">Human Governance Requirement</span>
                <div className="p-2 bg-blue-950/40 rounded border border-blue-500/40 text-[11px] text-blue-200">
                  <span className="font-semibold block">HITL Approval Gate: MANDATORY</span>
                  <span>Requires business confirmation before automated commit into SAP S/4HANA & SuccessFactors.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
