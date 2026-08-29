/**
 * SAP Sentinel — Core Domain Model & TypeScript Contracts
 * 
 * Target: SAP HackFest 2026 (North Region — Chandigarh University)
 * Dual-Track Innovation: Resilient Supply Chains × Inclusive Workforce
 */

// ============================================================================
// 1. Core Enumerations & Primitives
// ============================================================================

export type DisruptionCategory =
  | 'LANDSLIDE'
  | 'FLASH_FLOOD'
  | 'EXTREME_WEATHER'
  | 'ROAD_COLLAPSE'
  | 'PORT_STRIKE'
  | 'SUPPLIER_INSOLVENCY'
  | 'QUALITY_DEFECT';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus =
  | 'DETECTED'
  | 'ANALYZING'
  | 'RECOVERY_OPTIONS_GENERATED'
  | 'DECISION_PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'RESOLVED';

export type AgentName =
  | 'Disruption Agent'
  | 'Supply Chain Impact Agent'
  | 'Workforce Agent'
  | 'Recovery Adaptation Agent'
  | 'Decision Agent';

export type AgentExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CRITIQUED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED_AND_APPROVED';

export type GoodsCriticality = 'LIFE_SAVING' | 'EMERGENCY_FOOD' | 'ESSENTIAL' | 'STANDARD';

export type TransportModality = 'ROAD_HIGHWAY' | 'AIR_CHARTER' | 'RAIL_FREIGHT' | 'DRONE_AIRLIFT' | 'FEEDER_ROAD';

export type AccommodationCategory =
  | 'PHYSICAL_ERGONOMICS'
  | 'NEURODIVERGENT_FOCUS'
  | 'FATIGUE_PREVENTION'
  | 'MULTILINGUAL_INSTRUCTION'
  | 'HEARING_ASSIST'
  | 'SPECIALIZED_EQUIPMENT';

// ============================================================================
// 2. Supporting Domain Types (SAP & Geo Entities)
// ============================================================================

export interface GeoLocation {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
}

export interface EvidenceItem {
  evidenceId: string;
  sourceType:
    | 'MOCK_SAP_S4HANA'
    | 'MOCK_SAP_SUCCESSFACTORS'
    | 'DECISION_SCORING_ENGINE'
    | 'SIMULATED_TELEMETRY'
    | 'ROAD_TELEMETRY'
    | 'METEOROLOGICAL_FEED'
    | 'SAP_S4HANA'
    | 'SAP_SUCCESSFACTORS'
    | 'IOT_SENSOR';
  sourceReference: string; // e.g. "MOCK-PO-890214", "MOCK-SF-EMP-4019", "SENSOR-NH27-KM48"
  description: string;
  observedAt: string; // ISO 8601 string
  payloadSnippet: Record<string, unknown>;
}

export interface ImpactedMaterial {
  materialId: string;           // SAP S/4HANA Material Number (e.g. "MAT-MED-INSU-100")
  description: string;
  category: 'MEDICINE' | 'FOOD_SUPPLY' | 'INDUSTRIAL' | 'EQUIPMENT';
  criticality: GoodsCriticality;
  temperatureControlled: boolean;
  requiredTempCelsius?: { min: number; max: number };
  shortageQuantity: number;
  unitOfMeasure: string;
  affectedDestinationPlant: string; // SAP Plant ID (e.g. "PLANT-IN12-SILCHAR")
}

export interface ImpactedPurchaseOrder {
  poNumber: string;             // SAP S/4HANA PO Number
  vendorId: string;             // SAP Vendor ID
  vendorName: string;
  originPlant: string;
  destinationPlant: string;
  originalEta: string;          // ISO 8601
  projectedDelayHours: number;
  cargoValueInr: number;
  isColdChain: boolean;
  materialIds: string[];
}

