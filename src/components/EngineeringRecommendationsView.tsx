import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  BookOpen,
  Filter,
  CheckCircle,
  MapPin,
  Printer,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { StateRecord, CivilEngineeringRecommendation } from '../types/accident';
import { ActivePage } from './Navbar';

interface EngineeringRecommendationsViewProps {
  states: StateRecord[];
  selectedStateName: string;
  onSelectState: (stateName: string) => void;
  setActivePage: (page: ActivePage) => void;
  onOpenReportModal?: () => void;
}

export const EngineeringRecommendationsView: React.FC<EngineeringRecommendationsViewProps> = ({
  states,
  selectedStateName,
  onSelectState,
  setActivePage,
  onOpenReportModal,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const currentState =
    states.find((s) => s.state.toLowerCase() === selectedStateName.toLowerCase()) ||
    states[0];

  const recommendations = currentState.recommendations;

  const categories = ['ALL', ...Array.from(new Set(recommendations.map((r) => r.category)))];

  const filteredRecs =
    categoryFilter === 'ALL'
      ? recommendations
      : recommendations.filter((r) => r.category === categoryFilter);

  const handlePrint = () => {
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Civil Engineering Safety Recommendations
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Evidence-based highway engineering interventions derived strictly from observed
              accident metrics and codified Indian Road Congress (IRC) standards.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Generate summarized technical PDF report with charts & IRC recommendations"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* State Selector & Summary Strip */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target State / Union Territory
            </label>
            <select
              value={currentState.state}
              onChange={(e) => onSelectState(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
            >
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} ({s.priority.tier} · Score: {s.priority.score.toFixed(1)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
            <div>
              2019 Crashes:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">
                {currentState.accidents2019.toLocaleString()}
              </strong>
            </div>
            <div>
              Per Lakh Pop:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">
                {currentState.ratePerLakhPop2019?.toFixed(1) ?? 'NA'}
              </strong>
            </div>
            <div>
              Per 10k Veh:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">
                {currentState.ratePer10kVehicles2019?.toFixed(1) ?? 'NA'}
              </strong>
            </div>
            <div>
              Priority Tier:{' '}
              <strong
                className={`font-bold ${
                  currentState.priority.tier === 'HIGH PRIORITY'
                    ? 'text-rose-700'
                    : currentState.priority.tier === 'MEDIUM PRIORITY'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {currentState.priority.tier}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-xs mr-1 shrink-0">Intervention Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Evidence-Based Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.map((rec, idx) => (
          <div
            key={rec.id}
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 transition-all hover:border-slate-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    REC-{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                </div>
                <div className="text-xs text-teal-800 font-mono font-medium">
                  Discipline: {rec.category} · Regulatory Reference: {rec.standardsReference}
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded ${
                    rec.urgency === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.urgency === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Urgency: {rec.urgency}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {rec.description}
            </p>

            {/* Mandatory "Why this recommendation is relevant based on the observed data" */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[11px] uppercase font-bold text-teal-900 font-mono flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span>Why this recommendation is relevant based on the observed data:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                {rec.dataJustification}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Academic Practice Protocol Note */}
      <div className="p-6 bg-slate-900 text-slate-200 rounded-xl space-y-3 border border-slate-800">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Civil Engineering Implementation Protocol</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-300 font-sans">
          In civil engineering practice, macro-level tabular accident datasets (such as MoRTH Table A2)
          are utilized for first-stage reconnaissance to identify regional network anomalies. They
          should precede detailed site investigations including 72-hour classified traffic volume
          counts, radar spot speed surveys, collision diagram drafting, and pavement friction
          coefficient measurements prior to capital expenditure.
        </p>
      </div>
    </div>
  );
};
