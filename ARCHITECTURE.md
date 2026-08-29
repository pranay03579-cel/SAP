# SAP Sentinel — Technical System Architecture

**Document Version**: 2.0.0 (Phase 10 — Reality Alignment)  
**Target Platform**: SAP HackFest 2026 (North Region — Chandigarh University)  
**System Classification**: AI-Powered Autonomous Disruption Recovery & Inclusive Workforce Control Tower

---

## 📌 Architecture Reality & Current Implementation Status

> **CURRENT STATUS**: The repository is an operational **TypeScript / React** application running locally using **deterministic Mock Providers**.
>
> All external enterprise touchpoints are encapsulated behind clean TypeScript provider interfaces (`src/providers/interfaces.ts`). Real SAP integrations (S/4HANA, SuccessFactors, Logistics Business Network, Event Mesh) are **FUTURE / NOT CURRENTLY CONNECTED** adapter implementations that will plug into this exact interface seam once official credentials and endpoints are configured.

---

## 🏗️ Actual System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE CONTROL TOWER UI (React + TypeScript)                │
│  ┌──────────────────────┬──────────────────────┬──────────────────────────────┐  │
│  │ Executive Dashboard  │ Scenario Comparison  │ Inclusive Workforce View     │  │
│  │ & 30-Sec Briefing    │ & 7-Score Breakdown  │ (Impact, JIT Training, Roster)│ │
│  └──────────────────────┴──────────────────────┴──────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  Transparent 5-Agent Audit Ledger & Decision Trace Flowchart               │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ In-Memory React State & Callback Dispatch
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│               PIPELINE ORCHESTRATOR (`src/services/orchestrator.ts`)             │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │           IMMUTABLE RECOVERY RUN CONTEXT (Append-Only Blackboard)         │   │
│   │                 `Case.agentHistory.historyLedger: AgentExecution[]`      │   │
│   └──────┬─────────────────┬─────────────────┬───────────────────┬───────────┘   │
│          │                 │                 │                   │               │
│          ▼                 ▼                 ▼                   ▼               │
│   ┌─────────────┐   ┌─────────────┐   ┌──────────────┐   ┌───────────────┐       │
│   │ Disruption  │──►│ SupplyChain │──►│  Workforce   │──►│  Recovery     │       │
│   │ Agent       │   │ Impact Agent│   │  Agent       │   │  Adaptation   │       │
│   └──────┬──────┘   └──────┬──────┘   └──────┬───────┘   │  Agent        │       │
│          │                 │                 │           └───────┬───────┘       │
│          │                 │                 │                   │               │
│          │                 │                 │                   ▼               │
│          │                 │                 │           ┌───────────────┐       │
│          │                 │                 │           │ Decision      │       │
│          │                 │                 │           │ Agent         │       │
│          │                 │                 │           └───────┬───────┘       │
│          │                 │                 │                   │               │
│          │                 │                 │                   ▼               │
│          │                 │                 │           ┌───────────────┐       │
│          │                 │                 │           │ Human-in-Loop │       │
│          │                 │                 │           │ Approval Gate │       │
│          │                 │                 │           └───────┬───────┘       │
└──────────┼─────────────────┼─────────────────┼───────────────────┼───────────────┘
           │                 │                 │                   │
┌──────────▼─────────────────▼─────────────────▼───────────────────▼───────────────┐
│                    PROVIDER / ADAPTER INTERFACE LAYER                            │
│                     (`src/providers/interfaces.ts`)                              │
│                                                                                  │
│   ┌───────────────────────┐  ┌────────────────────────┐  ┌────────────────────┐  │
│   │IDisruptionDataProvider│  │ISupplyChainDataProvider│  │IWorkforceData-     │  │
│   │                       │  │                        │  │Provider            │  │
│   └───────────┬───────────┘  └───────────┬────────────┘  └─────────┬──────────┘  │
│               │                          │                         │             │
│               ▼                          ▼                         ▼             │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │ITransportCapacityProvider (`src/providers/interfaces.ts`)                  │  │
│   └───────────────────────────────────┬───────────────────────────────────────┘  │
└───────────────────────────────────────┼──────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             PROVIDER IMPLEMENTATIONS                             │
│                                                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │ CURRENT (ACTIVE IN REPOSITORY): Deterministic Mock Providers              │  │
│   │ • MockDisruptionProvider     (`src/providers/mock/mockDisruptionProvider`)│  │
│   │ • MockSupplyChainProvider    (`src/providers/mock/mockSupplyChainProvider`)│  │
│   │ • MockWorkforceProvider      (`src/providers/mock/mockWorkforceProvider`)  │  │
│   │ • MockTransportCapacityProvider (`src/providers/mock/mockTransportProvider`)││
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │ FUTURE (NOT CURRENTLY CONNECTED): Official SAP Providers                  │  │
│   │ • SapEventMeshDisruptionProvider      [Future SAP Event Mesh]             │  │
│   │ • SapS4HanaSupplyChainProvider        [Future SAP S/4HANA OData v4]       │  │
│   │ • SapSuccessFactorsWorkforceProvider  [Future SAP SuccessFactors OData]   │  │
│   │ • SapLbnTransportCapacityProvider     [Future SAP LBN / SAP TM OData]     │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 The Five-Agent Pipeline Flow & Contract Rules

