import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Layers,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { StateRecord, PriorityTier } from '../types/accident';
import { ActivePage } from './Navbar';

export type TableMetricView = 'overview' | 'historical' | 'normalized' | 'spatial';

interface DashboardDataTableProps {
  states: StateRecord[];
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

export const DashboardDataTable: React.FC<DashboardDataTableProps> = ({
  states,
  nationalAverages,
  onSelectState,
  setActivePage,
  selectedStateName,
}) => {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'states' | 'uts'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | PriorityTier>('all');
  const [metricView, setMetricView] = useState<TableMetricView>('overview');
  const [sortField, setSortField] = useState<string>('rank2019');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filter states based on search, region, and tier
  const filteredData = useMemo(() => {
    let result = states.filter((s) => {
      // Search
      const matchesSearch = s.state.toLowerCase().includes(search.trim().toLowerCase());
      // Region
      const matchesRegion =
        regionFilter === 'all' ? true : regionFilter === 'states' ? !s.isUT : s.isUT;
      // Tier
      const matchesTier = tierFilter === 'all' ? true : s.priority.tier === tierFilter;

      return matchesSearch && matchesRegion && matchesTier;
    });

    // Sort
    result.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      // Nested or custom sort fields
      if (sortField === 'priorityScore') {
        valA = a.priority.score;
        valB = b.priority.score;
      } else if (sortField === 'slope') {
        valA = a.trend.slope;
        valB = b.trend.slope;
      }

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [states, search, regionFilter, tierFilter, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // default ascending for rank & state, descending for counts and rates
      if (field === 'rank2019' || field === 'state') {
        setSortAsc(true);
      } else {
        setSortAsc(false);
      }
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-teal-700 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-700 font-bold" />
    );
  };

  // Export Filtered View to CSV
  const handleExportFilteredCsv = () => {
    if (filteredData.length === 0) return;

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (metricView === 'overview') {
      headers = [
        'Rank (2019)',
        'State/UT',
        'Type',
        'Accidents (2019)',
        'Share (%)',
        'Per Lakh Population (2019)',
        'Per 10,000 Vehicles (2019)',
        'Per 10,000 km Roads (2018P)',
        '4-Year Change (%)',
        'Priority Score (0-100)',
        'Priority Tier',
      ];
      rows = filteredData.map((s) => [
        s.rank2019 ?? 'NA',
        `"${s.state}"`,
        s.isUT ? 'Union Territory' : 'State',
        s.accidents2019,
        s.share2019.toFixed(2),
        s.ratePerLakhPop2019 !== null ? s.ratePerLakhPop2019.toFixed(2) : 'NA',
        s.ratePer10kVehicles2019 !== null ? s.ratePer10kVehicles2019.toFixed(2) : 'NA',
        s.densityPer10kKmRoads2018P !== null ? s.densityPer10kKmRoads2018P.toFixed(2) : 'NA',
        s.change2016to2019Pct.toFixed(2),
        s.priority.score.toFixed(1),
        s.priority.tier,
      ]);
    } else if (metricView === 'historical') {
      headers = [
        'Rank (2019)',
        'State/UT',
        'Accidents (2016)',
        'Accidents (2017)',
        'Accidents (2018)',
        'Accidents (2019)',
        'Net Delta (2016-19)',
        '4-Year % Change',
        'OLS Slope (crashes/yr)',
        'OLS R-Squared',
      ];
      rows = filteredData.map((s) => [
        s.rank2019 ?? 'NA',
        `"${s.state}"`,
        s.accidents2016,
        s.accidents2017,
        s.accidents2018,
        s.accidents2019,
        s.accidents2019 - s.accidents2016,
        s.change2016to2019Pct.toFixed(2),
        s.trend.slope.toFixed(2),
        s.trend.rSquared.toFixed(4),
      ]);
    } else if (metricView === 'normalized') {
      headers = [
        'State/UT',
        'Pop Rate 2016',
        'Pop Rate 2017',
        'Pop Rate 2018',
        'Pop Rate 2019',
        'Veh Rate 2016',
        'Veh Rate 2017',
        'Veh Rate 2018',
        'Veh Rate 2019',
      ];
      rows = filteredData.map((s) => [
        `"${s.state}"`,
        s.ratePerLakhPop2016 ?? 'NA',
        s.ratePerLakhPop2017 ?? 'NA',
        s.ratePerLakhPop2018 ?? 'NA',
        s.ratePerLakhPop2019 ?? 'NA',
        s.ratePer10kVehicles2016 ?? 'NA',
        s.ratePer10kVehicles2017 ?? 'NA',
        s.ratePer10kVehicles2018 ?? 'NA',
        s.ratePer10kVehicles2019 ?? 'NA',
      ]);
    } else {
      headers = [
        'State/UT',
        'Road Density 2016',
        'Road Density 2017',
        'Road Density 2018(P)',
        'Priority Score',
        'Priority Tier',
        'Primary Justification',
      ];
      rows = filteredData.map((s) => [
        `"${s.state}"`,
        s.densityPer10kKmRoads2016 ?? 'NA',
        s.densityPer10kKmRoads2017 ?? 'NA',
        s.densityPer10kKmRoads2018P ?? 'NA',
        s.priority.score.toFixed(1),
        s.priority.tier,
        `"${(s.priority.reasons[0] || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `MoRTH_Filtered_${metricView}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Aggregated totals for the current filtered rows
  const filteredStats = useMemo(() => {
    const totalCrashes2019 = filteredData.reduce((acc, s) => acc + s.accidents2019, 0);
    const validPopRates = filteredData
      .map((s) => s.ratePerLakhPop2019)
      .filter((v): v is number => v !== null);
    const avgPopRate =
      validPopRates.length > 0
        ? validPopRates.reduce((a, b) => a + b, 0) / validPopRates.length
        : 0;

    const validVehRates = filteredData
      .map((s) => s.ratePer10kVehicles2019)
      .filter((v): v is number => v !== null);
    const avgVehRate =
      validVehRates.length > 0
        ? validVehRates.reduce((a, b) => a + b, 0) / validVehRates.length
        : 0;

    return {
      count: filteredData.length,
      totalCrashes2019,
      avgPopRate,
      avgVehRate,
    };
  }, [filteredData]);

  const resetFilters = () => {
    setSearch('');
    setRegionFilter('all');
    setTierFilter('all');
    setMetricView('overview');
    setSortField('rank2019');
    setSortAsc(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100/80 shadow-xs p-6 space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              State & UT Road Safety Data Registry
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sortable, filterable repository covering all 36 Indian jurisdictions. Toggle metrics and
            export active selections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {(search || regionFilter !== 'all' || tierFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleExportFilteredCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            title="Download CSV containing current filtered rows and selected metrics"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered CSV ({filteredData.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Metric Toggle Controls Bar */}
      <div className="space-y-4">
        {/* Metric View Tabs (Toggle between different metric columns) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setMetricView('overview')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                metricView === 'overview'
                  ? 'bg-white text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2019 Overview
            </button>
            <button
              onClick={() => setMetricView('historical')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                metricView === 'historical'
                  ? 'bg-white text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4-Year Counts (16–19)
            </button>
            <button
              onClick={() => setMetricView('normalized')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                metricView === 'normalized'
                  ? 'bg-white text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normalized Exposure Rates
            </button>
            <button
              onClick={() => setMetricView('spatial')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                metricView === 'spatial'
                  ? 'bg-white text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Route Density & Priority
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Active View: <strong className="text-slate-900 font-semibold">{filteredData.length}</strong> of {states.length} records
          </div>
        </div>

        {/* Search, Region, and Tier Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input (5 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by state or UT name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-sans"
            />
          </div>

          {/* Region Filter (4 cols) */}
          <div className="sm:col-span-4 flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setRegionFilter('all')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                regionFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (36)
            </button>
            <button
              onClick={() => setRegionFilter('states')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                regionFilter === 'states'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              States (29)
            </button>
            <button
              onClick={() => setRegionFilter('uts')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                regionFilter === 'uts'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              UTs (7)
            </button>
          </div>

          {/* Priority Tier Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800"
            >
              <option value="all">All Priority Tiers</option>
              <option value="HIGH PRIORITY">High Priority (Score &ge; 55)</option>
              <option value="MEDIUM PRIORITY">Medium Priority (30–54.9)</option>
              <option value="LOW PRIORITY">Low Priority (&lt; 30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-teal-50/50 text-slate-700 font-mono text-[11px] select-none">
              {/* Common Columns */}
              <th
                onClick={() => handleSort('rank2019')}
                className="py-3 px-3.5 font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
              >
                <div className="flex items-center gap-1">
                  <span>Rank '19</span>
                  {getSortIcon('rank2019')}
                </div>
              </th>

              <th
                onClick={() => handleSort('state')}
                className="py-3 px-3.5 font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
              >
                <div className="flex items-center gap-1">
                  <span>State / Union Territory</span>
                  {getSortIcon('state')}
                </div>
              </th>

              {/* View 1: Overview Columns */}
              {metricView === 'overview' && (
                <>
                  <th
                    onClick={() => handleSort('accidents2019')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Accidents (2019)</span>
                      {getSortIcon('accidents2019')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('share2019')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>% Share</span>
                      {getSortIcon('share2019')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ratePerLakhPop2019')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Per Lakh Pop</span>
                      {getSortIcon('ratePerLakhPop2019')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ratePer10kVehicles2019')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Per 10k Veh</span>
                      {getSortIcon('ratePer10kVehicles2019')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('densityPer10kKmRoads2018P')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Per 10k km Road</span>
                      {getSortIcon('densityPer10kKmRoads2018P')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('change2016to2019Pct')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>4-Yr Trend</span>
                      {getSortIcon('change2016to2019Pct')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('priorityScore')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Priority Score</span>
                      {getSortIcon('priorityScore')}
                    </div>
                  </th>
                </>
              )}

              {/* View 2: Historical Counts Columns */}
              {metricView === 'historical' && (
                <>
                  <th
                    onClick={() => handleSort('accidents2016')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>2016</span>
                      {getSortIcon('accidents2016')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('accidents2017')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>2017</span>
                      {getSortIcon('accidents2017')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('accidents2018')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>2018</span>
                      {getSortIcon('accidents2018')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('accidents2019')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>2019</span>
                      {getSortIcon('accidents2019')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('change2016to2019Pct')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>4-Yr Delta (%)</span>
                      {getSortIcon('change2016to2019Pct')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('slope')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>OLS Slope (Δy/yr)</span>
                      {getSortIcon('slope')}
                    </div>
                  </th>
                </>
              )}

              {/* View 3: Normalized Exposure Rates Columns */}
              {metricView === 'normalized' && (
                <>
                  <th className="py-3 px-2 text-right font-bold whitespace-nowrap">Pop '16</th>
                  <th className="py-3 px-2 text-right font-bold whitespace-nowrap">Pop '17</th>
                  <th className="py-3 px-2 text-right font-bold whitespace-nowrap">Pop '18</th>
                  <th
                    onClick={() => handleSort('ratePerLakhPop2019')}
                    className="py-3 px-2.5 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group bg-teal-100/30"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Pop '19</span>
                      {getSortIcon('ratePerLakhPop2019')}
                    </div>
                  </th>
                  <th className="py-3 px-2 text-right font-bold whitespace-nowrap">Veh '16</th>
                  <th className="py-3 px-2 text-right font-bold whitespace-nowrap">Veh '17</th>
                  <th className="py-3 px-2 text-right font-bold whitespace-nowrap">Veh '18</th>
                  <th
                    onClick={() => handleSort('ratePer10kVehicles2019')}
                    className="py-3 px-2.5 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group bg-teal-100/30"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Veh '19</span>
                      {getSortIcon('ratePer10kVehicles2019')}
                    </div>
                  </th>
                </>
              )}

              {/* View 4: Spatial Density & Hazard Columns */}
              {metricView === 'spatial' && (
                <>
                  <th className="py-3 px-2.5 text-right font-bold whitespace-nowrap">Road '16</th>
                  <th className="py-3 px-2.5 text-right font-bold whitespace-nowrap">Road '17</th>
                  <th
                    onClick={() => handleSort('densityPer10kKmRoads2018P')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group bg-teal-100/30"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Road '18(P)</span>
                      {getSortIcon('densityPer10kKmRoads2018P')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('priorityScore')}
                    className="py-3 px-3 text-right font-bold cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Priority Score</span>
                      {getSortIcon('priorityScore')}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-left font-bold whitespace-nowrap font-sans">
                    Hazard Classification
                  </th>
                </>
              )}

              <th className="py-3 px-3.5 text-right font-sans font-bold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredData.length > 0 ? (
              filteredData.map((s) => {
                const isSelected =
                  selectedStateName &&
                  selectedStateName.toLowerCase() === s.state.toLowerCase();
                const isHigh = s.priority.tier === 'HIGH PRIORITY';
                const isMed = s.priority.tier === 'MEDIUM PRIORITY';

                return (
                  <tr
                    key={s.state}
                    className={`transition-colors group cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 font-medium'
                        : 'hover:bg-slate-50/80 even:bg-slate-50/30'
                    }`}
                    onClick={() => {
                      onSelectState(s.state);
                      setActivePage('analyzer');
                    }}
                  >
                    {/* Rank */}
                    <td className="py-2.5 px-3.5 text-slate-500 font-semibold tabular-nums">
                      {s.rank2019 !== null ? `#${s.rank2019}` : '—'}
                    </td>

                    {/* State Name */}
                    <td className="py-2.5 px-3.5 font-sans font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-teal-700 transition-colors">
                          {s.state}
                        </span>
                        {s.isUT && (
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                            UT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Metric View 1: Overview */}
                    {metricView === 'overview' && (
                      <>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {s.accidents2019.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                          {s.share2019.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {s.ratePerLakhPop2019 !== null ? (
                            <span
                              className={
                                s.ratePerLakhPop2019 > nationalAverages.popRate2019
                                  ? 'text-rose-700 font-bold'
                                  : 'text-slate-700'
                              }
                            >
                              {s.ratePerLakhPop2019.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px] font-sans">NA</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {s.ratePer10kVehicles2019 !== null ? (
                            <span
                              className={
                                s.ratePer10kVehicles2019 > nationalAverages.vehRate2019
                                  ? 'text-rose-700 font-bold'
                                  : 'text-slate-700'
                              }
                            >
                              {s.ratePer10kVehicles2019.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px] font-sans">NA</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                          {s.densityPer10kKmRoads2018P !== null ? (
                            s.densityPer10kKmRoads2018P.toFixed(1)
                          ) : (
                            <span className="text-slate-400 italic text-[10px] font-sans">NA</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span
                            className={`font-bold ${
                              s.change2016to2019Pct > 0 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {s.change2016to2019Pct > 0 ? '+' : ''}
                            {s.change2016to2019Pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800'
                                : isMed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.priority.score.toFixed(1)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Metric View 2: Historical */}
                    {metricView === 'historical' && (
                      <>
                        <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                          {s.accidents2016.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                          {s.accidents2017.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                          {s.accidents2018.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {s.accidents2019.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                          <span
                            className={
                              s.change2016to2019Pct > 0 ? 'text-rose-600' : 'text-emerald-700'
                            }
                          >
                            {s.change2016to2019Pct > 0 ? '+' : ''}
                            {s.change2016to2019Pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                          {s.trend.annualAverageDelta > 0 ? '+' : ''}
                          {s.trend.annualAverageDelta.toLocaleString()}
                        </td>
                      </>
                    )}

                    {/* Metric View 3: Normalized Exposure Rates */}
                    {metricView === 'normalized' && (
                      <>
                        <td className="py-2.5 px-2 text-right text-slate-600 tabular-nums">
                          {s.ratePerLakhPop2016?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 tabular-nums">
                          {s.ratePerLakhPop2017?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 tabular-nums">
                          {s.ratePerLakhPop2018?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-slate-900 tabular-nums bg-teal-50/40">
                          {s.ratePerLakhPop2019?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 tabular-nums">
                          {s.ratePer10kVehicles2016?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 tabular-nums">
                          {s.ratePer10kVehicles2017?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 tabular-nums">
                          {s.ratePer10kVehicles2018?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-slate-900 tabular-nums bg-teal-50/40">
                          {s.ratePer10kVehicles2019?.toFixed(1) ?? 'NA'}
                        </td>
                      </>
                    )}

                    {/* Metric View 4: Spatial Density & Hazard */}
                    {metricView === 'spatial' && (
                      <>
                        <td className="py-2.5 px-2.5 text-right text-slate-600 tabular-nums">
                          {s.densityPer10kKmRoads2016?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-slate-600 tabular-nums">
                          {s.densityPer10kKmRoads2017?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums bg-teal-50/40">
                          {s.densityPer10kKmRoads2018P?.toFixed(1) ?? 'NA'}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800'
                                : isMed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.priority.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-left font-sans text-xs text-slate-600 truncate max-w-xs">
                          {s.priority.reasons[0] || 'Standard baseline exposure'}
                        </td>
                      </>
                    )}

                    {/* Action */}
                    <td className="py-2.5 px-3.5 text-right font-sans">
                      <span className="text-teal-700 group-hover:text-teal-900 font-semibold inline-flex items-center gap-1 text-[11px]">
                        <span>Analyze</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-mono">
                  No States or Union Territories match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Aggregate Summary Footer for Filtered View */}
      <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-700">
        <div className="flex items-center gap-4">
          <div>
            Showing: <strong className="text-slate-900 font-bold">{filteredStats.count}</strong> of{' '}
            {states.length} Jurisdictions
          </div>
          <div>
            Filtered 2019 Total:{' '}
            <strong className="text-slate-900 font-bold">
              {filteredStats.totalCrashes2019.toLocaleString()} crashes
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-600">
          <div>
            Avg Pop Rate: <strong className="text-slate-900">{filteredStats.avgPopRate.toFixed(1)}</strong>/lakh
          </div>
          <div>
            Avg Veh Rate: <strong className="text-slate-900">{filteredStats.avgVehRate.toFixed(1)}</strong>/10k veh
          </div>
        </div>
      </div>
    </div>
  );
};
