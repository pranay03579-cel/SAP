import React from 'react';
import { 
  MapPin, 
  CloudRain, 
  AlertTriangle, 
  Thermometer, 
  PackageCheck, 
  Hospital, 
  Warehouse
} from 'lucide-react';
import { Case } from '../../shared/types/domain';

interface DisruptionDetailsProps {
  currentCase: Case;
}

export const DisruptionDetails: React.FC<DisruptionDetailsProps> = ({ currentCase }) => {
  const disruption = currentCase.disruption;
  const supplyChain = currentCase.supplyChainImpact;

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="glass-panel p-6 rounded-xl border-l-4 border-l-sap-crimson bg-sap-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded border border-red-500/30">
                {disruption?.category} · {disruption?.severity}
              </span>
              <span className="text-xs text-sap-muted font-mono">{disruption?.disruptionId}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {disruption?.headline}
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
              {disruption?.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-sap-border pt-3 sm:pt-0 sm:pl-6 text-right">
            <span className="text-xs text-sap-muted">Estimated Road Blockade</span>
            <span className="text-2xl font-bold text-sap-gold font-mono">
              {disruption?.estimatedBlockedDurationHours} Hours
            </span>
            <span className="text-[11px] text-red-400 mt-0.5">BRO / NHAI Restoration Active</span>
          </div>
        </div>
      </div>

      {/* 2. Corridor GIS Telemetry & Weather Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Geographic Telemetry & Route Map */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sap-accent" />
              <span>Corridor Telemetry & Disruption Vector</span>
            </h3>
            <span className="text-xs font-mono text-sap-muted">
              LAT: {disruption?.location.latitude}° N · LON: {disruption?.location.longitude}° E
            </span>
          </div>

          {/* Visual Route Representation */}
          <div className="bg-sap-dark/80 p-5 rounded-xl border border-sap-border relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              {/* Origin */}
              <div className="bg-sap-card p-3 rounded-lg border border-sap-border text-center min-w-[140px]">
                <Warehouse className="w-5 h-5 text-sap-accent mx-auto mb-1" />
                <span className="font-bold text-white block">Guwahati Hub</span>
                <span className="text-[10px] text-sap-muted">PLANT-IN10</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Origin Depots</span>
              </div>

              <div className="flex-1 flex items-center justify-center relative w-full md:w-auto">
                <div className="h-0.5 bg-slate-700 w-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center space-x-1 border border-red-400 shadow-lg shadow-red-500/40">
                    <AlertTriangle className="w-3 h-3 animate-pulse" />
                    <span>KM-142 Mudslide</span>
                  </div>
                </div>
              </div>

              {/* Destination 1 */}
              <div className="bg-sap-card p-3 rounded-lg border border-sap-border text-center min-w-[140px]">
                <Hospital className="w-5 h-5 text-sap-crimson mx-auto mb-1" />
                <span className="font-bold text-white block">Silchar Civil Hospital</span>
                <span className="text-[10px] text-sap-muted">PLANT-IN12</span>
                <span className="text-[10px] text-sap-crimson block font-semibold mt-1">1.2 Days Buffer</span>
              </div>

              {/* Destination 2 */}
              <div className="bg-sap-card p-3 rounded-lg border border-sap-border text-center min-w-[140px]">
                <Warehouse className="w-5 h-5 text-sap-gold mx-auto mb-1" />
                <span className="font-bold text-white block">Agartala State DC</span>
                <span className="text-[10px] text-sap-muted">PLANT-IN14</span>
                <span className="text-[10px] text-amber-400 block mt-1">2.4 Days Buffer</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sap-border/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                <span className="text-sap-muted">Lifeline Corridor: </span>
                <span className="text-slate-200 font-medium">{disruption?.affectedCorridor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sap-muted">Altitude: </span>
                <span className="text-slate-200 font-mono">{disruption?.location.altitudeMeters}m MSL</span>
              </div>
            </div>
          </div>

          {/* Bottlenecks List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-sap-muted uppercase tracking-wider">Identified Supply Bottlenecks</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supplyChain?.supplyBottlenecks.map((bottleneck, idx) => (
                <div key={idx} className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-300 flex items-start space-x-2">
                  <span className="font-mono text-red-400 font-bold mt-0.5">•</span>
                  <span>{bottleneck}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Weather & Temperature Threat */}
        <div className="space-y-4">
          {/* Weather Telemetry */}
          <div className="glass-panel p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-sap-cyan" />
                <span>Meteorological Feed</span>
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                {disruption?.weatherDetails.warningLevel} WARNING
              </span>
            </div>
            <div className="bg-sap-dark/80 p-3 rounded-lg border border-sap-border">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sap-muted">24h Rainfall</span>
                <span className="text-lg font-bold text-sap-cyan font-mono">
                  {disruption?.weatherDetails.rainfallMmLast24Hours} mm
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {disruption?.weatherDetails.forecastCondition}
              </p>
            </div>
          </div>

          {/* Cold Chain Threat */}
          <div className="glass-panel p-5 rounded-xl space-y-3 border-amber-500/30">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Thermometer className="w-4 h-4 text-sap-crimson" />
                <span>Active Cold-Chain Integrity</span>
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-sap-gold border border-amber-500/30">
                18h Battery Reserve
              </span>
            </div>
            <div className="bg-sap-dark/80 p-3 rounded-lg border border-sap-border text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sap-muted">Monitored PO:</span>
                <span className="font-mono text-white font-semibold">PO-890214-COLD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sap-muted">Temperature Requirement:</span>
                <span className="font-mono text-emerald-400 font-semibold">+2°C to +8°C</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-[11px] text-amber-300 pt-1">
                Active refrigeration will expire if not plugged in or airlifted within 18 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Impacted SAP S/4HANA Purchase Orders Table */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-sap-accent" />
              <span>Stranded S/4HANA Purchase Orders & Cargo Valuation</span>
            </h3>
            <p className="text-xs text-sap-muted">
              Total Value at Risk: ₹{(supplyChain?.estimatedTotalValueAtRiskInr ? supplyChain.estimatedTotalValueAtRiskInr / 10000000 : 4.85).toFixed(2)} Crore across 3 active consignments
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sap-dark/80 text-sap-muted border-b border-sap-border uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Destination Plant</th>
                <th className="py-3 px-4">Cargo Value</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Delay Impact</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sap-border/60">
              {supplyChain?.impactedPOs.map((po) => (
                <tr key={po.poNumber} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {po.poNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{po.vendorName}</div>
                    <div className="text-[10px] font-mono text-sap-muted">{po.vendorId}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">
                    {po.destinationPlant}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    ₹{(po.cargoValueInr / 100000).toFixed(1)} Lakhs
                  </td>
                  <td className="py-3.5 px-4">
                    {po.isColdChain ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-sap-cyan border border-cyan-500/30 flex items-center space-x-1 w-max">
                        <Thermometer className="w-3 h-3" />
                        <span>Cold-Chain 2-8°C</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-sap-border w-max block">
                        Standard Dry
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sap-gold">
                    +{po.projectedDelayHours}h Delay
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      STRANDED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Impacted Material Master Inventory */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Impacted Critical Materials & Hospital Stockout Forecast
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {supplyChain?.impactedMaterials.map((mat) => (
            <div key={mat.materialId} className="bg-sap-dark/80 p-4 rounded-xl border border-sap-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sap-muted">{mat.materialId}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  mat.criticality === 'LIFE_SAVING'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/20 text-sap-gold border border-amber-500/30'
                }`}>
                  {mat.criticality}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">
                {mat.description}
              </h4>
              <div className="pt-2 border-t border-sap-border flex items-center justify-between text-xs">
                <span className="text-sap-muted">Shortage Qty:</span>
                <span className="font-bold text-white font-mono">
                  {mat.shortageQuantity.toLocaleString()} {mat.unitOfMeasure}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Destination:</span>
                <span className="font-mono text-slate-200">{mat.affectedDestinationPlant}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
