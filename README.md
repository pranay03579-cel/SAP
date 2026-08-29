# SAP Sentinel — AI-Powered Supply-Chain Disruption Recovery & Inclusive Workforce Control Tower

**SAP HackFest 2026 (North Region — Chandigarh University)**  
*Dual-Track Innovation: Resilient Supply Chains (Track 1) × Inclusive Workforce (Track 2)*

---

## 📌 Current Status

> **CURRENT STATUS: WORKING PROTOTYPE WITH DETERMINISTIC MOCK PROVIDERS**  
> The application currently runs locally in **Mock Mode** using deterministic mock data providers. It is built with an enterprise provider/adapter architecture (`src/providers/`) so that official SAP integrations (SAP S/4HANA, SAP SuccessFactors, SAP Logistics Business Network, and SAP Event Mesh) can be plugged in when official credentials and endpoints are configured, without modifying the agent reasoning engine or frontend.
>
> All demonstration metrics, transport slots, and personnel records represent a simulated logistics disruption scenario in North Eastern India (NH-27 Guwahati–Silchar corridor).

---

## 🏛️ Implemented Now vs. Future SAP Integration

| Dimension | Implemented Now (Working in Repository) | Future SAP Integration (Seams Defined) |
| :--- | :--- | :--- |
| **Runtime & UI** | React 19, TypeScript, Vite, TailwindCSS Control Tower UI | SAP BTP Portal / Fiori Launchpad embedding |
| **Agent Pipeline** | 5-Agent Sequential Execution via `PipelineOrchestrator` | SAP AI Core / Generative AI Hub integration |
| **State Ledger** | Append-Only In-Memory Blackboard with JSON Audit Trail | SAP HANA Cloud persistence / Audit Log Service |
| **Disruption Ingestion** | `IDisruptionDataProvider` via `MockDisruptionProvider` | SAP Event Mesh / IoT Telemetry Services |
| **Supply Chain Data** | `ISupplyChainDataProvider` via `MockSupplyChainProvider` | SAP S/4HANA Cloud OData APIs (Procurement & Inventory) |
| **Workforce Roster** | `IWorkforceDataProvider` via `MockWorkforceProvider` | SAP SuccessFactors Employee Central & Time Management |
| **Transport Capacity**| `ITransportCapacityProvider` via `MockTransportProvider` | SAP Logistics Business Network (LBN) / SAP TM APIs |
| **Decision & Scoring**| Deterministic 7-Criterion Weighted Utility Optimization | Configurable Enterprise Policy Rules Engine |
| **Human Governance** | HITL Approval Modal with simulated SAP dispatch actions | Live OData POST transactions to S/4HANA & SuccessFactors |

---

## 🤖 The Five-Agent Pipeline

The recovery engine executes five specialized autonomous agents sequentially across an immutable append-only state ledger:

```
Disruption Ingested
       │
       ▼
1. [Disruption Agent] ───────────── Ingests road telemetry, meteorological alert, corridor blockage (NH-27 KM-142)
       │
       ▼
2. [Supply Chain Impact Agent] ──── Analyzes stranded POs (₹4.85 Cr), hospital stockout window (28h), cold-chain battery (18h)
       │
       ▼
3. [Workforce Agent] ────────────── Evaluates qualified staff (42/50), ergonomic lifting limits, ND quiet zones, JIT training
       │
       ▼
4. [Recovery Adaptation Agent] ──── Generates 3 multimodal scenarios: Air Charter, Multimodal Split, Feeder Road Detour
       │
       ▼
5. [Decision Agent] ─────────────── Multi-criteria weighted scoring engine (7 criteria); recommends Scenario B (Score 95.8/100)
       │
       ▼
6. [Human-in-the-Loop Governance] ── Regional Director reviews trade-offs, verifies accommodations, and authorizes dispatch
```

Each agent:
- Receives strictly required context from prior steps.
- Validates output schemas via runtime domain guards (`src/services/validation.ts`).
- Appends an immutable `AgentExecution` record to the Case audit ledger.
- Updates only its own domain section of the Case without overwriting others.
- Produces zero private chain-of-thought, outputting structured findings, evidence, assumptions, and trade-offs.

---

## 🔌 Provider Abstraction Layer

The application cleanly separates agent business logic from external data access through typed interfaces in `src/providers/interfaces.ts`:

```
React Control Tower UI
         │
         ▼
PipelineOrchestrator (src/services/orchestrator.ts)
         │
         ├──→ DisruptionAgent ──────────→ IDisruptionDataProvider
         │                                    └── MockDisruptionProvider (Active)
         │
         ├──→ SupplyChainImpactAgent ──→ ISupplyChainDataProvider
         │                                    └── MockSupplyChainProvider (Active)
         │
         ├──→ WorkforceAgent ──────────→ IWorkforceDataProvider
         │                                    └── MockWorkforceProvider (Active)
         │
         └──→ RecoveryAdaptationAgent ─→ ITransportCapacityProvider
                                              └── MockTransportProvider (Active)
```

