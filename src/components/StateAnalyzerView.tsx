import React, { useState } from 'react';
import {
  Search,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  Share2,
  Users,
  Car,
  Route,
  ArrowRight,
  ShieldAlert,
  Printer,
} from 'lucide-react';
import { StateRecord } from '../types/accident';
import { TrendLineChart } from './shared/Charts';
import { ActivePage } from './Navbar';

interface StateAnalyzerViewProps {
  states: StateRecord[];
  selectedStateName: string;
  onSelectState: (stateName: string) => void;
  nationalAverages: {
    totalAccidents2019: number;
    popRate2019: number;
    vehRate2019: number;
    roadDensity2018P: number;
    fourYearChangePct: number;
  };
  setActivePage: (page: ActivePage) => void;
  onOpenReportModal?: () => void;
}

export const StateAnalyzerView: React.FC<StateAnalyzerViewProps> = ({
  states,
  selectedStateName,
  onSelectState,
  nationalAverages,
  setActivePage,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentState =
    states.find((s) => s.state.toLowerCase() === selectedStateName.toLowerCase()) ||
    states[0];

  const filteredStateList = states.filter((s) =>
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUpwardTrend = currentState.change2016to2019Pct > 0;

  return (
    <div className="space-y-10 py-6">
      {/* Header and State Selector */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              State-Level Exposure & Infrastructure Analyzer
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Examine localized accident frequency, multi-year variations, and normalized crash rates.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Generate summarized technical PDF report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </button>
            )}

            <button
              onClick={() => setActivePage('recommendations')}
              className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Interventions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* State Selection Dropdown & Search */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Jurisdiction
            </label>
            <select
              value={currentState.state}
              onChange={(e) => onSelectState(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
            >
              <optgroup label="States">
                {states
                  .filter((s) => !s.isUT)
                  .map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state} (2019: {s.accidents2019.toLocaleString()} crashes)
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Union Territories">
                {states
                  .filter((s) => s.isUT)
                  .map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state} (2019: {s.accidents2019.toLocaleString()} crashes)
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Filter
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Quick state chips when searching */}
        {searchTerm && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {filteredStateList.slice(0, 8).map((s) => (
              <button
                key={s.state}
                onClick={() => {
                  onSelectState(s.state);
                  setSearchTerm('');
                }}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  s.state === currentState.state
                    ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.state}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Jurisdiction Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentState.state}
              </h2>
              {currentState.isUT ? (
                <span className="text-xs font-mono text-slate-500">Union Territory</span>
              ) : (
                <span className="text-xs font-mono text-slate-500">State</span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              All-India Crash Rank (2019):{' '}
              <strong className="text-slate-900 font-bold">
                #{currentState.rank2019 ?? 'N/A'}
              </strong>{' '}
              · National Crash Share:{' '}
              <strong className="text-slate-900 font-bold">
                {currentState.share2019.toFixed(2)}%
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg border text-right font-mono ${
                isUpwardTrend
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider">
                4-Year Trajectory (2016–2019)
              </div>
              <div className="text-xl font-bold flex items-center justify-end gap-1 tabular-nums">
                {isUpwardTrend ? (
                  <TrendingUp className="w-5 h-5 text-rose-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                )}
                <span>
                  {isUpwardTrend ? '+' : ''}
                  {currentState.change2016to2019Pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Year Yearly Historical Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">2016 Accidents</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {currentState.accidents2016.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Share: {currentState.share2016.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">2017 Accidents</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {currentState.accidents2017.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Share: {currentState.share2017.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">2018 Accidents</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {currentState.accidents2018.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Share: {currentState.share2018.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200 space-y-1">
            <div className="text-[11px] font-mono text-teal-800 font-semibold">2019 Accidents</div>
            <div className="text-lg font-bold font-mono text-teal-950 tabular-nums">
              {currentState.accidents2019.toLocaleString()}
            </div>
            <div className="text-[10px] text-teal-700 font-mono">
              Share: {currentState.share2019.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend Chart (2016–2019) */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recorded Accident Trend (2016–2019)
            </h3>
            <p className="text-xs text-slate-500">
              Annual crash counts reported in MoRTH Table A2 for {currentState.state}.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-600">
            Net Change:{' '}
            <strong
              className={
                currentState.accidents2019 - currentState.accidents2016 > 0
                  ? 'text-rose-600'
                  : 'text-emerald-700'
              }
            >
              {currentState.accidents2019 - currentState.accidents2016 > 0 ? '+' : ''}
              {(currentState.accidents2019 - currentState.accidents2016).toLocaleString()} crashes
            </strong>
          </div>
        </div>

        <TrendLineChart
          years={[2016, 2017, 2018, 2019]}
          values={[
            currentState.accidents2016,
            currentState.accidents2017,
            currentState.accidents2018,
            currentState.accidents2019,
          ]}
          unit="crashes"
          regressionLine={{
            slope: currentState.trend.slope,
            intercept: currentState.trend.intercept,
            rSquared: currentState.trend.rSquared,
          }}
        />
      </div>

      {/* Normalized Indicators Breakdown & Benchmark Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Pop Rate */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Demographic Exposure
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xs font-medium text-slate-700">Accidents per Lakh Population</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {currentState.ratePerLakhPop2019 !== null
              ? currentState.ratePerLakhPop2019.toFixed(1)
              : 'Not Reported'}
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>National Avg: {nationalAverages.popRate2019.toFixed(1)}</span>
            {currentState.ratePerLakhPop2019 !== null && (
              <span
                className={`font-semibold ${
                  currentState.ratePerLakhPop2019 > nationalAverages.popRate2019
                    ? 'text-rose-700'
                    : 'text-emerald-700'
                }`}
              >
                {(currentState.ratePerLakhPop2019 / nationalAverages.popRate2019).toFixed(2)}×
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Vehicle Fleet Rate */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Fleet Exposure
            </span>
            <Car className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xs font-medium text-slate-700">Accidents per 10,000 Vehicles</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {currentState.ratePer10kVehicles2019 !== null
              ? currentState.ratePer10kVehicles2019.toFixed(1)
              : 'Not Reported'}
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>National Avg: {nationalAverages.vehRate2019.toFixed(1)}</span>
            {currentState.ratePer10kVehicles2019 !== null && (
              <span
                className={`font-semibold ${
                  currentState.ratePer10kVehicles2019 > nationalAverages.vehRate2019
                    ? 'text-rose-700'
                    : 'text-emerald-700'
                }`}
              >
                {(currentState.ratePer10kVehicles2019 / nationalAverages.vehRate2019).toFixed(2)}×
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Road Network Density */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Spatial Network Density
            </span>
            <Route className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xs font-medium text-slate-700">Accidents per 10,000 km Roads</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {currentState.densityPer10kKmRoads2018P !== null
              ? currentState.densityPer10kKmRoads2018P.toFixed(1)
              : 'Not Reported'}
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>National Avg: {nationalAverages.roadDensity2018P.toFixed(1)}</span>
            {currentState.densityPer10kKmRoads2018P !== null && (
              <span
                className={`font-semibold ${
                  currentState.densityPer10kKmRoads2018P > nationalAverages.roadDensity2018P
                    ? 'text-rose-700'
                    : 'text-emerald-700'
                }`}
              >
                {(
                  currentState.densityPer10kKmRoads2018P / nationalAverages.roadDensity2018P
                ).toFixed(2)}
                ×
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Engineering Interpretation Box (Strictly data-grounded, no unsupported causes) */}
      <div className="p-6 bg-slate-900 text-slate-100 rounded-xl shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-mono uppercase tracking-wider font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>Civil Engineering Interpretation</span>
        </div>

        <p className="text-sm leading-relaxed text-slate-200 font-sans">
          {currentState.engineeringInterpretation}
        </p>

        <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span>Observation Standard: IRC:SP:88 Highway Safety Assessment Baseline</span>
          <span>Data Honesty Protocol: Excludes unsupported causality conjecture</span>
        </div>
      </div>
    </div>
  );
};
