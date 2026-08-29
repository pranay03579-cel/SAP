/**
 * SAP Sentinel — Mock Supply Chain Data Provider
 *
 * Provides simulated purchase orders, material shortages, and inventory status
 * for the NH-27 Barak Valley disruption scenario.
 *
 * Future SAP integration point:
 *   Replace with SapS4HanaSupplyChainProvider implementing the same interface,
 *   backed by SAP S/4HANA OData v4 endpoints:
 *     - Purchase Order API  (/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/...)
 *     - Material Management API
 *     - Inventory Management API
 *   Authentication via SAP BTP Destination Service (OAuth2 Client Credentials).
 *
 * DATA NOTE: This data is clearly fictional/simulated. Does not connect to
 * any real SAP system. PO numbers, vendor IDs, and plant codes are fabricated.
 */

import {
  ISupplyChainDataProvider,
  RawInventoryStatus,
} from '../interfaces.js';
import {
  ImpactedPurchaseOrder,
  ImpactedMaterial,
} from '../../../shared/types/domain.js';

const MOCK_POS: ImpactedPurchaseOrder[] = [
  {
    poNumber: 'MOCK-PO-890214-COLD',
    vendorId: 'MOCK-VEND-BHARAT-BIO',
    vendorName: 'Bharat Biocare Laboratories (Guwahati Central Depot) [MOCK]',
    originPlant: 'MOCK-PLANT-IN10-GUWAHATI',
    destinationPlant: 'MOCK-PLANT-IN12-SILCHAR',
    originalEta: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    projectedDelayHours: 82,
    cargoValueInr: 18500000,
    isColdChain: true,
    materialIds: ['MOCK-MAT-MED-INSULIN-01', 'MOCK-MAT-MED-ONCO-04'],
  },
  {
    poNumber: 'MOCK-PO-890215-MED',
    vendorId: 'MOCK-VEND-HIMALAYA-MED',
    vendorName: 'Himalaya Health Logistics Hub [MOCK]',
    originPlant: 'MOCK-PLANT-IN10-GUWAHATI',
    destinationPlant: 'MOCK-PLANT-IN14-AGARTALA',
    originalEta: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
    projectedDelayHours: 78,
    cargoValueInr: 12000000,
    isColdChain: false,
    materialIds: ['MOCK-MAT-MED-ANTIBIOTIC-02', 'MOCK-MAT-MED-SURG-KIT-12'],
  },
  {
    poNumber: 'MOCK-PO-773410-PDS',
    vendorId: 'MOCK-VEND-FCI-NER',
    vendorName: 'Food Corporation of India – Guwahati Railhead [MOCK]',
    originPlant: 'MOCK-PLANT-IN10-GUWAHATI',
    destinationPlant: 'MOCK-PLANT-IN12-SILCHAR',
    originalEta: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    projectedDelayHours: 84,
    cargoValueInr: 18000000,
    isColdChain: false,
    materialIds: ['MOCK-MAT-FOOD-PDS-RICE-50K', 'MOCK-MAT-FOOD-EMERGENCY-NUTRITION'],
  },
];

const MOCK_MATERIALS: ImpactedMaterial[] = [
  {
    materialId: 'MOCK-MAT-MED-INSULIN-01',
    description: 'Recombinant Human Insulin R (100 IU/mL) 10mL Vials [MOCK DATA]',
    category: 'MEDICINE',
    criticality: 'LIFE_SAVING',
    temperatureControlled: true,
    requiredTempCelsius: { min: 2, max: 8 },
    shortageQuantity: 6500,
    unitOfMeasure: 'VIALS',
    affectedDestinationPlant: 'MOCK-PLANT-IN12-SILCHAR',
  },
  {
    materialId: 'MOCK-MAT-MED-ONCO-04',
    description: 'Chemotherapy Infusion Packs (Cisplatin/Paclitaxel) [MOCK DATA]',
    category: 'MEDICINE',
    criticality: 'LIFE_SAVING',
    temperatureControlled: true,
    requiredTempCelsius: { min: 2, max: 8 },
    shortageQuantity: 820,
    unitOfMeasure: 'PACKS',
    affectedDestinationPlant: 'MOCK-PLANT-IN12-SILCHAR',
  },
  {
    materialId: 'MOCK-MAT-FOOD-EMERGENCY-NUTRITION',
    description: 'Fortified High-Calorie Ready-to-Use Supplementary Food (RUSF) [MOCK DATA]',
    category: 'FOOD_SUPPLY',
    criticality: 'EMERGENCY_FOOD',
    temperatureControlled: false,
    shortageQuantity: 24000,
    unitOfMeasure: 'SACHETS',
    affectedDestinationPlant: 'MOCK-PLANT-IN12-SILCHAR',
  },
];

const MOCK_INVENTORY: RawInventoryStatus[] = [
  {
    plantId: 'MOCK-PLANT-IN12-SILCHAR',
    plantName: 'Silchar Civil Hospital Distribution Centre [MOCK]',
    daysOfBufferRemaining: 1.2,
    coldChainBatteryHoursRemaining: 18,
    stockoutImminentWithinHours: 28,
  },
  {
    plantId: 'MOCK-PLANT-IN14-AGARTALA',
    plantName: 'Agartala State Distribution Centre [MOCK]',
    daysOfBufferRemaining: 2.4,
    coldChainBatteryHoursRemaining: null,
    stockoutImminentWithinHours: null,
  },
];

export class MockSupplyChainProvider implements ISupplyChainDataProvider {
  async getAffectedPurchaseOrders(_corridorId: string): Promise<ImpactedPurchaseOrder[]> {
    return MOCK_POS;
  }

  async getAffectedMaterials(_destinationPlantIds: string[]): Promise<ImpactedMaterial[]> {
    return MOCK_MATERIALS;
  }

  async getInventoryStatus(_plantIds: string[]): Promise<RawInventoryStatus[]> {
    return MOCK_INVENTORY;
  }
}
