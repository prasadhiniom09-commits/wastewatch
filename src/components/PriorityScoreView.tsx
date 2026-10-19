import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { StateRecord, PriorityTier } from '../types/accident';
import { ActivePage } from './Navbar';
import { IndiaMap } from './shared/IndiaMap';

interface PriorityScoreViewProps {
  states: StateRecord[];
  onSelectState: (stateName: string) => void;
  setActivePage: (page: ActivePage) => void;
  selectedStateName?: string;
}

export const PriorityScoreView: React.FC<PriorityScoreViewProps> = ({
  states,
  onSelectState,
  setActivePage,
  selectedStateName = 'Tamil Nadu',
}) => {
  const [tierFilter, setTierFilter] = useState<'ALL' | PriorityTier>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorted by Priority Score descending
  const sortedStates = useMemo(() => {
    return [...states].sort((a, b) => b.priority.score - a.priority.score);
  }, [states]);

  const filteredStates = useMemo(() => {
    return sortedStates.filter((s) => {
      const matchesTier = tierFilter === 'ALL' || s.priority.tier === tierFilter;
      const matchesSearch = s.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [sortedStates, tierFilter, searchQuery]);

  const highPriorityCount = states.filter((s) => s.priority.tier === 'HIGH PRIORITY').length;
  const mediumPriorityCount = states.filter((s) => s.priority.tier === 'MEDIUM PRIORITY').length;
  const lowPriorityCount = states.filter((s) => s.priority.tier === 'LOW PRIORITY').length;

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Road Safety Priority Index
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Multi-criteria civil engineering prioritization based on normalized exposure, route
              density, and historical momentum.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 self-start md:self-auto">
            <span>Range: 0.0 (Minimal Exposure)</span>
            <span>·</span>
            <span>100.0 (Intense Focus)</span>
          </div>
        </div>
      </div>

      {/* Mandatory Analytical Prioritization Disclaimer */}
      <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Analytical Prioritization Disclaimer</span>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed font-sans">
          <strong>Notice:</strong> This index is an <em>academic decision-support prioritization metric</em>{' '}
          synthesized from normalized indicators for allocating civil engineering safety audits and
          remedial infrastructure budgets. It is <strong>NOT an official Government of India risk classification</strong>.
          Classifications do not imply administrative performance or driver behavior.
        </p>
      </div>

      {/* Summary KPI Strip by Tier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setTierFilter(tierFilter === 'HIGH PRIORITY' ? 'ALL' : 'HIGH PRIORITY')}
          className={`p-4 rounded-xl border text-left transition-all ${
            tierFilter === 'HIGH PRIORITY'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-rose-700 font-mono">
            High Priority Tier (Score &ge; 55)
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900 mt-1 tabular-nums">
            {highPriorityCount} <span className="text-xs font-sans font-normal text-slate-500">jurisdictions</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Severe vehicle fleet exposure, road route density, or per-capita crash rates.
          </p>
        </button>

        <button
          onClick={() => setTierFilter(tierFilter === 'MEDIUM PRIORITY' ? 'ALL' : 'MEDIUM PRIORITY')}
          className={`p-4 rounded-xl border text-left transition-all ${
            tierFilter === 'MEDIUM PRIORITY'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
            Medium Priority Tier (30 &ndash; 54.9)
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-1 tabular-nums">
            {mediumPriorityCount} <span className="text-xs font-sans font-normal text-slate-500">jurisdictions</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Moderate collision exposure; routine corridor audits and intersection channelization.
          </p>
        </button>

        <button
          onClick={() => setTierFilter(tierFilter === 'LOW PRIORITY' ? 'ALL' : 'LOW PRIORITY')}
          className={`p-4 rounded-xl border text-left transition-all ${
            tierFilter === 'LOW PRIORITY'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
            Low Priority Tier (&lt; 30)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-1 tabular-nums">
            {lowPriorityCount} <span className="text-xs font-sans font-normal text-slate-500">jurisdictions</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Sub-national normalized crash rates; maintain preventative pavement testing and signage.
          </p>
        </button>
      </div>

      {/* Exact Scoring Methodology Breakdown */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider font-mono">
          <Info className="w-4 h-4 text-teal-700" />
          <span>Exact Mathematical Scoring Methodology</span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          Each raw variable is extracted from Table A2 of the MoRTH 2019 report and normalized using
          linear min-max scaling to bounded interval $[0, 1]$ across all valid observations. The four
          dimensions are weighted according to highway engineering hazard contribution:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-mono text-slate-500">Weight: 30% (0.30)</span>
            <div className="text-xs font-bold text-slate-900">Per Lakh Population Rate</div>
            <p className="text-[10px] text-slate-600">
              Captures demographic collision risk per 100,000 citizens in the jurisdiction.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-mono text-slate-500">Weight: 30% (0.30)</span>
            <div className="text-xs font-bold text-slate-900">Per 10,000 Vehicles Rate</div>
            <p className="text-[10px] text-slate-600">
              Normalizes crash frequency against registered vehicular fleet exposure.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-mono text-slate-500">Weight: 25% (0.25)</span>
            <div className="text-xs font-bold text-slate-900">Per 10,000 km Road Density</div>
            <p className="text-[10px] text-slate-600">
              Measures spatial collision concentration per unit highway kilometer.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-mono text-slate-500">Weight: 15% (0.15)</span>
            <div className="text-xs font-bold text-slate-900">4-Year Trend Momentum</div>
            <p className="text-[10px] text-slate-600">
              Penalizes jurisdictions with accelerating 2016–2019 accident percentage growth.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-900 text-teal-300 rounded font-mono text-xs overflow-x-auto">
          Priority Score = [ 0.30·Z(pop) + 0.30·Z(veh) + 0.25·Z(road) + 0.15·Z(trend) ] / [ Σ w(valid) ] × 100
        </div>
      </div>

      {/* SVG India Map Visualizing Priority Distribution */}
      <IndiaMap
        states={states}
        selectedStateName={selectedStateName}
        onSelectState={onSelectState}
        setActivePage={setActivePage}
        colorMetric="priority"
      />

      {/* Priority Rankings Table with Detailed Factor Breakdown */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Jurisdiction Priority Ranking
            </h3>
            <p className="text-xs text-slate-500">
              Ranked from highest compound engineering need to routine preventative maintenance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search State or UT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredStates.map((s, idx) => {
            const isHigh = s.priority.tier === 'HIGH PRIORITY';
            const isMed = s.priority.tier === 'MEDIUM PRIORITY';
            const isLow = s.priority.tier === 'LOW PRIORITY';

            return (
              <div
                key={s.state}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-400 w-7">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{s.state}</span>
                        {s.isUT && (
                          <span className="text-[10px] font-mono text-slate-400">UT</span>
                        )}
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800'
                              : isMed
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {s.priority.tier}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        2019 Accidents: {s.accidents2019.toLocaleString()} · Rank: #{s.rank2019 ?? 'NA'} · 4-Yr Change:{' '}
                        <span
                          className={
                            s.change2016to2019Pct > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-semibold'
                          }
                        >
                          {s.change2016to2019Pct > 0 ? '+' : ''}
                          {s.change2016to2019Pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Priority Score
                      </div>
                      <div
                        className={`text-2xl font-extrabold tabular-nums ${
                          isHigh ? 'text-rose-700' : isMed ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {s.priority.score.toFixed(1)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectState(s.state);
                        setActivePage('recommendations');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Interventions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Justification Reasons (Strictly based on dataset values) */}
                <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-100 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    Data-Driven Justification:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                    {s.priority.reasons.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
