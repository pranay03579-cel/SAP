# AGENTS.md — Development Guidelines & Multi-Agent Rules

This document governs the coding standards, architectural invariants, and behavioral constraints for all developers and AI coding agents working on the **SAP Sentinel** project.

---

## 🏛️ Invariable System Principles

### 1. Incremental, Phased Execution
- **Never build ahead of the active phase.** Follow the roadmap specified in [PROJECT_PLAN.md](file:///c:/Users/prana/OneDrive/Desktop/SAP/PROJECT_PLAN.md).
- Complete each phase's acceptance gate and obtain user feedback before initiating the next phase.
- Do not create placeholder files or empty stubs for future phases unless required by the active task.

### 2. Zero-Hallucination SAP Integration Rules
- **Do NOT invent fake SAP SDKs, proprietary libraries, or non-existent endpoints.**
- All enterprise interactions (S/4HANA, SuccessFactors, Ariba, Event Mesh) must be routed through the abstract adapter layer defined in `backend/app/adapters/`.
- Always provide a realistic, deterministic mock adapter (`MockS4HANAAdapter`, `MockSuccessFactorsAdapter`) so the entire application runs locally with zero configuration and zero external API dependencies.

### 3. Strongly Typed, Structured Agent Contracts
- All data passed between agents, stored in state, or sent to the UI must use explicit **Pydantic v2 models** on the backend and matching **TypeScript interfaces** on the frontend.
- Never pass raw unstructured dictionary blobs or arbitrary strings when a typed schema exists.
- Every agent payload must include:
  - `agent_name`: Identifier of the agent creating the record.
  - `timestamp`: UTC ISO timestamp.
  - `findings`: Concrete structured observations.
  - `evidence`: Specific data points, sensor feeds, or SAP records supporting findings.
  - `assumptions`: Explicit assumptions made during computation.
  - `confidence_score`: Numeric float between `0.0` and `1.0`.

### 4. Append-Only Immutable State Ledger
- **Never allow one agent to overwrite another agent's output.**
- The shared execution state (`RecoveryRunContext`) is an append-only blackboard.
- If an agent refines or challenges an earlier recommendation, it must append a new `CritiqueRecord` or `RevisedOptionRecord` referencing the prior record ID.
- The complete history of every recovery run must remain fully inspectable in the audit trail.

### 5. Strict Separation of Reasoning vs. User-Facing Explanations
- **Never expose raw chain-of-thought (CoT), internal agent prompts, or unformatted reasoning traces to the frontend UI.**
- Only present structured, professional, executive-ready artifacts:
  - **Findings**: What was detected or calculated.
  - **Evidence**: Which SAP data points substantiate this finding.
  - **Assumptions**: What preconditions were assumed.
  - **Trade-Offs**: How Cost, Lead Time, Worker Well-Being, and ESG metrics compare.
  - **Recommendations**: Clear, actionable next steps for the human operator.

### 6. Dual-Track Governance (Supply Chain + Inclusive Workforce)
- Every disruption mitigation strategy **MUST** evaluate both dimensions:
  1. **Supply Chain Resiliency**: Inventory buffers, alternate suppliers, lead times, logistics routes, cost impact.
  2. **Inclusive Workforce**: Worker fatigue, fair overtime distribution, physical ergonomic limits, neurodiverse work environment accommodations, and multilingual task translation.
- Any mitigation plan that proposes unfeasible, unsafe, or non-inclusive labor assignments must be flagged with an elevated `worker_burnout_risk_index` and penalized in the multi-criteria utility function.

---

## 💻 Code Standards & Engineering Best Practices

### Backend (Python / FastAPI)
- **Runtime**: Python 3.11+
- **Framework**: FastAPI with asynchronous route handlers (`async def`).
- **Validation**: Pydantic v2 with strict type annotations.
- **Project Structure**:
  ```
  backend/
  ├── app/
  │   ├── adapters/     # SAP S/4HANA, SuccessFactors & Event Mesh interfaces + mocks
  │   ├── agents/       # Specialized autonomous recovery agents
  │   ├── core/         # Config, state blackboard, orchestrator
  │   ├── models/       # Pydantic schemas (events, supply chain, workforce, mitigation)
  │   ├── data/         # Realistic JSON fixtures for mock adapters
  │   └── api/          # FastAPI routes
  └── tests/            # Pytest test suite
  ```
- **Error Handling**: Standardized HTTP status codes with structured JSON error responses:
  ```json
  {
    "detail": "Descriptive enterprise error message",
    "error_code": "ERR_SUPPLY_CHAIN_ADAPTER_UNAVAILABLE",
    "timestamp": "2026-08-29T14:30:00Z"
  }
  ```

### Frontend (React / TypeScript)
- **Runtime**: Node.js 18+, Vite, React 18, TypeScript (Strict Mode).
- **Design System**: Enterprise dark/light control tower aesthetic, high-contrast indicators, Lucide icons, accessible color palettes.
- **State Management**: React Context or lightweight Zustand store reflecting the backend recovery run state.
- **Component Hygiene**:
  - Keep components modular and single-responsibility.
  - Type all props and state variables explicitly.
  - No `any` types in production components.
  - Provide fallback UI states (loading skeletons, empty states, error boundaries).

---

## 🧪 Verification & Testing Protocol

Before marking any task or phase complete:
1. **Lint & Type Check**:
   - Backend: Ensure clean type hints.
   - Frontend: `npm run build` or `tsc --noEmit` with zero errors.
2. **Deterministic Test Execution**:
   - Run backend test suite via `pytest`.
   - Verify that synthetic disruption events run through the full multi-agent blackboard pipeline and output valid Pydantic models.
3. **End-to-End Walkthrough**:
   - Verify UI renders mock data correctly, updates upon user actions, and displays the immutable audit log properly.
