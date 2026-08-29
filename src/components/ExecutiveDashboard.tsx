import React from 'react';
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface ExecutiveDashboardProps {
  currentCase: Case;
  onNavigateTab: (tab: string) => void;
  onOpenApproval: () => void;
  onSelectAgent: (agentName: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  currentCase,
  onNavigateTab,
  onOpenApproval,
  onSelectAgent,
}) => {
  const disruption = currentCase.disruption;
  const decision = currentCase.decision;
  const isApproved = currentCase.status === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* 1. Critical Disruption Alert Banner */}
      <div className="glass-panel rounded-xl p-5 border-l-4 border-l-red-500 relative overflow-hidden bg-gradient-to-r from-red-950/30 via-sap-card to-sap-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 text-red-400 mt-0.5">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/20 text-red-300 rounded border border-red-500/40 uppercase">
                  {disruption?.severity || 'CRITICAL'} ALERT
                </span>
                <span className="text-xs font-mono text-sap-muted">{currentCase.caseNumber}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-sap-cyan rounded border border-blue-500/20">
                  Track 1 & 2 Dual Governance
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {disruption?.headline || 'Critical Arterial Route Disruption Detected'}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                {disruption?.description || 'Highway mudslide has severed primary freight connection to Barak Valley hospitals and depots.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('disruption')}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-sap-border transition-colors flex items-center space-x-1.5"
            >
              <span>View Route Risk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('scenarios')}
              className="px-3.5 py-2 text-xs font-semibold bg-sap-accent hover:bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
            >
              <span>Compare Scenarios (3)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 30-Second Executive Briefing Matrix (Hackathon Judge Overview) */}
      <div className="glass-panel p-5 rounded-2xl border border-sap-border bg-sap-card/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-sap-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-sap-accent/20 text-sap-accent rounded">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              30-Second Executive Control Briefing
            </h3>
            <span className="text-[11px] text-sap-muted hidden sm:inline">
              — Clear 7-Point Autonomous Recovery Lineage
            </span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            Pipeline Verified (5/5 Agents)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5 text-xs">
          {/* Q1: What happened */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">1. What Happened?</span>
              <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                NH-27 Blocked at Dima Hasao
              </p>
            </div>
            <span className="text-[10px] text-red-400 mt-2 font-mono">245.8mm Rain • 84h Est. Block</span>
          </div>

          {/* Q2: What is affected */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">2. What Is Affected?</span>
              <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                3 POs (₹4.85 Cr) at Risk
              </p>
            </div>
            <span className="text-[10px] text-sap-gold mt-2 font-mono">Insulin (6.5k) • Chemo (820)</span>
          </div>

          {/* Q3: What did agents discover */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">3. Agent Discoveries</span>
              <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                28h Hospital Stockout Window
              </p>
            </div>
            <span className="text-[10px] text-sap-cyan mt-2 font-mono">42/50 Staff • 3 Accommodations</span>
          </div>

          {/* Q4: What recovery options exist */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">4. Recovery Options</span>
              <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                3 Multimodal Scenarios
              </p>
            </div>
            <span className="text-[10px] text-slate-300 mt-2 font-mono">A (Air) • B (Split) • C (Road)</span>
          </div>

          {/* Q5: Which was recommended */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">5. Recommended</span>
              <p className="font-bold text-emerald-400 mt-1 text-[11px] leading-tight">
                Scenario B: Precision Split
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 mt-2 font-mono">Score: 95.8 / 100 (#1 Rank)</span>
          </div>

          {/* Q6: Why */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">6. Why Best?</span>
              <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                Life-Saving & 63% Cost Save
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 mt-2 font-mono">8h Delivery • 94.5 Well-Being</span>
          </div>

          {/* Q7: What happens after approval */}
          <div className="bg-sap-dark/70 p-3 rounded-xl border border-sap-border hover:border-sap-border/90 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-sap-muted uppercase tracking-wider block">7. Post-Approval</span>
              <p className="font-bold text-sap-accent mt-1 text-[11px] leading-tight">
                Auto SAP Dispatch Actions
              </p>
            </div>
            <span className="text-[10px] text-slate-300 mt-2 font-mono">S/4HANA • SF • LBN Rake</span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Disruptions */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sap-muted uppercase tracking-wider">Active Disruptions</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">1</span>
            <span className="text-xs font-medium text-red-400">Critical Priority</span>
          </div>
          <p className="text-xs text-sap-muted mt-1 truncate">NH-27 Dima Hasao Section</p>
          <div className="mt-3 pt-3 border-t border-sap-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Rainfall: 245.8mm/24h</span>
            <span className="text-red-400 font-medium">Red Alert</span>
          </div>
        </div>

        {/* Metric 2: Affected & Critical Cargo */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sap-muted uppercase tracking-wider">Impacted S/4HANA POs</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-sap-cyan">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">3 POs</span>
            <span className="text-xs font-medium text-sap-gold">₹4.85 Cr At Risk</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 truncate">
            Insulin (6.5k), Oncology (820), Food (24k)
          </p>
          <div className="mt-3 pt-3 border-t border-sap-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Life-Saving Critical:</span>
            <span className="text-sap-crimson font-semibold">2 Shipments</span>
          </div>
        </div>

        {/* Metric 3: Estimated Delay & Stockout Timeline */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sap-muted uppercase tracking-wider">Stockout Window</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-sap-gold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-sap-gold">28 Hours</span>
            <span className="text-xs font-medium text-slate-400">Silchar Hospital</span>
          </div>
          <p className="text-xs text-sap-muted mt-1">Highway Blockade: 84h estimated</p>
          <div className="mt-3 pt-3 border-t border-sap-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Cold-Chain Battery:</span>
            <span className="text-amber-400 font-mono font-medium">18h Remaining</span>
          </div>
        </div>

        {/* Metric 4: Inclusive Workforce Availability */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sap-muted uppercase tracking-wider">Inclusive Workforce</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-sap-emerald">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">42 / 50</span>
            <span className="text-xs font-medium text-slate-400">Available</span>
          </div>
          <p className="text-xs text-sap-muted mt-1">310 Surge Hours Capacity</p>
          <div className="mt-3 pt-3 border-t border-sap-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Accommodations:</span>
            <span className="text-sap-cyan font-medium">3 Active Profiles</span>
          </div>
        </div>
      </div>

      {/* 3. Recommended Recovery Action & Decision Highlight */}
      <div className="glass-panel rounded-xl p-6 border border-blue-500/30 bg-gradient-to-br from-blue-950/20 via-sap-card to-sap-card shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-sap-accent/20 text-sap-accent rounded-md">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sap-accent">
                Autonomous Recovery Recommendation
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                Score: 95.8 / 100 (Pareto Optimal)
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {decision?.recommendedScenarioName || 'Scenario B: Precision Multimodal Split'}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {decision?.justification.primaryReason}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-sap-dark/60 p-3 rounded-lg border border-sap-border">
                <span className="text-xs text-sap-muted block">Clinical Delivery</span>
                <span className="text-base font-bold text-emerald-400">8 Hours (GAU → IXS)</span>
                <span className="text-xs text-slate-400 block mt-0.5">20h ahead of stockout</span>
              </div>
              <div className="bg-sap-dark/60 p-3 rounded-lg border border-sap-border">
                <span className="text-xs text-sap-muted block">Logistics Cost</span>
                <span className="text-base font-bold text-white">₹12.80 Lakhs</span>
                <span className="text-xs text-emerald-400 block mt-0.5">63% savings vs Air Charter</span>
              </div>
              <div className="bg-sap-dark/60 p-3 rounded-lg border border-sap-border">
                <span className="text-xs text-sap-muted block">Worker Well-Being Score</span>
                <span className="text-base font-bold text-emerald-400">94.5 / 100</span>
                <span className="text-xs text-slate-400 block mt-0.5">Zero overtime exceedance</span>
              </div>
            </div>
          </div>

          {/* Action Decision Box */}
          <div className="bg-sap-dark/90 p-5 rounded-xl border border-sap-border flex flex-col justify-between space-y-4 min-w-[280px]">
            <div>
              <span className="text-xs text-sap-muted uppercase tracking-wider block">Governance Status</span>
              <div className="mt-1 flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className="text-sm font-bold text-white">
                  {isApproved ? 'Approved & Dispatched' : 'Pending Human Approval (HITL)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Approver: Dr. Ananya Mehta (Regional Director)
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-sap-border">
              <button
                onClick={onOpenApproval}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center space-x-2 ${
                  isApproved
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-sap-accent to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproved ? 'Recovery Plan Approved' : 'Approve Recovery Plan'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigateTab('agents')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-sap-border transition-colors text-center"
                >
                  View Analysis
                </button>
                <button
                  onClick={() => onNavigateTab('scenarios')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-sap-border transition-colors text-center"
                >
                  Compare (3)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Agent Sequential Pipeline Quick View */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Agent Blackboard Execution
            </h3>
            <p className="text-xs text-sap-muted">
              5 Specialized Agents completed root-cause analysis, workforce governance, and multi-criteria optimization
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('agents')}
            className="text-xs text-sap-accent hover:underline flex items-center space-x-1"
          >
            <span>Open Timeline View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { name: 'Disruption Agent', status: 'COMPLETED', conf: '98%', time: '14:12 UTC', tag: 'IoT Mudslide' },
            { name: 'Supply Chain Impact Agent', status: 'COMPLETED', conf: '96%', time: '14:16 UTC', tag: '3 POs / ₹4.85Cr' },
            { name: 'Workforce Agent', status: 'COMPLETED', conf: '94%', time: '14:20 UTC', tag: '3 Accommodations' },
            { name: 'Recovery Adaptation Agent', status: 'COMPLETED', conf: '95%', time: '14:24 UTC', tag: '3 Scenarios' },
            { name: 'Decision Agent', status: 'COMPLETED', conf: '97%', time: '14:28 UTC', tag: 'Scenario B Rank #1' },
          ].map((agent, index) => (
            <div
              key={agent.name}
              onClick={() => onSelectAgent(agent.name)}
              className="bg-sap-dark/70 hover:bg-slate-800/80 p-3.5 rounded-lg border border-sap-border hover:border-sap-accent cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-sap-muted">0{index + 1}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {agent.conf}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2 group-hover:text-sap-accent transition-colors">
                {agent.name}
              </h4>
              <p className="text-[11px] text-sap-gold mt-1 font-medium">{agent.tag}</p>
              <div className="mt-2 pt-2 border-t border-sap-border/40 flex items-center justify-between text-[10px] text-sap-muted">
                <span>{agent.time}</span>
                <span className="text-emerald-400 font-medium">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
