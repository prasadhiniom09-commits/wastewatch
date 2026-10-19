import React, { useState } from 'react';

interface BarDataPoint {
  label: string;
  value: number | null;
  secondaryValue?: number | null;
  highlight?: boolean;
  tooltipExtra?: string;
}

interface HorizontalBarChartProps {
  data: BarDataPoint[];
  unit: string;
  referenceLine?: { value: number; label: string };
  maxBars?: number;
  height?: number;
  color?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  unit,
  referenceLine,
  maxBars = 15,
  height,
  color = '#0d9488', // teal-600
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const displayData = data.slice(0, maxBars);
  const numericValues = displayData
    .map((d) => d.value)
    .filter((v): v is number => v !== null && !isNaN(v));

  const maxVal = Math.max(
    ...numericValues,
    referenceLine ? referenceLine.value * 1.05 : 1,
    1
  );

  const calculatedHeight = height || Math.max(300, displayData.length * 36 + 40);

  return (
    <div className="w-full relative select-none">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
        <span>State / UT</span>
        <span>
          Scale: 0 — {maxVal.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit}
        </span>
      </div>

      <div className="space-y-2">
        {displayData.map((item, idx) => {
          const val = item.value;
          const pct = val !== null ? Math.min(100, Math.max(0, (val / maxVal) * 100)) : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              className="group relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center text-xs mb-1">
                <span
                  className={`w-44 truncate text-left font-medium ${
                    item.highlight ? 'text-teal-900 font-semibold' : 'text-slate-700'
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>

                <div className="flex-1 mx-3 h-5 bg-slate-100 rounded overflow-hidden relative">
                  {/* Reference line tick if applicable */}
                  {referenceLine && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
                      style={{
                        left: `${Math.min(100, (referenceLine.value / maxVal) * 100)}%`,
                      }}
                      title={`${referenceLine.label}: ${referenceLine.value.toFixed(1)}`}
                    />
                  )}

                  {val !== null ? (
                    <div
                      className="h-full transition-all duration-300 rounded"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.highlight ? '#0f766e' : color,
                        opacity: isHovered ? 1 : 0.85,
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center px-2 text-[10px] text-slate-400 italic font-mono">
                      Data Not Reported
                    </div>
                  )}
                </div>

                <span className="w-24 text-right font-mono text-slate-900 tabular-nums">
                  {val !== null
                    ? val > 999
                      ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : val.toFixed(1)
                    : 'N/A'}
                </span>
              </div>

              {isHovered && item.tooltipExtra && (
                <div className="absolute z-20 left-48 -top-8 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap">
                  {item.tooltipExtra}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {referenceLine && (
        <div className="mt-3 pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-block w-3 h-0.5 bg-rose-500" />
          <span>
            {referenceLine.label}:{' '}
            <strong className="font-mono tabular-nums text-slate-900">
              {referenceLine.value.toFixed(1)} {unit}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};

interface TrendChartProps {
  years: number[];
  values: (number | null)[];
  title?: string;
  unit: string;
  projectedYear?: number;
  projectedValue?: number;
  regressionLine?: { slope: number; intercept: number; rSquared: number };
  nationalValues?: (number | null)[];
}

export const TrendLineChart: React.FC<TrendChartProps> = ({
  years,
  values,
  unit,
  projectedYear,
  projectedValue,
  regressionLine,
  nationalValues,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter valid numbers
  const allY: number[] = [
    ...values.filter((v): v is number => v !== null),
    ...(projectedValue !== undefined && projectedValue !== null ? [projectedValue] : []),
  ];

  if (allY.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400 italic">
        Data points not available for trend analysis
      </div>
    );
  }

  const minY = Math.min(...allY) * 0.9;
  const maxY = Math.max(...allY) * 1.1;
  const rangeY = maxY - minY || 1;

  const width = 640;
  const height = 280;
  const padLeft = 70;
  const padRight = 50;
  const padTop = 30;
  const padBottom = 40;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allYears = projectedYear ? [...years, projectedYear] : years;
  const totalXPoints = allYears.length;

  const getX = (idx: number) => padLeft + (idx / (totalXPoints - 1 || 1)) * plotW;
  const getY = (val: number) => padTop + plotH - ((val - minY) / rangeY) * plotH;

  // Actual observation line points
  const points = values
    .map((v, i) => (v !== null ? { x: getX(i), y: getY(v), val: v, year: years[i] } : null))
    .filter((p): p is { x: number; y: number; val: number; year: number } => p !== null);

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Regression trend line points
  let trendPolylineStr = '';
  if (regressionLine) {
    const trendPts = allYears.map((_, i) => {
      // regression line was fitted on x=0, 1, 2, 3
      const fittedY = regressionLine.slope * i + regressionLine.intercept;
      return `${getX(i)},${getY(fittedY)}`;
    });
    trendPolylineStr = trendPts.join(' ');
  }

  // Projection point coordinates
  const projPoint =
    projectedYear !== undefined && projectedValue !== undefined
      ? {
          x: getX(allYears.length - 1),
          y: getY(projectedValue),
          val: projectedValue,
          year: projectedYear,
        }
      : null;

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full font-sans">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
            const val = minY + step * rangeY;
            const yPos = padTop + plotH - step * plotH;
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={width - padRight}
                  y2={yPos}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono"
                >
                  {val >= 1000
                    ? `${(val / 1000).toFixed(1)}k`
                    : val.toFixed(val > 10 ? 0 : 1)}
                </text>
              </g>
            );
          })}

          {/* X Axis */}
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={width - padRight}
            y2={padTop + plotH}
            stroke="#cbd5e1"
          />

          {/* X-axis year labels */}
          {allYears.map((yr, idx) => (
            <text
              key={yr}
              x={getX(idx)}
              y={height - 12}
              textAnchor="middle"
              className={`text-xs font-mono ${
                yr === projectedYear ? 'fill-indigo-600 font-semibold' : 'fill-slate-600'
              }`}
            >
              {yr}
              {yr === projectedYear ? ' (Est.)' : ''}
            </text>
          ))}

          {/* OLS Fitted Regression Line */}
          {trendPolylineStr && (
            <polyline
              points={trendPolylineStr}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Actual Observation Line */}
          {polylineStr && (
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Actual Observation Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 6 : 4.5}
                fill="#ffffff"
                stroke="#0f766e"
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="text-[11px] font-mono font-semibold fill-slate-800"
              >
                {pt.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Projected Estimate Point */}
          {projPoint && (
            <g>
              <line
                x1={points[points.length - 1]?.x ?? projPoint.x}
                y1={points[points.length - 1]?.y ?? projPoint.y}
                x2={projPoint.x}
                y2={projPoint.y}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={projPoint.x}
                cy={projPoint.y}
                r="6"
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={projPoint.x}
                y={projPoint.y - 12}
                textAnchor="middle"
                className="text-[11px] font-mono font-bold fill-indigo-700"
              >
                ~{projPoint.val.toLocaleString()}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-2 px-2 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-600 rounded" />
            <span>Reported Government Data</span>
          </div>
          {regressionLine && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-indigo-500 border-dashed" />
              <span>OLS Trendline (R² = {regressionLine.rSquared.toFixed(3)})</span>
            </div>
          )}
          {projectedValue !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Trend Estimate</span>
            </div>
          )}
        </div>
        <span>Unit: {unit}</span>
      </div>
    </div>
  );
};

interface GroupedBarItem {
  name: string;
  values: number[]; // e.g. for each state
}

interface GroupedBarChartProps {
  categories: string[]; // State names
  metrics: { label: string; values: (number | null)[]; unit: string };
  colors?: string[];
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  categories,
  metrics,
  colors = ['#0d9488', '#0284c7', '#d97706', '#6366f1', '#ec4899'],
}) => {
  const validVals = metrics.values.filter((v): v is number => v !== null);
  const maxVal = Math.max(...validVals, 1);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
        <span>{metrics.label}</span>
        <span>Unit: {metrics.unit}</span>
      </div>

      <div className="space-y-2.5">
        {categories.map((cat, idx) => {
          const val = metrics.values[idx];
          const pct = val !== null ? Math.min(100, Math.max(0, (val / maxVal) * 100)) : 0;
          const color = colors[idx % colors.length];

          return (
            <div key={cat} className="flex items-center text-xs">
              <span className="w-40 truncate text-slate-800 font-medium" title={cat}>
                {cat}
              </span>
              <div className="flex-1 mx-3 h-6 bg-slate-100 rounded overflow-hidden relative">
                {val !== null ? (
                  <div
                    className="h-full rounded transition-all duration-300 flex items-center justify-end px-2"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  >
                    {pct > 15 && (
                      <span className="text-[11px] font-mono text-white font-medium drop-shadow-sm tabular-nums">
                        {val > 999
                          ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
                          : val.toFixed(1)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center px-2 text-[10px] text-slate-400 italic font-mono">
                    Data Not Reported (NA)
                  </div>
                )}
              </div>
              <span className="w-24 text-right font-mono text-slate-900 tabular-nums">
                {val !== null
                  ? `${val > 999 ? val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : val.toFixed(1)}`
                  : 'N/A'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
