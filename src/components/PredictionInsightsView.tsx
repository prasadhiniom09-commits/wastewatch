import React, { useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
  Sliders,
  Calculator,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { StateRecord } from '../types/accident';
import { TrendLineChart } from './shared/Charts';

interface PredictionInsightsViewProps {
  states: StateRecord[];
  selectedStateName: string;
  onSelectState: (stateName: string) => void;
}

export const PredictionInsightsView: React.FC<PredictionInsightsViewProps> = ({
  states,
  selectedStateName,
  onSelectState,
}) => {
  const [activeStateName, setActiveStateName] = useState<string>(selectedStateName);
  // Scenario simulation parameter: Traffic/Enforcement factor (-15% to +15%)
  const [scenarioFactor, setScenarioFactor] = useState<number>(0);

  const currentState =
    states.find((s) => s.state.toLowerCase() === activeStateName.toLowerCase()) ||
    states[0];

  const trend = currentState.trend;
  const rawProjected2020 = trend.projected2020;
  // Apply scenario adjustment
  const scenarioProjected2020 = Math.max(
    0,
    Math.round(rawProjected2020 * (1 + scenarioFactor / 100))
  );

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              AI / Statistical Trend Modeling
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Transparent, data-honest historical regression trajectories and sensitivity simulation.
            </p>
          </div>

          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-mono text-indigo-900 font-medium self-start md:self-auto">
            Approach: Ordinary Least Squares (OLS) Linear Trend
          </div>
        </div>
      </div>

      {/* Epistemic Honesty Banner (Required by user brief) */}
      <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider font-mono">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>Epistemic Honesty & Statistical Limitations</span>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed font-sans">
          <strong>Important Methodological Limitation:</strong> The government dataset contains
          exactly four annual observations (2016, 2017, 2018, and 2019). While Ordinary Least Squares
          (OLS) linear trend estimation provides an empirical rate of annual change (Δy/Δx),
          it cannot be presented as a deterministic long-term forecast. External macro-shocks (such as
          the 2020 COVID-19 mobility restrictions, new expressway openings, or automated enforcement)
          cause structural breaks not capturable by simple univariate historical extrapolation.
        </p>
      </div>

      {/* State Selector & Baseline Parameter Bar */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Jurisdiction for Trend Analysis
            </label>
            <select
              value={currentState.state}
              onChange={(e) => {
                setActiveStateName(e.target.value);
                onSelectState(e.target.value);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
            >
              {states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} ({s.accidents2019.toLocaleString()} in 2019)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <div>
              R² Fit:{' '}
              <strong className="text-slate-900 font-bold">
                {trend.rSquared.toFixed(3)}
              </strong>
            </div>
            <div>
              Annual Trajectory:{' '}
              <strong
                className={
                  trend.annualAverageDelta > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'
                }
              >
                {trend.annualAverageDelta > 0 ? '+' : ''}
                {trend.annualAverageDelta.toLocaleString()} crashes/yr
              </strong>
            </div>
          </div>
        </div>

        {/* Statistical Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">Slope ($m$)</span>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {trend.slope.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500">crashes / year</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">Intercept ($c$)</span>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {Math.round(trend.intercept).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">2016 model origin</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">Coefficient of Determination</span>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              R² = {trend.rSquared.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-500">
              {trend.rSquared > 0.8
                ? 'High linear correlation'
                : trend.rSquared > 0.5
                ? 'Moderate linearity'
                : 'Substantial yearly variance'}
            </span>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg">
            <span className="text-[11px] font-mono text-indigo-900 font-semibold">
              Historical Trend-Based Estimate
            </span>
            <div className="text-base font-bold font-mono text-indigo-950 tabular-nums">
              ~{rawProjected2020.toLocaleString()}
            </div>
            <span className="text-[10px] text-indigo-700">Projected next-period baseline</span>
          </div>
        </div>
      </div>

      {/* Visual Chart: 2016-2019 Historical Data + OLS Trendline + 2020 Estimate */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentState.state}: Trendline Fitting & Estimate
            </h3>
            <p className="text-xs text-slate-500">
              Observed points (teal solid line) with Ordinary Least Squares best-fit regression
              (indigo dashed).
            </p>
          </div>

          <div className="text-xs font-mono text-indigo-700 font-semibold">
            Next-Period Projected: ~{scenarioProjected2020.toLocaleString()} crashes
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
          projectedYear={2020}
          projectedValue={scenarioProjected2020}
          regressionLine={{
            slope: trend.slope,
            intercept: trend.intercept,
            rSquared: trend.rSquared,
          }}
        />
      </div>

      {/* Scenario / Sensitivity Simulator */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Sliders className="w-4 h-4 text-teal-700" />
          <span>Civil Engineering Scenario & Sensitivity Testing</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
          Simulate how highway safety engineering interventions (e.g., speed radar corridor enforcement,
          junction redesigns) or demographic fleet expansion alter the baseline OLS projection:
        </p>

        <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-slate-700">Policy / Corridor Intervention Shift:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                scenarioFactor < 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : scenarioFactor > 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {scenarioFactor > 0 ? `+${scenarioFactor}% (Adverse Fleet Expansion)` : scenarioFactor < 0 ? `${scenarioFactor}% (Safety Intervention Impact)` : '0% (Unchanged OLS Trajectory)'}
            </span>
          </div>

          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={scenarioFactor}
            onChange={(e) => setScenarioFactor(parseInt(e.target.value, 10))}
            className="w-full accent-teal-700 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>-20% (Aggressive Safety Audits & ITS)</span>
            <span>0% Baseline</span>
            <span>+20% (Unmitigated Corridor Traffic Growth)</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              Scenario-Adjusted Next-Period Estimate:{' '}
              <strong className="font-mono text-base text-slate-900 tabular-nums">
                {scenarioProjected2020.toLocaleString()} crashes
              </strong>
            </div>
            <div className="text-slate-500 font-mono">
              Delta from OLS baseline:{' '}
              <strong
                className={
                  scenarioProjected2020 - rawProjected2020 > 0
                    ? 'text-rose-600'
                    : scenarioProjected2020 - rawProjected2020 < 0
                    ? 'text-emerald-700'
                    : 'text-slate-700'
                }
              >
                {scenarioProjected2020 - rawProjected2020 > 0 ? '+' : ''}
                {(scenarioProjected2020 - rawProjected2020).toLocaleString()} crashes
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Model Formulation & Educational Reference */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
          Mathematical Model Specification
        </h4>
        <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
          <div>Formula: y(t) = m · t + c</div>
          <div>
            Slope: m = [n · Σ(t · y) - Σt · Σy] / [n · Σ(t²) - (Σt)²] = {trend.slope.toFixed(3)}
          </div>
          <div>
            Intercept: c = [Σy - m · Σt] / n = {trend.intercept.toFixed(1)}
          </div>
          <div>
            Goodness of Fit: R² = 1 - [Σ(y_i - ŷ_i)² / Σ(y_i - y_mean)²] = {trend.rSquared.toFixed(4)}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
          In civil engineering traffic forecasting, short-horizon OLS models serve as an initial
          screening mechanism to detect whether an arterial road jurisdiction exhibits sustained
          negative momentum or positive collision accumulation prior to detailed micro-simulation
          studies.
        </p>
      </div>
    </div>
  );
};
