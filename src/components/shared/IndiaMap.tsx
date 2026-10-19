import React, { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Info,
  Maximize2,
  Layers,
  Activity,
} from 'lucide-react';
import { StateRecord, PriorityTier } from '../../types/accident';
import { ActivePage } from '../Navbar';

interface IndiaMapProps {
  states: StateRecord[];
  selectedStateName: string;
  onSelectState: (stateName: string) => void;
  setActivePage?: (page: ActivePage) => void;
  colorMetric?: 'priority' | 'accidents' | 'popRate' | 'vehRate' | 'roadDensity';
}

// Normalized grid layout coordinates for Equal-Area Cartogram Tile Map (col 0-10, row 0-10)
// Accurately reflects regional geography: North, Central, West, South, East, Northeast, Islands
const STATE_GRID_COORDS: Record<string, { col: number; row: number; abbr: string; x: number; y: number }> = {
  'Jammu and Kashmir': { col: 3, row: 0, abbr: 'JK', x: 230, y: 75 },
  'Himachal Pradesh': { col: 3, row: 1, abbr: 'HP', x: 250, y: 135 },
  'Punjab': { col: 2, row: 1, abbr: 'PB', x: 200, y: 145 },
  'Chandigarh': { col: 3, row: 2, abbr: 'CH', x: 235, y: 160 },
  'Uttarakhand': { col: 4, row: 1, abbr: 'UK', x: 295, y: 155 },
  'Haryana': { col: 3, row: 3, abbr: 'HR', x: 225, y: 190 },
  'Delhi': { col: 4, row: 2, abbr: 'DL', x: 255, y: 195 },
  'Rajasthan': { col: 1, row: 3, abbr: 'RJ', x: 165, y: 250 },
  'Uttar Pradesh': { col: 4, row: 3, abbr: 'UP', x: 310, y: 245 },
  'Bihar': { col: 5, row: 3, abbr: 'BR', x: 410, y: 260 },
  'Sikkim': { col: 6, row: 2, abbr: 'SK', x: 445, y: 205 },
  'West Bengal': { col: 6, row: 4, abbr: 'WB', x: 440, y: 330 },
  'Assam': { col: 8, row: 3, abbr: 'AS', x: 520, y: 245 },
  'Arunachal Pradesh': { col: 9, row: 2, abbr: 'AR', x: 565, y: 195 },
  'Nagaland': { col: 9, row: 3, abbr: 'NL', x: 565, y: 250 },
  'Manipur': { col: 9, row: 4, abbr: 'MN', x: 560, y: 290 },
  'Mizoram': { col: 9, row: 5, abbr: 'MZ', x: 545, y: 340 },
  'Tripura': { col: 8, row: 5, abbr: 'TR', x: 505, y: 325 },
  'Meghalaya': { col: 7, row: 3, abbr: 'ML', x: 495, y: 275 },
  'Gujarat': { col: 0, row: 4, abbr: 'GJ', x: 125, y: 325 },
  'Madhya Pradesh': { col: 3, row: 4, abbr: 'MP', x: 265, y: 325 },
  'Chhattisgarh': { col: 4, row: 4, abbr: 'CG', x: 355, y: 355 },
  'Jharkhand': { col: 5, row: 4, abbr: 'JH', x: 405, y: 320 },
  'Odisha': { col: 5, row: 5, abbr: 'OD', x: 410, y: 395 },
  'Maharashtra': { col: 2, row: 5, abbr: 'MH', x: 215, y: 405 },
  'Telangana': { col: 3, row: 6, abbr: 'TG', x: 285, y: 440 },
  'Andhra Pradesh': { col: 4, row: 7, abbr: 'AP', x: 310, y: 500 },
  'Karnataka': { col: 2, row: 7, abbr: 'KA', x: 220, y: 510 },
  'Goa': { col: 1, row: 6, abbr: 'GA', x: 175, y: 485 },
  'Kerala': { col: 2, row: 9, abbr: 'KL', x: 230, y: 615 },
  'Tamil Nadu': { col: 3, row: 9, abbr: 'TN', x: 280, y: 605 },
  'Puducherry': { col: 4, row: 8, abbr: 'PY', x: 315, y: 565 },
  'Dadra and Nagar Haveli': { col: 1, row: 5, abbr: 'DN', x: 155, y: 390 },
  'Daman and Diu': { col: 0, row: 5, abbr: 'DD', x: 135, y: 370 },
  'Lakshadweep': { col: 1, row: 9, abbr: 'LD', x: 150, y: 620 },
  'Andaman and Nicobar Islands': { col: 8, row: 8, abbr: 'AN', x: 550, y: 560 },
};

