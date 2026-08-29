# SAP Sentinel — Technical System Architecture

**Document Version**: 1.1.0 (Phase 4A — SAP-Compatible Mock Integration Layer)
**Target Platform**: SAP HackFest 2026 (North Region — Chandigarh University)
**System Classification**: AI-Powered Autonomous Disruption Recovery & Inclusive Workforce Control Tower

---

## 🏗️ High-Level System Architecture

The SAP Sentinel architecture is designed around four core layers:
1. **Presentation & Human-in-the-Loop (HITL) Layer** (Enterprise Control Tower UI)
2. **Multi-Agent Orchestration & Blackboard Engine** (Autonomous Sensing, Reasoning, and Optimization)
3. **Domain Schemas & State Ledger** (Immutable Event Store & Strict Pydantic Data Contracts)
4. **SAP Adapter Abstraction Layer** (S/4HANA, SuccessFactors, Ariba, Event Mesh)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE CONTROL TOWER UI (React + TypeScript)                │
│  ┌──────────────────────┬──────────────────────┬──────────────────────────────┐  │
│  │ Disruption Radar &   │ Scenario Diff &      │ Inclusive Workforce Roster   │  │
│  │ Network Topology Map │ Decision Studio      │ & Ergonomics Heatmap         │  │
│  └──────────────────────┴──────────────────────┴──────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  Transparent Audit Ledger & Evidence Viewer (Zero Private CoT Exposure)    │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST / WebSocket API
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│               MULTI-AGENT ORCHESTRATION & STATE MACHINE (FastAPI / Python)        │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │           IMMUTABLE RECOVERY RUN CONTEXT (Append-Only Blackboard)         │   │
│   └──────┬─────────────────┬─────────────────┬───────────────────┬───────────┘   │
│          │                 │                 │                   │               │
│          ▼                 ▼                 ▼                   ▼               │
│   ┌─────────────┐   ┌─────────────┐   ┌──────────────┐   ┌───────────────┐       │
│   │ Disruption  │   │ SupplyChain │   │  Inclusive   │   │  Mitigation   │       │
│   │ Triage      │──►│ Impact &    │──►│  Workforce   │──►│  Synthesizer  │       │
│   │ Agent       │   │ Sourcing    │   │  Agent       │   │  & Optimizer  │       │
│   └─────────────┘   └─────────────┘   └──────────────┘   └───────┬───────┘       │
│                                                                  │               │
│                                                                  ▼               │
│                                                          ┌───────────────┐       │
│                                                          │ HITL Approval │       │
│                                                          │ & SAP Commit  │       │
│                                                          └───────┬───────┘       │
└──────────────────────────────────────────────────────────────────┼───────────────┘
                                                                   │