export interface WorkerConstraintProfile {
  workerId: string;             // SAP SuccessFactors Employee ID
  name: string;
  role: string;
  assignedPlantId: string;
  skillCertifications: string[]; // e.g. ["COLD_CHAIN_LOGISTICS", "HAZMAT_HANDLING", "FORKLIFT_PRECISION"]
  accommodations: {
    category: AccommodationCategory;
    description: string;
    strictLimit: string;
  }[];
  preferredLanguage: string;
  currentOvertimeHoursWeek: number;
  maxSafeOvertimeHoursWeek: number;
  fatigueRiskScore: number;     // 0.0 (fresh) to 1.0 (exhausted)
  availabilityStatus: 'AVAILABLE' | 'REST_MANDATORY' | 'ASSIGNED' | 'RESTRICTED_DUTY';
}

export interface TradeOffProfile {
  estimatedRecoveryHours: number;
  incrementalCostInr: number;
  slaAdherencePercentage: number;   // 0 - 100
  workerWellBeingScore: number;     // 0 - 100 (Higher is better/more inclusive)
  carbonEmissionsKg: number;
  coldChainIntegrityRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================================
// 3. Primary Domain Model Interfaces
// ============================================================================

/**
 * Disruption: Structured output produced by the Disruption Agent.
 * Answers: "What happened, where, and why?"
 */
export interface Disruption {
  disruptionId: string;
  category: DisruptionCategory;
  severity: SeverityLevel;
  headline: string;
  description: string;
  location: GeoLocation;
  affectedCorridor: string;         // e.g. "NH-27 Guwahati - Silchar Arterial Route"
  reportedAt: string;
  estimatedBlockedDurationHours: number;
  isCriticalLifelineRoute: boolean;
  weatherDetails: {
    rainfallMmLast24Hours: number;
    forecastCondition: string;
    warningLevel: 'RED' | 'ORANGE' | 'YELLOW';
  };
}

/**
 * SupplyChainImpact: Structured output produced by the Supply Chain Impact Agent.
 * Answers: "What supply-chain assets, orders, and inventories are affected?"
 */
export interface SupplyChainImpact {
  impactId: string;
  disruptionId: string;
  impactedPOs: ImpactedPurchaseOrder[];
  impactedMaterials: ImpactedMaterial[];
  estimatedTotalValueAtRiskInr: number;
  stockoutImminentPlants: string[];
  daysOfBufferInventoryRemaining: Record<string, number>; // PlantId -> Days
  temperatureIntegrityThreat: {
    affectedColdChainShipments: string[];
    batteryBackupHoursRemaining: number;
  };
  supplyBottlenecks: string[];
}

// ============================================================================
// Phase 7: Inclusive Operational Workforce Planning Types
// ============================================================================

export interface RequiredWorkerDemand {
  roleId: string;
  roleTitle: string;
  headcountNeeded: number;
  assignedPlantId: string;
  requiredCertifications: string[];
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface QualifiedWorkerAssignment {
  workerId: string;
  workerName: string;
  matchedRole: string;
  plantId: string;
  matchingCertifications: string[];
  safeOvertimeHoursRemaining: number;
  appliedAccommodations: string[];
}

export interface SkillGapAnalysis {
  roleTitle: string;
  missingCertification: string;
  shortageCount: number;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  mitigationAdvice: string;
}

export interface RedeploymentOption {
  workerId: string;
  workerName: string;
  fromPlantId: string;
  toPlantId: string;
  targetRole: string;
  feasibility: 'IMMEDIATE' | 'ACCOMMODATION_REQUIRED' | 'CONSTRAINED';
  appliedAccommodations: string[];
  rationale: string;
}

export interface TrainingRequirement {
  moduleId: string;
  title: string;
  targetRole: string;
  durationHours: number;
  urgency: 'MANDATORY_BEFORE_DISPATCH' | 'ON_THE_JOB';
  targetHeadcount: number;
  description: string;
}

export interface WorkloadRiskItem {
  riskType:
    | 'FATIGUE_CAP_BREACH'
    | 'OVERTIME_CONCENTRATION'
    | 'ERGONOMIC_STRAIN'
    | 'NEURODIVERGENT_SENSORY_OVERLOAD'
    | 'MULTILINGUAL_BARRIER';
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  affectedCount: number;
  description: string;
  mitigationStrategy: string;
}

/**
 * WorkforceImpact: Structured output produced by the Workforce Agent.
 * Answers: "What workforce constraints, fatigue limits, and inclusion accommodations exist?"
 */
export interface WorkforceImpact {
  workforceImpactId: string;
  disruptionId: string;
  availableStaffCount: number;
  constrainedStaffCount: number;
  workerProfiles: WorkerConstraintProfile[];
  fatigueAlerts: {
    workerId: string;
    reason: string;
    mandatoryRestHours: number;
  }[];
  accommodationRequirements: {
    workerId: string;
    category: AccommodationCategory;
    instructionTranslationNeeded: boolean;
    ergonomicRestriction: string;
  }[];
  surgeLaborCapacityHoursAvailable: number;
  workforceWellBeingIndex: number; // 0.0 to 100.0 baseline

