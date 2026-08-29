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
- All enterprise interactions must be routed through the abstract provider interface layer defined in `src/providers/interfaces.ts`.
- Always provide a realistic, deterministic mock provider (`MockDisruptionProvider`, `MockSupplyChainProvider`, `MockWorkforceProvider`, `MockTransportCapacityProvider`) so the entire application runs locally with zero configuration and zero external API dependencies.

### 3. Strongly Typed, Structured Agent Contracts
- All data passed between agents, stored in state, or rendered in the UI must use explicit **TypeScript domain models** (`shared/types/domain.ts`).
- Never pass raw unstructured dictionary blobs or arbitrary strings when a typed schema exists.
- Every agent payload must include:
  - `agentName`: Identifier of the agent creating the record.
  - `timestamp`: UTC ISO timestamp.
  - `structuredOutput`: Validated domain payload.
  - `confidence`: Numeric float between `0.0` and `1.0`.
  - `assumptions`: Explicit assumptions made during computation.
  - `evidence`: Specific data points, telemetry readings, or mock entity IDs supporting findings.
  - `humanReadableSummary`: Concise business summary.

### 4. Append-Only Immutable State Ledger
- **Never allow one agent to overwrite another agent's output.**
- The shared execution state (`Case.agentHistory.historyLedger`) is an append-only blackboard.
- If an agent refines or challenges an earlier recommendation, it must append a new record referencing the prior execution ID.
- The complete history of every recovery run must remain fully inspectable in the audit trail.

### 5. Strict Separation of Reasoning vs. User-Facing Explanations
- **Never expose raw chain-of-thought (CoT), internal agent prompts, or unformatted reasoning traces to the frontend UI.**
- Only present structured, professional, executive-ready artifacts:
  - **Findings**: What was detected or calculated.
  - **Evidence**: Which telemetry / data points substantiate this finding.
  - **Assumptions**: What preconditions were assumed.
  - **Trade-Offs**: How Cost, Lead Time, Worker Well-Being, and ESG metrics compare.
  - **Recommendations**: Clear, actionable next steps for the human operator.

### 6. Dual-Track Governance (Supply Chain + Inclusive Workforce)
- Every disruption mitigation strategy **MUST** evaluate both dimensions:
  1. **Supply Chain Resiliency**: Inventory buffers, alternate modalities, lead times, logistics routes, cost impact.
  2. **Inclusive Workforce**: Worker fatigue, fair overtime distribution, physical ergonomic limits, neurodiverse work environment accommodations, and multilingual task translation.
- Any mitigation plan that proposes unfeasible, unsafe, or non-inclusive labor assignments must be flagged and penalized in the multi-criteria utility function.

---

## 💻 Code Standards & Engineering Best Practices

### Architecture & Technology Stack
- **Runtime**: Node.js 18+, React 19, TypeScript (Strict Mode).
- **Build Tool**: Vite.
- **Design System**: Enterprise dark control tower aesthetic, high-contrast indicators, Lucide icons, accessible color palettes.
- **Project Structure**:
  ```
  SAP/
  ├── src/
  │   ├── components/      # Modular UI components (Dashboard, Timeline, etc.)
  │   ├── config/          # Mode resolution (Single Source of Truth)
  │   ├── providers/       # Data provider interfaces & mock implementations
  │   ├── services/
  │   │   ├── agents/      # 5 specialized recovery agents & scoring engine
  │   │   ├── orchestrator.ts # Sequential pipeline orchestrator
  │   │   └── validation.ts   # Runtime schema integrity guards
  │   └── tests/           # Node test runner automated test suite
  └── shared/
      ├── types/domain.ts  # Core TypeScript domain models & contracts
      └── mock/            # Benchmark case data fixtures
  ```

### Component Hygiene
- Keep components modular and single-responsibility.
- Type all props and state variables explicitly.
- No `any` types in production components.
- Provide fallback UI states (loading skeletons, empty states, error boundaries).

---

## 🧪 Verification & Testing Protocol

Before marking any task or phase complete:
1. **Lint & Type Check**:
   - Run `npm run type-check` (`tsc --noEmit`) with zero errors.
2. **Deterministic Test Execution**:
   - Run test suite via `npm test`.
   - Verify that synthetic disruption events run through the full multi-agent blackboard pipeline and output valid domain models.
3. **Production Build**:
   - Run `npm run build` with zero errors.
4. **End-to-End Walkthrough**:
   - Verify UI renders mock data correctly, updates upon user actions, and displays the immutable audit log properly.