Swapping from mock providers to live SAP providers requires implementing the provider interfaces in `src/providers/` and updating the `ProviderRegistry` (`src/providers/registry.ts`). No agent or UI code changes are needed.

---

## 📁 Repository Structure

```
SAP/
├── src/
│   ├── components/            # Control Tower UI components (Executive Dashboard, Timeline, etc.)
│   │   ├── ExecutiveDashboard.tsx   # 30-Second briefing, KPI summary, and risk cards
│   │   ├── AgentTimeline.tsx        # 5-Agent interactive timeline & Decision Trace flowchart
│   │   ├── AgentDetailPanel.tsx     # Structured agent findings, evidence & assumptions inspector
│   │   ├── RecoveryComparison.tsx   # Scenario comparison & 7-criterion score breakdown
│   │   ├── FinalDecisionPanel.tsx   # AI decision recommendation & action steps
│   │   ├── WorkforceRosterView.tsx  # Inclusive workforce impact, JIT training & accommodations
│   │   ├── HumanApprovalModal.tsx   # Human-in-the-loop executive review modal
│   │   ├── AuditLedgerView.tsx      # Append-only immutable state history ledger
│   │   ├── IntegrationModeBanner.tsx # Prominent MOCK MODE environment banner
│   │   ├── DisruptionDetails.tsx    # Geospatial route & telemetry details
│   │   └── Header.tsx               # Control tower navigation & status
│   ├── config/
│   │   └── appConfig.ts       # Application mode resolution (Single Source of Truth)
│   ├── providers/
│   │   ├── interfaces.ts      # Typed provider interfaces (SAP Integration Seams)
│   │   ├── registry.ts        # Provider dependency injection registry
│   │   └── mock/              # Deterministic mock data providers (NH-27 scenario)
│   ├── services/
│   │   ├── agents/            # 5 specialized agent implementations & scoring engine
│   │   ├── orchestrator.ts    # Sequential multi-agent pipeline orchestrator
│   │   └── validation.ts      # Runtime schema guards & domain invariant validators
│   └── tests/                 # Automated test suite (23 unit & integration tests)
├── shared/
│   ├── types/domain.ts        # Core domain models, enums & TypeScript contracts
│   └── mock/disruptionCase.ts # High-fidelity benchmark disruption dataset
├── package.json               # Scripts & dependencies
├── tsconfig.json              # TypeScript compiler configuration (Strict Mode)
├── vite.config.ts             # Vite build configuration
├── ARCHITECTURE.md            # System architecture & adapter contracts
├── PROJECT_PLAN.md            # Phased implementation roadmap & verification gates
└── AGENTS.md                  # Development guidelines & multi-agent invariants
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd SAP

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
# Type check and build production bundle
npm run build
```

---

## 🧪 Automated Test Suite

The project includes comprehensive automated tests covering the entire multi-agent pipeline, deterministic scoring engine, transparent audit trail, and inclusive workforce planning:

```bash
# Run all automated tests
npm test
```

### Test Suites Included:
1. **Decision Agent & Scoring Engine (`src/tests/decision.test.ts`)** — 9 tests:
   - Dynamic winner selection based on composite score (not hardcoded).
   - Weight variation effects (Cost-driven, Speed-driven, Workforce-driven, Critical shipment priority).
   - Deterministic reproducibility and mathematical invariant verification.
2. **Multi-Agent Pipeline & Orchestration (`src/tests/pipeline.test.ts`)** — 5 tests:
   - Sequential 5-agent execution.
   - Non-destructive failure isolation.
   - Idempotent pipeline retry from point of failure.
   - Runtime schema validation and corruption protection.
3. **Transparent Agent Trail & Decision Trace (`src/tests/transparentTrail.test.ts`)** — 4 tests:
   - Audit trail completeness (findings, evidence, assumptions, confidence).
   - Zero private chain-of-thought exposure verification.
   - End-to-end lineage connectivity.
4. **Inclusive Operational Workforce (`src/tests/workforce.test.ts`)** — 5 tests:
   - Demand headcount vs available staff shortage detection.
   - Skill certification mismatch detection.
   - Rest period and fatigue threshold enforcement.
   - Just-in-time micro-training generation.
   - Accommodation preservation (ergonomic, neurodivergent, multilingual).

---

## 👥 Hackathon Team & Acknowledgements

Developed for **SAP HackFest 2026 (North Region — Chandigarh University)**.
- **Track 1**: Resilient Supply Chains
- **Track 2**: Inclusive Workforce
