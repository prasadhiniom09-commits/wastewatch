import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingDown,
  Car,
  Users,
  Route,
  Filter,
} from 'lucide-react';
import { StateRecord, IndicatorKey } from '../types/accident';
import { HorizontalBarChart, TrendLineChart } from './shared/Charts';
import { INDICATOR_METAS } from '../utils/analytics';
import { ActivePage } from './Navbar';
import { GlobalSearchBar } from './shared/GlobalSearchBar';
import { IndiaMap } from './shared/IndiaMap';
import { DashboardDataTable } from './DashboardDataTable';

interface NationalDashboardViewProps {
  states: StateRecord[];
  nationalTotal: StateRecord;
  nationalAverages: {
    totalAccidents2019: number;
    popRate2019: number;
    vehRate2019: number;
    roadDensity2018P: number;
    fourYearChangePct: number;
  };
  onSelectState: (stateName: string) => void;
  setActivePage: (page: ActivePage) => void;
  selectedStateName?: string;
}

export const NationalDashboardView: React.FC<NationalDashboardViewProps> = ({
  states,
  nationalTotal,
  nationalAverages,
  onSelectState,
  setActivePage,
  selectedStateName = 'Tamil Nadu',
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorKey>('accidents2019');
  const [filterType, setFilterType] = useState<'all' | 'states' | 'uts'>('all');

  // Computed KPIs
  const totalStatesCount = states.length; // 36
  const totalAccidents2019 = nationalAverages.totalAccidents2019; // 449,002

  const highestCountState = useMemo(() => {
    return [...states].sort((a, b) => b.accidents2019 - a.accidents2019)[0];
  }, [states]);

  const highestPopRateState = useMemo(() => {
    const valid = states.filter((s) => s.ratePerLakhPop2019 !== null);
    return [...valid].sort(
      (a, b) => (b.ratePerLakhPop2019 ?? 0) - (a.ratePerLakhPop2019 ?? 0)
    )[0];
  }, [states]);

  const highestVehRateState = useMemo(() => {
    const valid = states.filter((s) => s.ratePer10kVehicles2019 !== null);
    return [...valid].sort(
      (a, b) => (b.ratePer10kVehicles2019 ?? 0) - (a.ratePer10kVehicles2019 ?? 0)
    )[0];
  }, [states]);

  const highestDensityState = useMemo(() => {
    const valid = states.filter((s) => s.densityPer10kKmRoads2018P !== null);
    return [...valid].sort(
      (a, b) => (b.densityPer10kKmRoads2018P ?? 0) - (a.densityPer10kKmRoads2018P ?? 0)
    )[0];
  }, [states]);

  // Filtered states for indicator chart
  const filteredStates = useMemo(() => {
    return states.filter((s) => {
      if (filterType === 'states') return !s.isUT;
      if (filterType === 'uts') return s.isUT;
      return true;
    });
  }, [states, filterType]);

  // Indicator chart dataset
  const indicatorChartData = useMemo(() => {
    const currentMeta = INDICATOR_METAS[selectedIndicator];

    const mapped = filteredStates.map((s) => {
      let val: number | null = null;
      if (selectedIndicator === 'accidents2019') val = s.accidents2019;
      else if (selectedIndicator === 'ratePerLakhPop2019') val = s.ratePerLakhPop2019;
      else if (selectedIndicator === 'ratePer10kVehicles2019') val = s.ratePer10kVehicles2019;
      else if (selectedIndicator === 'densityPer10kKmRoads2018P') val = s.densityPer10kKmRoads2018P;
      else if (selectedIndicator === 'change2016to2019Pct') val = s.change2016to2019Pct;

      return {
        label: s.state,
        value: val,
        highlight: s.priority.tier === 'HIGH PRIORITY',
        tooltipExtra: `${s.state}: ${
          val !== null
            ? val > 999
              ? val.toLocaleString()
              : val.toFixed(2)
            : 'Not Reported'
        } ${currentMeta.unit}`,
      };
    });

    return mapped.sort((a, b) => {
      if (a.value === null) return 1;
      if (b.value === null) return -1;
      return b.value - a.value;
    });
  }, [filteredStates, selectedIndicator]);

  const currentMeta = INDICATOR_METAS[selectedIndicator];

  return (
    <div className="space-y-10 py-6">
      {/* Light-Themed Hero Header Section */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-50 via-sky-50/50 to-emerald-50/30 border border-teal-100 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-teal-800 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>National Road Safety Observatory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              National Road Safety Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Macro-level infrastructure analytics and exposure benchmarks synthesized from official
              Ministry of Road Transport & Highways (MoRTH) records.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500 font-mono bg-white/80 px-3 py-1.5 rounded-lg border border-teal-100 shrink-0">
            <span>MoRTH Table A2</span>
            <span>·</span>
            <span>2016–2019 Records</span>
          </div>
        </div>

        {/* Global Quick State Jump Search Bar in Dashboard */}
        <div className="pt-4 border-t border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-700">
            <strong className="font-semibold text-teal-900">Quick State & UT Jump:</strong>{' '}
            Type any state name to filter and jump directly to localized safety audits.
          </div>
          <div className="w-full sm:w-80">
            <GlobalSearchBar
              states={states}
              onSelectState={onSelectState}
              setActivePage={setActivePage}
              placeholder="Jump to State or UT... (/)"
              variant="prominent"
            />
          </div>
        </div>
      </div>

      {/* Light-Themed KPI Cards Strip (6 Required KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <div className="p-4 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Jurisdictions</span>
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalStatesCount}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">29 States · 7 UTs</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/70 shadow-2xs space-y-1.5 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-teal-800 text-xs font-medium">
            <span>Total Accidents (2019)</span>
            <div className="w-6 h-6 rounded-md bg-teal-100 flex items-center justify-center text-teal-700">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-teal-950 tabular-nums">
            {totalAccidents2019.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-mono">
            -6.58% vs 2016 baseline
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/70 shadow-2xs space-y-1.5 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
            <span>Highest Total Volume</span>
            <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-700">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate" title={highestCountState.state}>
            {highestCountState.state}
          </div>
          <p className="text-[11px] text-slate-600 font-mono tabular-nums">
            {highestCountState.accidents2019.toLocaleString()} ({highestCountState.share2019.toFixed(1)}% share)
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-200/70 shadow-2xs space-y-1.5 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-indigo-800 text-xs font-medium">
            <span>Highest Pop. Rate</span>
            <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate" title={highestPopRateState.state}>
            {highestPopRateState.state}
          </div>
          <p className="text-[11px] text-indigo-700 font-mono tabular-nums">
            {highestPopRateState.ratePerLakhPop2019?.toFixed(1)}/lakh (nat: {nationalAverages.popRate2019.toFixed(1)})
          </p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-200/70 shadow-2xs space-y-1.5 hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-rose-800 text-xs font-medium">
            <span>Highest Fleet Rate</span>
            <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center text-rose-700">
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate" title={highestVehRateState.state}>
            {highestVehRateState.state}
          </div>
          <p className="text-[11px] text-rose-700 font-mono tabular-nums">
            {highestVehRateState.ratePer10kVehicles2019?.toFixed(1)}/10k veh (nat: {nationalAverages.vehRate2019.toFixed(1)})
          </p>
        </div>

        {/* KPI 6 */}
        <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-200/70 shadow-2xs space-y-1.5 hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between text-sky-800 text-xs font-medium">
            <span>Highest Route Density</span>
            <div className="w-6 h-6 rounded-md bg-sky-100 flex items-center justify-center text-sky-700">
              <Route className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate" title={highestDensityState.state}>
            {highestDensityState.state}
          </div>
          <p className="text-[11px] text-sky-700 font-mono tabular-nums">
            {highestDensityState.densityPer10kKmRoads2018P?.toFixed(1)}/10k km
          </p>
        </div>
      </div>

      {/* National 4-Year Macro Trendline (2016 vs 2017 vs 2018 vs 2019) */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              National Accident Volume Trajectory (2016–2019)
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated MoRTH police crash registry records across all 36 States and Union Territories.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-600">
            Trajectory: <strong className="text-teal-700 font-semibold">-31,650 crashes</strong> (-6.58%)
          </div>
        </div>

        <TrendLineChart
          years={[2016, 2017, 2018, 2019]}
          values={[
            nationalTotal.accidents2016,
            nationalTotal.accidents2017,
            nationalTotal.accidents2018,
            nationalTotal.accidents2019,
          ]}
          unit="reported crashes"
          regressionLine={{
            slope: nationalTotal.trend.slope,
            intercept: nationalTotal.trend.intercept,
            rSquared: nationalTotal.trend.rSquared,
          }}
        />
      </div>

      {/* SVG-Based National India Map Component */}
      <IndiaMap
        states={states}
        selectedStateName={selectedStateName}
        onSelectState={onSelectState}
        setActivePage={setActivePage}
        colorMetric="priority"
      />

      {/* Interactive Indicator Switcher & Ranking Chart Section */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              State & UT Rankings by Selected Metric
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between total volume, normalized rates, and spatial route densities.
            </p>
          </div>

          {/* Region filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (36)
            </button>
            <button
              onClick={() => setFilterType('states')}
              className={`px-3 py-1.5 rounded transition-colors ${
                filterType === 'states'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              States Only (29)
            </button>
            <button
              onClick={() => setFilterType('uts')}
              className={`px-3 py-1.5 rounded transition-colors ${
                filterType === 'uts'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              UTs Only (7)
            </button>
          </div>
        </div>

        {/* Indicator Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(
            [
              'accidents2019',
              'ratePerLakhPop2019',
              'ratePer10kVehicles2019',
              'densityPer10kKmRoads2018P',
              'change2016to2019Pct',
            ] as IndicatorKey[]
          ).map((key) => {
            const meta = INDICATOR_METAS[key];
            const isSelected = selectedIndicator === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedIndicator(key)}
                className={`p-3 text-left rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 text-teal-950 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{meta.shortLabel}</div>
                <div className="text-[11px] text-slate-500 mt-1 truncate font-mono">{meta.unit}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Indicator Description & Benchmark Note */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200">
          <div>
            <strong className="text-slate-900">{currentMeta.label}:</strong>{' '}
            <span>{currentMeta.description}</span>
          </div>
          {currentMeta.nationalValue2019 !== null && (
            <div className="shrink-0 font-mono text-slate-800">
              National Benchmark:{' '}
              <strong className="text-rose-700 font-bold">
                {currentMeta.nationalValue2019 > 999
                  ? currentMeta.nationalValue2019.toLocaleString()
                  : currentMeta.nationalValue2019.toFixed(2)}{' '}
                {currentMeta.unit}
              </strong>
            </div>
          )}
        </div>

        {/* The Horizontal Bar Chart */}
        <div className="pt-2">
          <HorizontalBarChart
            data={indicatorChartData}
            unit={currentMeta.unit}
            maxBars={18}
            referenceLine={
              currentMeta.nationalValue2019 !== null
                ? {
                    value: currentMeta.nationalValue2019,
                    label: 'National Baseline',
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Dedicated Sortable, Searchable Data Table Component with Metric Toggling and CSV Export */}
      <DashboardDataTable
        states={states}
        nationalAverages={nationalAverages}
        onSelectState={onSelectState}
        setActivePage={setActivePage}
        selectedStateName={selectedStateName}
      />
    </div>
  );
};