  // Phase 7: Operational Inclusive Workforce Analytics
  requiredWorkers: RequiredWorkerDemand[];
  availableQualifiedWorkers: QualifiedWorkerAssignment[];
  skillGaps: SkillGapAnalysis[];
  possibleRedeployments: RedeploymentOption[];
  trainingRequirements: TrainingRequirement[];
  workloadRisks: WorkloadRiskItem[];
  workforceFeasibilityScore: number; // 0.0 to 100.0
}

/**
 * RecoveryOption: Discrete tactical building block created by Recovery Adaptation Agent.
 */
export interface RecoveryOption {
  optionId: string;
  name: string;
  modality: TransportModality;
  description: string;
  targetPurchaseOrders: string[];
  alternativeRoutePath: string[];
  requiredWorkforceRoles: string[];
  assignedWorkers: {
    workerId: string;
    allocatedShiftHours: number;
    appliedAccommodations: string[];
  }[];
  leadTimeHours: number;
  estimatedCostInr: number;
  feasibilityScore: number; // 0.0 - 1.0
}

/**
 * RecoveryScenario: Complete holistic multi-tier mitigation plan combining tactical options.
 */
export interface RecoveryScenario {
  scenarioId: string;
  scenarioName: string;
  tier: 'SCENARIO_A_FASTEST_AIRLIFT' | 'SCENARIO_B_BALANCED_INCLUSIVE_MULTIMODAL' | 'SCENARIO_C_LOW_COST_ROAD_FEEDER';
  summary: string;
  recoveryOptions: RecoveryOption[];
  tradeOffs: TradeOffProfile;
  workforceSafetyAssessment: {
    maxShiftHours: number;
    fatigueExceedanceDetected: boolean;
    allAccommodationsRespected: boolean;
    burnoutRiskCategory: 'LOW' | 'MODERATE' | 'HIGH';
  };
  logisticsFeasibility: {
    corridorClearanceConfirmed: boolean;
    coldChainSafeguardProtocol: string;
  };
}

// ============================================================================
// 5. Multi-Criteria Decision Scoring Types (Phase 5)
// ============================================================================

/**
 * Scoring weights used to compute composite scenario scores.
 * All weights must sum to 1.0.
 * Configurable — changing weights changes the recommended scenario.
 */
export interface ScoringWeights {
  recoveryEffectiveness: number;  // SLA adherence + critical shipment protection
  recoveryTime: number;           // Speed of restoration (lower hours = better)
  cost: number;                   // Incremental logistics cost (lower = better)
  risk: number;                   // Cold chain risk + corridor clearance confidence
  criticalShipmentProtection: number; // Cold-chain / life-saving cargo coverage
  workforceFeasibility: number;   // Worker well-being + accommodation compliance
  operationalImpact: number;      // ESG carbon emissions (lower = better)
}

/** Default weights for standard disruption scenarios (life-safety priority) */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  recoveryEffectiveness: 0.22,
  recoveryTime: 0.18,
  cost: 0.12,
  risk: 0.14,
  criticalShipmentProtection: 0.20,
  workforceFeasibility: 0.09,
  operationalImpact: 0.05,
};

/** Score breakdown for a single criterion for a single scenario */
export interface ScoreCriterion {
  criterion: keyof ScoringWeights;
  label: string;
  rawValue: string;         // Human-readable value (e.g. "14 hours", "₹12.8L")
  normalizedScore: number;  // 0.0 – 100.0 (higher is always better)
  weight: number;           // Applied weight (0.0 – 1.0)
  weightedScore: number;    // normalizedScore × weight
  rationale: string;        // One-sentence business explanation
}

/** Complete transparent score for a single scenario */
export interface ScenarioEvaluation {
  scenarioId: string;
  scenarioName: string;
  compositeScore: number;       // Sum of all weightedScore values × 100
  rank: number;
  criteria: ScoreCriterion[];
  tradeOffSummary: string;      // Executive-level one-paragraph summary
  risks: string[];              // Explicit risk statements
  expectedImpact: string;       // Expected outcome if this scenario is executed
  approvalRequired: boolean;    // Whether HITL approval gate is mandatory
}

/**
 * Decision: Output produced by the Decision Agent.
 * Answers: "Which recovery scenario is best, and why?"
 *
 * The winner is determined algorithmically by the scoring engine.
 * No scenario is hardcoded as the recommendation.
 */
export interface Decision {
  decisionId: string;
  caseId: string;
  recommendedScenarioId: string;
  recommendedScenarioName: string;