### 1. Sequential Execution Flow
The `PipelineOrchestrator` executes the five specialized agents in strict sequence:
1. **Disruption Agent**: Queries `IDisruptionDataProvider` to sense physical road telemetry, weather severity, and corridor impassability duration.
2. **Supply Chain Impact Agent**: Queries `ISupplyChainDataProvider` to identify stranded purchase orders, at-risk inventory, and hospital stockout windows.
3. **Workforce Agent**: Queries `IWorkforceDataProvider` to evaluate worker availability, skills, certifications, fatigue caps, and inclusive accommodations.
4. **Recovery Adaptation Agent**: Queries `ITransportCapacityProvider` to generate candidate multimodal recovery options (Air, Rail, Road bypass).
5. **Decision Agent & Scoring Engine**: Evaluates all candidate scenarios across 7 weighted criteria to recommend the highest-scoring Pareto-optimal recovery plan.

### 2. Append-Only Blackboard Invariant
- Every agent appends an `AgentExecution` record containing:
  - `agentName`: Identifier of the executing agent.
  - `timestamp`: UTC ISO timestamp.
  - `structuredOutput`: Typed domain payload.
  - `confidence`: Confidence score (0.0 to 1.0).
  - `evidence`: List of `EvidenceItem` records substantiating the analysis.
  - `assumptions`: Explicit assumptions made during computation.
  - `humanReadableSummary`: Concise business explanation.
- No agent is permitted to overwrite or delete data produced by prior agents.

### 3. Runtime Schema Validation
Before any agent output is committed to the Case state, it is validated by domain integrity guards in `src/services/validation.ts`. If an agent produces a corrupted or out-of-spec payload, execution halts with a `ValidationError` without corrupting prior state.

---

## 🔌 Provider Abstraction Architecture

The provider layer isolates agent reasoning from data retrieval.

### Typed Provider Interfaces (`src/providers/interfaces.ts`):

```typescript
// 1. Disruption telemetry interface
export interface IDisruptionDataProvider {
  getActiveDisruptionSignal(corridorId: string): Promise<RawDisruptionSignal>;
}

// 2. Supply chain procurement & inventory interface
export interface ISupplyChainDataProvider {
  getAffectedPurchaseOrders(corridorId: string): Promise<ImpactedPurchaseOrder[]>;
  getAffectedMaterials(destinationPlantIds: string[]): Promise<ImpactedMaterial[]>;
  getInventoryStatus(plantIds: string[]): Promise<RawInventoryStatus[]>;
}

// 3. Workforce roster & accommodation interface
export interface IWorkforceDataProvider {
  getAvailableWorkers(plantIds: string[]): Promise<WorkerConstraintProfile[]>;
  getWorkerOvertimeSummary(workerIds: string[]): Promise<Record<string, number>>;
}

// 4. Alternative transport capacity interface
export interface ITransportCapacityProvider {
  getAvailableTransportOptions(
    originPlantId: string,
    destinationPlantIds: string[]
  ): Promise<RawTransportCapacity[]>;
}
```

### Future SAP Integration Boundary

The provider interfaces above represent the exact **integration seam** for official SAP services. When official SAP credentials and environment access become available:
- Real SAP adapters will implement these exact interfaces.
- The `ProviderRegistry` (`src/providers/registry.ts`) will instantiate the SAP providers when configured.
- Zero agent, orchestrator, scoring, or UI code will need to change.

---

## 🛡️ Transparent Decision & Governance Principles

1. **Zero Private Chain-of-Thought**:
   - Internal reasoning traces are never exposed in user-facing views.
   - All agent cards display structured findings, concrete evidence, explicit assumptions, and trade-off metrics.
2. **Transparent 7-Criterion Scoring Engine (`src/services/agents/scoringEngine.ts`)**:
   - Evaluates scenarios deterministically across 7 normalized criteria: Recovery Effectiveness, Recovery Time, Cost, Risk, Critical Shipment Protection, Workforce Feasibility, and Operational Impact (ESG).
   - Scoring weights are auditable and configurable.
3. **Human-in-the-Loop (HITL) Gate**:
   - Autonomous agents propose and score plans; human regional directors review trade-offs and confirm dispatch authorization.
