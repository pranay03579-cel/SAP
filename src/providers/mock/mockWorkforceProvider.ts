/**
 * SAP Sentinel — Mock Workforce Data Provider
 *
 * Provides simulated worker profiles, skills, ergonomic accommodations,
 * and overtime data for the NE India disruption recovery scenario.
 *
 * Future SAP integration point:
 *   Replace with SapSuccessFactorsWorkforceProvider implementing the same
 *   interface, backed by:
 *     - SAP SuccessFactors Employee Central API (OData v4)
 *     - SAP SuccessFactors Time Management API
 *   Authentication via SAP BTP Destination Service (OAuth2 SAML Bearer).
 *
 * DATA NOTE: Worker names, IDs, and plant assignments are entirely fictional.
 * No real employee data is represented.
 */

import { IWorkforceDataProvider } from '../interfaces.js';
import { WorkerConstraintProfile } from '../../../shared/types/domain.js';

const MOCK_WORKERS: WorkerConstraintProfile[] = [
  {
    workerId: 'MOCK-SF-EMP-4019',
    name: 'Debashis Sen [MOCK]',
    role: 'Cold-Chain Packaging & Inspection Specialist',
    assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
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
    workerId: 'MOCK-SF-EMP-3044',
    name: 'Pranab Jyoti Sarma [MOCK]',
    role: 'Senior Air-Cargo Dispatch & Staging Operator',
    assignedPlantId: 'MOCK-PLANT-IN10-GUWAHATI',
    skillCertifications: ['AIR_CARGO_STAGING', 'HAZMAT_DG_CERTIFIED', 'FORKLIFT_PRECISION'],
    accommodations: [
      {
        category: 'PHYSICAL_ERGONOMICS',
        description: 'Recovering lumbo-sacral strain',
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
    workerId: 'MOCK-SF-EMP-5102',
    name: 'Bimalendu Deb [MOCK]',
    role: 'Warehouse Transfer & Receiving Specialist',
    assignedPlantId: 'MOCK-PLANT-IN12-SILCHAR',
    skillCertifications: ['RAPID_RECEIVING', 'PHARMA_STOCK_RECONCILIATION'],
    accommodations: [
      {
        category: 'MULTILINGUAL_INSTRUCTION',
        description: 'Prefers Bengali digital voice & text manifests',
        strictLimit: 'Automated translation on warehouse scanner',
      },
    ],
    preferredLanguage: 'Bengali',
    currentOvertimeHoursWeek: 1.0,
    maxSafeOvertimeHoursWeek: 8.0,
    fatigueRiskScore: 0.18,
    availabilityStatus: 'AVAILABLE',
  },
];

const MOCK_OVERTIME: Record<string, number> = {
  'MOCK-SF-EMP-4019': 2.5,
  'MOCK-SF-EMP-3044': 4.0,
  'MOCK-SF-EMP-5102': 1.0,
  // Constrained workers (on rest mandate) — not exposed as available
  'MOCK-SF-EMP-1082': 11.0, // exceeded driving hours
  'MOCK-SF-EMP-2041': 18.0, // exceeded continuous shift hours
};

export class MockWorkforceProvider implements IWorkforceDataProvider {
  async getAvailableWorkers(_plantIds: string[]): Promise<WorkerConstraintProfile[]> {
    return MOCK_WORKERS;
  }

  async getWorkerOvertimeSummary(_workerIds: string[]): Promise<Record<string, number>> {
    return MOCK_OVERTIME;
  }
}