// Simplified Geographic Shape Paths for Indian States & UTs (Calibrated on 620x720 canvas)
const STATE_GEO_PATHS: Record<string, string> = {
  'Jammu and Kashmir': 'M 195,50 L 255,45 L 280,85 L 260,120 L 225,125 L 180,95 Z',
  'Himachal Pradesh': 'M 225,125 L 260,120 L 275,145 L 250,170 L 220,150 Z',
  'Punjab': 'M 180,125 L 225,125 L 220,175 L 175,170 Z',
  'Uttarakhand': 'M 260,135 L 305,145 L 300,185 L 255,175 Z',
  'Haryana': 'M 205,170 L 245,170 L 250,215 L 210,210 Z',
  'Delhi': 'M 235,190 L 250,190 L 250,205 L 235,205 Z',
  'Rajasthan': 'M 130,195 L 205,175 L 230,225 L 205,300 L 140,285 L 120,240 Z',
  'Uttar Pradesh': 'M 245,175 L 300,180 L 370,225 L 360,285 L 285,275 L 240,230 Z',
  'Bihar': 'M 365,230 L 435,240 L 430,285 L 365,280 Z',
  'Sikkim': 'M 435,195 L 455,195 L 455,215 L 435,215 Z',
  'West Bengal': 'M 425,235 L 450,235 L 435,355 L 405,335 L 420,290 Z',
  'Assam': 'M 465,225 L 535,225 L 555,260 L 515,270 L 465,260 Z',
  'Arunachal Pradesh': 'M 505,175 L 590,185 L 585,225 L 525,220 Z',
  'Nagaland': 'M 550,225 L 580,235 L 575,270 L 545,260 Z',
  'Manipur': 'M 545,265 L 575,270 L 570,310 L 540,305 Z',
  'Mizoram': 'M 530,310 L 560,310 L 555,365 L 525,355 Z',
  'Tripura': 'M 495,310 L 525,310 L 520,345 L 490,340 Z',
  'Meghalaya': 'M 470,260 L 520,260 L 515,285 L 465,285 Z',
  'Gujarat': 'M 85,290 L 165,285 L 180,360 L 120,380 L 75,340 Z',
  'Madhya Pradesh': 'M 195,290 L 285,275 L 340,305 L 325,370 L 225,370 L 180,340 Z',
  'Chhattisgarh': 'M 320,305 L 360,310 L 370,410 L 320,415 L 305,365 Z',
  'Jharkhand': 'M 365,285 L 430,285 L 425,340 L 365,335 Z',
  'Odisha': 'M 355,335 L 440,345 L 420,430 L 360,420 Z',
  'Maharashtra': 'M 155,365 L 260,365 L 290,440 L 210,470 L 160,420 Z',
  'Telangana': 'M 255,405 L 315,405 L 320,465 L 255,460 Z',
  'Goa': 'M 175,475 L 195,475 L 190,500 L 170,500 Z',
  'Karnataka': 'M 190,465 L 255,465 L 275,555 L 205,565 L 175,510 Z',
  'Andhra Pradesh': 'M 285,445 L 350,445 L 335,550 L 275,540 Z',
  'Kerala': 'M 210,565 L 240,565 L 250,655 L 215,650 Z',
  'Tamil Nadu': 'M 245,550 L 315,550 L 295,665 L 245,660 Z',
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  states,
  selectedStateName,
  onSelectState,
  setActivePage,
  colorMetric = 'priority',
}) => {
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'geo' | 'grid'>('geo');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Map of state records by lowercase name
  const stateMap = useMemo(() => {
    const map = new Map<string, StateRecord>();
    states.forEach((s) => map.set(s.state.toLowerCase(), s));
    return map;
  }, [states]);

  const activeRecord = useMemo(() => {
    const targetName = hoveredStateName || selectedStateName;
    return states.find((s) => s.state.toLowerCase() === targetName.toLowerCase()) || states[0];
  }, [states, hoveredStateName, selectedStateName]);

  // Color generator based on metric
  const getStateColor = (record: StateRecord | undefined) => {
    if (!record) return '#cbd5e1';

    if (colorMetric === 'priority') {
      const score = record.priority.score;
      if (score >= 55) return '#f43f5e'; // rose-500 (High)
      if (score >= 35) return '#f59e0b'; // amber-500 (Medium)
      return '#10b981'; // emerald-500 (Low)
    }

    if (colorMetric === 'accidents') {
      // Scale by count
      const count = record.accidents2019;
      if (count > 40000) return '#be123c'; // rose-700
      if (count > 20000) return '#f43f5e'; // rose-500
      if (count > 10000) return '#f59e0b'; // amber-500
      if (count > 3000) return '#0284c7'; // sky-600
      return '#0d9488'; // teal-600
    }

    if (colorMetric === 'popRate') {
      const rate = record.ratePerLakhPop2019;
      if (rate === null) return '#94a3b8'; // grey for NA
      if (rate > 70) return '#be123c';
      if (rate > 35) return '#f59e0b';
      return '#10b981';
    }

    if (colorMetric === 'vehRate') {
      const rate = record.ratePer10kVehicles2019;
      if (rate === null) return '#94a3b8';
      if (rate > 25) return '#be123c';
      if (rate > 15) return '#f59e0b';
      return '#10b981';
    }

    if (colorMetric === 'roadDensity') {
      const dens = record.densityPer10kKmRoads2018P;
      if (dens === null) return '#94a3b8';
      if (dens > 1500) return '#be123c';
      if (dens > 800) return '#f59e0b';
      return '#10b981';
    }

    return '#0d9488';
  };

  const handleStateClick = (stateName: string) => {
    onSelectState(stateName);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Interactive National Priority & Hazard Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hover or click any State or Union Territory to inspect exposure metrics and priority
            classifications.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setMapMode('geo')}
            className={`px-3 py-1.5 rounded transition-all ${
              mapMode === 'geo'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Geographic Map
          </button>
          <button
            onClick={() => setMapMode('grid')}
            className={`px-3 py-1.5 rounded transition-all ${
              mapMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Equal-Area Tile Map
          </button>
        </div>
      </div>

      {/* Main Map & Live Detail Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map Canvas (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center relative select-none">
          {mapMode === 'geo' ? (
            /* Geographic SVG Map */
            <div className="w-full relative max-w-[560px]">
              <svg
                viewBox="0 0 620 720"
                className="w-full h-auto drop-shadow-sm transition-all"
                onMouseLeave={() => {
                  setHoveredStateName(null);
                  setTooltipPos(null);
                }}
              >
                {/* Background water/canvas hint */}
                <rect width="620" height="720" fill="#f8fafc" rx="16" />

                {/* State Polygons/Paths */}
                {Object.entries(STATE_GEO_PATHS).map(([name, pathD]) => {
                  const record = stateMap.get(name.toLowerCase());
                  const isSelected = selectedStateName.toLowerCase() === name.toLowerCase();
                  const isHovered = hoveredStateName?.toLowerCase() === name.toLowerCase();
                  const fillColor = getStateColor(record);

                  return (
                    <path
                      key={name}
                      d={pathD}
                      fill={fillColor}
                      stroke={isSelected ? '#0f172a' : isHovered ? '#0f172a' : '#ffffff'}
                      strokeWidth={isSelected ? '3' : isHovered ? '2' : '1.2'}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-all duration-150 hover:brightness-110"
                      onClick={() => handleStateClick(name)}
                      onMouseEnter={(e) => {
                        setHoveredStateName(name);
                      }}
                    >
                      <title>{name}</title>
                    </path>
                  );
                })}

                {/* State Label Annotations for major regions */}
                {Object.entries(STATE_GRID_COORDS).map(([name, data]) => {
                  if (data.y > 680 || !STATE_GEO_PATHS[name]) return null;
                  return (
                    <text
                      key={name}
                      x={data.x}
                      y={data.y}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-bold fill-white drop-shadow-md pointer-events-none select-none"
                    >
                      {data.abbr}
                    </text>
                  );
                })}

                {/* Specialized Interactive Callout Nodes for Union Territories & Enclaves */}
                <g className="cursor-pointer">
                  {[
                    { name: 'Delhi', cx: 255, cy: 195 },
                    { name: 'Chandigarh', cx: 220, cy: 160 },
                    { name: 'Puducherry', cx: 335, cy: 560 },
                    { name: 'Goa', cx: 185, cy: 490 },
                    { name: 'Dadra and Nagar Haveli', cx: 150, cy: 385 },
                    { name: 'Daman and Diu', cx: 130, cy: 375 },
                    { name: 'Andaman and Nicobar Islands', cx: 550, cy: 560 },
                    { name: 'Lakshadweep', cx: 150, cy: 620 },
                  ].map((node) => {
                    const record = stateMap.get(node.name.toLowerCase());
                    const isSelected = selectedStateName.toLowerCase() === node.name.toLowerCase();
                    const isHovered = hoveredStateName?.toLowerCase() === node.name.toLowerCase();
                    const fillColor = getStateColor(record);

                    return (
                      <g
                        key={node.name}
                        onClick={() => handleStateClick(node.name)}
                        onMouseEnter={() => setHoveredStateName(node.name)}
                        className="group"
                      >
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={isSelected ? 8 : isHovered ? 7 : 5.5}
                          fill={fillColor}
                          stroke={isSelected ? '#0f172a' : '#ffffff'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                        />
                        <text
                          x={node.cx}
                          y={node.cy + 13}
                          textAnchor="middle"
                          className="text-[8px] font-mono font-bold fill-slate-700 bg-white"
                        >
                          {STATE_GRID_COORDS[node.name]?.abbr ?? ''}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          ) : (
            /* Equal-Area Cartogram Grid Map */
            <div className="w-full max-w-lg bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-mono text-center mb-3">
                Equal-Area Grid Representation (Every State & UT has uniform clickable presence)
              </div>
              <div className="grid grid-cols-10 gap-1.5 auto-rows-fr">
                {states.map((st) => {
                  const coords = STATE_GRID_COORDS[st.state] || { abbr: st.state.slice(0, 2) };
                  const isSelected = selectedStateName.toLowerCase() === st.state.toLowerCase();
                  const isHovered = hoveredStateName?.toLowerCase() === st.state.toLowerCase();
                  const fillColor = getStateColor(st);

                  return (
                    <button
                      key={st.state}
                      onClick={() => handleStateClick(st.state)}
                      onMouseEnter={() => setHoveredStateName(st.state)}
                      onMouseLeave={() => setHoveredStateName(null)}
                      style={{ backgroundColor: fillColor }}
                      className={`h-11 rounded-lg text-white font-mono flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-slate-900 scale-105 shadow-md z-10'
                          : isHovered
                          ? 'scale-105 shadow z-10'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                      title={`${st.state}: Score ${st.priority.score.toFixed(1)}`}
                    >
                      <span className="text-xs font-bold leading-none">{coords.abbr}</span>
                      <span className="text-[9px] opacity-80 leading-none mt-0.5">
                        {st.priority.score.toFixed(0)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Legend Bar */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>High Priority (&ge; 55)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Medium Priority (30–54.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Low Priority (&lt; 30)</span>
              </div>
            </div>
            <span className="text-slate-400">Total: 36 Jurisdictions</span>
          </div>
        </div>

        {/* Selected / Hovered State Snapshot Card (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-teal-800 font-mono uppercase font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>{activeRecord.isUT ? 'Union Territory' : 'Indian State'}</span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {activeRecord.state}
                </h4>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  2019 National Rank: <strong className="text-slate-800">#{activeRecord.rank2019 ?? 'NA'}</strong> · National Share: {activeRecord.share2019.toFixed(2)}%
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded inline-block ${
                    activeRecord.priority.tier === 'HIGH PRIORITY'
                      ? 'bg-rose-100 text-rose-800'
                      : activeRecord.priority.tier === 'MEDIUM PRIORITY'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeRecord.priority.tier}
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {activeRecord.priority.score.toFixed(1)}
                  <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400">Total Crashes (2019)</span>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {activeRecord.accidents2019.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400">4-Year Trend (16–19)</span>
                <div
                  className={`text-base font-bold tabular-nums ${
                    activeRecord.change2016to2019Pct > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {activeRecord.change2016to2019Pct > 0 ? '+' : ''}
                  {activeRecord.change2016to2019Pct.toFixed(1)}%
                </div>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400">Per Lakh Population</span>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {activeRecord.ratePerLakhPop2019 !== null
                    ? activeRecord.ratePerLakhPop2019.toFixed(1)
                    : 'NA'}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400">Per 10k Vehicles</span>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {activeRecord.ratePer10kVehicles2019 !== null
                    ? activeRecord.ratePer10kVehicles2019.toFixed(1)
                    : 'NA'}
                </div>
              </div>
            </div>

            {/* Road Density */}
            <div className="p-2.5 bg-white rounded border border-slate-200 text-xs font-mono flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Route Density (Per 10k km):</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {activeRecord.densityPer10kKmRoads2018P !== null
                  ? `${activeRecord.densityPer10kKmRoads2018P.toFixed(1)} crashes`
                  : 'NA'}
              </span>
            </div>

            {/* Primary Justification Reason */}
            <div className="p-3 bg-white rounded border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                Primary Priority Driver:
              </span>
              <p className="text-slate-700 leading-snug">
                {activeRecord.priority.reasons[0] || 'Standard baseline exposure.'}
              </p>
            </div>

            {/* Quick Action Navigation */}
            {setActivePage && (
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectState(activeRecord.state);
                    setActivePage('analyzer');
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open State Analyzer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onSelectState(activeRecord.state);
                    setActivePage('recommendations');
                  }}
                  className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                  title="View Interventions"
                >
                  Interventions
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-center">
            Click any polygon or circle node on the map to anchor selection
          </div>
        </div>
      </div>
    </div>
  );
};
