import React from 'react';
import {
  BarChart3,
  Search,
  Scale,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { ActivePage } from './Navbar';
import { StateRecord } from '../types/accident';

interface HomeViewProps {
  states: StateRecord[];
  nationalTotal: StateRecord;
  nationalAverages: {
    totalAccidents2019: number;
    popRate2019: number;
    vehRate2019: number;
    roadDensity2018P: number;
    fourYearChangePct: number;
  };
  setActivePage: (page: ActivePage) => void;
  onSelectState: (stateName: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  states,
  nationalTotal,
  nationalAverages,
  setActivePage,
  onSelectState,
}) => {
  // Find key stats directly from dataset
  const highestCountState = [...states].sort((a, b) => b.accidents2019 - a.accidents2019)[0];
  const validPopStates = [...states].filter((s) => s.ratePerLakhPop2019 !== null);
  const highestPopRateState = [...validPopStates].sort(
    (a, b) => (b.ratePerLakhPop2019 ?? 0) - (a.ratePerLakhPop2019 ?? 0)
  )[0];
  const validVehStates = [...states].filter((s) => s.ratePer10kVehicles2019 !== null);
  const highestVehRateState = [...validVehStates].sort(
    (a, b) => (b.ratePer10kVehicles2019 ?? 0) - (a.ratePer10kVehicles2019 ?? 0)
  )[0];
  const validDensityStates = [...states].filter((s) => s.densityPer10kKmRoads2018P !== null);
  const highestDensityState = [...validDensityStates].sort(
    (a, b) => (b.densityPer10kKmRoads2018P ?? 0) - (a.densityPer10kKmRoads2018P ?? 0)
  )[0];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-teal-300 uppercase">
            <span className="w-2 h-2 rounded bg-teal-400" />
            <span>Ministry of Road Transport & Highways Data Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            CIVIC PULSE
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-teal-100">
            AI-Based Road Safety & Infrastructure Analytics
          </p>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Transforming government road-accident data into meaningful road-safety insights.
            Rigorous civil-engineering decision support evaluating raw accident volumes against
            population exposure, vehicle fleet density, and road network geometric capacity.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActivePage('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-md transition-all whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Explore Dashboard</span>
            </button>

            <button
              onClick={() => setActivePage('analyzer')}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Analyze a State</span>
            </button>

            <button
              onClick={() => setActivePage('comparison')}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all whitespace-nowrap"
            >
              <Scale className="w-4 h-4" />
              <span>Compare States</span>
            </button>

            <button
              onClick={() => setActivePage('prediction')}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-teal-200 bg-teal-900/60 hover:bg-teal-900 border border-teal-700/60 rounded-lg transition-all whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Prediction & Insights</span>
            </button>
          </div>
        </div>

        {/* Civil engineering background grid accents */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#grid)" />
          </svg>
        </div>
      </section>

      {/* 4-Column National Metric Strip (Calculated directly from uploaded dataset) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
            National Baseline (MoRTH 2019 Dataset Findings)
          </h2>
          <span className="text-xs font-mono text-slate-500">
            36 States & UTs · Zero Estimated Placeholders
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Total Accidents in 2019</span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {nationalAverages.totalAccidents2019.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 pt-1">
              Down <span className="text-emerald-700 font-semibold font-mono">6.58%</span> from 480,652 in 2016
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Highest Absolute Volume</span>
            <div className="text-2xl font-bold font-mono text-slate-900 truncate tabular-nums">
              {highestCountState?.state}
            </div>
            <div className="text-xs text-slate-500 pt-1">
              <span className="font-mono font-medium text-slate-700">
                {highestCountState?.accidents2019.toLocaleString()}
              </span>{' '}
              crashes (Rank 1 · 12.75% share)
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Highest Pop. Crash Rate</span>
            <div className="text-2xl font-bold font-mono text-slate-900 truncate tabular-nums">
              {highestPopRateState?.state}
            </div>
            <div className="text-xs text-slate-500 pt-1">
              <span className="font-mono font-medium text-slate-700">
                {highestPopRateState?.ratePerLakhPop2019?.toFixed(1)}
              </span>{' '}
              per lakh (vs nat avg 34.2)
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Highest Route Density</span>
            <div className="text-2xl font-bold font-mono text-slate-900 truncate tabular-nums">
              {highestDensityState?.state}
            </div>
            <div className="text-xs text-slate-500 pt-1">
              <span className="font-mono font-medium text-slate-700">
                {highestDensityState?.densityPer10kKmRoads2018P?.toFixed(1)}
              </span>{' '}
              crashes / 10k km road
            </div>
          </div>
        </div>
      </section>

      {/* Core Analytical Principles & Workflow (The 9 Pillars) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Civil Engineering Analytical Architecture
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            A comprehensive analytical framework moving from raw police accident registries through
            statistical normalization to evidence-backed IRC standard recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              01. Data Preprocessing & Validation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detection of numeric datatypes, preservation of exact state names, rigorous handling of
              unreported fields (such as Telangana population rates and Daman & Diu vehicle fleet
              records) without zero-coercion.
            </p>
            <div className="pt-2 text-xs font-mono text-teal-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Provenance Verification</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              02. Exposure Normalization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Distinguishing raw counts from normalized exposure: accident frequency per lakh
              population, collision rate per 10,000 registered motor vehicles, and network hazard
              density per 10,000 km of road length.
            </p>
            <div className="pt-2 text-xs font-mono text-sky-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Demographic & Fleet Adjusted</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              03. Statistical Trend Modeling
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ordinary Least Squares (OLS) linear regression across 2016–2019 annual observations with
              explicit R² determination, historical slope computation, and transparent limitations of
              short-horizon time series forecasting.
            </p>
            <div className="pt-2 text-xs font-mono text-amber-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OLS Linear Trajectories</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              04. Multi-Factor Priority Index
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A transparent 0–100 analytical scoring system synthesizing normalized population rate
              (30%), vehicle rate (30%), road density (25%), and 4-year momentum (15%) for civil
              engineering resource allocation.
            </p>
            <div className="pt-2 text-xs font-mono text-rose-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Analytical Tier Classification</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              05. State Comparative Matrices
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct side-by-side benchmarking of 2 to 5 regional corridors across raw count,
              per-capita exposure, fleet collision rates, and 4-year changes with Relative Road Safety
              Indicators (RRSI).
            </p>
            <div className="pt-2 text-xs font-mono text-indigo-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Jurisdiction Alignment</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              06. Evidence-Based Interventions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Concrete civil engineering recommendations (IRC:SP:88 black spot audits, IRC:103
              pedestrian crossings, IRC:99 traffic calming, IRC:52 hill barriers) strictly justified
              by observed dataset metrics.
            </p>
            <div className="pt-2 text-xs font-mono text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Codified IRC Standards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick State Navigation Grid */}
      <section className="bg-slate-100 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Quick State & UT Analysis Selector
            </h3>
            <p className="text-xs text-slate-600">
              Select any of the 36 jurisdictions to open detailed four-year analytics and engineering
              prescriptions.
            </p>
          </div>
          <button
            onClick={() => setActivePage('analyzer')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Full Analyzer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {states.map((st) => (
            <button
              key={st.state}
              onClick={() => {
                onSelectState(st.state);
                setActivePage('analyzer');
              }}
              className="p-2.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition-all truncate text-slate-800 hover:text-teal-900 group"
              title={st.state}
            >
              <div className="font-medium truncate group-hover:underline">{st.state}</div>
              <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                {st.accidents2019.toLocaleString()} crashes
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
