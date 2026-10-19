import React, { useState } from 'react';
import {
  Scale,
  Plus,
  X,
  Info,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { StateRecord } from '../types/accident';
import { GroupedBarChart } from './shared/Charts';

interface StateComparisonViewProps {
  states: StateRecord[];
  nationalAverages: {
    totalAccidents2019: number;
    popRate2019: number;
    vehRate2019: number;
    roadDensity2018P: number;
    fourYearChangePct: number;
  };
}

export const StateComparisonView: React.FC<StateComparisonViewProps> = ({
  states,
  nationalAverages,
}) => {
  // Preset 3 diverse states: Tamil Nadu (highest count), Kerala (high pop/veh rate), Uttar Pradesh (growing count)
  const [selectedStates, setSelectedStates] = useState<string[]>([
    'Tamil Nadu',
    'Kerala',
    'Uttar Pradesh',
  ]);
  const [stateToAdd, setStateToAdd] = useState<string>('');

  const handleAddState = (name: string) => {
    if (!name || selectedStates.includes(name) || selectedStates.length >= 5) return;
    setSelectedStates([...selectedStates, name]);
    setStateToAdd('');
  };

  const handleRemoveState = (name: string) => {
    if (selectedStates.length <= 2) return; // keep at least 2
    setSelectedStates(selectedStates.filter((s) => s !== name));
  };

  const comparedRecords = selectedStates
    .map((name) => states.find((s) => s.state.toLowerCase() === name.toLowerCase()))
    .filter((s): s is StateRecord => s !== undefined);

  const colors = ['#0d9488', '#0284c7', '#d97706', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Multi-State Road Safety Comparison
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Benchmark 2 to 5 jurisdictions simultaneously across absolute crash volumes, normalized
              rates, and Relative Road Safety Indicators.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Comparing <strong className="text-slate-900 font-bold">{selectedStates.length}</strong>{' '}
            of 5 allowable jurisdictions
          </div>
        </div>
      </div>

      {/* State Selector Strip */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {selectedStates.map((name, idx) => (
            <div
              key={name}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border text-xs font-semibold"
              style={{
                borderColor: `${colors[idx % colors.length]}40`,
                backgroundColor: `${colors[idx % colors.length]}10`,
                color: colors[idx % colors.length],
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
              <span>{name}</span>
              {selectedStates.length > 2 && (
                <button
                  onClick={() => handleRemoveState(name)}
                  className="hover:opacity-75 p-0.5 rounded"
                  title={`Remove ${name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {selectedStates.length < 5 && (
            <div className="flex items-center gap-2">
              <select
                value={stateToAdd}
                onChange={(e) => handleAddState(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800"
              >
                <option value="">+ Add State / UT to compare...</option>
                {states
                  .filter((s) => !selectedStates.includes(s.state))
                  .map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {selectedStates.length < 2 && (
          <p className="text-xs text-rose-600 font-mono">
            Please select at least 2 States or UTs to generate comparisons.
          </p>
        )}
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Total Accidents 2019 */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Total Accidents (2019 Volume)
          </h3>
          <p className="text-xs text-slate-500">
            Raw accident count directly recorded in MoRTH Table A2.
          </p>
          <GroupedBarChart
            categories={comparedRecords.map((s) => s.state)}
            metrics={{
              label: 'Total Recorded Crashes',
              values: comparedRecords.map((s) => s.accidents2019),
              unit: 'crashes',
            }}
            colors={colors}
          />
        </div>

        {/* Chart 2: Per Lakh Population Rate */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Accidents Per Lakh Population (2019)
          </h3>
          <p className="text-xs text-slate-500">
            Normalized per capita exposure (National Average: {nationalAverages.popRate2019.toFixed(1)}).
          </p>
          <GroupedBarChart
            categories={comparedRecords.map((s) => s.state)}
            metrics={{
              label: 'Per Lakh Population Rate',
              values: comparedRecords.map((s) => s.ratePerLakhPop2019),
              unit: 'per lakh',
            }}
            colors={colors}
          />
        </div>

        {/* Chart 3: Per 10k Vehicles */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Accidents Per 10,000 Vehicles (2019)
          </h3>
          <p className="text-xs text-slate-500">
            Vehicle fleet crash exposure (National Average: {nationalAverages.vehRate2019.toFixed(1)}).
          </p>
          <GroupedBarChart
            categories={comparedRecords.map((s) => s.state)}
            metrics={{
              label: 'Per 10,000 Vehicles Rate',
              values: comparedRecords.map((s) => s.ratePer10kVehicles2019),
              unit: 'per 10k veh',
            }}
            colors={colors}
          />
        </div>

        {/* Chart 4: Road Network Density */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Accident Density Per 10,000 km Roads (2018P)
          </h3>
          <p className="text-xs text-slate-500">
            Network spatial density (National Average: {nationalAverages.roadDensity2018P.toFixed(1)}).
          </p>
          <GroupedBarChart
            categories={comparedRecords.map((s) => s.state)}
            metrics={{
              label: 'Route Density',
              values: comparedRecords.map((s) => s.densityPer10kKmRoads2018P),
              unit: 'per 10k km',
            }}
            colors={colors}
          />
        </div>
      </div>

      {/* Comprehensive Side-by-Side Comparison Matrix */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Side-by-Side Parameter Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Direct comparison across government counts, normalized indicators, and relative index.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-2.5 px-3">Metric / Indicator</th>
                {comparedRecords.map((s, idx) => (
                  <th key={s.state} className="py-2.5 px-3 text-right">
                    <span style={{ color: colors[idx % colors.length] }}>{s.state}</span>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right text-slate-500 font-normal">
                  All-India Baseline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  2019 National Rank
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                    #{s.rank2019 ?? 'NA'}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-500 tabular-nums">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  Accidents (2016)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right text-slate-700 tabular-nums">
                    {s.accidents2016.toLocaleString()}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-500 tabular-nums">480,652</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  Accidents (2017)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right text-slate-700 tabular-nums">
                    {s.accidents2017.toLocaleString()}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-500 tabular-nums">464,910</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  Accidents (2018)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right text-slate-700 tabular-nums">
                    {s.accidents2018.toLocaleString()}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-500 tabular-nums">467,044</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-900">
                  Accidents (2019)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                    {s.accidents2019.toLocaleString()}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-700 font-semibold tabular-nums">
                  449,002
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  2016–2019 % Change
                </td>
                {comparedRecords.map((s) => (
                  <td
                    key={s.state}
                    className={`py-2 px-3 text-right font-bold tabular-nums ${
                      s.change2016to2019Pct > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {s.change2016to2019Pct > 0 ? '+' : ''}
                    {s.change2016to2019Pct.toFixed(1)}%
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-emerald-700 font-medium tabular-nums">
                  -6.58%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  Per Lakh Population (2019)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right tabular-nums">
                    {s.ratePerLakhPop2019 !== null ? s.ratePerLakhPop2019.toFixed(1) : 'NA'}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                  {nationalAverages.popRate2019.toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  Per 10,000 Vehicles (2019)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right tabular-nums">
                    {s.ratePer10kVehicles2019 !== null ? s.ratePer10kVehicles2019.toFixed(1) : 'NA'}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                  {nationalAverages.vehRate2019.toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                  Per 10,000 km Roads (2018P)
                </td>
                {comparedRecords.map((s) => (
                  <td key={s.state} className="py-2 px-3 text-right tabular-nums">
                    {s.densityPer10kKmRoads2018P !== null
                      ? s.densityPer10kKmRoads2018P.toFixed(1)
                      : 'NA'}
                  </td>
                ))}
                <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                  {nationalAverages.roadDensity2018P.toFixed(1)}
                </td>
              </tr>
              <tr className="bg-teal-50/50">
                <td className="py-2.5 px-3 font-sans font-bold text-teal-950">
                  Relative Road Safety Indicator (0–100)
                </td>
                {comparedRecords.map((s) => (
                  <td
                    key={s.state}
                    className="py-2.5 px-3 text-right font-bold text-teal-900 text-sm tabular-nums"
                  >
                    {s.priority.score.toFixed(1)}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">50.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Relative Road Safety Indicator (RRSI) Mathematical Explanation */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider font-mono">
          <Info className="w-4 h-4 text-teal-700" />
          <span>Relative Road Safety Indicator (RRSI) Calculation Methodology</span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          The <strong>Relative Road Safety Indicator (RRSI)</strong> is derived strictly from
          normalized indicators present in the MoRTH dataset. Each raw metric $X_i$ is min-max
          normalized across all reporting States and UTs into a dimensionless interval $[0, 1]$:
        </p>

        <div className="p-3 bg-white rounded border border-slate-200 font-mono text-xs text-slate-800 space-y-1 overflow-x-auto">
          <div>Z_i = (X_i - X_min) / (X_max - X_min)</div>
          <div>RRSI = [ 0.30·Z(pop) + 0.30·Z(veh) + 0.25·Z(road) + 0.15·Z(trend) ] / [ Σ w(available) ] × 100</div>
        </div>

        <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
          Where Z(pop) is the normalized population accident rate, Z(veh) is the
          normalized registered vehicle accident rate, Z(road) is the normalized road network
          density, and Z(trend) represents 4-year growth momentum. If an indicator is
          unreported in the government tables (e.g., Telangana population rate), the available weights
          are dynamically re-scaled so no artificial zeroes distort the comparative index.
        </p>
      </div>
    </div>
  );
};
