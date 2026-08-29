/**
 * Realistic Mock Data for North East India Disruption Case
 * Scenario: Landslide & Flash-Flood on NH-27 (Guwahati-Silchar Corridor)
 * Impacting Critical Cold-Chain Oncology/Insulin Medicines and Emergency Food Grain
 */

import { Case, DEFAULT_SCORING_WEIGHTS } from '../types/domain.js';

export const MOCK_DISRUPTION_CASE: Case = {
  caseId: 'CASE-NER-2026-0829',
  caseNumber: 'CASE-NER-2026-0829',
  title: 'NH-27 Landslide Blockade: Critical Medical & PDS Supply Disruption (Barak Valley Corridor)',
  status: 'DECISION_PENDING',
  createdAt: '2026-08-29T14:15:00Z',
  updatedAt: '2026-08-29T14:28:45Z',

  // 1. Disruption Details (from Disruption Agent)
  disruption: {
    disruptionId: 'DISRUPT-NER-NH27-001',
    category: 'LANDSLIDE',
    severity: 'CRITICAL',
    headline: 'Major Landslide & Highway Collapse at Dima Hasao section of NH-27',
    description:
      'Continuous torrential rainfall triggered a 180-meter mudslide and roadbed collapse near Jatinga/Haflong on NH-27. Highway is completely impassable for heavy commercial vehicles. Restoration estimated at 72-96 hours by BRO/NHAI.',
    location: {
      name: 'NH-27 Milepost KM-142 (Jatinga Ridge, Dima Hasao)',
      region: 'North Eastern Region, Assam, India',
      latitude: 25.1235,
      longitude: 92.9854,
      altitudeMeters: 620,
    },
    affectedCorridor: 'NH-27 Guwahati to Silchar / Agartala Arterial Lifeline',
    reportedAt: '2026-08-29T14:10:00Z',
    estimatedBlockedDurationHours: 84,
    isCriticalLifelineRoute: true,
    weatherDetails: {
      rainfallMmLast24Hours: 245.8,
      forecastCondition: 'Severe Monsoon Inundation with Continued Red Alert',
      warningLevel: 'RED',
    },
  },

  // 2. Supply Chain Impact Details (from Supply Chain Impact Agent)
  supplyChainImpact: {
    impactId: 'SCI-NER-0829-01',
    disruptionId: 'DISRUPT-NER-NH27-001',
    estimatedTotalValueAtRiskInr: 48500000, // ₹4.85 Crore
    stockoutImminentPlants: ['PLANT-IN12-SILCHAR', 'PLANT-IN14-AGARTALA'],
    daysOfBufferInventoryRemaining: {
      'PLANT-IN12-SILCHAR': 1.2, // 28 hours until total clinical stockout
      'PLANT-IN14-AGARTALA': 2.4,
    },
    temperatureIntegrityThreat: {
      affectedColdChainShipments: ['PO-890214-COLD'],
      batteryBackupHoursRemaining: 18, // Active GPS temperature logger shows 18h thermal reserve
    },
    supplyBottlenecks: [
      'Silchar Civil Hospital ICU & Dialysis Center runs out of insulin in 28 hours',
      'Assam State Oncology Wing at Cachar Cancer Hospital awaiting urgent chemotherapeutic packs',
      'PDS Buffer stock in Cachar District under 48-hour emergency ration reserves',
    ],
    impactedPOs: [
      {
        poNumber: 'PO-890214-COLD',
        vendorId: 'VEND-SAP-BHARAT-BIO',
        vendorName: 'Bharat Biocare Laboratories (Guwahati Central Depot)',
        originPlant: 'PLANT-IN10-GUWAHATI',
        destinationPlant: 'PLANT-IN12-SILCHAR',
        originalEta: '2026-08-30T04:00:00Z',
        projectedDelayHours: 82,
        cargoValueInr: 18500000,
        isColdChain: true,
        materialIds: ['MAT-MED-INSULIN-01', 'MAT-MED-ONCO-04'],
      },
      {
        poNumber: 'PO-890215-MED',
        vendorId: 'VEND-SAP-HIMALAYA-MED',
        vendorName: 'Himalaya Health Logistics Hub',
        originPlant: 'PLANT-IN10-GUWAHATI',
        destinationPlant: 'PLANT-IN14-AGARTALA',
        originalEta: '2026-08-30T10:00:00Z',
        projectedDelayHours: 78,
        cargoValueInr: 12000000,
        isColdChain: false,
        materialIds: ['MAT-MED-ANTIBIOTIC-02', 'MAT-MED-SURG-KIT-12'],
      },
      {
        poNumber: 'PO-773410-PDS',
        vendorId: 'VEND-SAP-FCI-NER',
        vendorName: 'Food Corporation of India (Guwahati Railhead)',
        originPlant: 'PLANT-IN10-GUWAHATI',
        destinationPlant: 'PLANT-IN12-SILCHAR',
        originalEta: '2026-08-30T18:00:00Z',
        projectedDelayHours: 84,
        cargoValueInr: 18000000,
        isColdChain: false,
        materialIds: ['MAT-FOOD-PDS-RICE-50K', 'MAT-FOOD-EMERGENCY-NUTRITION'],
      },
    ],
    impactedMaterials: [
      {
        materialId: 'MAT-MED-INSULIN-01',
        description: 'Recombinant Human Insulin R (100 IU/mL) 10mL Vials',
        category: 'MEDICINE',
        criticality: 'LIFE_SAVING',
        temperatureControlled: true,
        requiredTempCelsius: { min: 2, max: 8 },
        shortageQuantity: 6500,
        unitOfMeasure: 'VIALS',
        affectedDestinationPlant: 'PLANT-IN12-SILCHAR',
      },
      {
        materialId: 'MAT-MED-ONCO-04',
        description: 'Chemotherapy Infusion Packs (Cisplatin / Paclitaxel Concentrates)',
        category: 'MEDICINE',
        criticality: 'LIFE_SAVING',
        temperatureControlled: true,
        requiredTempCelsius: { min: 2, max: 8 },
        shortageQuantity: 820,
        unitOfMeasure: 'PACKS',
        affectedDestinationPlant: 'PLANT-IN12-SILCHAR',
      },
      {
        materialId: 'MAT-FOOD-EMERGENCY-NUTRITION',
        description: 'Fortified High-Calorie Ready-to-Use Supplementary Food (RUSF)',
        category: 'FOOD_SUPPLY',
        criticality: 'EMERGENCY_FOOD',
        temperatureControlled: false,
        shortageQuantity: 24000,
        unitOfMeasure: 'SACHETS',
        affectedDestinationPlant: 'PLANT-IN12-SILCHAR',
      },
    ],
  },

  // 3. Workforce Impact Details (from Workforce Agent)
  workforceImpact: {
    workforceImpactId: 'WFI-NER-0829-01',
    disruptionId: 'DISRUPT-NER-NH27-001',
    availableStaffCount: 42,
    constrainedStaffCount: 8,
    surgeLaborCapacityHoursAvailable: 310,
    workforceWellBeingIndex: 88.5,
    fatigueAlerts: [
      {
        workerId: 'SF-EMP-1082',
        reason: 'Driver Rajat Das exceeded 11 driving hours due to highway gridlock at Lumding junction',
        mandatoryRestHours: 12,
      },
      {
        workerId: 'SF-EMP-2041',
        reason: 'Shift lead Anjali Roy logged 18 hours continuous flood-relief logistics triage',
        mandatoryRestHours: 10,
      },
    ],
    accommodationRequirements: [
      {
        workerId: 'SF-EMP-3044',
        category: 'PHYSICAL_ERGONOMICS',
        instructionTranslationNeeded: false,
        ergonomicRestriction: 'Recovering lumbo-sacral strain; max single lift 12kg; forklift or assisted lift mandatory',
      },
      {
        workerId: 'SF-EMP-4019',
        category: 'NEURODIVERGENT_FOCUS',
        instructionTranslationNeeded: false,
        ergonomicRestriction: 'High-precision cold-chain packaging specialist; requires low-auditory-noise station',
      },
      {
        workerId: 'SF-EMP-5102',
        category: 'MULTILINGUAL_INSTRUCTION',
        instructionTranslationNeeded: true,
        ergonomicRestriction: 'Bengali/Sylheti primary language; automated digital translation required on rugged handhelds',
      },
    ],
    workerProfiles: [
      {
        workerId: 'SF-EMP-4019',
        name: 'Debashis Sen',
        role: 'Cold-Chain Packaging & Inspection Specialist',
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        skillCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA', 'TEMPERATURE_LOGGER_AUDIT'],
        accommodations: [
          {
            category: 'NEURODIVERGENT_FOCUS',
            description: 'Hyper-focused quality technician; excels in detail-dense QA; high noise sensitivity',
            strictLimit: 'Quiet packing zone; visual step-by-step checklist display',
          },
        ],
        preferredLanguage: 'English / Bengali',
        currentOvertimeHoursWeek: 2.5,
        maxSafeOvertimeHoursWeek: 8.0,
        fatigueRiskScore: 0.15,
        availabilityStatus: 'AVAILABLE',
      },
      {
        workerId: 'SF-EMP-3044',
        name: 'Pranab Jyoti Sarma',
        role: 'Senior Air-Cargo Dispatch & Staging Operator',
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        skillCertifications: ['AIR_CARGO_STAGING', 'HAZMAT_DG_CERTIFIED', 'FORKLIFT_PRECISION'],
        accommodations: [
          {
            category: 'PHYSICAL_ERGONOMICS',
            description: 'Lumbo-sacral ergonomic limit',
            strictLimit: 'Mechanical lifter mandatory for boxes > 12kg',
          },
        ],
        preferredLanguage: 'Assamese / Hindi',
        currentOvertimeHoursWeek: 4.0,
        maxSafeOvertimeHoursWeek: 10.0,
        fatigueRiskScore: 0.28,
        availabilityStatus: 'AVAILABLE',
      },
      {
        workerId: 'SF-EMP-5102',
        name: 'Bimalendu Deb',
        role: 'Warehouse Transfer & Receiving Specialist',
        assignedPlantId: 'PLANT-IN12-SILCHAR',
        skillCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
        accommodations: [
          {
            category: 'MULTILINGUAL_INSTRUCTION',
            description: 'Prefers Bengali digital voice & text manifests',
            strictLimit: 'Automated translation on SAP warehouse scanner',
          },
        ],
        preferredLanguage: 'Bengali',
        currentOvertimeHoursWeek: 1.0,
        maxSafeOvertimeHoursWeek: 8.0,
        fatigueRiskScore: 0.18,
        availabilityStatus: 'AVAILABLE',
      },
    ],

    // Phase 7 Analytics
    requiredWorkers: [
      {
        roleId: 'ROLE-COLD-QA',
        roleTitle: 'Cold-Chain Pharma Packaging & Inspection Specialist',
        headcountNeeded: 1,
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        requiredCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
        urgency: 'CRITICAL',
      },
      {
        roleId: 'ROLE-AIR-STAGING',
        roleTitle: 'Air-Cargo Staging & Precision Pallet Operator',
        headcountNeeded: 1,
        assignedPlantId: 'PLANT-IN10-GUWAHATI',
        requiredCertifications: ['AIR_CARGO_STAGING', 'FORKLIFT_PRECISION'],
        urgency: 'CRITICAL',
      },
      {
        roleId: 'ROLE-RECEIVING-RECON',
        roleTitle: 'Warehouse Transfer & Receiving Specialist',
        headcountNeeded: 1,
        assignedPlantId: 'PLANT-IN12-SILCHAR',
        requiredCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
        urgency: 'HIGH',
      },
    ],
    availableQualifiedWorkers: [
      {
        workerId: 'SF-EMP-4019',
        workerName: 'Debashis Sen',
        matchedRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
        plantId: 'PLANT-IN10-GUWAHATI',
        matchingCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
        safeOvertimeHoursRemaining: 5.5,
        appliedAccommodations: ['Quiet packing zone', 'Visual step-by-step checklist display'],
      },
      {
        workerId: 'SF-EMP-3044',
        workerName: 'Pranab Jyoti Sarma',
        matchedRole: 'Air-Cargo Staging & Precision Pallet Operator',
        plantId: 'PLANT-IN10-GUWAHATI',
        matchingCertifications: ['AIR_CARGO_STAGING', 'FORKLIFT_PRECISION'],
        safeOvertimeHoursRemaining: 6.0,
        appliedAccommodations: ['Mechanical lifter mandatory for boxes > 12kg'],
      },
      {
        workerId: 'SF-EMP-5102',
        workerName: 'Bimalendu Deb',
        matchedRole: 'Warehouse Transfer & Receiving Specialist',
        plantId: 'PLANT-IN12-SILCHAR',
        matchingCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
        safeOvertimeHoursRemaining: 7.0,
        appliedAccommodations: ['Automated translation on SAP warehouse scanner'],
      },
    ],
    skillGaps: [],
    possibleRedeployments: [
      {
        workerId: 'SF-EMP-4019',
        workerName: 'Debashis Sen',
        fromPlantId: 'PLANT-IN10-GUWAHATI',
        toPlantId: 'PLANT-IN12-SILCHAR',
        targetRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
        feasibility: 'ACCOMMODATION_REQUIRED',
        appliedAccommodations: ['Quiet inspection zone & visual checklist'],
        rationale: 'Remote digital verification and cold-chain logging oversight for Silchar receiving dock.',
      },
    ],
    trainingRequirements: [
      {
        moduleId: 'TRN-COLD-GPS-01',
        title: 'Active GPS Smart-Battery Cold Box Logger & Thermal Dock Protocol',
        targetRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
        durationHours: 1.5,
        urgency: 'MANDATORY_BEFORE_DISPATCH',
        targetHeadcount: 2,
        description: 'Micro-training on initializing digital telemetry loggers, dry-ice battery packs, and hospital receiving handover.',
      },
      {
        moduleId: 'TRN-ERGO-HYD-02',
        title: 'Powered Hydraulic Pallet Lifter Operational Safety',
        targetRole: 'Air-Cargo Staging & Precision Pallet Operator',
        durationHours: 1.0,
        urgency: 'MANDATORY_BEFORE_DISPATCH',
        targetHeadcount: 3,
        description: 'Refresher training ensuring all pallet transfers above 12kg use hydraulic lifters, protecting ergonomic thresholds.',
      },
      {
        moduleId: 'TRN-RAIL-LMD-03',
        title: 'Lumding–Badarpur Hill Section Wagon Staging & Lashing',
        targetRole: 'Warehouse Transfer & Receiving Specialist',
        durationHours: 2.0,
        urgency: 'ON_THE_JOB',
        targetHeadcount: 4,
        description: 'Standard operating procedures for rapid freight wagon offloading at Badarpur / Silchar railhead.',
      },
    ],
    workloadRisks: [
      {
        riskType: 'FATIGUE_CAP_BREACH',
        severity: 'HIGH',
        affectedCount: 2,
        description: '2 drivers/shift leads reached weekly maximum safe driving/shift hours during initial flood relief.',
        mitigationStrategy: 'Mandatory 10-12h resting windows enforced; zero deployment to active recovery routes.',
      },
      {
        riskType: 'ERGONOMIC_STRAIN',
        severity: 'MODERATE',
        affectedCount: 1,
        description: 'Air-cargo pallet loading tempo requires mechanical lifters to protect lumbo-sacral limits.',
        mitigationStrategy: 'Allocated motorized hydraulic lifter and automated roller track.',
      },
      {
        riskType: 'MULTILINGUAL_BARRIER',
        severity: 'LOW',
        affectedCount: 1,
        description: 'Technical dispatch manifests issued in English/Hindi for Bengali-primary warehouse staff.',
        mitigationStrategy: 'Automated Bengali voice and text translation on SAP mobile warehouse scanners enabled.',
      },
    ],
    workforceFeasibilityScore: 94,
  },

  // 4. Candidate Scenarios (from Recovery Adaptation Agent)
  candidateScenarios: [
    {
      scenarioId: 'SCENARIO-A-FAST-AIR',
      scenarioName: 'Scenario A: Emergency Air Charter & Direct Military Helipad Drop',
      tier: 'SCENARIO_A_FASTEST_AIRLIFT',
      summary:
        'Airlift all 3 impacted POs (Medicines + PDS Food) via Antonov/IAF charter from Borjhar Airport (GAU) to Kumbhirgram Airport (IXS Silchar).',
      tradeOffs: {
        estimatedRecoveryHours: 10,
        incrementalCostInr: 3450000, // ₹34.5 Lakhs
        slaAdherencePercentage: 98,
        workerWellBeingScore: 62.0, // High stress, night air-loading surge, near fatigue limits
        carbonEmissionsKg: 14200,
        coldChainIntegrityRisk: 'NONE',
      },
      workforceSafetyAssessment: {
        maxShiftHours: 14,
        fatigueExceedanceDetected: true,
        allAccommodationsRespected: false,
        burnoutRiskCategory: 'HIGH',
      },
      logisticsFeasibility: {
        corridorClearanceConfirmed: true,
        coldChainSafeguardProtocol: 'Continuous active compressor dry-ice units',
      },
      recoveryOptions: [
        {
          optionId: 'OPT-AIR-01',
          name: 'Pharma & Food Air Freight Charter (GAU -> IXS)',
          modality: 'AIR_CHARTER',
          description: 'Chartered turbo-prop flight carrying 12 tonnes combined pharma and nutrition kits',
          targetPurchaseOrders: ['PO-890214-COLD', 'PO-890215-MED', 'PO-773410-PDS'],
          alternativeRoutePath: ['Borjhar Airport (Guwahati)', 'Kumbhirgram Airport (Silchar)'],
          requiredWorkforceRoles: ['AIR_CARGO_STAGING', 'COLD_CHAIN_LOGISTICS'],
          assignedWorkers: [
            {
              workerId: 'SF-EMP-3044',
              allocatedShiftHours: 8,
              appliedAccommodations: ['Hydraulic forklift loading only'],
            },
          ],
          leadTimeHours: 10,
          estimatedCostInr: 3450000,
          feasibilityScore: 0.82,
        },
      ],
    },
    {
      scenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
      scenarioName: 'Scenario B: Precision Multimodal Split (Life-Saving Air Charter + Feeder Rail/Road for Food)',
      tier: 'SCENARIO_B_BALANCED_INCLUSIVE_MULTIMODAL',
      summary:
        'Split recovery: High-priority cold-chain oncology & insulin airlifted via light Beechcraft charter (Guwahati to Silchar in 8h). Heavy PDS food rerouted via Lumding-Badarpur Broad Gauge Rail Link with inclusive day-shift handling.',
      tradeOffs: {
        estimatedRecoveryHours: 14,
        incrementalCostInr: 1280000, // ₹12.8 Lakhs (63% cost saving vs. full air charter)
        slaAdherencePercentage: 96,
        workerWellBeingScore: 94.5, // Well-balanced shifts, all ergonomic & neurodivergent accommodations met
        carbonEmissionsKg: 3850,
        coldChainIntegrityRisk: 'NONE',
      },
      workforceSafetyAssessment: {
        maxShiftHours: 8,
        fatigueExceedanceDetected: false,
        allAccommodationsRespected: true,
        burnoutRiskCategory: 'LOW',
      },
      logisticsFeasibility: {
        corridorClearanceConfirmed: true,
        coldChainSafeguardProtocol: 'Active smart-battery cold-box logger with Silchar Hospital receiving dock ready',
      },
      recoveryOptions: [
        {
          optionId: 'OPT-AIR-MED-01',
          name: 'Precision Cold-Chain Medical Airlift (Guwahati to Silchar)',
          modality: 'AIR_CHARTER',
          description: 'Light dedicated aircraft carrying 2.2 tonnes of temperature-sensitive insulin and chemotherapeutic drugs',
          targetPurchaseOrders: ['PO-890214-COLD', 'PO-890215-MED'],
          alternativeRoutePath: ['Borjhar Airport (GAU)', 'Kumbhirgram Airport (IXS)', 'Silchar Civil Hospital Cold DC'],
          requiredWorkforceRoles: ['COLD_CHAIN_LOGISTICS', 'PRECISION_PHARMA_QA'],
          assignedWorkers: [
            {
              workerId: 'SF-EMP-4019',
              allocatedShiftHours: 6,
              appliedAccommodations: ['Quiet staging cubicle', 'Visual barcode scan verification'],
            },
            {
              workerId: 'SF-EMP-3044',
              allocatedShiftHours: 6,
              appliedAccommodations: ['Mechanical assisted pallet lifter (no manual heavy lift)'],
            },
          ],
          leadTimeHours: 8,
          estimatedCostInr: 850000,
          feasibilityScore: 0.96,
        },
        {
          optionId: 'OPT-RAIL-FOOD-02',
          name: 'Emergency Priority Rail Freight (Lumding - Badarpur - Silchar)',
          modality: 'RAIL_FREIGHT',
          description: 'Dedicated 2-wagon rake on Indian Railways Hill Section for 35 tonnes PDS emergency grain',
          targetPurchaseOrders: ['PO-773410-PDS'],
          alternativeRoutePath: ['Guwahati Goods Yard', 'Lumding Rail Junction', 'Badarpur Railhead', 'Silchar FCI Depot'],
          requiredWorkforceRoles: ['WAREHOUSE_TRANSFER', 'RECEIVING_SPECIALIST'],
          assignedWorkers: [
            {
              workerId: 'SF-EMP-5102',
              allocatedShiftHours: 7,
              appliedAccommodations: ['Automated Bengali manifest translation on scanner'],
            },
          ],
          leadTimeHours: 14,
          estimatedCostInr: 430000,
          feasibilityScore: 0.92,
        },
      ],
    },
    {
      scenarioId: 'SCENARIO-C-ROAD-DETOUR',
      scenarioName: 'Scenario C: Meghalaya Hill Feeder Highway Bypass (Shillong-Jowai-Ratacherra-Silchar)',
      tier: 'SCENARIO_C_LOW_COST_ROAD_FEEDER',
      summary:
        'Convoys rerouted via NH-06 through Meghalaya hills. Low direct cost, but high risk of secondary bottlenecks, 36h transit delay, and severe risk of cold-chain battery depletion.',
      tradeOffs: {
        estimatedRecoveryHours: 36,
        incrementalCostInr: 320000, // ₹3.2 Lakhs
        slaAdherencePercentage: 45, // Violates 28h insulin stockout deadline
        workerWellBeingScore: 54.0, // High driver exhaustion and mountain night-driving hazard
        carbonEmissionsKg: 6200,
        coldChainIntegrityRisk: 'HIGH',
      },
      workforceSafetyAssessment: {
        maxShiftHours: 16,
        fatigueExceedanceDetected: true,
        allAccommodationsRespected: false,
        burnoutRiskCategory: 'HIGH',
      },
      logisticsFeasibility: {
        corridorClearanceConfirmed: false,
        coldChainSafeguardProtocol: 'Requires roadside battery recharge stations which are unavailable along NH-06',
      },
      recoveryOptions: [
        {
          optionId: 'OPT-ROAD-BYPASS-01',
          name: 'NH-06 Heavy Convoy Detour via Shillong/Jowai',
          modality: 'FEEDER_ROAD',
          description: 'Truck convoy diversion over steep single-lane mountain passes',
          targetPurchaseOrders: ['PO-890214-COLD', 'PO-890215-MED', 'PO-773410-PDS'],
          alternativeRoutePath: ['Guwahati', 'Shillong Bypass', 'Jowai', 'Ratacherra', 'Silchar'],
          requiredWorkforceRoles: ['HEAVY_CONVOY_DRIVER'],
          assignedWorkers: [],
          leadTimeHours: 36,
          estimatedCostInr: 320000,
          feasibilityScore: 0.48,
        },
      ],
    },
  ],

  // 5. Recommended Decision (from Decision Agent)
  decision: {
    decisionId: 'DEC-NER-2026-0829-01',
    caseId: 'CASE-NER-2026-0829',
    recommendedScenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
    recommendedScenarioName: 'Scenario B: Precision Multimodal Split (Life-Saving Air Charter + Feeder Rail/Road for Food)',
    appliedWeights: DEFAULT_SCORING_WEIGHTS,
    scenarioEvaluations: [
      {
        scenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
        scenarioName: 'Scenario B: Precision Multimodal Split (Life-Saving Air Charter + Feeder Rail/Road for Food)',
        compositeScore: 95.8,
        rank: 1,
        criteria: [
          {
            criterion: 'recoveryEffectiveness',
            label: 'Recovery Effectiveness',
            rawValue: '96% SLA',
            normalizedScore: 96.2,
            weight: 0.22,
            weightedScore: 21.2,
            rationale: 'Scenario achieves 96% SLA adherence. Life-saving medical cargo delivered within 8h.',
          },
          {
            criterion: 'criticalShipmentProtection',
            label: 'Critical Shipment Protection',
            rawValue: 'Feasibility: 94% | Cold-chain: NONE',
            normalizedScore: 96.4,
            weight: 0.20,
            weightedScore: 19.3,
            rationale: 'Qualified cold-chain workers assigned with certified active battery logger safeguards.',
          },
          {
            criterion: 'recoveryTime',
            label: 'Recovery Time',
            rawValue: '14 hours',
            normalizedScore: 84.6,
            weight: 0.18,
            weightedScore: 15.2,
            rationale: 'Recovers medical cargo in 8h (20h ahead of hospital stockout) and food cargo in 14h.',
          },
          {
            criterion: 'risk',
            label: 'Operational Risk',
            rawValue: 'Cold-chain: NONE | Corridor: Confirmed',
            normalizedScore: 100.0,
            weight: 0.14,
            weightedScore: 14.0,
            rationale: 'Corridor clearance confirmed across both air runway and broad-gauge hill section.',
          },
          {
            criterion: 'cost',
            label: 'Incremental Cost',
            rawValue: '₹12.8 Lakhs',
            normalizedScore: 69.3,
            weight: 0.12,
            weightedScore: 8.3,
            rationale: 'Incremental logistics cost of ₹12.8L (63% cost savings vs full air charter).',
          },
          {
            criterion: 'workforceFeasibility',
            label: 'Workforce Feasibility',
            rawValue: 'Well-being: 94.5/100 | Accommodations: Respected',
            normalizedScore: 100.0,
            weight: 0.09,
            weightedScore: 9.0,
            rationale: 'Worker well-being 94.5/100. All ergonomic, neurodivergent, and multilingual accommodations met.',
          },
          {
            criterion: 'operationalImpact',
            label: 'ESG / Carbon Footprint',
            rawValue: '3,850 kg CO₂',
            normalizedScore: 99.8,
            weight: 0.05,
            weightedScore: 5.0,
            rationale: 'Rail modal split dramatically cuts aviation carbon emissions by 73%.',
          },
        ],
        tradeOffSummary: 'Pareto-optimal solution: delivers critical insulin 20h before hospital stockout, saves ₹21.7L vs full air charter, achieves 94.5/100 worker well-being with 0 fatigue violations.',
        risks: ['Aviation daylight operation constraint strictly requires Borjhar departure prior to 16:00 IST.'],
        expectedImpact: 'Prevents clinical stockout at Silchar Civil Hospital; saves ₹21.7L vs full air freight; protects worker ergonomics.',
        approvalRequired: true,
      },
      {
        scenarioId: 'SCENARIO-A-FAST-AIR',
        scenarioName: 'Scenario A: Emergency Air Charter & Direct Military Helipad Drop',
        compositeScore: 79.4,
        rank: 2,
        criteria: [
          {
            criterion: 'recoveryEffectiveness',
            label: 'Recovery Effectiveness',
            rawValue: '98% SLA',
            normalizedScore: 100.0,
            weight: 0.22,
            weightedScore: 22.0,
            rationale: 'Highest single-modal SLA adherence at 98%.',
          },
          {
            criterion: 'criticalShipmentProtection',
            label: 'Critical Shipment Protection',
            rawValue: 'Feasibility: 82% | Cold-chain: NONE',
            normalizedScore: 89.2,
            weight: 0.20,
            weightedScore: 17.8,
            rationale: 'Air charter provides rapid transport but food airfreight is economically wasteful.',
          },
          {
            criterion: 'recoveryTime',
            label: 'Recovery Time',
            rawValue: '10 hours',
            normalizedScore: 100.0,
            weight: 0.18,
            weightedScore: 18.0,
            rationale: 'Fastest single recovery timeline across all shipments.',
          },
          {
            criterion: 'risk',
            label: 'Operational Risk',
            rawValue: 'Cold-chain: NONE | Corridor: Confirmed',
            normalizedScore: 100.0,
            weight: 0.14,
            weightedScore: 14.0,
            rationale: 'Aviation slot availability confirmed by AAI NOTAM.',
          },
          {
            criterion: 'cost',
            label: 'Incremental Cost',
            rawValue: '₹34.5 Lakhs',
            normalizedScore: 0.0,
            weight: 0.12,
            weightedScore: 0.0,
            rationale: 'Premium cost: ₹34.5L represents excessive expenditure for non-temperature food cargo.',
          },
          {
            criterion: 'workforceFeasibility',
            label: 'Workforce Feasibility',
            rawValue: 'Well-being: 62.0/100 | Accommodations: Breached',
            normalizedScore: 32.0,
            weight: 0.09,
            weightedScore: 2.9,
            rationale: 'Night airlift loading surge causes 14h shift exceedance and elevated fatigue risk.',
          },
          {
            criterion: 'operationalImpact',
            label: 'ESG / Carbon Footprint',
            rawValue: '14,200 kg CO₂',
            normalizedScore: 0.0,
            weight: 0.05,
            weightedScore: 0.0,
            rationale: 'Heavy cargo turboprop flights generate high aviation carbon footprint.',
          },
        ],
        tradeOffSummary: 'Fastest recovery (10h) but incurs an extra ₹21.7L cost premium and violates worker fatigue limits (14h shifts).',
        risks: ['Workforce fatigue limits exceeded during night emergency turnaround.', 'Significant budget cost overrun.'],
        expectedImpact: 'Rapid resolution at significant cost and workforce strain.',
        approvalRequired: true,
      },
      {
        scenarioId: 'SCENARIO-C-ROAD-DETOUR',
        scenarioName: 'Scenario C: Meghalaya Hill Feeder Highway Bypass (Shillong-Jowai-Ratacherra-Silchar)',
        compositeScore: 42.1,
        rank: 3,
        criteria: [
          {
            criterion: 'recoveryEffectiveness',
            label: 'Recovery Effectiveness',
            rawValue: '45% SLA',
            normalizedScore: 0.0,
            weight: 0.22,
            weightedScore: 0.0,
            rationale: 'Severe SLA penalty: violates 28h hospital stockout deadline by 8 hours.',
          },
          {
            criterion: 'criticalShipmentProtection',
            label: 'Critical Shipment Protection',
            rawValue: 'Feasibility: 48% | Cold-chain: HIGH',
            normalizedScore: 33.8,
            weight: 0.20,
            weightedScore: 6.8,
            rationale: 'Cold-chain battery reserve expires at 18h; 36h transit risks complete medicine spoilage.',
          },
          {
            criterion: 'recoveryTime',
            label: 'Recovery Time',
            rawValue: '36 hours',
            normalizedScore: 0.0,
            weight: 0.18,
            weightedScore: 0.0,
            rationale: 'Slowest recovery: 36h mountain feeder detour.',
          },
          {
            criterion: 'risk',
            label: 'Operational Risk',
            rawValue: 'Cold-chain: HIGH | Corridor: Unconfirmed',
            normalizedScore: 20.5,
            weight: 0.14,
            weightedScore: 2.9,
            rationale: 'High execution risk: single-lane mountain bottlenecks and unconfirmed road clearance.',
          },
          {
            criterion: 'cost',
            label: 'Incremental Cost',
            rawValue: '₹3.2 Lakhs',
            normalizedScore: 100.0,
            weight: 0.12,
            weightedScore: 12.0,
            rationale: 'Lowest monetary cost (₹3.2L), but fails life-saving clinical feasibility.',
          },
          {
            criterion: 'workforceFeasibility',
            label: 'Workforce Feasibility',
            rawValue: 'Well-being: 54.0/100 | Accommodations: Breached',
            normalizedScore: 19.0,
            weight: 0.09,
            weightedScore: 1.7,
            rationale: 'Driver exhaustion over steep single-lane mountain roads.',
          },
          {
            criterion: 'operationalImpact',
            label: 'ESG / Carbon Footprint',
            rawValue: '6,200 kg CO₂',
            normalizedScore: 77.3,
            weight: 0.05,
            weightedScore: 3.9,
            rationale: 'Moderate road emissions from diesel convoys.',
          },
        ],
        tradeOffSummary: 'Lowest cost (₹3.2L) but unacceptable risk: breaches hospital insulin stockout deadline and exhausts cold-chain battery.',
        risks: ['Cold-chain medicine spoilage.', 'Secondary mountain gridlock.'],
        expectedImpact: 'High risk of clinical stockout and medicine loss.',
        approvalRequired: true,
      },
    ],
    justification: {
      primaryReason:
        'Prevents imminent clinical stockout at Silchar Civil Hospital in 8 hours while reducing incremental logistics cost by 63% (₹12.8L vs ₹34.5L) compared to full air charter.',
      clinicalAndFoodUrgencyEvaluation:
        'Insulin and chemotherapy cold-chain delivery is guaranteed 20 hours ahead of the local ICU stockout deadline. PDS emergency food supplies arrive safely via Indian Railways Hill line within 14 hours.',
      workforceInclusionAndSafetyEvaluation:
        'Maximizes Worker Well-Being Score to 94.5/100. Eradicates fatigue risks by capping all shifts at <= 8 hours. Fully respects worker physical ergonomic limitations and neurodivergent quiet-station accommodations.',
      costVsLifeSavingTradeOffRationale:
        'Scenario A incurs an unnecessary ₹21.7L cost premium for food airfreight without clinical benefit. Scenario C breaches hospital stockout thresholds and risks cold-chain spoilage. Scenario B provides the Pareto-optimal outcome.',
    },
    comparativeMatrix: [
      {
        scenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
        rank: 1,
        compositeScore: 95.8,
        costInr: 1280000,
        recoveryTimeHours: 14,
        workerWellBeingScore: 94.5,
        esgCarbonKg: 3850,
      },
      {
        scenarioId: 'SCENARIO-A-FAST-AIR',
        rank: 2,
        compositeScore: 79.4,
        costInr: 3450000,
        recoveryTimeHours: 10,
        workerWellBeingScore: 62.0,
        esgCarbonKg: 14200,
      },
      {
        scenarioId: 'SCENARIO-C-ROAD-DETOUR',
        rank: 3,
        compositeScore: 42.1,
        costInr: 320000,
        recoveryTimeHours: 36,
        workerWellBeingScore: 54.0,
        esgCarbonKg: 6200,
      },
    ],
    actionPlanSteps: [
      {
        stepNumber: 1,
        title: 'Dispatch Air Charter Manifest for Cold-Chain PO-890214',
        actionOwner: 'Logistics Dispatch Lead',
        targetSapSystem: 'SAP_S4HANA',
        payloadAction: 'Update PO-890214 Shipping Type to AIR_CHARTER; Route to Borjhar -> Kumbhirgram',
      },
      {
        stepNumber: 2,
        title: 'Commit Inclusive Shift Roster to SuccessFactors',
        actionOwner: 'HR / Plant Operations Supervisor',
        targetSapSystem: 'SAP_SUCCESSFACTORS',
        payloadAction:
          'Assign Debashis Sen (SF-EMP-4019) & Pranab Sarma (SF-EMP-3044) with ergonomic assistance tags; log zero overtime exceedance',
      },
      {
        stepNumber: 3,
        title: 'Reserve Indian Railways Hill Section Rake for PO-773410-PDS',
        actionOwner: 'Freight Transport Planner',
        targetSapSystem: 'SAP_LOGISTICS_BUSINESS_NETWORK',
        payloadAction: 'Book Priority Freight Slot Lumding-Badarpur Rake #NR-4482',
      },
    ],
  },

  // 6. Approval State (Human-in-the-Loop)
  approval: {
    approvalId: 'APP-NER-0829-99',
    caseId: 'CASE-NER-2026-0829',
    decisionId: 'DEC-NER-2026-0829-01',
    selectedScenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
    status: 'PENDING',
    approverUser: {
      userId: 'SAP-USER-DR-MEHTA',
      name: 'Dr. Ananya Mehta',
      role: 'Regional Disaster Response & Supply Chain Director',
      department: 'Northeast Logistics & Humanitarian Operations',
    },
    reviewNotes: 'Awaiting one-click executive confirmation to trigger SAP S/4HANA PO updates and SuccessFactors roster locks.',
    appliedOverrides: {
      budgetApprovalGranted: true,
    },
  },

  // 7. Append-Only Agent History (Full multi-agent audit trail)
  agentHistory: {
    caseId: 'CASE-NER-2026-0829',
    totalExecutions: 5,
    lastUpdated: '2026-08-29T14:28:45Z',
    historyLedger: [
      // Agent 1: Disruption Agent
      {
        executionId: 'EXEC-001-DISRUPTION',
        agentName: 'Disruption Agent',
        executionStatus: 'COMPLETED',
        timestamp: '2026-08-29T14:12:10Z',
        inputReference: {
          caseId: 'CASE-NER-2026-0829',
          referencedExecutionIds: [],
          referencedSapEntityIds: ['FEED-BRO-HAFLONG-ALERT', 'IOT-KM142-GEOPHONE'],
        },
        confidence: 0.98,
        assumptions: [
          'National Highway Authority of India (NHAI) clearance timeline of 72-96 hours is accurate based on current mudslide volume.',
          'Secondary rainfall over Dima Hasao hills precludes immediate heavy earth-mover intervention on the main carriageway.',
        ],
        evidence: [
          {
            evidenceId: 'EV-01-TELEMETRY',
            sourceType: 'ROAD_TELEMETRY',
            sourceReference: 'SENSOR-NH27-KM142',
            description: 'Geotechnical sensor telemetry confirms 180m lateral soil displacement and complete roadbed shear.',
            observedAt: '2026-08-29T14:05:00Z',
            payloadSnippet: { displacementMeters: 180, roadStatus: 'IMPASSABLE', coordinates: [25.1235, 92.9854] },
          },
          {
            evidenceId: 'EV-02-METEOROLOGY',
            sourceType: 'METEOROLOGICAL_FEED',
            sourceReference: 'IMD-ASSAM-DIMA-HASAO',
            description: 'Indian Meteorological Department Red Alert: 245.8mm recorded in 24 hours.',
            observedAt: '2026-08-29T14:08:00Z',
            payloadSnippet: { alertLevel: 'RED', rainfallMm: 245.8 },
          },
        ],
        humanReadableSummary:
          'Critical landslide confirmed on NH-27 near Jatinga Ridge. Road is impassable for at least 72 to 96 hours. Arterial connection between Guwahati hub and Barak Valley / Tripura is severed.',
        structuredOutput: {
          type: 'Disruption',
          payload: {
            disruptionId: 'DISRUPT-NER-NH27-001',
            category: 'LANDSLIDE',
            severity: 'CRITICAL',
            headline: 'Major Landslide & Highway Collapse at Dima Hasao section of NH-27',
            description:
              'Continuous torrential rainfall triggered a 180-meter mudslide and roadbed collapse near Jatinga/Haflong on NH-27.',
            location: {
              name: 'NH-27 Milepost KM-142 (Jatinga Ridge, Dima Hasao)',
              region: 'North Eastern Region, Assam, India',
              latitude: 25.1235,
              longitude: 92.9854,
            },
            affectedCorridor: 'NH-27 Guwahati to Silchar / Agartala Arterial Lifeline',
            reportedAt: '2026-08-29T14:10:00Z',
            estimatedBlockedDurationHours: 84,
            isCriticalLifelineRoute: true,
            weatherDetails: {
              rainfallMmLast24Hours: 245.8,
              forecastCondition: 'Severe Monsoon Inundation with Continued Red Alert',
              warningLevel: 'RED',
            },
          },
        },
      },

      // Agent 2: Supply Chain Impact Agent
      {
        executionId: 'EXEC-002-SUPPLYCHAIN',
        agentName: 'Supply Chain Impact Agent',
        executionStatus: 'COMPLETED',
        timestamp: '2026-08-29T14:16:30Z',
        inputReference: {
          caseId: 'CASE-NER-2026-0829',
          referencedExecutionIds: ['EXEC-001-DISRUPTION'],
          referencedSapEntityIds: ['SAP-S4-PO-890214', 'SAP-S4-PO-890215', 'SAP-S4-PO-773410'],
        },
        confidence: 0.96,
        assumptions: [
          'Destination plant Silchar Civil Hospital (PLANT-IN12-SILCHAR) consumption rate remains at standard monsoon surge levels (180 vials insulin / day).',
          'Active cold-chain container battery reserve will expire in 18 hours without replenishment or grid plug-in.',
        ],
        evidence: [
          {
            evidenceId: 'EV-03-S4HANA-INVENTORY',
            sourceType: 'MOCK_SAP_S4HANA',
            sourceReference: 'MOCK-PO-890214-COLD',
            description: 'SAP S/4HANA Purchase Order for 6,500 vials Insulin & 820 Oncology packs in transit on stranded trailer TRK-AS01-8842.',
            observedAt: '2026-08-29T14:14:00Z',
            payloadSnippet: { poNumber: 'PO-890214-COLD', valueInr: 18500000, coldChainTemp: '2C - 8C' },
          },
        ],
        humanReadableSummary:
          'Identified 3 active S/4HANA Purchase Orders worth ₹4.85 Crore stranded. Imminent life-saving medical stockout projected at Silchar Hospital in 28 hours. Active cold-chain battery expires in 18 hours.',
        structuredOutput: {
          type: 'SupplyChainImpact',
          payload: {
            impactId: 'SCI-NER-0829-01',
            disruptionId: 'DISRUPT-NER-NH27-001',
            estimatedTotalValueAtRiskInr: 48500000,
            stockoutImminentPlants: ['PLANT-IN12-SILCHAR', 'PLANT-IN14-AGARTALA'],
            daysOfBufferInventoryRemaining: { 'PLANT-IN12-SILCHAR': 1.2, 'PLANT-IN14-AGARTALA': 2.4 },
            temperatureIntegrityThreat: {
              affectedColdChainShipments: ['PO-890214-COLD'],
              batteryBackupHoursRemaining: 18,
            },
            supplyBottlenecks: [
              'Silchar Civil Hospital ICU & Dialysis Center runs out of insulin in 28 hours',
              'Assam State Oncology Wing awaiting chemotherapeutic packs',
            ],
            impactedPOs: [],
            impactedMaterials: [],
          },
        },
      },

      // Agent 3: Workforce Agent
      {
        executionId: 'EXEC-003-WORKFORCE',
        agentName: 'Workforce Agent',
        executionStatus: 'COMPLETED',
        timestamp: '2026-08-29T14:20:15Z',
        inputReference: {
          caseId: 'CASE-NER-2026-0829',
          referencedExecutionIds: ['EXEC-001-DISRUPTION', 'EXEC-002-SUPPLYCHAIN'],
          referencedSapEntityIds: ['SF-ROSTER-GUWAHATI-PLANT', 'SF-ROSTER-SILCHAR-DEPOT'],
        },
        confidence: 0.94,
        assumptions: [
          'Workers with documented physical ergonomic constraints must not be assigned manual lifting above certified limits.',
          'Shift rotations must prevent driver and ground staff exhaustion beyond mandatory resting windows.',
        ],
        evidence: [
          {
            evidenceId: 'EV-04-SUCCESSFACTORS-WORKERS',
            sourceType: 'MOCK_SAP_SUCCESSFACTORS',
            sourceReference: 'SF-EMP-3044',
            description: 'Worker profile Pranab Sarma has certified lumbo-sacral ergonomic limit (max lift 12kg) and requires forklift staging.',
            observedAt: '2026-08-29T14:18:00Z',
            payloadSnippet: { workerId: 'SF-EMP-3044', role: 'Air-Cargo Operator', maxLiftKg: 12 },
          },
          {
            evidenceId: 'EV-05-SUCCESSFACTORS-ND',
            sourceType: 'MOCK_SAP_SUCCESSFACTORS',
            sourceReference: 'SF-EMP-4019',
            description: 'Worker Debashis Sen: Neurodivergent inspection specialist requiring quiet zone and structured checklist.',
            observedAt: '2026-08-29T14:18:30Z',
            payloadSnippet: { workerId: 'SF-EMP-4019', role: 'Cold-Chain QA', accommodation: 'QUIET_ZONE' },
          },
        ],
        humanReadableSummary:
          'Assessed 50 regional logistics and warehouse personnel. Identified 2 critical fatigue risk alerts. Established strict accommodation constraints for ergonomic limits, neurodivergent quiet-zone packaging, and multilingual manifests.',
        structuredOutput: {
          type: 'WorkforceImpact',
          payload: {
            workforceImpactId: 'WFI-NER-0829-01',
            disruptionId: 'DISRUPT-NER-NH27-001',
            availableStaffCount: 42,
            constrainedStaffCount: 8,
            surgeLaborCapacityHoursAvailable: 310,
            workforceWellBeingIndex: 88.5,
            fatigueAlerts: [],
            accommodationRequirements: [],
            workerProfiles: [],
            requiredWorkers: [
              {
                roleId: 'ROLE-COLD-QA',
                roleTitle: 'Cold-Chain Pharma Packaging & Inspection Specialist',
                headcountNeeded: 1,
                assignedPlantId: 'PLANT-IN10-GUWAHATI',
                requiredCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
                urgency: 'CRITICAL',
              },
            ],
            availableQualifiedWorkers: [
              {
                workerId: 'SF-EMP-4019',
                workerName: 'Debashis Sen',
                matchedRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
                plantId: 'PLANT-IN10-GUWAHATI',
                matchingCertifications: ['COLD_CHAIN_LOGISTICS', 'ISO_13485_PHARMA'],
                safeOvertimeHoursRemaining: 5.5,
                appliedAccommodations: ['Quiet packing zone'],
              },
            ],
            skillGaps: [],
            possibleRedeployments: [],
            trainingRequirements: [
              {
                moduleId: 'TRN-COLD-GPS-01',
                title: 'Active GPS Smart-Battery Cold Box Logger Protocol',
                targetRole: 'Cold-Chain Pharma Packaging & Inspection Specialist',
                durationHours: 1.5,
                urgency: 'MANDATORY_BEFORE_DISPATCH',
                targetHeadcount: 2,
                description: 'Micro-training on initializing digital telemetry loggers.',
              },
            ],
            workloadRisks: [
              {
                riskType: 'FATIGUE_CAP_BREACH',
                severity: 'HIGH',
                affectedCount: 2,
                description: '2 staff reached safe shift limits.',
                mitigationStrategy: 'Mandatory 10-12h rest enforced.',
              },
            ],
            workforceFeasibilityScore: 94,
          },
        },
      },

      // Agent 4: Recovery Adaptation Agent
      {
        executionId: 'EXEC-004-RECOVERY',
        agentName: 'Recovery Adaptation Agent',
        executionStatus: 'COMPLETED',
        timestamp: '2026-08-29T14:24:50Z',
        inputReference: {
          caseId: 'CASE-NER-2026-0829',
          referencedExecutionIds: ['EXEC-001-DISRUPTION', 'EXEC-002-SUPPLYCHAIN', 'EXEC-003-WORKFORCE'],
          referencedSapEntityIds: ['AIR-CHARTER-CATALOG', 'INDIAN-RAILWAYS-SLOT-API'],
        },
        confidence: 0.95,
        assumptions: [
          'Guwahati Borjhar Airport (GAU) and Silchar Kumbhirgram Airport (IXS) runways remain operational for daylight turboprop flights.',
          'Indian Railways Lumding-Badarpur BG Hill Section is open with priority freight capacity.',
        ],
        evidence: [
          {
            evidenceId: 'EV-06-AIRPORT-AVAILABILITY',
            sourceType: 'ROAD_TELEMETRY',
            sourceReference: 'AAI-GAU-IXS-NOTAM',
            description: 'Airports Authority of India NOTAM confirms Kumbhirgram Airport open with priority emergency medical freight window.',
            observedAt: '2026-08-29T14:22:00Z',
            payloadSnippet: { airport: 'IXS', freightSlotsAvailable: true },
          },
        ],
        humanReadableSummary:
          'Generated 3 distinct end-to-end recovery scenarios: Scenario A (Full Emergency Airlift), Scenario B (Multimodal Precision Split: Air for Medical + Rail for PDS Food), and Scenario C (Meghalaya Hill Feeder Bypass).',
        structuredOutput: {
          type: 'RecoveryScenarios',
          payload: [],
        },
      },

      // Agent 5: Decision Agent
      {
        executionId: 'EXEC-005-DECISION',
        agentName: 'Decision Agent',
        executionStatus: 'COMPLETED',
        timestamp: '2026-08-29T14:28:45Z',
        inputReference: {
          caseId: 'CASE-NER-2026-0829',
          referencedExecutionIds: ['EXEC-001-DISRUPTION', 'EXEC-002-SUPPLYCHAIN', 'EXEC-003-WORKFORCE', 'EXEC-004-RECOVERY'],
          referencedSapEntityIds: [],
        },
        confidence: 0.97,
        assumptions: [
          'Saving human lives and preventing cold-chain spoilage is the highest priority objective.',
          'Maintaining worker well-being and respecting accommodations guarantees sustainable execution without secondary operational failures.',
        ],
        evidence: [
          {
            evidenceId: 'EV-07-PARETO-OPTIMAL',
            sourceType: 'DECISION_SCORING_ENGINE',
            sourceReference: 'MULTI-CRITERIA-ANALYZER',
            description: 'Multi-criteria utility optimization ranks Scenario B at 95.8 composite score (Pareto-optimal on Cost vs SLA vs Worker Well-Being).',
            observedAt: '2026-08-29T14:27:00Z',
            payloadSnippet: { rank1Scenario: 'SCENARIO-B-BALANCED-MULTIMODAL', compositeScore: 95.8 },
          },
        ],
        humanReadableSummary:
          'Recommended Scenario B (Precision Multimodal Split). Delivers life-saving insulin/oncology drugs in 8 hours (20 hours ahead of hospital stockout) while saving 63% freight cost and maximizing Worker Well-Being to 94.5/100.',
        structuredOutput: {
          type: 'Decision',
          payload: {
            decisionId: 'DEC-NER-2026-0829-01',
            caseId: 'CASE-NER-2026-0829',
            recommendedScenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
            recommendedScenarioName: 'Scenario B: Precision Multimodal Split',
            appliedWeights: DEFAULT_SCORING_WEIGHTS,
            scenarioEvaluations: [
              {
                scenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
                scenarioName: 'Scenario B: Precision Multimodal Split',
                compositeScore: 95.8,
                rank: 1,
                criteria: [
                  {
                    criterion: 'recoveryEffectiveness',
                    label: 'Recovery Effectiveness',
                    rawValue: '96% SLA',
                    normalizedScore: 96.2,
                    weight: 0.22,
                    weightedScore: 21.2,
                    rationale: '96% SLA adherence.',
                  },
                ],
                tradeOffSummary: 'Pareto-optimal solution: delivers critical insulin 20h before hospital stockout.',
                risks: ['Aviation daylight departure constraint'],
                expectedImpact: 'Critical insulin delivered in 8h; saves ₹21.7L vs full air charter.',
                approvalRequired: true,
              },
            ],
            justification: {
              primaryReason: 'Prevents clinical stockout in 8h, saves 63% cost, protects worker safety.',
              clinicalAndFoodUrgencyEvaluation: 'Insulin arrives 20h before ICU stockout.',
              workforceInclusionAndSafetyEvaluation: 'Capped shift hours with full ergonomic compliance.',
              costVsLifeSavingTradeOffRationale: 'Pareto-optimal solution across all 4 utility dimensions.',
            },
            comparativeMatrix: [
              {
                scenarioId: 'SCENARIO-B-BALANCED-MULTIMODAL',
                rank: 1,
                compositeScore: 95.8,
                costInr: 1280000,
                recoveryTimeHours: 14,
                workerWellBeingScore: 94.5,
                esgCarbonKg: 3850,
              },
            ],
            actionPlanSteps: [
              {
                stepNumber: 1,
                title: 'Dispatch Air Charter Manifest for Cold-Chain PO-890214',
                actionOwner: 'Logistics Dispatch Lead',
                targetSapSystem: 'SAP_S4HANA',
                payloadAction: 'Update PO-890214 Shipping Type to AIR_CHARTER',
              },
            ],
          },
        },
      },
    ],
  },
};
