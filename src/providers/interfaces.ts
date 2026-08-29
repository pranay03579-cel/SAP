/**
 * SAP Sentinel — Provider Interface Contracts
 *
 * These interfaces define the EXACT capability boundaries that each logical
 * agent needs from an external data source. They are completely independent
 * of any underlying implementation (mock or future SAP).
 *
 * Architecture:
 *   Agent → IDisruptionDataProvider
 *                 ↓
 *        MockDisruptionProvider   ← today
 *        SapDisruptionProvider    ← when credentials are available
 *
 * Adding a real SAP provider = implement the interface, swap it into
 * ProviderRegistry. Zero agent code changes required.
 */

import {
  DisruptionCategory,
  SeverityLevel,
  ImpactedPurchaseOrder,
  ImpactedMaterial,
  WorkerConstraintProfile,
  GeoLocation,
} from '../../shared/types/domain.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives returned by providers (raw, unvalidated by domain schemas)
// ─────────────────────────────────────────────────────────────────────────────

export interface RawDisruptionSignal {
  signalId: string;
  category: DisruptionCategory;
  severity: SeverityLevel;
  headline: string;
  description: string;
  location: GeoLocation;
  affectedCorridor: string;
  estimatedBlockedDurationHours: number;
  isCriticalLifelineRoute: boolean;
  rainfall24hMm: number;
  weatherForecast: string;
  weatherWarningLevel: 'RED' | 'ORANGE' | 'YELLOW';
  sourceAlertId: string;
  observedAt: string;
}

export interface RawInventoryStatus {
  plantId: string;
  plantName: string;
  daysOfBufferRemaining: number;
  coldChainBatteryHoursRemaining: number | null;
  stockoutImminentWithinHours: number | null;
}

export interface RawTransportCapacity {
  modalityId: string;
  modality: 'ROAD_HIGHWAY' | 'AIR_CHARTER' | 'RAIL_FREIGHT' | 'DRONE_AIRLIFT' | 'FEEDER_ROAD';
  routeName: string;
  routePath: string[];
  availableNow: boolean;
  availableSlots: number;
  leadTimeHours: number;
  costPerTonneInr: number;
  coldChainCapable: boolean;
  capacityConstraints: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Disruption Data Provider
//    Used by: Disruption Agent
//    Provides: live or simulated disruption event signals
// ─────────────────────────────────────────────────────────────────────────────
export interface IDisruptionDataProvider {
  /**
   * Fetch the active disruption signal for a given corridor.
   * Future SAP integration point: SAP Event Mesh / IoT Data Feed
   */
  getActiveDisruptionSignal(corridorId: string): Promise<RawDisruptionSignal>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Supply Chain Data Provider
//    Used by: Supply Chain Impact Agent
//    Provides: purchase orders, materials, and inventory buffers
// ─────────────────────────────────────────────────────────────────────────────
export interface ISupplyChainDataProvider {
  /**
   * Fetch purchase orders affected by a disruption on a corridor.
   * Future SAP integration point: SAP S/4HANA Purchase Order API (OData v4)
   */
  getAffectedPurchaseOrders(corridorId: string): Promise<ImpactedPurchaseOrder[]>;

  /**
   * Fetch material master data and shortage quantities for affected destinations.
   * Future SAP integration point: SAP S/4HANA Material Management API (OData v4)
   */
  getAffectedMaterials(destinationPlantIds: string[]): Promise<ImpactedMaterial[]>;

  /**
   * Fetch current inventory buffer status for destination plants.
   * Future SAP integration point: SAP S/4HANA Inventory Management API (OData v4)
   */
  getInventoryStatus(plantIds: string[]): Promise<RawInventoryStatus[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Workforce Data Provider
//    Used by: Workforce Agent
//    Provides: employee profiles, skills, accommodations, and shift availability
// ─────────────────────────────────────────────────────────────────────────────
export interface IWorkforceDataProvider {
  /**
   * Fetch available worker profiles for a set of plant locations.
   * Future SAP integration point: SAP SuccessFactors Employee Central API (OData v4)
   */
  getAvailableWorkers(plantIds: string[]): Promise<WorkerConstraintProfile[]>;

  /**
   * Fetch current shift fatigue / overtime data for workers.
   * Future SAP integration point: SAP SuccessFactors Time Management API
   */
  getWorkerOvertimeSummary(workerIds: string[]): Promise<Record<string, number>>; // workerId → overtimeHoursThisWeek
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Transport Capacity Provider
//    Used by: Recovery Adaptation Agent
//    Provides: available alternative routes and transport slots
// ─────────────────────────────────────────────────────────────────────────────
export interface ITransportCapacityProvider {
  /**
   * Fetch available transport options for a given origin-destination pair.
   * Future SAP integration point: SAP Logistics Business Network (LBN) or
   *   SAP Transportation Management (TM) via OData
   */
  getAvailableTransportOptions(
    originPlantId: string,
    destinationPlantIds: string[]
  ): Promise<RawTransportCapacity[]>;
}