┌──────────────────────────────────────────────────────────────────▼───────────────┐
│                    SAP INTEGRATION & ADAPTER ABSTRACTION LAYER                   │
│                                                                                  │
│   ┌─────────────────────────┐  ┌──────────────────────────┐  ┌────────────────┐  │
│   │   SAP S/4HANA Adapter   │  │ SAP SuccessFactors Adapter│  │ SAP Event Mesh │  │
│   │  (Inventory, PO, SO,    │  │ (Worker Profiles, Skills, │  │ (IoT / Sensor │  │
│   │   BOM, Production Orders│  │  Accommodations, Shifts)  │  │  Disruptions) │  │
│   └────────────┬────────────┘  └────────────┬─────────────┘  └───────┬────────┘  │
│                │                            │                        │           │
│                ▼                            ▼                        ▼           │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │  Pluggable Implementation: Mock Adapter Suite ◄──► Live SAP BTP (Future)  │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent Orchestration & Data Flow

### The Blackboard Pattern
To guarantee auditability, deterministic verification, and eliminate hallucinated race conditions, agents operate under a **Strict Blackboard Architecture**:
1. Agents **read** from the shared immutable blackboard run context.
2. Agents **append** structured findings, calculations, and recommendations.
3. **No agent can overwrite or delete** data written by a preceding agent.
4. If an agent disagrees with a prior finding, it writes a structured `Critique` or `AlternativeOption` block.

```
Disruption Signal Ingested
       │
       ▼
[Disruption Triage Agent]
   ├─ Evaluates Signal Severity & Geo-Radius
   └─ Appends: DisruptionAssessment (Affected Nodes, Material IDs, Severity)
       │
       ▼
[Supply Chain Impact Agent]
   ├─ Queries SAP S/4HANA Adapter (BOM, Buffer Stocks, Alternate Vendors)
   ├─ Projects Stockout Timelines & Financial Exposure
   └─ Appends: SupplyChainImpactAnalysis (Shortfall Quantities, Rerouting Candidates)
       │
       ▼
[Inclusive Workforce Agent]
   ├─ Queries SAP SuccessFactors Adapter (Worker Skills, Accommodations, Shift Logs)
   ├─ Evaluates surge workload feasibility & worker ergonomics
   ├─ Enforces inclusion rules (Max overtime, physical accessibility, neurodiverse matching)
   └─ Appends: WorkforceAllocationPlan (Balanced Shift Schedules, Accommodation Badges)
       │
       ▼
[Mitigation Synthesis & Optimization Agent]
   ├─ Calculates Multi-Objective Trade-offs:
   │    Utility = w1*(Cost Min) + w2*(SLA Speed) + w3*(Worker Well-Being) + w4*(Carbon)
   ├─ Synthesizes Option A (Fastest), Option B (Balanced Resilient), Option C (Cost Minimal)
   └─ Appends: CandidateMitigationOptions + Recommended Action
       │
       ▼
[Human Decision Maker (HITL)]
   ├─ Reviews Evidence, Assumptions, Cost Diffs & Worker Impact Scores
   └─ Selects / Modifies Plan -> Submits "Execute"
       │
       ▼
[SAP Dispatcher Adapter]
   └─ Commits PO updates, shift changes, and rerouting to SAP S/4HANA & SuccessFactors
```

---

## 📦 Strongly Typed Agent Contracts

Every agent payload is modeled using **Pydantic v2** on the backend and mapped 1:1 to **TypeScript interfaces** on the frontend.

### 1. Disruption Assessment Schema
```python
class DisruptionAssessment(BaseModel):
    disruption_id: str
    timestamp: datetime
    category: Literal["GEOPOLITICAL", "WEATHER", "LOGISTICS_BOTTLENECK", "SUPPLIER_INSOLVENCY", "QUALITY_DEFECT"]
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    affected_locations: list[GeoLocation]
    affected_materials: list[str]
    estimated_duration_days: int
    evidence_signals: list[EvidenceItem]
    confidence_score: float = Field(ge=0.0, le=1.0)
```

### 2. Supply Chain Impact Schema
```python
class SupplyChainImpactAnalysis(BaseModel):
    analysis_id: str
    disruption_id: str
    impacted_purchase_orders: list[str]
    impacted_plants: list[str]
    projected_stockout_date: datetime
    revenue_at_risk_usd: float
    alternate_supplier_options: list[SupplierOption]
    inventory_buffer_status: dict[str, float]
    findings_summary: str
    assumptions: list[str]
```

### 3. Inclusive Workforce Allocation Schema
```python
class InclusiveWorkforcePlan(BaseModel):
    plan_id: str
    disruption_id: str
    required_surge_roles: list[SurgeRoleDemand]
    shift_assignments: list[ShiftAssignment]
    ergonomic_compliance_rate: float = Field(ge=0.0, le=1.0)
    overtime_equity_score: float = Field(ge=0.0, le=1.0)
    accommodations_matched: list[AccommodationDetail]
    neurodiverse_accommodations_count: int
    worker_burnout_risk_index: Literal["LOW", "MODERATE", "ELEVATED"]
    findings_summary: str
```

### 4. Comprehensive Mitigation Plan Schema
```python
class MitigationOption(BaseModel):
    option_id: str
    name: str
    description: str
    trade_off_profile: TradeOffProfile  # Cost, Lead Time, Worker Well-Being, ESG
    supply_chain_actions: list[SupplyChainAction]
    workforce_actions: list[WorkforceAction]
    estimated_recovery_days: int
    total_cost_usd: float
    worker_wellbeing_index: float       # 0.0 - 100.0
    carbon_impact_co2e_tons: float
    confidence_score: float
    structured_explanation: str
```

---

## 🔌 SAP Adapter Architecture

To maintain absolute credibility and avoid fabricating non-existent SAP APIs while keeping the prototype 100% functional, the system implements an **Enterprise Adapter Design Pattern**.

### Adapter Interface Definition
```python
class SAPSupplyChainAdapter(ABC):
    @abstractmethod
    async def get_material_inventory(self, material_id: str) -> MaterialInventory:
        """Fetch real-time stock across plants from S/4HANA."""
        pass

    @abstractmethod
    async def get_purchase_orders_by_supplier(self, supplier_id: str) -> list[PurchaseOrder]:
        """Fetch active purchase orders from S/4HANA."""
        pass

    @abstractmethod
    async def get_alternative_suppliers(self, material_id: str) -> list[Supplier]:
        """Fetch qualified alternative vendors from SAP Ariba catalog."""
        pass

    @abstractmethod
    async def update_purchase_order_route(self, po_id: str, new_route: RouteUpdate) -> bool:
        """Commit rerouting or expedited dispatch in S/4HANA."""
        pass


class SAPSuccessFactorsAdapter(ABC):
    @abstractmethod
    async def get_plant_workforce(self, plant_id: str) -> list[WorkerProfile]:
        """Fetch workforce roster with skill matrices & accommodation profiles."""
        pass

    @abstractmethod
    async def submit_shift_roster_update(self, plant_id: str, shift_updates: list[ShiftAssignment]) -> bool:
        """Commit emergency shift adjustments into SAP SuccessFactors."""
        pass
```

### Execution Modes:
- **Mock Mode (Default for Hackathon Prototype)**: Operates against high-fidelity deterministic fixtures representing real S/4HANA and SuccessFactors enterprise datasets. Zero external credentials needed.
- **SAP BTP Destination Mode (Ready for Production)**: Binds to SAP BTP Destination Service using standard OData v4 REST clients.

---

## 🛡️ Enterprise Privacy, Audit & Reasoning Guardrails

1. **Strict No-Private-CoT Leakage**:
   - Internal reasoning tokens or raw unstructured chain-of-thought traces are never streamed to client interfaces.
   - Outputs are strictly formatted as explicit `findings`, `evidence`, `assumptions`, and `trade_offs`.
2. **Immutable Audit Ledger**:
   - Every recovery run produces an append-only JSON event log with timestamps, agent IDs, input snapshots, and output hashes.
3. **Worker Privacy & PII Protection**:
   - Worker medical or private disability details are abstracted behind standardized `AccommodationCategory` tokens (e.g., `MOBILITY_ELEVATION`, `ACOUSTIC_SENSITIVITY`, `MAX_LIFTING_15KG`) without exposing private medical notes.

---

## 🔌 Phase 4A — SAP-Compatible Provider Integration Layer

> **Status**: IMPLEMENTED — Mock providers active. SAP live providers pending official credentials.

### Design Goal
Enable a clean, zero-friction swap from mock data to real SAP system data — without modifying any agent logic, orchestrator, validation, or UI code. Only the **Provider Registry** changes.

### Integration Architecture

```
React UI (App.tsx)
        │
        ▼
PipelineOrchestrator (src/services/orchestrator.ts)
        │
        │ injects via ProviderRegistry
        │
        ├──→ DisruptionAgent ──────────→ IDisruptionDataProvider
        │                                    │
        │                              MockDisruptionProvider  ◄── TODAY
        │                              SapEventMeshProvider   ◄── FUTURE (SAP Event Mesh)
        │
        ├──→ SupplyChainImpactAgent ──→ ISupplyChainDataProvider
        │                                    │
        │                              MockSupplyChainProvider ◄── TODAY
        │                              SapS4HanaProvider       ◄── FUTURE (S/4HANA OData v4)
        │
        ├──→ WorkforceAgent ──────────→ IWorkforceDataProvider
        │                                    │
        │                              MockWorkforceProvider   ◄── TODAY
        │                              SapSuccessFactorsProvider◄── FUTURE (SuccessFactors OData)
        │
        └──→ RecoveryAdaptationAgent ─→ ITransportCapacityProvider
                                             │
                                       MockTransportProvider   ◄── TODAY
                                       SapLbnTmProvider        ◄── FUTURE (SAP LBN / TM API)
```

### File Locations

| File | Purpose |
|------|---------|
| [`src/config/appConfig.ts`](src/config/appConfig.ts) | Single source of truth for `APP_MODE`. Controls which providers are loaded. |
| [`src/providers/interfaces.ts`](src/providers/interfaces.ts) | Clean TypeScript interfaces for all 4 provider contracts. **This is the SAP integration seam.** |
| [`src/providers/registry.ts`](src/providers/registry.ts) | Resolves and instantiates providers by mode. **This is the only file that changes to add SAP live mode.** |
| [`src/providers/mock/`](src/providers/mock/) | Four mock provider implementations for the NE India scenario. Clearly labelled `[MOCK]`. |

### How to Add a Real SAP Provider (Future)

When official SAP credentials and API documentation become available:

1. **Create the SAP provider file**:
   ```
   src/providers/sap/sapS4HanaSupplyChainProvider.ts
   src/providers/sap/sapSuccessFactorsWorkforceProvider.ts
   src/providers/sap/sapEventMeshDisruptionProvider.ts
   src/providers/sap/sapLbnTransportProvider.ts
   ```
   Each implements its corresponding interface from `src/providers/interfaces.ts`.

2. **Add `sap-live` to `AppMode`** in `src/config/appConfig.ts`.

3. **Add credentials validation** — throw a `ConfigurationError` if any required variable is missing. Never silently fall back to mock mode.

4. **Register the live providers** in `src/providers/registry.ts`:
   ```typescript
   case 'sap-live':
     validateSapCredentials();
     return {
       disruption: new SapEventMeshDisruptionProvider(config),
       supplyChain: new SapS4HanaSupplyChainProvider(config),
       workforce: new SapSuccessFactorsWorkforceProvider(config),
       transport: new SapLbnTransportProvider(config),
     };
   ```

5. **Set `APP_MODE=sap-live`** in your environment (Vite: `VITE_APP_MODE=sap-live`).

**Zero agent, orchestrator, validation, or UI changes required.**

### Current Mode (Phase 4A)

```
APP_MODE = mock
SAP INTEGRATION = NOT CONFIGURED
```

The UI displays this status in the `IntegrationModeBanner` (amber bar at the top of every page), making it impossible to confuse mock data with live SAP data.

### Planned Future Integrations (Phase 4B+)

| Provider Interface | Future SAP Service | Protocol |
|---|---|---|
| `IDisruptionDataProvider` | SAP Integration Suite / Event Mesh | AMQP / Webhook |
| `ISupplyChainDataProvider` | SAP S/4HANA Cloud — Procurement & Inventory APIs | OData v4 REST |
| `IWorkforceDataProvider` | SAP SuccessFactors Employee Central + Time Management | OData v4 REST |
| `ITransportCapacityProvider` | SAP Logistics Business Network (LBN) or SAP TM | OData v4 / REST |

Authentication for all SAP BTP services: **OAuth 2.0 Client Credentials Grant** via SAP BTP Destination Service.

