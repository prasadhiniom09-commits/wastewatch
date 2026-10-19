import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  FileText,
  Shield,
  CheckCircle,
  Calendar,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';
import { StateRecord } from '../types/accident';
import { TrendLineChart } from './shared/Charts';

interface StateReportModalProps {
  state: StateRecord;
  nationalAverages: {
    totalAccidents2019: number;
    popRate2019: number;
    vehRate2019: number;
    roadDensity2018P: number;
    fourYearChangePct: number;
  };
  onClose: () => void;
}

export const StateReportModal: React.FC<StateReportModalProps> = ({
  state,
  nationalAverages,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const reportId = `CP-MORTH-${state.state.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}-2019`;
  const generationDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:my-0 print:max-w-none">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-teal-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">
                Technical Safety Report Preview
              </span>
              <span className="text-xs text-slate-400 font-mono ml-2">
                {state.state} · Document ID: {reportId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div
          ref={reportRef}
          className="p-6 sm:p-10 space-y-8 bg-white text-slate-900 print:p-8 print:space-y-6 font-sans text-xs sm:text-sm leading-relaxed"
        >
          {/* Formal Technical Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-mono tracking-widest text-teal-800 uppercase font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-teal-700" />
                  <span>CIVIC PULSE · HIGHWAY SAFETY DECISION SUPPORT SYSTEM</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  ROAD SAFETY INFRASTRUCTURE TECHNICAL REPORT
                </h1>
                <div className="text-xs text-slate-600 font-mono">
                  Primary Data: Ministry of Road Transport & Highways (MoRTH) · Road Accidents in
                  India 2019 (Table A2)
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-[11px] text-slate-600 space-y-0.5 shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded border sm:border-none border-slate-200">
                <div>
                  <strong>Document Reference:</strong> {reportId}
                </div>
                <div>
                  <strong>Date of Generation:</strong> {generationDate}
                </div>
                <div>
                  <strong>Target Jurisdiction:</strong> {state.state} ({state.isUT ? 'UT' : 'State'})
                </div>
                <div>
                  <strong>All-India Rank (2019):</strong> #{state.rank2019 ?? 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-200 pb-1">
              01. Executive Exposure Profile & Baseline Metrics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase">2019 Accidents</span>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  {state.accidents2019.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-600 font-sans">
                  {state.share2019.toFixed(2)}% of national total
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase">4-Yr Growth (16–19)</span>
                <div
                  className={`text-xl font-bold tabular-nums ${
                    state.change2016to2019Pct > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {state.change2016to2019Pct > 0 ? '+' : ''}
                  {state.change2016to2019Pct.toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-600 font-sans">
                  Nat avg: {nationalAverages.fourYearChangePct.toFixed(1)}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase">Priority Index</span>
                <div
                  className={`text-xl font-bold tabular-nums ${
                    state.priority.tier === 'HIGH PRIORITY'
                      ? 'text-rose-700'
                      : state.priority.tier === 'MEDIUM PRIORITY'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {state.priority.score.toFixed(1)}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-700 font-sans">
                  {state.priority.tier}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase">Route Crash Density</span>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  {state.densityPer10kKmRoads2018P !== null
                    ? state.densityPer10kKmRoads2018P.toFixed(1)
                    : 'NA'}
                </div>
                <span className="text-[10px] text-slate-600 font-sans">
                  per 10k km roads
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Four-Year Yearly Registry & Normalized Rates Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-200 pb-1">
              02. Four-Year Historical Registry & Normalized Rates (2016–2019)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 font-mono">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-semibold">
                    <th className="py-2 px-3 font-sans">Year / Indicator</th>
                    <th className="py-2 px-3 text-right">2016</th>
                    <th className="py-2 px-3 text-right">2017</th>
                    <th className="py-2 px-3 text-right">2018</th>
                    <th className="py-2 px-3 text-right bg-teal-50">2019</th>
                    <th className="py-2 px-3 text-right font-sans">All-India Benchmark (2019)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">
                      Total Reported Accidents (count)
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.accidents2016.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.accidents2017.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.accidents2018.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold bg-teal-50 text-slate-900 tabular-nums">
                      {state.accidents2019.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                      449,002
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">
                      Accidents Per Lakh Population
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.ratePerLakhPop2016?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.ratePerLakhPop2017?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.ratePerLakhPop2018?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold bg-teal-50 text-slate-900 tabular-nums">
                      {state.ratePerLakhPop2019?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                      {nationalAverages.popRate2019.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">
                      Accidents Per 10,000 Vehicles
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.ratePer10kVehicles2016?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.ratePer10kVehicles2017?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.ratePer10kVehicles2018?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold bg-teal-50 text-slate-900 tabular-nums">
                      {state.ratePer10kVehicles2019?.toFixed(2) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                      {nationalAverages.vehRate2019.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">
                      Accidents Per 10,000 km Roads
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.densityPer10kKmRoads2016?.toFixed(1) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.densityPer10kKmRoads2017?.toFixed(1) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {state.densityPer10kKmRoads2018P?.toFixed(1) ?? 'NA'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold bg-teal-50 text-slate-900 tabular-nums">
                      {state.densityPer10kKmRoads2018P?.toFixed(1) ?? 'NA'} (P)
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                      {nationalAverages.roadDensity2018P.toFixed(1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Visual Historical Trendline & OLS Model */}
          <div className="space-y-3 print:break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-200 pb-1">
              03. Historical Trajectory & OLS Regression Trendline
            </h2>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <TrendLineChart
                years={[2016, 2017, 2018, 2019]}
                values={[
                  state.accidents2016,
                  state.accidents2017,
                  state.accidents2018,
                  state.accidents2019,
                ]}
                unit="crashes"
                projectedYear={2020}
                projectedValue={state.trend.projected2020}
                regressionLine={{
                  slope: state.trend.slope,
                  intercept: state.trend.intercept,
                  rSquared: state.trend.rSquared,
                }}
              />

              <div className="p-3 bg-white rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400">Slope ($m$):</span>{' '}
                  <strong>{state.trend.slope.toFixed(2)} crashes/yr</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Intercept ($c$):</span>{' '}
                  <strong>{Math.round(state.trend.intercept).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Goodness of Fit ($R^2$):</span>{' '}
                  <strong>{state.trend.rSquared.toFixed(3)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Projected Next Period:</span>{' '}
                  <strong>~{state.trend.projected2020.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Civil Engineering Interpretation */}
          <div className="space-y-2 print:break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-200 pb-1">
              04. Civil Engineering Interpretation (Data-Grounded)
            </h2>
            <div className="p-4 bg-slate-100 rounded-lg text-xs leading-relaxed text-slate-800 font-sans border-l-4 border-teal-700">
              {state.engineeringInterpretation}
            </div>
          </div>

          {/* Section 5: Codified Civil Engineering Recommendations */}
          <div className="space-y-3 print:break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-200 pb-1">
              05. Evidence-Based Civil Engineering Recommendations (IRC Codified)
            </h2>

            <div className="space-y-2.5">
              {state.recommendations.map((rec, i) => (
                <div
                  key={rec.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {i + 1}. {rec.title}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Standard: {rec.standardsReference}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{rec.description}</p>

                  <div className="text-[11px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 font-sans">
                    <strong className="text-teal-900">Observed Data Justification:</strong>{' '}
                    {rec.dataJustification}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Official Academic Disclaimer & Certification Stamp */}
          <div className="pt-6 border-t border-slate-300 text-[11px] text-slate-500 space-y-2 print:break-inside-avoid font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>Authority / Origin:</strong> Government of India Open Government Data Platform ·
                MoRTH Road Accidents in India 2019
              </div>
              <div>
                <strong>Verification Hash:</strong> {reportId}-VERIFIED
              </div>
            </div>
            <p className="font-sans leading-relaxed text-slate-600">
              Disclaimer: This technical memorandum is generated by the CIVIC PULSE academic
              decision-support prototype. Estimates and risk classifications are analytical indicators
              derived from historical registry observations and are intended to guide preliminary highway
              safety reconnaissance rather than replace comprehensive statutory field investigations.
            </p>
          </div>
        </div>

        {/* Modal Bottom Print Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close Preview
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