  // Transparent scoring — one evaluation per candidate scenario
  scenarioEvaluations: ScenarioEvaluation[];

  // Applied scoring weights (auditable — changing these changes the winner)
  appliedWeights: ScoringWeights;

  // Structured justification (no raw chain-of-thought)
  justification: {
    primaryReason: string;
    clinicalAndFoodUrgencyEvaluation: string;
    workforceInclusionAndSafetyEvaluation: string;
    costVsLifeSavingTradeOffRationale: string;
  };

  // Legacy comparative matrix (kept for backward compatibility with UI)
  comparativeMatrix: {
    scenarioId: string;
    rank: number;
    compositeScore: number;
    costInr: number;
    recoveryTimeHours: number;
    workerWellBeingScore: number;
    esgCarbonKg: number;
  }[];

  actionPlanSteps: {
    stepNumber: number;
    title: string;
    actionOwner: string;
    targetSapSystem: 'SAP_S4HANA' | 'SAP_SUCCESSFACTORS' | 'SAP_LOGISTICS_BUSINESS_NETWORK';
    payloadAction: string;
  }[];
}

/**
 * Approval: Business user governance response for Human-in-the-Loop execution.
 */
export interface Approval {
  approvalId: string;
  caseId: string;
  decisionId: string;
  selectedScenarioId: string;
  status: ApprovalStatus;
  approverUser: {
    userId: string;
    name: string;
    role: string;
    department: string;
  };
  approvedAt?: string;
  reviewNotes: string;
  appliedOverrides?: {
    customWorkerReassignments?: Record<string, string>; // workerId -> new role
    budgetApprovalGranted: boolean;
  };
}

/**
 * AgentExecution: Immutable execution record representing a single agent's step on the blackboard.
 */
export interface AgentExecution {
  executionId: string;
  agentName: AgentName;
  executionStatus: AgentExecutionStatus;
  timestamp: string; // ISO 8601 UTC
  inputReference: {
    caseId: string;
    referencedExecutionIds: string[];
    referencedSapEntityIds: string[];
  };
  structuredOutput:
    | { type: 'Disruption'; payload: Disruption }
    | { type: 'SupplyChainImpact'; payload: SupplyChainImpact }
    | { type: 'WorkforceImpact'; payload: WorkforceImpact }
    | { type: 'RecoveryScenarios'; payload: RecoveryScenario[] }
    | { type: 'Decision'; payload: Decision };
  confidence: number; // 0.0 to 1.0
  assumptions: string[];
  evidence: EvidenceItem[];
  humanReadableSummary: string;
}

/**
 * AgentHistory: Append-only audit ledger containing all execution steps for a case.
 */
export interface AgentHistory {
  caseId: string;
  totalExecutions: number;
  historyLedger: AgentExecution[];
  lastUpdated: string;
}

/**
 * Case: Top-level aggregate root managing the full lifecycle of a disruption recovery incident.
 */
export interface Case {
  caseId: string;
  caseNumber: string;               // e.g. "CASE-NER-2026-0829"
  title: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  disruption?: Disruption;
  supplyChainImpact?: SupplyChainImpact;
  workforceImpact?: WorkforceImpact;
  candidateScenarios?: RecoveryScenario[];
  decision?: Decision;
  approval?: Approval;
  agentHistory: AgentHistory;
}
