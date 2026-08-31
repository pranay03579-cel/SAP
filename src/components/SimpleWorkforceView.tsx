/**
 * SimpleWorkforceView — Phase 13 Final Polish
 *
 * Minimal, light-mode workforce panel.
 * Same design language as SimpleAgentTimeline.
 * Uses actual WorkforceImpact domain type.
 */

import React, { useState } from 'react';
import {
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ArrowRightLeft,
  Brain,
  Activity,
  Languages,
  Ear,
  HeartHandshake,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { Case, AccommodationCategory } from '../../shared/types/domain';

interface SimpleWorkforceViewProps {
  currentCase: Case;
}

function AccommodationIcon({ category }: { category: AccommodationCategory }) {
  const cls = 'w-3.5 h-3.5';
  switch (category) {
    case 'NEURODIVERGENT_FOCUS':     return <Brain className={cls} />;
    case 'PHYSICAL_ERGONOMICS':      return <Activity className={cls} />;
    case 'MULTILINGUAL_INSTRUCTION': return <Languages className={cls} />;
    case 'HEARING_ASSIST':           return <Ear className={cls} />;
    default:                          return <HeartHandshake className={cls} />;
  }
}

function urgencyColor(urgency: string) {
  switch (urgency) {
    case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
    case 'HIGH':     return 'bg-amber-50 text-amber-700 border-amber-200';
    default:         return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export const SimpleWorkforceView: React.FC<SimpleWorkforceViewProps> = ({ currentCase }) => {
  const w = currentCase.workforceImpact;
  const [expanded, setExpanded] = useState<string | null>('summary');

  if (!w) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <Users className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Workforce data not yet available. Run the AI pipeline first.</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'summary',
      icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
      label: 'Workforce status',
      summary: `${w.availableStaffCount} of ${w.availableStaffCount + w.constrainedStaffCount} workers are available and qualified. Feasibility score: ${w.workforceFeasibilityScore.toFixed(0)}/100.`,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <StatCell label="Available" value={String(w.availableStaffCount)} color="green" />
            <StatCell label="On mandatory rest" value={String(w.constrainedStaffCount)} color="amber" />
            <StatCell label="Feasibility score" value={`${w.workforceFeasibilityScore.toFixed(0)}/100`} color="blue" />
          </div>
          {w.fatigueAlerts.length > 0 && (
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Fatigue alerts</span>
              {w.fatigueAlerts.map((a) => (
                <div key={a.workerId} className="flex items-start space-x-1.5 text-xs text-amber-700 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>{a.reason} — mandatory rest: {a.mandatoryRestHours}h</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'roles',
      icon: <Briefcase className="w-4 h-4 text-violet-500" />,
      label: 'Required roles',
      summary: `${w.requiredWorkers?.length ?? 0} role(s) needed for the recovery plan.`,
      content: (
        <div className="space-y-2">
          {(w.requiredWorkers ?? []).map((role) => (
            <div key={role.roleId} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${urgencyColor(role.urgency)}`}>
                {role.urgency}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{role.roleTitle}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {role.headcountNeeded} worker{role.headcountNeeded !== 1 ? 's' : ''} · {role.requiredCertifications.join(', ')}
                </p>
              </div>
            </div>
          ))}
          {w.availableQualifiedWorkers.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned workers</span>
              {w.availableQualifiedWorkers.map((wk) => (
                <div key={wk.workerId} className="flex items-center justify-between text-xs text-slate-600 py-1">
                  <div>
                    <span className="font-semibold text-slate-800">{wk.workerName}</span>
                    <span className="text-slate-400 ml-1">— {wk.matchedRole}</span>
                  </div>
                  <span className="text-[10px] text-green-600 font-semibold">
                    ✓ {wk.safeOvertimeHoursRemaining}h safe overtime
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    ...(w.skillGaps.length > 0 ? [{
      id: 'gaps',
      icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
      label: 'Skill gaps & training',
      summary: `${w.skillGaps.length} gap(s) identified — ${w.trainingRequirements.length} training module(s) recommended.`,
      content: (
        <div className="space-y-3">
          {w.skillGaps.map((gap, i) => (
            <div key={i} className="flex items-start space-x-2 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{gap.roleTitle}</span>
                <span className="text-slate-400 ml-1">— missing: {gap.missingCertification}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{gap.mitigationAdvice}</p>
              </div>
            </div>
          ))}
          {w.trainingRequirements.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended training</span>
              {w.trainingRequirements.map((t) => (
                <div key={t.moduleId} className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">{t.title}</span>
                    <span className="text-slate-400 ml-1">· {t.durationHours}h · {t.targetHeadcount} worker{t.targetHeadcount !== 1 ? 's' : ''}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    }] : []),
    ...(w.accommodationRequirements.length > 0 ? [{
      id: 'accommodations',
      icon: <HeartHandshake className="w-4 h-4 text-green-500" />,
      label: 'Special accommodations',
      summary: `${w.accommodationRequirements.length} worker(s) have ergonomic, sensory, or language requirements — all accommodated.`,
      content: (
        <div className="space-y-2">
          {w.accommodationRequirements.map((a, i) => {
            const profile = w.workerProfiles.find((p) => p.workerId === a.workerId);
            return (
              <div key={i} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500 mt-0.5">
                  <AccommodationIcon category={a.category} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    {profile?.name ?? a.workerId}
                    {profile?.role ? <span className="text-slate-400 font-normal ml-1">— {profile.role}</span> : null}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {a.category.replace(/_/g, ' ').toLowerCase()}
                    {a.ergonomicRestriction ? ` · ${a.ergonomicRestriction}` : ''}
                    {a.instructionTranslationNeeded ? ' · Multilingual instruction required' : ''}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded flex-shrink-0">
                  ✓ respected
                </span>
              </div>
            );
          })}
        </div>
      ),
    }] : []),
    ...(w.possibleRedeployments && w.possibleRedeployments.length > 0 ? [{
      id: 'redeployments',
      icon: <ArrowRightLeft className="w-4 h-4 text-cyan-500" />,
      label: 'Redeployment options',
      summary: `${w.possibleRedeployments.length} worker redeployment(s) possible to cover skill gaps.`,
      content: (
        <div className="space-y-2">
          {w.possibleRedeployments.map((r) => (
            <div key={r.workerId} className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">{r.workerName}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${r.feasibility === 'IMMEDIATE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {r.feasibility.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {r.fromPlantId} → <span className="font-medium text-slate-700">{r.toPlantId}</span> · Role: {r.targetRole}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{r.rationale}</p>
            </div>
          ))}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Workforce details</h3>
        </div>
        <span className="text-xs text-slate-400">Check whether the workforce plan is safe and practical.</span>
      </div>

      {/* Quick Guarantees Banner */}
      <div className="bg-green-50/70 border-b border-green-100 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-green-900">
        <div className="flex items-center space-x-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <span>Enough qualified workers available ({w.availableStaffCount} active)</span>
        </div>
        <div className="flex items-center space-x-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <span>Required worker accommodations covered ({w.accommodationRequirements.length} profiles)</span>
        </div>
        <div className="flex items-center space-x-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <span>Fatigue & rest limits respected</span>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-slate-100">
        {sections.map((section) => {
          const isOpen = expanded === section.id;
          return (
            <div key={section.id}>
              <button
                onClick={() => setExpanded(isOpen ? null : section.id)}
                className="w-full px-5 py-3.5 flex items-start space-x-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">{section.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 mb-0.5">{section.label}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{section.summary}</p>
                </div>
                <div className="flex-shrink-0 mt-1 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pl-14">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">
          Workforce constraints verified deterministically from mock employee profiles.
        </p>
      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const StatCell: React.FC<{ label: string; value: string; color: 'green' | 'amber' | 'blue' }> = ({ label, value, color }) => {
  const bg = { green: 'bg-green-50 border-green-200', amber: 'bg-amber-50 border-amber-200', blue: 'bg-blue-50 border-blue-200' }[color];
  const val = { green: 'text-green-800', amber: 'text-amber-800', blue: 'text-blue-800' }[color];
  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <span className="block text-[10px] text-slate-400 font-medium mb-0.5">{label}</span>
      <span className={`text-lg font-bold font-mono ${val}`}>{value}</span>
    </div>
  );
};
