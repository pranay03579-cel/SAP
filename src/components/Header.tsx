import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  GitPullRequest, 
  Users, 
  History, 
  CheckCircle2, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface HeaderProps {
  currentCase: Case;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApproval: () => void;
  onOpenWorkforce: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCase,
  activeTab,
  setActiveTab,
  onOpenApproval,
  onOpenWorkforce,
}) => {
  const isApproved = currentCase.status === 'APPROVED';

  return (
    <header className="border-b border-sap-border bg-sap-card/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner: Status & Context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Case Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sap-accent to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                SAP SENTINEL
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-sap-accent border border-blue-500/20">
                  CONTROL TOWER
                </span>
              </span>
              <span className="text-xs text-sap-muted font-mono">v1.0.0</span>
            </div>
            <p className="text-xs text-sap-muted">
              Supply-Chain Disruption Recovery & Inclusive Workforce Resilience
            </p>
          </div>
        </div>

        {/* Middle: Live Corridor Telemetry */}
        <div className="hidden lg:flex items-center space-x-6 bg-sap-dark/80 px-4 py-2 rounded-lg border border-sap-border/60">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              {currentCase.disruption?.severity || 'CRITICAL'} DISRUPTION
            </span>
          </div>
          <div className="h-4 w-px bg-sap-border"></div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-sap-accent" />
            <span>NH-27 Dima Hasao, Assam (Barak Valley Corridor)</span>
          </div>
          <div className="h-4 w-px bg-sap-border"></div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sap-gold" />
            <span className="font-mono">84h Road Blockade</span>
          </div>
        </div>

        {/* Right: Quick Action & Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenWorkforce}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-sap-card hover:bg-slate-800 border border-sap-border hover:border-sap-accent text-slate-200 rounded-lg transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-sap-cyan" />
            <span>Inclusive Workforce (50)</span>
          </button>

          <button
            onClick={onOpenApproval}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all ${
              isApproved
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-sap-accent hover:bg-blue-600 text-white shadow-blue-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproved ? 'Approved & Locked' : 'Review & Approve (HITL)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-sap-border/60">
        <nav className="flex space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-sap-accent text-sap-accent bg-blue-500/5'
                : 'border-transparent text-sap-muted hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Executive Cockpit</span>
          </button>

          <button
            onClick={() => setActiveTab('disruption')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'disruption'
                ? 'border-sap-accent text-sap-accent bg-blue-500/5'
                : 'border-transparent text-sap-muted hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Disruption & Asset Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'agents'
                ? 'border-sap-accent text-sap-accent bg-blue-500/5'
                : 'border-transparent text-sap-muted hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Multi-Agent Workflow (5)</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'scenarios'
                ? 'border-sap-accent text-sap-accent bg-blue-500/5'
                : 'border-transparent text-sap-muted hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Scenario Comparison (3)</span>
          </button>

          <button
            onClick={() => setActiveTab('workforce')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'workforce'
                ? 'border-sap-accent text-sap-accent bg-blue-500/5'
                : 'border-transparent text-sap-muted hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Inclusive Workforce (Track 2)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-sap-accent text-sap-accent bg-blue-500/5'
                : 'border-transparent text-sap-muted hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Immutable Audit Ledger</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
